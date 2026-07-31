# Changelog

## Unreleased

- Add a public five-client contribution queue that connects the Pages gallery,
  README, and contributor guide to scoped good-first benchmark issues.
- Add crawlable Pages discovery through canonical URLs, structured software
  metadata, a sitemap, robots policy, and an AI-readable project index.
- Notify IndexNow-compatible search engines after Pages deployments using a
  path-scoped public verification key and a sitemap-locked URL batch.
- Restrict Pages and IndexNow runs to files that can change the public site.
- Publish the verified v0.5.0 release tarball as the public `doubt-ai` package
  on npm, with a clean Registry install and CLI smoke test.

## 0.5.0 — Agent Skills portability benchmark

- Add a six-source portability map comparing the shared Agent Skills core with
  the discovery, invocation, consent, permission, metadata, and distribution
  differences across Claude Code, Codex, Copilot, Cursor, and Gemini CLI.
- Add a contribution-ready five-client portability benchmark with one frozen
  fixture, direct/implicit/negative prompts, a machine-readable result contract,
  and fail-closed validation for metadata, artifacts, receipts, and unsupported
  equivalence claims.

## 0.4.1 — Portable share links

- Add local-only playground share links that encode a valid map in the URL
  fragment, restore it in a fresh tab, and fall back to the address bar when
  clipboard access is unavailable.
- Keep `doubt --version` aligned with package metadata and cover the release
  contract with a regression test.

## 0.4.0 — Zero-install evidence playground

- Replace the internal dogfood headline in the repository visual with a
  product-first 1280×640 social card grounded in the Agent Skills vs MCP map.
- Add a zero-install, local-only browser playground that reuses the canonical
  evidence contract and renderer, with JSON/HTML downloads and no submission.
- Split the browser-safe contract from the Node receipt/file wrapper so CLI,
  Action, benchmark, and playground cannot silently diverge on invariants.
- Ship the 1280×640 product card through Pages Open Graph metadata and add a
  direct repository-star call to action on the two highest-traffic surfaces.

## 0.3.1 — Verified GitHub CLI install

- Add the `skills/doubt` remote-publisher layout required by `gh skill`, with
  clean preview/install coverage against the latest tagged release.

## 0.3.0 — Evidence maps readers can test

- Add a preregistered five-topic reader study comparing interactive evidence
  maps with hand-edited cited memos built from the same frozen sources.
- Add deterministic local condition assignment, answer shuffling, anonymous
  JSON export, and a fail-closed result analyzer with a ten-session stopping
  rule.
- Publish the self-contained reader study through GitHub Pages without
  analytics, telemetry, accounts, or network submission.
- Add a topical Agent Skills vs MCP evidence map grounded in the current
  official specifications, client documentation, discovery RFC, and MCP
  security guidance.
- Replace the Pages redirect with a public gallery for topical maps, the
  dogfood decision record, and the reader benchmark.
- Add a GitHub-native `.github/skills/doubt` distribution path for `gh skill`
  installation, with byte-for-byte CI enforcement against the canonical skill.

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
