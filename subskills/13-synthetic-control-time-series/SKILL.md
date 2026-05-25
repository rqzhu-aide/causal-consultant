---
name: synthetic-control-time-series
description: "Use as a design_route method/task subskill for synthetic control, augmented synthetic control, generalized synthetic control, synthetic difference-in-differences, interrupted time series, comparative interrupted time series, Bayesian structural time series, CausalImpact, matrix completion, panel factor models, aggregate interventions, one or few treated units, donor pools, intervention dates, pre-period fit, placebo/permutation inference, and time-series causal diagnostics."
---

# synthetic_control_time_series

## Role

Act as a bounded `design_route` specialist for aggregate interventions over time. Decide whether treated-unit timing, donor comparability, pre-period fit, time-series structure, and post-period evidence can support synthetic control, synthetic DiD, interrupted time series, Bayesian structural time-series, matrix-completion, or related designs.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module handles aggregate/panel time-series counterfactual designs. It should coordinate with DiD when many treated units or staggered adoption dominate, and with interference review when donor/control units may be contaminated.

## When To Activate

Use this module when there is one or a few treated aggregate units, intervention dates, policy shocks, market/country/state/site-level outcomes over time, donor pools, synthetic controls, synthetic DiD, interrupted time series, comparative interrupted time series, Bayesian structural time-series, CausalImpact, matrix completion, generalized synthetic control, augmented synthetic control, pre-period fit, placebo/permutation tests, or donor-weight diagnostics.

Also use it when another module needs aggregate time-series counterfactual support, such as DiD with few treated units, policy rollout evaluation, platform/product interventions across markets, or survival/rate outcomes measured over time.

## Inputs To Read

Read only the compact state needed for synthetic/time-series support:

- `project_summary`: user goal, phase, data paths, deliverable, audience.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: intervention meaning, timing, concurrent shocks, donor comparability, spillover risk, seasonal/institutional timing, and interpretable outcome scale.
- `data_analyst`: analysis alignment, panel/time-series schema, treated/donor units, pre/post windows, missingness, pre-fit diagnostics, placebo datasets, plots, and reproducibility assets.
- `method_lead`: causal claim, target estimand, donor/control assumptions, intervention timing, diagnostics, and wording boundary.
- related `subskill_records`: especially DiD/event study, interference/spillovers, transportability, survival, dose-response, or matching/weighting records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded design details needed by this module.

## Fit / Failure Logic

Check these before recommending software:

- Treated unit: one/few treated aggregate units are clearly defined, or multiple treated units fit generalized/synthetic DiD logic.
- Intervention timing: start date, phase-in, anticipation, and post-period are defensible.
- Donor pool: control units are comparable, untreated, not contaminated, and not affected by spillovers.
- Pre-period: long enough and rich enough to learn counterfactual trends, seasonality, and donor weights.
- Pre-fit: treated unit can be approximated by donors; poor fit requires augmented/model-based methods and stronger caveats.
- Outcome: measured consistently over time and across units; transformations/rates denominators are sensible.
- Shocks: no dominant concurrent events differentially hit treated unit at the intervention date.
- Inference: placebo/permutation, conformal, bootstrap, or model-based uncertainty matches the design.

Apply the common constructed-input checks to synthetic-control and time-series inputs. Outcome transformations, time aggregation, donor restrictions, predictor summaries, pre-period trimming, or treated-unit definitions can be valid when they preserve intervention timing, donor comparability, pre-fit diagnostics, and the target contrast. If donor/time/predictor choices are selected after seeing post-treatment effects, or construction hides concurrent shocks and poor pre-fit, report placebo/sensitivity limits rather than strong causal evidence.

Block or caveat causal claims when intervention timing is ambiguous, donor pool is contaminated, treated unit cannot be approximated pre-treatment, too few pre-periods exist, outcome measurement changes at treatment, concurrent shocks dominate, spillovers are likely, or the design is actually ordinary staggered DiD without a donor/pre-fit problem.

## Data Work It May Request

Ask `data_analyst` for one small, concrete check by default:

- unit-time panel or single treated time-series schema with unit id, time, treatment, outcome, covariates, donor flag, and sample windows;
- treated/donor map, intervention date, pre/post window, and donor exclusions;
- raw treated-versus-donor trends, seasonality, autocorrelation, missingness, and outcome transformations;
- pre-period fit diagnostics, RMSPE/MSPE, predictor balance, and donor/time weights;
- placebo/permutation datasets, leave-one-donor-out checks, alternative intervention dates, and post-period window sensitivity;
- ITS segmented-regression dataset, autocorrelation/seasonality checks, or BSTS covariate control series if relevant;
- reproducible paths for panel data, figures, model objects, placebo outputs, and package versions.

## Method Or Support Guidance

Choose the lane from treated-unit structure and counterfactual problem:

- Classic synthetic control: best for one treated aggregate unit, credible donor pool, long pre-period, and good pre-treatment fit.
- Augmented synthetic control: use when donor fit is imperfect but a model-based bias correction is plausible; watch extrapolation.
- Generalized synthetic control / matrix completion: use with multiple treated units, staggered treatment, or interactive fixed-effect structure when model assumptions fit.
- Synthetic DiD: use when both unit weights and time weights help, often with panel data and a DiD-like estimand; coordinate with `10-did-event-study`.
- Interrupted time series: use when no valid donor pool exists but a single treated time series has enough pre/post observations; claims are weaker and vulnerable to concurrent shocks.
- Comparative ITS or BSTS/CausalImpact: use when control time series are available and not affected by intervention; model seasonality/autocorrelation and covariate relationships.
- Few treated units with policy timing: prefer donor/placebo diagnostics and transparent visual evidence; avoid overconfident p-values from tiny donor pools.
- Staggered many-unit policy adoption: coordinate with `10-did-event-study`; use this module only if donor fit/synthetic weighting is central.

Use `scripts/recommend.py` with `sample_input.json` when quick method/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the claim supported by pre-fit quality, donor structure, and placebo evidence:

- `inference_supported` or `internally_validated` only when the treated unit, intervention date, donor pool, pre-period fit, and uncertainty route are defensible for the chosen SCM/ITS/factor-model estimator.
- `exploratory_only` when donor selection, predictors, intervention date, post-period window, or model class were chosen after seeing effects, or when there are too few credible placebos.
- `claim_scope`: the treated unit(s) and post-period window under the donor-pool design; do not generalize to other units or future periods without transport or replication evidence.
- Valid routes include in-space/in-time placebo or permutation tests, conformal or bootstrap uncertainty where appropriate, Bayesian structural time-series intervals, augmented or generalized synthetic-control model uncertainty, donor leave-one-out checks, and pre-fit/RMSPE diagnostics.
- Do not present a good-looking treated-versus-synthetic plot as confirmatory statistical evidence when placebo support, pre-period fit, donor contamination, or concurrent shocks remain unresolved.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted validation routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For synthetic-control and aggregate time-series designs, the statistical claim is tied to the counterfactual construction, not just the post-treatment gap. A convincing gap requires a credible donor/control process, pre-period fit, transparent model selection, and uncertainty or placebo evidence. Treat these as claim-boundary issues:

- donor pool, predictors, pre-period length, intervention date, and post-period window should not be selected to maximize the observed effect;
- weak pre-treatment fit, unstable donor weights, extrapolation, or contaminated donors can make the counterfactual descriptive rather than causal;
- placebo evidence is often design-based and finite-sample; few donor units or poor placebo fit limits p-value language;
- interrupted time-series and BSTS/CausalImpact claims are model-dependent and vulnerable to concurrent shocks, seasonality, and autocorrelation misspecification;
- the supported claim is usually for the treated unit(s) and observed post-period, not a general policy effect.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` when the donor/control pool, pre-period fit, intervention timing, model choice, and uncertainty route are defensible for the chosen SCM/ITS/BSTS/factor-model estimator.
2. Set `status: internally_validated` when pre-fit, placebo/permutation, leave-one-out, RMSPE, alternative-date, or conformal checks support the counterfactual but inference is still finite-sample or design-specific.
3. Set `status: exploratory_only` when donor/predictor/window/model choices were outcome-guided, pre-fit is weak, donor units are few or contaminated, or the output is a first-pass treated-versus-counterfactual plot.
4. Set `status: blocked` when intervention timing is ambiguous, there is no credible donor/control time series, the treated unit cannot be approximated pre-treatment, or concurrent shocks dominate the post gap.
5. Set `claim_scope` to `target_sample` for the treated unit(s) and post-period, `internally_validated` for placebo-supported counterfactual evidence, `model_implied` for BSTS/ITS/model-based forecasts, or `exploratory_only` for first-pass visual gaps.
6. Use `inference_or_validation_route` for method-specific support: in-space or in-time placebo/permutation, RMSPE ratio, donor leave-one-out, alternative intervention dates, conformal inference, bootstrap where appropriate, BSTS posterior intervals, augmented/generalized SCM uncertainty, or synthetic DiD sensitivity.
7. Use `method_specific_limits` to state the exact boundary: treated unit/post-period only, donor-pool dependent, poor pre-fit caveat, model-dependent time-series forecast, few-placebo limitation, no external generalization, or concurrent-shock uncertainty.
8. Ask `data_analyst` for the smallest missing check: donor map, pre/post window table, raw trends, pre-fit/RMSPE, donor weights, placebo distribution, leave-one-out, alternative dates, seasonality/autocorrelation review, or donor contamination screen.
9. Set `method_lead_recheck.required: true` when the record changes the design from SCM to DiD/ITS/BSTS, blocks the donor design, changes claim strength, or narrows report wording to descriptive/model-implied.

Example - exploratory synthetic plot:

```yaml
statistical_evidence:
  status: exploratory_only
  claim_scope: exploratory_only
  inference_or_validation_route:
    - "Current output is a treated-versus-synthetic plot; placebo/permutation and donor sensitivity are not yet reviewed."
    - "Run pre-fit/RMSPE, donor leave-one-out, and alternative intervention-date checks before a stronger claim."
  method_specific_limits:
    - "The observed gap is not reportable as confirmatory causal evidence until donor fit and placebo support are assessed."
    - "Any claim is limited to the treated unit and observed post-period."
requests:
  data_analyst:
    - "Produce donor weights, pre-treatment RMSPE, in-space placebo gaps, leave-one-out donor sensitivity, and alternative-date placebo results."
method_lead_recheck:
  required: true
  reason: "Weak or untested donor fit could change the design route or claim strength."
```

Example - supported SCM/time-series evidence:

```yaml
statistical_evidence:
  status: internally_validated
  claim_scope: target_sample
  inference_or_validation_route:
    - "Pre-treatment fit, donor weights, placebo/permutation distribution, and leave-one-out sensitivity reviewed."
    - "Uncertainty is based on design-compatible placebo, conformal, bootstrap, or BSTS/model-based route as stated."
  method_specific_limits:
    - "Claim covers the treated unit(s) and post-period under the recorded donor/control design."
    - "No automatic generalization to other units, later periods, or different donor pools."
```

## Diagnostics And Sensitivity

Review:

- treated/donor comparability and exclusions;
- pre-period length, pre-treatment fit, predictor balance, and donor/time weights;
- placebo/permutation tests, in-space placebos, in-time placebos, and RMSPE ratios;
- leave-one-out donor sensitivity and donor contamination;
- alternative intervention dates, anticipation periods, post-period windows, transformations, and outcomes;
- autocorrelation, seasonality, trend breaks, and denominator/rate changes;
- uncertainty method: placebo, conformal, bootstrap, Bayesian credible interval, or model-based interval;
- spillovers/interference and concurrent shocks.

## Output To Main Team

Return:

- design lane, treated unit(s), donor/control logic, intervention timing, target estimand, and core assumptions;
- whether implementation is direct, adapted, exploratory, blocked, or not applicable;
- candidate packages/models, diagnostics, assumptions, sensitivity checks, and limitations;
- statistical_evidence: status, treated-unit/time-window claim scope, counterfactual-validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `13-synthetic-control-time-series`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.design_route`: `causal_comparison`, `design_route`, `identification_status`, `required_timing`, `comparison_group_logic`, `key_identification_assumptions`, `invalidating_conditions`, and `estimands_supported`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Synthetic Control Design", "Synthetic Difference-in-Differences", "Interrupted Time-Series Analysis", or "Bayesian Structural Time-Series Counterfactual";
- treated unit(s), donor/control units, intervention date, pre/post windows, outcome scale, and target population;
- method, package, donor/time weights, covariates/predictors, uncertainty method, and sensitivity plan;
- treated-versus-synthetic plots, gaps, cumulative effects, placebo/permutation results, pre-fit diagnostics, and donor weights;
- limitations: donor contamination, weak pre-fit, short pre-period, concurrent shocks, spillovers, model extrapolation, few placebo units, or unstable seasonality;
- code, table, figure, model-object, placebo-output, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed synthetic-control/time-series workflow, team coordination, diagnostics, and report integration.
- `references/literature_and_software.md`: synthetic control, synthetic DiD, ITS, BSTS, and package map.
- `examples/`: short R/Python templates for Synth/tidysynth, augsynth, gsynth, synthdid, CausalImpact/BSTS, and Python benchmarks.
- `scripts/recommend.py`: rule-based synthetic/time-series recommender for quick internal triage.
