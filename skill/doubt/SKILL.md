---
name: doubt
description: Turn a contested question, research brief, technical choice, or high-impact decision into a source-grounded interactive evidence map. Use when an agent must preserve support, contradiction, qualification, and missing evidence; make every evidence edge traceable to a dated source region; pressure-test a conclusion; or render a shareable HTML decision artifact instead of collapsing disagreement into a prose summary.
---

# Doubt

Produce a decision artifact that shows why a conclusion holds, what pushes
against it, and what remains unknown. Do not use a graph to decorate an answer
that has not been sourced.

## Workflow

1. **Frame one decision.** Write a falsifiable question and one provisional
   position. Narrow broad topics until a reader can tell what action or belief
   the map is testing.
2. **Collect current source regions.** Prefer direct observations and primary
   sources. For each item, preserve the URL or local path, publisher, date,
   section/page/line locator, and a short excerpt that can be checked in
   context. Read [references/evidence-ladder.md](references/evidence-ladder.md)
   when source quality is disputed.
3. **Atomize the reasoning.** Create only four node types:
   - `position`: the single current verdict;
   - `claim`: an intermediate proposition;
   - `evidence`: a sourced observation;
   - `unknown`: a specific missing fact that could change the result.
4. **Type every edge.** Use `supports`, `contradicts`, `qualifies`, or
   `missing`. Add a plain-language note explaining why the source node bears on
   the target. Similarity is not support; opposite wording is not necessarily
   contradiction.
5. **Preserve disagreement.** Do not delete contrary evidence merely because
   the verdict survives it. Represent scope differences as `qualifies`, not
   false contradictions.
6. **Refuse false precision.** Do not invent confidence percentages. Express
   uncertainty as an explicit unknown, a qualifying edge, or a narrower
   verdict.
7. **Write the map JSON.** Follow
   [references/map-schema.md](references/map-schema.md). Keep node IDs short,
   stable, and semantic.
8. **Fail closed, then render.**

   ```bash
   npx doubt-ai validate decision.doubt.json
   npx doubt-ai map decision.doubt.json --out decision.html
   ```

   Fix every validation finding. Never bypass missing-source, unused-evidence,
   unsupported-position, or false-precision findings.
9. **Inspect the HTML.** Verify that the question, verdict, evidence cards,
   contradictions, unknowns, edge focus, filters, and source links are readable.
   The JSON remains the canonical editable artifact.

## Quality gates

A finished map must satisfy all of these:

- exactly one position has incoming reasoning;
- every evidence node names a source and participates in an edge;
- every source has a dated, bounded region and is used;
- the map contains contrary or qualifying evidence when the source set contains
  it;
- unresolved decision-changing facts appear as `unknown` nodes;
- every edge note states an entailment, contradiction, qualification, or gap;
- the verdict is no broader than the evidence.

## Do not

- Treat an agent-written summary as evidence for itself.
- Attach a citation that merely mentions the topic.
- Generate decorative orphan nodes.
- Infer that two sources conflict when populations, versions, dates, or
  evaluation conditions differ.
- Hide a failed retrieval behind authoritative prose.
- Replace a simple, settled fact with an unnecessary map.
