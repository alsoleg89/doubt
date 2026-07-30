# Context Blame probe

This probe tests whether an invisible infrastructure problem can produce a
five-minute visual artifact.

```bash
node probes/context-blame/context-blame.mjs . \
  probes/context-blame/sample-report.html
```

The report is deliberately honest about its boundary: repository instruction
files are observable, while vendor system prompts and final assembled requests
often are not. The product is killed if it cannot move beyond a generic file
inventory for at least three major agents.
