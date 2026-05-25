---
name: doubly-robust-estimation
description: "Use as an implementation_support method/task subskill for AIPW, augmented inverse probability weighting, TMLE, one-step estimators, efficient influence functions, doubly robust estimation, targeted learning, Super Learner nuisance models, cross-fitting needs, missingness/censoring nuisance support, and robust effect-estimation report support."
---

# doubly_robust_estimation

## Role

Act as a bounded `implementation_support` specialist for doubly robust, one-step, and targeted estimators inside a selected design route and target. Clarify nuisance models, estimand compatibility, influence-function diagnostics, uncertainty, and reporting boundaries.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module improves estimation robustness when identification, timing, support, and adjustment set are already coherent. It does not supply identification by itself and must not weaken claim boundaries set by `method_lead`.

## When To Activate

Use this module when the project needs AIPW, augmented IPW, TMLE, one-step estimation, doubly robust estimation, targeted learning, efficient influence functions, outcome and propensity nuisance models, censoring/missingness nuisance models, Super Learner, cross-fitting for nuisance estimation, or robust implementation of ATE/ATT/risk/mean/survival-style targets.

Coordinate with `32-double-machine-learning` when the main concern is orthogonal ML, partially linear models, residualization, or generic high-dimensional nuisance learning.

## Inputs To Read

Read only the compact state needed for doubly robust implementation:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: outcome scale, effect scale, meaningful covariates, subgroup concerns, and interpretability.
- `data_analyst`: analysis alignment, analysis-ready matrix, missingness/censoring, support, splits, nuisance diagnostics, clusters, and artifacts.
- `method_lead`: design route, estimand, adjustment set, assumptions, positivity, sensitivity plan, and wording boundary.
- related `subskill_records`: especially observational exposure, longitudinal g-methods, matching/weighting, DML, survival, dose-response, heterogeneity, or policy records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded implementation details needed by this module.

## Fit / Failure Logic

Check these before recommending an estimator:

- Estimand: ATE, ATT, risk difference, mean difference, survival contrast, longitudinal strategy, transport target, or another parameter is explicit.
- Design: selected design route identifies the estimand under stated assumptions.
- Nuisance set: outcome, treatment/propensity, censoring, missingness, and sampling models use valid pre-treatment or time-ordered variables.
- Positivity: treatment, censoring, and sampling probabilities are not near-deterministic in the target population.
- Learners: nuisance models are stable enough for sample size and data structure; cross-fitting is planned when flexible learners are used.
- Variance: influence-curve, bootstrap, cluster, or repeated-split uncertainty plan matches the estimator and data.
- Diagnostics: nuisance predictions, propensity tails, influence-curve tails, fold stability, and benchmark estimators are reviewed.

Apply the common constructed-input checks to doubly robust estimator inputs. Nuisance-model features, missingness/censoring indicators, transformed covariates, sample restrictions, Super Learner libraries, or cross-fitting folds can be valid when timing, support, and target definitions remain correct. If construction introduces leakage, post-treatment adjustment, target-population drift, or unstable nuisance/weight behavior, double robustness does not rescue the claim; record the implementation limit.

Block or caveat implementation when identification is unsettled, positivity fails, nuisance variables are post-treatment or missing, sample size cannot support flexible learners, cross-fitting is infeasible for the selected approach, or diagnostics show unstable influence/weight behavior.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- analysis-ready covariate/outcome/treatment matrix with timing and leakage checks;
- cross-fitting or sample-splitting plan with id/cluster grouping when needed;
- propensity/support diagnostics and truncation options;
- nuisance-model prediction diagnostics and calibration;
- influence-curve distribution, standard error, and outlier checks;
- comparison table against regression, weighting, matching, or simple design estimator;
- reproducible code paths and estimate objects.

## Method Or Support Guidance

Choose the estimator lane from target and data:

- AIPW or one-step estimators for transparent binary-treatment ATE/ATT/mean/risk targets with outcome and propensity nuisance models.
- TMLE when targeted updating, bounded outcomes, risk parameters, Super Learner, or targeted loss behavior is important.
- `drtmle`/TMLE variants when nuisance estimates are flexible and robust inference is desired.
- Longitudinal TMLE or sequentially doubly robust methods when treatment/censoring histories are central, coordinated with `09-longitudinal-gmethods`.
- Survival TMLE or censoring-aware DR methods when censoring or time-to-event outcome drives the target, coordinated with `33-survival-competing-risks`.
- Transport or sampling-weight DR estimators when source-to-target differences matter, coordinated with `24-transportability-generalizability`.

Double robustness means consistency can hold if either the outcome regression or treatment/censoring/sampling mechanism is correctly specified, under identification and regularity conditions. It does not protect against wrong causal structure, unmeasured confounding, no support, leakage, or badly defined outcomes.

Use `scripts/recommend.py` with `sample_input.json` when quick estimator/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the DR/TMLE claim supported by nuisance behavior and variance diagnostics:

- `inference_supported` when identification is settled, nuisance functions are valid for the time/order structure, positivity is adequate, cross-fitting or Donsker-compatible estimation is handled as needed, and influence-curve/variance diagnostics are stable.
- `exploratory_only` when DR/TMLE is used as a first-pass flexible estimator, nuisance fits are unstable, folds are too small, support is weak, or the variance route does not match clustering/censoring/sampling.
- `claim_scope`: ATE/ATT/risk/mean/RMST/sampling target actually encoded by the EIF or estimating equation; keep it distinct from nuisance-prediction performance.
- Valid routes include AIPW/one-step influence-function inference, TMLE plug-in inference, cross-fitted/DR estimators, bootstrap or repeated-split checks when justified, cluster-aware variance, and comparison to simpler design-consistent estimates.
- Do not report "doubly robust" as meaning robust to wrong causal structure, unmeasured confounding, no overlap, leakage, or both nuisance models failing.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted doubly robust/targeted-learning routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For DR/TMLE, the statistical claim is about a specific efficient influence function or estimating equation inside an already identified causal target. Treat these as claim-boundary issues:

- double robustness is conditional on identification, valid variables, positivity, and at least one compatible nuisance component; it is not protection against causal misspecification;
- the EIF/score must match the estimand, outcome scale, sampling/transport target, censoring, time ordering, and cluster/survey structure;
- flexible nuisance learning needs cross-fitting or another valid complexity-control route unless the estimator's theory supports otherwise;
- unstable influence-curve tails, extreme propensities/censoring weights, separation, and tiny folds can dominate finite-sample evidence;
- TMLE/AIPW results should be compared with simpler design-consistent estimates rather than treated as automatically superior.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when `method_lead` has settled identification, the EIF/estimating equation matches the target, nuisance variables are valid and timed correctly, positivity is adequate, and uncertainty is stable for the data structure.
2. Set `status: internally_validated` when nuisance diagnostics, influence-curve checks, fold stability, truncation sensitivity, and benchmark comparisons support the estimate but some regularity or finite-sample concerns remain.
3. Set `status: exploratory_only` when DR/TMLE is used as a first-pass flexible estimator, nuisance fits are unstable, cross-fitting leaks or is infeasible, support is weak, or variance is not compatible with censoring/clustering/sampling.
4. Set `status: blocked` when identification is unsettled, no support exists, required nuisance variables are post-treatment/unavailable, both nuisance components are implausible, or the EIF does not match the target.
5. Set `claim_scope` to `target_sample` for the encoded estimand in the analysis sample, `target_population` only with sampling/transport support, `internally_validated` for stable but assumption-bounded evidence, or `exploratory_only` for first-pass DR output.
6. Use `inference_or_validation_route` for DR-specific support: AIPW/one-step EIF inference, TMLE plug-in inference, longitudinal TMLE, survival/censoring-aware TMLE, cross-fitted DR estimation, Super Learner with valid folds, influence-curve variance, bootstrap/repeated split when justified, cluster-aware variance, truncation sensitivity, and benchmark comparison.
7. Use `method_specific_limits` to state the exact boundary: not robust to unmeasured confounding, no positivity rescue, finite-sample instability, EIF target only, nuisance-prediction accuracy not the estimand, both nuisances likely misspecified, or cluster/censoring variance unresolved.
8. Ask `data_analyst` for the smallest missing check: nuisance timing/leakage table, fold plan, propensity/censoring tails, influence-curve mean/tails, truncation sensitivity, learner library stability, benchmark estimates, and cluster/survey variance plan.
9. Set `method_lead_recheck.required: true` when DR diagnostics reveal positivity failure, change target scale, show causal variables invalid, contradict simpler estimates, or require weaker claim wording.

Example - exploratory DR estimate:

```yaml
statistical_evidence:
  status: exploratory_only
  claim_scope: exploratory_only
  inference_or_validation_route:
    - "Current DR/TMLE estimate is a first-pass flexible estimator; cross-fitting, influence-curve stability, and truncation sensitivity are not yet reviewed."
    - "Compare against simpler design-consistent estimates and inspect nuisance/support diagnostics."
  method_specific_limits:
    - "Do not report double robustness as protection against unmeasured confounding, leakage, or positivity failure."
    - "Estimate is not inference-supported until the EIF target and variance route match the analysis structure."
requests:
  data_analyst:
    - "Produce fold plan, nuisance calibration, propensity/censoring tails, influence-curve diagnostics, truncation sensitivity, and benchmark estimates."
method_lead_recheck:
  required: true
  reason: "Nuisance or positivity instability may weaken the selected estimation route and claim strength."
```

Example - supported DR/TMLE estimate:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_sample
  inference_or_validation_route:
    - "AIPW/one-step/TMLE estimator uses an EIF or estimating equation matched to the recorded estimand and data structure."
    - "Cross-fitting or valid complexity control, influence-curve variance, support diagnostics, and benchmark comparisons reviewed."
  method_specific_limits:
    - "Claim is for the recorded estimand under the design-route assumptions; DR does not validate causal structure or unmeasured-confounding assumptions."
    - "Report nuisance and truncation sensitivity with the estimate."
```

## Diagnostics And Sensitivity

Review:

- propensity/support and truncation;
- nuisance model calibration, fold stability, and learner sensitivity;
- influence-curve mean near zero, tails/outliers, and variance estimates;
- standard error method, clustering, repeated splits, bootstrap, or sample-splitting uncertainty;
- comparison against simpler estimators and matching/weighting diagnostics;
- missingness/censoring and sampling weights when relevant;
- sensitivity to learner library, truncation, covariate set, folds, seeds, and target scale.

Do not report a DR estimate as automatically more credible than a simpler design-consistent estimate when diagnostics are unstable or the assumptions are weaker.

## Output To Main Team

Return:

- selected DR/TMLE/one-step target and estimator lane;
- whether the implementation is direct, adapted, exploratory, blocked, or not applicable;
- nuisance requirements and package/model recommendations;
- diagnostics, variance plan, limitations, and robustness checks;
- statistical_evidence: status, DR/TMLE claim scope, influence-function or targeted-learning inference route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.implementation_support`:

- set `subskill_id`: `31-doubly-robust-estimation`
- set `module_type`: `implementation_support`
- set `role`: `implementation_support` or `support_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.implementation_support`: `implementation_role`, `estimator_or_model_family`, `required_data_shape`, `nuisance_or_prediction_components`, `diagnostic_outputs`, `reproducibility_outputs`, and `package_or_code_options`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Doubly Robust Estimation" or "Targeted Learning Analysis";
- estimand, design route, adjustment set, nuisance functions, and software;
- learner library, cross-fitting/sample-splitting plan, truncation, and variance method;
- estimate, confidence interval, influence-curve diagnostics, and comparison to simpler estimates;
- limitations: measured confounding only, positivity, nuisance instability, sample size, censoring, clustering, or missingness;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed doubly robust/TMLE workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for AIPW, TMLE, Super Learner, influence-curve diagnostics, and DR learners.
- `scripts/recommend.py`: rule-based doubly robust estimator recommender for quick internal triage.
