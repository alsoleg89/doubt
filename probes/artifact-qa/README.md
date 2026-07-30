# Artifact QA probe

This probe tests whether artifact reliability can be a visual, embeddable
product rather than another generic agent reviewer.

The fixture is a valid two-slide PowerPoint. The second slide still contains
overlapping text, clipped copy, unreadable contrast, and an off-canvas footer.
The analyzer consumes rendered layout data and produces a repair-oriented HTML
report.

```bash
node probes/artifact-qa/artifact-qa.mjs \
  .tmp/artifact-qa/output \
  probes/artifact-qa/sample-report.html
```

The probe is not a cross-format engine. It survives only if the same
deterministic core reaches at least 80% recall with less than 10% false positives
on seeded PPTX and DOCX defects.
