---
name: matching-weighting-balance
description: "Estimation and diagnostics support module for matching, propensity-score weighting, overlap weighting, entropy balancing, covariate balancing propensity scores, subclassification, balance diagnostics, overlap/support checks, effective sample size, and matched/weighted outcome-analysis handoff after a primary causal route exists."
---

# Matching, Weighting, And Balance

## Role

Use this as an **estimation and diagnostic support module**, usually after `06-point-treatment-observational` or another primary route has established the estimand, comparator, time zero, and pre-treatment adjustment set. Matching and weighting are design-stage tools; they do not by themselves identify a causal effect.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "07-matching-weighting-balance"`
- `role: "support_module"` or `diagnostic_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: matching, weighting, balance, overlap, or target-population need
- `selected_route_id`: the primary route this design support belongs to
- `inputs_reviewed`: treatment, comparator, covariates, timing, adjustment set, missingness, sampling/cluster weights, outcome-analysis needs, and artifacts
- `outputs_created`: matching/weighting plan, matched or weighted dataset path, balance table, Love plot, weight summary, outcome-analysis handoff, or diagnostic memo
- `diagnostics_reviewed`: standardized mean differences, variance ratios, distributional balance, propensity overlap, effective sample size, extreme weights, trimming, and covariate missingness
- `limitations`: support loss, changed target population, unstable weights, unmatched units, residual imbalance, or uncertainty limitations
- `feedback_for_main_skill`: what target population and claim strength remain supportable
- `requests_for_main_skill`: ask user about narrowing target population, activate outcome-analysis module, inspect covariate timing, refresh Data Technician, or accept weaker claim language
- `readiness`: production readiness after this design-support review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when overlap/timing problems invalidate the primary route itself
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `run_diagnostics`, `run_first_pass`, `refresh_data_technician_02`, `activate_method_subskill`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to matched/weighted data, balance plots, weight summaries, scripts, or tables

## Fit Check

Given the route handoff, check:

- estimand: ATE, ATT, ATC, ATO/overlap, matched-sample effect, or stabilized weighted effect;
- treatment and covariates are pre-outcome and, for total effects, pre-treatment;
- overlap/support, sparse strata, positivity risks, missingness, sample restrictions, and effective sample size;
- balance diagnostics: standardized mean differences, variance ratios, distributional checks, Love plots, and high-cardinality categories;
- whether matched/weighted outcome analysis can use correct clustering, sampling weights, repeated measures, or survival outcome modules.

If overlap is poor, covariates are post-treatment, or weights are unstable, return feedback to the main skill rather than hiding the problem in software.

## Package And Code Fit

Candidate R tools include `MatchIt`, `WeightIt`, `cobalt`, `CBPS`, `optweight`, and related design packages. Candidate Python paths include `pandas`/`sklearn`-based workflows and package-specific templates when validated. Confirm diagnostics and uncertainty support before using a package for final analysis.

Before `production_gate.status` is ready, consider these design and analysis paths:

- nearest-neighbor, caliper, exact, full, or coarsened-exact matching when the estimand and support allow matched comparison;
- stabilized IPTW, ATT weights, overlap weights, entropy balancing, or covariate-balancing weights when weighting is the design tool;
- weighted outcome regression with robust/clustered standard errors after design diagnostics pass;
- handoff to `08-doubly-robust-ml` when outcome modeling plus weighting/AIPW is needed;
- target-population revision from ATE to ATT/ATO when overlap makes the original target unrealistic.

Simple sample scripts to provide or adapt:

- `examples/python_ps_weighting_diagnostics.py`
- `examples/python_nearest_neighbor_matching.py`
- `examples/python_dowhy_weighting_template.py`
- `examples/r_matchit_nearest_cobalt.R`
- `examples/r_weightit_overlap_entropy.R`
- top-level `scripts/python/propensity_weighting_template.py`
- top-level `scripts/R/matchit_weightit_cobalt_template.R`

Post-fit diagnostics must cover:

- pre/post standardized mean differences, with thresholds stated and not treated mechanically;
- variance ratios and distributional/quantile balance for important continuous covariates;
- propensity-score overlap plots or summaries by group;
- effective sample size, unmatched/dropped units, extreme weights, and trimming decisions;
- balance within important subgroups or clusters when relevant;
- whether sampling weights, clusters, repeated measures, or survival outcomes require special outcome-analysis handling;
- sensitivity to matching distance, caliper, weight truncation, covariate set, and estimand target.

## Pass / Fail Output

If fit passes, produce a preprocessing/design plan, balance diagnostics plan, matched/weighted dataset guidance, outcome-analysis handoff, and limitations. If fit fails, report whether the fix belongs to data construction, covariate timing, route choice, estimand change, or user-directed caveat.

Main-skill feedback should include:

- whether the matched/weighted design improves support enough for the planned analysis;
- which target population is now supported, such as ATE, ATT, ATO, or matched-sample effect;
- which diagnostics passed, failed, or require user-visible caveats;
- the next user question, if any, such as whether to accept a narrowed target population after trimming or dropped units;
- this subskill's `subskill_analyses` chunk, relevant artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- matching/weighting method, target estimand/population, discarded units, and any estimand shift;
- balance table, Love plot, overlap plot, weight distribution, ESS, and matched-sample/weighted-sample artifact paths;
- outcome-analysis handoff and uncertainty method that accounts for matching or weights when relevant;
- limitations from residual imbalance, poor overlap, extreme weights, trimming, or target-population narrowing;
- recommended wording for whether the result supports causal, cautious causal, or associational interpretation.

Recommend `return_to_foundation` when the primary route requires covariates measured after treatment, key pre-treatment confounders are absent and no weaker supportable route is available, there is no common support for the intended comparison, treatment/comparator definitions are not constructible, or matching/weighting reveals that the target estimand cannot be represented by the data.

Stay in production with a weaker claim when support exists only for a narrower estimand, balance is improved but imperfect, weights are somewhat unstable, or sensitivity to trimming/specification is material. Then recommend target revision, diagnostics, or cautious/associational presentation rather than forcing the original causal claim.

Recommend production-gate readiness only when matched/weighted design choices, outcome-analysis handoff, balance/overlap diagnostics, weight or matched-sample artifacts, limitations, and any target-population change are recorded.

## References

- `references/workflow.md`: detailed workflow.
- `references/math_estimands.md`: estimands.
- `references/diagnostics_and_failure_modes.md`: diagnostic failures.
- `references/software_and_packages.md`: package notes.
- `references/bibliography.md`: literature notes.
- `examples/`: reusable R/Python templates.
