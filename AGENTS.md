# Contributor guide

## Scope

Doubt is a zero-dependency Node.js CLI plus a portable Agent Skills package. Keep the core small,
local-first, and provider-independent.

## Commands

- `npm test` — run the Node test suite.
- `npm run lint` — syntax-check executable source files.
- `npm run check` — run all release checks.
- `node bin/doubt.js demo` — inspect the public before/after demo.

## Design constraints

- Support Node.js 18 and later with built-in modules only.
- Never execute installed skill content.
- Never send user text, repository content, or telemetry over the network.
- Treat `skill/doubt/` as the canonical install payload.
- Add a test for every analyzer rule or platform-path change.
- Prefer a specific evidence requirement over generic “be careful” language.
