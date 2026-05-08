---
name: point-treatment-observational
description: "Primary route subskill for observational cohort, registry, EHR, claims, survey, or cross-sectional causal effects with one main treatment/exposure time, a comparator, measured pre-treatment confounders, and backdoor/measured-confounding assumptions; coordinates with matching, weighting, doubly robust ML, survival, HTE, and reporting modules."
---

# Point-Treatment Observational

## Role

Use this as a **primary route subskill** when the route is a point-treatment observational effect under measured-confounding assumptions. This subskill checks the causal route; matching/weighting (`07`) and doubly robust ML (`08`) are support modules, not substitutes for the route.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Route-Fit Check

Given the route handoff, check:

- treatment/exposure, comparator, time zero, outcome window, target population, and analysis unit;
- whether covariates are measured before treatment and plausibly cover the confounding story from `04-dag-builder`;
- exchangeability, positivity/overlap, consistency, selection, missingness, and measurement quality;
- whether treatment is binary, multivalued, continuous, dose-response, or needs another primary route;
- whether survival, HTE/policy, mediation, interference, or longitudinal structure requires an additional module.

If timing is repeated, treatment evolves, assignment is threshold/policy/panel based, or unmeasured confounding is central, return feedback to the main skill and recommend a different primary route or support module.

## Package And Code Fit

Candidate approaches include regression/g-computation, standardization, propensity-score modeling, weighting, matching, AIPW, TMLE, and DML. Confirm the package/code path supports the planned estimand and data structure before implementation. Do not let package convenience redefine the causal question.

## Pass / Fail Output

If fit passes, produce a route-specific analysis plan and recommend support modules (`07`, `08`, `09`, `15`, or `20`) when needed. If fit fails, report the failed route condition and recommended next action to the main skill.

Detailed route plans, code, and diagnostics belong under `analyses/` or `artifacts/`; keep shared YAML entries compact.

## References

- `references/workflow.md`: point-treatment workflow.
- `references/backdoor_workflow.md`: measured-confounding/backdoor route details.
- `references/literature_and_software.md`: literature and implementation notes.
