---
name: matching-weighting-balance
description: "Use as an implementation_support method/task subskill for matching, weighting, propensity scores, balancing scores, overlap, positivity, trimming, exact or coarsened matching, entropy balancing, overlap weights, ATT/ATE/ATO weighting, survey-weight integration, balance diagnostics, effective sample size, and report-ready matched or weighted comparison evidence."
---

# matching_weighting_balance

## Role

Act as a bounded `implementation_support` specialist for constructing and diagnosing matched or weighted comparisons inside a selected design route and target. Improve balance, support, estimand clarity, and report transparency without supplying identification by itself.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module supports designs such as observational point exposure, longitudinal IPW/MSM, transportability, and some trial-to-target settings. It must not override `method_lead` on the causal claim, estimand, causal structure, or gate status.

## When To Activate

Use this module when a design route needs propensity scores, balancing scores, matching, weighting, trimming, overlap checks, positivity diagnostics, covariate balance, standardized mean differences, effective sample size, ATT/ATE/ATO/overlap targets, survey-weight integration, calibration, entropy balancing, or matched/weighted report tables.

Do not use it when treatment is actually randomized and simple design-based adjustment is enough, unless balance diagnostics, trial-to-target weighting, noncompliance weighting, or precision/support checks are specifically needed.

## Inputs To Read

Read only the compact state needed for balance/support implementation:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: confounder meaning, exact-match variables, target population, and acceptable support restrictions.
- `data_analyst`: analysis alignment, covariate timing, missingness, treatment prevalence, support, survey weights, clusters, and artifacts.
- `method_lead`: design route, estimand, adjustment set, positivity concerns, sensitivity plan, and wording boundary.
- related `subskill_records`: especially observational exposure, longitudinal g-methods, transportability, dose-response, doubly robust estimation, DML, or survival records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded implementation details needed by this module.

## Fit / Failure Logic

Check these before recommending a matching/weighting plan:

- Estimand: ATE, ATT, ATC, ATO/overlap, target-population, longitudinal strategy, or survey-weighted target is explicit.
- Covariates: adjustment variables are pre-treatment and match the causal structure; mediators/colliders are not included as ordinary confounders.
- Support: comparison groups overlap enough for the chosen estimand.
- Missingness: covariate and outcome missingness handling is specified before matching/weighting.
- Treatment model: propensity or balancing model can be estimated without separation, leakage, or unstable high-dimensional overfit.
- Weights/matches: extreme weights, discarded units, replacement, calipers, exact-match constraints, and clustering are tracked.
- Diagnostics: balance is checked on covariates and important transforms/interactions, not only propensity scores.
- Report target: the final matched/weighted population is interpretable to the domain and user.

Apply the common constructed-input checks to matched or weighted analysis sets. Trimming, calipers, exact/coarsened matches, overlap weights, stabilized weights, survey calibration, or covariate transformations can be valid when they preserve pre-treatment roles and state the resulting target population. If construction discards unsupported units, changes ATE to ATT/ATO/overlap targets, balances colliders/post-treatment variables, or selects specifications by outcome fit, record the changed estimand and claim limit.

Block or caveat implementation when key confounders are missing, covariates are post-treatment, support is absent, weights are unstable, matching discards the target population, survey design is ignored when required, or balance diagnostics remain poor after reasonable attempts.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- pre-treatment adjustment-set table with missingness and timing flags;
- propensity score and overlap plots by treatment;
- balance table before and after matching/weighting using standardized mean differences;
- weight distribution, truncation, and effective sample size;
- matched-pair or subclass counts, discarded units, and target-population shift;
- exact-match or coarsened-match feasibility for domain-critical variables;
- survey-weight, cluster, or repeated-measure implications;
- reproducible matched/weighted analysis dataset and diagnostic artifacts.

## Method Or Support Guidance

Choose the support lane from estimand and support:

- Nearest-neighbor, optimal, exact, or coarsened matching when the goal is transparent ATT-style comparison and adequate controls exist.
- Full matching, subclassification, or matching with replacement when support is uneven and preserving more units matters.
- IPW/IPTW or stabilized weights when ATE or longitudinal MSM-style targets are supported and weights are stable.
- ATT/ATC weights when one observed group is the target population.
- Overlap weights or trimming when broad ATE support is weak but a supported overlap population is meaningful.
- Entropy balancing, calibration, raking, CBPS, or stable balancing weights when direct balance is more important than a propensity model story.
- Survey or transport weights when the target is a population or trial-to-target effect, coordinated with `24-transportability-generalizability`.

Machine learning can estimate propensity scores or balancing weights, but balance, support, and target-population meaning matter more than predictive accuracy.

Use `scripts/recommend.py` with `sample_input.json` when quick implementation/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the matched or weighted estimand actually supported:

- `inference_supported` only when balance, overlap, estimand target, trimming, matching/weighting construction, and variance method are compatible with the design route.
- `descriptive_only` or `exploratory_only` when balance is incomplete, weights are extreme, matches are sparse, trimming changes the target without documentation, or the propensity/balancing model was tuned to chase the outcome.
- `claim_scope`: matched sample, overlap population, ATT, ATE, ATM, entropy-balanced pseudo-population, trimmed population, or diagnostic balance result; do not report as full-population ATE unless the target supports it.
- Valid routes include matched-sample inference, sandwich/robust or bootstrap uncertainty when appropriate, weight-stabilized analyses, overlap-weight inference, exact/near-fine balance diagnostics, Rosenbaum-style hidden-bias sensitivity, and comparison to outcome/DR estimators.
- Do not treat good balance as proof of no unmeasured confounding, and do not treat propensity score prediction quality as the inferential target.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted matching/weighting routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For matching, weighting, and balance, the statistical claim is about a constructed comparison and its target population, not about propensity-score prediction. Treat these as claim-boundary issues:

- matching, trimming, overlap weights, entropy balancing, calibration weights, and survey/transport weights create different target populations;
- balance is evidence about measured covariates only and cannot validate unmeasured exchangeability;
- outcome-tuned propensity/balancing models, post-treatment covariates, and post-outcome pruning can invalidate design-stage logic;
- extreme weights, sparse matches, poor effective sample size, and discarded units can turn an intended ATE into an overlap/trimmed/matched estimand;
- variance must match the estimator, replacement/matching structure, weights, clusters, survey design, and outcome model.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when the selected matching/weighting target matches `method_lead`'s estimand, measured-covariate balance and overlap are acceptable, construction choices are documented, and uncertainty matches the final analysis set.
2. Set `status: internally_validated` when balance, overlap, effective sample size, weight/match sensitivity, and benchmark comparisons support measured-covariate comparability but unmeasured-confounding assumptions remain.
3. Set `status: descriptive_only` when the output is a balance table, overlap plot, or design diagnostic without an effect estimate.
4. Set `status: exploratory_only` when balance is incomplete, weights/matches are unstable, trimming changed the target without approval, or the propensity/balancing model was tuned after seeing outcome effects.
5. Set `status: blocked` when support is absent, key confounders are missing, covariates are post-treatment, weights are unusable, or no interpretable target population remains.
6. Set `claim_scope` to `target_sample` for matched/weighted sample effects, `target_population` only when weighting truly targets a population and transport/survey assumptions are supported, `internally_validated` for measured-balance evidence, or `exploratory_only` for diagnostics/design attempts.
7. Use `inference_or_validation_route` for balance-specific support: matched-pair/subclass inference, Abadie-Imbens-style matching uncertainty when relevant, robust/sandwich or bootstrap variance, overlap-weight inference, stabilized/truncated weights, entropy balancing/calibration diagnostics, CBPS/balancing weights, survey-weight integration, hidden-bias sensitivity, and comparison to outcome/DR estimators.
8. Use `method_specific_limits` to state the exact boundary: measured confounding only, matched/trimmed/overlap population only, full ATE not supported, ESS too low, balance incomplete, survey design unresolved, no hidden-bias protection, or diagnostic-only evidence.
9. Ask `data_analyst` for the smallest missing check: pre/post balance table, overlap plots, ESS, weight tails/truncation, discarded units, target-population shift, exact-match feasibility, cluster/survey implications, hidden-bias sensitivity, and reproducible matched/weighted dataset.
10. Set `method_lead_recheck.required: true` when matching/weighting changes the estimand, restricts the population, reveals positivity failure, shows key confounders unavailable, or requires weaker claim wording.

Example - balance diagnostic only:

```yaml
statistical_evidence:
  status: descriptive_only
  claim_scope: exploratory_only
  inference_or_validation_route:
    - "Current output is a balance/overlap diagnostic; no effect estimate with valid uncertainty is returned."
    - "Balance is incomplete and target population after trimming is not yet approved."
  method_specific_limits:
    - "Do not report balance improvement as proof of no confounding."
    - "Do not call the current analysis a full-population ATE if trimming or overlap weights changed the target."
requests:
  data_analyst:
    - "Produce pre/post balance, overlap, ESS, weight tails, discarded-unit table, and target-population shift summary."
method_lead_recheck:
  required: true
  reason: "Support restrictions may change the estimand and claim scope."
```

Example - supported weighted/matched comparison:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_sample
  inference_or_validation_route:
    - "Matched/weighted effect estimated after acceptable measured-covariate balance, overlap, ESS, and target-population diagnostics."
    - "Variance route accounts for weights, matching/subclasses, clustering, or survey design as relevant."
  method_specific_limits:
    - "Claim is for the recorded matched, weighted, overlap, or trimmed population under measured-confounding assumptions."
    - "Good balance does not rule out hidden bias or unsupported full-population extrapolation."
```

## Diagnostics And Sensitivity

Review:

- pre/post standardized mean differences, variance ratios, empirical CDF/KS-style differences, and distribution plots;
- overlap/common support and propensity score separation;
- effective sample size, weight tails, truncation, and influence of large weights;
- discarded units, matched-pair quality, replacement, calipers, and target-population shift;
- balance on exact-match variables, nonlinear terms, interactions, and high-priority domain covariates;
- robustness to method, caliper, trimming, propensity learner, weight type, and estimand;
- compatibility with clustering, survey design, missingness, censoring, and outcome type.

Do not present balance improvement as proof of no unmeasured confounding. It is evidence about measured covariate comparability only.

## Output To Main Team

Return:

- selected matching/weighting target, estimand implications, and target population;
- whether the implementation is direct, adapted, exploratory, blocked, or not applicable;
- feasible package/model lane and why it fits;
- balance, overlap, weight, and matched-sample diagnostics needed or reviewed;
- limitations, robustness checks, and report-ready artifacts;
- statistical_evidence: status, matched/weighted claim scope, balance-specific inference or validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.implementation_support`:

- set `subskill_id`: `30-matching-weighting-balance`
- set `module_type`: `implementation_support`
- set `role`: `implementation_support` or `support_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.implementation_support`: `implementation_role`, `estimator_or_model_family`, `required_data_shape`, `nuisance_or_prediction_components`, `diagnostic_outputs`, `reproducibility_outputs`, and `package_or_code_options`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Matching and Balance Diagnostics" or "Weighting and Positivity Checks";
- estimand, target population, adjustment set, and why matching/weighting was used;
- method, software, propensity/balancing model, caliper/trimming/weight choices;
- units retained/discarded, effective sample size, and target-population shift;
- balance and overlap figures/tables;
- limitations: measured confounding only, support restrictions, extreme weights, missingness, or survey/cluster issues;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed matching/weighting workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for matching, weighting, balance plots, overlap weights, entropy balancing, and diagnostics.
- `scripts/recommend.py`: rule-based matching/weighting recommender for quick internal triage.
