---
name: dose-response-effects
description: "Use as a target_goal method/task subskill for dose-response or exposure-response effects, continuous treatments, ordinal or multi-level treatments, treatment intensity, exposure intensity, thresholds, marginal dose contrasts, generalized propensity scores, stochastic shift interventions, and modified treatment policies."
---

# dose_response_effects

## Role

Act as a bounded `target_goal` specialist for continuous, ordinal, multi-level, or intensity-based treatments. Clarify whether the user wants a full dose-response curve, a contrast between dose levels, a threshold analysis, a stochastic shift intervention, a modified treatment policy, or an exploratory exposure-response summary.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

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
- `data_analyst`: analysis alignment, dose distribution, timing, measurement error, support, sparse ranges, covariate balance by dose, and artifacts.
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

Apply the common constructed-input checks to dose/exposure inputs. Dose grouping, cumulative exposure, windows, thresholding, winsorization, scaling, or modified-treatment features can be valid when they define the estimand and stay within support. If construction turns a continuous dose-response into grouped contrasts, chooses thresholds after seeing effects, mixes incompatible exposure versions, or extrapolates sparse tails, report the narrower target and claim scope.

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

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the dose-response claim supported by support and modeling evidence:

- `inference_supported` only when the exposure scale, intervention contrast, positivity across dose regions, confounding control, and uncertainty method are appropriate for the target dose-response or modified treatment policy.
- `exploratory_only` for post-hoc thresholds, selected knots, visual dose-response shapes, sparse dose tails, or model-implied extrapolation outside supported dose ranges.
- `claim_scope`: marginal dose-response curve, dose contrast, threshold contrast, generalized propensity score target, stochastic/modified treatment policy, or supported dose range; state any trimmed or restricted population.
- Valid routes include generalized propensity score methods, continuous-treatment weighting, outcome regression/g-computation, TMLE/DR/DML continuous-treatment estimators, LMTP or stochastic intervention estimators, bootstrap/sandwich/influence intervals, and sensitivity to dose bins, knots, trimming, and learner choices.
- Do not report a smooth fitted curve as a causal dose-response outside the observed support or without the relevant no-unmeasured-confounding/positivity assumptions.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted dose-response routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For dose-response analysis, the statistical claim depends on the intervention encoded by the dose scale and the support available across that scale. Treat these as claim-boundary issues:

- fixed-dose curves, dose contrasts, thresholds, stochastic shifts, incremental propensity interventions, and modified treatment policies are different targets;
- a continuous curve often requires smoothing/modeling choices, so knots, bandwidths, bins, monotonicity constraints, and threshold searches can create post-hoc claims;
- positivity is local across dose and covariate strata; sparse tails or impossible dose shifts should become unsupported regions, not causal extrapolations;
- generalized propensity scores and continuous-treatment learners need balance/support diagnostics, not just predictive fit;
- measurement error, heaping, dose timing, cumulative dose construction, and dose version differences can dominate the apparent curve.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when the dose target is explicit, the supported dose range or shift is documented, confounding/control assumptions fit the design route, positivity is adequate for the target, and uncertainty matches the curve/contrast/shift estimator.
2. Set `status: internally_validated` when support, balance, knot/bin/learner sensitivity, and bootstrap/influence/sandwich uncertainty support the pattern but the curve remains model- or smoothing-dependent.
3. Set `status: exploratory_only` when thresholds, bins, knots, dose transformations, or dose ranges are chosen after seeing outcomes, when sparse tails drive the shape, or when the output is a descriptive exposure-response plot.
4. Set `status: blocked` when the dose is not intervenable, timing is wrong, support is absent for the target contrast/shift, measurement error dominates, or the analysis would require unsupported extrapolation.
5. Set `claim_scope` to `target_sample` for a supported contrast/curve/shift in the analysis population, `model_implied` for smooth fitted curves, `internally_validated` for sensitivity-supported ranges, or `exploratory_only` for descriptive shape learning.
6. Use `inference_or_validation_route` for dose-specific support: generalized propensity score balancing, continuous-treatment weighting, g-computation/splines, kernel or local smoothing, DR/TMLE/DML continuous-treatment estimators, incremental propensity score interventions, LMTP/stochastic-shift estimators, bootstrap or influence intervals, and sensitivity to bins/knots/trimming/learners.
7. Use `method_specific_limits` to state the exact boundary: supported dose range only, no causal tail extrapolation, threshold exploratory, shift feasible only for eligible units, curve depends on smoothing, no fixed-dose intervention when only an MTP is plausible, or measurement-error caveat.
8. Ask `data_analyst` for the smallest missing check: dose distribution by covariates, supported range/positivity flags, sparse-tail table, GPS/balance diagnostics, threshold/bin/knot sensitivity, measurement-error/heaping review, and feasible shift/MTP definition.
9. Set `method_lead_recheck.required: true` when the record changes the target from binary ATE to dose curve/contrast/MTP, removes unsupported dose regions, reveals positivity failure, or weakens causal wording to model-implied/exploratory.

Example - exploratory curve:

```yaml
statistical_evidence:
  status: exploratory_only
  claim_scope: model_implied
  inference_or_validation_route:
    - "Current dose-response curve is a fitted exploratory shape; supported range, balance, and knot/bin sensitivity are not yet reviewed."
    - "Run dose support, generalized propensity/balance, and smoothing-sensitivity checks before stronger claims."
  method_specific_limits:
    - "Do not report sparse tail behavior or post-hoc thresholds as causal evidence."
    - "Curve is model-implied and limited to observed support."
requests:
  data_analyst:
    - "Produce dose distribution by covariates, support flags for target contrasts/shifts, GPS/balance diagnostics, and knot/bin/learner sensitivity plots."
method_lead_recheck:
  required: true
  reason: "The dose-response target and supported dose range may differ from the user's intended causal claim."
```

Example - supported dose/shift target:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_sample
  inference_or_validation_route:
    - "Dose contrast, supported curve segment, or feasible stochastic/MTP shift estimated with documented support and design-compatible adjustment."
    - "Uncertainty and sensitivity to dose scale, trimming, and smoothing/model choices reviewed."
  method_specific_limits:
    - "Claim applies only to the recorded dose range, shift rule, or contrast and any trimmed/restricted population."
    - "No claim is made for unsupported extremes or different dose versions."
```

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
- statistical_evidence: status, dose-response claim scope, dose-specific inference or validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.target_goal`:

- set `subskill_id`: `23-dose-response-effects`
- set `module_type`: `target_goal`
- set `role`: `target_module`
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
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
