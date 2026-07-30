# Candidate shortlist and falsification funnel

Snapshot: 2026-07-30.

This is stage two of the category research. The funnel starts with 105 wedges
across twelve categories and selects ten for direct-competitor and failure-mode
analysis. Scores are hypotheses, not permission to build.

```text
105 category wedges
        ↓ repeated 5K evidence + five-minute demo + distribution loop
10 falsification candidates
        ↓ competitor, feasibility, and artifact tests
3 cheap probes
        ↓ measured wow and pull
1 release-grade project
```

## Scoring

Each factor is rated 0–5 and converted to a 100-point score:

- GitHub audience breadth: 20%
- Frequency and severity of pain: 15%
- Five-minute demo quality: 15%
- Built-in distribution loop: 15%
- Whitespace after competitors: 15%
- Thirty-day buildability: 10%
- Low operating cost: 5%
- Fit with our demonstrated artifact/research strengths: 5%

## The ten

| Rank | Candidate | Score | Current verdict |
|---:|---|---:|---|
| 1 | ProofGate for maintainers | 88 | Probe only; hot pain, existing blockers are weak |
| 2 | LaunchKit: repository to launch artifacts | 87 | Rejected: failed 1/3 repos; direct RepoClip/OpenMontage overlap |
| 3 | Context Blame | 85 | Probe; strongest infra wedge if true context is obtainable |
| 4 | Evidence Map | 83 | **Selected:** artifact skill + fail-closed source contract |
| 5 | Design Contract | 83 | Hold/probe; strong demo, adjacent tools exist |
| 6 | Artifact QA | 82 | Probe; valuable block, difficult cross-format correctness |
| 7 | TopicWatch | 81 | Rejected: useful only after narrowing to GitHub search |
| 8 | AppBench | 80 | Hold; viral benchmark output, heavy environment setup |
| 9 | Data to Story | 78 | Hold; visual loop, expensive quality bar |
| 10 | Support Repro | 74 | Hold; acute pain, reproduction success is the whole product |

## 1. ProofGate for maintainers

**Promise:** every issue or pull request must bring executable evidence, not
vibes. The product attempts a reproduction, checks claimed commands and tests,
and posts a compact receipt.

**Why it can travel:** it appears on public issues and pull requests. Every run
is a visible artifact. Maintainers currently describe AI slop as a DDoS-like
burden, and GitHub changed its bug-bounty process after low-quality AI reports.

**Competition and warning:**

- [anti-slop](https://github.com/peakoss/anti-slop) already closes suspicious
  pull requests but had only about 681 stars.
- [GitHub Spec Kit bug workflows](https://github.github.com/spec-kit/reference/agentic-bugfix.html)
  assess, fix, and validate bug reports.
- [Elastic AI bug hunting](https://elastic.github.io/ai-github-actions/workflows/gh-agent-workflows/bugs/)
  files only concretely reproduced findings.
- AI-text detection is unreliable and creates contributor hostility.

**Wedge:** verify the submission, never classify the author as AI. A failing
test, deterministic script, exact command receipt, or `UNREPRODUCED` verdict is
the product.

**Kill gate:** on 30 real issues, it must produce useful executable evidence on
at least 40% without more than 10 minutes of maintainer setup.

## 2. LaunchKit: repository to launch artifacts

**Promise:** point an agent at a working repository and receive a verified demo
script, polished GIF/video, README hero, screenshots, release notes, and a
channel-specific launch bundle.

**Why it can travel:** every output is public launch media. The project can
demonstrate itself by generating its own launch.

**Competition and warning:**

- [OpenMontage](https://github.com/calesthio/OpenMontage) includes a screen-demo
  video pipeline.
- [Garden Skills](https://github.com/ConardLi/garden-skills) includes web video
  and presentation workflows.
- [Marketing Skills](https://github.com/coreyhaines31/marketingskills) and many
  newer skill packs cover positioning and copy.
- Generic README generators already exist in large numbers.

**Wedge:** not marketing advice and not a template pack. It must execute the
product, capture a truthful workflow, and emit editable launch artifacts linked
to the exact release.

**Kill gate:** three unfamiliar repositories must yield a publishable hero
artifact with less than ten minutes of manual editing.

## 3. Context Blame

**Promise:** show exactly what instructions, files, tools, memories, and prior
messages reached an agent; attribute every token to a source; explain what was
shadowed, duplicated, compacted, or omitted.

**Why it can travel:** context/token economics produced many independent
20K–100K winners. A visual flame graph and “tokens wasted” number make the
invisible visible.

**Competition and warning:**

- GitHub Copilot already exposes a coarse `/context` visualization.
- [Entire](https://github.com/entireio/cli) captures sessions alongside git.
- [Agent Sessions](https://github.com/jazzyalex/agent-sessions) browses and
  resumes local histories.
- Instruction linters such as Agnix received little attention.
- Some vendors do not expose their complete assembled prompt.

**Wedge:** provenance and counterfactual analysis, not another transcript
viewer: “remove this MCP schema and save 18%” or “this nested rule overrode the
root instruction.”

**Kill gate:** obtain a truthful, source-attributed context model for at least
three major coding agents without patching their proprietary binaries.

## 4. Evidence Map

**Promise:** turn a question and source set into an interactive map of claims,
support, contradiction, missing evidence, and time decay.

**Why it can travel:** the graph is a standalone URL/HTML artifact. Research,
freshness, and visual knowledge projects repeatedly crossed 20K.

**Competition and warning:**

- Deep-research and RAG tools already synthesize sources.
- Knowledge-graph generators such as Graphify are enormous.
- Fact-checkers often hide retrieval errors behind authoritative prose.

**Wedge:** preserve disagreement instead of collapsing it into one answer.
Every edge must open the quoted source region and snapshot date.

**Kill gate:** on five contested topics, domain readers must find the map more
useful than a cited research memo and identify no fabricated evidence edges.

## 5. Design Contract

**Promise:** derive a portable design contract from an existing application,
then check every agent-generated UI change against it across breakpoints.

**Why it can travel:** before/after screenshots and a generated `DESIGN.md` are
highly shareable; design skills were among 2026's largest repositories.

**Competition and warning:**

- [Google DESIGN.md](https://github.com/google-labs-code/design.md) specifies a
  design-context format.
- [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) distributes
  extracted brand playbooks.
- [Dembrandt](https://github.com/thevangelist/dembrandt) already extracts
  website design tokens and had about 1.9K stars.
- Visual-regression tools such as Lost Pixel already compare screenshots.

**Wedge:** combine explainable contract extraction with review of a real code
diff. Detect system drift, not pixel drift.

**Kill gate:** on three established design systems, the generated contract must
catch seeded violations with high precision and avoid flagging legitimate new
components.

## 6. Artifact QA

**Promise:** render AI-generated PPTX, DOCX, XLSX, PDF, and HTML, then detect
clipping, overflow, broken contrast, unreadable density, missing assets, and
cross-page inconsistency; optionally return machine-readable repair targets.

**Why it can travel:** it is an embeddable block for every document-producing
agent and emits immediate visual reports.

**Competition and warning:**

- [OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) already renders and edits
  Office documents for agents.
- [Univer](https://github.com/dream-num/univer) is a large embeddable office
  SDK.
- document-generation skills commonly implement their own render/check loops.

**Wedge:** quality oracle and repair coordinates, not document creation. It
should work with artifacts created by any library or agent.

**Kill gate:** a deterministic core must catch at least 80% of seeded layout
defects across two formats with less than 10% false positives.

## 7. TopicWatch

**Promise:** describe a market, technology, company set, or policy question and
generate a self-updating local intelligence dashboard with source deltas and
alerts.

**Why it can travel:** World Monitor, Last 30 Days, Daily Stock Analysis, and
related intelligence dashboards prove broad appetite. Live dashboards are
excellent demos.

**Competition and warning:**

- [World Monitor](https://github.com/koala73/worldmonitor) and
  [Crucix](https://github.com/calesthio/Crucix) cover broad OSINT.
- `changedetection.io` covers generic page change detection.
- Arbitrary topics often lack stable, free, structured sources.

**Wedge:** generate the monitor itself from a research brief, including source
connectors, schema, historical snapshot, and confidence rules.

**Kill gate:** three different topics must reach a useful first dashboard in
under five minutes without paid data APIs.

## 8. AppBench

**Promise:** point the tool at a local or staging application; it discovers
meaningful user jobs and emits a reproducible computer-use benchmark with
fixtures, reset hooks, success oracles, recordings, and a public scorecard.

**Why it can travel:** benchmark results and badges create a natural public
loop. Every app team now wants to know whether agents can use its product.

**Competition and warning:**

- [AgentLab](https://github.com/ServiceNow/AgentLab) and browser benchmarks
  already evaluate web agents.
- [Browser Use](https://github.com/browser-use/browser-use) publishes a task
  benchmark.
- [Webwright](https://github.com/microsoft/Webwright) produces rerunnable
  browser programs.
- Resetting application state and defining truthful success oracles are hard.

**Wedge:** generate the benchmark from *your* product, not another fixed public
leaderboard.

**Kill gate:** create ten stable tasks and oracles for two unfamiliar apps with
less than one hour of human configuration per app.

## 9. Data to Story

**Promise:** turn a CSV, notebook, or research report into an editable,
source-linked narrated explainer video.

**Why it can travel:** the output is the marketing loop. Video, voice, and
presentation projects repeatedly exceeded 20K in 2026.

**Competition and warning:**

- OpenMontage covers full agentic video production.
- Hyperframes and Remotion make code-to-video easy.
- presentation skills already turn research into animated slides.
- Rendering is easy; editorial judgment is difficult.

**Wedge:** every visual and spoken claim remains linked to an input cell,
calculation, or source passage.

**Kill gate:** a domain reader must verify every quantitative claim from the
video without opening the implementation, and the result must be publishable
after less than ten minutes of editing.

## 10. Support Repro

**Promise:** turn a support ticket, Sentry event, session recording, and codebase
into a deterministic reproduction, failing test, suspected code path, and
customer-safe response.

**Why it can travel:** the artifact directly removes high-frequency engineering
work. Support and developer teams share the output.

**Competition and warning:**

- July 2026 research [ReProAgent](https://arxiv.org/abs/2607.09123) reports
  58–70% issue reproduction on benchmark subsets.
- Metabase published its internal Repro-Bot.
- FixFirstly and repro.dev are commercial products in adjacent positions.
- GitHub Spec Kit now includes bug assess/fix/test workflows.

**Wedge:** connect production evidence to executable reproduction, rather than
starting only from issue prose.

**Kill gate:** on ten real, instrumented incidents, reach a useful reproduction
or evidence-backed localization on at least half.

## Attractive ideas already killed

| Idea | Reason to stop now |
|---|---|
| Record browser workflow → reusable automation | Directly occupied by browser-use/workflow-use and OpenAdapt |
| Generic Office AST/renderer | OfficeCLI and Univer already own the obvious pitch |
| Open agent trace format | OpenTelemetry GenAI conventions and Cursor Agent Trace |
| Open-source Screen Studio clone | Cap, Recordly, OpenScreen, and Screenity |
| Generic browser agent | Browser Use, Agent Browser, Skyvern, Webwright, and many more |
| Generic agent session manager | Entire, Agent Sessions, cmux, Orca, and multiple TUIs |
| URL → design tokens | Dembrandt already ships the one-command version |
| AI-slop text detector | technically unreliable, socially adversarial, and anti-slop remained small |
| Generic presentation generator | Presenton and several mature products |
| Prompt-only anti-sycophancy | no benchmark uplift in our test and almost no category pull |

## Probe selection rule

The final three probes should not be the top three scores by default. They
should maximize information gain:

1. one GitHub-native distribution loop;
2. one visual/artifact primitive;
3. one context or research infrastructure wedge.

A probe is allowed at most one day and must produce the exact public artifact
that would sell the final project. A CLI skeleton, landing page, or architecture
diagram is not a probe.

## Probe round one results

| Probe | Artifact | Technical result | Market result | Decision |
|---|---|---|---|---|
| ProofGate | [Sample GitHub report](../probes/proofgate/sample-comment.md) | Strong: exposed five verification smells despite a green test command | Reliability and anti-slop tools show weak star conversion | Hold as a feature, not a standalone product |
| Context Blame | [Runnable probe](../probes/context-blame/) | Mixed: produced attribution, but nested scopes can inflate totals and final vendor context is unavailable | Context economics is proven, but the truthful wedge is unresolved | Hold until three-agent scope can be proven |
| Artifact QA | [Visual report](../probes/artifact-qa/sample-report.html) | Strong: found clipping, overlap, contrast, and canvas defects missed by the standard overflow check | SlideGlance already has a 30-rule lint pass with 2 stars; pptx-lint has 0 | Kill as standalone; retain as a module inside an outcome workflow |

The first round intentionally produced no winner. A technically impressive
artifact is insufficient when direct category evidence says the standalone
position does not attract stars. The next probes move upward from quality
infrastructure to public outcomes: launch artifacts, evidence maps, and
configurable intelligence.

## Probe round two results

Snapshot: 2026-07-30.

| Probe | Artifact | Technical result | Market result | Decision |
|---|---|---|---|---|
| LaunchKit | [Three generated launch pages](../probes/launchkit/) | Two pages were publishable; the repository without useful product metadata produced attractive generic filler | RepoClip already reports hundreds of repo-to-video outputs; OpenMontage (44,144 stars) contains a Screen Demo pipeline | Reject standalone; keep launch media as a future distribution module |
| Evidence Map | [Production dogfood map](../examples/what-should-doubt-become.html) | Strong: self-contained, clickable source locators, contradiction/unknown filters, visual edges, and fail-closed structural validation | Direct tools are tiny (`tension-map` 0; Valsci 12), while adjacent verifiable artifact skills already passed 5K (`archify` 8,163; `drawio-skill` 6,923) | Select and build as Doubt core |
| TopicWatch | [Three GitHub dashboards](../probes/topicwatch/) | Three dashboards generated in seconds from a keyless public API | The generic promise disappeared after narrowing to GitHub; direct GitHub-intelligence repos had 9 and 18 stars | Reject general product; retain category data as research input |

## Winner decision

Doubt becomes an Agent Skill plus deterministic CLI that turns a contested
question into a source-grounded evidence map:

```text
question
  → claims / evidence / explicit unknowns
  → supports / contradicts / qualifies / missing
  → exact dated source regions
  → canonical JSON + self-contained interactive HTML
```

This is deliberately not a collaborative argument platform and not a research
chatbot. The distribution wedge is the finished public artifact; the trust
wedge is a validator that rejects unsourced evidence, unused sources, invented
confidence percentages, and unsupported positions.

The full original human-preference gate remains open: domain readers have not
yet proven that the map beats a well-cited memo. That uncertainty is represented
inside the dogfood map rather than hidden. It does not block the MVP because the
artifact, market adjacency, and technical contract are now strong enough to
justify a public falsification round.
