import assert from "node:assert/strict";
import test from "node:test";
import { inspectMap, validateMap } from "../src/map.js";
import { renderMap } from "../src/render-map.js";

function fixture() {
  return {
    title: "Decision",
    question: "Should this ship?",
    updatedAt: "2026-07-30",
    verdict: "Ship the narrow version.",
    nodes: [
      {
        id: "position",
        type: "position",
        label: "Current position",
        text: "The narrow version should ship.",
      },
      {
        id: "observed",
        type: "evidence",
        label: "Observed result",
        text: "The narrow implementation passed the exact acceptance test.",
        sourceId: "run",
      },
      {
        id: "unknown",
        type: "unknown",
        label: "Production load",
        text: "Production behavior under sustained load has not been measured.",
      },
    ],
    edges: [
      {
        from: "observed",
        to: "position",
        relation: "supports",
        note: "The acceptance test exercises the promised narrow behavior.",
      },
      {
        from: "unknown",
        to: "position",
        relation: "missing",
        note: "A bad production load result would narrow the rollout.",
      },
    ],
    sources: [
      {
        id: "run",
        title: "Acceptance test output",
        url: "./test-output.txt",
        publisher: "Local test runner",
        date: "2026-07-30",
        retrievedAt: "2026-07-30T12:00:00Z",
        locator: "Summary line 42",
        excerpt:
          "The focused acceptance suite completed with 18 passing checks and zero failed checks.",
      },
    ],
  };
}

test("valid map produces a stable content receipt", () => {
  const map = fixture();
  const first = validateMap(map);
  const second = validateMap(JSON.parse(JSON.stringify(map)));
  assert.equal(first.valid, true);
  assert.match(first.receipt, /^[a-f0-9]{64}$/);
  assert.equal(first.receipt, second.receipt);
  assert.deepEqual(first.metrics, {
    claims: 0,
    contradictions: 0,
    evidence: 1,
    sources: 1,
    unknowns: 1,
  });
});

test("map rejects junk and future dates plus unbounded locators", () => {
  const map = fixture();
  map.sources[0].date = "3026-99-99";
  map.sources[0].retrievedAt = "yesterday-ish";
  map.sources[0].locator = "see somewhere";
  const rules = inspectMap(map).findings.map((item) => item.rule);
  assert.equal(rules.includes("source-date"), true);
  assert.equal(rules.includes("retrieval-date"), true);
  assert.equal(rules.includes("source-locator"), true);

  map.sources[0].date = "2026-07-31";
  map.sources[0].retrievedAt = "2026-07-31";
  assert.equal(
    inspectMap(map).findings.some((item) => item.rule === "future-source-date"),
    true,
  );
});

test("map rejects repeated filler disguised as a substantive excerpt", () => {
  const map = fixture();
  map.sources[0].excerpt = "a".repeat(42);
  assert.equal(
    inspectMap(map).findings.some((item) => item.rule === "low-information-excerpt"),
    true,
  );
});

test("map accepts bounded locator forms and absolute local paths", () => {
  for (const locator of ["p. 7", "§ 2.1", "L12-L18", "00:04:31", "Section: Results"]) {
    const map = fixture();
    map.sources[0].url = "/tmp/evidence.txt";
    map.sources[0].locator = locator;
    assert.equal(validateMap(map).valid, true);
  }
});

test("map rejects duplicate edges, cycles, and nodes disconnected from the position", () => {
  const map = fixture();
  map.nodes.push(
    {
      id: "isolated-a",
      type: "evidence",
      label: "Isolated A",
      text: "This evidence only participates in an isolated cycle.",
      sourceId: "run",
    },
    {
      id: "isolated-b",
      type: "evidence",
      label: "Isolated B",
      text: "This evidence only participates in an isolated cycle.",
      sourceId: "run",
    },
  );
  map.edges.push(
    {
      from: "isolated-a",
      to: "isolated-b",
      relation: "qualifies",
      note: "A qualifies B without connecting either node to the position.",
    },
    {
      from: "isolated-b",
      to: "isolated-a",
      relation: "qualifies",
      note: "B qualifies A without connecting either node to the position.",
    },
    { ...map.edges[0] },
  );
  const rules = inspectMap(map).findings.map((item) => item.rule);
  assert.equal(rules.includes("duplicate-edge"), true);
  assert.equal(rules.includes("disconnected-node"), true);
  assert.equal(rules.includes("reasoning-cycle"), true);
});

test("receipt covers the recorded excerpt and retrieval time", () => {
  const original = fixture();
  const changedExcerpt = fixture();
  const changedRetrieval = fixture();
  changedExcerpt.sources[0].excerpt += " Additional recorded context.";
  changedRetrieval.sources[0].retrievedAt = "2026-07-30T12:00:01Z";
  assert.notEqual(validateMap(original).receipt, validateMap(changedExcerpt).receipt);
  assert.notEqual(validateMap(original).receipt, validateMap(changedRetrieval).receipt);
});

test("map fails closed on unsourced evidence", () => {
  const map = fixture();
  delete map.nodes[1].sourceId;
  const result = inspectMap(map);
  assert.equal(result.valid, false);
  assert.equal(
    result.findings.some((finding) => finding.rule === "unsourced-evidence"),
    true,
  );
});

test("map rejects invented confidence percentages", () => {
  const map = fixture();
  map.nodes[0].confidence = 0.91;
  const result = inspectMap(map);
  assert.equal(
    result.findings.some((finding) => finding.rule === "false-precision"),
    true,
  );
});

test("rendered map is self-contained and keeps exact source regions", () => {
  const map = fixture();
  const html = renderMap(map, validateMap(map));
  assert.match(html, /<!doctype html>/);
  assert.match(html, /Summary line 42/);
  assert.match(html, /supports/);
  assert.match(html, /requestAnimationFrame\(drawConnections\)/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /name="description" content="Ship the narrow version\."/);
  assert.match(html, />Make a map ↗<\/a>/);
  assert.match(html, /href="https:\/\/github\.com\/alsoleg89\/doubt"/);
  assert.match(html, /font-size: 12px;\n    \}\n    \.toolbar button\.active/);
  assert.match(
    html,
    />Observed result<\/span>\s*<b>supports<\/b>\s*<span>Current position</,
  );
  assert.doesNotMatch(html, /https:\/\/cdn\./);
});

test("renderer escapes map content and embedded JSON", () => {
  const map = fixture();
  map.nodes[0].text = "</script><img src=x onerror=alert(1)>";
  const html = renderMap(map, validateMap(map));
  assert.match(html, /&lt;\/script&gt;&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /\\u003c\/script\\u003e\\u003cimg/);
  assert.doesNotMatch(html, /<\/script><img/);
});
