# Changelog

## Unreleased

- Add a preregistered five-topic reader study comparing interactive evidence
  maps with hand-edited cited memos built from the same frozen sources.
- Add deterministic local condition assignment, answer shuffling, anonymous
  JSON export, and a fail-closed result analyzer with a ten-session stopping
  rule.
- Publish the self-contained reader study through GitHub Pages without
  analytics, telemetry, accounts, or network submission.

## 0.2.1 — Discoverable Agent Skill

- Publish a deterministic, digest-pinned Agent Skill archive through the
  Agent Skills Discovery v0.2 well-known index.
- Verify archive structure, content integrity, and reproducible bytes in the
  test suite.

## 0.2.0 — Evidence maps

- Pivot Doubt from a prompt-only behavior layer to a source-grounded artifact.
- Add a typed JSON evidence contract for positions, claims, evidence, unknowns,
  and four reasoning relations.
- Add fail-closed validation for missing locators, unsourced or unused
  evidence, dangling edges, unsupported positions, false precision, and
  oversized source excerpts.
- Add content-addressed SHA-256 receipts.
- Add a self-contained interactive HTML renderer with visual edges, filters,
  edge focus, mobile layout, and exact source-region cards.
- Add the portable `$doubt` Agent Skill for Claude Code, Codex, Copilot,
  Cursor, Gemini CLI, and the open Agent Skills layout.
- Add a reusable GitHub Action that validates `*.doubt.json` maps and writes
  receipts and invariant failures to the job summary.
- Add a 12-case adversarial evidence-contract benchmark.
- Add the public dogfood map that records why this product direction was
  selected.

## 0.1.0 — Behavior probe

Initial anti-sycophancy skill and local heuristic prototype. The shipped
benchmark found no uplift over a strong frontier-model baseline, so this
position was retired instead of being marketed as successful.
