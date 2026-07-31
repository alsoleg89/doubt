# Agent Skills portability benchmark

This benchmark tests whether the same Agent Skill behaves consistently across
Claude Code, Codex, GitHub Copilot, Cursor, and Gemini CLI. It measures observed
behavior, not whether a product page says that skills are supported.

The benchmark is deliberately contribution-friendly: one person can submit one
client without pretending that a five-client comparison is complete.

## What stays fixed

- the canonical Doubt skill payload in [`../../skills/doubt/`](../../skills/doubt/);
- the synthetic repository fixture in [`fixture/`](fixture/);
- the direct, implicit, and negative prompts in [`prompts/`](prompts/);
- the result shape in [`result.schema.json`](result.schema.json).

The fixture is synthetic. Its source notes exist to exercise evidence behavior;
they are not claims about a real project.

## Run one client

1. Record the exact client version, operating system, model, permission mode,
   install path, relevant configuration, and full Git commit of the tested skill.
2. Copy `fixture/` into a new empty working directory.
3. Install the unmodified `skills/doubt/` payload using the client's documented
   repository-local mechanism.
4. Start a fresh client session for each prompt.
5. Run `direct.txt`, `implicit.txt`, and `negative.txt` without editing them.
6. Save sanitized raw output and any generated artifact under
   `results/artifacts/<client>-<version>/`.
7. Copy `result.example.json` to
   `results/<client>-<version>.json`, replace every placeholder, and validate:

```bash
npm run benchmark:portability
```

The command prints the current canonical deterministic skill-archive digest.
Copy that exact 64-character value into `skillDigest` and the full tested commit
into `skillCommit`. Results keep those historical pins when the canonical skill
later changes; the validator does not relabel an old run as testing new bytes.

The validator requires all three prompt classes, exact metadata, relative
artifact paths, and a 64-character receipt whenever one was produced. A
`blocked` or `fail` result is valid evidence when the limitation is documented.

## Outcome definitions

- `pass` — observed behavior matches that prompt's expected behavior in
  `protocol.json`;
- `fail` — the client ran but observed behavior did not match;
- `blocked` — the run could not complete because of a documented product,
  permission, environment, or access limitation.

Discovery, activation, and consent are recorded separately because clients can
arrive at the same final artifact through materially different behavior.

## Contribution rules

- Do not include credentials, private repository data, user names, or personal
  paths in raw output.
- Do not paraphrase a failure into a success.
- Do not modify the fixture, prompt, or skill payload for a comparable run.
- Link non-default configuration and explain every `blocked` outcome.
- Set `behavioralEquivalenceClaimed` to `false`. Cross-client equivalence is an
  aggregate conclusion and cannot be established by one client result.

The open coordination issue is
[`#9`](https://github.com/alsoleg89/doubt/issues/9).
