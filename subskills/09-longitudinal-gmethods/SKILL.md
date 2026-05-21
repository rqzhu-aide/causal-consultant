---
name: longitudinal-gmethods
description: "Use as a design_route method/task subskill for longitudinal treatment or exposure histories, time-varying confounding affected by prior treatment, sustained strategies, dynamic regimes, marginal structural models, inverse-probability treatment and censoring weights, parametric or sequential g-formula, g-estimation, longitudinal TMLE, LMTP, and sequential causal validity checks."
---

# longitudinal_gmethods

## Role

Act as a bounded `design_route` specialist for longitudinal treatment, exposure, censoring, and covariate histories. Clarify whether the user's causal question requires a sustained strategy, dynamic regime, cumulative exposure, treatment history, censoring process, or time-varying confounding affected by prior treatment.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module supplies the longitudinal design route and identification logic. If the user wants to learn or evaluate adaptive decision rules, coordinate with `25-dynamic-treatment-policies`; if the user only has one baseline exposure, route to `08-single-time-observational-exposure`.

## When To Activate

Use this module when treatment, exposure, covariates, censoring, adherence, eligibility, or outcomes evolve over repeated time points. Also use it when the project mentions time-varying confounding, treatment histories, sustained treatment, treatment regimes, sequential strategies, marginal structural models, inverse-probability treatment/censoring weights, g-formula, g-computation, g-estimation, structural nested models, longitudinal TMLE, LMTP, or cloning/censoring/weighting.

Do not use it for a single baseline treatment unless follow-up, censoring, or treatment changes over time are part of the causal claim.

## Inputs To Read

Read only the compact state needed for the longitudinal design:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `domain_expert`: treatment strategy meaning, visit schedule, biologic/operational timing, feasible interventions, adherence, and interpretation.
- `data_analyst`: long-format data status, id/time rows, treatment/covariate/outcome timing, censoring, missingness, support, weights, and artifacts.
- `method_lead`: causal claim, estimand set, DAG/theory, sequential exchangeability, positivity, censoring assumptions, diagnostics, and wording boundary.
- related `subskill_records`: especially dynamic policies, dose-response, survival, matching/weighting, doubly robust estimation, DML, transportability, negative controls, or report records.

## Fit / Failure Logic

Check these before recommending a method:

- Time grid: visits, intervals, lags, grace periods, baseline, follow-up, and outcome windows are reconstructible.
- History: treatment, covariates, censoring, eligibility, adherence, and outcomes are ordered correctly at each time.
- Strategy: static, sustained, dynamic, stochastic, modified, cumulative, or threshold strategy can be written as an intervention.
- Confounding: time-varying confounders affected by prior treatment are measured before later treatment decisions.
- Censoring and missingness: loss to follow-up, competing events, administrative censoring, and artificial censoring are represented.
- Positivity over histories: each strategy has support across relevant treatment/covariate histories.
- Consistency: observed treatment versions match the intervention strategy closely enough.
- Outcome: final, repeated, survival, recurrent, competing-risk, or cumulative outcome scale is compatible with the design.

Block or caveat causal claims when time ordering is not reconstructible, histories are missing, treatment or censoring support collapses, the strategy cannot be described as an intervention, post-outcome variables enter the history, or censoring is severe and unaddressed.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- long-format person-time table with id, time, treatment, covariates, censoring, and outcome;
- visit/time-grid construction and grace-period definitions;
- treatment and covariate timing map with lag choices;
- regime or strategy adherence counts over time;
- treatment/censoring model inputs and positivity summaries by history strata;
- inverse-probability weight distributions, truncation, and effective sample size;
- artificial censoring or cloning/censoring/weighting construction if strategies require it;
- first-pass g-formula, MSM/IPW, sequential-regression, or LMTP prototype labeled exploratory until diagnostics pass.

## Method Or Support Guidance

Choose the method lane from the question and data structure:

- Marginal structural models with IP treatment/censoring weights are useful for marginal effects of sustained or dynamic strategies when weights are stable and model fit is defensible.
- Parametric g-formula is useful for simulating absolute risks or outcomes under complex static or dynamic strategies, but relies heavily on correct models for the longitudinal data-generating process.
- Sequential regression or iterated conditional expectation is useful for discrete-time strategy comparisons and can accept flexible learners, but still needs correct time ordering and support.
- Structural nested models and g-estimation are useful for treatment-effect models with time-varying treatment, especially when blip or treatment-duration effects are scientifically meaningful, but software and interpretation are more specialized.
- Longitudinal TMLE, sequentially doubly robust estimators, and LMTP workflows can use flexible nuisance models and target realistic interventions, but require careful ordering, cross-fitting, and positivity checks.
- Pooled logistic hazards, weighted Cox models, or cumulative-incidence workflows are implementation supports for time-to-event outcomes; activate `33-survival-competing-risks` when survival details matter.

Do not let a longitudinal package substitute for the design. The time grid, intervention strategy, sequential exchangeability, positivity, consistency, censoring, and outcome scale must be stated before the estimate is treated as causal.

Use `scripts/recommend.py` with `sample_input.json` when quick design/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- time ordering, history construction, grace periods, and lag definitions;
- support/positivity over treatment and covariate histories;
- treatment and censoring weight distributions, truncation, and effective sample size;
- covariate balance over time after weighting when MSM/IPW is used;
- model diagnostics for treatment, censoring, outcome, and covariate processes;
- sensitivity to time grid, lag choices, strategy definitions, weight truncation, learners, and artificial censoring rules;
- censoring, competing events, missingness, and adherence;
- whether target claims are static strategy, dynamic regime, cumulative exposure, modified treatment policy, or exploratory longitudinal association.

Do not report a naive time-updated regression coefficient as a longitudinal causal effect when time-varying confounders affected by prior treatment are present.

## Output To Main Team

Return:

- longitudinal target structure, time grid, strategy definition, outcome, and estimand options;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible method/package lane and why it fits;
- assumptions, diagnostics, limitations, and robustness needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- one controlled `recommended_next_action`.

For durable records, use:

- `subskill_id`: `09-longitudinal-gmethods`
- `module_type`: `design_route`
- `role`: `primary_route`
- `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Longitudinal Treatment Strategy Analysis" or "G-Methods Design";
- time grid, eligibility over time, treatment/censoring histories, covariates, outcome, and strategies;
- estimand and why it matches the user's causal question;
- identification assumptions: consistency, sequential exchangeability, positivity, and censoring;
- method, software, model form, weight/truncation or simulation plan, and learner choices;
- diagnostics and sensitivity checks;
- claim boundary: exploratory, descriptive, cautious causal under assumptions, supported causal under assumptions, or not supportable;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed longitudinal g-methods workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for MSM/IPW, parametric g-formula, sequential regression, LMTP, and weight diagnostics.
- `scripts/recommend.py`: rule-based longitudinal design/package recommender for quick internal triage.
