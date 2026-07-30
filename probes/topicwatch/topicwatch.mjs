#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseArgs(argv) {
  const args = { limit: 20, output: "topicwatch.html", query: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === "--query") args.query = argv[++index] || "";
    else if (key === "--output") args.output = argv[++index] || args.output;
    else if (key === "--limit") args.limit = Math.max(1, Math.min(50, Number(argv[++index]) || 20));
    else throw new Error(`Unknown argument: ${key}`);
  }
  if (!args.query) throw new Error("--query is required");
  return args;
}

function ageDays(createdAt) {
  return Math.max(1, (Date.now() - new Date(createdAt).getTime()) / 86_400_000);
}

function normalize(item) {
  const days = ageDays(item.created_at);
  return {
    archived: item.archived,
    createdAt: item.created_at,
    days: Math.round(days),
    description: item.description || "No repository description.",
    forks: item.forks_count,
    language: item.language || "Mixed",
    license: item.license?.spdx_id || "Unspecified",
    name: item.full_name,
    pushedAt: item.pushed_at,
    stars: item.stargazers_count,
    starsPerDay: Number((item.stargazers_count / days).toFixed(1)),
    topics: item.topics || [],
    url: item.html_url,
  };
}

function makeHtml(snapshot) {
  const peak = Math.max(...snapshot.repositories.map((repo) => repo.starsPerDay), 1);
  const cards = snapshot.repositories
    .map(
      (repo, index) => `
        <article class="repo" data-language="${escapeHtml(repo.language)}">
          <div class="rank">${String(index + 1).padStart(2, "0")}</div>
          <div class="repo-main">
            <div class="repo-head">
              <a href="${escapeHtml(repo.url)}" target="_blank" rel="noreferrer">${escapeHtml(repo.name)}</a>
              <span>${escapeHtml(repo.language)}</span>
            </div>
            <p>${escapeHtml(repo.description)}</p>
            <div class="tags">${repo.topics
              .slice(0, 4)
              .map((topic) => `<i>${escapeHtml(topic)}</i>`)
              .join("")}</div>
          </div>
          <div class="momentum">
            <strong>${repo.starsPerDay}</strong><span>stars / day</span>
            <div class="bar"><i style="width:${Math.max(2, Math.round((repo.starsPerDay / peak) * 100))}%"></i></div>
          </div>
          <div class="stats">
            <b>★ ${repo.stars.toLocaleString("en-US")}</b>
            <span>${repo.days}d old</span>
            <span>${repo.forks.toLocaleString("en-US")} forks</span>
          </div>
        </article>`,
    )
    .join("");

  const languages = [...new Set(snapshot.repositories.map((repo) => repo.language))]
    .slice(0, 8)
    .map((language) => `<button data-language="${escapeHtml(language)}">${escapeHtml(language)}</button>`)
    .join("");

  const top = snapshot.repositories[0];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(snapshot.query)} — TopicWatch</title>
  <style>
    :root { color-scheme: dark; --bg:#f1efe7; --ink:#161716; --muted:#696a65; --line:#c9c7bd; --hot:#ff5c35; --lime:#c7f36a; }
    * { box-sizing:border-box; }
    html { background:var(--bg); }
    body { margin:0; color:var(--ink); font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    .shell { width:min(1280px,calc(100% - 44px)); margin:auto; padding:28px 0 70px; }
    nav { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding-bottom:18px; }
    .brand { font-size:20px; font-weight:850; letter-spacing:-.05em; }
    .brand i { color:var(--hot); font-style:normal; }
    .stamp { font:10px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; letter-spacing:.12em; color:var(--muted); }
    header { display:grid; grid-template-columns:1.25fr .75fr; gap:60px; padding:65px 0 48px; }
    .kicker { color:var(--hot); font:700 11px ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:.13em; text-transform:uppercase; }
    h1 { font-size:clamp(48px,6.6vw,94px); line-height:.93; letter-spacing:-.075em; margin:16px 0 0; max-width:900px; }
    .signal { align-self:end; padding:18px; border:1px solid var(--ink); background:var(--lime); box-shadow:8px 8px 0 var(--ink); }
    .signal span { display:block; font:10px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; letter-spacing:.11em; }
    .signal strong { display:block; margin:9px 0; font-size:28px; letter-spacing:-.05em; }
    .signal p { margin:0; color:#3e403b; font-size:13px; line-height:1.45; }
    .controls { display:flex; gap:7px; flex-wrap:wrap; padding:17px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
    .controls button { cursor:pointer; border:1px solid var(--line); background:transparent; color:var(--muted); border-radius:999px; padding:7px 11px; font-size:11px; }
    .controls button.active { background:var(--ink); color:var(--bg); border-color:var(--ink); }
    .repo { display:grid; grid-template-columns:52px minmax(0,1fr) 150px 100px; gap:22px; align-items:center; padding:24px 0; border-bottom:1px solid var(--line); transition:opacity .18s; }
    .repo.hidden { display:none; }
    .rank { font:12px ui-monospace,SFMono-Regular,Menlo,monospace; color:var(--muted); }
    .repo-head { display:flex; align-items:center; gap:10px; }
    .repo-head a { color:var(--ink); font-weight:790; font-size:18px; letter-spacing:-.025em; text-decoration:none; }
    .repo-head span { color:var(--muted); border:1px solid var(--line); border-radius:999px; padding:3px 7px; font-size:10px; }
    .repo p { margin:8px 0; color:#565851; line-height:1.4; font-size:13px; max-width:760px; }
    .tags { display:flex; gap:5px; flex-wrap:wrap; }
    .tags i { color:#777970; font:10px ui-monospace,SFMono-Regular,Menlo,monospace; font-style:normal; }
    .momentum strong { display:block; color:var(--hot); font-size:26px; letter-spacing:-.04em; }
    .momentum span { color:var(--muted); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; }
    .bar { height:3px; background:#d8d5cb; margin-top:9px; }
    .bar i { display:block; height:100%; background:var(--hot); }
    .stats { display:flex; flex-direction:column; gap:4px; text-align:right; font-size:11px; color:var(--muted); }
    .stats b { color:var(--ink); }
    footer { display:flex; justify-content:space-between; color:var(--muted); font:10px ui-monospace,SFMono-Regular,Menlo,monospace; padding-top:24px; }
    @media(max-width:800px) {
      header { grid-template-columns:1fr; gap:26px; }
      .repo { grid-template-columns:34px 1fr; }
      .momentum,.stats { grid-column:2; text-align:left; }
      .stats { flex-direction:row; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <nav><div class="brand">TopicWatch<i>●</i></div><div class="stamp">GitHub API snapshot · ${escapeHtml(snapshot.generatedAt)}</div></nav>
    <header>
      <div><span class="kicker">Live open-source signal</span><h1>${escapeHtml(snapshot.query)}</h1></div>
      <aside class="signal"><span>Fastest mover</span><strong>${escapeHtml(top?.name || "No result")}</strong><p>${top ? `${top.starsPerDay} stars/day across its first ${top.days} days.` : "The query returned no repositories."}</p></aside>
    </header>
    <div class="controls"><button class="active" data-language="all">All</button>${languages}</div>
    <section>${cards}</section>
    <footer><span>${snapshot.totalCount.toLocaleString("en-US")} matching repositories</span><span>Sorted by lifetime star velocity · not a causal growth metric</span></footer>
  </div>
  <script>
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".controls button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        const language = button.dataset.language;
        document.querySelectorAll(".repo").forEach((repo) => {
          repo.classList.toggle("hidden", language !== "all" && repo.dataset.language !== language);
        });
      });
    });
  </script>
</body>
</html>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const endpoint = new URL("https://api.github.com/search/repositories");
  endpoint.searchParams.set("q", args.query);
  endpoint.searchParams.set("sort", "stars");
  endpoint.searchParams.set("order", "desc");
  endpoint.searchParams.set("per_page", String(args.limit));
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "doubt-topicwatch-probe",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub search failed: ${response.status} ${await response.text()}`);
  }
  const payload = await response.json();
  const repositories = payload.items
    .map(normalize)
    .filter((repo) => !repo.archived)
    .sort((a, b) => b.starsPerDay - a.starsPerDay);
  const snapshot = {
    generatedAt: new Date().toISOString(),
    query: args.query,
    repositories,
    source: endpoint.toString(),
    totalCount: payload.total_count,
  };
  const output = path.resolve(args.output);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, makeHtml(snapshot));
  await writeFile(output.replace(/\.html?$/i, ".json"), `${JSON.stringify(snapshot, null, 2)}\n`);
  process.stdout.write(
    `${output}\n${repositories.length} repositories · ${payload.total_count} matches · ${repositories[0]?.name || "no leader"}\n`,
  );
}

await main();
