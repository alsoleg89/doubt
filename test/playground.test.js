import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { inspectMapContract } from "../src/contract.js";
import { validateMap } from "../src/map.js";
import { renderMap } from "../src/render-map.js";
import {
  buildShareUrl,
  decodeShareMap,
  encodeShareMap,
  MAX_FRAGMENT_LENGTH,
} from "../src/share-link.js";

test("browser contract and Node wrapper agree on the public example", async () => {
  const map = JSON.parse(
    await readFile("examples/agent-skills-vs-mcp.doubt.json", "utf8"),
  );
  const browser = inspectMapContract(map);
  const node = validateMap(map);
  const expected = node.receipt;

  assert.equal(browser.valid, true);
  assert.equal(browser.receipt, null);
  assert.deepEqual(browser.metrics, node.metrics);
  assert.deepEqual(browser.findings, node.findings);
  assert.match(renderMap(map, { ...browser, receipt: expected }), new RegExp(expected.slice(0, 12)));
});

test("public preview metrics and receipt match the canonical map", async () => {
  const [mapJson, preview] = await Promise.all([
    readFile("examples/agent-skills-vs-mcp.doubt.json", "utf8"),
    readFile("docs/demo.svg", "utf8"),
  ]);
  const report = validateMap(JSON.parse(mapJson));

  assert.match(preview, new RegExp(`>${report.metrics.claims}<\\/text>\\s*<text[^>]*>CLAIMS<`));
  assert.match(preview, new RegExp(`>${report.metrics.evidence}<\\/text>\\s*<text[^>]*>EVIDENCE<`));
  assert.match(preview, new RegExp(`>${report.metrics.contradictions}<\\/text>\\s*<text[^>]*>TENSIONS<`));
  assert.match(preview, new RegExp(`>${report.metrics.unknowns}<\\/text>\\s*<text[^>]*>UNKNOWN<`));
  assert.match(preview, new RegExp(`receipt · ${report.receipt.slice(0, 12)}…`));
});

test("playground is local-only and loads browser-safe canonical modules", async () => {
  const [page, home, contract, shareLink, workflow, robots, sitemap, llms, indexNow, indexNowKey] = await Promise.all([
    readFile("site/playground/index.html", "utf8"),
    readFile("site/index.html", "utf8"),
    readFile("src/contract.js", "utf8"),
    readFile("src/share-link.js", "utf8"),
    readFile(".github/workflows/pages.yml", "utf8"),
    readFile("site/robots.txt", "utf8"),
    readFile("site/sitemap.xml", "utf8"),
    readFile("site/llms.txt", "utf8"),
    readFile("site/indexnow.json", "utf8"),
    readFile("site/6cfa3cf24f13d6610627b17a367393d2.txt", "utf8"),
  ]);

  assert.match(page, /import \{ canonicalJson, inspectMapContract, receiptPayload \} from "\.\.\/assets\/contract\.js"/);
  assert.match(page, /receiptForMap\(map\)/);
  assert.match(page, /contract: "doubt-evidence-receipt-v1"|receiptPayload\(map, sourceSnapshots\)/);
  assert.match(page, /import \{ renderMap \} from "\.\.\/assets\/render-map\.js"/);
  assert.match(page, /import \{ buildShareUrl, decodeShareMap \} from "\.\.\/assets\/share-link\.js"/);
  assert.match(page, />Copy share link<\/button>/);
  assert.match(page, /history\.replaceState\(null, "", link\)/);
  assert.match(page, /The share link is ready in the address bar/);
  assert.match(page, />Load rejected example<\/button>/);
  assert.match(page, /map\.sources\[0\]\.date = "3026-99-99"/);
  assert.match(page, /map\.sources\[0\]\.locator = "see somewhere"/);
  assert.match(page, /map\.sources\[0\]\.excerpt = "a"\.repeat\(42\)/);
  assert.match(page, /Share links carry the map after <code>#<\/code>/);
  assert.match(page, /Your map stays in this tab/);
  assert.match(page, /No account, telemetry, analytics,\s+or network submission/);
  assert.match(page, /property="og:image" content="https:\/\/alsoleg89\.github\.io\/doubt\/social-preview\.png"/);
  assert.match(home, /property="og:image" content="https:\/\/alsoleg89\.github\.io\/doubt\/social-preview\.png"/);
  assert.match(home, /rel="canonical" href="https:\/\/alsoleg89\.github\.io\/doubt\/"/);
  assert.match(home, /type="application\/ld\+json"/);
  assert.match(home, /"@type": "SoftwareApplication"/);
  assert.match(home, /rel="alternate" type="text\/plain".*llms\.txt/);
  assert.match(page, /rel="canonical" href="https:\/\/alsoleg89\.github\.io\/doubt\/playground\/"/);
  assert.doesNotMatch(home, />Star on GitHub ↗<\/a>/);
  assert.match(home, /examples\/agent-skills-portability\.html/);
  assert.match(home, />Test Agent Skills portability<\/a>/);
  assert.match(home, /id="contribute"/);
  assert.match(home, /2\/5 clients benchmarked/);
  for (const issue of [11, 14, 13]) {
    assert.match(home, new RegExp(`github\\.com\\/alsoleg89\\/doubt\\/issues\\/${issue}`));
  }
  assert.match(home, /codex-0\.146\.0-alpha\.3\.1-offline\.json/);
  assert.match(home, /Completed · 3\/3/);
  assert.match(home, /Completed · 2\/3/);
  assert.match(home, /One client is enough/);
  assert.match(page, /sandbox="allow-scripts allow-popups"/);
  assert.doesNotMatch(page, /allow-same-origin/);
  assert.doesNotMatch(page, /google-analytics|googletagmanager|segment\.com|posthog|plausible/i);
  assert.doesNotMatch(contract, /from "node:|require\(["']node:/);
  assert.doesNotMatch(shareLink, /from "node:|require\(["']node:/);
  assert.match(workflow, /cp src\/contract\.js _site\/assets\/contract\.js/);
  assert.match(workflow, /cp src\/render-map\.js _site\/assets\/render-map\.js/);
  assert.match(workflow, /cp src\/share-link\.js _site\/assets\/share-link\.js/);
  assert.match(workflow, /cp examples\/agent-skills-portability\.html _site\/examples\/agent-skills-portability\.html/);
  assert.match(workflow, /cp examples\/agent-skills-portability\.doubt\.json _site\/examples\/agent-skills-portability\.doubt\.json/);
  assert.match(workflow, /cp site\/playground\/index\.html _site\/playground\/index\.html/);
  assert.match(workflow, /paths:\s+[\s\S]*- "site\/\*\*"/);
  assert.match(workflow, /- "examples\/\*\*"/);
  assert.match(workflow, /cp docs\/social-preview\.png _site\/social-preview\.png/);
  assert.match(workflow, /cp site\/robots\.txt _site\/robots\.txt/);
  assert.match(workflow, /cp site\/sitemap\.xml _site\/sitemap\.xml/);
  assert.match(workflow, /cp site\/llms\.txt _site\/llms\.txt/);
  assert.match(workflow, /cp site\/6cfa3cf24f13d6610627b17a367393d2\.txt _site\//);
  assert.match(workflow, /https:\/\/api\.indexnow\.org\/indexnow/);
  assert.match(workflow, /continue-on-error: true/);
  assert.match(robots, /Sitemap: https:\/\/alsoleg89\.github\.io\/doubt\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/alsoleg89\.github\.io\/doubt\/<\/loc>/);
  assert.match(sitemap, /agent-skills-portability\.html/);
  assert.match(llms, /The validator proves structural traceability/);
  assert.match(llms, /submitted runs\s+for two of five clients/);
  assert.doesNotMatch(llms, /5\/5|behaviorally equivalent/i);
  const indexNowPayload = JSON.parse(indexNow);
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(indexNowPayload.host, "alsoleg89.github.io");
  assert.equal(indexNowPayload.key, indexNowKey.trim());
  assert.equal(
    indexNowPayload.keyLocation,
    `https://alsoleg89.github.io/doubt/${indexNowPayload.key}.txt`,
  );
  assert.deepEqual(indexNowPayload.urlList, sitemapUrls);
});

test("share links round-trip Unicode maps without sending content in the request URL", () => {
  const map = {
    title: "Спорное решение",
    question: "Ship?",
    nodes: [{ id: "position", type: "position", text: "Да" }],
    edges: [],
    sources: [],
  };
  const fragment = encodeShareMap(map);
  const url = buildShareUrl("https://alsoleg89.github.io/doubt/playground/?ref=test", map);

  assert.ok(fragment.length < MAX_FRAGMENT_LENGTH);
  assert.deepEqual(decodeShareMap(fragment), map);
  assert.equal(new URL(url).pathname, "/doubt/playground/");
  assert.equal(new URL(url).search, "?ref=test");
  assert.deepEqual(decodeShareMap(new URL(url).hash), map);
  assert.doesNotMatch(url.split("#")[0], /Спорное|position|Ship/);
});
