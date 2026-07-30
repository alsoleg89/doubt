#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";

const root = resolve(process.argv[2] || process.cwd());
const output = resolve(process.argv[3] || join(root, "context-blame.html"));
const excluded = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".venv",
  "vendor",
]);

function portable(path) {
  return path.split(sep).join("/");
}

function isContextSource(path) {
  const normalized = portable(path);
  const name = basename(normalized);
  if (["AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules"].includes(name)) return true;
  if (normalized === ".github/copilot-instructions.md") return true;
  if (/^\.github\/instructions\/.+\.instructions\.md$/i.test(normalized)) return true;
  if (/^\.cursor\/rules\/.+\.(?:md|mdc)$/i.test(normalized)) return true;
  if (/^(?:skill|skills|\.agents\/skills)\/.+\/SKILL\.md$/i.test(normalized)) return true;
  return false;
}

async function walk(directory) {
  const found = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && excluded.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await walk(absolute));
    else {
      const path = portable(relative(root, absolute));
      if (isContextSource(path)) found.push({ absolute, path });
    }
  }
  return found;
}

function normalizedLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter((line) => line.length >= 36 && !line.startsWith("#"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function kind(path) {
  if (path.endsWith("/SKILL.md") || path === "SKILL.md") return "skill";
  if (path.includes(".cursor/")) return "cursor";
  if (path.includes(".github/")) return "github";
  return "repo";
}

const files = await walk(root);
const sources = [];
const owners = new Map();

for (const file of files) {
  const text = await readFile(file.absolute, "utf8");
  const lines = text.split(/\r?\n/).length;
  const tokens = Math.ceil(text.length / 4);
  const source = {
    path: file.path,
    type: kind(file.path),
    chars: text.length,
    lines,
    tokens,
    duplicateChars: 0,
    duplicateLines: [],
  };
  sources.push(source);
  for (const line of new Set(normalizedLines(text))) {
    const entries = owners.get(line) || [];
    entries.push(source);
    owners.set(line, entries);
  }
}

for (const [line, entries] of owners) {
  if (entries.length < 2) continue;
  for (const source of entries) {
    source.duplicateChars += line.length;
    source.duplicateLines.push({
      text: line,
      alsoIn: entries.filter((entry) => entry !== source).map((entry) => entry.path),
    });
  }
}

sources.sort((a, b) => b.tokens - a.tokens || a.path.localeCompare(b.path));
const totalTokens = sources.reduce((sum, source) => sum + source.tokens, 0);
const duplicateTokens = Math.ceil(
  sources.reduce((sum, source) => sum + source.duplicateChars, 0) / 8,
);
const largest = sources[0]?.tokens || 1;
const risk = sources.length === 0
  ? "NO SOURCES"
  : duplicateTokens / Math.max(totalTokens, 1) > 0.12
    ? "DUPLICATION"
    : totalTokens > 12_000
      ? "BUDGET"
      : "HEALTHY";

const palette = {
  repo: "#A78BFA",
  skill: "#34D399",
  cursor: "#FBBF24",
  github: "#60A5FA",
};

const rows = sources.map((source, index) => {
  const width = Math.max(3, Math.round((source.tokens / largest) * 100));
  const share = totalTokens ? ((source.tokens / totalTokens) * 100).toFixed(1) : "0.0";
  const duplicate = Math.ceil(source.duplicateChars / 4);
  return `
    <article class="source">
      <div class="rank">${String(index + 1).padStart(2, "0")}</div>
      <div class="source-main">
        <div class="source-heading">
          <code>${escapeHtml(source.path)}</code>
          <span>${source.tokens.toLocaleString()} est. tokens · ${share}%</span>
        </div>
        <div class="track">
          <div class="bar" style="width:${width}%;background:${palette[source.type]}"></div>
        </div>
        <div class="meta">
          <span>${source.type}</span>
          <span>${source.lines} lines</span>
          <span>${source.chars.toLocaleString()} chars</span>
          <span class="${duplicate ? "warning" : ""}">${duplicate} duplicated tokens</span>
        </div>
      </div>
    </article>`;
}).join("\n");

const duplicateRows = [...owners.entries()]
  .filter(([, entries]) => entries.length > 1)
  .sort((a, b) => b[0].length - a[0].length)
  .slice(0, 12)
  .map(([line, entries]) => `
    <li>
      <blockquote>${escapeHtml(line)}</blockquote>
      <div>${entries.map((entry) => `<code>${escapeHtml(entry.path)}</code>`).join(" ↔ ")}</div>
    </li>`)
  .join("\n");

const generated = new Date().toISOString();
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Context Blame — ${escapeHtml(basename(root))}</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #080A0F; color: #F4F4F5; }
    main { width: min(1100px, calc(100% - 40px)); margin: 0 auto; padding: 56px 0 80px; }
    .eyebrow { color: #8B8FA3; font: 700 12px/1.2 ui-monospace, monospace; letter-spacing: .16em; text-transform: uppercase; }
    h1 { max-width: 780px; margin: 14px 0 12px; font-size: clamp(40px, 7vw, 78px); line-height: .96; letter-spacing: -.055em; }
    .lede { max-width: 720px; color: #AEB1BE; font-size: 18px; line-height: 1.55; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 38px 0; }
    .card { min-height: 132px; padding: 20px; border: 1px solid #252936; border-radius: 16px; background: #11141C; }
    .card strong { display: block; margin-top: 18px; font-size: 31px; letter-spacing: -.04em; }
    .card small { color: #858A9B; }
    .risk { color: ${risk === "HEALTHY" ? "#34D399" : "#FBBF24"}; }
    section { margin-top: 50px; }
    h2 { margin: 0 0 18px; font-size: 22px; letter-spacing: -.02em; }
    .source { display: grid; grid-template-columns: 44px 1fr; gap: 12px; padding: 18px 0; border-top: 1px solid #202430; }
    .rank { color: #555B6D; font: 700 12px/1.5 ui-monospace, monospace; }
    .source-heading { display: flex; justify-content: space-between; gap: 20px; }
    code { color: #E7E8ED; font: 600 13px/1.5 ui-monospace, SFMono-Regular, monospace; }
    .source-heading span, .meta { color: #777D8F; font-size: 12px; }
    .track { height: 8px; margin: 12px 0 10px; overflow: hidden; border-radius: 999px; background: #1A1E29; }
    .bar { height: 100%; border-radius: inherit; }
    .meta { display: flex; flex-wrap: wrap; gap: 14px; }
    .warning { color: #FBBF24; }
    .duplicates { margin: 0; padding: 0; list-style: none; }
    .duplicates li { padding: 18px 0; border-top: 1px solid #202430; }
    blockquote { margin: 0 0 10px; color: #B8BBC6; font-size: 14px; line-height: 1.5; }
    .duplicates code { color: #8B90A1; font-size: 11px; }
    .truth { padding: 22px; border: 1px solid #30445B; border-radius: 16px; background: #0E1722; color: #AFC9E4; line-height: 1.55; }
    footer { margin-top: 54px; color: #5F6474; font: 12px/1.5 ui-monospace, monospace; }
    @media (max-width: 760px) {
      .cards { grid-template-columns: repeat(2, 1fr); }
      .source-heading { display: block; }
      .source-heading span { display: block; margin-top: 5px; }
    }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">Context Blame / repository scan</div>
    <h1>What is eating the context?</h1>
    <p class="lede">A source-attributed budget for discoverable agent instructions.
      No transcript viewer, no model guess: every number links back to a file.</p>

    <div class="cards">
      <div class="card"><small>Discoverable sources</small><strong>${sources.length}</strong></div>
      <div class="card"><small>Estimated tokens</small><strong>${totalTokens.toLocaleString()}</strong></div>
      <div class="card"><small>Duplicate budget</small><strong>${duplicateTokens.toLocaleString()}</strong></div>
      <div class="card"><small>Primary signal</small><strong class="risk">${risk}</strong></div>
    </div>

    <section>
      <h2>Token attribution</h2>
${rows || "      <p>No known repository instruction sources found.</p>"}
    </section>

    <section>
      <h2>Repeated instruction fragments</h2>
      <ul class="duplicates">${duplicateRows || "<li>No repeated long lines found.</li>"}</ul>
    </section>

    <section class="truth">
      <strong>Truth boundary.</strong> This report inventories repository files
      that major agents conventionally discover. It does not claim access to a
      vendor's private system prompt, dynamic tool schemas, conversation
      compaction, or the final provider-assembled request. A production version
      must label observed, inferred, and unavailable context separately.
    </section>

    <footer>${escapeHtml(root)} · generated ${generated}</footer>
  </main>
</body>
</html>`;

await writeFile(output, html);
console.log(JSON.stringify({
  root,
  output,
  sources: sources.length,
  estimatedTokens: totalTokens,
  duplicateTokens,
  risk,
}, null, 2));
