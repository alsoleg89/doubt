# Doubt verification: FAIL

Receipt: `e220d0e7a3f0eb33d01352c578b047e56f3f7bc6e89e190898cc69d9eccb864e`

Task: Keep account validation while refactoring parseAccount.

## Evidence

- Diff: `HEAD` → working tree
- Files: 3
- Changes: +15 / -5
- Diff SHA-256: `9a5c4b7fa68be919630d670840d4707590307564c1b0a675bd2c72e8f9952c0f`
- Check: npm test (passed)

## Verdict reasons

- 4 high-severity verification smells found.

## Findings

- **HIGH empty-error-handler** — `src.js:6`
  The diff swallows an error without preserving a failure signal.
  Evidence: `} catch {}`

- **HIGH deleted-test** — `test/src.test.js:5`
  The diff removes a test case.
  Evidence: `test("rejects an account without an id", () => {`

- **MEDIUM deleted-assertion** — `test/src.test.js:6`
  The diff removes a test assertion; prove that coverage did not weaken.
  Evidence: `assert.throws(() => parseAccount({}), /account.id is required/);`

- **HIGH focused-or-skipped-test** — `test/src.test.js:5`
  The diff focuses or skips tests, so a green run may exclude coverage.
  Evidence: `test.skip("rejects an account without an id", () => {`

- **HIGH continue-on-error** — `.github/workflows/ci.yml:6`
  The diff allows a failing command or CI step to report success.
  Evidence: `continue-on-error: true`

## Check output

```text
> test
> node --test

﹣ rejects an account without an id (0.542083ms) # SKIP
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 0
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 65.1715
```
