# Causal Inference Consultant Skill

> **Status: Under active development.** This is a preliminary modular skill package for causal inference. Core structure and routing are in place, but many subskills are still skeletons. **Suggestions, contributions, and domain-specific expansions are very welcome — open an issue or PR!**

This skill is intended for agent systems that load a top-level `SKILL.md` and then selectively read supporting references, subskills, scripts, and assets.

The package is organized around an interactive consulting workflow:

1. clarify the causal question;
2. define the estimand;
3. identify the data design and assumptions;
4. route to method-specific subskills;
5. propose a matched analysis plan;
6. run or draft code only after the design is explicit;
7. diagnose and interpret results;
8. produce a reproducible report.

## Directory Structure

```text
causal-inference-consultant/
  SKILL.md
  README.md
  references/
  subskills/
  scripts/
    python/
    R/
  assets/
```

## How to Use

Place this folder in the skill directory used by your agent system, or upload the zipped folder if your agent accepts skill packages as ZIP files.

The top-level `SKILL.md` should be the first file loaded. It instructs the agent to use progressive disclosure: start with intake and routing, then read only the subskills relevant to the user's data and causal goal.

## Completion Progress

| Component | Status | Notes |
|-----------|--------|-------|
| **Top-level framework** (SKILL.md, manifest, router, intake) | 70% | Core routing and 9 reference guides in place; 7 asset templates; 24 code templates across R/Python/Java |
| **00 — DAG Identification** | 25% | Basic scaffold; needs worked examples and code templates |
| **01 — Randomized Experiments** | 25% | Basic scaffold; needs SOPs for randomization checks and analysis templates |
| **02 — Point-Treatment Observational** | 45% | Scaffold + 2 refs; has DoWhy and statsmodels templates; needs deeper assumption guidance |
| **03 — Matching / Weighting / Balance** | 40% | Scaffold + MatchIt/WeightIt/CoBalt template; needs diagnostics deep-dive |
| **04 — Doubly-Robust & Machine Learning** | 45% | Scaffold + TMLE and DoubleML templates; needs cross-fitting and nuisance convergence guidance |
| **05 — Heterogeneous Effects & Policy** | 45% | Scaffold + causal forest (grf) and CATE (EconML) templates; needs policy evaluation examples |
| **06 — Longitudinal G-Methods** | 40% | Scaffold + g-computation/IPW/TMLE template; needs MSM and survival extensions |
| **07 — Diff-in-Diff & Event Studies** | 40% | Scaffold + 2 refs + Callaway-Sant'Anna template; needs CS DID and modern event-study diagnostics |
| **08 — Regression Discontinuity** | 45% | Scaffold + rdrobust templates (R + Python); needs bandwidth selection and manipulation tests |
| **09 — Instrumental Variables** | 90% | Deep: 598-line SKILL.md, 5 runnable examples (R + Python), assumption ledger, bibliography, diagnostics |
| **10 — Synthetic Control & Time Series** | 35% | Scaffold + CausalImpact template; needs SC placebo inference and modern estimators |
| **11 — Survival & Competing Risks** | 35% | Scaffold + 2 refs + adjusted survival curves template; needs competing risks and IPCW depth |
| **12 — Mediation** | 35% | Scaffold + mediation template; needs modern causal mediation (imputation, sensitivity) |
| **13 — Interference & Spillovers** | 20% | Skeleton only; needs network exposure mapping and SUTVA relaxation methods |
| **14 — Causal Discovery** | 85% | Deep: 356-line SKILL.md, 6 examples (PC/FCI across R/Python/Java), recommender script, 2 JSON schemas, skill.json |
| **15 — Causal Genomics** | 30% | Scaffold + 2 refs; needs MR, coloc, TWAS, and eQTL examples |
| **16 — Missingness, Measurement, Selection** | 25% | Skeleton only; needs MICE, proxy variables, and selection-bias correction templates |
| **17 — Reporting & Interpretation** | 40% | Scaffold + report skeleton script + final report template; needs PRISMA-style checklists and rubrics |

**Overall: ~40% complete.** The structural backbone (routing, intake, estimands, assumption ledger, software index) is solid. Two subskills (IV and Causal Discovery) are deep and usable. Most others are functional scaffolds that need examples, diagnostics, and domain-specific elaboration.

## Design Philosophy

This skill treats causal inference as a sequence of design decisions, not as a single modeling command. The agent should not run an estimator until the intervention, comparator, outcome, time zero, follow-up, target population, and estimand are clear enough.

## Suggested Next Improvements

- Add package-version-specific recipes after testing in your preferred R/Python environments.
- Add domain-specific child skills, for example biomedical EHR, nutrition, infectious disease, economics/policy, education, marketing, and causal genomics.
- Add validated example datasets and end-to-end reports.
- Add automated schema extraction and data-audit helpers.
- Add templated Quarto/R Markdown/Jupyter report generation.
