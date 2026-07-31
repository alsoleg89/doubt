export const NODE_TYPES = new Set(["position", "claim", "evidence", "unknown"]);
export const RELATIONS = new Set(["supports", "contradicts", "qualifies", "missing"]);

export class MapValidationError extends Error {
  constructor(findings) {
    super(`Evidence map is invalid (${findings.length} ${findings.length === 1 ? "finding" : "findings"}).`);
    this.name = "MapValidationError";
    this.findings = findings;
  }
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonical(value[key])]),
  );
}

export function canonicalJson(map) {
  return JSON.stringify(canonical(map));
}

function finding(path, rule, message) {
  return { path, rule, message };
}

export function inspectMapContract(map) {
  const findings = [];
  if (!map || typeof map !== "object" || Array.isArray(map)) {
    return {
      findings: [finding("$", "map-type", "The map must be a JSON object.")],
      metrics: { claims: 0, contradictions: 0, evidence: 0, sources: 0, unknowns: 0 },
      receipt: null,
      valid: false,
    };
  }

  for (const key of ["title", "question", "verdict", "updatedAt"]) {
    if (!map[key] || typeof map[key] !== "string") {
      findings.push(finding(`$.${key}`, "required-field", `${key} must be a non-empty string.`));
    }
  }
  if (!Array.isArray(map.nodes) || map.nodes.length === 0) {
    findings.push(finding("$.nodes", "required-nodes", "nodes must be a non-empty array."));
  }
  if (!Array.isArray(map.edges)) {
    findings.push(finding("$.edges", "required-edges", "edges must be an array."));
  }
  if (!Array.isArray(map.sources)) {
    findings.push(finding("$.sources", "required-sources", "sources must be an array."));
  }

  const nodes = Array.isArray(map.nodes) ? map.nodes : [];
  const edges = Array.isArray(map.edges) ? map.edges : [];
  const sources = Array.isArray(map.sources) ? map.sources : [];
  const nodeIds = new Set();
  const sourceIds = new Set();

  for (const [index, node] of nodes.entries()) {
    const base = `$.nodes[${index}]`;
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      findings.push(finding(base, "node-type", "Each node must be an object."));
      continue;
    }
    if (!node.id || typeof node.id !== "string") {
      findings.push(finding(`${base}.id`, "node-id", "Each node needs a string id."));
    } else if (nodeIds.has(node.id)) {
      findings.push(finding(`${base}.id`, "duplicate-node", `Duplicate node id: ${node.id}.`));
    } else {
      nodeIds.add(node.id);
    }
    if (!NODE_TYPES.has(node.type)) {
      findings.push(
        finding(
          `${base}.type`,
          "node-type",
          `Node type must be one of: ${[...NODE_TYPES].join(", ")}.`,
        ),
      );
    }
    for (const key of ["label", "text"]) {
      if (!node[key] || typeof node[key] !== "string") {
        findings.push(finding(`${base}.${key}`, "node-copy", `${key} must be a non-empty string.`));
      }
    }
    if (node.confidence != null) {
      findings.push(
        finding(
          `${base}.confidence`,
          "false-precision",
          "Remove confidence percentages unless the map documents a reproducible calibration method.",
        ),
      );
    }
  }

  for (const [index, source] of sources.entries()) {
    const base = `$.sources[${index}]`;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      findings.push(finding(base, "source-type", "Each source must be an object."));
      continue;
    }
    if (!source.id || typeof source.id !== "string") {
      findings.push(finding(`${base}.id`, "source-id", "Each source needs a string id."));
    } else if (sourceIds.has(source.id)) {
      findings.push(finding(`${base}.id`, "duplicate-source", `Duplicate source id: ${source.id}.`));
    } else {
      sourceIds.add(source.id);
    }
    for (const key of ["title", "publisher", "date", "url", "locator", "excerpt"]) {
      if (!source[key] || typeof source[key] !== "string") {
        findings.push(
          finding(`${base}.${key}`, "source-field", `${key} must be a non-empty string.`),
        );
      }
    }
    if (
      typeof source.url === "string" &&
      !/^(https?:\/\/|\.\.?\/)/.test(source.url)
    ) {
      findings.push(
        finding(`${base}.url`, "source-url", "Source URL must be http(s) or a relative path."),
      );
    }
    if (typeof source.excerpt === "string" && source.excerpt.trim().length < 40) {
      findings.push(
        finding(
          `${base}.excerpt`,
          "thin-excerpt",
          "Source excerpt must contain at least 40 characters of checkable context.",
        ),
      );
    }
    if (typeof source.excerpt === "string" && source.excerpt.trim().length > 500) {
      findings.push(
        finding(
          `${base}.excerpt`,
          "oversized-excerpt",
          "Keep source excerpts under 500 characters and link to the full source.",
        ),
      );
    }
  }

  const incoming = new Map(nodes.filter((node) => node?.id).map((node) => [node.id, 0]));
  for (const [index, edge] of edges.entries()) {
    const base = `$.edges[${index}]`;
    if (!edge || typeof edge !== "object" || Array.isArray(edge)) {
      findings.push(finding(base, "edge-type", "Each edge must be an object."));
      continue;
    }
    if (!nodeIds.has(edge.from)) {
      findings.push(finding(`${base}.from`, "unknown-node", `Unknown from node: ${edge.from}.`));
    }
    if (!nodeIds.has(edge.to)) {
      findings.push(finding(`${base}.to`, "unknown-node", `Unknown to node: ${edge.to}.`));
    }
    if (edge.from && edge.from === edge.to) {
      findings.push(finding(base, "self-edge", `Node ${edge.from} cannot point to itself.`));
    }
    if (!RELATIONS.has(edge.relation)) {
      findings.push(
        finding(
          `${base}.relation`,
          "edge-relation",
          `Relation must be one of: ${[...RELATIONS].join(", ")}.`,
        ),
      );
    }
    if (!edge.note || typeof edge.note !== "string") {
      findings.push(
        finding(`${base}.note`, "edge-note", "Each reasoning edge needs a plain-language note."),
      );
    }
    if (nodeIds.has(edge.to)) incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
  }

  for (const [index, node] of nodes.entries()) {
    if (!node || typeof node !== "object") continue;
    const base = `$.nodes[${index}]`;
    if (node.type === "evidence" && !node.sourceId) {
      findings.push(
        finding(`${base}.sourceId`, "unsourced-evidence", "Evidence nodes require sourceId."),
      );
    }
    if (node.sourceId && !sourceIds.has(node.sourceId)) {
      findings.push(
        finding(
          `${base}.sourceId`,
          "unknown-source",
          `Node references unknown source: ${node.sourceId}.`,
        ),
      );
    }
    if (
      node.type === "evidence" &&
      node.id &&
      !edges.some((edge) => edge?.from === node.id)
    ) {
      findings.push(
        finding(base, "unused-evidence", "Evidence must participate in at least one reasoning edge."),
      );
    }
  }

  for (const [index, source] of sources.entries()) {
    if (
      source?.id &&
      !nodes.some((node) => node?.type === "evidence" && node.sourceId === source.id)
    ) {
      findings.push(
        finding(
          `$.sources[${index}]`,
          "unused-source",
          "Every source must be attached to at least one evidence node.",
        ),
      );
    }
  }

  const positions = nodes.filter((node) => node?.type === "position");
  if (positions.length !== 1) {
    findings.push(
      finding("$.nodes", "position-count", "The map must contain exactly one position node."),
    );
  } else if (!incoming.get(positions[0].id)) {
    findings.push(
      finding(
        `$.nodes[${nodes.indexOf(positions[0])}]`,
        "unsupported-position",
        "The position needs at least one incoming reasoning edge.",
      ),
    );
  }

  const metrics = {
    claims: nodes.filter((node) => node?.type === "claim" || node?.type === "position").length,
    contradictions: edges.filter((edge) => edge?.relation === "contradicts").length,
    evidence: nodes.filter((node) => node?.type === "evidence").length,
    sources: sources.length,
    unknowns: nodes.filter((node) => node?.type === "unknown").length,
  };
  return {
    findings,
    metrics,
    receipt: null,
    valid: findings.length === 0,
  };
}

export function validateMapContract(map) {
  const result = inspectMapContract(map);
  if (!result.valid) throw new MapValidationError(result.findings);
  return result;
}
