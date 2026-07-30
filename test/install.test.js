import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { doctor, installSkill, targetFor } from "../src/install.js";

test("installs and validates the universal skill", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "doubt-test-"));
  const [installed] = await installSkill({ cwd });
  assert.equal(installed.status, "installed");

  const [healthy] = await doctor({ cwd });
  assert.equal(healthy.status, "healthy");

  await writeFile(join(targetFor("universal", { cwd }), "SKILL.md"), "tampered");
  const [modified] = await doctor({ cwd });
  assert.equal(modified.status, "modified");
});

test("does not overwrite an existing install without force", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "doubt-test-"));
  await installSkill({ cwd });
  const [again] = await installSkill({ cwd });
  assert.equal(again.status, "exists");
});

test("all uses the shared standard path plus Claude without duplicate copies", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "doubt-test-"));
  const results = await installSkill({ cwd, agents: "all" });
  assert.deepEqual(results.map((result) => result.name), ["universal", "claude"]);
  assert.equal(results.every((result) => result.status === "installed"), true);
});
