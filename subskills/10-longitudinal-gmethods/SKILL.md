---
name: longitudinal-gmethods
description: "Primary route subskill for longitudinal causal questions with time-varying treatments, time-varying confounders affected by prior treatment, dynamic regimes, grace periods, censoring, marginal structural models, g-formula, longitudinal TMLE, and longitudinal modified treatment policies."
---

# Longitudinal G-Methods

## Role

Use this as a **primary route subskill** when treatment, confounders, eligibility, censoring, or outcomes evolve over time and prior treatment can affect later confounders. Standard point-treatment adjustment is often invalid in this setting.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Route-Fit Check

Given the route handoff, check:

- time origin, visit grid, eligibility, treatment strategies, grace periods, follow-up, and outcome windows;
- time-varying confounders, mediators, censoring, competing events, adherence, and treatment history;
- target estimand: sustained strategy, dynamic regime, modified treatment policy, regime value, risk difference, survival probability, or mean outcome;
- positivity over histories, missing/censoring mechanisms, and whether data support the required histories;
- whether survival, HTE/policy, or DR/ML support modules are needed.

If the data cannot represent histories or timing, return feedback to the Data Technician and Design Planner through the main skill.

## Package And Code Fit

Candidate tools include R `ipw`, `gfoRmula`, `ltmle`, `lmtp`, and longitudinal TMLE/g-formula workflows. Confirm support for the treatment process, censoring, outcome type, and uncertainty.

## Pass / Fail Output

If fit passes, produce a longitudinal analysis plan, data-shaping requirements, estimator/code path, diagnostics, and reporting handoff. If fit fails, identify whether the issue is data timing, regime definition, positivity, censoring, package support, or a need for a simpler/fallback estimand.

## References

- `references/workflow.md`: detailed longitudinal workflow.
- `references/literature_and_software.md`: literature and software notes.
