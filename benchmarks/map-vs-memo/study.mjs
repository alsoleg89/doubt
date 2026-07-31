import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { inspectMap } from "../../src/map.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, "../..");
const defaultConfig = path.join(directory, "topics.json");
const defaultOutput = path.join(root, "benchmarks", "results", "map-vs-memo-study.html");
const requiredQuestions = ["position", "contradiction", "qualification", "unknown", "source"];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonForScript(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

export function hash32(value) {
  let hash = 0x811c9dc5;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function planFor(sessionId, topicIds) {
  const ordered = [...topicIds].sort(
    (left, right) => hash32(`${sessionId}:${left}:order`) - hash32(`${sessionId}:${right}:order`),
  );
  const offset = hash32(`${sessionId}:condition`) % 2;
  return ordered.map((topicId, index) => ({
    topicId,
    condition: (index + offset) % 2 === 0 ? "map" : "memo",
  }));
}

function memoCitations(topic) {
  return new Set(
    topic.memo.paragraphs
      .flatMap((paragraph) => [...paragraph.matchAll(/\[S(\d+)\]/g)])
      .map((match) => Number(match[1])),
  );
}

export function validateStudy(study) {
  const findings = [];
  if (study?.schemaVersion !== 1) findings.push("schemaVersion must be 1");
  if (study?.protocolVersion !== 1) findings.push("protocolVersion must be 1");
  if (!study?.studyId || typeof study.studyId !== "string") findings.push("studyId is required");
  if (!Array.isArray(study?.topics) || study.topics.length !== 5) {
    findings.push("the preregistered study must contain exactly five topics");
  }

  const topicIds = new Set();
  for (const [topicIndex, topic] of (study?.topics || []).entries()) {
    const base = `topics[${topicIndex}]`;
    if (!topic.id || typeof topic.id !== "string") findings.push(`${base}.id is required`);
    else if (topicIds.has(topic.id)) findings.push(`${base}.id is duplicated`);
    else topicIds.add(topic.id);

    const mapResult = inspectMap(topic.map);
    for (const finding of mapResult.findings) {
      findings.push(`${base}.map${finding.path.slice(1)}: ${finding.rule}`);
    }

    if (!topic.memo?.title || !Array.isArray(topic.memo?.paragraphs) || topic.memo.paragraphs.length < 3) {
      findings.push(`${base}.memo must contain a title and at least three paragraphs`);
    } else {
      const citations = memoCitations(topic);
      for (let sourceIndex = 1; sourceIndex <= (topic.map?.sources?.length || 0); sourceIndex += 1) {
        if (!citations.has(sourceIndex)) findings.push(`${base}.memo does not cite S${sourceIndex}`);
      }
      for (const citation of citations) {
        if (citation < 1 || citation > topic.map.sources.length) {
          findings.push(`${base}.memo cites unknown source S${citation}`);
        }
      }
    }

    if (!Array.isArray(topic.questions) || topic.questions.length !== requiredQuestions.length) {
      findings.push(`${base}.questions must contain exactly five tasks`);
      continue;
    }
    const ids = topic.questions.map((question) => question.id);
    for (const id of requiredQuestions) {
      if (!ids.includes(id)) findings.push(`${base}.questions is missing ${id}`);
    }
    if (new Set(ids).size !== ids.length) findings.push(`${base}.questions contains duplicate ids`);
    for (const [questionIndex, question] of topic.questions.entries()) {
      const questionBase = `${base}.questions[${questionIndex}]`;
      if (!question.prompt || typeof question.prompt !== "string") {
        findings.push(`${questionBase}.prompt is required`);
      }
      if (!Array.isArray(question.options) || question.options.length < 3) {
        findings.push(`${questionBase}.options must contain at least three choices`);
      }
      if (
        !Number.isInteger(question.answer) ||
        question.answer < 0 ||
        question.answer >= (question.options?.length || 0)
      ) {
        findings.push(`${questionBase}.answer is outside the option range`);
      }
    }
  }
  return findings;
}

export async function loadStudy(configFile = defaultConfig) {
  const absoluteConfig = path.resolve(configFile);
  const parsed = JSON.parse(await readFile(absoluteConfig, "utf8"));
  const configDirectory = path.dirname(absoluteConfig);
  const topics = await Promise.all(
    (parsed.topics || []).map(async (topic) => ({
      ...topic,
      map: JSON.parse(await readFile(path.resolve(configDirectory, topic.mapFile), "utf8")),
    })),
  );
  const study = { ...parsed, topics };
  const findings = validateStudy(study);
  if (findings.length) {
    throw new Error(`Reader study is invalid:\n- ${findings.join("\n- ")}`);
  }
  return study;
}

export function renderStudy(study) {
  const publicStudy = {
    schemaVersion: study.schemaVersion,
    protocolVersion: study.protocolVersion,
    studyId: study.studyId,
    title: study.title,
    topics: study.topics.map(({ id, map, memo, questions }) => ({ id, map, memo, questions })),
  };
  const topicCount = study.topics.length;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A preregistered, local-first reader study comparing Doubt evidence maps with cited memos.">
  <meta name="theme-color" content="#0b0d0e">
  <link rel="canonical" href="https://alsoleg89.github.io/doubt/benchmark/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://alsoleg89.github.io/doubt/benchmark/">
  <meta property="og:title" content="${escapeHtml(study.title)} — Doubt benchmark">
  <meta property="og:description" content="Five topics. Same frozen sources. No telemetry. Export an anonymous result locally.">
  <title>${escapeHtml(study.title)} — Doubt benchmark</title>
  <style>
    :root {
      color-scheme: dark;
      --bg:#0b0d0e; --panel:#111517; --panel2:#151a1c; --ink:#f0f1e9;
      --muted:#949c96; --line:#29302d; --green:#a8ec67; --red:#ff806e;
      --blue:#83b9ff; --yellow:#eac96f; --max:1180px;
    }
    * { box-sizing:border-box; }
    html { background:var(--bg); }
    body { margin:0; color:var(--ink); font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    button,input { font:inherit; }
    button,a { -webkit-tap-highlight-color:transparent; }
    a { color:var(--green); }
    .topbar { border-bottom:1px solid var(--line); }
    .topbar-inner { max-width:var(--max); margin:auto; padding:18px 24px; display:flex; justify-content:space-between; align-items:center; gap:20px; }
    .brand { color:var(--ink); text-decoration:none; font-weight:850; letter-spacing:-.04em; font-size:20px; }
    .brand i { color:var(--green); font-style:normal; }
    .status { color:var(--muted); font:10px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; letter-spacing:.12em; }
    .page { max-width:var(--max); margin:auto; padding:44px 24px 90px; }
    .hero { max-width:820px; padding:44px 0 26px; }
    .eyebrow { color:var(--green); font:700 11px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; letter-spacing:.14em; }
    h1 { margin:14px 0 18px; font-size:clamp(42px,7vw,82px); line-height:.95; letter-spacing:-.065em; }
    .lede { color:#c1c7c2; font-size:18px; line-height:1.6; max-width:710px; }
    .facts { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid var(--line); border-radius:14px; overflow:hidden; margin:32px 0; }
    .fact { padding:18px; background:var(--panel); border-right:1px solid var(--line); }
    .fact:last-child { border:0; }
    .fact strong { display:block; font-size:25px; letter-spacing:-.04em; }
    .fact span { color:var(--muted); font:10px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; letter-spacing:.08em; }
    .notice { border:1px solid #3a4932; background:#111a12; border-radius:12px; padding:18px; color:#c8d2c3; line-height:1.55; }
    .notice strong { color:var(--green); }
    .actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:28px; }
    .primary,.secondary { border-radius:999px; padding:12px 18px; cursor:pointer; font-weight:750; text-decoration:none; }
    .primary { background:var(--green); color:#0b0d0e; border:1px solid var(--green); }
    .secondary { background:transparent; color:var(--ink); border:1px solid var(--line); }
    .progress { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom:22px; }
    .progress-track { height:5px; background:var(--line); flex:1; border-radius:99px; overflow:hidden; }
    .progress-fill { height:100%; background:var(--green); transition:width .25s; }
    .condition { padding:6px 9px; border:1px solid var(--line); border-radius:999px; color:var(--muted); font:10px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; letter-spacing:.1em; }
    .topic-head { margin:35px 0 22px; }
    .topic-head h2 { font-size:clamp(31px,5vw,56px); letter-spacing:-.055em; line-height:1.02; margin:10px 0; }
    .verdict { border-left:2px solid var(--green); padding-left:16px; color:#c5cbc6; line-height:1.55; }
    .representation { border:1px solid var(--line); border-radius:16px; background:var(--panel); overflow:hidden; }
    .map-layout { display:grid; grid-template-columns:minmax(0,1fr) 310px; }
    .map-main { padding:22px; min-width:0; }
    .map-aside { padding:22px; border-left:1px solid var(--line); background:#0f1213; }
    .node-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    .node { text-align:left; color:var(--ink); border:1px solid var(--line); background:var(--panel2); border-radius:12px; padding:15px; min-height:140px; cursor:pointer; }
    .node:hover,.node.selected { border-color:#68736c; transform:translateY(-1px); }
    .node.position { grid-column:1/-1; background:linear-gradient(135deg,rgba(168,236,103,.12),var(--panel2)); }
    .node.unknown { border-style:dashed; }
    .node small { display:block; color:var(--muted); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; letter-spacing:.12em; }
    .node strong { display:block; margin:22px 0 8px; }
    .node span { color:#b6bdb8; font-size:13px; line-height:1.45; }
    .node .chip { color:var(--green); margin-top:13px; font:10px ui-monospace,SFMono-Regular,Menlo,monospace; }
    .aside-title { color:var(--muted); font:10px ui-monospace,SFMono-Regular,Menlo,monospace; text-transform:uppercase; letter-spacing:.12em; margin:0 0 12px; }
    .edge { border-top:1px solid var(--line); padding:11px 0; font-size:11px; color:#abb2ad; line-height:1.45; }
    .edge b { display:inline-block; color:#071007; background:var(--green); border-radius:4px; padding:3px 5px; margin:0 4px; font-size:9px; text-transform:uppercase; }
    .edge.contradicts b { background:var(--red); }
    .edge.qualifies b { background:var(--blue); }
    .edge.missing b { background:var(--yellow); }
    .source-panel { margin-top:24px; padding-top:16px; border-top:1px solid var(--line); }
    .source-panel h3 { font-size:15px; margin:8px 0; }
    .source-panel .locator { color:var(--blue); font:10px ui-monospace,SFMono-Regular,Menlo,monospace; }
    .source-panel blockquote { margin:12px 0; color:#aab1ac; font-size:12px; line-height:1.5; }
    .source-empty { color:var(--muted); font-size:12px; line-height:1.5; }
    .memo { padding:clamp(24px,5vw,62px); max-width:840px; margin:auto; }
    .memo h3 { font-size:30px; letter-spacing:-.04em; margin:0 0 28px; }
    .memo p { color:#c4cac5; font:17px/1.72 Georgia,serif; }
    .memo sup a { font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace; text-decoration:none; }
    .references { margin-top:36px; padding-top:18px; border-top:1px solid var(--line); }
    .reference { padding:12px 0; color:#aeb5b0; font-size:12px; line-height:1.5; }
    .reference b { color:var(--ink); }
    .reference code { color:var(--blue); }
    .questions { margin-top:34px; display:grid; gap:18px; }
    .question { border:1px solid var(--line); border-radius:14px; padding:20px; background:var(--panel); }
    .question legend { font-weight:750; padding:0 5px; }
    .option { display:flex; align-items:flex-start; gap:10px; margin-top:11px; padding:10px; border:1px solid transparent; border-radius:9px; color:#c6ccc7; cursor:pointer; }
    .option:hover { border-color:var(--line); background:var(--panel2); }
    .option input { margin-top:3px; accent-color:var(--green); }
    .error { color:var(--red); min-height:1.4em; margin-top:12px; }
    .finish { max-width:760px; padding:44px 0; }
    .finish h2 { font-size:clamp(38px,6vw,70px); letter-spacing:-.06em; margin:12px 0; }
    .preference { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:24px 0; }
    .preference label { border:1px solid var(--line); border-radius:12px; padding:15px; cursor:pointer; }
    .privacy { color:var(--muted); font-size:12px; line-height:1.6; margin-top:18px; }
    [hidden] { display:none !important; }
    @media (max-width:850px) {
      .facts { grid-template-columns:repeat(2,1fr); }
      .fact:nth-child(2) { border-right:0; }
      .fact:nth-child(-n+2) { border-bottom:1px solid var(--line); }
      .map-layout { grid-template-columns:1fr; }
      .map-aside { border-left:0; border-top:1px solid var(--line); }
    }
    @media (max-width:560px) {
      .node-grid,.preference { grid-template-columns:1fr; }
      .node.position { grid-column:auto; }
      .status { display:none; }
    }
    @media (prefers-reduced-motion:reduce) { * { transition:none !important; } }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="https://github.com/alsoleg89/doubt">Doubt<i>↯</i></a>
      <div class="status">preregistered protocol v${study.protocolVersion} · local only</div>
    </div>
  </header>
  <main class="page">
    <section id="intro">
      <div class="hero">
        <div class="eyebrow">Reader benchmark · ${topicCount} contested decisions</div>
        <h1>Does the map beat the memo?</h1>
        <p class="lede">You will inspect five short technical decisions. Each one appears either as an interactive evidence map or a cited memo built from the same frozen sources.</p>
      </div>
      <div class="facts">
        <div class="fact"><strong>${topicCount}</strong><span>topics</span></div>
        <div class="fact"><strong>25</strong><span>answers</span></div>
        <div class="fact"><strong>≈12m</strong><span>target time</span></div>
        <div class="fact"><strong>0</strong><span>network submits</span></div>
      </div>
      <div class="notice"><strong>No personal data.</strong> The page creates a random session id, runs entirely in this tab, and downloads one result JSON to your device. It asks for no name, email, account, or free-form response. You decide whether to share the file.</div>
      <div class="actions">
        <button class="primary" id="start">Start the study</button>
        <a class="secondary" href="https://github.com/alsoleg89/doubt/blob/main/benchmarks/map-vs-memo/protocol.md" target="_blank" rel="noreferrer">Read the protocol</a>
      </div>
    </section>
    <section id="task" hidden>
      <div class="progress">
        <span id="counter">Topic 1 of ${topicCount}</span>
        <div class="progress-track"><div class="progress-fill" id="progress"></div></div>
        <span class="condition" id="condition"></span>
      </div>
      <div class="topic-head">
        <div class="eyebrow" id="topic-title"></div>
        <h2 id="question"></h2>
        <div class="verdict" id="verdict"></div>
      </div>
      <article class="representation" id="representation"></article>
      <form id="questions" class="questions"></form>
      <p class="error" id="error" role="alert"></p>
      <button class="primary" id="next" type="button">Record answers and continue</button>
    </section>
    <section id="finish" class="finish" hidden>
      <div class="eyebrow">Complete · nothing was uploaded</div>
      <h2>Your local result is ready.</h2>
      <p class="lede">Optionally record which representation was more useful overall, then download the anonymous JSON file.</p>
      <div class="preference">
        <label><input type="radio" name="preference" value="map"> Evidence map</label>
        <label><input type="radio" name="preference" value="memo"> Cited memo</label>
        <label><input type="radio" name="preference" value="neither"> Neither / unsure</label>
      </div>
      <div class="actions">
        <button class="primary" id="download">Download result JSON</button>
        <a class="secondary" href="https://github.com/alsoleg89/doubt/discussions/4" target="_blank" rel="noreferrer">Open the feedback discussion</a>
      </div>
      <p class="privacy">The downloaded file contains the protocol version, random session id, condition assignment, selected option numbers, correctness, and elapsed milliseconds. Inspect it before sharing. The study page never transmits it.</p>
    </section>
  </main>
  <script type="application/json" id="study-data">${jsonForScript(publicStudy)}</script>
  <script>
    const study = JSON.parse(document.querySelector("#study-data").textContent);
    const requiredQuestions = ${jsonForScript(requiredQuestions)};
    const state = {
      sessionId: sessionId(),
      startedAt: null,
      topicStartedAt: null,
      current: 0,
      responses: [],
      plan: [],
    };

    function sessionId() {
      const values = new Uint32Array(4);
      crypto.getRandomValues(values);
      return [...values].map(value => value.toString(16).padStart(8, "0")).join("");
    }

    function hash32(value) {
      let hash = 0x811c9dc5;
      for (const character of String(value)) {
        hash ^= character.codePointAt(0);
        hash = Math.imul(hash, 0x01000193);
      }
      return hash >>> 0;
    }

    function planFor(session, ids) {
      const ordered = [...ids].sort(
        (left, right) => hash32(session + ":" + left + ":order") - hash32(session + ":" + right + ":order"),
      );
      const offset = hash32(session + ":condition") % 2;
      return ordered.map((topicId, index) => ({
        topicId,
        condition: (index + offset) % 2 === 0 ? "map" : "memo",
      }));
    }

    function escapeHtml(value = "") {
      return String(value)
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    function shuffledIndices(length, seed) {
      const result = Array.from({length}, (_, index) => index);
      result.sort((left, right) => hash32(seed + ":" + left) - hash32(seed + ":" + right));
      return result;
    }

    function memoHtml(topic) {
      const paragraphs = topic.memo.paragraphs.map(paragraph => {
        const safe = escapeHtml(paragraph).replace(
          /\\[S(\\d+)\\]/g,
          (_, number) => '<sup><a href="#source-' + topic.id + "-" + number + '">[S' + number + ']</a></sup>',
        );
        return "<p>" + safe + "</p>";
      }).join("");
      const references = topic.map.sources.map((source, index) =>
        '<div class="reference" id="source-' + topic.id + "-" + (index + 1) + '">' +
          '<b>[S' + (index + 1) + "] " + escapeHtml(source.title) + "</b><br>" +
          escapeHtml(source.publisher) + " · " + escapeHtml(source.date) + "<br>" +
          "<code>" + escapeHtml(source.locator) + "</code><br>" +
          escapeHtml(source.excerpt) +
        "</div>"
      ).join("");
      return '<div class="memo"><h3>' + escapeHtml(topic.memo.title) + "</h3>" + paragraphs +
        '<div class="references"><div class="aside-title">Frozen sources</div>' + references + "</div></div>";
    }

    function mapHtml(topic) {
      const labels = Object.fromEntries(topic.map.nodes.map(node => [node.id, node.label]));
      const nodes = topic.map.nodes.map(node =>
        '<button class="node ' + escapeHtml(node.type) + '" data-node="' + escapeHtml(node.id) + '">' +
          "<small>" + escapeHtml(node.type) + "</small><strong>" + escapeHtml(node.label) + "</strong>" +
          "<span>" + escapeHtml(node.text) + "</span>" +
          (node.sourceId ? '<span class="chip">↗ exact source region</span>' : "") +
        "</button>"
      ).join("");
      const edges = topic.map.edges.map(edge =>
        '<div class="edge ' + escapeHtml(edge.relation) + '">' +
          escapeHtml(labels[edge.from] || edge.from) + " <b>" + escapeHtml(edge.relation) + "</b> " +
          escapeHtml(labels[edge.to] || edge.to) + "<br>" + escapeHtml(edge.note) +
        "</div>"
      ).join("");
      return '<div class="map-layout"><div class="map-main"><div class="node-grid">' + nodes +
        '</div></div><aside class="map-aside"><div class="aside-title">Reasoning edges</div>' + edges +
        '<div class="source-panel"><div class="aside-title">Exact source region</div>' +
        '<div class="source-empty">Select an evidence card to inspect its frozen source region.</div>' +
        "</div></aside></div>";
    }

    function attachMap(topic) {
      const panel = document.querySelector(".source-panel");
      document.querySelectorAll("[data-node]").forEach(card => {
        card.addEventListener("click", () => {
          document.querySelectorAll("[data-node]").forEach(item => item.classList.toggle("selected", item === card));
          const node = topic.map.nodes.find(item => item.id === card.dataset.node);
          const source = topic.map.sources.find(item => item.id === node?.sourceId);
          panel.innerHTML = '<div class="aside-title">Exact source region</div>' + (source
            ? '<h3>' + escapeHtml(source.title) + '</h3><div class="locator">' + escapeHtml(source.locator) +
              '</div><blockquote>' + escapeHtml(source.excerpt) + '</blockquote><a href="' +
              escapeHtml(source.url) + '" target="_blank" rel="noreferrer">Open source ↗</a>'
            : '<div class="source-empty">This is a claim or explicit unknown. Follow its reasoning edges.</div>');
        });
      });
    }

    function questionsHtml(topic) {
      return topic.questions.map(question => {
        const order = shuffledIndices(question.options.length, state.sessionId + ":" + topic.id + ":" + question.id);
        const options = order.map(optionIndex =>
          '<label class="option"><input type="radio" name="' + escapeHtml(question.id) +
          '" value="' + optionIndex + '"><span>' + escapeHtml(question.options[optionIndex]) + "</span></label>"
        ).join("");
        return '<fieldset class="question"><legend>' + escapeHtml(question.prompt) + "</legend>" + options + "</fieldset>";
      }).join("");
    }

    function currentEntry() {
      const assignment = state.plan[state.current];
      return {
        assignment,
        topic: study.topics.find(topic => topic.id === assignment.topicId),
      };
    }

    function renderTopic() {
      const { assignment, topic } = currentEntry();
      document.querySelector("#counter").textContent = "Topic " + (state.current + 1) + " of " + state.plan.length;
      document.querySelector("#progress").style.width = ((state.current / state.plan.length) * 100) + "%";
      document.querySelector("#condition").textContent = assignment.condition === "map" ? "evidence map" : "cited memo";
      document.querySelector("#topic-title").textContent = topic.map.title;
      document.querySelector("#question").textContent = topic.map.question;
      document.querySelector("#verdict").textContent = topic.map.verdict;
      const representation = document.querySelector("#representation");
      representation.innerHTML = assignment.condition === "map" ? mapHtml(topic) : memoHtml(topic);
      if (assignment.condition === "map") attachMap(topic);
      document.querySelector("#questions").innerHTML = questionsHtml(topic);
      document.querySelector("#error").textContent = "";
      state.topicStartedAt = Date.now();
      scrollTo({top: 0, behavior: "smooth"});
    }

    document.querySelector("#start").addEventListener("click", () => {
      state.plan = planFor(state.sessionId, study.topics.map(topic => topic.id));
      state.startedAt = new Date().toISOString();
      document.querySelector("#intro").hidden = true;
      document.querySelector("#task").hidden = false;
      renderTopic();
    });

    document.querySelector("#next").addEventListener("click", () => {
      const { assignment, topic } = currentEntry();
      const answers = {};
      for (const id of requiredQuestions) {
        const selected = document.querySelector('input[name="' + id + '"]:checked');
        if (!selected) {
          document.querySelector("#error").textContent = "Answer all five questions before continuing.";
          return;
        }
        answers[id] = Number(selected.value);
      }
      const questionResults = topic.questions.map(question => ({
        id: question.id,
        selected: answers[question.id],
        correct: answers[question.id] === question.answer,
      }));
      state.responses.push({
        topicId: topic.id,
        condition: assignment.condition,
        elapsedMs: Date.now() - state.topicStartedAt,
        correct: questionResults.filter(item => item.correct).length,
        total: questionResults.length,
        questionResults,
      });
      state.current += 1;
      if (state.current < state.plan.length) renderTopic();
      else {
        document.querySelector("#task").hidden = true;
        document.querySelector("#finish").hidden = false;
        scrollTo({top: 0, behavior: "smooth"});
      }
    });

    function result() {
      return {
        schemaVersion: 1,
        studyId: study.studyId,
        protocolVersion: study.protocolVersion,
        sessionId: state.sessionId,
        startedAt: state.startedAt,
        completedAt: new Date().toISOString(),
        complete: state.responses.length === study.topics.length,
        preference: document.querySelector('input[name="preference"]:checked')?.value || null,
        responses: state.responses,
      };
    }

    document.querySelector("#download").addEventListener("click", () => {
      const payload = JSON.stringify(result(), null, 2) + "\\n";
      const url = URL.createObjectURL(new Blob([payload], {type:"application/json"}));
      const link = document.createElement("a");
      link.href = url;
      link.download = "doubt-reader-" + state.sessionId.slice(0, 12) + ".json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  </script>
</body>
</html>`;
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  const configFile = argument("--config") || defaultConfig;
  const study = await loadStudy(configFile);
  if (process.argv.includes("--check-only")) {
    process.stdout.write(
      `PASS ${study.topics.length} topics · ${study.topics.length * requiredQuestions.length} keyed tasks · protocol v${study.protocolVersion}\n`,
    );
    return;
  }
  const output = path.resolve(argument("--out") || defaultOutput);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, renderStudy(study));
  const digest = createHash("sha256").update(await readFile(output)).digest("hex");
  process.stdout.write(`PASS reader study → ${output}\nsha256 ${digest}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
