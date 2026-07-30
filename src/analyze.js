const rules = [
  {
    id: "automatic-agreement",
    severity: "high",
    penalty: 18,
    pattern: /\b(you(?:'re| are) (?:absolutely|completely|totally) right|exactly[!.]|great point[!.]|i couldn't agree more)\b/i,
    message: "Opens with automatic agreement instead of testing the premise.",
  },
  {
    id: "absolute-certainty",
    severity: "medium",
    penalty: 8,
    pattern: /\b(always|never|guaranteed|definitely|undoubtedly|proves? that|100% certain)\b/i,
    message: "Uses absolute certainty; make the evidence or boundary explicit.",
  },
  {
    id: "unsupported-completion",
    severity: "high",
    penalty: 20,
    pattern: /\b(all tests pass|tests are passing|fully implemented|production[- ]ready|deployed successfully|bug is fixed)\b/i,
    requiresEvidence: true,
    message: "Makes a completion claim without nearby machine-produced evidence.",
  },
  {
    id: "vague-hedging",
    severity: "low",
    penalty: 4,
    pattern: /\b(maybe|perhaps|probably|it seems|likely)\b/i,
    message: "Uses a hedge without naming the missing fact or assumption.",
  },
];

const evidencePattern = /(`[^`\n]+`|https?:\/\/|exit (?:code )?0|\b\d+ (?:passed|tests? passed)\b|observed:|verified:|according to|source:)/i;
const calibrationPattern = /\b(i don't know|unknown|not verified|assumption|inferred|would change|insufficient evidence|uncertain because|limitation)\b/i;
const progressPattern = /\b(i'll proceed|proceeding|recommend|next step|given that|under this assumption)\b/i;

function lineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

export function analyze(text) {
  const findings = [];
  let score = 76;

  for (const rule of rules) {
    for (const match of text.matchAll(new RegExp(rule.pattern.source, `${rule.pattern.flags}g`))) {
      const nearby = text.slice(Math.max(0, match.index - 160), match.index + match[0].length + 220);
      if (rule.requiresEvidence && evidencePattern.test(nearby)) continue;
      if (rule.id === "vague-hedging" && /\b(because|due to|until|unless|if)\b/i.test(nearby)) continue;
      findings.push({
        rule: rule.id,
        severity: rule.severity,
        line: lineNumber(text, match.index),
        excerpt: match[0],
        message: rule.message,
      });
      score -= rule.penalty;
    }
  }

  const strengths = [];
  if (evidencePattern.test(text)) {
    score += 9;
    strengths.push("Uses inspectable evidence or a source.");
  }
  if (calibrationPattern.test(text)) {
    score += 9;
    strengths.push("Names an assumption, limitation, or unverified claim.");
  }
  if (progressPattern.test(text)) {
    score += 6;
    strengths.push("Keeps moving despite uncertainty.");
  }

  score = Math.max(0, Math.min(100, score));
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 55 ? "D" : "F";
  return {
    score,
    grade,
    findings,
    strengths,
    summary: findings.length
      ? `${findings.length} epistemic smell${findings.length === 1 ? "" : "s"} found.`
      : "No obvious epistemic smells found.",
  };
}
