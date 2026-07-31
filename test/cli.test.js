import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
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
  const html = await readFile(output, "utf8");
  assert.match(html, /Exact source region/);
  assert.match(html, /Should an AI capability be an Agent Skill, an MCP server, or both\?/);
  assert.match(html, /Linear reasoning brief/);
});

test("help documents the one-command install", () => {
  const result = spawnSync(process.execPath, ["bin/doubt.js", "--help"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assert.match(result.stdout, /npx doubt-ai init --agent all/);
  assert.match(result.stdout, /doubt map <file\.json>/);
  assert.match(result.stdout, /doubt verify <file\.json>/);
});

test("version stays aligned with package metadata", async () => {
  const result = spawnSync(process.execPath, ["bin/doubt.js", "--version"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), packageJson.version);
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
    claims: 4,
    contradictions: 2,
    evidence: 5,
    sources: 5,
    unknowns: 1,
  });
  const html = await readFile(output, "utf8");
  assert.match(html, /Should an AI capability be an Agent Skill, an MCP server, or both\?/);
  assert.match(html, /Concepts → Layers, Transports, and Primitives/);
  assert.match(report.receipt, /^[a-f0-9]{64}$/);
  assert.match(html, new RegExp(report.receipt));
});

test("Agent Skills portability map validates and preserves the remaining client gap", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "doubt-portability-"));
  const output = join(cwd, "agent-skills-portability.html");
  const result = spawnSync(
    process.execPath,
    [
      "bin/doubt.js",
      "map",
      "examples/agent-skills-portability.doubt.json",
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
    claims: 4,
    contradictions: 1,
    evidence: 7,
    sources: 7,
    unknowns: 1,
  });
  assert.match(report.receipt, /^[a-f0-9]{64}$/);
  const html = await readFile(output, "utf8");
  assert.match(html, /Are Agent Skills actually portable\?/);
  assert.match(html, /Portable enough to author once, not portable enough to test once/);
  assert.match(html, /Copilot run: 2\/3/);
  assert.match(html, /Four clients missing/);
  assert.match(html, new RegExp(report.receipt));
});
