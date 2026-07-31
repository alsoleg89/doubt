# Submitted portability results

Place one sanitized JSON result per client/version in this directory and keep
raw outputs or generated artifacts under `artifacts/<client>-<version>/`.

Use `../result.example.json` as the template and run:

```bash
npm run benchmark:portability
```

## Current results

| Client | Version | Direct | Implicit | Negative |
|---|---|---:|---:|---:|
| GitHub Copilot CLI | 1.0.77 | pass | fail | pass |

The implicit failure is preserved as observed: Copilot discovered and activated
the skill, but did not run the requested validator and left three invalid source
URLs in the generated artifact. See the machine-readable result and sanitized
raw sessions for the full evidence trail.
