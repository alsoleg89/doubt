import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const STUDY_ID = "doubt-map-vs-memo-v1";
export const PROTOCOL_VERSION = 1;
export const TOPIC_COUNT = 5;
export const QUESTION_IDS = ["position", "contradiction", "qualification", "unknown", "source"];
export const MINIMUM_SESSIONS = 10;

function finiteNonnegative(value) {
  return Number.isFinite(value) && value >= 0;
}

export function validateResult(result) {
  const findings = [];
  if (result?.schemaVersion !== 1) findings.push("schemaVersion must be 1");
  if (result?.studyId !== STUDY_ID) findings.push(`studyId must be ${STUDY_ID}`);
  if (result?.protocolVersion !== PROTOCOL_VERSION) {
    findings.push(`protocolVersion must be ${PROTOCOL_VERSION}`);
  }
  if (!/^[a-f0-9]{32}$/.test(result?.sessionId || "")) findings.push("sessionId is invalid");
  if (result?.complete !== true) findings.push("result is incomplete");
  if (!Array.isArray(result?.responses) || result.responses.length !== TOPIC_COUNT) {
    findings.push(`responses must contain ${TOPIC_COUNT} topics`);
  }
  if (result?.preference != null && !["map", "memo", "neither"].includes(result.preference)) {
    findings.push("preference is invalid");
  }

  const topics = new Set();
  let mapCount = 0;
  let memoCount = 0;
  for (const [index, response] of (result?.responses || []).entries()) {
    const base = `responses[${index}]`;
    if (!response.topicId || typeof response.topicId !== "string") {
      findings.push(`${base}.topicId is required`);
    } else if (topics.has(response.topicId)) {
      findings.push(`${base}.topicId is duplicated`);
    } else {
      topics.add(response.topicId);
    }
    if (!["map", "memo"].includes(response.condition)) {
      findings.push(`${base}.condition is invalid`);
    } else if (response.condition === "map") mapCount += 1;
    else memoCount += 1;
    if (!finiteNonnegative(response.elapsedMs)) findings.push(`${base}.elapsedMs is invalid`);
    if (!Array.isArray(response.questionResults) || response.questionResults.length !== QUESTION_IDS.length) {
      findings.push(`${base}.questionResults must contain ${QUESTION_IDS.length} tasks`);
      continue;
    }
    const questionIds = response.questionResults.map((item) => item.id);
    for (const id of QUESTION_IDS) {
      if (!questionIds.includes(id)) findings.push(`${base}.questionResults is missing ${id}`);
    }
    for (const [questionIndex, item] of response.questionResults.entries()) {
      if (!Number.isInteger(item.selected) || item.selected < 0) {
        findings.push(`${base}.questionResults[${questionIndex}].selected is invalid`);
      }
      if (typeof item.correct !== "boolean") {
        findings.push(`${base}.questionResults[${questionIndex}].correct is invalid`);
      }
    }
    const correct = response.questionResults.filter((item) => item.correct).length;
    if (response.correct !== correct || response.total !== QUESTION_IDS.length) {
      findings.push(`${base} summary does not match questionResults`);
    }
  }
  if (![2, 3].includes(mapCount) || ![2, 3].includes(memoCount) || mapCount + memoCount !== 5) {
    findings.push("condition assignment must contain a 2/3 split");
  }
  return findings;
}

function median(values) {
  if (!values.length) return null;
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2
    ? ordered[middle]
    : Math.round((ordered[middle - 1] + ordered[middle]) / 2);
}

function percentage(correct, attempted) {
  return attempted ? Number(((correct / attempted) * 100).toFixed(1)) : null;
}

export function aggregateResults(inputResults) {
  const bySession = new Map();
  const ordered = [...inputResults].sort((left, right) =>
    String(left.completedAt || "").localeCompare(String(right.completedAt || "")),
  );
  const rejected = [];
  for (const result of ordered) {
    const findings = validateResult(result);
    if (findings.length) {
      rejected.push({ sessionId: result?.sessionId || null, findings });
      continue;
    }
    if (bySession.has(result.sessionId)) {
      rejected.push({ sessionId: result.sessionId, findings: ["duplicate session id"] });
      continue;
    }
    bySession.set(result.sessionId, result);
  }
  const accepted = [...bySession.values()];
  if (accepted.length < MINIMUM_SESSIONS) {
    throw new Error(
      `Stopping rule not met: ${accepted.length}/${MINIMUM_SESSIONS} complete unique sessions. ` +
        "Do not inspect condition-level results yet.",
    );
  }

  const conditions = Object.fromEntries(
    ["map", "memo"].map((condition) => [
      condition,
      {
        sessions: new Set(),
        exposures: 0,
        correct: 0,
        attempted: 0,
        elapsedMs: [],
        questions: Object.fromEntries(
          QUESTION_IDS.map((id) => [id, { correct: 0, attempted: 0, accuracy: null }]),
        ),
      },
    ]),
  );
  for (const result of accepted) {
    for (const response of result.responses) {
      const summary = conditions[response.condition];
      summary.sessions.add(result.sessionId);
      summary.exposures += 1;
      summary.correct += response.correct;
      summary.attempted += response.total;
      summary.elapsedMs.push(response.elapsedMs);
      for (const question of response.questionResults) {
        summary.questions[question.id].attempted += 1;
        if (question.correct) summary.questions[question.id].correct += 1;
      }
    }
  }

  const serializableConditions = {};
  for (const [condition, summary] of Object.entries(conditions)) {
    for (const question of Object.values(summary.questions)) {
      question.accuracy = percentage(question.correct, question.attempted);
    }
    serializableConditions[condition] = {
      sessions: summary.sessions.size,
      exposures: summary.exposures,
      correct: summary.correct,
      attempted: summary.attempted,
      accuracy: percentage(summary.correct, summary.attempted),
      medianTopicMs: median(summary.elapsedMs),
      questions: summary.questions,
    };
  }

  const primary = Object.fromEntries(
    ["contradiction", "unknown", "source"].map((id) => [
      id,
      {
        mapAccuracy: serializableConditions.map.questions[id].accuracy,
        memoAccuracy: serializableConditions.memo.questions[id].accuracy,
        mapMinusMemoPoints: Number(
          (
            serializableConditions.map.questions[id].accuracy -
            serializableConditions.memo.questions[id].accuracy
          ).toFixed(1),
        ),
      },
    ]),
  );
  const preference = { map: 0, memo: 0, neither: 0, unanswered: 0 };
  for (const result of accepted) {
    if (result.preference == null) preference.unanswered += 1;
    else preference[result.preference] += 1;
  }
  const hypothesisSupported = Object.values(primary).every(
    (outcome) => outcome.mapMinusMemoPoints > 0,
  );

  return {
    schemaVersion: 1,
    studyId: STUDY_ID,
    protocolVersion: PROTOCOL_VERSION,
    generatedAt: new Date().toISOString(),
    stoppingRule: {
      minimumSessions: MINIMUM_SESSIONS,
      acceptedSessions: accepted.length,
      met: true,
    },
    rejected,
    conditions: serializableConditions,
    primary,
    preference,
    decision: hypothesisSupported
      ? "SUPPORTED: all three preregistered primary outcomes favor the map."
      : "NOT SUPPORTED: at least one preregistered primary outcome is tied or favors the memo.",
    caveat:
      "Small self-selected product study. Report topic and reader counts with every percentage.",
  };
}

async function main() {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf("--out");
  const output = outputIndex >= 0 ? args[outputIndex + 1] : null;
  const files = args.filter((value, index) => value !== "--out" && index !== outputIndex + 1);
  if (!files.length) {
    throw new Error("Pass at least ten exported reader-result JSON files.");
  }
  const results = await Promise.all(
    files.map(async (file) => JSON.parse(await readFile(path.resolve(file), "utf8"))),
  );
  const report = aggregateResults(results);
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (output) await writeFile(path.resolve(output), serialized);
  process.stdout.write(serialized);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
