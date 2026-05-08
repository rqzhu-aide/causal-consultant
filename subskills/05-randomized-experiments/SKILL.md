---
name: randomized-experiments
description: "Primary route subskill for randomized or allegedly randomized treatment assignment, including A/B tests, individual or cluster trials, blocked/stratified experiments, noncompliance handoff, randomization inference, balance/SRM checks, R/Python implementation, diagnostics, and route-fit feedback to the main skill."
---

# Randomized Experiments

## Role

Use this as a **primary route subskill** when the planned causal route relies on randomized assignment. The main skill owns route activation and gate status; this subskill audits whether the randomized route can actually be implemented and interpreted as planned.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Route-Fit Check

Given the main skill's route handoff, check:

- randomization unit, analysis unit, treatment arms, assignment probabilities, blocking/stratification, and clustering;
- treatment timing, outcome timing, eligibility, exclusions, missingness, attrition, and interference;
- whether the target is ITT, assignment effect, treatment-received effect, CACE/LATE, cluster-level effect, ratio metric, or dynamic regime;
- whether noncompliance, contamination, sample-ratio mismatch, or post-randomization exclusions break the intended route;
- whether diagnostics and uncertainty are possible with the available data.

If the route is not truly randomized or the target requires noncompliance/IV logic, return feedback to the main skill and recommend the right route or support module.

## Package And Code Fit

Candidate implementations include R `estimatr`, `randomizr`, `ri2`, `fixest`, `clubSandwich`, `DeclareDesign`, and Python `statsmodels`, `scipy`, and `linearmodels` when appropriate. Prefer simple design-transparent estimators when they answer the estimand.

Do not install packages silently. If code is requested, verify the user's preferred language, package availability, and whether cluster/robust/randomization inference requirements are supported.

## Pass / Fail Output

If fit passes, produce an analysis plan, code path, diagnostics, and reporting handoff. If fit fails, return:

- failed condition;
- whether the fix belongs to data, design, DAG/assumptions, package fit, or reporting;
- recommended next action for the main skill.

Store detailed code, diagnostics, and report material under `analyses/` or `artifacts/`; keep only compact status and limitations in `analysis.analyses` or `subskill_analyses`.

## References

- `references/workflow.md`: detailed experiment workflow.
- `references/math_estimands.md`: estimands.
- `references/diagnostics_and_failure_modes.md`: SRM, missingness, compliance, clustering, and failure modes.
- `references/software_and_packages.md`: package notes.
- `references/rct_ab_bibliography.md`: literature notes.
- `examples/`: reusable R/Python templates.
- `assets/`: compact project/report templates.
