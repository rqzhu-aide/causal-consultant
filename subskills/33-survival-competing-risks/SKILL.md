---
name: survival-competing-risks
description: "Use as an implementation_support method/task subskill for time-to-event or duration outcomes, right/left/interval censoring, delayed entry, survival curves, fixed-time risk, RMST, hazards, cumulative incidence, competing risks, recurrent events, survival ATE/CATE, causal survival forests, survival nuisance models, and survival-style reporting support."
---

# survival_competing_risks

## Role

Act as a bounded `implementation_support` specialist for time-to-event outcomes inside a selected design route and target goal. Clarify event definitions, time origin, follow-up, censoring, competing events, survival estimand scale, implementation candidates, diagnostics, and reportable survival evidence.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module does not identify a causal effect by itself. It supplies survival-compatible outcome scales, nuisance-model options, diagnostics, and reporting structure for the design route and target goal chosen by `method_lead`.

## When To Activate

Use this module when the outcome, mediator, competing event, censoring process, or nuisance model is time to event, duration, event-free survival, mortality over follow-up, incidence over follow-up, loss to follow-up, dropout, left truncation, delayed entry, recurrent event, competing risk, survival curve, hazard, cumulative incidence, RMST, fixed-time risk, survival CATE, or survival policy value.

Also use it when another causal module needs a survival analog of a regression or classification model, such as Cox/AFT/flexible parametric models, random survival forests, gradient boosting survival models, penalized Cox models, neural survival models, or censoring models for IPCW/DR/DML workflows.

## Inputs To Read

Read only the compact state needed for survival support:

- `project_summary`: goal, phase, deliverable, data paths, audience.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: clinically or scientifically meaningful time zero, event definitions, competing events, censoring meaning, follow-up windows, and interpretable effect scales.
- `data_analyst`: survival schema, event counts, censoring, follow-up distributions, support, missingness, derived variables, plots, and reproducibility assets.
- `method_lead`: design route, target estimand, causal assumptions, adjustment set, target population, diagnostics, and wording boundary.
- related `subskill_records`: especially longitudinal g-methods, heterogeneous effects, point or dynamic policy rules, doubly robust estimation, DML, matching/weighting, transportability, or randomized experiments.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded implementation details needed by this module.

## Fit / Failure Logic

Check these before recommending software:

- Time zero: eligibility, treatment assignment or exposure definition, and start of follow-up align.
- Event: event of interest is well-defined, consistently measured, and separated from censoring.
- Censoring: administrative, loss to follow-up, competing event, truncation, and missing outcome mechanisms are not mixed together.
- Competing risks: competing events are handled as competing events when the target is real-world absolute risk or CIF.
- Treatment timing: post-baseline or time-varying treatment does not create immortal time or unsupported time-dependent adjustment.
- Estimand scale: fixed-time risk/survival probability, RMST, CIF, hazard ratio, cause-specific hazard, subdistribution hazard, CATE, or policy value matches the causal question.
- Horizon: reportable time point or RMST truncation time is scientifically meaningful and supported by enough follow-up.
- Assumptions: independent censoring, positivity over follow-up, proportional hazards, or modeling assumptions are explicit when used.

Block or caveat implementation when time origin is wrong, immortal time is present, competing risks are censored without justification, event definitions differ across groups, censoring is informative and unmodeled, follow-up is too short for the chosen horizon, event counts are too sparse, or a predictive survival model is being treated as causal identification.

## Data Work It May Request

Ask `data_analyst` for one small, concrete survival check by default:

- analysis-ready survival schema with `id`, `time_zero`, `followup_time`, `event_status`, `event_type`, treatment, covariates, weights, clusters, and entry time if relevant;
- event/censoring/competing-risk table by treatment, site, subgroup, or policy group;
- Kaplan-Meier, weighted Kaplan-Meier, Aalen-Johansen, or cumulative-incidence curves with risk tables;
- follow-up, censoring, delayed-entry, and positivity summaries over time;
- RMST horizon support, fixed-time risk support, and late follow-up sparsity checks;
- proportional-hazards and time-varying-effect diagnostics if Cox-style summaries are proposed;
- IPCW/censoring-model diagnostics, weight tails, and sensitivity to truncation;
- reproducible paths for survival datasets, plots, tables, model objects, and package versions.

## Method Or Support Guidance

Choose the lane from the causal target, not from the package name:

- Fixed-time risk or survival probability: prefer absolute survival/risk contrasts, adjusted curves, IPCW/AIPW/TMLE, or standardized predictions when the target is a probability at a meaningful horizon.
- RMST: prefer when proportional hazards is doubtful, when an average event-free time up to a horizon is interpretable, or when the user needs an absolute effect scale.
- Competing risks: prefer CIF/Aalen-Johansen, cause-specific hazards for etiologic process questions, and Fine-Gray/subdistribution hazards or CIF regression for absolute risk prediction/reporting. Do not silently censor competing events when the target is real-world risk.
- Hazard ratios: use for conventional Cox-style summaries or nuisance models only when the hazard scale is defensible. Warn that hazard ratios are non-collapsible, time-local, and often not the clearest causal estimand.
- Survival CATE: coordinate with `20-heterogeneous-effects`; use causal survival forests or survival-adapted meta-learners only after the target is RMST or survival probability at a horizon and support/event counts are adequate.
- Policy rules: coordinate with `21-point-treatment-rules` or `25-dynamic-treatment-policies`; survival models can supply value/risk/RMST scores, but policy learning needs held-out evaluation and decision constraints.
- Longitudinal treatment or censoring: coordinate with `09-longitudinal-gmethods`; survival support handles event-time scale and censoring diagnostics, not sequential exchangeability by itself.
- DR/DML support: coordinate with `31-doubly-robust-estimation` and `32-double-machine-learning`; survival regressions, survival forests, Cox models, flexible parametric models, and censoring models can serve as nuisance plugins.
- Prediction-only support: Cox/AFT/flexible parametric models, penalized Cox, random survival forests, boosting, and neural survival models can be used as regression analogs when inference is not the goal, but label them as prediction or nuisance support.

Use `scripts/recommend.py` with `sample_input.json` when quick survival/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- event counts, censoring counts, competing event counts, and at-risk counts over time;
- support and positivity over follow-up, including sparse late horizons;
- time-zero alignment, delayed entry, left truncation, and immortal time;
- censoring model adequacy, IPCW tails, and truncation sensitivity;
- proportional hazards and time-varying effect diagnostics when hazards are reported;
- RMST horizon sensitivity and fixed-time risk horizon sensitivity;
- competing-risk sensitivity: CIF versus cause-specific summaries and event coding robustness;
- prediction diagnostics when using nuisance or prediction models: calibration, Brier score, C-index, time-dependent AUC, and learner sensitivity;
- reproducibility: seeds, folds, package versions, code paths, and generated artifacts.

## Output To Main Team

Return:

- survival target lane, estimand scale, horizon, event/censoring definitions, and competing-risk handling;
- whether implementation is direct, adapted, exploratory, blocked, or not applicable;
- candidate packages/models, diagnostics, assumptions, sensitivity checks, and limitations;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.implementation_support`:

- set `subskill_id`: `33-survival-competing-risks`
- set `module_type`: `implementation_support`
- set `role`: `implementation_support` or `support_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `type_specific.implementation_support`: `implementation_role`, `estimator_or_model_family`, `required_data_shape`, `nuisance_or_prediction_components`, `diagnostic_outputs`, `reproducibility_outputs`, and `package_or_code_options`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Time-to-Event Outcome Analysis", "Survival and Competing-Risk Analysis", or "Survival Outcome Support";
- time zero, eligibility, event, censoring, competing event, follow-up, target horizon, and target population;
- estimand scale and why it matches the scientific question;
- implementation route, packages, models, adjustment/censoring/weighting logic, and diagnostics;
- survival curves, CIF curves, RMST/risk estimates, CATE/policy summaries if used, and uncertainty only when valid;
- limitations: censoring assumptions, sparse event counts, late follow-up, non-proportional hazards, competing risks, positivity, or prediction-only status;
- code, table, figure, model-object, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed survival/competing-risk workflow, team coordination, diagnostics, and report integration.
- `references/literature_and_software.md`: survival causal literature, estimand guidance, and R/Python package matrix.
- `examples/`: short R/Python templates for weighted curves, RMST, competing risks, causal survival forests, and survival prediction/nuisance models.
- `scripts/recommend.py`: rule-based survival recommender for quick internal triage.
