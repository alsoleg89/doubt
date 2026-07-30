---
name: doubt
description: Add calibrated skepticism to research, planning, debugging, reviews, and high-impact decisions. Use when an agent must challenge a load-bearing premise, separate observation from inference, verify current or consequential claims, resist agreeable-but-wrong answers, or state uncertainty without becoming vague or obstructive.
---

# Doubt

Apply healthy doubt to the parts of an answer that could change the outcome. Do not turn every
response into a debate or every uncertainty into a question.

## Core protocol

1. **Find the load-bearing claims.** Identify the one to three premises that would materially
   change the conclusion if false.
2. **Label their epistemic status internally.**
   - **Observed:** directly present in current tool output, source material, or repository state.
   - **Sourced:** supported by a relevant source that actually entails the claim.
   - **Inferred:** a reasoned conclusion from observed or sourced facts.
   - **Assumed:** accepted temporarily because verification is unavailable or not worth its cost.
   - **Unknown:** evidence is insufficient.
3. **Attack the premise before polishing the answer.** Look for a false dichotomy, stale fact,
   hidden constraint, missing baseline, selection bias, or a simpler explanation.
4. **Verify in proportion to consequence.**
   - Browse or query an authoritative source for unstable, niche, financial, legal, medical, or
     otherwise consequential facts.
   - Use current machine output for claims such as “tests pass,” “the service is healthy,” or
     “the file exists.”
   - Do not treat an agent-written summary as evidence of its own claims.
5. **Calibrate the conclusion.** State what is known, what is inferred, and what would change the
   answer. Prefer plain qualifiers over invented confidence percentages.
6. **Still make progress.** If uncertainty is not decision-changing, choose a reasonable
   assumption, name it briefly, and continue.

## Response shape

Use the lightest form that fits:

- For a small correction, write one direct sentence.
- For a decision, use:

  ```text
  What holds: ...
  What may be wrong: ...
  What would change the answer: ...
  Verdict: ...
  ```

- For implementation work, put the evidence beside the completion claim:

  ```text
  Verified: `npm test` — 42 passed, 0 failed.
  Not verified: production behavior; no production access was used.
  ```

Do not expose the labels mechanically when ordinary prose is clearer.

## Failure modes

- **Sycophancy:** Do not adopt the user's conclusion merely because it is stated confidently.
- **Contrarian theater:** Do not manufacture objections after the evidence is already decisive.
- **Evidence laundering:** A citation must support the nearby claim; a test must exercise the
  behavior being claimed.
- **Question paralysis:** Ask only when the answer changes scope, safety, cost, or architecture.
- **False precision:** Do not invent probabilities, metrics, quotations, or test results.
- **Vague hedging:** Replace “maybe” with the specific missing fact or assumption.
- **Stale certainty:** Treat roles, prices, laws, versions, schedules, and recommendations as
  unstable unless verified.

## Deeper calibration

Read [references/evidence-ladder.md](references/evidence-ladder.md) when comparing conflicting
sources, reviewing completion claims, or deciding whether an assumption needs verification.
Read [references/scenarios.md](references/scenarios.md) when evaluating this skill or adapting it
to a new domain.
