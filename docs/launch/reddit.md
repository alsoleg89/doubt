# Reddit draft

## Title

I made a tiny cross-agent skill because my AI kept agreeing with the premise instead of checking it

## Body

The failure pattern was consistent: I would say “we need microservices” or “the refactor is done,”
and the assistant would improve the plan or summary without first checking whether the premise was
true.

So I made **Doubt**. It is a portable Agent Skill that tells the agent to find the load-bearing
claim, try to break it, verify consequential claims, and then still move forward under an explicit
assumption.

It is not a fact-checking service and does not proxy prompts. The skill is inspectable Markdown; the
optional CLI is zero-dependency and local:

`npx doubt-ai init --agent all`

I also included a heuristic `doubt score` command, mostly to make false positives discussable in
tests rather than vibes.

Repo: https://github.com/alsoleg89/doubt

I would especially value examples where this posture becomes too skeptical or gets in the way.
