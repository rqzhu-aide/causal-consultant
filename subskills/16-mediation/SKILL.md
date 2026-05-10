---
name: causal-mediation
description: "Primary structural route or target module for direct effects, indirect effects, mechanisms, mediators, path-specific effects, controlled direct effects, natural or interventional direct/indirect effects, multiple or high-dimensional mediators, and mechanism questions across randomized, observational, quasi-experimental, genomic, biomedical, economic, and social-science settings."
---

# Causal Mediation

## Role

Use this as a **structural route or target module** when the user asks about mechanisms, pathways, direct effects, indirect effects, or mediators. Mediation needs especially careful timing and assumptions from `04-dag-builder`.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "16-mediation"`
- `role: "primary_route"` or `target_or_outcome_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: direct/indirect effect, mechanism, mediator, path-specific effect, or interventional mediation target
- `selected_route_id`: the base or mediation route this module supports
- `inputs_reviewed`: treatment, mediator(s), outcome, timing, confounders, exposure-mediator interaction, primary route, DAG notes, and artifacts
- `outputs_created`: mediation estimand plan, model/code path, sensitivity memo, first-pass decomposition, or report-ready artifact
- `diagnostics_reviewed`: mediator timing, mediator-outcome confounding, treatment-induced confounding, interaction, model fit, and sensitivity checks
- `limitations`: sequential ignorability, mediator measurement, multiple mediator complexity, unmeasured confounding, or interpretation limits
- `feedback_for_main_skill`: whether mechanism language is supportable or only exploratory
- `requests_for_main_skill`: ask user to choose direct/indirect estimand, clarify mediator timing, refresh DAG Builder, activate longitudinal support, or accept mechanism-as-description language
- `readiness`: production readiness after mediation review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when mediator timing or structure invalidates the selected causal route
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `refresh_dag_builder_04`, `refresh_data_technician_02`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to mediation scripts, DAG/timing diagrams, sensitivity outputs, or tables

## Fit Check

Given the route handoff, check:

- treatment, mediator(s), outcome, timing, unit, population, and target effect;
- controlled direct, natural direct/indirect, interventional direct/indirect, path-specific, or mechanistic estimand;
- mediator-outcome confounding, treatment-induced mediator-outcome confounding, multiple mediators, exposure-mediator interaction, and measurement timing;
- whether the primary treatment route is randomized, observational, IV, longitudinal, genomic, or user-directed;
- whether sensitivity analysis or a weaker mechanism description is more appropriate.

If mediator timing or assumptions fail, return feedback to the main skill rather than forcing a mediation model.

## Package And Code Fit

Candidate tools include R `mediation`, `medflex`, `CMAverse`, `regmedint`, and custom g-computation or interventional effect workflows. Confirm support for the chosen mediation estimand and exposure/outcome types.

Before `production_gate.status` is ready, consider these analysis paths:

- controlled direct effect when mediator intervention levels are meaningful;
- natural direct/indirect effects only when assumptions are defensible and no treatment-induced mediator-outcome confounding breaks them;
- interventional direct/indirect effects when natural-effect assumptions are too strong but a mediation summary is still useful;
- g-computation or longitudinal g-method support when mediator and confounders evolve over time;
- descriptive mechanism analysis when causal mediation assumptions are not supportable.

Simple sample scripts to provide or adapt:

- top-level `scripts/R/mediation_template.R`
- a project-specific mediator timing/DAG table saved under `artifacts/`
- a sensitivity-analysis script or memo saved under `artifacts/`

Post-fit diagnostics must cover:

- treatment before mediator before outcome timing;
- mediator-outcome confounder timing and whether any are affected by treatment;
- exposure-mediator interaction and model specification;
- mediator and outcome model fit;
- sensitivity to unmeasured mediator-outcome confounding;
- robustness across mediator definitions, multiple mediators, and scale choices;
- whether the decomposition sums or compares sensibly on the chosen scale.

## Pass / Fail Output

If fit passes, produce mediation estimand, assumption ledger, model/code path, sensitivity checks, and reporting handoff. If fit fails, report whether the issue is timing, unmeasured mediator-outcome confounding, estimand mismatch, package support, or interpretation.

Main-skill feedback should include:

- whether mediation is supportable, fragile, or only descriptive;
- which direct/indirect/path-specific estimand is actually being targeted;
- which timing and sensitivity diagnostics constrain interpretation;
- the next user question, if any, such as whether the user wants controlled, natural, or interventional effect language;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- treatment, mediator, outcome, timing order, total/direct/indirect estimand, and mediator scale;
- model/code path, exposure-mediator interaction handling, mediator-outcome confounder logic, and sensitivity method;
- estimates for total, direct, indirect, and proportion mediated only when appropriate, with uncertainty and artifact paths;
- sensitivity to unmeasured mediator-outcome confounding, mediator measurement error, multiple mediators, and treatment-induced confounding;
- wording that treats mechanism evidence as assumption-dependent or exploratory unless unusually well supported.

Recommend `return_to_foundation` when the mediator is not temporally between treatment and outcome, mediator-outcome confounding is treatment-induced and not handled by the selected route, the requested mechanism claim changes the original causal question, or the DAG contradicts the mediation pathway.

Stay in production with a weaker claim when timing is plausible but assumptions are strong, sensitivity is unfavorable, mediator measurement is noisy, multiple mediator ordering is uncertain, or mechanism evidence is exploratory. Then recommend sensitivity checks or descriptive mechanism wording.

Recommend production-gate readiness only when the mediation estimand, timing/DAG support, model/code path or deferral rationale, sensitivity diagnostics, limitations, and handoff artifacts are recorded.

## References

- `references/workflow.md`: detailed mediation workflow.
- `references/literature_and_software.md`: literature and software notes.
