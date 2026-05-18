---
name: longitudinal-gmethods
description: "Primary route subskill for longitudinal causal questions with time-varying treatments, time-varying confounders affected by prior treatment, dynamic regimes, grace periods, censoring, marginal structural models, g-formula, longitudinal TMLE, and longitudinal modified treatment policies."
---

# Longitudinal G-Methods

## Role

Use this as a **primary route subskill** when treatment, confounders, eligibility, censoring, or outcomes evolve over time and prior treatment can affect later confounders. Standard point-treatment adjustment is often invalid in this setting.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "10-longitudinal-gmethods"`
- `role: "primary_route"`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: time-varying treatment, confounding, censoring, dynamic regime, or longitudinal target
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: long-format data structure, unit/time IDs, visit grid, treatment history, confounder history, censoring, outcome timing, regime definition, and artifacts
- `outputs_created`: data-shaping plan, estimator plan, script path, first-pass estimate, diagnostics, or report-ready artifact
- `diagnostics_reviewed`: history positivity, censoring, treatment-model fit, outcome-model fit, regime adherence, missing visits, and sensitivity checks
- `limitations`: unsupported histories, sparse regimes, censoring, time-varying measurement, model dependence, or package constraints
- `feedback_for_main_skill`: what longitudinal estimand is supportable and what must be asked or checked next
- `requests_for_main_skill`: confirm regime/grace period, refresh Data Technician for long data, ask user about simpler target, activate survival/DR support, or accept cautious claim language
- `readiness`: production readiness after this review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when longitudinal data or timing invalidates the selected route
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `refresh_data_technician_02`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `activate_method_subskill`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to reshaping scripts, diagnostics, estimates, plots, or tables

## Route-Fit Check

Given the route handoff, check:

- time origin, visit grid, eligibility, treatment strategies, grace periods, follow-up, and outcome windows;
- time-varying confounders, mediators, censoring, competing events, adherence, and treatment history;
- target estimand: sustained strategy, dynamic regime, modified treatment policy, regime value, risk difference, survival probability, or mean outcome;
- positivity over histories, missing/censoring mechanisms, and whether data support the required histories;
- whether survival, DR/ML, or a single-decision HTE/individualized-policy support module is needed.

If the data cannot represent histories or timing, return feedback to the Data Technician and Design Planner through the main skill.

## Package And Code Fit

Candidate tools include R `ipw`, `gfoRmula`, `ltmle`, `lmtp`, and longitudinal TMLE/g-formula workflows. Confirm support for the treatment process, censoring, outcome type, and uncertainty.

Before `production_gate.status` is ready, consider these analysis paths:

- marginal structural model with inverse-probability treatment and censoring weights;
- parametric or simulation-based g-formula for sustained or dynamic regimes;
- longitudinal TMLE or LMTP when the estimand and data support it;
- pooled logistic or discrete-time survival workflow when event timing is central;
- simpler point-treatment or descriptive sequence analysis only if longitudinal conditions are not supportable.

Simple sample scripts to provide or adapt:

- top-level `scripts/R/longitudinal_gmethods_template.R`
- top-level `scripts/R/tmle3_aipw_template.R` as a point-treatment contrast or starting point, not a full longitudinal replacement
- a project-specific long-data reshaping script saved under `artifacts/` when raw data are wide, irregular, or visit-based

Post-fit diagnostics must cover:

- treatment, censoring, and outcome timing by visit;
- positivity over treatment and covariate histories, including sparse history strata;
- weight distributions, truncation, effective sample size, and influential observations;
- treatment and censoring model fit, calibration, and covariate balance across time when using weights;
- missing visits, delayed entry, irregular spacing, and informative censoring;
- sensitivity to grace periods, regime definitions, truncation levels, model specification, and follow-up window.

## Pass / Fail Output

If fit passes, produce a longitudinal analysis plan, data-shaping requirements, estimator/code path, diagnostics, and reporting handoff. If fit fails, identify whether the issue is data timing, regime definition, positivity, censoring, package support, or a need for a simpler/fallback estimand.

Main-skill feedback should include:

- whether the requested longitudinal estimand is constructible;
- which regime, grace period, and follow-up definition are actually supported;
- which diagnostics are complete, missing, or failed;
- the next user question, if any, such as choosing a simpler sustained strategy, accepting a shorter follow-up, or defining grace-period tolerance;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- time zero, visit schedule, treatment/confounder/outcome history, censoring definition, target regime, comparator regime, and follow-up;
- estimator used or proposed, such as MSM/IPW, parametric g-formula, longitudinal TMLE, or lmtp;
- weight/positivity, censoring, missing-visit, model-fit, truncation, and regime-constructability diagnostics;
- first-pass regime contrast, uncertainty, and sensitivity to truncation, grace periods, follow-up, or dynamic-rule definitions;
- wording that makes the result explicitly regime- and assumption-dependent.

When the Report Writer uses the gate-ready or exploratory data-backed templates, contribute:

- **Summary / Claim Status:** supported longitudinal regime contrast and whether it is gate-ready, assumption-dependent, or only exploratory.
- **Question, Data, And Design:** time zero, visit grid, eligibility, treatment/confounder histories, censoring, target and comparator regimes, grace periods, and follow-up.
- **Data Readiness And Analysis Specification:** long-data shape, history construction, estimator, treatment/censoring/outcome models, positivity over histories, truncation, and package path.
- **Results And Diagnostics:** regime contrast, uncertainty, weight distributions, effective sample size, missing visits, censoring, model fit, and sensitivity to regime/follow-up choices.
- **Interpretation And Next Step:** whether sparse histories, unstable weights, informative censoring, or regime ambiguity require simplification, shorter follow-up, or cautious language.
- **Reproducibility Appendix:** reshaping scripts, regime definitions, model formulas, truncation levels, seeds, package versions, and paths to diagnostics or estimates.

Recommend `return_to_foundation` when time zero, treatment history, confounder history, censoring, or outcome timing cannot be represented; when prior treatment affects later confounders but the route was built as a point-treatment design; or when the target regime is not observable/constructible from the data.

Stay in production with a weaker claim when the longitudinal route is coherent but history support is thin, weights are unstable, censoring is partly informative, or models are sensitive. Then recommend diagnostics, target simplification, shorter follow-up, or cautious/assumption-dependent language.

Recommend production-gate readiness only when the regime definition, data-shaping artifact, estimator/code path, first-pass result or deferred execution rationale, diagnostics, sensitivity/deferral rationale, and limitations are recorded.

## References

- `references/workflow.md`: detailed longitudinal workflow.
- `references/literature_and_software.md`: literature and software notes.
