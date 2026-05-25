---
name: survival-competing-risks
description: "Use as an implementation_support method/task subskill for time-to-event or duration outcomes, right/left/interval censoring, delayed entry, survival curves, fixed-time risk, RMST, hazards, cumulative incidence, competing risks, recurrent events, survival ATE/CATE, causal survival forests, survival nuisance models, and survival-style reporting support."
---

# survival_competing_risks

## Role

Act as a bounded `implementation_support` specialist for time-to-event outcomes inside a selected design route and target goal. Clarify event definitions, time origin, follow-up, censoring, competing events, survival estimand scale, implementation candidates, diagnostics, and reportable survival evidence.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

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
- `data_analyst`: analysis alignment, survival schema, event counts, censoring, follow-up distributions, support, missingness, derived variables, plots, and reproducibility assets.
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

Apply the common constructed-input checks to survival inputs. Landmarking, interval splitting, fixed-window risks, censoring indicators, competing-risk recoding, time-scale transformations, or event composites can be valid when they match the causal target and outcome scale. If construction creates immortal time, changes risk into hazard/RMST/cumulative-incidence claims, censors competing events inconsistently, or selects horizons after seeing effects, record the narrower estimand and report boundary.

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

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the time-to-event claim supported by censoring, competing-risk, and target-scale logic:

- `inference_supported` when the target is a survival probability, cumulative incidence, RMST, hazard contrast, or survival CATE/policy value with valid censoring handling and uncertainty for that scale.
- `exploratory_only` when Cox/random survival forest/flexible survival predictions are used as regression analogs, nuisance functions, or same-data exploratory patterns without causal identification and validation.
- `claim_scope`: counterfactual survival curve, RMST difference, risk/CIF difference, cause-specific or subdistribution summary, horizon-specific survival CATE, or prediction-only output; hazard ratios should not be translated into collapsible causal risk claims without care.
- Valid routes include IPCW, g-formula, weighted/adjusted survival curves, TMLE/DR survival estimators, Aalen-Johansen for competing risks, RMST inference, censoring/competing-risk sensitivity, and causal survival forests when their horizon/RMST target and censoring assumptions match the data.
- Do not ignore informative censoring, competing events, delayed entry, time-varying treatment, or non-proportional hazards when setting report wording.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted survival/competing-risk routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For survival and competing-risk support, the statistical claim is determined by time zero, event definition, censoring/competing-event handling, and effect scale. Treat these as claim-boundary issues:

- survival probability, fixed-time risk, RMST, CIF, cause-specific hazard, subdistribution hazard, survival CATE, and policy value are different targets;
- hazard ratios are time-local and noncollapsible and should not be casually translated into absolute risk or survival benefit;
- censoring, delayed entry, left truncation, immortal time, competing events, and time-varying treatment can create bias if handled as ordinary regression details;
- sparse late follow-up, rare events, and non-proportional hazards should narrow horizons or shift the estimand;
- survival forests, penalized Cox, boosting, and neural survival models can be prediction or nuisance tools without providing causal identification by themselves.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when time zero, event/censoring/competing-risk definitions, target horizon/scale, design-route assumptions, censoring handling, and uncertainty route are coherent for the reported survival estimand.
2. Set `status: internally_validated` when survival diagnostics, censoring/weight checks, horizon support, competing-risk handling, and model calibration support the estimate but causal assumptions or external validation remain bounded.
3. Set `status: exploratory_only` when Cox/random survival forest/flexible survival models are used as prediction or nuisance analogs, when horizons are selected after seeing curves, or when same-data survival CATE/policy patterns are unvalidated.
4. Set `status: descriptive_only` for Kaplan-Meier, Aalen-Johansen, CIF, event-count, or censoring summaries that are not adjusted or causal.
5. Set `status: blocked` when time zero is misaligned, immortal time is present, competing events are incorrectly censored for the target, censoring is informative and unhandled, event counts/follow-up are too sparse, or time-varying treatment needs longitudinal g-methods.
6. Set `claim_scope` to `target_sample` for the recorded survival target and horizon, `model_implied` for prediction/nuisance outputs, `internally_validated` for diagnostic-supported survival estimates, or `exploratory_only` for descriptive curves and screens.
7. Use `inference_or_validation_route` for survival-specific support: IPCW, weighted/adjusted Kaplan-Meier, Aalen-Johansen/CIF, RMST inference, g-formula, survival TMLE/DR estimators, censoring-model diagnostics, competing-risk sensitivity, cause-specific versus subdistribution estimand review, causal survival forests for horizon/RMST targets, bootstrap/influence intervals, and calibration/Brier/C-index for prediction-only outputs.
8. Use `method_specific_limits` to state the exact boundary: horizon-specific only, hazard not risk, prediction/nuisance only, competing event handled as target-specific CIF or cause-specific process, censoring assumption, sparse late follow-up, no causal survival CATE without heterogeneity validation, or no time-varying treatment claim without longitudinal review.
9. Ask `data_analyst` for the smallest missing check: survival schema, time-zero alignment, event/censoring/competing-event table, risk tables, KM/CIF/RMST support, censoring weights, proportional hazards/time-varying effect diagnostics, calibration/prediction metrics, and horizon sensitivity.
10. Set `method_lead_recheck.required: true` when survival evidence changes the estimand scale, reveals immortal time/censoring/competing-risk problems, blocks a hazard-to-risk interpretation, or requires longitudinal/survival-specific target revision.

Example - descriptive survival model output:

```yaml
statistical_evidence:
  status: descriptive_only
  claim_scope: exploratory_only
  inference_or_validation_route:
    - "Current output is an unadjusted or prediction-oriented survival summary; causal survival target and censoring route are not yet established."
    - "Review time zero, event/censoring/competing risks, horizon support, and causal design before stronger claims."
  method_specific_limits:
    - "Do not translate hazard ratios or survival predictions into causal risk reductions."
    - "Descriptive curves do not address informative censoring or confounding."
requests:
  data_analyst:
    - "Produce survival schema, time-zero check, event/censoring/competing-risk table, KM/CIF curves with risk tables, and horizon support summary."
method_lead_recheck:
  required: true
  reason: "The reportable estimand may need to shift from hazard/prediction to risk, CIF, RMST, or another survival target."
```

Example - supported survival effect:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_sample
  inference_or_validation_route:
    - "Survival/RMST/risk/CIF target estimated with aligned time zero, valid event/censoring/competing-risk handling, and design-compatible adjustment."
    - "Censoring diagnostics, horizon support, and uncertainty route reviewed for the stated scale."
  method_specific_limits:
    - "Claim applies to the recorded horizon, event definition, competing-risk convention, and target population."
    - "Hazard, risk, RMST, and CIF language must remain distinct in the report."
```

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
- statistical_evidence: status, survival claim scope, censoring/competing-risk inference or validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.implementation_support`:

- set `subskill_id`: `33-survival-competing-risks`
- set `module_type`: `implementation_support`
- set `role`: `implementation_support` or `support_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
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
