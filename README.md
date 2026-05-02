# Causal Inference Consultant Skill

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Version](https://img.shields.io/badge/version-0.1.4--workflow--routing--architecture-blue.svg)]()
[![Status](https://img.shields.io/badge/status-under%20development-orange.svg)]()

Version: `0.1.4-workflow-routing-architecture`

License: GPL-3.0

Status: under active development

## What This Skill Is About

This is a modular causal inference consultant skill for agent systems that load a top-level `SKILL.md` and then selectively read supporting references, subskills, scripts, and assets. It is designed to help users clarify causal questions, plan data collection, understand data structure, narrow down plausible causal designs, specify estimands, check assumptions, draft R/Python analysis code, interpret results, and prepare reproducible reports.

It is for data scientists, analysts, researchers, and domain experts who want a careful interactive guide rather than a black-box method picker. It can help whether the user already has a dataset or is still planning what data to collect.

Current status: the top-level workflow and routing architecture are in place. Randomized experiments, matching/weighting/balance, instrumental variables, and causal discovery are the most developed analysis subskills. Prospective design planning is available as a lightweight routing subskill for users who do not yet have data. Many other subskills are functional scaffolds that still need deeper examples, diagnostics, and package-specific recipes.

> I cannot give you a definitive answer, but I can help you explore.

## How to Activate

Use this skill when asking about causal inference, causal discovery, treatment effects, impact evaluation, experiments, observational causal analysis, DAGs, estimands, assumptions, diagnostics, or causal reports.

Example triggers:

- "Help me design a causal analysis."
- "Can I estimate the effect of this intervention?"
- "What data should I collect for a future causal study?"
- "Should I use matching, DiD, RD, or IV?"
- "Help me define the estimand and DAG."
- "Review these causal results and diagnostics."
- "Write R/Python code for this causal design."
- "Help me interpret this treatment effect."

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
| 00 - DAG Identification | 25% | Basic scaffold; needs worked DAG examples and adjustment-set code templates. |
| 01 - Randomized Experiments | 85% | Deep workflow with R/Python examples, SRM/CUPED, cluster trials, factorial/crossover/SMART considerations, and diagnostics. |
| 02 - Point-Treatment Observational | 45% | Scaffold plus workflow references and templates; needs deeper assumption and sensitivity guidance. |
| 03 - Matching / Weighting / Balance | 85% | Deep workflow with formal estimands, overlap diagnostics, failure modes, software notes, examples, and templates. |
| 04 - Doubly Robust & Machine Learning | 45% | Scaffold plus TMLE/DoubleML templates; needs cross-fitting and nuisance-model diagnostics. |
| 05 - Heterogeneous Effects & Policy | 45% | Scaffold plus causal forest/EconML templates; needs policy evaluation and validation examples. |
| 06 - Longitudinal G-Methods | 40% | Scaffold plus longitudinal template; needs MSM, dynamic-regime, and survival extensions. |
| 07 - Diff-in-Diff & Event Studies | 40% | Scaffold plus workflow notes and Callaway-Sant'Anna template; needs modern DiD diagnostics and examples. |
| 08 - Regression Discontinuity | 45% | Scaffold plus R/Python rdrobust templates; needs bandwidth, manipulation, and sensitivity examples. |
| 09 - Instrumental Variables | 90% | Deep workflow with R/Python examples, LATE/CACE guardrails, diagnostics, and bibliography. |
| 10 - Synthetic Control & Time Series | 35% | Scaffold plus CausalImpact template; needs placebo inference and modern synthetic control workflows. |
| 11 - Survival & Competing Risks | 35% | Scaffold plus survival references and adjusted-curve template; needs competing-risk and IPCW depth. |
| 12 - Mediation | 35% | Scaffold plus mediation template; needs modern causal mediation and sensitivity workflows. |
| 13 - Interference & Spillovers | 20% | Skeleton; needs network exposure mapping, partial interference, and spillover estimators. |
| 14 - Causal Discovery | 85% | Deep workflow with PC/FCI examples across R/Python/Java, recommender script, and JSON schemas. |
| 15 - Causal Genomics | 30% | Scaffold plus MR/coloc notes; needs omics examples and diagnostics. |
| 16 - Missingness, Measurement, Selection | 25% | Skeleton; needs missing-data, measurement-error, and selection-bias templates. |
| 17 - Reporting & Interpretation | 40% | Scaffold plus report skeleton and final report template; needs stronger reporting rubrics and examples. |
| 18 - Prospective Design Planning | 25% | Lightweight planning subskill for future studies and data collection; needs deeper design examples and sample schemas. |

Overall: approximately 50% complete. The structural backbone is solid, with four deep and usable analysis subskills, one lightweight prospective-planning subskill, and many method areas still in scaffold form.

## Architecture Principles

This skill treats causal inference as a sequence of design decisions, not as a single modeling command. The agent should first understand the user's need and data situation, then define the causal target, inspect or plan the data structure, compare feasible design routes, state assumptions, and only then choose methods, packages, or code resources.

When no data exist yet, the skill should help plan data collection so future causal analysis is possible. When data exist but are messy, it should map rows, timing, variables, and possible feature construction before fitting models. When results exist, it should use diagnostics and user feedback to iterate on the estimand, model, or interpretation.

Tool fit, data suitability, and causal validity should be checked together. User-preferred packages or tools can be used, but only when their assumptions, supported estimands, diagnostics, and uncertainty estimates match the planned analysis.

The skill's role is not to make causal inference automatic. Its role is to make causal reasoning explicit, auditable, reproducible, and appropriately cautious.
