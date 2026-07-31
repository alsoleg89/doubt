import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  checkEvidenceMaps,
  escapeWorkflowCommand,
  findEvidenceMaps,
  formatActionSummary,
} from "../src/action.js";

function validMap() {
  return {
    title: "Decision",
    question: "Should this ship?",
    updatedAt: "2026-07-31",
    verdict: "Ship the narrow version.",
    nodes: [
      {
        id: "position",
        type: "position",
        label: "Position",
        text: "The narrow version should ship.",
      },
      {
        id: "evidence",
        type: "evidence",
        label: "Test result",
        text: "The acceptance suite passed.",
        sourceId: "test",
      },
    ],
    edges: [
      {
        from: "evidence",
        to: "position",
        relation: "supports",
        note: "The test exercises the promised behavior.",
      },
    ],
    sources: [
      {
        id: "test",
        title: "Acceptance output",
        publisher: "Test runner",
        date: "2026-07-31",
        url: "./output.txt",
        locator: "Summary line 1",
        excerpt: "The acceptance suite completed with all focused checks passing.",
      },
    ],
  };
}

test("action discovers only evidence-map files and reports receipts", async () => {
  const root = await mkdtemp(join(tmpdir(), "doubt-action-"));
  await mkdir(join(root, "nested"));
  await mkdir(join(root, "node_modules"));
  await writeFile(join(root, "nested", "decision.doubt.json"), JSON.stringify(validMap()));
  await writeFile(join(root, "ignored.json"), "{}");
  await writeFile(join(root, "node_modules", "hidden.doubt.json"), "{}");

  const files = await findEvidenceMaps(root);
  assert.equal(files.length, 1);

  const result = await checkEvidenceMaps(files, root);
  assert.equal(result.failures.length, 0);
  assert.equal(result.valid.length, 1);
  assert.match(result.valid[0].receipt, /^[a-f0-9]{64}$/);
  assert.match(formatActionSummary(result), /Doubt evidence contract: PASS/);
});

test("action preserves validator findings and escapes workflow commands", async () => {
  const root = await mkdtemp(join(tmpdir(), "doubt-action-"));
  const map = validMap();
  delete map.nodes[1].sourceId;
  const file = join(root, "bad.doubt.json");
  await writeFile(file, JSON.stringify(map));

  const result = await checkEvidenceMaps([file], root);
  assert.equal(result.failures.length, 1);
  assert.equal(
    result.failures[0].findings.some((finding) => finding.rule === "unsourced-evidence"),
    true,
  );
  assert.equal(escapeWorkflowCommand("a:b,c%\n"), "a%3Ab%2Cc%25%0A");
});

test("repository dogfoods the published evidence-contract Action", async () => {
  const [workflow, readme] = await Promise.all([
    readFile(".github/workflows/evidence.yml", "utf8"),
    readFile("README.md", "utf8"),
  ]);

  assert.match(workflow, /name: Evidence contract/);
  assert.match(workflow, /- uses: \.\//);
  assert.match(workflow, /require-maps: "true"/);
  assert.match(readme, /actions\/workflows\/evidence\.yml\/badge\.svg/);
});
