# Launch plan

The goal is not to publish everywhere at once. Create one strong proof artifact, seed discussion
with practitioners, then use their counterexamples to improve the benchmark.

## Release prerequisites

- Publish `doubt-ai` to npm and verify `npx doubt-ai init` in a clean directory.
- Create `alsoleg89/doubt` with topics: `ai`, `agent-skills`, `anti-sycophancy`, `claude-code`,
  `codex`, `copilot`, `cursor`, `gemini-cli`, `llm`, `prompt-engineering`.
- Enable Discussions, private vulnerability reporting, and the issue templates.
- Add a 45–60 second terminal recording using `doubt demo`, `doubt init`, and `doubt doctor`.
- Run one real comparison on at least three agent/model pairs and publish raw prompts and outputs.

## Sequence

### T-7 days: credible proof

1. Recruit 10 design partners who use at least two coding agents weekly.
2. Collect 20 real agreeable-but-wrong answers with permission and remove sensitive material.
3. Tune the skill against failures, not aesthetics.
4. Freeze v0.1 and publish a reproducible benchmark folder.

### Launch day

1. Publish the GitHub repository and npm package.
2. Post Show HN with a technical title, not a marketing title.
3. Share the demo on X/LinkedIn.
4. Post to one relevant subreddit after answering early GitHub/HN questions.
5. Turn every good objection into an issue labeled `needs-evidence`.

### Days 2–14

1. Ship fixes daily while attention is concentrated.
2. Publish a leaderboard only after methodology is inspectable.
3. Ask users for before/after transcripts, not testimonials.
4. Add integrations only when users show an actual discovery-path failure.

## Metrics

- Activation: repository visitors who run `doubt demo` or install.
- Proof: contributed before/after scenarios.
- Retention proxy: repeated `doubt doctor` or score runs.
- Community: contributors and issue participants, not raw impressions.
- Star milestones: 250 proof of message, 1k proof of utility, 5k proof of category.

Do not buy stars, run giveaways for stars, or spam unrelated communities. Those produce a visible
number and a dead project.
