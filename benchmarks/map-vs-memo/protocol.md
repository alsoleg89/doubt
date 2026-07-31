# Map vs cited memo reader study

Status: preregistered before data collection

Protocol version: 1

Preregistered: 2026-07-31

Public issue: <https://github.com/alsoleg89/doubt/issues/2>

## Product hypothesis

For a contested technical decision, a source-grounded evidence map helps a
reader recover the strongest contradiction, the most important unknown, and an
exact source region more accurately than a well-cited prose memo built from the
same frozen source set.

This study does not test whether the underlying sources are true, whether an AI
extracted them faithfully, or whether Doubt should be used in a regulated
decision.

## Design

- Five non-sensitive technical decisions are included.
- Every topic has one validated Doubt map and one hand-edited cited memo.
- The map and memo expose the same frozen sources and current position.
- Each reader sees all five topics, but only one representation per topic.
- Topic order is shuffled locally.
- Representation alternates by shuffled position, with the starting condition
  derived from a random local session id. Each reader therefore sees two topics
  in one condition and three in the other.
- Answer choices are shuffled locally.
- No account, cookie, analytics, telemetry, or network submission is used.
- The browser exports one JSON result file. It contains a random session id,
  timings, assignments, answers, and optional format preference; it contains no
  requested name, email, IP address, free-form text, or other participant
  identifier.

The study is within-reader and between-topic. It reduces reader-level variance
without showing the same decision in both formats to one reader.

## Tasks

For each topic, the reader identifies:

1. the current position;
2. the strongest contradiction or counterpressure;
3. one important qualification;
4. the most important missing evidence;
5. the exact source region behind a sampled observation.

The study records correctness for every task and elapsed time for the topic.
After all topics, the reader may state whether the map, memo, or neither was
more useful.

## Outcomes

Primary outcomes:

- contradiction accuracy;
- unknown accuracy;
- exact-source-region accuracy.

Secondary outcomes:

- current-position accuracy;
- qualification accuracy;
- total task accuracy;
- median topic completion time;
- stated format preference.

## Hypotheses

- H1: map exact-source-region accuracy is higher than memo accuracy.
- H2: map contradiction accuracy is higher than memo accuracy.
- H3: map unknown accuracy is higher than memo accuracy.

Position accuracy, qualification accuracy, completion time, and preference are
reported descriptively. No directional claim is preregistered for them.

## Sample and stopping rule

- Include at least 10 complete reader sessions.
- Do not inspect condition-level results before 10 complete sessions.
- Publish the first analysis after the 10th complete session.
- Continue to report later sessions as a separate cumulative analysis rather
  than replacing the first result.
- Include neutral and negative outcomes.

This is a small product-direction study, not a population estimate. Topic and
reader counts must always accompany percentages.

## Exclusions

Exclude only:

- incomplete exports;
- files that fail the committed result schema;
- exact duplicate session ids, keeping the earliest complete export;
- sessions generated from a different protocol version.

Do not exclude a session because it is slow, inaccurate, or unfavorable to the
map.

## Analysis

For each condition, report:

- correct answers / attempted answers by task;
- total accuracy;
- median topic completion time;
- number of topic exposures and distinct sessions.

Report map-minus-memo percentage-point differences for the three primary
outcomes. Do not report a p-value for the initial 10-reader study. Publish the
anonymized raw JSON exports, the exact analysis command, and the generated
summary.

## Decision rule

Do not claim that the map beats a cited memo unless all three primary outcomes
favor the map in the first 10-reader analysis. If any primary outcome is tied
or favors the memo, state that the product hypothesis is not yet supported and
use the error pattern to revise the interface or contract.

## Known limitations

- All five topics concern Doubt's own technical product decisions.
- Readers self-select and may already be comfortable with graphs.
- A five-topic study is sensitive to topic wording and answer choices.
- The map is interactive while the memo is static; the study evaluates the
  complete representations, not an isolated visual-layout effect.
- Local JSON return creates collection friction and may increase attrition.
