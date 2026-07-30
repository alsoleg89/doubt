# LaunchKit probe

This probe tests one narrow promise: can a repository produce a publishable,
evidence-linked launch hero without a model key or manual copywriting?

```bash
node probes/launchkit/launchkit.mjs /path/to/repository output.html
```

The probe reads only local `README` and `package.json` content plus a file
inventory. It emits:

- a responsive, self-contained HTML launch artifact;
- a JSON sidecar with every extracted claim and its local provenance.

The falsification target is not whether the page renders. It is whether the
result is distinctive and truthful enough to publish for three unrelated
repositories with less than ten minutes of editing.
