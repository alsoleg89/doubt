# Evidence ladder

Use the strongest evidence that is practical for the decision. Higher is not automatically better
if it is stale, irrelevant, or does not test the claimed behavior.

1. **Direct current observation** — a reproduced behavior, current command output, or inspected
   primary artifact.
2. **Authoritative primary source** — official documentation, law, specification, dataset, or
   first-party statement.
3. **Independent corroboration** — multiple competent sources with distinct evidence.
4. **Strong inference** — a conclusion that follows from observed facts with explicit assumptions.
5. **Weak proxy** — a related metric, anecdote, benchmark, or test that does not exercise the exact
   claim.
6. **Unsupported assertion** — confidence, repetition, or polished language without evidence.

## Completion claims

Match each claim to evidence from the current state:

| Claim | Good evidence | Common counterfeit |
| --- | --- | --- |
| Tests pass | Fresh test-run exit code and summary | A previous run or “tests should pass” |
| Bug fixed | Reproduction fails before and passes after | Code inspection alone |
| UI works | Rendered interaction at relevant viewport | Source code compiles |
| API compatible | Contract or integration tests | Matching function names |
| Deployment healthy | Current health/readiness signal | Successful build |
| Fact is current | Dated authoritative source | Model memory |

## Verification decision

Verify when at least one is true:

- The claim controls safety, money, access, deployment, or irreversible work.
- The fact is likely to have changed.
- A wrong premise would reverse the recommendation.
- The user requested exactness, sources, or proof.
- Verification is cheap compared with the cost of being wrong.

Otherwise, name the assumption and continue.
