# Causal Inference Consultant Skill

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![Version](https://img.shields.io/badge/version-1.0-blue.svg)]() [![Status](https://img.shields.io/badge/status-under%20development-orange.svg)]()

## What This Skill Is About

---

This is a modular causal inference consultant skill for agent systems that load a top-level `SKILL.md` and then selectively read supporting references, subskills, scripts, and assets. It is designed to guide an interactive conversation: first understand the user's goal, provided data or planned data structure, timing, variables, and practical constraints; then adaptively recommend suitable causal designs, analytic methods, diagnostics, and software tools.

It is for data scientists, analysts, researchers, and domain experts who want a careful interactive guide rather than a black-box method picker. It helps users inspect provided data, clarify causal questions, plan data collection, specify estimands, check method conditions in intuitive language, draft R/Python analysis code, interpret results, and prepare reproducible reports. As new information appears, it can revise the route, narrow or change the estimand, suggest fallback analyses, or explain why a causal claim is not supported.

However, causal claims should never be stronger than the design, assumptions, diagnostics, and sensitivity checks can justify.

> I cannot give you a definitive answer, but I can help you explore.

---

## How to Activate

Say one of the following phrases in your request:

- *"causal inference"*
- *"causal discovery"*
- *"policy effect estimation"*
- *"treatment decision making"*

---

## Current Status

The top-level workflow and routing architecture are in place. Randomized experiments, DAG/identification, point-treatment observational analysis, matching/weighting/balance, doubly robust ML, heterogeneous effects/policy, longitudinal g-methods, DiD/event studies, regression discontinuity, instrumental variables, and causal discovery are the most developed analysis subskills. Prospective design planning is available as a lightweight routing subskill for users who do not yet have data. Several remaining subskills still need deeper examples, diagnostics, and package-specific recipes.

## Overall Structure

The package is organized around an interactive consulting workflow.

See the canonical workflow diagram: [`assets/workflow-mermaid.md`](assets/workflow-mermaid.md). A legacy standalone HTML diagram is also included at [`assets/causal-skills-workflow-diagram.html`](assets/causal-skills-workflow-diagram.html), but the Mermaid diagram should be treated as the current architecture reference.

1. Identify the current interaction mode: learning, orientation, prospective planning, data audit, design triage, analysis planning, code drafting, result interpretation, or reporting.
2. Restate the user's goal in domain language and clarify only the treatment, comparator, outcome, timing, population, data structure, and deliverable details needed for the next step.
3. Determine whether data already exist. If not, activate prospective design planning and create a study or data-collection blueprint instead of jumping to model code.
4. If data exist, audit the data structure: rows, IDs, timing, assignment/exposure, repeated measures, clustering, missingness, censoring, and available covariates.
5. Narrow to 1 to 3 plausible design routes, state the key conditions for each, and use a lightweight DAG, design diagram, assignment summary, or variable-role map when it helps judge feasibility.
6. Activate one or more relevant candidate subskills once the rough design is known. If a candidate route is rejected, record why, route back to the shortlist, and reconsider the best next route.
7. Inside the activated subskill, refine the estimand, audit route-specific assumptions and failure modes, and decide whether the route is supported, fallback, rejected, or exploratory/user-forced.
8. Draft analysis plans, diagnostics, sensitivity analyses, and R/Python code only when the route, estimand, and data suitability are clear enough.
9. Interpret results, diagnose problems, and iterate with the user to revise the estimand, route, model, data processing, or claim.
10. Produce a reproducible report with assumptions, diagnostics, limitations, and interpretation when requested.

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

## Completion Progress

| Component | Status | Notes |
|---|---:|---|
| Top-level framework | 85% | Interaction modes, prospective planning, project spec schema, router, route-out loop, assumption ledger, workflow assets, and code templates are in place. |
| 01 - User Need Understander | 65% | New foundation subskill for clarifying user goal, causal components, data availability, deliverable, and next route. |
| 02 - User Data Inspector | 90% | Expanded preprocessing workflow for dataset profiling, structure validation, variable-role mapping, treatment/outcome/covariate preparation, leakage checks, and modeling-difficulty triage before causal analysis. |
| 03 - DAG Builder | 75% | Expanded structure with project-spec entry, DAG/target-trial workflow, adjustment guardrails, and literature/software map. |
| 04 - Design Planner | 25% | Lightweight planning subskill for future studies and data collection; needs deeper design examples and sample schemas. |
| 05 - Randomized Experiments | 85% | Deep workflow with R/Python examples, SRM/CUPED, cluster trials, factorial/crossover/SMART considerations, and diagnostics. |
| 06 - Point-Treatment Observational | 75% | Expanded target-trial framing, measured-confounding assumptions, route handoff logic, diagnostics, and literature/software map. |
| 07 - Matching / Weighting / Balance | 85% | Deep workflow with formal estimands, overlap diagnostics, failure modes, software notes, examples, and templates. |
| 08 - Doubly Robust & Machine Learning | 75% | Expanded AIPW/TMLE/DoubleML guidance with nuisance-model, cross-fitting, diagnostics, and literature/software map. |
| 09 - Heterogeneous Effects & Policy | 75% | Expanded CATE/GATE/policy workflow with adaptive method selection, validation, diagnostics, and literature/software map. |
| 10 - Longitudinal G-Methods | 75% | Expanded timeline-first workflow for MSM/IPW, g-formula, longitudinal TMLE, LMTP, and regime diagnostics. |
| 11 - Diff-in-Diff & Event Studies | 75% | Expanded modern DiD workflow with group-time ATT, staggered adoption guardrails, pretrend diagnostics, and software map. |
| 12 - Regression Discontinuity | 75% | Expanded RD workflow with local estimands, fuzzy RD, manipulation checks, bandwidth sensitivity, and software map. |
| 13 - Instrumental Variables | 90% | Deep workflow with R/Python examples, LATE/CACE guardrails, diagnostics, and bibliography. |
| 14 - Synthetic Control & Time Series | 75% | Expanded SCM/ITS workflow with classic, augmented, generalized, synthetic DiD, matrix-completion, BSTS/CausalImpact, diagnostics, and literature/software map. |
| 15 - Survival & Competing Risks | 75% | Expanded survival/competing-risk workflow with time-zero audit, risk/RMST/CIF estimands, IPCW/AIPW/TMLE, causal survival forests, diagnostics, and literature/software map. |
| 16 - Mediation | 90% | Expanded causal mediation workflow with estimand routing, multiple/high-dimensional mediators, domain guidance, sensitivity checks, and literature/software map. |
| 17 - Interference & Spillovers | 90% | Expanded interference workflow with exposure mappings, partial/network/spatial/marketplace spillovers, recent methods, custom implementation recipes, diagnostics, and literature/software map. |
| 18 - Causal Discovery | 85% | Deep workflow with PC/FCI examples across R/Python/Java, recommender script, and JSON schemas. |
| 19 - Causal Genomics | 90% | Expanded causal genomics workflow with MR, colocalization, fine mapping, TWAS/SMR, drug-target MR, multi-omics, ancestry/sample-overlap guardrails, diagnostics, and literature/software map. |
| 20 - Reporting & Interpretation | 40% | Scaffold plus report skeleton and final report template; needs stronger reporting rubrics and examples. |

Overall: approximately 82% complete. The structural backbone is solid, with most analysis subskills now deep and usable. The remaining major work is concentrated in reporting/interpretation, design planning, and deeper examples for the new user-need foundation step.

## Architecture Principles

This skill treats causal inference as a sequence of design decisions, not as a single modeling command. The agent should first understand the user's need and data situation, then define the causal target, inspect or plan the data structure, compare feasible design routes, state assumptions, and only then choose methods, packages, or code resources.

When no data exist yet, the skill should help plan data collection so future causal analysis is possible. When data exist but are messy, it should map rows, timing, variables, and possible feature construction before fitting models. When results exist, it should use diagnostics and user feedback to iterate on the estimand, model, or interpretation.

Tool fit, data suitability, and causal validity should be checked together. User-preferred packages or tools can be used, but only when their assumptions, supported estimands, diagnostics, and uncertainty estimates match the planned analysis.

The skill's role is not to make causal inference automatic. Its role is to make causal reasoning explicit, auditable, reproducible, and appropriately cautious.
