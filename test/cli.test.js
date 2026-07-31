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

test("Agent Skills portability map validates and preserves its missing benchmark", async () => {
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
    claims: 5,
    contradictions: 1,
    evidence: 6,
    sources: 6,
    unknowns: 1,
  });
  assert.equal(
    report.receipt,
    "89f18aa3a3b2b9136096f772b3a884b89f2529e9dae31f4aab721ed190fc4908",
  );
  const html = await readFile(output, "utf8");
  assert.match(html, /Are Agent Skills actually portable\?/);
  assert.match(html, /Portable enough to author once, not portable enough to test once/);
  assert.match(html, /No committed public suite yet/);
});
