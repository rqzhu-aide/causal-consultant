---
name: doubly-robust-ml
description: "Estimation support module for AIPW, TMLE, one-step estimators, DoubleML, debiased or orthogonal ML, cross-fitting, Super Learner, flexible nuisance estimation, and doubly robust causal effect estimation after a primary route, estimand, and adjustment set are defined."
---

# Doubly Robust And Orthogonal ML

## Role

Use this as an **estimation support module**, not a primary identification route. Activate it after a primary route has defined the estimand, causal assumptions, adjustment set or nuisance functions, and data structure.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Fit Check

Given the route handoff, check:

- target estimand: ATE, ATT, ATO, conditional effect, longitudinal mean, IV/LATE variant, or survival target;
- nuisance components needed: outcome regression, propensity/treatment model, censoring model, instrument model, or mediator model;
- whether cross-fitting, sample splitting, positivity, outcome scale, missingness, and clustering are compatible with the data;
- whether nuisance ML adds value over simpler models and does not obscure a weak design;
- whether diagnostics can check overlap, nuisance quality, influence functions, instability, and sensitivity.

If identification assumptions are unresolved, return to the main skill; flexible ML cannot repair a broken causal route.

## Package And Code Fit

Candidate tools include R `tmle`, `tmle3`, `sl3`, `SuperLearner`, `DoubleML`, and Python `DoubleML`, `econml`, `dowhy`, or custom AIPW workflows. Confirm package support for the exact estimand, treatment type, censoring, clustering, sample splitting, and uncertainty.

## Pass / Fail Output

If fit passes, produce an estimation plan, nuisance models, diagnostics, sensitivity checks, code path, and reporting handoff. If fit fails, identify whether the problem is route identification, data size/support, nuisance specification, package support, or interpretation.

## References

- `references/workflow.md`: detailed DR/ML workflow.
- `references/literature_and_software.md`: literature and software notes.
