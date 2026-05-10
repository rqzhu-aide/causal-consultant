---
name: survival-competing-risks
description: "Target and outcome module for causal questions with time-to-event outcomes, censoring, delayed entry, immortal-time risk, survival probabilities, cumulative incidence, competing risks, RMST, adjusted survival curves, hazard models, survival CATEs, and treatment decisions with survival endpoints."
---

# Survival And Competing Risks

## Role

Use this as a **target/outcome module** when the outcome is time-to-event or censoring/competing risks are central. It usually combines with a primary route such as randomized experiments, point-treatment observational, longitudinal g-methods, or HTE/policy.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "15-survival-competing-risks"`
- `role: "target_or_outcome_module"` or `support_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: time-to-event outcome, censoring, delayed entry, competing risks, RMST, or survival-scale target
- `selected_route_id`: the base route this survival module supports
- `inputs_reviewed`: time zero, entry time, event/censoring variables, competing events, follow-up, treatment timing, covariates, clusters/weights, and artifacts
- `outputs_created`: survival estimand plan, adjusted curve script, first-pass survival/RMST/CIF table, censoring diagnostics, or report-ready artifact
- `diagnostics_reviewed`: immortal time, censoring, delayed entry, competing-risk coding, proportional hazards if used, risk-set support, and sensitivity checks
- `limitations`: informative censoring, event misclassification, sparse risk sets, competing-risk interpretation, or hazard-ratio limitations
- `feedback_for_main_skill`: what survival estimand and claim language are safe
- `requests_for_main_skill`: confirm time zero, event type, estimand scale, competing-risk handling, follow-up window, or accept weaker/descriptive language
- `readiness`: production readiness after survival review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when time-to-event construction invalidates the base route
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `refresh_data_technician_02`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `activate_method_subskill`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to survival scripts, curve plots, risk tables, censoring diagnostics, or memos

## Fit Check

Given the route handoff, check:

- time origin, delayed entry, follow-up, event definition, censoring, competing events, and risk set;
- target estimand: survival probability, cumulative incidence, risk difference/ratio, RMST, hazard ratio, cause-specific effect, subdistribution effect, or dynamic treatment target;
- immortal-time risk, treatment timing, informative censoring, competing-risk interpretation, and selection;
- whether weighting, AIPW/TMLE, longitudinal methods, or HTE support is needed;
- whether diagnostics and sensitivity checks are possible.

Do not default to hazard ratios unless hazards are the scientific target.

## Package And Code Fit

Candidate tools include R `survival`, `adjustedCurves`, `riskRegression`, `prodlim`, `survtmle`, and route-specific workflows. Confirm package support for censoring, competing risks, clustering, weights, and estimand scale.

Before `production_gate.status` is ready, consider these analysis paths:

- Kaplan-Meier or cumulative-incidence curves for descriptive evidence;
- adjusted survival curves, g-computation, or weighting for route-supported causal contrasts;
- Cox model only when hazard ratio is the target or clearly labeled as a modeling summary;
- RMST, risk difference, risk ratio, survival probability, or cumulative incidence when more interpretable than hazards;
- competing-risk cause-specific or Fine-Gray style summaries only when aligned with the scientific estimand;
- survival TMLE/AIPW only when censoring and route assumptions are defined.

Simple sample scripts to provide or adapt:

- top-level `scripts/R/survival_adjusted_curves_template.R`
- top-level `scripts/R/tmle3_aipw_template.R` for compatible point-treatment survival targets
- a project-specific risk-table and censoring-summary script saved under `artifacts/`

Post-fit diagnostics must cover:

- time-zero validity and immortal-time risk;
- censoring distribution by treatment and covariates;
- delayed entry, risk-set size, event counts, and follow-up completeness;
- competing-risk coding and whether censoring competing events is valid for the estimand;
- proportional hazards if a Cox model is used;
- positivity/support over follow-up for weighted/adjusted curves;
- sensitivity to follow-up window, event definition, censoring assumptions, and estimand scale.

## Pass / Fail Output

If fit passes, produce survival estimand, analysis plan, censoring/competing-risk diagnostics, code path, and reporting handoff. If fit fails, identify the timing/outcome/censoring issue and return to the main skill.

Main-skill feedback should include:

- whether the survival target is constructible and aligned with the base route;
- which scale is safest to report, such as risk, survival probability, cumulative incidence, RMST, or hazard ratio;
- which censoring/competing-risk diagnostics constrain interpretation;
- the next user question, if any, such as choosing RMST versus hazard ratio or defining competing events;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- time zero, event definition, censoring definition, competing-risk definition, follow-up horizon, and target scale;
- estimate type, such as survival probability, cumulative incidence, RMST, hazard ratio, or risk difference at a time point;
- censoring, competing-risk, delayed-entry, proportional-hazards, positivity, and risk-set diagnostics;
- plot/table paths for survival curves, cumulative incidence, risk tables, or adjusted contrasts;
- wording that avoids hazard-ratio overinterpretation and makes time horizon explicit.

Recommend `return_to_foundation` when time zero is undefined or after treatment, immortal time is built into exposure definition, event/censoring data cannot define the target outcome, competing events invalidate the requested estimand, or treatment timing makes the base route impossible.

Stay in production with a weaker claim when censoring is partly informative, proportional hazards fail but other scales are useful, risk sets are sparse, competing-risk interpretation is limited, or survival analysis is descriptive pending stronger assumptions.

Recommend production-gate readiness only when time zero, event/censoring definitions, estimand scale, first-pass result or deferral rationale, censoring/competing-risk diagnostics, limitations, and handoff artifacts are recorded.

## References

- `references/workflow.md`: detailed workflow.
- `references/survival_estimand_notes.md`: estimand notes.
- `references/literature_and_software.md`: literature and software notes.
