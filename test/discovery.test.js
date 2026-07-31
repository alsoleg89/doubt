import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import test from "node:test";
import { buildSkillDiscovery } from "../scripts/build-skill-discovery.mjs";

function tarPaths(buffer) {
  const paths = [];
  for (let offset = 0; offset + 512 <= buffer.length;) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = header
      .subarray(0, 100)
      .toString("utf8")
      .replace(/\0.*$/, "");
    const size = Number.parseInt(
      header.subarray(124, 136).toString("ascii").replace(/\0.*$/, "").trim(),
      8,
    );
    paths.push(name);
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return paths;
}

test("builds a v0.2 discovery index with a verified root-level archive", async () => {
  const output = await mkdtemp(join(tmpdir(), "doubt-discovery-"));
  const first = await buildSkillDiscovery(output);
  const archive = await readFile(first.archivePath);
  const index = JSON.parse(await readFile(first.indexPath, "utf8"));
  const digest = createHash("sha256").update(archive).digest("hex");

  assert.equal(
    index.$schema,
    "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  );
  assert.deepEqual(index.skills.map((skill) => skill.name), ["doubt"]);
  assert.equal(index.skills[0].type, "archive");
  assert.equal(index.skills[0].digest, `sha256:${digest}`);
  assert.equal(index.skills[0].url, "/doubt/.well-known/agent-skills/doubt.tar.gz");
  assert.deepEqual(tarPaths(gunzipSync(archive)), [
    "agents/openai.yaml",
    "references/evidence-ladder.md",
    "references/map-schema.md",
    "scripts/contract.mjs",
    "scripts/validate.mjs",
    "SKILL.md",
  ]);
});

test("produces byte-identical archives for the same skill", async () => {
  const firstOutput = await mkdtemp(join(tmpdir(), "doubt-discovery-a-"));
  const secondOutput = await mkdtemp(join(tmpdir(), "doubt-discovery-b-"));
  const first = await buildSkillDiscovery(firstOutput);
  const second = await buildSkillDiscovery(secondOutput);

  assert.deepEqual(
    await readFile(first.archivePath),
    await readFile(second.archivePath),
  );
});
