# Launch assets

Replace no text below unless the released behavior or URLs change. Do not add
star counts, user counts, or performance claims without current evidence.

## Canonical links

- Repository: `https://github.com/alsoleg89/doubt`
- Live map: `https://alsoleg89.github.io/doubt/`
- Agent Skills vs MCP:
  `https://alsoleg89.github.io/doubt/examples/agent-skills-vs-mcp.html`
- Reader benchmark: `https://alsoleg89.github.io/doubt/benchmark/`
- npm: `https://www.npmjs.com/package/doubt-ai`

## Topical launch hook

**Title**

> Agent Skills vs MCP: I mapped the boundary from the official specs

**Body**

> “Skills or MCP?” is usually framed as a format fight. The current
> specifications describe different boundaries.
>
> I built a source-grounded map from the Agent Skills spec, GitHub's client
> documentation, the discovery RFC, and the current MCP architecture and
> security guidance:
>
> - use a Skill for reusable procedure and bundled context that loads when
>   relevant;
> - use MCP for live tools, resources, and prompts across a client/server
>   boundary;
> - use both when the Skill teaches a workflow that calls MCP-backed
>   capabilities.
>
> The map also keeps the uncomfortable parts visible: Skills may run scripts,
> remote MCP adds an authorization and security surface, discovery is still
> evolving, and I found no committed cross-client behavior benchmark that
> proves equivalent portability in practice.
>
> Interactive map:
> https://alsoleg89.github.io/doubt/examples/agent-skills-vs-mcp.html
>
> Editable JSON and validator:
> https://github.com/alsoleg89/doubt
>
> I would value corrections where an edge overstates what the cited source
> region establishes.

## GitHub

**Description**

> Turn contested questions into interactive, source-grounded evidence maps.

**Topics**

`ai`, `agent-skills`, `argument-mapping`, `decision-making`, `evidence-map`,
`fact-checking`, `knowledge-graph`, `research`, `source-grounding`,
`claude-code`, `codex`

**Social preview**

Upload `docs/social-preview.png` in repository Settings → General → Social
preview. It is the GitHub-recommended 1280×640 PNG and stays under 1 MB.

## Hacker News

**Title**

> Show HN: Doubt – Source-grounded evidence maps for AI research

**Body**

> AI research tools usually end with prose. I wanted an artifact that preserves
> the support, contradiction, qualification, and missing evidence behind a
> conclusion.
>
> Doubt is an Agent Skill plus a zero-dependency Node CLI. The agent produces a
> typed JSON reasoning record; a bundled offline validator rejects unsourced evidence,
> invalid source dates and locators, decorative sources, disconnected or cyclic edges, unsupported
> positions, and invented confidence percentages. It uses only Node.js built-ins,
> so sandboxed agents do not need npm access to produce a real receipt. A deterministic renderer then
> emits one HTML file with a linear brief and an interactive graph, with no CDN
> or server.
>
> The explicit `doubt verify` command can also retrieve every recorded source,
> match the excerpt, and bind the receipt to the retrieved bytes. If one source
> is unreachable or mismatched, it writes no attested output.
>
> The same contract ships as a reusable GitHub Action: it finds
> `*.doubt.json` maps, annotates invalid files, and writes content receipts and
> evidence counts to the job summary without installing a package.
>
> The default demo maps Agent Skills vs MCP from the official specifications;
> the gallery also includes a portability audit built from the Agent Skills
> specification and public client documentation:
>
> https://alsoleg89.github.io/doubt/
>
> A controlled Codex run also exposed a real failure mode: when the original
> skill could not reach npm, the agent claimed validation anyway. The same
> client, model, prompts, fixture, and sandbox now pass direct and implicit
> activation using the validator bundled inside the skill; the negative control
> still avoids activation. Both raw runs and exact receipts are committed.
>
> Repo: https://github.com/alsoleg89/doubt
>
> The adversarial contract benchmark is 21/21, but its scope is deliberately
> narrow: it tests structural traceability and safe rendering, not whether a
> source is true or an AI extracted it faithfully. I would especially value
> feedback on the JSON contract and whether the map beats a cited memo for a
> real contested decision.

## Reddit / developer communities

**Title**

> I built an open-source evidence map that refuses unsourced AI claims

**Body**

> Doubt turns a contested question into a portable reasoning artifact:
> claims, sourced observations, contradictions, qualifications, and explicit
> unknowns. Every evidence node needs publication and retrieval dates, a URL or
> local path, exact section/page/line locator, and a bounded excerpt.
>
> The AI proposes the map; a deterministic zero-dependency validator decides
> whether the evidence contract passes. The output is one interactive HTML file
> you can keep in git or share without an account.
>
> There is also a reusable Action for enforcing the contract in pull requests:
> `uses: alsoleg89/doubt@v0.8.0`.
>
> Live dogfood map: https://alsoleg89.github.io/doubt/
>
> Source: https://github.com/alsoleg89/doubt
>
> I am looking for adversarial fixtures: cases where a citation looks related
> but does not actually support the nearby claim, or where two sources appear to
> contradict only because their scope differs.

## X / Bluesky thread

1. AI research usually ends with prose. Prose is very good at hiding where the
   evidence stops.
2. I built Doubt: an open-source Agent Skill + zero-dependency CLI that turns a
   contested question into an interactive evidence map.
3. Four node types: position, claim, evidence, unknown. Four edges: supports,
   contradicts, qualifies, missing.
4. Every evidence node needs publication and retrieval dates plus an exact
   section/page/line locator. Decorative citations fail validation.
5. The renderer emits one self-contained HTML file with Brief and Map views. No
   account, backend, model key, CDN, or telemetry.
6. `doubt verify` explicitly re-fetches sources, matches excerpts, and hashes
   retrieved bytes; one failure means no attested output.
7. The reusable GitHub Action validates every `*.doubt.json` map in CI and
   leaves file annotations plus a receipt in the job summary.
8. The gallery includes a portability audit that keeps unsupported client
   behavior and missing cross-client tests visible. Live map:
   https://alsoleg89.github.io/doubt/
9. Repo + 21-case adversarial contract benchmark:
   https://github.com/alsoleg89/doubt

## Product Hunt

**Tagline**

> Make the evidence behind an AI answer navigable.

**Description**

> Doubt turns research and contested decisions into source-grounded,
> interactive evidence maps. Install the Agent Skill in Claude Code, Codex,
> Copilot, Cursor, or Gemini; validate the canonical JSON locally; share one
> self-contained HTML artifact.

## Release and launch order

1. Run `npm run release:check`. It must validate the full suite, the version and
   local tag, public metadata and Action pins, and the npm tarball inventory.
2. Push `main` without pushing tags. Wait for the Node 18/20/22 matrix, evidence
   contract, and Pages deployment to pass; then check the live homepage, both
   examples, playground, reader benchmark, sitemap, and `llms.txt`.
3. Build the final tarball with `npm pack`, publish that exact file to npm, and
   verify `npm view doubt-ai@0.8.0 version`, `npx --yes doubt-ai@0.8.0 --version`,
   and a clean `demo` plus `validate` smoke test.
4. Push only tag `v0.8.0`. Wait for the Release workflow and verify that the
   GitHub Release contains the npm tarball and the 0.8.0 changelog section.
5. Push the prepared `awesome-copilot` contribution branch and open its catalog
   PR only after the pinned npm version resolves. Recheck the two existing
   ready catalog PRs for maintainer feedback.
6. Post Show HN only after the live demo, npm package, GitHub Release, Action
   tag, and repository links all resolve.
7. Post one technically adapted version to the most relevant developer
   community; do not cross-post identical copy simultaneously.
8. Turn substantive feedback into public issues and ship the first response
   release before expanding distribution.
