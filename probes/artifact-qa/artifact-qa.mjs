#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const layoutDirectory = resolve(process.argv[2]);
const output = resolve(process.argv[3] || "artifact-qa-report.html");

if (!process.argv[2]) {
  throw new Error("Usage: node artifact-qa.mjs <layout-directory> [report.html]");
}

function overlap(a, b) {
  const [ax, ay, aw, ah] = a;
  const [bx, by, bw, bh] = b;
  const width = Math.max(0, Math.min(ax + aw, bx + bw) - Math.max(ax, bx));
  const height = Math.max(0, Math.min(ay + ah, by + bh) - Math.max(ay, by));
  return width * height;
}

function hexRgb(hex) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((part) => part + part).join("")
    : value;
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function luminance(hex) {
  const channels = hexRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const first = luminance(a);
  const second = luminance(b);
  const bright = Math.max(first, second);
  const dark = Math.min(first, second);
  return (bright + 0.05) / (dark + 0.05);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function analyze(layout) {
  const findings = [];
  const [slideX, slideY, slideWidth, slideHeight] = [
    layout.slide.frame.left,
    layout.slide.frame.top,
    layout.slide.frame.width,
    layout.slide.frame.height,
  ];
  const background = layout.slide.backgroundColor || "#FFFFFF";
  const elements = layout.elements.filter((element) => element.scope === "slide");

  for (const element of elements) {
    const [left, top, width, height] = element.bbox;
    const right = left + width;
    const bottom = top + height;
    if (
      left < slideX
      || top < slideY
      || right > slideX + slideWidth
      || bottom > slideY + slideHeight
    ) {
      findings.push({
        severity: "high",
        rule: "off-canvas",
        element: element.name,
        message: `Frame [${element.bbox.join(", ")}] exceeds the ${slideWidth}×${slideHeight} canvas.`,
        repair: `Move or resize ${element.name} so right ≤ ${slideWidth} and bottom ≤ ${slideHeight}.`,
      });
    }

    const lines = element.textLayout?.lineCount || 0;
    const fontSize = element.resolvedFontSize || 0;
    const insets = element.resolvedTextStyle?.insets || {};
    const required = lines * fontSize * 1.15 + (insets.top || 0) + (insets.bottom || 0);
    if (
      element.text
      && element.resolvedTextStyle?.autoFit === "none"
      && required > height * 1.08
    ) {
      findings.push({
        severity: "high",
        rule: "text-overflow",
        element: element.name,
        message: `${lines} rendered lines need ≈${Math.ceil(required)}px inside a ${height}px frame.`,
        repair: `Increase ${element.name} height to at least ${Math.ceil(required)}px, shorten the copy, or enable measured fitting.`,
      });
    }

    const color = element.resolvedTextStyle?.color;
    if (element.text && /^#[0-9a-f]{6}$/i.test(color || "") && /^#[0-9a-f]{6}$/i.test(background)) {
      const ratio = contrast(color, background);
      if (ratio < 4.5) {
        findings.push({
          severity: "high",
          rule: "low-contrast",
          element: element.name,
          message: `${color} on ${background} has ${ratio.toFixed(2)}:1 contrast; body text needs 4.5:1.`,
          repair: `Darken ${element.name} text to a color meeting WCAG AA against ${background}.`,
        });
      }
    }
  }

  for (let first = 0; first < elements.length; first += 1) {
    for (let second = first + 1; second < elements.length; second += 1) {
      const a = elements[first];
      const b = elements[second];
      if (!a.text || !b.text) continue;
      const area = overlap(a.bbox, b.bbox);
      const smaller = Math.min(a.bbox[2] * a.bbox[3], b.bbox[2] * b.bbox[3]);
      const share = smaller ? area / smaller : 0;
      if (share > 0.05) {
        findings.push({
          severity: "high",
          rule: "text-overlap",
          element: `${a.name} ↔ ${b.name}`,
          message: `Text frames overlap by ${Math.round(share * 100)}% of the smaller frame.`,
          repair: `Separate ${a.name} and ${b.name}; preserve at least 24px between narrative regions.`,
        });
      }
    }
  }
  return findings;
}

const layoutFiles = (await readdir(layoutDirectory))
  .filter((file) => /^slide-\d+\.layout\.json$/.test(file))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const slides = [];
for (const file of layoutFiles) {
  const layout = JSON.parse(await readFile(join(layoutDirectory, file), "utf8"));
  slides.push({
    number: layout.slide.slide,
    image: `slide-${layout.slide.slide}.png`,
    title: layout.elements.find((element) => element.text)?.text || `Slide ${layout.slide.slide}`,
    findings: analyze(layout),
  });
}

const total = slides.reduce((sum, slide) => sum + slide.findings.length, 0);
const rows = slides.map((slide) => `
  <article class="slide ${slide.findings.length ? "fail" : "pass"}">
    <div class="preview">
      <img src="${slide.image}" alt="Rendered slide ${slide.number}">
      <span>SLIDE ${slide.number}</span>
    </div>
    <div class="analysis">
      <div class="verdict">${slide.findings.length ? "FAIL" : "PASS"} · ${slide.findings.length} finding${slide.findings.length === 1 ? "" : "s"}</div>
      <h2>${escapeHtml(slide.title)}</h2>
      ${slide.findings.length ? `<ol>${slide.findings.map((finding) => `
        <li>
          <strong>${escapeHtml(finding.rule)}</strong>
          <code>${escapeHtml(finding.element)}</code>
          <p>${escapeHtml(finding.message)}</p>
          <small>REPAIR → ${escapeHtml(finding.repair)}</small>
        </li>`).join("")}</ol>` : "<p class=\"clean\">No deterministic geometry, fit, or contrast defects found.</p>"}
    </div>
  </article>`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Artifact QA report</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #090A0D; color: #F7F7F8; }
    main { width: min(1320px, calc(100% - 40px)); margin: 0 auto; padding: 56px 0 90px; }
    .eyebrow { color: #8D93A3; font: 700 12px/1 ui-monospace, monospace; letter-spacing: .18em; text-transform: uppercase; }
    header { margin-bottom: 44px; }
    h1 { margin: 14px 0 10px; font-size: clamp(42px, 7vw, 82px); line-height: .95; letter-spacing: -.06em; }
    header p { max-width: 740px; color: #A8ACB8; font-size: 18px; line-height: 1.5; }
    .metric { display: inline-block; margin-top: 16px; color: ${total ? "#FF6B6B" : "#45D39C"}; font: 700 14px/1 ui-monospace, monospace; }
    .slide { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(360px, .9fr); gap: 30px; padding: 28px 0 38px; border-top: 1px solid #262A34; }
    .preview { position: relative; align-self: start; overflow: hidden; border: 1px solid #2C303A; border-radius: 12px; background: white; }
    .preview img { display: block; width: 100%; }
    .preview span { position: absolute; left: 12px; bottom: 12px; padding: 6px 8px; border-radius: 6px; background: rgba(0,0,0,.82); font: 700 10px/1 ui-monospace, monospace; letter-spacing: .12em; }
    .verdict { color: #FF7979; font: 700 12px/1 ui-monospace, monospace; letter-spacing: .1em; }
    .pass .verdict, .clean { color: #45D39C; }
    h2 { margin: 12px 0 20px; font-size: 28px; line-height: 1.12; letter-spacing: -.035em; }
    ol { margin: 0; padding: 0; list-style: none; }
    li { padding: 15px 0; border-top: 1px solid #20232B; }
    li strong { margin-right: 8px; color: #FF9C9C; font: 700 12px/1 ui-monospace, monospace; text-transform: uppercase; }
    code { color: #B9BDCA; font: 600 12px/1.4 ui-monospace, monospace; }
    li p { margin: 8px 0; color: #CED0D7; font-size: 14px; line-height: 1.45; }
    li small { color: #858B9B; font: 11px/1.5 ui-monospace, monospace; }
    footer { margin-top: 28px; color: #63697A; font: 11px/1.5 ui-monospace, monospace; }
    @media (max-width: 900px) { .slide { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="eyebrow">Artifact QA / deterministic probe</div>
      <h1>The export passed.<br>The artifact did not.</h1>
      <p>Every page is rendered and inspected for geometry, text fit, and readable contrast. Findings return exact object names and repair targets to the generating agent.</p>
      <span class="metric">${total} DEFECTS · ${slides.length} SLIDES · ${total ? "FAIL" : "PASS"}</span>
    </header>
${rows}
    <footer>${escapeHtml(basename(layoutDirectory))} · generated ${new Date().toISOString()}</footer>
  </main>
</body>
</html>`;

await writeFile(output, html);
console.log(JSON.stringify({
  layouts: layoutFiles.length,
  findings: total,
  verdict: total ? "FAIL" : "PASS",
  output,
}, null, 2));
