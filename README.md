<div align="center">

# Doubt

### Your AI is too agreeable. Give it healthy doubt.

**A portable Agent Skill that challenges bad premises, calibrates confidence, and asks for evidence
before saying “done.”**

[![MIT license](https://img.shields.io/badge/license-MIT-6ee7b7.svg)](LICENSE)
[![Node 18+](https://img.shields.io/badge/node-%E2%89%A518-8b5cf6.svg)](package.json)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-22d3ee.svg)](package.json)
[![No telemetry](https://img.shields.io/badge/telemetry-none-f472b6.svg)](SECURITY.md)

<img src="docs/demo.svg" alt="Doubt turns an agreeable, unsupported answer scoring 22 into a calibrated answer scoring 100" width="100%">

</div>

AI assistants are optimized to be helpful. Too often, “helpful” means accepting the premise,
mirroring confidence, and polishing a conclusion that should have been challenged.

Doubt adds one small behavior layer:

> Find the load-bearing claim. Try to break it. Verify in proportion to consequence. Then keep
> moving.

It works with Claude Code, Codex, GitHub Copilot, Cursor, Gemini CLI, and any client that supports
the open Agent Skills format.

## Install

```bash
npx doubt-ai init --agent all
```

Or install only the portable standard location:

```bash
npx doubt-ai init
```

No model key. No runtime service. No telemetry. Zero dependencies.

## What changes

Without Doubt:

> You're absolutely right! Microservices are definitely the best choice. They will always make the
> system more scalable.

With Doubt:

> The premise needs pressure-testing. Independent deploys help when teams and release cycles are
> genuinely independent, but nothing here shows that service coupling is the current bottleneck.
> Start with a modular monolith under that assumption; extract a service when operational evidence
> justifies the boundary.

Doubt is not a “disagree with the user” prompt. It focuses skepticism on claims that can change the
decision, and stays out of the way for ordinary preferences and low-risk work.

## Use it

The skill activates on research, architecture decisions, debugging, reviews, factual claims, and
completion checks. Invoke it explicitly when you want a hard pass:

```text
Use $doubt to pressure-test this migration plan.
Use $doubt to verify the claims in this implementation summary.
Use $doubt to find the assumption most likely to reverse this decision.
```

You can also lint a saved answer locally:

```bash
doubt score answer.md
cat answer.md | doubt score -
```

```text
D 58/100  2 epistemic smells found.
  ▲ line 1  Opens with automatic agreement instead of testing the premise.
  ▲ line 8  Makes a completion claim without nearby machine-produced evidence.
  ✓ Names an assumption, limitation, or unverified claim.
```

The linter is deliberately heuristic. It catches review smells; it does not pretend to determine
truth.

## Commands

| Command | Purpose |
| --- | --- |
| `doubt init --agent all` | Install the skill for all supported agents |
| `doubt init --agent codex,claude` | Install for selected agents |
| `doubt init --global` | Install into your user-level skill directory |
| `doubt doctor --agent all` | Detect missing or locally modified installs |
| `doubt score <file\|->` | Flag epistemic smells in an answer |
| `doubt demo` | Run the built-in before/after |

Existing skill files are never overwritten unless you pass `--force`.

## The protocol

1. Find the one to three load-bearing claims.
2. Distinguish **observed**, **sourced**, **inferred**, **assumed**, and **unknown**.
3. Attack the premise before polishing the answer.
4. Verify current and consequential claims with current evidence.
5. State what would change the conclusion.
6. Continue under an explicit assumption when more certainty is not worth its cost.

Read the full [skill](skill/doubt/SKILL.md) and
[evidence ladder](skill/doubt/references/evidence-ladder.md).

## Supported agents

| Agent | Project install path used by Doubt |
| --- | --- |
| Agent Skills standard | `.agents/skills/doubt` |
| Claude Code | `.claude/skills/doubt` |
| Codex | `.agents/skills/doubt` |
| GitHub Copilot | `.agents/skills/doubt` |
| Cursor | `.agents/skills/doubt` |
| Gemini CLI | `.agents/skills/doubt` |

`--agent all` therefore writes only two copies: the shared `.agents` location and Claude's
`.claude` location. Vendor-specific aliases such as `--agent copilot` remain available when a team
prefers its native directory. The skill itself is plain Markdown and remains useful if your agent
uses a different discovery path—copy `skill/doubt` to the location your client documents.

## Why this is different

- **Not a fact-checking agent.** Doubt improves the reasoning posture of the agent you already use.
- **Not a security scanner.** It targets bad epistemics, not malware signatures.
- **Not endless hedging.** It names the decisive uncertainty and still recommends an action.
- **Not provider middleware.** Nothing proxies prompts or reads API keys.
- **Not another framework.** The whole behavior layer is inspectable Markdown.

## Privacy and trust

The installer copies static files. The linter reads only the file or stdin you pass it. Doubt does
not execute installed skill content, call a model, upload text, or collect telemetry. Run
`doubt doctor` to compare installed copies with the bundled canonical skill.

See [SECURITY.md](SECURITY.md) for the threat model.

## Development

```bash
git clone https://github.com/alsoleg89/doubt.git
cd doubt
npm test
node bin/doubt.js demo
```

Doubt uses only Node.js built-ins. The test suite covers the analyzer, CLI, installer, and integrity
check.

Contributions are welcome—especially concrete before/after failures, false-positive fixtures, and
adaptations for non-coding decisions. Start with [CONTRIBUTING.md](CONTRIBUTING.md).

## Roadmap

- A public, reproducible cross-model sycophancy benchmark.
- Editor diagnostics with line-level remediation.
- Signed skill manifests and update pinning.
- Domain packs for research, product decisions, incident response, and code completion claims.
- Community-contributed calibration scenarios.

## One honest caveat

A skill cannot guarantee truthful model behavior. Doubt raises the cost of confident nonsense by
making evidence, assumptions, and disconfirmation part of the workflow. The included linter is a
review aid, not a truth oracle.

<div align="center">

If Doubt saves you from one beautifully argued bad decision, consider starring the repo.

</div>
