---
name: dose-response-effects
description: "Use as a target_goal method/task subskill for dose-response or exposure-response effects, continuous treatments, ordinal or multi-level treatments, treatment intensity, exposure intensity, thresholds, marginal dose contrasts, generalized propensity scores, stochastic shift interventions, and modified treatment policies."
---

# dose_response_effects

## Role

Act as a bounded `target_goal` specialist for continuous, ordinal, multi-level, or intensity-based treatments. Clarify whether the user wants a full dose-response curve, a contrast between dose levels, a threshold analysis, a stochastic shift intervention, a modified treatment policy, or an exploratory exposure-response summary.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module defines the target and support logic for dose/intensity questions. It does not supply identification by itself; the selected design route and `method_lead` still determine causal validity and claim strength.

## When To Activate

Use this module when the project asks about dose, dosage, exposure intensity, treatment intensity, exposure-response curves, nonlinear effects, thresholds, multi-level treatment, continuous treatment, feasible dose shifts, modified treatment policies, or what would happen under a different exposure distribution.

Do not use it when the exposure is simply treated versus untreated; route that to the relevant design route. Do not treat a dose-response curve as a policy rule unless dose constraints, intervention feasibility, and decision logic are defined.

## Inputs To Read

Read only the compact state needed for the target question:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: dose meaning, feasible dose changes, thresholds, measurement standards, safety limits, and interpretation.
- `data_analyst`: dose distribution, timing, measurement error, support, sparse ranges, covariate balance by dose, and artifacts.
- `method_lead`: design route, estimand set, assumptions, causal structure, positivity plan, sensitivity plan, and wording boundary.
- related `subskill_records`: especially observational exposure, longitudinal g-methods, matching/weighting, doubly robust estimation, double machine learning, and survival records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded target-goal details needed by this module.

## Fit / Failure Logic

Check these before recommending a method:

- Dose scale: continuous, ordinal, categorical, time-varying, cumulative, average, peak, thresholded, or transformed.
- Intervention meaning: dose levels, shifts, or modified policies must be feasible and interpretable.
- Timing: dose is measured before outcome and aligned with time zero/follow-up.
- Support: enough observations exist across the dose range or in the contrast/shift region.
- Positivity: each target dose or shift is plausible for covariate patterns in the target population.
- Confounding: covariates sufficient for dose assignment and outcome must be measured with correct timing.
- Measurement error: noisy, discretized, or proxy dose measures may dominate curve shape.
- Extrapolation: curves outside observed support should not be treated as causal evidence.

Block or caveat claims when dose values are mostly unsupported, dose is not intervenable, timing is unclear, measurement error is severe, extrapolation drives the curve, or high/low doses represent fundamentally different target populations.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- dose distribution and density plots by key covariates;
- sparse-range and positivity flags for candidate contrasts or shifts;
- outcome-by-dose exploratory plots labeled descriptive;
- covariate balance or generalized propensity score diagnostics across dose ranges;
- transformed dose scale options, bins, thresholds, or clinically meaningful contrasts;
- measurement error and outlier/influential range checks;
- prototype curve, contrast, or modified treatment policy definition.

## Method Or Support Guidance

Distinguish common dose-response targets:

- **Dose contrast**: compare two or more fixed dose levels; often easiest to explain if supported.
- **Dose-response curve**: estimate expected outcome over a dose range; useful but sensitive to support and functional form.
- **Threshold or saturation analysis**: assess whether effects change around cut points; requires domain rationale and binning sensitivity.
- **Stochastic shift intervention**: shift dose by a feasible amount, such as reducing exposure by one unit where possible.
- **Modified treatment policy (MTP)**: define a rule that maps observed dose to a feasible modified dose; often more realistic than setting everyone to the same level.
- **Exploratory exposure-response**: descriptive or design-learning work when causal support is incomplete.

Candidate method lanes:

- Flexible outcome regression or splines when the target is descriptive or supported by strong adjustment and good overlap.
- Generalized propensity score weighting/stratification when continuous-dose assignment needs explicit balancing diagnostics.
- Doubly robust/TMLE/DML continuous-treatment estimators when observational adjustment uses flexible nuisance models.
- Stochastic shift or MTP estimators when fixed-dose interventions are unrealistic or positivity is weak at extremes.
- Ordinal or multi-level treatment methods when dose has few meaningful categories.
- Longitudinal g-methods when dose accumulates or changes over time.

Use `scripts/recommend.py` with `sample_input.json` when quick target/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- support and positivity across dose levels or modified dose shifts;
- extrapolation and influential dose ranges;
- covariate balance or generalized propensity diagnostics;
- functional-form sensitivity: spline knots, bins, kernels, monotonicity, transformations, and learner class;
- measurement error, heaping, censoring/truncation of dose, and outliers;
- domain meaningfulness and safety of proposed dose changes;
- effect-scale sensitivity and whether the curve hides subgroup heterogeneity;
- unmeasured confounding sensitivity for observational dose-response claims.

Do not report a smooth curve as causal where only a few dose regions are supported. Prefer reporting supported contrasts or realistic shifts when the full curve is fragile.

## Output To Main Team

Return:

- dose-response target, dose scale, feasible range, and intervention meaning;
- contrast, curve, threshold, stochastic shift, or MTP definition;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible method/package lane and why it fits;
- assumptions, diagnostics, limitations, and robustness needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.target_goal`:

- set `subskill_id`: `23-dose-response-effects`
- set `module_type`: `target_goal`
- set `role`: `target_module`
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `type_specific.target_goal`: `target_goal`, `estimand_targets`, `target_population`, `effect_scale`, `decision_or_interpretation_goal`, `design_route_needed`, and `reporting_boundary`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Dose-Response Analysis" or "Exposure-Response Target";
- dose target and why it matches the user's scientific question;
- dose scale, feasible intervention range, timing, and support;
- design route and identification limits;
- method, software, model form, and adjustment strategy;
- curve, contrast, threshold, shift, or MTP estimates if computed;
- diagnostics, sensitivity checks, and unsupported ranges;
- claim boundary: exploratory, descriptive, cautious causal, supported causal, or not supportable;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed dose-response workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for generalized propensity scores, MTP/shift interventions, and flexible continuous-treatment estimation.
- `scripts/recommend.py`: rule-based target/package recommender for quick internal triage.
