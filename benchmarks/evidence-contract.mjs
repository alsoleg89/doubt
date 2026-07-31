import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { inspectMap } from "../src/map.js";
import { renderMap } from "../src/render-map.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exampleFile = path.join(root, "examples", "agent-skills-vs-mcp.doubt.json");
const outputDir = path.join(root, "benchmarks", "results");
const writeResults = !process.argv.includes("--check-only");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function rules(result) {
  return new Set(result.findings.map((finding) => finding.rule));
}

const base = JSON.parse(await readFile(exampleFile, "utf8"));

const cases = [
  {
    id: "valid-dogfood-map",
    expected: "valid",
    run(map) {
      const result = inspectMap(map);
      return {
        passed: result.valid && /^[a-f0-9]{64}$/.test(result.receipt),
        observed: result.valid ? "valid with receipt" : [...rules(result)].join(", "),
      };
    },
  },
  {
    id: "unsourced-evidence",
    expected: "unsourced-evidence",
    mutate(map) {
      delete map.nodes.find((node) => node.type === "evidence").sourceId;
    },
  },
  {
    id: "invented-confidence",
    expected: "false-precision",
    mutate(map) {
      map.nodes[0].confidence = 0.97;
    },
  },
  {
    id: "missing-source-locator",
    expected: "source-field",
    mutate(map) {
      delete map.sources[0].locator;
    },
  },
  {
    id: "unbounded-source-locator",
    expected: "source-locator",
    mutate(map) {
      map.sources[0].locator = "see somewhere";
    },
  },
  {
    id: "malformed-source-date",
    expected: "source-date",
    mutate(map) {
      map.sources[0].date = "3026-99-99";
    },
  },
  {
    id: "future-source-date",
    expected: "future-source-date",
    mutate(map) {
      map.sources[0].date = "3026-01-01";
    },
  },
  {
    id: "missing-retrieval-date",
    expected: "source-field",
    mutate(map) {
      delete map.sources[0].retrievedAt;
    },
  },
  {
    id: "thin-source-region",
    expected: "thin-excerpt",
    mutate(map) {
      map.sources[0].excerpt = "Too short.";
    },
  },
  {
    id: "oversized-source-region",
    expected: "oversized-excerpt",
    mutate(map) {
      map.sources[0].excerpt = "x".repeat(501);
    },
  },
  {
    id: "repeated-filler-excerpt",
    expected: "low-information-excerpt",
    mutate(map) {
      map.sources[0].excerpt = "a".repeat(42);
    },
  },
  {
    id: "dangling-reasoning-edge",
    expected: "unknown-node",
    mutate(map) {
      map.edges[0].from = "node-that-does-not-exist";
    },
  },
  {
    id: "unknown-relation",
    expected: "edge-relation",
    mutate(map) {
      map.edges[0].relation = "kind-of-related";
    },
  },
  {
    id: "decorative-unused-source",
    expected: "unused-source",
    mutate(map) {
      map.sources.push({
        id: "decorative",
        title: "Decorative source",
        url: "https://example.com/decorative",
        publisher: "Example",
        date: "2026-07-30",
        retrievedAt: "2026-07-30",
        locator: "Section: Overview",
        excerpt: "This source is deliberately not connected to any evidence node in the map.",
      });
    },
  },
  {
    id: "duplicate-reasoning-edge",
    expected: "duplicate-edge",
    mutate(map) {
      map.edges.push({ ...map.edges[0] });
    },
  },
  {
    id: "disconnected-reasoning-subgraph",
    expected: "disconnected-node",
    mutate(map) {
      const evidence = map.nodes.find((node) => node.type === "evidence");
      map.edges = map.edges.filter((edge) => edge.from !== evidence.id);
    },
  },
  {
    id: "reasoning-cycle",
    expected: "reasoning-cycle",
    mutate(map) {
      const [first, second] = map.nodes.filter((node) => node.type === "claim");
      map.edges.push(
        {
          from: first.id,
          to: second.id,
          relation: "qualifies",
          note: "The first claim qualifies the second claim.",
        },
        {
          from: second.id,
          to: first.id,
          relation: "qualifies",
          note: "The second claim qualifies the first claim.",
        },
      );
    },
  },
  {
    id: "decorative-unused-evidence",
    expected: "unused-evidence",
    mutate(map) {
      map.nodes.push({
        id: "decorative-evidence",
        type: "evidence",
        label: "Decorative evidence",
        text: "This evidence is sourced but does not participate in the reasoning.",
        sourceId: "repoclip-source",
      });
    },
  },
  {
    id: "unsupported-position",
    expected: "unsupported-position",
    mutate(map) {
      const position = map.nodes.find((node) => node.type === "position");
      map.edges = map.edges.filter((edge) => edge.to !== position.id);
    },
  },
  {
    id: "embedded-markup",
    expected: "escaped",
    run(map) {
      map.nodes[0].text = "</script><img src=x onerror=alert(1)>";
      const validation = inspectMap(map);
      if (!validation.valid) {
        return { passed: false, observed: [...rules(validation)].join(", ") };
      }
      const html = renderMap(map, validation);
      const rawMarkup = html.includes("</script><img");
      const escapedVisible = html.includes("&lt;/script&gt;&lt;img");
      const escapedJson = html.includes("\\u003c/script\\u003e\\u003cimg");
      return {
        passed: !rawMarkup && escapedVisible && escapedJson,
        observed: !rawMarkup && escapedVisible && escapedJson ? "escaped" : "unsafe output",
      };
    },
  },
  {
    id: "forged-verification-digest",
    expected: "verification-digest",
    mutate(map) {
      map.sources[0].retrievedAt = map.updatedAt;
      map.sources[0].verification = {
        checkedAt: `${map.updatedAt}T12:00:00.000Z`,
        contentSha256: "not-a-sha256-digest",
        excerptSha256: "a".repeat(64),
        finalUrl: map.sources[0].url,
        locatorStatus: "not-machine-checked",
        method: "normalized-excerpt-match",
        status: "verified",
      };
    },
  },
];

const results = cases.map((testCase) => {
  const map = clone(base);
  if (testCase.mutate) testCase.mutate(map);
  if (testCase.run) return { id: testCase.id, expected: testCase.expected, ...testCase.run(map) };
  const result = inspectMap(map);
  const observedRules = [...rules(result)];
  return {
    id: testCase.id,
    expected: testCase.expected,
    observed: observedRules.join(", ") || "valid",
    passed: observedRules.includes(testCase.expected),
  };
});

const passed = results.filter((result) => result.passed).length;
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  subject: "Doubt evidence-contract validator and renderer",
  methodology:
    "Deterministic adversarial mutations of the canonical dogfood map. Each case names the invariant that must fire; graph cases cover reachability, duplication, and cycles; the markup case checks escaped visible HTML and embedded JSON.",
  summary: {
    passed,
    total: results.length,
    rate: Number(((passed / results.length) * 100).toFixed(1)),
  },
  results,
};

const markdown = [
  "# Evidence-contract benchmark",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  `**${passed}/${results.length} cases passed (${report.summary.rate}%).**`,
  "",
  "| Case | Expected | Observed | Result |",
  "| --- | --- | --- | --- |",
  ...results.map(
    (result) =>
      `| \`${result.id}\` | \`${result.expected}\` | \`${result.observed}\` | ${result.passed ? "PASS" : "FAIL"} |`,
  ),
  "",
  "This benchmark measures structural traceability and safe rendering. It does",
  "not measure whether a source is true or whether an AI extracted it faithfully.",
  "",
].join("\n");

if (writeResults) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "latest.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(outputDir, "latest.md"), markdown);
}

process.stdout.write(`${passed}/${results.length} evidence-contract cases passed (${report.summary.rate}%).\n`);
for (const result of results) {
  process.stdout.write(`${result.passed ? "PASS" : "FAIL"} ${result.id} → ${result.observed}\n`);
}
if (passed !== results.length) process.exitCode = 1;
