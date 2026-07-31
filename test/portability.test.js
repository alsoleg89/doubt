import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  validatePortabilityResult,
  validatePortabilityResultFile,
} from "../benchmarks/skill-portability/validate.mjs";

const benchmarkDir = path.resolve("benchmarks/skill-portability");

async function example() {
  return JSON.parse(await readFile(path.join(benchmarkDir, "result.example.json"), "utf8"));
}

test("portability protocol fixes three prompt classes and five clients", async () => {
  const protocol = JSON.parse(await readFile(path.join(benchmarkDir, "protocol.json"), "utf8"));
  assert.deepEqual(protocol.prompts.map((prompt) => prompt.id), ["direct", "implicit", "negative"]);
  assert.deepEqual(protocol.clients, [
    "claude-code",
    "codex",
    "github-copilot",
    "cursor",
    "gemini-cli",
  ]);
  assert.equal(protocol.freshSessionPerPrompt, true);
  assert.equal(protocol.networkRequiredByFixture, false);
});

test("portability template has a valid shape but submitted placeholders fail closed", async () => {
  const result = await example();
  assert.deepEqual(validatePortabilityResult(result, { allowPlaceholders: true }), []);
  const findings = validatePortabilityResult(result);
  assert.equal(findings.some((finding) => finding.includes("placeholder")), true);
  assert.equal(
    findings.includes("runs.direct.outcome must be pass, fail, or blocked in a submitted result"),
    true,
  );
});

test("single-client portability result cannot claim cross-client equivalence", async () => {
  const result = await example();
  result.behavioralEquivalenceClaimed = true;
  const findings = validatePortabilityResult(result, { allowPlaceholders: true });
  assert.equal(
    findings.includes("behavioralEquivalenceClaimed must be false for a single-client result"),
    true,
  );
});

test("submitted portability result must match the canonical skill digest", async () => {
  const result = await example();
  result.skillDigest = "a".repeat(64);
  const findings = validatePortabilityResult(result, {
    allowPlaceholders: true,
    expectedSkillDigest: "b".repeat(64),
  });
  assert.equal(
    findings.includes(
      `skillDigest does not match the canonical payload (${"b".repeat(64)})`,
    ),
    true,
  );
});

test("a passing negative probe rejects activation or an artifact", async () => {
  const result = await example();
  result.submittedAt = "2026-07-31T00:00:00.000Z";
  result.client.version = "1.2.3";
  result.client.model = "example-model";
  result.client.installPath = ".agents/skills/doubt";
  result.client.configuration = "defaults";
  result.environment.os = "Example OS 1";
  result.environment.permissionMode = "default";
  result.skillDigest = "a".repeat(64);
  for (const run of result.runs) {
    run.outcome = run.promptId === "negative" ? "pass" : "blocked";
    run.notes = "Observed in an isolated synthetic fixture.";
    run.rawOutputPath = `benchmarks/skill-portability/results/artifacts/example/${run.promptId}.txt`;
  }
  const negative = result.runs.find((run) => run.promptId === "negative");
  negative.activation = "observed";
  negative.artifactPath = "benchmarks/skill-portability/results/artifacts/example/output.json";
  const findings = validatePortabilityResult(result);
  assert.equal(
    findings.includes("runs.negative pass requires no observed activation and no artifact"),
    true,
  );
});

test("a passing map run must match the committed artifact receipt", async () => {
  const submitted = path.join(
    benchmarkDir,
    "results",
    "github-copilot-1.0.77.json",
  );
  const result = JSON.parse(await readFile(submitted, "utf8"));
  const cwd = await mkdtemp(path.join(tmpdir(), "doubt-portability-result-"));
  const tampered = path.join(cwd, "tampered.json");
  result.runs.find((run) => run.promptId === "direct").evidenceReceipt = "a".repeat(64);
  await writeFile(tampered, `${JSON.stringify(result, null, 2)}\n`);

  const findings = await validatePortabilityResultFile(tampered, result.skillDigest);
  assert.equal(
    findings.some((finding) => finding.startsWith(
      "direct.evidenceReceipt does not match artifact receipt",
    )),
    true,
  );
});
