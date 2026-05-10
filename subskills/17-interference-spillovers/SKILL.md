---
name: interference-spillovers
description: "Primary structural route subskill for causal questions where one unit's treatment, exposure, assignment, behavior, or outcome can affect another unit's outcome, including spillovers, contamination, networks, peer effects, diffusion, spatial exposure, cluster interference, marketplace effects, and SUTVA violations."
---

# Interference And Spillovers

## Role

Use this as a **primary structural route subskill** when no-interference/SUTVA is implausible. It may combine with randomized, observational, DiD, network, survival, or policy-learning routes.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "17-interference-spillovers"`
- `role: "primary_route"` or `support_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: spillovers, contamination, network exposure, cluster interference, spatial exposure, or SUTVA concern
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: units, clusters/networks, exposure mapping, treatment saturation, outcome interference, timing, spatial/network data, and artifacts
- `outputs_created`: exposure mapping, estimand plan, script path, diagnostic table, sensitivity memo, or report-ready artifact
- `diagnostics_reviewed`: exposure mapping validity, network/spatial coverage, spillover range, contamination, cluster saturation, outcome interference, and sensitivity checks
- `limitations`: unobserved network, misspecified exposure mapping, equilibrium feedback, contamination, weak support, or package limitations
- `feedback_for_main_skill`: whether no-interference failure changes the estimand or only weakens the claim
- `requests_for_main_skill`: ask user to define exposure radius/network, choose direct versus spillover estimand, refresh Data Technician/DAG Builder, or accept weaker claim language
- `readiness`: production readiness after interference review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when interference invalidates the selected no-spillover route
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `refresh_dag_builder_04`, `refresh_data_technician_02`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to exposure maps, network summaries, scripts, diagnostics, plots, or memos

## Route-Fit Check

Given the route handoff, check:

- units, clusters, networks, spatial structure, exposure mapping, treatment saturation, and outcome interference;
- estimand: direct effect, spillover effect, total effect, exposure-response effect, cluster-level effect, policy effect, or equilibrium effect;
- whether exposure mapping is observed, constructible, or assumed;
- partial interference, network interference, contamination, equilibrium feedback, and measurement quality;
- whether diagnostics, sensitivity checks, or design revisions are possible.

If the exposure mapping or interference structure is not defensible, return feedback to the main skill.

## Package And Code Fit

Candidate tools include R `inferference`, `tmlenet`, custom exposure-mapping workflows, and route-specific estimators. Package support is uneven, so confirm estimand and data compatibility before implementation.

Before `production_gate.status` is ready, consider these analysis paths:

- cluster-level analysis under partial interference when clusters are credible isolated groups;
- exposure-mapping regression or weighting when spillover exposure is constructible;
- saturation or two-stage randomized designs when assignment design supports direct/spillover effects;
- network or spatial exposure summaries when full causal identification is not supportable;
- sensitivity analysis over alternative exposure mappings or radii.

Simple sample scripts to provide or adapt:

- a project-specific exposure-mapping script saved under `artifacts/`;
- a network/spatial summary and spillover-radius sensitivity script saved under `artifacts/`;
- route-specific R/Python models only after the estimand and exposure mapping are fixed.

Post-fit diagnostics must cover:

- completeness and timing of network/spatial/exposure data;
- distribution and support of exposure mappings or saturation levels;
- contamination of control units and spillover into comparison groups;
- cluster/network dependence and uncertainty method;
- sensitivity to exposure radius, network definition, cluster boundary, and lag structure;
- whether observed spillovers change the estimand from individual direct effect to total/policy/equilibrium effect.

## Pass / Fail Output

If fit passes, produce exposure mapping, estimand, analysis plan, diagnostics, sensitivity checks, and reporting handoff. If fit fails, identify whether the issue is network data, exposure definition, design, package support, or claim strength.

Main-skill feedback should include:

- whether interference is ignorable, diagnosable, or route-changing;
- which estimand is supportable, such as direct, spillover, total, exposure-response, cluster-level, or policy effect;
- which exposure-mapping diagnostics constrain interpretation;
- the next user question, if any, such as choosing exposure radius or accepting policy-level language;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- causal unit, interference boundary, network/spatial/cluster structure, exposure mapping, and direct/spillover/total/overall estimand;
- exposure-support, saturation, contamination, dependence, uncertainty, and sensitivity-to-radius/network/boundary diagnostics;
- plots or tables showing exposure mapping, spillover gradient, cluster/network balance, and effect estimates;
- limitations from unobserved ties, boundary leakage, equilibrium feedback, or approximate exposure mapping;
- wording that states the no-interference assumption is relaxed or violated and defines the estimand accordingly.

Recommend `return_to_foundation` when the original route depends on no interference but contamination/spillovers are central, the exposure mapping is unconstructible, the causal unit is wrong, network boundaries are missing, or equilibrium feedback changes the target question.

Stay in production with a weaker claim when interference is plausible but limited, exposure mapping is approximate, spillover diagnostics are incomplete, or a policy/cluster estimand can still be reported with caveats. Then recommend sensitivity checks and cautious language.

Recommend production-gate readiness only when exposure mapping, estimand, diagnostics/sensitivity checks, uncertainty approach, limitations, and handoff artifacts are recorded.

## References

- `references/workflow.md`: detailed interference workflow.
- `references/literature_and_software.md`: literature and software notes.
