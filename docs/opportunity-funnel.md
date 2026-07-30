# The 5k-star opportunity funnel

Research snapshot: 2026-07-30.

> **Status: superseded as a category decision.** This was a narrow first pass
> inside agent reliability, not a broad market scan. Its selected product,
> `doubt verify`, is retained only as a technical probe until the cross-category
> research in [`category-research-2026.md`](category-research-2026.md) is
> complete.

This is not a backlog of features. It is the decision record for choosing a
project shape with a plausible path to 5,000 GitHub stars.

## Scoring

Each candidate is scored from 0–5 on six dimensions:

- **Pain (25%)** — frequent, expensive, and already worked around.
- **Wow (20%)** — useful output in under five minutes.
- **Loop (20%)** — usage naturally creates badges, reports, PRs, or integrations
  that expose the project to more developers.
- **OSS (15%)** — benefits from adapters, rules, fixtures, and community data.
- **Timing (10%)** — attached to a growing behavior, not a fading novelty.
- **Space (10%)** — room for a crisp open-source category leader.

The weighted score is directional market judgment, not false precision.

## Stage 1 — 26 candidates

| # | Candidate | One-line product | Score | Decision |
|---:|---|---|---:|---|
| 1 | Anti-sycophancy skill | A prompt that makes agents disagree | 41 | Kill: crowded and our benchmark showed no uplift |
| 2 | General claim checker | Verify claims against web sources | 62 | Kill: dense product field, costly retrieval |
| 3 | Pitch-deck due diligence | Audit startup decks against public evidence | 70 | Hold: valuable, but weak GitHub distribution loop |
| 4 | Citation browser extension | Verify citations inside AI chat products | 61 | Kill: many extensions already exist |
| 5 | Clinical note verifier | Statement-level source checking | 54 | Kill: strong incumbent and domain liability |
| 6 | Scientific claim verifier | Validate claims against papers | 57 | Kill: Valsci and research tooling cover it |
| 7 | LLM observability | Trace prompts, costs, and tool calls | 48 | Kill: Langfuse, Phoenix, AgentOps, and others |
| 8 | Local coding-agent replay | Desktop flight recorder for coding agents | 72 | Hold: useful, but Agent Replay exists |
| 9 | Agent memory portability | One memory layer across agents | 50 | Kill: intensely crowded |
| 10 | Prompt-injection firewall | Block malicious instructions at runtime | 58 | Kill: crowded security category |
| 11 | MCP scanner | Static and dynamic MCP security analysis | 55 | Kill: Cisco, Snyk, Ant, and others |
| 12 | Skill scanner | Scan `SKILL.md` packages before install | 49 | Kill: Cisco and NVIDIA already ship this |
| 13 | Agent dependency lockfile | Reproducible skills, MCP, hooks, and prompts | 65 | Kill: Microsoft APM owns the obvious wedge |
| 14 | Capability-diff gate | Show new powers introduced by agent config | 76 | Hold: good CI artifact, narrow on its own |
| 15 | Agent instruction linter | Find conflicts and stale rules across tools | 68 | Kill: agnix, agenteval, agint, and agentlint |
| 16 | Context-window optimizer | Find wasted and shadowed context | 67 | Hold: real pain, weak correctness proof |
| 17 | Context X-ray | Render exactly what an agent saw and why | 79 | Finalist: clear debugging object and visual demo |
| 18 | Agent regression snapshots | Diff tool calls and behavior in CI | 73 | Hold: EvalView and broader eval stacks |
| 19 | Browser-agent cassette | Record once, replay without model calls | 66 | Kill: HyperAgent already ships it |
| 20 | Repo-specific agent benchmark | SWE-bench generated from your own PRs | 81 | Finalist: viral results, but Superconductor exists |
| 21 | Benchmark anti-cheat sandbox | Detect access to gold patches and hidden tests | 74 | Hold: sharp new pain, market is still small |
| 22 | AI-test mutation gate | Prove generated tests catch realistic defects | 77 | Finalist: deterministic and CI-native |
| 23 | AI-PR slop scanner | Detect weakened tests, swallowed errors, scope drift | 80 | Finalist: immediate pain and visible PR report |
| 24 | Agent completion verifier | Independently falsify “done” claims with receipts | **89** | **Build** |
| 25 | AI code provenance | Attest which agent/model produced each change | 64 | Hold: governance value, low individual urgency |
| 26 | Model behavior diff | Git-style semantic diff across model upgrades | 69 | Hold: useful, but absorbed by eval platforms |

## Stage 2 — finalists

| Candidate | Pain | Wow | Loop | OSS | Timing | Space | Weighted |
|---|---:|---:|---:|---:|---:|---:|---:|
| Agent completion verifier | 5 | 5 | 4 | 5 | 5 | 4 | **89** |
| Repo-specific benchmark | 4 | 5 | 5 | 4 | 5 | 2 | **81** |
| AI-PR slop scanner | 5 | 4 | 4 | 4 | 5 | 3 | **80** |
| Context X-ray | 4 | 5 | 4 | 4 | 5 | 3 | **79** |
| AI-test mutation gate | 5 | 4 | 4 | 4 | 4 | 3 | **77** |

## Stage 3 — the product

### Doubt: falsification for coding agents

> Your agent says it is done. Doubt tries to prove it wrong.

The command:

```bash
npx doubt-ai verify --task issue.md
```

The runtime must:

1. inspect the actual git diff, not the agent's narrative;
2. run deterministic project checks and preserve their output;
3. detect suspicious verification changes such as deleted tests, new skips,
   swallowed errors, weakened assertions, or disabled quality gates;
4. hand the task, diff, and check receipts to an independent critic;
5. report `PASS`, `BLOCKED`, or `FAIL`, with every conclusion linked to evidence;
6. emit JSON for CI and a readable report for humans.

This is deliberately not another code-review chatbot. Reviewers suggest. Doubt
attempts falsification and records what actually ran.

## Why it survived

- **Five-minute proof:** run it on the current diff and get concrete findings.
- **No framework lock-in:** Claude Code, Codex, Cursor, Copilot, OpenCode, or a
  human can produce the diff.
- **Deterministic floor:** the useful core works without an API key.
- **Natural distribution:** every GitHub Action report and badge exposes Doubt.
- **Contribution surface:** language detectors, test adapters, adversarial rules,
  fixtures, and agent adapters are separable community contributions.
- **Brand continuity:** the original anti-sycophancy idea becomes an executable
  verifier rather than a personality prompt.

## Kill gates

The pivot is not protected from evidence. Stop or narrow it if any gate fails:

1. The deterministic scanner cannot find at least three real defects across ten
   representative agent-generated diffs.
2. Independent verification does not improve precision over a single reviewer.
3. Median time-to-first-use exceeds five minutes in a clean repository.
4. Ten target users do not voluntarily add the CI check after seeing a report.
5. Public launch produces attention but no repeated runs or external fixtures.

## Market evidence behind the cuts

- Superconductor already sells a custom benchmark built from a team's own pull
  requests: <https://www.superconductor.com/benchmark>
- SWE-smith turns repositories into SWE training environments:
  <https://github.com/SWE-bench/SWE-smith>
- Microsoft APM already provides a cross-client manifest and lockfile:
  <https://github.com/microsoft/apm>
- Snyk scans agents, MCP servers, and skills:
  <https://github.com/snyk/agent-scan>
- NVIDIA SkillSpector and Cisco Skill Scanner occupy skill scanning:
  <https://github.com/nvidia/skillspector>
  <https://github.com/cisco-ai-defense/skill-scanner>
- Agent Replay covers local coding-agent observability and replay:
  <https://github.com/agentreplay/agentreplay>
- HyperAgent already records browser actions for deterministic replay:
  <https://github.com/hyperbrowserai/HyperAgent>
- Empirical work has found distinct weaknesses in agent-generated tests and a
  growing need to evaluate them beyond coverage:
  <https://arxiv.org/abs/2603.13724>
- GitHub's own guidance says AI-generated code still needs thorough review:
  <https://docs.github.com/en/copilot/tutorials/review-ai-generated-code>
