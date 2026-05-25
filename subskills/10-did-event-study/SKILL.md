---
name: did-event-study
description: "Use as a design_route method/task subskill for difference-in-differences, event studies, staggered adoption, group-time ATT, treatment timing, panel or repeated cross-section policy evaluation, pre/post comparisons with controls, parallel-trend diagnostics, TWFE cautions, synthetic DiD, DR-DiD, anticipation, spillovers, clustering, and DiD report support."
---

# did_event_study

## Role

Act as a bounded `design_route` specialist for difference-in-differences and event-study designs. Decide whether timing, comparison groups, outcome histories, and population composition can support a counterfactual-trend argument, then recommend a modern DiD lane, diagnostics, and report language.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module identifies and diagnoses the DiD design route. It does not replace target-goal modules for heterogeneity, policy learning, transportability, survival outcomes, mediation, or dose-response; call those when the DiD target needs them.

## When To Activate

Use this module when the project involves treated and comparison units observed before and after an intervention, policy rollout, staggered adoption, event time, relative-time leads/lags, two-way fixed effects, panel data, repeated cross sections, comparative interrupted time series, synthetic DiD, group-time effects, dynamic treatment effects, or a user asking whether pre/post evidence can be causal.

Also use it when another module needs a DiD-style regression analog, panel outcome model, pre-trend diagnostic, or policy-timing check.

## Inputs To Read

Read only the compact state needed for DiD support:

- `project_summary`: user goal, phase, data paths, deliverable, audience.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: policy/event meaning, plausible anticipation, spillover channels, institutional timing, stable population, and meaningful outcome scale.
- `data_analyst`: analysis alignment, unit/time panel structure, repeated cross-section structure, treatment timing map, missingness, outcome history, event-study dataset, clustering, and reproducibility assets.
- `method_lead`: causal claim, target population, estimand, assumptions, comparison group, adjustment set, diagnostics, and wording boundary.
- related `subskill_records`: especially synthetic control/time series, interference, matching/weighting, doubly robust estimation, DML, heterogeneity, transportability, survival, or policy-rule records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded design details needed by this module.

## Fit / Failure Logic

Check these before recommending software:

- Timing: treatment date, adoption cohort, exposure window, and event time are well-defined.
- Comparison: never-treated, not-yet-treated, earlier/later cohorts, or synthetic comparison group is defensible.
- Outcome history: enough pre-periods exist for design learning, pre-trend visualization, and meaningful placebo checks.
- Population: units, composition, measurement, and sample inclusion are stable enough across time and groups.
- Treatment path: absorbing, reversible, repeated, continuous, partial/intensity, or multiple treatments are distinguished.
- Anticipation: units could not respond before treatment unless anticipation windows are modeled.
- Spillovers: untreated controls are not contaminated, or interference/spillover module is active.
- Estimand: 2x2 ATT, group-time ATT, dynamic/event-time effect, cohort-specific effect, aggregate ATT, dose/intensity effect, or synthetic DiD estimand is explicit.
- Inference: clustering matches the assignment/exposure level and serial correlation.

Apply the common constructed-input checks to DiD/event-study panels. Time aggregation, event-window trimming, cohort construction, balanced-panel restrictions, repeated-cross-section pooling, or outcome transformations can be valid when they preserve intervention timing, comparison logic, pre-period diagnostics, and target population. If construction erases adoption timing, anticipation windows, composition changes, or same-data event-window selection, record the result as adapted or exploratory rather than confirmatory DiD evidence.

Block or caveat causal DiD claims when treatment timing is ambiguous, there is no credible comparison group, pre-period evidence is too thin, composition changes dominate, anticipation/spillovers are severe, untreated units are post-treatment selected, treatment is reversed or repeated without a compatible design, or TWFE is used despite staggered timing and heterogeneous effects without justification.

## Data Work It May Request

Ask `data_analyst` for one small, concrete DiD check by default:

- unit-time panel or repeated cross-section schema with unit id, time, cohort/adoption time, treatment, event time, outcome, covariates, weights, clusters, and sample flags;
- treatment timing map, cohort sizes, never-treated/not-yet-treated availability, and treatment reversals;
- outcome means by cohort/group/time and event-time plots;
- pre-period length, missingness by group/time, panel balance, composition changes, and attrition;
- placebo/pre-trend plots and tables using only pre-treatment data;
- clustering, serial correlation, and number of treated/control clusters;
- reproducible event-study dataset, estimator outputs, plot/table paths, and package versions.

## Method Or Support Guidance

Choose the lane from design structure and estimand:

- 2x2 DiD: use simple DiD or DR-DiD when there are two groups/two periods or a clearly collapsed pre/post setup, with conditional parallel trends if covariates are needed.
- Multi-period or staggered adoption: prefer group-time ATT, interaction-weighted, imputation, two-stage, or related modern estimators. Treat TWFE as a benchmark/diagnostic unless homogeneous-effect assumptions are defensible.
- Event-study dynamics: report dynamic effects by event time only after defining cohorts, reference periods, anticipation windows, and aggregation rules.
- Repeated cross sections: require stable population definitions and stationarity/composition checks; use estimators that support repeated cross-section DiD.
- Synthetic or weak-comparison DiD: consider synthetic DiD or synthetic control/time-series support when pre-treatment fit and donor structure matter.
- Continuous/intensity treatment: coordinate with `23-dose-response-effects`; ordinary binary adoption DiD is usually not enough.
- Spillovers/interference: coordinate with `14-interference-spillovers`; untreated units may not be valid controls.
- DR/DML support: coordinate with `31-doubly-robust-estimation` or `32-double-machine-learning` when conditional parallel trends requires flexible nuisance functions.
- Heterogeneity: coordinate with `20-heterogeneous-effects`; cohort/time heterogeneity is central to modern DiD.

Use `scripts/recommend.py` with `sample_input.json` when quick DiD/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the claim supported by the design and event-time evidence:

- `inference_supported` only when the reported estimator matches the timing design, parallel-trend assumption is credible or conditionally justified, anticipation and composition problems are addressed, and clustering/few-cluster inference is appropriate.
- `exploratory_only` when pre-trends are noisy, event windows were selected after seeing results, treatment timing is staggered but only a TWFE benchmark is used, or cohort/time heterogeneity is unresolved.
- `claim_scope`: ATT for specific treated groups, times, cohorts, or aggregation scheme; do not silently generalize to all units or periods.
- Valid routes include group-time ATT estimators, interaction-weighted event studies, imputation/event-study estimators, doubly robust DiD, synthetic DiD, cluster-robust or wild-bootstrap inference, and placebo/pre-period checks.
- Do not treat nonsignificant pre-trends as proof of parallel trends, and do not report negative-weight TWFE or post-hoc event-window findings as confirmatory causal evidence.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted validation routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For DiD/event studies, the central statistical issue is whether the selected comparison units and treatment timing support the counterfactual trend being claimed. Treat these as claim-boundary issues:

- parallel-trend evidence is diagnostic, not proof; low-power pretrend tests and specification searches can distort inference;
- staggered adoption with heterogeneous effects changes the estimand, and TWFE benchmarks may use contaminated or negative-weight comparisons;
- event-time bins, anticipation windows, reference periods, and post-period aggregations are part of the analysis design, not cosmetic plot choices;
- never-treated, not-yet-treated, cohort-specific, synthetic, and repeated cross-section comparisons support different claims;
- serial correlation, few clusters, changing composition, spillovers, treatment reversals, and repeated treatments can invalidate uncertainty or comparison-group logic.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when the timing design, comparison group, estimator family, aggregation rule, and uncertainty route match the actual data structure.
2. Set `status: internally_validated` when placebo, pre-period, event-study, decomposition, or sensitivity evidence supports the pattern but parallel trends or extrapolation still carry substantive assumptions.
3. Set `status: exploratory_only` when the output is a TWFE benchmark in a staggered/heterogeneous setting, the event window was selected after seeing results, the comparison group is provisional, or pre-period evidence is thin.
4. Set `status: blocked` when no credible comparison group, pre-period, treatment timing, or uncontaminated control condition exists.
5. Set `claim_scope` to the actual estimand scope: usually `target_sample` for a group-time/cohort/event-time ATT in the observed sample, `internally_validated` when only placebo-style checks support the counterfactual, or `exploratory_only` for descriptive pre/post patterns.
6. Use `inference_or_validation_route` for method-specific support: group-time ATT, interaction-weighted event study, imputation/event-study estimator, DR-DiD, synthetic DiD, wild cluster bootstrap, randomization/placebo checks, HonestDiD-style sensitivity, or TWFE decomposition.
7. Use `method_specific_limits` to name the exact claim boundary: no proof of parallel trends, no population ATE, no unrestricted dynamic effect claim, no confirmatory claim from selected windows, no clean untreated comparison, or TWFE-only benchmark.
8. Ask `data_analyst` for the smallest missing check: treatment timing map, cohort sizes, comparison-group availability, pre-period/event-time plots, composition checks, cluster counts, modern estimator output, TWFE decomposition, or parallel-trend sensitivity.
9. Set `method_lead_recheck.required: true` when the DiD record changes the selected comparison, estimand, causal claim strength, gate status, or report wording.

Example - exploratory staggered TWFE benchmark:

```yaml
statistical_evidence:
  status: exploratory_only
  claim_scope: exploratory_only
  inference_or_validation_route:
    - "Current output is a TWFE/event-study benchmark; run group-time ATT or interaction-weighted event-study before using confirmatory dynamic claims."
    - "Request TWFE weight/decomposition review and cohort-specific event-time plots."
  method_specific_limits:
    - "Cannot report a supported staggered-adoption causal effect until heterogeneous timing comparisons are handled."
    - "Nonsignificant pre-period coefficients would not by themselves validate parallel trends."
requests:
  data_analyst:
    - "Create cohort-by-time treatment map, cohort sizes, never/not-yet-treated comparison availability, and modern DiD estimator output."
method_lead_recheck:
  required: true
  reason: "The TWFE benchmark may not match the intended group-time ATT or dynamic effect estimand."
```

Example - supported group-time ATT:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_sample
  inference_or_validation_route:
    - "Group-time ATT/event-study estimator used with stated never-treated or not-yet-treated comparison group."
    - "Cluster-appropriate uncertainty and pre-period/placebo diagnostics reviewed."
    - "Parallel-trend sensitivity or bounds documented for the reported aggregation."
  method_specific_limits:
    - "Claim is an ATT for the recorded cohorts/times and aggregation rule, not an all-unit population ATE."
    - "Parallel trends remains an identifying assumption and should be worded as supported by diagnostics, not proven."
```

## Diagnostics And Sensitivity

Review:

- treatment timing validity, event-time coding, and cohort definitions;
- group/time outcome plots before modeling;
- pre-trend and placebo checks without treating nonsignificant pretrends as proof;
- anticipation windows, alternative reference periods, event-time binning, and time windows;
- comparison group choice: never-treated versus not-yet-treated versus synthetic;
- cohort-specific, group-time, and aggregate estimates;
- TWFE decomposition or weight diagnostics if TWFE is shown;
- cluster-robust or bootstrap inference, with few-cluster caution;
- sensitivity to parallel-trend violations, such as HonestDiD-style bounds when event-study estimates are available;
- spillovers, treatment reversals, repeated treatments, composition changes, and outcome measurement changes.

## Output To Main Team

Return:

- DiD design lane, estimand, comparison group, time structure, event-time structure, and treatment-path assumptions;
- whether implementation is direct, adapted, exploratory, blocked, or not applicable;
- candidate packages/models, diagnostics, assumptions, sensitivity checks, and limitations;
- statistical_evidence: status, DiD claim scope, timing/comparison-specific inference or validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `10-did-event-study`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.design_route`: `causal_comparison`, `design_route`, `identification_status`, `required_timing`, `comparison_group_logic`, `key_identification_assumptions`, `invalidating_conditions`, and `estimands_supported`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Difference-in-Differences Design", "Event-Study Analysis", or "Staggered-Adoption DiD";
- intervention, timing, cohorts, comparison group, outcome, panel/repeated cross-section structure, and target population;
- estimand scale and aggregation rule;
- estimator and package, clustering/inference, covariates/weights, and sensitivity checks;
- pre-period plots, event-study plots, cohort/group-time estimates, aggregate ATT, placebo checks, and TWFE benchmark only if useful;
- limitations: parallel trends, weak pre-periods, anticipation, spillovers, composition, treatment reversals, few clusters, or unsupported extrapolation;
- code, table, figure, model-object, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed DiD/event-study workflow, team coordination, diagnostics, and report integration.
- `references/literature_and_software.md`: modern DiD literature and R/Python/Stata package matrix.
- `examples/`: short R/Python templates for Callaway-Sant'Anna, Sun-Abraham/fixest, imputation/two-stage, synthetic DiD, DR-DiD, and Python DiD.
- `scripts/recommend.py`: rule-based DiD recommender for quick internal triage.
