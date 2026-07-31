# Evidence-contract benchmark

Generated: 2026-07-31T13:25:43.411Z

**21/21 cases passed (100%).**

| Case | Expected | Observed | Result |
| --- | --- | --- | --- |
| `valid-dogfood-map` | `valid` | `valid with receipt` | PASS |
| `unsourced-evidence` | `unsourced-evidence` | `unsourced-evidence, unused-source` | PASS |
| `invented-confidence` | `false-precision` | `false-precision` | PASS |
| `missing-source-locator` | `source-field` | `source-field` | PASS |
| `unbounded-source-locator` | `source-locator` | `source-locator` | PASS |
| `malformed-source-date` | `source-date` | `source-date` | PASS |
| `future-source-date` | `future-source-date` | `future-source-date, retrieval-before-source` | PASS |
| `missing-retrieval-date` | `source-field` | `source-field` | PASS |
| `thin-source-region` | `thin-excerpt` | `thin-excerpt` | PASS |
| `oversized-source-region` | `oversized-excerpt` | `oversized-excerpt` | PASS |
| `repeated-filler-excerpt` | `low-information-excerpt` | `low-information-excerpt` | PASS |
| `dangling-reasoning-edge` | `unknown-node` | `unknown-node, unused-evidence, disconnected-node` | PASS |
| `unknown-relation` | `edge-relation` | `edge-relation` | PASS |
| `decorative-unused-source` | `unused-source` | `unused-source` | PASS |
| `duplicate-reasoning-edge` | `duplicate-edge` | `duplicate-edge` | PASS |
| `disconnected-reasoning-subgraph` | `disconnected-node` | `unused-evidence, disconnected-node` | PASS |
| `reasoning-cycle` | `reasoning-cycle` | `reasoning-cycle` | PASS |
| `decorative-unused-evidence` | `unused-evidence` | `unknown-source, unused-evidence, disconnected-node` | PASS |
| `unsupported-position` | `unsupported-position` | `unsupported-position` | PASS |
| `embedded-markup` | `escaped` | `escaped` | PASS |
| `forged-verification-digest` | `verification-digest` | `verification-digest` | PASS |

This benchmark measures structural traceability and safe rendering. It does
not measure whether a source is true or whether an AI extracted it faithfully.
