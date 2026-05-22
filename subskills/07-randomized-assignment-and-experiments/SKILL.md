---
name: randomized-assignment-and-experiments
description: "Use as a design_route method/task subskill for randomized assignment, A/B tests, trials, cluster or blocked experiments, encouragement designs, noncompliance, ITT/CACE framing, sample-ratio mismatch, CUPED or variance reduction, randomization inference, and experiment report support."
---

# randomized_assignment_and_experiments

## Role

Act as a bounded `design_route` specialist for randomized or quasi-randomized assignment. Decide whether assignment can support the user's causal comparison, what estimands are natural, what diagnostics are needed, and what claims remain blocked.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback for `method_lead`, `data_analyst`, `domain_expert`, and `report_writer` using `assets/method_job_subskill_record_template.yaml` when durable.

This module supplies the design route. Target modules such as heterogeneity, policy rules, transportability, dose-response, or dynamic policies may still be needed for the user's actual goal.

## When To Activate

Use this module when the project involves randomized assignment, experiments, A/B tests, field trials, clinical trials, encouragement, lotteries, variants/arms, holdouts, assignment logs, cluster or blocked randomization, noncompliance, attrition after assignment, sample-ratio mismatch, randomization inference, CUPED, or experiment-to-target generalization.

Do not use it for ordinary observational exposure comparisons just because treatment groups exist; route those to `08-single-time-observational-exposure` or another design route.

## Inputs To Read

Read only the compact state needed for the experiment design:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: intervention meaning, unit, ethical/practical constraints, common reporting standards, and interpretation.
- `data_analyst`: assignment logs, arm counts, timing, compliance, attrition, clustering, missingness, covariates, outcomes, and artifacts.
- `method_lead`: estimand candidates, assumptions, target modules, diagnostics, sensitivity plan, and wording boundary.
- related `subskill_records`: especially instrumental variables, interference, heterogeneous effects, policy rules, transportability, matching/weighting, DML, or survival records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded design details needed by this module.

## Fit / Failure Logic

Check these before recommending an analysis:

- Assignment: randomization unit, probability, blocking/stratification, clustering, rerandomization, rollout, or encouragement mechanism is known.
- Eligibility and time zero: eligible population, enrollment, assignment date, treatment window, and follow-up are aligned.
- Estimand: ITT, treatment-on-the-treated, CACE/LATE, per-protocol, as-treated, cluster-level effect, subgroup effect, or descriptive contrast is explicit.
- Analysis set: exclusions after assignment do not redefine the target population without a clear reason.
- Compliance: receipt, adherence, crossover, contamination, and encouragement uptake are measured when relevant.
- Outcomes: outcome timing, missingness, censoring, and measurement are comparable by arm.
- Dependence: cluster randomization, paired or blocked designs, repeated measures, interference, or multiple testing are handled.
- Online integrity: assignment logging, sample-ratio mismatch, triggered analyses, novelty effects, and exposure/eligibility filters are checked when relevant.

Block or caveat causal claims when assignment is not actually random, assignment timing is unclear, post-assignment exclusions drive the result, missing outcomes differ by arm, interference is material, noncompliance is analyzed as if receipt were random, or the analysis ignores the randomization unit.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- CONSORT or experiment-flow counts from eligibility to report sample;
- assignment counts, sample-ratio mismatch tests, and arm exposure checks;
- baseline balance summaries with blocked or clustered structure respected;
- compliance, uptake, crossover, attrition, and missingness by arm;
- cluster counts, cluster sizes, intraclass correlation, and unit-of-analysis checks;
- pre-treatment covariates for precision adjustment or CUPED-style variance reduction;
- arm-level, cluster-level, subgroup, or time-window tables and plots;
- reproducible first-pass ITT estimate with robust or randomization-based uncertainty.

## Method Or Support Guidance

Prefer transparent estimators when randomization is intact:

- Difference in means or regression with design-based/robust standard errors for simple individual randomization.
- Covariate adjustment for precision when covariates are pre-treatment and the adjustment model is prespecified or clearly exploratory.
- Block, strata, fixed-effect, or paired analyses that respect the assignment scheme.
- Cluster-level or cluster-robust analysis when randomization or outcome dependence is clustered.
- Randomization inference or permutation tests when samples are small, assignment is constrained, or design-based inference is central.
- IV/CACE analysis when random assignment affects treatment receipt but receipt is not fully compliant.
- CUPED, ANCOVA, or other pre-treatment covariance adjustment when online or repeated-outcome experiments have reliable pre-period data.
- Multiple-testing control or hierarchical reporting when many outcomes, variants, or subgroups are examined.

Do not let model complexity replace assignment integrity. Machine learning can support precision, heterogeneity exploration, or outcome prediction, but the randomized design, estimand, analysis set, and diagnostics still control the claim.

Use `scripts/recommend.py` with `sample_input.json` when quick design/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- assignment integrity, sample-ratio mismatch, allocation probability, and logging consistency;
- balance and covariate adjustment choices, including pre-treatment status;
- attrition, missing outcomes, censoring, and analysis-set definitions;
- noncompliance, spillovers, contamination, and treatment receipt;
- cluster, block, repeated-measure, or paired design features;
- robust, cluster-robust, randomization-based, and model-based uncertainty where appropriate;
- multiple outcomes, subgroup multiplicity, peeking/sequential monitoring, and winner's curse risk;
- sensitivity to pre-registration, covariate adjustment, outlier handling, and follow-up windows.

Do not report per-protocol or as-treated estimates as randomized ITT unless the claim language explicitly changes.

## Output To Main Team

Return:

- assignment design, unit, probability, eligibility, arms, time zero, and outcome window;
- estimand options and preferred estimand with rationale;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible estimator/software lane and why it fits;
- assumptions, diagnostics, limitations, and robustness needs;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `07-randomized-assignment-and-experiments`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `type_specific.design_route`: `causal_comparison`, `design_route`, `identification_status`, `required_timing`, `comparison_group_logic`, `key_identification_assumptions`, `invalidating_conditions`, and `estimands_supported`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Randomized Experiment Design" or "Experiment Analysis";
- assignment mechanism, unit, arms, allocation probabilities, eligibility, and follow-up;
- estimand and why it matches the user's claim;
- analysis set, compliance handling, missingness/attrition, and clustering;
- method, software, uncertainty approach, and covariate adjustment plan;
- diagnostics and sensitivity checks;
- claim boundary: exploratory, descriptive, ITT-supported, CACE-supported, or not supportable;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed experiment workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for ITT, blocked/clustered designs, randomization inference, CUPED, and CACE.
- `scripts/recommend.py`: rule-based experiment design/package recommender for quick internal triage.
