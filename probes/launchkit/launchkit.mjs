#!/usr/bin/env node

import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  ".output",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "vendor",
]);

const EXTENSION_NAMES = new Map([
  [".c", "C"],
  [".cpp", "C++"],
  [".css", "CSS"],
  [".go", "Go"],
  [".html", "HTML"],
  [".java", "Java"],
  [".js", "JavaScript"],
  [".jsx", "React"],
  [".md", "Markdown"],
  [".mjs", "JavaScript"],
  [".php", "PHP"],
  [".py", "Python"],
  [".rb", "Ruby"],
  [".rs", "Rust"],
  [".scss", "SCSS"],
  [".sh", "Shell"],
  [".sql", "SQL"],
  [".svelte", "Svelte"],
  [".swift", "Swift"],
  [".ts", "TypeScript"],
  [".tsx", "React"],
  [".vue", "Vue"],
]);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stripMarkdown(value = "") {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[`*_~>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value = "") {
  return value
    .replace(/^@[^/]+\//, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function firstReadableParagraph(readme) {
  const withoutFences = readme.replace(/```[\s\S]*?```/g, "");
  const blocks = withoutFences.split(/\n\s*\n/);
  for (const block of blocks) {
    const text = stripMarkdown(block);
    if (
      text.length >= 35 &&
      !block.trimStart().startsWith("#") &&
      !block.trimStart().startsWith("<") &&
      !/^\|/.test(block.trim())
    ) {
      return text.slice(0, 240);
    }
  }
  return "";
}

function extractBullets(readme) {
  const bullets = [];
  for (const line of readme.split("\n")) {
    const match = line.match(/^\s*[-*]\s+(.*)$/);
    if (!match) continue;
    const text = stripMarkdown(match[1]);
    if (text.length < 18 || text.length > 170) continue;
    if (/^(http|npm |node |cd |git )/i.test(text)) continue;
    bullets.push(text);
  }
  return [...new Set(bullets)].slice(0, 6);
}

function extractCommand(readme, scripts) {
  const blocks = [...readme.matchAll(/```(?:bash|sh|shell|zsh)?\s*\n([\s\S]*?)```/gi)];
  for (const match of blocks) {
    const lines = match[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    const command = lines.find((line) =>
      /^(npx|npm (?:install|run)|pnpm|yarn|bunx|pip|uv|cargo|go run|docker|git clone|node )/.test(
        line,
      ),
    );
    if (command) return command.slice(0, 110);
  }
  if (scripts.dev) return "npm run dev";
  if (scripts.start) return "npm start";
  if (scripts.test) return "npm test";
  return "Open the repository and follow the quick start";
}

async function readOptional(filePath, fallback = "") {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return fallback;
  }
}

async function findReadme(root) {
  const entries = await readdir(root);
  const readme = entries.find((entry) => /^readme(?:\..+)?$/i.test(entry));
  return readme ? readOptional(path.join(root, readme)) : "";
}

async function inventory(root) {
  const extensions = new Map();
  let files = 0;
  let bytes = 0;
  let testFiles = 0;
  let docFiles = 0;
  const queue = [root];

  while (queue.length) {
    const current = queue.pop();
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".github") continue;
      if (IGNORED_DIRS.has(entry.name)) continue;
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(target);
        continue;
      }
      if (!entry.isFile()) continue;
      const info = await stat(target);
      files += 1;
      bytes += info.size;
      if (/(^|[./_-])(test|tests|spec|qa)([./_-]|$)/i.test(target)) testFiles += 1;
      if (/\.(md|mdx|rst)$/i.test(entry.name)) docFiles += 1;
      const extension = path.extname(entry.name).toLowerCase();
      if (EXTENSION_NAMES.has(extension)) {
        extensions.set(extension, (extensions.get(extension) || 0) + info.size);
      }
    }
  }

  const languages = [...extensions.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([extension, size]) => ({
      name: EXTENSION_NAMES.get(extension),
      percent: Math.max(1, Math.round((size / Math.max(1, bytes)) * 100)),
    }));

  return { bytes, docFiles, files, languages, testFiles };
}

function pickFeatures(bullets, inventoryData, scripts) {
  const generated = [];
  if (inventoryData.testFiles) {
    generated.push(`${inventoryData.testFiles} verification files already in the repository`);
  }
  if (scripts.dev) generated.push("Local development workflow is documented and executable");
  if (scripts.build) generated.push("A repeatable production build is included");
  if (inventoryData.docFiles > 1) {
    generated.push(`${inventoryData.docFiles} source-controlled documentation files`);
  }
  return [...bullets, ...generated].slice(0, 3);
}

function makeHtml(model) {
  const featureCards = model.features
    .map(
      (feature, index) => `
        <article class="feature">
          <span>0${index + 1}</span>
          <p>${escapeHtml(feature)}</p>
        </article>`,
    )
    .join("");

  const languages = model.languages
    .map(
      (language) => `
        <div class="language">
          <span>${escapeHtml(language.name)}</span>
          <strong>${language.percent}%</strong>
        </div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(model.name)} — launch proof</title>
  <style>
    :root {
      color-scheme: dark;
      --ink: #f4f2ec;
      --muted: #9a9a9d;
      --line: rgba(255,255,255,.12);
      --acid: #d7ff45;
      --violet: #9d7bff;
      --panel: rgba(255,255,255,.045);
    }
    * { box-sizing: border-box; }
    html { background: #070708; }
    body {
      margin: 0;
      min-height: 100vh;
      overflow-x: hidden;
      color: var(--ink);
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 78% 12%, rgba(157,123,255,.20), transparent 32rem),
        radial-gradient(circle at 18% 85%, rgba(215,255,69,.08), transparent 26rem),
        #070708;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: .25;
      background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: linear-gradient(to bottom, black, transparent 72%);
    }
    main { width: min(1180px, calc(100% - 48px)); margin: 0 auto; padding: 26px 0 64px; }
    nav { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); padding: 0 0 22px; }
    .brand { font-weight: 760; letter-spacing: -.02em; }
    .proof { color: var(--acid); font: 700 11px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .14em; text-transform: uppercase; }
    .hero { min-height: 560px; display: grid; grid-template-columns: 1.25fr .75fr; gap: 72px; align-items: center; }
    .eyebrow { display: flex; align-items: center; gap: 10px; color: var(--muted); font: 650 12px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .12em; text-transform: uppercase; }
    .eyebrow::before { content:""; width: 30px; height: 1px; background: var(--acid); }
    h1 { max-width: 790px; margin: 22px 0 20px; font-size: clamp(64px, 8.2vw, 118px); line-height: .87; letter-spacing: -.077em; font-weight: 800; }
    h1 em { color: transparent; -webkit-text-stroke: 1px rgba(244,242,236,.65); font-style: normal; }
    .summary { max-width: 650px; color: #c8c7c3; font-size: clamp(18px, 2vw, 23px); line-height: 1.45; letter-spacing: -.02em; }
    .command { margin-top: 32px; display: inline-flex; align-items: center; gap: 16px; max-width: 100%; padding: 14px 17px; border: 1px solid var(--line); border-radius: 12px; background: rgba(0,0,0,.55); box-shadow: 0 18px 60px rgba(0,0,0,.35); font: 14px ui-monospace, SFMono-Regular, Menlo, monospace; }
    .command b { color: var(--acid); font-weight: 500; }
    .command code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .orb { position: relative; width: 100%; aspect-ratio: 1; display: grid; place-items: center; }
    .orb::before, .orb::after { content:""; position: absolute; border-radius: 999px; border: 1px solid var(--line); }
    .orb::before { inset: 7%; animation: spin 18s linear infinite; border-top-color: var(--acid); }
    .orb::after { inset: 22%; animation: spin 11s linear reverse infinite; border-right-color: var(--violet); }
    .orb strong { position: relative; z-index: 2; font-size: clamp(62px, 8vw, 112px); letter-spacing: -.08em; }
    .orb small { position: absolute; z-index: 2; bottom: 29%; color: var(--muted); font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .15em; text-transform: uppercase; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
    .feature { min-height: 170px; padding: 22px; border: 1px solid var(--line); border-radius: 16px; background: var(--panel); backdrop-filter: blur(18px); }
    .feature span { color: var(--acid); font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; }
    .feature p { margin: 42px 0 0; font-size: 17px; line-height: 1.4; letter-spacing: -.015em; }
    .evidence { margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .panel { border: 1px solid var(--line); border-radius: 16px; background: var(--panel); padding: 22px; }
    .panel h2 { margin: 0 0 26px; font-size: 12px; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .14em; text-transform: uppercase; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .stat strong { display:block; font-size: 30px; letter-spacing: -.05em; }
    .stat span, .language { color: var(--muted); font-size: 12px; }
    .language { display:flex; justify-content:space-between; padding: 10px 0; border-top: 1px solid var(--line); }
    .language strong { color: var(--ink); }
    footer { margin-top: 34px; color: #747477; font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; display:flex; justify-content:space-between; text-transform:uppercase; letter-spacing:.08em; }
    @media (max-width: 780px) {
      main { width: min(100% - 28px, 660px); }
      .hero { grid-template-columns: 1fr; gap: 6px; padding: 80px 0 40px; }
      .orb { display:none; }
      h1 { font-size: clamp(58px, 19vw, 90px); }
      .features, .evidence { grid-template-columns: 1fr; }
    }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
  </style>
</head>
<body>
  <main>
    <nav>
      <div class="brand">${escapeHtml(model.name)}</div>
      <div class="proof">Generated from repository evidence</div>
    </nav>
    <section class="hero">
      <div>
        <div class="eyebrow">${escapeHtml(model.category)}</div>
        <h1>${escapeHtml(model.headline)}<br><em>${escapeHtml(model.subhead)}</em></h1>
        <p class="summary">${escapeHtml(model.description)}</p>
        <div class="command"><b>→</b><code>${escapeHtml(model.command)}</code></div>
      </div>
      <div class="orb"><strong>${model.files}</strong><small>source files read</small></div>
    </section>
    <section class="features">${featureCards}</section>
    <section class="evidence">
      <article class="panel">
        <h2>Repository proof</h2>
        <div class="stats">
          <div class="stat"><strong>${model.files}</strong><span>files</span></div>
          <div class="stat"><strong>${model.testFiles}</strong><span>test / QA</span></div>
          <div class="stat"><strong>${model.docFiles}</strong><span>docs</span></div>
        </div>
      </article>
      <article class="panel">
        <h2>Technical signature</h2>
${languages || '        <div class="language"><span>Source</span><strong>local</strong></div>'}
      </article>
    </section>
    <footer><span>Launch proof · local-first</span><span>${escapeHtml(model.generatedAt)}</span></footer>
  </main>
</body>
</html>`;
}

async function main() {
  const root = path.resolve(process.argv[2] || ".");
  const outputArg = process.argv[3];
  const output = outputArg
    ? path.resolve(outputArg)
    : path.join(process.cwd(), "launch-proof.html");
  const packageRaw = await readOptional(path.join(root, "package.json"), "{}");
  const packageJson = JSON.parse(packageRaw);
  const readme = await findReadme(root);
  const repoName = packageJson.name || path.basename(root);
  const readmeHeading = readme.match(/^#\s+(.+)$/m)?.[1];
  const name = stripMarkdown(readmeHeading || titleCase(repoName));
  const description =
    packageJson.description ||
    firstReadableParagraph(readme) ||
    "A source-controlled project with a reproducible local workflow.";
  const inv = await inventory(root);
  const features = pickFeatures(extractBullets(readme), inv, packageJson.scripts || {});
  while (features.length < 3) {
    features.push(
      [
        "Repository facts remain inspectable instead of being replaced by generated claims",
        "The launch artifact is self-contained, responsive, and editable",
        "No source code or telemetry leaves the machine",
      ][features.length],
    );
  }

  const headlineWords = name.split(/\s+/).filter(Boolean);
  const headline = headlineWords.slice(0, Math.max(1, Math.ceil(headlineWords.length / 2))).join(" ");
  const subhead =
    headlineWords.slice(Math.max(1, Math.ceil(headlineWords.length / 2))).join(" ") || "in motion";
  const model = {
    category: packageJson.private ? "Private build · local proof" : "Open source · launch proof",
    command: extractCommand(readme, packageJson.scripts || {}),
    description,
    docFiles: inv.docFiles,
    features,
    files: inv.files,
    generatedAt: new Date().toISOString().slice(0, 10),
    headline,
    languages: inv.languages,
    name,
    subhead,
    testFiles: inv.testFiles,
  };

  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, makeHtml(model));
  const bundlePath = output.replace(/\.html?$/i, ".json");
  await writeFile(
    bundlePath,
    `${JSON.stringify(
      {
        ...model,
        provenance: {
          packageJson: packageRaw !== "{}",
          readme: Boolean(readme),
          repository: root,
        },
      },
      null,
      2,
    )}\n`,
  );
  process.stdout.write(`${output}\n${bundlePath}\n`);
}

await main();
