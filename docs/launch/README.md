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
> typed JSON reasoning record; the validator rejects unsourced evidence,
> missing source locators, decorative sources, dangling edges, unsupported
> positions, and invented confidence percentages. A deterministic renderer then
> emits one interactive HTML file with no CDN or server.
>
> The same contract ships as a reusable GitHub Action: it finds
> `*.doubt.json` maps, annotates invalid files, and writes content receipts and
> evidence counts to the job summary without installing a package.
>
> I dogfooded it on the decision that selected this project from 105 AI OSS
> wedges. The map keeps the strongest objection and the still-missing human
> preference test visible:
>
> https://alsoleg89.github.io/doubt/
>
> Repo: https://github.com/alsoleg89/doubt
>
> The adversarial contract benchmark is 12/12, but its scope is deliberately
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
> unknowns. Every evidence node needs a date, URL or local path, exact
> section/page/line locator, and a bounded excerpt.
>
> The AI proposes the map; a deterministic zero-dependency validator decides
> whether the evidence contract passes. The output is one interactive HTML file
> you can keep in git or share without an account.
>
> There is also a reusable Action for enforcing the contract in pull requests:
> `uses: alsoleg89/doubt@v0.4.1`.
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
4. Every evidence node needs a dated source and exact section/page/line
   locator. Decorative citations fail validation.
5. The renderer emits one self-contained HTML file. No account, backend, model
   key, CDN, or telemetry.
6. The reusable GitHub Action validates every `*.doubt.json` map in CI and
   leaves file annotations plus a receipt in the job summary.
7. I used it to record why I rejected two other product directions—and kept the
   missing human-pull test visible. Live map:
   https://alsoleg89.github.io/doubt/
8. Repo + 12-case adversarial contract benchmark:
   https://github.com/alsoleg89/doubt

## Product Hunt

**Tagline**

> Make the evidence behind an AI answer navigable.

**Description**

> Doubt turns research and contested decisions into source-grounded,
> interactive evidence maps. Install the Agent Skill in Claude Code, Codex,
> Copilot, Cursor, or Gemini; validate the canonical JSON locally; share one
> self-contained HTML artifact.

## Launch order

1. Create the public GitHub repository and push `main`.
2. Enable GitHub Pages with GitHub Actions and verify the live map.
3. Publish `doubt-ai@0.4.1` and verify `npx doubt-ai demo`.
4. Tag `v0.4.1`; verify the GitHub Release tarball and CI matrix.
5. Post Show HN after the live demo, npm package, release, and repository links
   all resolve.
6. Post one technically adapted version to the most relevant developer
   community; do not cross-post identical copy simultaneously.
7. Turn substantive feedback into public issues and ship the first response
   release before expanding distribution.
