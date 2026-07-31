import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { buildSkillArchive } from "../../scripts/build-skill-discovery.mjs";
import { inspectMap } from "../../src/map.js";

const benchmarkDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(benchmarkDir, "..", "..");
const resultsDir = path.join(benchmarkDir, "results");
const expectedPromptIds = ["direct", "implicit", "negative"];
const clients = new Set([
  "claude-code",
  "codex",
  "github-copilot",
  "cursor",
  "gemini-cli",
]);
const outcomes = new Set(["pass", "fail", "blocked", "not-run"]);
const observations = new Set(["observed", "not-observed", "unknown"]);
const consentValues = new Set(["requested", "not-requested", "not-applicable", "unknown"]);
const receiptPattern = /^[a-f0-9]{64}$/;
const placeholderPattern = /REPLACE_WITH|^0{64}$/;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function relativeSafe(value) {
  if (!text(value) || path.isAbsolute(value)) return false;
  const normalized = path.normalize(value);
  return normalized !== ".." && !normalized.startsWith(`..${path.sep}`);
}

export function validatePortabilityResult(result, options = {}) {
  const allowPlaceholders = options.allowPlaceholders === true;
  const expectedSkillDigest = options.expectedSkillDigest;
  const findings = [];
  const add = (message) => findings.push(message);

  if (!isObject(result)) return ["result must be a JSON object"];
  if (result.schemaVersion !== 1) add("schemaVersion must equal 1");
  if (result.protocolId !== "doubt-agent-skills-portability-v1") {
    add("protocolId must equal doubt-agent-skills-portability-v1");
  }
  if (!text(result.submittedAt)) {
    add("submittedAt must be a non-empty UTC timestamp");
  } else if (!allowPlaceholders && Number.isNaN(Date.parse(result.submittedAt))) {
    add("submittedAt must be a valid timestamp");
  }

  if (!isObject(result.client)) {
    add("client must be an object");
  } else {
    if (!clients.has(result.client.id)) add("client.id is not a supported benchmark client");
    for (const field of ["version", "model", "installPath", "configuration"]) {
      if (!text(result.client[field])) add(`client.${field} must be non-empty`);
      if (!allowPlaceholders && placeholderPattern.test(result.client[field] || "")) {
        add(`client.${field} still contains a placeholder`);
      }
    }
  }

  if (!isObject(result.environment)) {
    add("environment must be an object");
  } else {
    for (const field of ["os", "permissionMode"]) {
      if (!text(result.environment[field])) add(`environment.${field} must be non-empty`);
      if (!allowPlaceholders && placeholderPattern.test(result.environment[field] || "")) {
        add(`environment.${field} still contains a placeholder`);
      }
    }
  }

  if (!receiptPattern.test(result.skillDigest || "")) {
    add("skillDigest must be a lowercase 64-character SHA-256 digest");
  } else if (!allowPlaceholders && placeholderPattern.test(result.skillDigest)) {
    add("skillDigest still contains a placeholder");
  } else if (expectedSkillDigest && result.skillDigest !== expectedSkillDigest) {
    add(`skillDigest does not match the canonical payload (${expectedSkillDigest})`);
  }
  if (result.behavioralEquivalenceClaimed !== false) {
    add("behavioralEquivalenceClaimed must be false for a single-client result");
  }

  if (!Array.isArray(result.runs) || result.runs.length !== 3) {
    add("runs must contain exactly three prompt results");
  } else {
    const promptIds = result.runs.map((run) => run?.promptId);
    if (new Set(promptIds).size !== 3 || expectedPromptIds.some((id) => !promptIds.includes(id))) {
      add("runs must contain direct, implicit, and negative exactly once");
    }
    for (const run of result.runs) {
      const prefix = `runs.${run?.promptId || "unknown"}`;
      if (!isObject(run)) {
        add("every run must be an object");
        continue;
      }
      if (!outcomes.has(run.outcome)) add(`${prefix}.outcome is invalid`);
      if (!allowPlaceholders && run.outcome === "not-run") {
        add(`${prefix}.outcome must be pass, fail, or blocked in a submitted result`);
      }
      if (!observations.has(run.discovery)) add(`${prefix}.discovery is invalid`);
      if (!observations.has(run.activation)) add(`${prefix}.activation is invalid`);
      if (!consentValues.has(run.consent)) add(`${prefix}.consent is invalid`);
      if (!Array.isArray(run.tools) || run.tools.some((item) => !text(item))) {
        add(`${prefix}.tools must be an array of non-empty strings`);
      }
      for (const field of ["artifactPath", "rawOutputPath"]) {
        if (run[field] !== null && !relativeSafe(run[field])) {
          add(`${prefix}.${field} must be null or a safe relative path`);
        }
      }
      if (run.evidenceReceipt !== null && !receiptPattern.test(run.evidenceReceipt || "")) {
        add(`${prefix}.evidenceReceipt must be null or a lowercase SHA-256 digest`);
      }
      if (!text(run.notes)) add(`${prefix}.notes must be non-empty`);
      if (!allowPlaceholders && placeholderPattern.test(run.notes || "")) {
        add(`${prefix}.notes still contains a placeholder`);
      }
      if (!allowPlaceholders && run.rawOutputPath === null) {
        add(`${prefix}.rawOutputPath is required for a submitted result`);
      }
      if (
        !allowPlaceholders
        && ["direct", "implicit"].includes(run.promptId)
        && run.outcome === "pass"
        && (run.artifactPath === null || run.evidenceReceipt === null)
      ) {
        add(`${prefix} pass requires artifactPath and evidenceReceipt`);
      }
      if (
        !allowPlaceholders
        && run.promptId === "negative"
        && run.outcome === "pass"
        && (run.activation !== "not-observed" || run.artifactPath !== null)
      ) {
        add("runs.negative pass requires no observed activation and no artifact");
      }
    }
  }

  return findings;
}

async function existingPathFinding(resultFile, relativePath, label) {
  if (relativePath === null) return null;
  const resolved = path.resolve(repoRoot, relativePath);
  if (!resolved.startsWith(`${repoRoot}${path.sep}`)) return `${label} escapes the repository`;
  try {
    await access(resolved);
    return null;
  } catch {
    return `${label} does not exist: ${relativePath}`;
  }
}

async function validatePassArtifact(run) {
  if (
    !["direct", "implicit"].includes(run.promptId)
    || run.outcome !== "pass"
    || run.artifactPath === null
  ) {
    return [];
  }

  const artifact = path.resolve(repoRoot, run.artifactPath);
  try {
    const report = inspectMap(JSON.parse(await readFile(artifact, "utf8")));
    if (!report.valid) {
      return [
        `${run.promptId}.artifactPath is not a valid Doubt evidence map `
        + `(${report.findings.length} findings)`,
      ];
    }
    if (report.receipt !== run.evidenceReceipt) {
      return [
        `${run.promptId}.evidenceReceipt does not match artifact receipt `
        + `(${report.receipt})`,
      ];
    }
    return [];
  } catch (error) {
    return [`${run.promptId}.artifactPath could not be verified: ${error.message}`];
  }
}

export async function validatePortabilityResultFile(file, expectedSkillDigest) {
  const result = JSON.parse(await readFile(file, "utf8"));
  const findings = validatePortabilityResult(result, { expectedSkillDigest });
  if (findings.length === 0) {
    for (const run of result.runs) {
      for (const field of ["artifactPath", "rawOutputPath"]) {
        const finding = await existingPathFinding(file, run[field], `${run.promptId}.${field}`);
        if (finding) findings.push(finding);
      }
    }
  }
  if (findings.length === 0) {
    for (const run of result.runs) {
      findings.push(...await validatePassArtifact(run));
    }
  }
  return findings;
}

async function main() {
  const { digest: expectedSkillDigest } = await buildSkillArchive();
  const example = JSON.parse(await readFile(path.join(benchmarkDir, "result.example.json"), "utf8"));
  const exampleFindings = validatePortabilityResult(example, { allowPlaceholders: true });
  if (exampleFindings.length > 0) {
    process.stderr.write(`Invalid result.example.json:\n- ${exampleFindings.join("\n- ")}\n`);
    process.exitCode = 1;
    return;
  }

  const requested = process.argv.slice(2);
  const files = requested.length > 0
    ? requested.map((file) => path.resolve(file))
    : (await readdir(resultsDir))
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(resultsDir, file));

  if (files.length === 0) {
    process.stdout.write(
      `0 submitted portability results; protocol and template are valid.\nCanonical skill digest: ${expectedSkillDigest}\n`,
    );
    return;
  }

  let failed = 0;
  for (const file of files) {
    try {
      const findings = await validatePortabilityResultFile(file, expectedSkillDigest);
      if (findings.length === 0) {
        process.stdout.write(`PASS ${path.relative(repoRoot, file)}\n`);
      } else {
        failed += 1;
        process.stderr.write(`FAIL ${path.relative(repoRoot, file)}\n- ${findings.join("\n- ")}\n`);
      }
    } catch (error) {
      failed += 1;
      process.stderr.write(`FAIL ${path.relative(repoRoot, file)}\n- ${error.message}\n`);
    }
  }
  process.stdout.write(`${files.length - failed}/${files.length} submitted portability results valid.\n`);
  process.stdout.write(`Canonical skill digest: ${expectedSkillDigest}\n`);
  if (failed > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
