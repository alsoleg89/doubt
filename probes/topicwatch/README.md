# TopicWatch probe

This probe deliberately narrows the original “monitor any topic” hypothesis to
one source that has a stable, free, structured API: GitHub repositories.

```bash
node probes/topicwatch/topicwatch.mjs \
  --query 'topic:agent-skills created:>2026-01-01' \
  --output probes/topicwatch/agent-skills.html
```

It stores both the raw normalized snapshot and a self-contained interactive
dashboard. Momentum is labelled honestly as lifetime stars per day; it is not
presented as a causal or short-window growth metric.

The general TopicWatch hypothesis fails if usefulness depends on this narrowing:
arbitrary markets, companies, and policy topics do not all have a GitHub-like
keyless source.
