# Evidence-contract benchmark

Generated: 2026-07-30T21:00:47.645Z

**12/12 cases passed (100%).**

| Case | Expected | Observed | Result |
| --- | --- | --- | --- |
| `valid-dogfood-map` | `valid` | `valid with receipt` | PASS |
| `unsourced-evidence` | `unsourced-evidence` | `unsourced-evidence, unused-source` | PASS |
| `invented-confidence` | `false-precision` | `false-precision` | PASS |
| `missing-source-locator` | `source-field` | `source-field` | PASS |
| `thin-source-region` | `thin-excerpt` | `thin-excerpt` | PASS |
| `oversized-source-region` | `oversized-excerpt` | `oversized-excerpt` | PASS |
| `dangling-reasoning-edge` | `unknown-node` | `unknown-node` | PASS |
| `unknown-relation` | `edge-relation` | `edge-relation` | PASS |
| `decorative-unused-source` | `unused-source` | `unused-source` | PASS |
| `decorative-unused-evidence` | `unused-evidence` | `unused-evidence` | PASS |
| `unsupported-position` | `unsupported-position` | `unused-evidence, unsupported-position` | PASS |
| `embedded-markup` | `escaped` | `escaped` | PASS |

This benchmark measures structural traceability and safe rendering. It does
not measure whether a source is true or whether an AI extracted it faithfully.
