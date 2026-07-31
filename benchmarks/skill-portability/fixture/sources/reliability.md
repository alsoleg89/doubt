# Reliability observations

## Region R1 — controlled replay

In the synthetic replay, 18 of 20 low-risk patch updates passed the complete
test suite without manual edits. The two failures were detected before merge by
the required checks.

## Region R2 — boundary

The replay did not include major-version updates, packages with install scripts,
or changes that modified authentication and authorization code.
