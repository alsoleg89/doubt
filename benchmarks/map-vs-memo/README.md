# Map vs cited memo benchmark

This directory contains the preregistered reader study for the product
hypothesis in [issue #2](https://github.com/alsoleg89/doubt/issues/2).

## Build the study

```bash
npm run benchmark:reader
```

Open `benchmarks/results/map-vs-memo-study.html`. The page runs entirely in the
browser, alternates map and memo conditions, and downloads one anonymous JSON
result file. It never submits data over the network.

The public build is available at:
<https://alsoleg89.github.io/doubt/benchmark/>

## Validate without writing

```bash
npm run benchmark:reader:check
```

This validates the protocol manifest, all five evidence maps, memo source
coverage, questions, and answer keys.

## Analyze returned files

```bash
node benchmarks/map-vs-memo/analyze.mjs path/to/result-1.json path/to/result-2.json
```

The analyzer rejects malformed, incomplete, duplicate, or wrong-protocol
exports and prints aggregate JSON. Do not inspect condition-level output before
10 complete sessions; that stopping rule is preregistered in `protocol.md`.
