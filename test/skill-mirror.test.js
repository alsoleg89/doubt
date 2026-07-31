import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  compareSkillMirror,
  compareSkillMirrors,
  syncSkillMirror,
} from "../scripts/sync-github-skill.mjs";

test("keeps repository skill layouts byte-identical to the canonical payload", async () => {
  const result = await compareSkillMirrors();
  assert.equal(result.ok, true);
  assert.equal(result.files, 4);
  assert.equal(result.mirrors.length, 2);
  for (const mirror of result.mirrors) {
    assert.deepEqual(mirror.result, {
      ok: true,
      files: 4,
      missing: [],
      unexpected: [],
      changed: [],
    });
  }
});

test("detects drift and rebuilds a GitHub skill mirror", async () => {
  const root = await mkdtemp(join(tmpdir(), "doubt-skill-mirror-"));
  const source = join(root, "source");
  const target = join(root, "target");
  await Promise.all([
    mkdir(join(source, "references"), { recursive: true }),
    mkdir(target, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(join(source, "SKILL.md"), "canonical\n"),
    writeFile(join(source, "references", "schema.md"), "schema\n"),
    writeFile(join(target, "SKILL.md"), "changed\n"),
    writeFile(join(target, "unexpected.md"), "unexpected\n"),
  ]);

  assert.deepEqual(await compareSkillMirror({ source, target }), {
    ok: false,
    files: 2,
    missing: ["references/schema.md"],
    unexpected: ["unexpected.md"],
    changed: ["SKILL.md"],
  });
  assert.equal((await syncSkillMirror({ source, target })).ok, true);
});
