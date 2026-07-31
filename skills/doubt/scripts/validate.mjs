#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonicalJson,
  inspectMapContract,
  receiptPayload,
} from "./contract.mjs";

function receiptFor(map) {
  const sourceSnapshots = map.sources.map((source) => ({
    id: source.id,
    retrievedAt: source.retrievedAt,
    excerptSha256: createHash("sha256").update(source.excerpt).digest("hex"),
  }));
  return createHash("sha256")
    .update(canonicalJson(receiptPayload(map, sourceSnapshots)))
    .digest("hex");
}

function verificationExcerptFindings(map) {
  const findings = [];
  for (const [index, source] of (map?.sources || []).entries()) {
    const recorded = source?.verification?.excerptSha256;
    if (
      typeof source?.excerpt === "string"
      && /^[a-f0-9]{64}$/.test(recorded || "")
      && recorded !== createHash("sha256").update(source.excerpt).digest("hex")
    ) {
      findings.push({
        path: `$.sources[${index}].verification.excerptSha256`,
        rule: "verification-excerpt-mismatch",
        message: "excerptSha256 must match the current source excerpt.",
      });
    }
  }
  return findings;
}

export function inspectOfflineMap(map) {
  const result = inspectMapContract(map);
  const findings = [...result.findings, ...verificationExcerptFindings(map)];
  const valid = findings.length === 0;
  return {
    ...result,
    findings,
    valid,
    receipt: valid ? receiptFor(map) : null,
  };
}

export async function validateMapFile(file) {
  let map;
  try {
    const input = file instanceof URL ? file : resolve(file);
    map = JSON.parse(await readFile(input, "utf8"));
  } catch (error) {
    return {
      findings: [{
        path: "$",
        rule: "invalid-json",
        message: `Could not parse JSON: ${error.message}`,
      }],
      metrics: { claims: 0, contradictions: 0, evidence: 0, sources: 0, unknowns: 0 },
      receipt: null,
      valid: false,
    };
  }
  return inspectOfflineMap(map);
}

function plural(count, singular, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}

function printHuman(result) {
  if (!result.valid) {
    console.error(`INVALID ${result.findings.length} ${plural(result.findings.length, "finding")}`);
    for (const finding of result.findings) {
      console.error(`  - ${finding.path} [${finding.rule}] ${finding.message}`);
    }
    return;
  }
  console.log(`VALID ${result.receipt}`);
  console.log(
    `  ✓ ${result.metrics.claims} ${plural(result.metrics.claims, "claim")} · ${result.metrics.evidence} evidence · ${result.metrics.sources} ${plural(result.metrics.sources, "source")}`,
  );
  console.log(
    `  ↯ ${result.metrics.contradictions} ${plural(result.metrics.contradictions, "contradiction")} · ${result.metrics.unknowns} explicit ${plural(result.metrics.unknowns, "unknown")}`,
  );
}

async function main(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log("Usage: node <skill-dir>/scripts/validate.mjs <map.doubt.json> [--json]");
    return;
  }
  const file = argv.find((value) => !value.startsWith("-"));
  if (!file) throw new Error("Pass a .doubt.json evidence map.");
  const result = await validateMapFile(file);
  if (argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
  if (!result.valid) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
