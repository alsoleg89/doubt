# AI open-source category map for a 5,000-star project

Decision update (2026-07-30): the cross-category probe funnel selected
**Doubt Evidence Maps**—a source-grounded artifact skill and deterministic
renderer. See [the shortlist and two probe rounds](candidate-shortlist-2026.md).

Snapshot: 2026-07-30.

## Decision being made

The objective is not to invent a technically respectable AI repository. It is
to choose and ship an open-source product with a credible path to at least
5,000 GitHub stars.

The previous funnel compared 26 ideas concentrated inside agent reliability.
That was too narrow. This document resets the decision and scans twelve
macro-categories, more than eighty possible product wedges, recent winners,
weak signals, saturation, and distribution mechanics before selecting a build.

`doubt verify` is therefore a probe, not the chosen product.

## Method

This scan uses four kinds of evidence:

1. current GitHub repository metadata for projects created in 2026;
2. Star History category comparisons and 2026 monthly market roundups;
3. repeated independent winners rather than a single celebrity launch;
4. negative examples where a polished project in a plausible category remained
   below 5,000 stars.

Stars are an attention metric, not revenue or active use. Counts change
continuously and GitHub restricted some historical star access in July 2026, so
the numbers below are directional snapshots. A category is considered
**proven** only when multiple independent projects crossed 5,000 stars.

## What actually won in 2026

Representative repositories created in 2026:

| Cluster | Repository | Snapshot stars | Legible promise |
|---|---|---:|---|
| Agent skills | [affaan-m/ECC](https://github.com/affaan-m/ECC) | 236K | An entire agent performance system |
| Agent skills | [mattpocock/skills](https://github.com/mattpocock/skills) | 196K | A respected engineer's exact playbook |
| Agent workflow | [garrytan/gstack](https://github.com/garrytan/gstack) | 125K | Turn one coding agent into an engineering org |
| Design context | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | 105K | Drop a brand's design language into an agent |
| Code knowledge | [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | 99K | Turn a codebase into an explained knowledge graph |
| Token economics | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | 95K | Cut agent tokens by changing its language |
| Research automation | [karpathy/autoresearch](https://github.com/karpathy/autoresearch) | 92K | Let agents run ML research experiments |
| AI workspace | [nexu-io/open-design](https://github.com/nexu-io/open-design) | 83K | Agent-powered design studio with real exports |
| Global intelligence | [koala73/worldmonitor](https://github.com/koala73/worldmonitor) | 77K | A live, visual world intelligence dashboard |
| Agent management | [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | 75K | Manage agents at work |
| Token economics | [rtk-ai/rtk](https://github.com/rtk-ai/rtk) | 74K | Compress common command output by 60–90% |
| Code context | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | 64K | Give agents a local, always-current code graph |
| Context compression | [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) | 63K | Compress tool output before it reaches the model |
| Vertical workflow | [santifer/career-ops](https://github.com/santifer/career-ops) | 62K | Run an entire job search in an agent CLI |
| Vertical workflow | [ZhuLinsen/daily_stock_analysis](https://github.com/ZhuLinsen/daily_stock_analysis) | 60K | Automated market analysis and delivery |
| Fresh research | [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | 55K | Research what people said in the last 30 days |
| Voice | [jamiepine/voicebox](https://github.com/jamiepine/voicebox) | 47K | A local open-source AI voice studio |
| Video | [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | 44K | An agentic video production studio |
| Marketing | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 42K | Concrete marketing workflows for agents |
| Browser | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | 40K | A browser automation CLI made for agents |
| Video primitive | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 39K | Write HTML, render video |
| Routing | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | 35K | One endpoint with free-provider fallback |
| Local model choice | [AlexsJones/llmfit](https://github.com/AlexsJones/llmfit) | 31K | One command to find what runs on your hardware |
| Agent-native office | [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | 24K | Read and edit Office files without Office |
| OCR | [baidu/Unlimited-OCR](https://github.com/baidu/Unlimited-OCR) | 21K | Parse very long documents in one run |

The absolute counts are partly amplified by author or company distribution.
The stronger signal is repetition: token/context tools, concrete skills,
creative production, and outcome-specific verticals each produced several
independent winners.

## The winner pattern

The strongest 2026 projects usually combine at least four of these:

- **A result, not an adjective.** “Find jobs” or “render video” beats “make the
  agent more reliable.”
- **Five-minute proof.** One command creates something visible or measures a
  painful number.
- **Existing distribution rail.** The project plugs into Claude Code, Codex,
  Cursor, OpenCode, browsers, git, Markdown, or a popular file format.
- **No new subscription.** It is local, uses an existing model subscription, or
  works with free/BYOK providers.
- **A shareable artifact.** Video, graph, report, dashboard, diff, skill, or
  benchmark result makes the tool travel.
- **A headline metric.** Tokens saved, jobs scored, files parsed, tasks
  completed, or models supported.
- **Cross-agent portability.** The user does not have to bet on one model.

The July 2026 Star History analysis adds a second route: an embeddable building
block can spread through other products faster than a standalone application.
Pierre's diff primitives crossed roughly 5.5K in ten months, while libghostty
reached millions of downstream users through other terminal apps.

## Category scorecard

These grades evaluate suitability for a new, small team pursuing GitHub
attention, not total market value.

| Macro-category | Independent 5K evidence | 2026 velocity | Whitespace | Demo power | Buildability | 5K posture |
|---|---|---|---|---|---|---|
| 1. Agent harnesses and orchestration | Very high | High | Low | High | Medium | B−: large but platform war |
| 2. Skills and executable playbooks | Very high | Very high | Medium | Medium | Very high | A− if outcome-specific |
| 3. Context, code intelligence, memory, token economics | Very high | Very high | Medium | High | High | A |
| 4. Browser and computer use | High | High | Medium | Very high | Medium | B+ |
| 5. Local inference and model routing | Very high | Medium | Medium | High | Medium | B |
| 6. Creative production: design, video, voice | Very high | Very high | High | Very high | Medium | A |
| 7. Knowledge, research, documents, OCR | High | High | High | High | High | A− |
| 8. Vertical outcome workflows | Very high | Very high | Very high | High | High | A+ |
| 9. Agent security, reliability, governance | Weak outside security brands | Medium | Medium | Low | High | C+ |
| 10. AI-native workspaces, desktop and TUI | High | High | Medium | Very high | Medium | B+ |
| 11. Agent-native building blocks and file primitives | High | High | High | High | Medium | A |
| 12. Model development, data and eval automation | Mixed; brand-heavy | Medium | Medium | Medium | Low | C+/B− |

## 1. Agent harnesses and orchestration

**Evidence.** Paperclip reached about 75K; Multica 43K; Orca 34K; Symphony
26K. Older orchestration leaders are much larger. The category is proven but
dominated by platforms that want to own the whole workflow.

**Unoccupied or partially occupied wedges:**

1. Crash-proof checkpoint and recovery runtime for long agent tasks.
2. Cross-agent worktree scheduler that prevents conflicting edits.
3. Agent fleet inbox with typed requests, receipts, and ownership.
4. Budget-aware task router across local and cloud agents.
5. Portable handoff bundle between Claude Code, Codex, and OpenCode.
6. Long-running agent supervisor with pause, approval, and resume.
7. Deterministic task ledger that survives context compaction.

**Falsifier.** If the product needs users to replace their current harness
before seeing value, the wedge is too broad.

## 2. Skills and executable playbooks

**Evidence.** ECC, mattpocock/skills, gstack, design collections, marketing
skills, academic research skills, and PM skills all crossed 20K. A prompt pack
can win, but only when it packages trusted expertise or a complete job.

**Possible wedges:**

1. Open-source maintainer skill: triage issue to verified minimal reproduction.
2. Customer-support engineer skill: ticket to diagnosis and response draft.
3. Release-launch skill: changelog, demo, docs, announcement, and feedback loop.
4. Migration skill packs for difficult framework or database upgrades.
5. Design-QA skill that compares implementation against screenshots and tokens.
6. Compliance evidence skill that assembles controls from a repository.
7. Technical due-diligence skill that audits product, code, and claims.
8. Incident commander skill that maintains timeline, hypotheses, and postmortem.

**Falsifier.** A behavioral promise such as “be honest” without a finished
artifact repeats the anti-sycophancy failure.

## 3. Context, code intelligence, memory, and token economics

**Evidence.** Graphify 99K, Caveman 95K, RTK 74K, Codegraph 64K, Headroom 63K,
and several code-memory tools above 25K. This is the clearest repeated 2026
cluster, but generic compression and generic code graphs are now occupied.

**Possible wedges:**

1. Context compiler that shows and budgets every instruction source.
2. `git blame` for agent context: why was this token included?
3. Portable session-resume capsule across agent vendors.
4. Cross-agent semantic cache for repeated repository questions.
5. Task-specific repository slicer with a proof of completeness.
6. Binary, log, and JSON output compressor with semantic invariants.
7. Context regression benchmark for pull requests.
8. Context leak detector for secrets and irrelevant private data.

**Falsifier.** “Fewer tokens” without a reproducible quality-preservation
benchmark will be dismissed as lossy summarization.

## 4. Browser and computer use

**Evidence.** Agent Browser 40K, CloakBrowser 29K, OpenCLI 27K, UI-TARS Desktop
roughly 30K, and multiple sandbox projects above 10K. The visible demo is
excellent; browser infrastructure and generic harnesses are crowded.

**Possible wedges:**

1. Record a human browser workflow and compile it into an agent skill.
2. Deterministic browser macro compiler with model fallback only on drift.
3. Computer-use benchmark generated from a user's own web application.
4. Accessibility action-map generator for reliable agent control.
5. Browser-state time machine: DOM, screenshot, storage, and network diff.
6. Human approval boundary UI for sensitive clicks and submissions.
7. Local authenticated-session bridge that never exports cookies.
8. Cross-browser task replay with a portable trace format.

**Falsifier.** If the demo works only on a curated website and cannot survive
ordinary UI drift, it is a toy.

## 5. Local inference and model routing

**Evidence.** Local runners such as llama.cpp are above 100K. Newer wedges also
win: OmniRoute 35K, llmfit 31K, and Colibri 21K. Generic “run models locally”
is mature; hardware fit, privacy, and specialized runtimes remain legible.

**Possible wedges:**

1. Hardware-aware model chooser with measured speed and memory.
2. Reproducible workload benchmark recipes, not generic leaderboards.
3. Local multimodal runtime for documents, audio, and screenshots.
4. Quantization and model-format doctor with automatic repair paths.
5. Local tool-use gateway compatible with major agent protocols.
6. Energy, latency, and cost profiler for local versus API inference.
7. Private on-device computer-use bundle for commodity laptops.
8. Automatic small-model cascade before frontier-model escalation.

**Falsifier.** Supporting a long model list is not a wedge unless setup or
runtime economics improve visibly.

## 6. Creative production: design, video, voice

**Evidence.** Open Design 83K, Voicebox 47K, OpenMontage 44K, Hyperframes 39K,
Frontend Slides 27K, and multiple design skills above 20K. Outputs are naturally
visual and shareable, giving this category unusually strong launch material.

**Possible wedges:**

1. Screenshot-to-editable design system and component inventory.
2. Product brief to storyboard, shot list, assets, and final demo video.
3. Local podcast post-production: edit, chapters, clips, and show notes.
4. Multilingual dubbing pipeline with speaker and timing preservation.
5. Dataset or report to animated explainer video.
6. Slide visual-QA and automatic layout repair.
7. Brand-kit compiler that generates portable agent design context.
8. AI-asset provenance and editable-source bundle.
9. Screen recording to polished product-launch video.

**Falsifier.** If the output is merely a template gallery rather than an
editable artifact, novelty will decay quickly.

## 7. Knowledge, research, documents, and OCR

**Evidence.** World Monitor 77K, Last 30 Days 55K, academic research skills 40K,
Unlimited OCR 21K, and RAGFlow above 80K. Generic RAG is saturated; freshness,
evidence, document fidelity, and monitoring are more open.

**Possible wedges:**

1. Research freshness monitor that alerts when a conclusion becomes stale.
2. Source-disagreement map with claims, evidence, and unresolved conflicts.
3. Multimodal PDF evidence extractor preserving page and region provenance.
4. RAG debugger that shows the exact missed or misleading chunk.
5. OCR pipeline with layout, table, and confidence provenance.
6. Reproducible research bundle: sources, snapshots, claims, and notebook.
7. Citation-decay monitor for documentation and reports.
8. Local knowledge ingestion with deletion and provenance guarantees.
9. Change-intelligence dashboard for a chosen market or technology.

**Falsifier.** Another chat box over uploaded documents has no category wedge.

## 8. Vertical outcome workflows

**Evidence.** Career Ops 62K, Daily Stock Analysis 60K, Marketing Skills 42K,
Anthropic Financial Services 34K, AI Job Search 29K, OfficeCLI 24K, and OpenMAIC
20K. This category has the strongest whitespace because each profession contains
many unfinished workflows.

**Possible wedges:**

1. GitHub issue to verified minimal reproduction and failing test.
2. Support ticket to reproduction, root-cause candidates, and response draft.
3. RFP or procurement comparison with requirement-level evidence.
4. Pitch deck and repository technical due diligence.
5. Vendor security questionnaire answered from code and policies.
6. Sales account change dossier from public and internal sources.
7. Grant application compiler with evidence and compliance checklist.
8. Incident timeline and postmortem builder from logs and conversations.
9. Customer feedback to deduplicated evidence-backed roadmap.
10. Product analytics anomaly to investigation notebook.
11. Regulatory update to repository impact map.
12. Research paper to executable reproduction plan.

**Falsifier.** The workflow must occur frequently enough and use files or tools
the user already has. A rare high-value task can be a business but still be a
poor GitHub-star engine.

## 9. Agent security, reliability, and governance

**Evidence.** NVIDIA NemoClaw reached about 22K with brand and infrastructure
distribution, but Snyk Agent Scan remained around 2.8K and polished local
observability products remained tiny. Anti-sycophancy repositories were mostly
below 5 stars. The pain is real; broad developer pull is unproven.

**Possible wedges:**

1. Runtime egress and data-loss-prevention gate for local agents.
2. Capability diff showing new powers introduced by config changes.
3. Tamper-evident agent session receipt and forensic replay.
4. Benchmark anti-cheat sandbox for hidden tests and gold patches.
5. Mutation gate proving AI-generated tests catch realistic defects.
6. Prompt and data taint tracking across tools.
7. Human-approval policy compiler shared across agent vendors.
8. Reproducible lockfile for skills, tools, permissions, and models.

**Falsifier.** If the primary user is a governance buyer rather than the
developer starring the repository, distribution must come through CI artifacts
or an upstream integration.

## 10. AI-native workspaces, desktop applications, and TUI

**Evidence.** Odysseus 84K, Open Design 83K, cmux 25K, Claude HUD 27K, and older
terminal tools from 30K to 80K. Star History's June analysis shows that a TUI
wins when it replaces one frequent GUI job rather than becoming a generic shell.

**Possible wedges:**

1. Agent-session multiplexer with visual state and notifications.
2. AI-native git TUI centered on generated changes and review.
3. Agent-aware file explorer showing ownership and context.
4. Local research TUI with sources, claims, and snapshots.
5. Visual player for portable agent traces.
6. Markdown workflow IDE for executable playbooks and artifacts.
7. Desktop model-behavior diff lab.
8. Local inbox where humans and agents exchange typed work.
9. TUI for reviewing and approving tool calls across sessions.

**Falsifier.** “All your agents in one app” competes with platform products. A
winning interface must replace one specific daily job.

## 11. Agent-native building blocks and file primitives

**Evidence.** Pierre's diff/file-tree primitives crossed roughly 5.5K in ten
months; Pretext 50K; CLI-Anything 46K; Google Workspace CLI 30K; DESIGN.md 27K;
OfficeCLI 24K. Star History's July thesis is that agents accelerate adoption of
well-documented components they can assemble.

**Possible wedges:**

1. Portable permissions manifest for agent tools and workflows.
2. Open artifact format for agent runs, evidence, and resumable state.
3. Embeddable diff/explanation viewer for AI code-review products.
4. Screenshot annotation and region-reference primitive for agents.
5. Office-document AST and rendering toolkit.
6. Agent-safe shell-output parser with structured semantics.
7. Local-first sync store for agent state and artifacts.
8. Skill compatibility transpiler across major agent harnesses.
9. Embeddable approval UI for risky agent actions.
10. Deterministic Markdown-to-rich-artifact renderer for agents.

**Falsifier.** A building block needs at least three credible downstream
consumers and excellent agent-readable documentation before launch.

## 12. Model development, data, eval, and research automation

**Evidence.** Autoresearch reached 92K, but it benefits from Karpathy's
distribution. Unlimited OCR and OpenMAIC crossed 20K, while Meta's generic
Synthetic Data Kit remained around 1.6K. Research novelty alone does not ensure
developer stars.

**Possible wedges:**

1. Autoresearch loop generated for an arbitrary repository and objective.
2. Eval-dataset mutation engine that exposes brittle benchmarks.
3. Synthetic-data contamination and duplication detector.
4. Training-data provenance ledger with reversible dataset builds.
5. Domain fine-tune recipe compiler from documents and failure cases.
6. Multimodal dataset visual-QA workbench.
7. Local benchmark harness with reproducible hardware receipts.
8. Semantic behavior diff across model or prompt upgrades.
9. Failed-agent-run miner that generates new eval cases.

**Falsifier.** If value appears only after expensive training or a large
proprietary dataset, a small open-source launch cannot demonstrate it.

## Negative evidence that matters

These are not bad products. They show that plausible pain does not automatically
produce stars:

- [Snyk Agent Scan](https://github.com/snyk/agent-scan) was around 2.8K despite
  a strong brand and acute agent-security positioning.
- [Agent Replay](https://github.com/AgentReplay/agent-replay) was around 14
  stars despite a polished local-first observability story.
- [Agnix](https://github.com/agent-sh/agnix) was around 295 stars in the hot
  agent-configuration space.
- [AgentSys](https://github.com/agent-sh/agentsys) was around 877 stars.
- Generic synthetic data did not receive the attention implied by the overall
  AI-data market.
- Anti-sycophancy skills solved a recognizable annoyance but produced almost no
  repeated use, visible artifact, or distribution loop.

The lesson is not “avoid security” or “avoid evals.” It is that invisible
quality improvements are poor star products unless attached to an artifact
developers publicly encounter.

## Initial cross-category deductions

1. **Vertical outcome plus reusable primitive is the strongest combination.**
   A workflow gives an instantly legible demo; the primitive gives ecosystem
   distribution.
2. **Token/context is proven but late.** A new entrant needs a different object
   than another compressor or code graph.
3. **Creative tools have the best launch media.** They also face a high product
   quality bar and nontrivial model/runtime costs.
4. **Skills are a distribution format, not a category.** We should package a
   workflow as a skill only after choosing the workflow.
5. **Agent reliability is a feature unless it emits a result users already
   need.** The original Doubt thesis can survive as an internal mechanism.
6. **A project with no natural screenshot, report, benchmark, or generated file
   starts with a growth handicap.**
7. **Celebrity launches must be discounted.** Repeated independent winners are
   stronger evidence than a single enormous curve.

## Gate for the next stage

No production build is selected from this document alone. The next stage will:

1. score individual wedges rather than whole categories;
2. identify direct competitors and failed predecessors for the top candidates;
3. test whether each has a five-minute demo and a built-in distribution loop;
4. reduce the list to ten candidates;
5. falsify those ten before building three cheap probes.

That stage is now tracked in
[`candidate-shortlist-2026.md`](candidate-shortlist-2026.md).

## Main sources

- [Current GitHub repository search snapshot](https://github.com/search?q=created%3A%3E2026-01-01+stars%3A%3E1000&type=repositories&s=stars&o=desc)
- [Star History category comparisons](https://www.star-history.com/compare/)
- [Star History: Skills, March 2026](https://www.star-history.com/blog/skills/)
- [Star History: Computer Use, April 2026](https://www.star-history.com/blog/computer-use/)
- [Star History: Standalone Markdown Editors, May 2026](https://www.star-history.com/blog/standalone-markdown-editor/)
- [Star History: Terminal UI, June 2026](https://www.star-history.com/blog/terminal-ui/)
- [Star History: Building Blocks, July 2026](https://www.star-history.com/blog/building-blocks/)
