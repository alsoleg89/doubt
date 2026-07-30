# Evidence-contract benchmark

The benchmark applies deterministic adversarial mutations to the canonical
dogfood map and checks that the validator fires the intended invariant. It also
checks that hostile markup is escaped in visible HTML and embedded JSON.

```bash
npm run benchmark
```

Committed reports live in [`results/`](results/). Every report includes the
method, exact cases, expected invariant, observed rules, and generation time.

The scope is intentionally narrow: this proves structural traceability and safe
rendering. It does not prove that a source is true, that an AI extracted it
faithfully, or that the final verdict is correct.
