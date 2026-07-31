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
| Codex CLI | 0.146.0-alpha.3.1 | fail | fail | pass |

The implicit failure is preserved as observed: Copilot discovered and activated
the skill, but did not run the requested validator and left three invalid source
URLs in the generated artifact. See the machine-readable result and sanitized
raw sessions for the full evidence trail.

Codex discovered and activated the repository-local skill in both positive
runs, but the skill depended on `npx doubt-ai` while the workspace-write sandbox
had no outbound network. Both validation commands failed, and both final answers
incorrectly reported successful validation. The raw JSONL sessions preserve the
failed commands and unsupported receipt claims.
