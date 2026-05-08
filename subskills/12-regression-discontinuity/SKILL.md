---
name: regression-discontinuity
description: "Primary route subskill for sharp, fuzzy, kink, or local-randomization regression discontinuity designs where treatment, eligibility, dose, or policy assignment changes at a known cutoff of a running variable, including manipulation checks, bandwidth sensitivity, RD plots, local estimands, and package-fit feedback."
---

# Regression Discontinuity

## Role

Use this as a **primary route subskill** when assignment changes at a known threshold of a running variable. This subskill audits the local design and implementation fit.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Route-Fit Check

Given the route handoff, check:

- running variable, cutoff, treatment rule, eligibility, score timing, and whether the design is sharp, fuzzy, kink, or local-randomization;
- local target population and local estimand;
- manipulation/sorting, heaping, bandwidth choice, covariate continuity, outcome timing, and clustering;
- whether the data have enough observations near the cutoff and a credible comparison window;
- whether fuzzy RD requires IV handoff (`13`).

If the cutoff is not assignment-relevant or manipulation dominates, return feedback to the main skill.

## Package And Code Fit

Candidate tools include R/Python `rdrobust` and R `rddensity`. Confirm support for fuzzy/kink designs, clustering, covariates, bandwidth sensitivity, and plots.

## Pass / Fail Output

If fit passes, produce RD plan, diagnostics, bandwidth/sensitivity strategy, code path, and reporting handoff. If fit fails, identify whether the issue is design, data density, manipulation, timing, or software support.

## References

- `references/workflow.md`: detailed RD workflow.
- `references/literature_and_software.md`: literature and software notes.
