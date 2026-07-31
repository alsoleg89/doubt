import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, mkdir, writeFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("demo emits a validated, self-contained evidence map", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "doubt-demo-"));
  const output = join(cwd, "demo.html");
  const result = spawnSync(process.execPath, ["bin/doubt.js", "demo", "--out", output, "--json"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.valid, true);
  assert.match(report.receipt, /^[a-f0-9]{64}$/);
  assert.match(await readFile(output, "utf8"), /Exact source region/);
});

test("help documents the one-command install", () => {
  const result = spawnSync(process.execPath, ["bin/doubt.js", "--help"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assert.match(result.stdout, /npx doubt-ai init --agent all/);
  assert.match(result.stdout, /doubt map <file\.json>/);
});

test("topical Agent Skills vs MCP map validates and renders", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "doubt-topical-"));
  const output = join(cwd, "agent-skills-vs-mcp.html");
  const result = spawnSync(
    process.execPath,
    [
      "bin/doubt.js",
      "map",
      "examples/agent-skills-vs-mcp.doubt.json",
      "--out",
      output,
      "--json",
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.valid, true);
  assert.deepEqual(report.metrics, {
    claims: 5,
    contradictions: 2,
    evidence: 5,
    sources: 5,
    unknowns: 1,
  });
  const html = await readFile(output, "utf8");
  assert.match(html, /Should an AI capability be an Agent Skill, an MCP server, or both\?/);
  assert.match(html, /Concepts → Layers, Transports, and Primitives/);
  assert.match(html, /0444afe44c523678f2ad8eb7267e0d7c7a392709921abf16474e68d2ef5a3991/);
});

test("validate command supports JSON output, exit codes, and paths with spaces", async () => {
  const baseTemp = await mkdtemp(join(tmpdir(), "doubt-validate-"));
  const spaceDir = join(baseTemp, "test spaces");
  await mkdir(spaceDir);

  const validMapPath = join(spaceDir, "valid.doubt.json");
  const invalidMapPath = join(spaceDir, "invalid.json");

  await copyFile("examples/agent-skills-vs-mcp.doubt.json", validMapPath);
  
  await writeFile(invalidMapPath, JSON.stringify({ title: "Just a title" }));

  const validResult = spawnSync(
    process.execPath,
    ["bin/doubt.js", "validate", validMapPath, "--format", "json"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(validResult.status, 0);
  const validReport = JSON.parse(validResult.stdout);
  assert.equal(validReport.valid, true);
  assert.ok(validReport.receipt);
  assert.ok(validReport.metrics);
  assert.deepEqual(validReport.findings, []);

  const invalidResult = spawnSync(
    process.execPath,
    ["bin/doubt.js", "validate", invalidMapPath, "--format", "json"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(invalidResult.status, 1);
  const invalidReport = JSON.parse(invalidResult.stdout);
  assert.equal(invalidReport.valid, false);
  assert.equal(invalidReport.receipt, null);
  assert.ok(invalidReport.findings.length > 0);

  const defaultResult = spawnSync(
    process.execPath,
    ["bin/doubt.js", "validate", invalidMapPath],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(defaultResult.status, 1);
  assert.match(defaultResult.stderr, /MapValidationError/);
});