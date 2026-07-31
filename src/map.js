import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  MapValidationError,
  canonicalJson,
  inspectMapContract,
  receiptPayload,
} from "./contract.js";

export {
  MapValidationError,
  NODE_TYPES,
  RELATIONS,
  canonicalJson,
  inspectMapContract,
  receiptPayload,
  validateMapContract,
} from "./contract.js";

function receiptFor(map) {
  const sourceSnapshots = map.sources.map((source) => ({
    id: source.id,
    retrievedAt: source.retrievedAt,
    excerptSha256: createHash("sha256").update(source.excerpt).digest("hex"),
  }));
  const payload = receiptPayload(map, sourceSnapshots);
  return createHash("sha256").update(canonicalJson(payload)).digest("hex");
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

export function inspectMap(map) {
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

export function validateMap(map) {
  const result = inspectMap(map);
  if (!result.valid) throw new MapValidationError(result.findings);
  return result;
}

export async function loadMap(file) {
  const raw = await readFile(file, "utf8");
  let map;
  try {
    map = JSON.parse(raw);
  } catch (error) {
    throw new MapValidationError([
      {
        path: "$",
        rule: "invalid-json",
        message: `Could not parse JSON: ${error.message}`,
      },
    ]);
  }
  return { map, validation: validateMap(map) };
}
