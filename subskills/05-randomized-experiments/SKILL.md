---
name: randomized-experiments
description: "Primary route subskill for randomized or allegedly randomized treatment assignment, including A/B tests, individual or cluster trials, blocked/stratified experiments, noncompliance handoff, randomization inference, balance/SRM checks, R/Python implementation, diagnostics, and route-fit feedback to the main skill."
---

# Randomized Experiments

## Role

Use this as a **primary route subskill** when the planned causal route relies on randomized assignment. The main skill owns route activation and gate status; this subskill audits whether the randomized route can actually be implemented and interpreted as planned.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "05-randomized-experiments"`
- `role: "primary_route"`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: the randomized-assignment feature that made this route relevant
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: assignment log, unit/timing fields, treatment arms, outcome, blocking/cluster variables, eligibility, missingness, and relevant artifacts
- `outputs_created`: analysis plan, script path, first-pass table, diagnostic table, or report-ready artifact paths
- `diagnostics_reviewed`: SRM, balance, attrition/missingness, compliance/contamination, cluster checks, outcome timing, and uncertainty method checks
- `limitations`: unresolved design, data, compliance, interference, or precision limits
- `feedback_for_main_skill`: compact next-state implications and user-facing caveats
- `requests_for_main_skill`: focused asks such as confirm ITT versus CACE, inspect assignment log, refresh Data Technician, activate IV/noncompliance support, or ask about audience tolerance for caveats
- `readiness`: production readiness after this review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when randomization route support itself is invalid
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `refresh_data_technician_02`, `activate_method_subskill`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to scripts, diagnostics, plots, or tables

## Route-Fit Check

Given the main skill's route handoff, check:

- randomization unit, analysis unit, treatment arms, assignment probabilities, blocking/stratification, and clustering;
- treatment timing, outcome timing, eligibility, exclusions, missingness, attrition, and interference;
- whether the target is ITT, assignment effect, treatment-received effect, CACE/LATE, cluster-level effect, ratio metric, or dynamic regime;
- whether noncompliance, contamination, sample-ratio mismatch, or post-randomization exclusions break the intended route;
- whether diagnostics and uncertainty are possible with the available data.

If the route is not truly randomized or the target requires noncompliance/IV logic, return feedback to the main skill and recommend the right route or support module.

## Package And Code Fit

Candidate implementations include R `estimatr`, `randomizr`, `ri2`, `fixest`, `clubSandwich`, `DeclareDesign`, and Python `statsmodels`, `scipy`, and `linearmodels` when appropriate. Prefer simple design-transparent estimators when they answer the estimand.

Do not install packages silently. If code is requested, verify the user's preferred language, package availability, and whether cluster/robust/randomization inference requirements are supported.

Before `production_gate.status` is ready, consider these analysis paths:

- difference in means or OLS with treatment indicator for individual randomization;
- blocked or stratified OLS with block fixed effects;
- covariate-adjusted ANCOVA or CUPED when pre-treatment outcomes exist;
- cluster-robust or randomization-inference workflow for clustered assignment;
- ITT as the default when noncompliance exists, with `13-instrumental-variables` for CACE/LATE when needed;
- ratio-metric or delta-method/bootstrap workflow for A/B metrics when the outcome is a ratio.

Simple sample scripts to provide or adapt:

- `examples/python_statsmodels_ab_test.py`
- `examples/python_cluster_robust_rct.py`
- `examples/python_cuped_ratio_metrics.py`
- `examples/r_estimatr_individual_rct.R`
- `examples/r_fixest_clustered_ab.R`
- `examples/r_ab_srm_cuped.R`

Post-fit diagnostics must cover:

- sample-ratio mismatch or assignment-count check;
- pre-treatment covariate balance by arm, block, and cluster when relevant;
- missingness, attrition, and post-randomization exclusions by arm;
- compliance, crossover, contamination, or spillover evidence;
- cluster counts, cluster size imbalance, ICC concern, and effective degrees of freedom;
- outcome timing, pre-existing outcomes, rare outcome or rare treatment issues;
- uncertainty method fit: robust, cluster-robust, bootstrap, or randomization inference;
- sensitivity to covariate adjustment and exclusion rules.

## Pass / Fail Output

If fit passes, produce an analysis plan, code path, diagnostics, and reporting handoff. If fit fails, return:

- failed condition;
- whether the fix belongs to data, design, DAG/assumptions, package fit, or reporting;
- recommended next action for the main skill.

Store detailed code, diagnostics, and report material under `analyses/` or `artifacts/`; keep only compact status and limitations in `analysis.analyses` or `subskill_analyses`.

Main-skill feedback should include:

- one sentence on whether the randomized route is still valid;
- the estimand actually supported, such as ITT, assignment effect, cluster-level effect, or CACE/LATE handoff;
- the strongest safe claim language after diagnostics;
- the next user question, if any, such as preferred estimand, acceptable exclusions, or whether to present ITT despite noncompliance;
- this subskill's `subskill_analyses` chunk, plus recommendations for main-owned updates to `analysis.recommended_diagnostics`, `production_gate.diagnostics_status`, and `production_gate.reportable_evidence`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- confirmed estimand, assignment unit, analysis unit, arms, timing, and eligible population;
- assignment-count/SRM, balance, attrition/missingness, compliance, contamination, cluster, and uncertainty diagnostics;
- first-pass estimate table or figure path, uncertainty method, and whether ITT, assignment effect, cluster effect, or CACE/LATE language is supported;
- limitations that must travel with the result, especially noncompliance, attrition, interference, small clusters, or post-randomization exclusions;
- recommended claim language and any figure caption caveat.

When the Report Writer uses the gate-ready or exploratory data-backed templates, contribute:

- **Summary / Claim Status:** whether the report is about ITT, assignment effect, cluster effect, or CACE/LATE handoff, plus the strongest safe randomized-claim wording.
- **Question, Data, And Design:** randomization unit, analysis unit, arms, assignment probabilities, blocking/stratification, eligibility, and outcome timing.
- **Data Readiness And Analysis Specification:** estimator, covariate adjustment/CUPED, block or cluster handling, ratio-metric handling, and uncertainty method.
- **Results And Diagnostics:** effect table, confidence interval, SRM, balance, attrition, compliance, contamination, cluster diagnostics, and sensitivity to exclusions.
- **Interpretation And Next Step:** whether limitations require ITT-only framing, IV/noncompliance support, interference review, more diagnostics, or cautious/exploratory language.
- **Reproducibility Appendix:** assignment-log provenance, code path, package versions, seed/bootstrap/randomization-inference settings, and paths to tables or plots.

Recommend `return_to_foundation` when assignment was not random or not recoverable, treatment/outcome timing contradicts the causal route, the assignment unit and analysis unit make the selected estimand incoherent, post-randomization exclusions redefine the population in a route-changing way, or interference/contamination invalidates the no-spillover route rather than merely weakening it.

Stay in production with a weaker claim when randomization is real but diagnostics are imperfect: imbalance, attrition, noncompliance, contamination, small clusters, imprecision, or incomplete sensitivity checks. Then recommend `run_diagnostics`, `activate_method_subskill`, or `proceed_with_caveat`, and mark claim strength as cautious.

Recommend production-gate readiness only when the plan or first-pass result, required diagnostics, uncertainty method, limitations, and handoff artifacts are recorded, and no unresolved foundation recheck remains.

## References

- `references/workflow.md`: detailed experiment workflow.
- `references/math_estimands.md`: estimands.
- `references/diagnostics_and_failure_modes.md`: SRM, missingness, compliance, clustering, and failure modes.
- `references/software_and_packages.md`: package notes.
- `references/rct_ab_bibliography.md`: literature notes.
- `examples/`: reusable R/Python templates.
