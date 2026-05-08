# 🧠 Causal Inference Consultant Skill

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![Version](https://img.shields.io/badge/version-1.0-blue.svg)]() [![Status](https://img.shields.io/badge/status-under%20development-orange.svg)]()

🎯 *An interactive consultant for causal reasoning, design, and analysis.*

---

## 📖 What This Skill Is About


This is a modular causal inference consultant skill for agent systems that load a top-level `SKILL.md` and then selectively read supporting references, subskills, scripts, and assets. It is designed to guide an interactive conversation: maintain a living understanding of the user's goal, provided data or planned data structure, timing, variables, and practical constraints; then adaptively recommend suitable causal designs, analytic methods, diagnostics, and software tools.

It is for data scientists, analysts, researchers, and domain experts who want a careful interactive guide rather than a black-box method picker. It helps users inspect provided data, clarify causal questions, plan data collection, specify estimands, check method conditions in intuitive language, draft R/Python analysis code, interpret results, and prepare reproducible reports. As new information appears, it can revise the route, narrow or change the estimand, suggest fallback analyses, or explain why a causal claim is not supported.

However, causal claims should never be stronger than the design, assumptions, diagnostics, and sensitivity checks can justify.

> 🧭 I cannot give you a definitive answer, but I can help you explore.

---

## 🚀 How to Activate

Say one of the following phrases in your request:

- "causal inference"
- "causal discovery"
- "policy effect estimation"
- "treatment decision making"

---

## 📦 How to Install

Different agent apps and operating systems may install skills slightly differently. In Codex, Claude Code, or another coding agent that can access GitHub and local files, the easiest approach is to ask your local AI assistant to adapt the install steps for your system:

```text
I want to install the causal-skills skill from https://github.com/rqzhu-aide/causal-skills so I can use it locally. Please figure out the right local install steps for my environment, install it as a local skill, and tell me whether I need to restart the app.
```

Example Windows PowerShell command for Codex:

```powershell
python "$env:USERPROFILE\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py" `
  --repo rqzhu-aide/causal-skills `
  --path . `
  --name causal-skills
```

If `causal-skills` is already installed, the installer may stop with a destination-exists error. For a clean reinstall on Windows, remove the existing local copy first:

```powershell
$skillPath = "$env:USERPROFILE\.codex\skills\causal-skills"
if (Test-Path $skillPath) {
  Remove-Item -LiteralPath $skillPath -Recurse -Force
}

python "$env:USERPROFILE\.codex\skills\.system\skill-installer\scripts\install-skill-from-github.py" `
  --repo rqzhu-aide/causal-skills `
  --path . `
  --name causal-skills
```

After installation, restart the agent app if needed so it can discover the new skill.

---

## 🧩 Architecture Principles

This skill treats causal inference as a sequence of design decisions, not as a single modeling command. The agent should first understand the user's need and data situation, then define the causal target, inspect or plan the data structure, compare feasible design routes, state assumptions, and only then choose methods, packages, or code resources.

The core workflow is organized as a reinforcement-learning-style coordination loop. The main skill is the policy actor: it speaks with the user, records the selected action, chooses which evaluator to refresh, decides when to ask for information, promotes or rejects routes, and owns the foundation gate. The four foundation subskills are state evaluators: Domain Helper, Data Technician, Design Planner, and DAG Builder each update only their own compact evaluator record and return readiness signals, implications, requests, blockers, and assumptions.

The evaluator loop is not a rigid cycle. A first pass usually starts with domain, data, design, and DAG checks, but later rounds are selected by priority. The main skill should run the smallest next check that is most likely to change the project state, break circular loops when feedback stops improving, and preserve user-directed continuation when the user prefers progress with clear validity limits.

Innovation is part of the architecture. Domain Helper can propose candidate formulations, Data Technician can surface data-enabled opportunities and method-fit suggestions, Design Planner can convert those seeds into route hypotheses, DAG Builder can audit their causal logic, and the main skill can promote the selected route into the shared route state.

The shared YAML is intentionally lean. It is a live state ledger for coordination, not a complete knowledge base. Detailed data audits, DAGs, route memos, diagnostics, code, and reports should live under `artifacts/` or `analyses/`, with compact summaries and links in `project.yaml`.

Tool fit, data suitability, and causal validity should be checked together. User-preferred packages or tools can be used, but only when their assumptions, supported estimands, diagnostics, and uncertainty estimates match the planned analysis. Method subskills may prepare plans and code skeletons, but substantial execution returns to the main skill for user confirmation and first-pass/diagnostic/final-report checkpoints.

The skill's role is not to make causal inference automatic. Its role is to make causal reasoning explicit, auditable, reproducible, and appropriately cautious.

---

## 🏗️ Overall Structure

The package is organized around an interactive consulting workflow. In the reinforcement-learning analogy, the user and project data provide observations, the foundation evaluators produce next-state signals and route-changing feedback, and the main skill chooses the next action while protecting causal validity.

See the canonical workflow diagram: [`assets/workflow-mermaid.md`](assets/workflow-mermaid.md).

1. 🔍 Identify the current interaction mode: learning, orientation, prospective planning, data audit, design triage, analysis planning, code drafting, result interpretation, or reporting.
2. 🗣️ Restate the user's goal in domain language and clarify only the treatment, comparator, outcome, timing, population, data structure, and deliverable details needed for the next step.
3. 🏛️ Keep the main skill and four backend foundation subskills active concurrently: the main skill speaks with the user, while domain support, Data Technician review, design planning, and DAG/causal logic update backend records.
4. 📋 In `evaluators.data_technician_02`, set `data_status` as `existing`, `partially existing`, `conceptual`, or `unknown`, and scope readiness to the route or next step. If data exist, audit rows, IDs, timing, assignment/exposure, repeated measures, clustering, missingness, censoring, and available covariates. If no data exist, record the expected schema or data requirements as conceptual. Before method execution, record method-fit suggestions so the main skill can distinguish data-compatible, fragile, and blocked methods.
5. 🗺️ Narrow to 1 to 3 plausible high-level design routes, state the key conditions for each, then use the DAG/causal-logic record to check identification, adjustment, and method-selection implications, constrained by data facts and design feasibility.
6. ⚙️ Activate one or more relevant candidate method subskills once the rough design is known and Data Technician method-fit suggestions are recorded or explicitly deferred. If a candidate route is rejected, record why, route back to the shortlist, and reconsider the best next route.
7. 🔬 Inside the activated subskill, refine the estimand, audit route-specific assumptions and failure modes, and decide whether the route is supported, fallback, rejected, or user-directed.
8. 📝 When the gate is ready, pause for a brief user confirmation of the planned treatment/exposure, comparator, outcome, unit/time, method family, diagnostics, and claim strength before substantial modeling.
9. 🔄 Run a first pass, interpret the preliminary result, then recommend diagnostics and sensitivity checks before moving to final reporting.
10. 📄 Produce a reproducible report with assumptions, diagnostics, limitations, and interpretation only when final reporting is requested or the remaining checks have been completed, deferred, or judged unnecessary.

Directory structure:

```text
causal-skills/
  SKILL.md
  README.md
  manifest.json
  references/
  subskills/
  scripts/
    python/
    R/
    java/
  assets/
```

The top-level `SKILL.md` should be loaded first. It uses progressive disclosure: start with intake and routing, then read only the subskills and references relevant to the user's question and data structure.

---

## 📈 Current Status & Completion Progress

The top-level workflow has been refactored around the lean actor/evaluator design. The main skill is the user-facing policy actor and gate owner. Domain Helper, Data Technician, Design Planner, and DAG Builder are the four foundation evaluators. Method subskills are now organized as lighter role modules: primary route modules, estimation and diagnostic support modules, target/outcome/decision modules, discovery modules, and reporting modules.

The strongest part of the package is now the foundation loop and project-state contract. The method stack is usable as a route-specific execution and feasibility layer, but many method modules are intentionally concise and should grow through focused examples, diagnostics, and software/package recipes rather than by adding more global YAML fields.

| Component | Status | Notes |
|---|---:|---|
| Main skill framework | Strong | User-facing policy actor, action selector, route promoter, foundation gate owner, user-directed continuation handler, and method-stack composer. |
| Lean project state and validator | Strong | `project.yaml` is now a compact live-state ledger with invariants for gate readiness, blocking evaluator requests, user-directed caution fields, route-scoped readiness, and load-bearing assumptions. |
| 01 - Domain Helper | Strong foundation evaluator | Integrates user expertise, field norms, measurement practice, candidate formulations, domain cautions, and implications for data, design, and DAG checks. |
| 02 - Data Technician | Strong foundation evaluator | Handles existing, partial, or conceptual data; records scoped data readiness, constructability, data-enabled opportunities, method-fit suggestions, and implications for domain/design/DAG review. |
| 03 - Design Planner | Strong foundation evaluator | Central route strategist that converts domain and data seeds into route hypotheses, records feasibility status, proposes fallbacks, and recommends route-changing next actions. |
| 04 - DAG Builder | Strong foundation evaluator | Audits causal logic, timing, variable roles, assumptions, identification status, method handoff warnings, and causal-logic alternatives. |
| 05 - Randomized Experiments | Lean primary route module | Checks experimental route fit, randomization/assignment structure, estimand support, diagnostics, and package/code feasibility. |
| 06 - Point-Treatment Observational | Lean primary route module | Checks target-trial framing, measured-confounding route fit, adjustment logic, overlap needs, and implementation handoff. |
| 07 - Matching / Weighting / Balance | Lean support module | Supports overlap, matching, weighting, balance diagnostics, and route-specific feasibility feedback. |
| 08 - Doubly Robust & Machine Learning | Lean support module | Supports AIPW, TMLE, DML, nuisance modeling, cross-fitting, and software/package fit after the causal route is explicit. |
| 09 - Heterogeneous Effects & Policy | Lean target/decision module | Supports subgroup effects, CATE/GATE, policy learning, individualized decisions, and validation requirements. |
| 10 - Longitudinal G-Methods | Lean primary route module | Supports time-varying treatments, regimes, MSM/IPW, g-formula, longitudinal TMLE, and time-order diagnostics. |
| 11 - Diff-in-Diff & Event Studies | Lean primary route module | Supports panel/staggered-adoption/event-study routes, parallel-trend logic, pre-period diagnostics, and modern DiD software handoff. |
| 12 - Regression Discontinuity | Lean primary route module | Supports cutoff-based routes, fuzzy/sharp RD distinctions, manipulation checks, bandwidth sensitivity, and package fit. |
| 13 - Instrumental Variables | Lean primary route module | Supports IV/LATE/CACE route checks, relevance/exclusion/monotonicity cautions, diagnostics, and user-directed caveats. |
| 14 - Synthetic Control & Time Series | Lean primary route module | Supports SCM, ITS, synthetic DiD, matrix-completion, and time-series counterfactual route checks. |
| 15 - Survival & Competing Risks | Lean target/outcome module | Supports time-to-event and competing-risk outcomes, time-zero audits, censoring concerns, and survival-scale estimands. |
| 16 - Mediation | Lean primary/target module | Supports total/direct/indirect effect routing, mediator timing, mediator-outcome confounding, and sensitivity handoff. |
| 17 - Interference & Spillovers | Lean primary route module | Supports spillover, network, cluster, market, and exposure-mapping route checks when SUTVA/simple no-interference fails. |
| 18 - Causal Discovery | Lean discovery module | Supports graph-hypothesis generation and comparison, with handoff back to foundation evaluators before effect-estimation claims. |
| 19 - Causal Genomics | Lean domain-specific route module | Supports genomics-specific causal routes such as MR, colocalization, fine mapping, TWAS/SMR, multi-omics, and ancestry/sample-overlap checks. |
| 20 - Reporting & Interpretation | Needs strengthening | Provides reporting handoff, but still needs stronger rubrics, examples, and claim-strength language tied to the lean gate. |
| 21 - Negative Controls & Proximal Causal Inference | New lean primary route module | Supports negative-control and proximal causal route checks when ordinary adjustment is fragile or unmeasured confounding is central. |

Overall: the architecture is now strong enough for real iterative use. The main improvement area is no longer the foundation design; it is focused hardening of the method modules with concrete examples, diagnostics, software recipes, and route-failure feedback patterns.
