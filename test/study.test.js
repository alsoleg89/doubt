import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import {
  hash32,
  loadStudy,
  planFor,
  renderStudy,
  validateStudy,
} from "../benchmarks/map-vs-memo/study.mjs";
import {
  aggregateResults,
  QUESTION_IDS,
  validateResult,
} from "../benchmarks/map-vs-memo/analyze.mjs";

const configFile = path.resolve("benchmarks/map-vs-memo/topics.json");

test("reader study validates five paired topics and complete source coverage", async () => {
  const study = await loadStudy(configFile);
  assert.equal(study.topics.length, 5);
  assert.deepEqual(validateStudy(study), []);
  for (const topic of study.topics) {
    assert.equal(topic.questions.length, 5);
    assert.deepEqual(
      topic.questions.map((question) => question.id).sort(),
      [...QUESTION_IDS].sort(),
    );
  }
});

test("assignment is deterministic, shuffled, and balanced 2/3 per reader", async () => {
  const study = await loadStudy(configFile);
  const ids = study.topics.map((topic) => topic.id);
  const session = "0123456789abcdef0123456789abcdef";
  const first = planFor(session, ids);
  const second = planFor(session, ids);
  assert.deepEqual(first, second);
  assert.deepEqual(
    first.map((entry) => entry.topicId).sort(),
    [...ids].sort(),
  );
  assert.deepEqual(
    [...new Set(first.map((entry) => entry.condition))].sort(),
    ["map", "memo"],
  );
  const mapCount = first.filter((entry) => entry.condition === "map").length;
  assert.equal([2, 3].includes(mapCount), true);
  assert.equal(hash32("stable"), hash32("stable"));
});

test("rendered study is self-contained and discloses local-only collection", async () => {
  const study = await loadStudy(configFile);
  const html = renderStudy(study);
  assert.match(html, /Does the map beat the memo\?/);
  assert.match(html, /0<\/strong><span>network submits/);
  assert.match(html, /URL\.createObjectURL/);
  assert.match(html, /crypto\.getRandomValues/);
  assert.match(html, /same frozen sources/i);
  assert.doesNotMatch(html, /<script[^>]+src=/);
  assert.doesNotMatch(html, /\bfetch\s*\(/);
  assert.doesNotMatch(html, /XMLHttpRequest|sendBeacon/);
});

function resultFixture(index, mapWins = true) {
  const sessionId = index.toString(16).padStart(32, "0");
  const conditions = index % 2 === 0
    ? ["map", "memo", "map", "memo", "map"]
    : ["memo", "map", "memo", "map", "memo"];
  const responses = conditions.map((condition, topicIndex) => {
    const questionResults = QUESTION_IDS.map((id, questionIndex) => {
      const correct = condition === "map"
        ? true
        : !mapWins || !["contradiction", "unknown", "source"].includes(id);
      return { id, selected: correct ? 0 : 1, correct };
    });
    return {
      topicId: `topic-${topicIndex}`,
      condition,
      elapsedMs: condition === "map" ? 80000 : 90000,
      correct: questionResults.filter((item) => item.correct).length,
      total: questionResults.length,
      questionResults,
    };
  });
  return {
    schemaVersion: 1,
    studyId: "doubt-map-vs-memo-v1",
    protocolVersion: 1,
    sessionId,
    startedAt: "2026-07-31T00:00:00.000Z",
    completedAt: `2026-07-31T00:00:${String(index).padStart(2, "0")}.000Z`,
    complete: true,
    preference: "map",
    responses,
  };
}

test("result validator rejects an incomplete or imbalanced export", () => {
  const result = resultFixture(1);
  result.complete = false;
  result.responses = result.responses.slice(0, 4);
  const findings = validateResult(result);
  assert.equal(findings.some((finding) => finding.includes("incomplete")), true);
  assert.equal(findings.some((finding) => finding.includes("responses must contain")), true);
});

test("analyzer enforces the stopping rule and applies the preregistered decision", () => {
  assert.throws(
    () => aggregateResults(Array.from({ length: 9 }, (_, index) => resultFixture(index + 1))),
    /Stopping rule not met: 9\/10/,
  );
  const report = aggregateResults(
    Array.from({ length: 10 }, (_, index) => resultFixture(index + 1)),
  );
  assert.equal(report.stoppingRule.acceptedSessions, 10);
  assert.equal(report.primary.contradiction.mapMinusMemoPoints > 0, true);
  assert.equal(report.primary.unknown.mapMinusMemoPoints > 0, true);
  assert.equal(report.primary.source.mapMinusMemoPoints > 0, true);
  assert.match(report.decision, /^SUPPORTED:/);
  assert.equal(report.preference.map, 10);
});

test("analyzer does not call a tied primary result a win", () => {
  const report = aggregateResults(
    Array.from({ length: 10 }, (_, index) => resultFixture(index + 20, false)),
  );
  assert.equal(report.primary.source.mapMinusMemoPoints, 0);
  assert.match(report.decision, /^NOT SUPPORTED:/);
});
