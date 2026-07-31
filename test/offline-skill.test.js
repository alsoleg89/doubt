import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { inspectMap } from "../src/map.js";
import {
  inspectOfflineMap,
  validateMapFile,
} from "../skill/doubt/scripts/validate.mjs";

const execFileAsync = promisify(execFile);
const fixture = new URL("../examples/agent-skills-vs-mcp.doubt.json", import.meta.url);
const validator = new URL("../skill/doubt/scripts/validate.mjs", import.meta.url);

test("offline skill validator produces the package receipt", async () => {
  const map = JSON.parse(await readFile(fixture, "utf8"));
  assert.deepEqual(inspectOfflineMap(map), inspectMap(map));
  assert.deepEqual(await validateMapFile(fixture), inspectMap(map));
});

test("offline skill validator runs without npm or network", async () => {
  const expected = inspectMap(JSON.parse(await readFile(fixture, "utf8")));
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    [fileURLToPath(validator), fileURLToPath(fixture), "--json"],
    { env: { PATH: "" } },
  );
  assert.equal(stderr, "");
  assert.deepEqual(JSON.parse(stdout), expected);
});
