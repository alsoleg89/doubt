# Contributing

Thanks for helping make consequential answers inspectable.

## Start here

1. Fork the repository and create a focused branch.
2. Run `npm test`.
3. Make one behavior change at a time.
4. Add or update a test.
5. Run `npm run check` before opening a pull request.

For schema or validator changes, include both a map that must pass and the
smallest adversarial map that must fail. For renderer changes, generate a
self-contained example and check desktop, mobile, filters, edge focus, and
source-region navigation. For skill changes, include a concrete input question
and the resulting `.doubt.json`.

Do not loosen a fail-closed invariant merely to accept model output. Improve the
skill or error message first.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
