# Submitted portability results

Place one sanitized JSON result per client/version in this directory and keep
raw outputs or generated artifacts under `artifacts/<client>-<version>/`.

Use `../result.example.json` as the template and run:

```bash
npm run benchmark:portability
```

No client results are bundled yet. An empty directory is an explicit zero
baseline, not evidence of portability.
