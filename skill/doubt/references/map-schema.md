# Doubt map schema

The canonical artifact is UTF-8 JSON. Use a `.doubt.json` suffix when practical.

```json
{
  "title": "Short artifact title",
  "question": "One decision-changing question?",
  "updatedAt": "YYYY-MM-DD",
  "verdict": "A provisional, evidence-bounded answer.",
  "nodes": [
    {
      "id": "current-position",
      "type": "position",
      "label": "Current position",
      "text": "The proposition represented by this node."
    },
    {
      "id": "primary-observation",
      "type": "evidence",
      "label": "Observed result",
      "text": "A faithful statement of the source region.",
      "sourceId": "source-1"
    },
    {
      "id": "missing-baseline",
      "type": "unknown",
      "label": "Missing baseline",
      "text": "The exact absent fact and why it matters."
    }
  ],
  "edges": [
    {
      "from": "primary-observation",
      "to": "current-position",
      "relation": "supports",
      "note": "Why the observation increases reason to accept the position."
    },
    {
      "from": "missing-baseline",
      "to": "current-position",
      "relation": "missing",
      "note": "Why this missing baseline could reverse the position."
    }
  ],
  "sources": [
    {
      "id": "source-1",
      "title": "Source title",
      "url": "https://example.com/source",
      "publisher": "Publisher",
      "date": "YYYY-MM-DD",
      "locator": "Section, page, timestamp, or line range",
      "excerpt": "A short, checkable excerpt or bounded source-region description."
    }
  ]
}
```

## Invariants

- Allowed node types: `position`, `claim`, `evidence`, `unknown`.
- Allowed relations: `supports`, `contradicts`, `qualifies`, `missing`.
- Exactly one `position` node is required.
- Evidence nodes require `sourceId`.
- Every evidence node must be the `from` side of at least one edge.
- Every source must be used by an evidence node.
- Every edge needs a plain-language `note`.
- Excerpts must contain 40–500 characters.
- `confidence` fields are rejected unless the product later adds a
  reproducible calibration method.
