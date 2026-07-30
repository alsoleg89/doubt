import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("demo exposes a measurable before/after", () => {
  const result = spawnSync(process.execPath, ["bin/doubt.js", "demo", "--json"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout);
  assert.ok(output.after.score > output.before.score);
});

test("help documents the one-command install", () => {
  const result = spawnSync(process.execPath, ["bin/doubt.js", "--help"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assert.match(result.stdout, /npx doubt-ai init --agent all/);
});
