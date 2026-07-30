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
