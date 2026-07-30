# Contributor guide

## Scope

Doubt is a zero-dependency Node.js CLI plus a portable Agent Skill. Keep the
core local-first, provider-independent, and fail-closed on source traceability.

## Commands

- `npm test` — run the Node test suite.
- `npm run lint` — syntax-check executable source files.
- `npm run check` — run all release checks.
- `npm run demo` — render the public dogfood evidence map.
- `node bin/doubt.js validate examples/what-should-doubt-become.json` — inspect
  the canonical example.

## Design constraints

- Support Node.js 18 and later with built-in modules only.
- Never execute installed skill or map content.
- Never send user text, sources, or telemetry over the network.
- Treat `skill/doubt/` as the canonical install payload.
- Escape all user-controlled text before embedding it in HTML.
- Add passing and adversarial fixtures for every schema invariant.
- Prefer a specific unknown over a confidence percentage.
- Never turn topical similarity into a `supports` edge.
