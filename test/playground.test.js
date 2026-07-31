import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  canonicalJson,
  inspectMapContract,
} from "../src/contract.js";
import { validateMap } from "../src/map.js";
import { renderMap } from "../src/render-map.js";

test("browser contract and Node wrapper agree on the public example", async () => {
  const map = JSON.parse(
    await readFile("examples/agent-skills-vs-mcp.doubt.json", "utf8"),
  );
  const browser = inspectMapContract(map);
  const node = validateMap(map);
  const expected = createHash("sha256").update(canonicalJson(map)).digest("hex");

  assert.equal(browser.valid, true);
  assert.equal(browser.receipt, null);
  assert.deepEqual(browser.metrics, node.metrics);
  assert.deepEqual(browser.findings, node.findings);
  assert.equal(node.receipt, expected);
  assert.match(renderMap(map, { ...browser, receipt: expected }), /0444afe44c52/);
});

test("playground is local-only and loads browser-safe canonical modules", async () => {
  const [page, home, contract, workflow] = await Promise.all([
    readFile("site/playground/index.html", "utf8"),
    readFile("site/index.html", "utf8"),
    readFile("src/contract.js", "utf8"),
    readFile(".github/workflows/pages.yml", "utf8"),
  ]);

  assert.match(page, /import \{ canonicalJson, inspectMapContract \} from "\.\.\/assets\/contract\.js"/);
  assert.match(page, /import \{ renderMap \} from "\.\.\/assets\/render-map\.js"/);
  assert.match(page, /Your map stays in this tab/);
  assert.match(page, /No account, telemetry, analytics,\s+or network submission/);
  assert.match(page, /property="og:image" content="https:\/\/alsoleg89\.github\.io\/doubt\/social-preview\.png"/);
  assert.match(home, /property="og:image" content="https:\/\/alsoleg89\.github\.io\/doubt\/social-preview\.png"/);
  assert.match(home, />Star on GitHub ↗<\/a>/);
  assert.match(page, /sandbox="allow-scripts allow-popups"/);
  assert.doesNotMatch(page, /allow-same-origin/);
  assert.doesNotMatch(page, /google-analytics|googletagmanager|segment\.com|posthog|plausible/i);
  assert.doesNotMatch(contract, /from "node:|require\(["']node:/);
  assert.match(workflow, /cp src\/contract\.js _site\/assets\/contract\.js/);
  assert.match(workflow, /cp src\/render-map\.js _site\/assets\/render-map\.js/);
  assert.match(workflow, /cp site\/playground\/index\.html _site\/playground\/index\.html/);
  assert.match(workflow, /cp docs\/social-preview\.png _site\/social-preview\.png/);
});
