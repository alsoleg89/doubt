import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateMap } from "../src/map.js";
import { verifyMapSources } from "../src/verify.js";

function fixture(url = "./source.txt") {
  return {
    title: "Verified decision",
    question: "Does the recorded observation support shipping?",
    updatedAt: "2026-07-31",
    verdict: "Ship the observed behavior.",
    nodes: [
      {
        id: "position",
        type: "position",
        label: "Current position",
        text: "The observed behavior should ship.",
      },
      {
        id: "observation",
        type: "evidence",
        label: "Observed behavior",
        text: "The exact acceptance observation was reproduced.",
        sourceId: "run",
      },
    ],
    edges: [
      {
        from: "observation",
        to: "position",
        relation: "supports",
        note: "The reproduced acceptance observation directly tests the promised behavior.",
      },
    ],
    sources: [
      {
        id: "run",
        title: "Acceptance result",
        url,
        publisher: "Local test runner",
        date: "2026-07-30",
        retrievedAt: "2026-07-31",
        locator: "L2-L2",
        excerpt: "The focused acceptance suite completed with eighteen passing checks and zero failures.",
      },
    ],
  };
}

const now = () => new Date("2026-07-31T14:15:16.000Z");

test("verifies a local source, records byte digests, and changes the receipt", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "doubt-verify-"));
  const mapFile = join(cwd, "decision.doubt.json");
  await writeFile(
    join(cwd, "source.txt"),
    `Heading\n${fixture().sources[0].excerpt}\nTrailing context\n`,
  );
  const map = fixture();
  const before = validateMap(map).receipt;
  const result = await verifyMapSources(map, { mapFile, now });

  assert.equal(result.ok, true);
  assert.equal(result.results[0].status, "verified");
  assert.equal(result.results[0].locatorStatus, "matched");
  assert.match(result.map.sources[0].verification.contentSha256, /^[a-f0-9]{64}$/);
  assert.match(result.map.sources[0].verification.excerptSha256, /^[a-f0-9]{64}$/);
  assert.equal(result.map.sources[0].verification.checkedAt, "2026-07-31T14:15:16.000Z");
  assert.notEqual(result.receipt, before);
  assert.equal(validateMap(result.map).receipt, result.receipt);
});

test("fails closed when an excerpt is absent or outside its line locator", async () => {
  const map = fixture();
  const absent = await verifyMapSources(map, {
    mapFile: "/tmp/decision.doubt.json",
    now,
    loadSource: async () => ({
      bytes: Buffer.from("unrelated source material"),
      contentType: "text/plain",
      finalUrl: "/tmp/source.txt",
      text: "unrelated source material",
    }),
  });
  assert.equal(absent.ok, false);
  assert.equal(absent.map, null);
  assert.equal(absent.receipt, null);
  assert.equal(absent.results[0].status, "mismatch");

  const outside = await verifyMapSources(map, {
    mapFile: "/tmp/decision.doubt.json",
    now,
    loadSource: async () => ({
      bytes: Buffer.from(`${map.sources[0].excerpt}\nwrong line`),
      contentType: "text/plain",
      finalUrl: "/tmp/source.txt",
      text: `${map.sources[0].excerpt}\nwrong line`,
    }),
  });
  assert.equal(outside.ok, false);
  assert.match(outside.results[0].message, /not found in lines 2-2/);
});

test("matches normalized visible text in HTML only when network access is explicit", async () => {
  const map = fixture("http://127.0.0.1/source");
  map.sources[0].locator = "Section: Results";
  let calls = 0;
  const result = await verifyMapSources(map, {
    allowPrivate: true,
    fetchImpl: async () => {
      calls += 1;
      return new Response(
        `<html><style>hidden</style><body><h1>Results</h1><p>${map.sources[0].excerpt}</p></body></html>`,
        { headers: { "content-type": "text/html; charset=utf-8" } },
      );
    },
    mapFile: "/tmp/decision.doubt.json",
    now,
  });
  assert.equal(calls, 1);
  assert.equal(result.ok, true);
  assert.equal(result.results[0].locatorStatus, "not-machine-checked");
});

test("blocks private destinations and re-checks every redirect", async () => {
  const privateMap = fixture("http://127.0.0.1/source");
  let privateCalls = 0;
  const privateResult = await verifyMapSources(privateMap, {
    fetchImpl: async () => {
      privateCalls += 1;
      throw new Error("should not fetch");
    },
    mapFile: "/tmp/decision.doubt.json",
    now,
  });
  assert.equal(privateCalls, 0);
  assert.equal(privateResult.results[0].status, "unreachable");
  assert.match(privateResult.results[0].message, /--allow-private/);

  const redirectMap = fixture("http://93.184.216.34/source");
  let redirectCalls = 0;
  const redirectResult = await verifyMapSources(redirectMap, {
    fetchImpl: async () => {
      redirectCalls += 1;
      return new Response(null, {
        status: 302,
        headers: { location: "http://127.0.0.1/private" },
      });
    },
    mapFile: "/tmp/decision.doubt.json",
    now,
  });
  assert.equal(redirectCalls, 1);
  assert.equal(redirectResult.ok, false);
  assert.match(redirectResult.results[0].message, /--allow-private/);
});

test("CLI writes only a fully verified map and reports mismatches with exit 1", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "doubt-verify-cli-"));
  const mapFile = join(cwd, "decision.doubt.json");
  const sourceFile = join(cwd, "source.txt");
  const outputFile = join(cwd, "verified.doubt.json");
  const map = fixture();
  map.updatedAt = "2026-07-31";
  map.sources[0].date = "2020-01-01";
  map.sources[0].retrievedAt = "2020-01-01";
  await writeFile(mapFile, `${JSON.stringify(map, null, 2)}\n`);
  await writeFile(sourceFile, `Heading\n${map.sources[0].excerpt}\n`);

  const success = spawnSync(
    process.execPath,
    ["bin/doubt.js", "verify", mapFile, "--out", outputFile, "--json"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(success.status, 0, success.stderr);
  const report = JSON.parse(success.stdout);
  assert.equal(report.ok, true);
  assert.equal(report.output, outputFile);
  assert.equal(validateMap(JSON.parse(await readFile(outputFile, "utf8"))).valid, true);

  map.sources[0].excerpt = "This different but substantive excerpt does not exist in the local source material.";
  await writeFile(mapFile, `${JSON.stringify(map, null, 2)}\n`);
  const failedOutput = join(cwd, "must-not-exist.json");
  const failure = spawnSync(
    process.execPath,
    ["bin/doubt.js", "verify", mapFile, "--out", failedOutput, "--json"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(failure.status, 1);
  assert.equal(JSON.parse(failure.stdout).ok, false);
  await assert.rejects(access(failedOutput), { code: "ENOENT" });
});
