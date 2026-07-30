# Show HN draft

## Title

Show HN: Doubt – a portable skill that makes AI agents challenge bad premises

## Body

AI assistants are optimized to be helpful, and I kept seeing “helpful” collapse into automatic
agreement: accept the premise, mirror the user's confidence, then produce an excellent answer to
the wrong question.

I built Doubt, a small open Agent Skill that adds a repeatable protocol:

1. find the load-bearing claim;
2. separate observation, source, inference, assumption, and unknown;
3. try to falsify the premise;
4. verify in proportion to consequence;
5. still make a decision.

It is plain Markdown plus a zero-dependency Node CLI. There is no model proxy, API key, account, or
telemetry. The same skill installs into Claude Code, Codex, Copilot, Cursor, and Gemini CLI:

`npx doubt-ai init --agent all`

The CLI also has a deliberately simple local linter for automatic agreement, absolute certainty,
and unsupported completion claims. It is a review heuristic, not a truth detector.

The part I most want feedback on is calibration: when does healthy doubt become annoying
contrarianism? I included the failure boundaries and test scenarios in the repo so those decisions
are inspectable.

GitHub: https://github.com/alsoleg89/doubt
