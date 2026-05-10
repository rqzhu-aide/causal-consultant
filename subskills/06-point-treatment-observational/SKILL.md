---
name: point-treatment-observational
description: "Primary route subskill for observational cohort, registry, EHR, claims, survey, or cross-sectional causal effects with one main treatment/exposure time, a comparator, measured pre-treatment confounders, and backdoor/measured-confounding assumptions; coordinates with matching, weighting, doubly robust ML, survival, HTE, production-loop review, and production-gate Report Writer handoff."
---

# Point-Treatment Observational

## Role

Use this as a **primary route subskill** when the route is a point-treatment observational effect under measured-confounding assumptions. This subskill checks the causal route; matching/weighting (`07`) and doubly robust ML (`08`) are support modules, not substitutes for the route.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "06-point-treatment-observational"`
- `role: "primary_route"`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: the point-treatment measured-confounding route feature
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: treatment, comparator, outcome, time zero, follow-up, adjustment set, unit, inclusion/exclusion rules, missingness, and DAG/data summaries
- `outputs_created`: route-specific analysis plan, script path, first-pass estimate, diagnostics, sensitivity memo, or support-module request
- `diagnostics_reviewed`: covariate timing, overlap, balance, missingness/selection, model fit, sensitivity, placebo/negative-control checks when relevant
- `limitations`: unmeasured confounding, overlap, timing, selection, measurement, or transportability limits
- `feedback_for_main_skill`: what the route can safely claim and what must be asked or checked next
- `requests_for_main_skill`: confirm estimand, inspect covariate timing, refresh Data Technician/DAG Builder, activate `07`/`08`/`09`/`15`, or ask user about accepting weaker claim language
- `readiness`: production readiness after this review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when the point-treatment route itself is invalid
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `confirm_analysis_plan`, `activate_method_subskill`, `run_first_pass`, `run_diagnostics`, `refresh_data_technician_02`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to plan, code, diagnostics, plots, or tables

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

Before `production_gate.status` is ready, consider these analysis paths:

- transparent outcome regression or g-computation/standardization for the selected adjustment set;
- propensity-score weighting or matching with `07-matching-weighting-balance` when design-stage balance matters;
- AIPW, TMLE, or DML with `08-doubly-robust-ml` when nuisance flexibility is justified;
- subgroup or policy extension with `09-heterogeneous-effects-policy` only after the base route is supportable;
- survival extension with `15-survival-competing-risks` when outcome timing/censoring changes the estimand.

Candidate packages include R `fixest`, `marginaleffects`, `WeightIt`, `MatchIt`, `cobalt`, `tmle3`, `DoubleML`, and Python `statsmodels`, `dowhy`, `sklearn`, `DoubleML`, or `econml`. Keep the first pass simple unless the route needs the extra machinery.

Simple sample scripts to provide or adapt:

- top-level `scripts/python/dowhy_point_treatment_template.py`
- top-level `scripts/python/statsmodels_treatment_effect_template.py`
- top-level `scripts/python/propensity_weighting_template.py`
- top-level `scripts/R/weightit_cobalt_template.R`
- top-level `scripts/R/tmle3_aipw_template.R`

Post-fit diagnostics must cover:

- treatment/comparator counts and outcome timing after time zero;
- pre-treatment status of all adjustment covariates;
- overlap/positivity and propensity-score support when propensity methods are used;
- covariate balance before and after weighting/matching when applicable;
- missingness, censoring, selection, and inclusion/exclusion consequences;
- outcome model specification or nuisance-model performance as relevant;
- sensitivity to adjustment set, trimming, estimand target, and unmeasured confounding;
- placebo, negative-control, or falsification checks when the route depends heavily on no unmeasured confounding.

## Pass / Fail Output

If fit passes, produce a route-specific analysis plan and recommend support modules (`07`, `08`, `09`, `15`, or `20`) when needed. If fit fails, report the failed route condition and recommended next action to the main skill.

Detailed route plans, code, and diagnostics belong under `analyses/` or `artifacts/`; keep shared YAML entries compact.

Main-skill feedback should include:

- whether the measured-confounding point-treatment route is supportable, fragile, or blocked;
- which estimand and target population the actual analysis supports;
- what diagnostics are complete, missing, or failed;
- the next user question, if any, such as whether to narrow the population after poor overlap or accept associational language;
- this subskill's `subskill_analyses` chunk, plus recommendations for main-owned updates to `analysis.recommended_method_job_subskills`, `analysis.activated_method_job_subskills`, `analysis.recommended_diagnostics`, and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- target-trial-style summary: eligibility, time zero, treatment/exposure, comparator, outcome, follow-up, and analysis population;
- adjustment set and why variables are pre-treatment and appropriate for the estimand;
- overlap/support, missingness, sensitivity, model-dependence, and residual-confounding diagnostics;
- first-pass estimate, uncertainty method, and artifact paths for code, tables, and plots;
- claim-language limit, especially whether wording should be cautious causal, associational, or descriptive.

Recommend `return_to_foundation` when treatment happens after outcome, time zero is incoherent, the row unit cannot represent the causal unit, required pre-treatment confounders are unavailable and central, all plausible adjustment variables are post-treatment, selection into the dataset is outcome/treatment-defined in a route-changing way, or the situation is really longitudinal, IV, RD, DiD, mediation, or interference rather than point treatment.

Stay in production with a weaker claim when the route is coherent but diagnostics are fragile: limited overlap, residual confounding concern, missingness, model dependence, sensitivity to trimming, or measurement concerns. Then recommend diagnostics, support modules, target-population narrowing, or cautious/associational language.

Recommend production-gate readiness only when the estimand, adjustment set, first-pass result or analysis artifact, diagnostics, sensitivity/deferral rationale, and limitations are recorded, and no unresolved foundation recheck remains.

## References

- `references/workflow.md`: point-treatment workflow.
- `references/backdoor_workflow.md`: measured-confounding/backdoor route details.
- `references/literature_and_software.md`: literature and implementation notes.
