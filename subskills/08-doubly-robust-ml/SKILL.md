---
name: doubly-robust-ml
description: "Estimation support module for AIPW, TMLE, one-step estimators, DoubleML, debiased or orthogonal ML, cross-fitting, Super Learner, flexible nuisance estimation, and doubly robust causal effect estimation after a primary route, estimand, and adjustment set are defined."
---

# Doubly Robust And Orthogonal ML

## Role

Use this as an **estimation support module**, not a primary identification route. Activate it after a primary route has defined the estimand, causal assumptions, adjustment set or nuisance functions, and data structure.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "08-doubly-robust-ml"`
- `role: "support_module"` or `diagnostic_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: AIPW, TMLE, DML, flexible nuisance modeling, cross-fitting, or robustness need
- `selected_route_id`: the primary route this estimator supports
- `inputs_reviewed`: estimand, treatment, outcome, covariates, nuisance targets, sample size, folds, clustering, censoring/missingness, and primary-route assumptions
- `outputs_created`: DR/ML estimation plan, script path, first-pass estimate, nuisance diagnostics, sensitivity memo, or report-ready artifact
- `diagnostics_reviewed`: overlap, nuisance performance, cross-fitting stability, influence/score instability, learner sensitivity, truncation, missingness/censoring, and uncertainty checks
- `limitations`: unresolved identification, positivity, small-sample, learner instability, package support, or interpretability limits
- `feedback_for_main_skill`: whether flexible estimation helps, changes nothing, or makes the result too unstable
- `requests_for_main_skill`: confirm learner complexity, ask user about interpretability versus flexibility, activate simpler support module, refresh Data Technician, or accept cautious claim language
- `readiness`: production readiness after DR/ML review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when this review reveals the primary causal route is invalid
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `activate_method_subskill`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to scripts, nuisance diagnostics, estimates, plots, or sensitivity outputs

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

Before `production_gate.status` is ready, consider these analysis paths:

- AIPW or one-step estimator for binary or continuous point treatment when the route and adjustment set are clear;
- TMLE when substitution estimation, bounded outcomes, or Super Learner nuisance fits are useful;
- DoubleML IRM for binary treatment ATE/ATT-style targets after measured-confounding assumptions are accepted;
- DoubleML PLR/PLIV or IV variants only when the primary route supports those targets;
- simpler regression or weighting support when sample size, overlap, or interpretability makes DR/ML unnecessary or unstable.

Simple sample scripts to provide or adapt:

- top-level `scripts/python/doubleml_irm_template.py`
- top-level `scripts/python/statsmodels_treatment_effect_template.py` as a transparent baseline
- top-level `scripts/R/tmle3_aipw_template.R`
- top-level `scripts/R/doubleml_iv_template.R` only for IV-supported routes

Post-fit diagnostics must cover:

- propensity/treatment nuisance predictions and overlap, including near-zero or near-one propensities;
- outcome nuisance performance, residual patterns, calibration, and scale fit;
- cross-fitting folds, sample-split stability, and repeated split sensitivity when possible;
- learner sensitivity against simpler models and at least one alternative learner set;
- influence-function or score instability, outlier contribution, truncation, and standard-error plausibility;
- missingness/censoring nuisance checks when those models are used;
- whether the DR estimate agrees directionally with simpler design-transparent estimates.

## Pass / Fail Output

If fit passes, produce an estimation plan, nuisance models, diagnostics, sensitivity checks, code path, and reporting handoff. If fit fails, identify whether the problem is route identification, data size/support, nuisance specification, package support, or interpretation.

Main-skill feedback should include:

- whether DR/ML is appropriate or whether a simpler estimator is safer;
- which nuisance components and learners were used or proposed;
- whether diagnostics support the estimate, show instability, or require sensitivity work;
- the next user question, if any, such as whether interpretability or predictive flexibility matters more for the deliverable;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- parent route, estimand, treatment/outcome scale, nuisance targets, learner set, cross-fitting plan, and sample-splitting unit;
- AIPW/TMLE/DML estimate, uncertainty method, and reproducible script/artifact paths;
- overlap, nuisance performance, influence-curve/score behavior, fold stability, and learner-sensitivity diagnostics;
- comparison to simpler estimators when available;
- plain-language warning that ML improves nuisance estimation but does not create identification.

Recommend `return_to_foundation` when the primary route's identification assumptions are unresolved, the adjustment set is invalid, treatment/outcome timing is wrong, positivity is absent for the intended comparison, or the needed nuisance functions cannot be defined from the data.

Stay in production with a weaker claim when the route is valid but DR/ML is unstable, sample size is thin, learner sensitivity is high, nuisance fit is weak, or results diverge from simpler estimators. Then recommend simpler modeling, additional diagnostics, or cautious/associational wording.

Recommend production-gate readiness only when the DR/ML estimate or reasoned deferral, nuisance diagnostics, overlap checks, learner sensitivity, uncertainty, limitations, and reproducible script/artifact paths are recorded.

## References

- `references/workflow.md`: detailed DR/ML workflow.
- `references/literature_and_software.md`: literature and software notes.
