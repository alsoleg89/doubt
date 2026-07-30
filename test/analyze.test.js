import assert from "node:assert/strict";
import test from "node:test";
import { analyze } from "../src/analyze.js";
import { after, before } from "../src/demo.js";

test("disciplined answer outscores sycophantic answer", () => {
  const weak = analyze(before);
  const strong = analyze(after);
  assert.ok(strong.score > weak.score);
  assert.ok(strong.score >= 85);
  assert.ok(weak.findings.some((finding) => finding.rule === "automatic-agreement"));
});

test("completion evidence prevents an unsupported-completion finding", () => {
  const result = analyze("Verified: `npm test` — 42 passed. All tests pass.");
  assert.equal(result.findings.some((finding) => finding.rule === "unsupported-completion"), false);
});

test("unsupported completion is penalized", () => {
  const result = analyze("The bug is fixed and the app is production-ready.");
  assert.equal(result.findings.filter((finding) => finding.rule === "unsupported-completion").length, 2);
});
