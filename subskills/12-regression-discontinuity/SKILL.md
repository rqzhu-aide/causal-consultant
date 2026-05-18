---
name: regression-discontinuity
description: "Primary route subskill for sharp, fuzzy, kink, or local-randomization regression discontinuity designs where treatment, eligibility, dose, or policy assignment changes at a known cutoff of a running variable, including manipulation checks, bandwidth sensitivity, RD plots, local estimands, and package-fit feedback."
---

# Regression Discontinuity

## Role

Use this as a **primary route subskill** when assignment changes at a known threshold of a running variable. This subskill audits the local design and implementation fit.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "12-regression-discontinuity"`
- `role: "primary_route"`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: cutoff, running-variable threshold, eligibility rule, or fuzzy/kink RD feature
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: running variable, cutoff, treatment rule, outcome timing, covariates, sample near cutoff, clustering, and artifacts
- `outputs_created`: RD plan, RD plot, bandwidth table, density test, covariate continuity table, first-pass estimate, or report-ready artifact
- `diagnostics_reviewed`: manipulation/density, bandwidth sensitivity, covariate continuity, donut checks, functional form, local sample size, and fuzzy first stage
- `limitations`: local estimand, manipulation risk, sparse cutoff data, heaping, bandwidth sensitivity, or fuzzy compliance limits
- `feedback_for_main_skill`: whether local RD evidence is credible and how narrow the claim must be
- `requests_for_main_skill`: confirm cutoff rule, choose local estimand/audience language, activate IV for fuzzy RD, refresh Data Technician, or accept exploratory wording
- `readiness`: production readiness after this review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when cutoff assignment logic or running-variable timing invalidates the route
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `refresh_data_technician_02`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `activate_method_subskill`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to RD scripts, plots, density tests, bandwidth/sensitivity tables, or memos

## Route-Fit Check

Given the route handoff, check:

- running variable, cutoff, treatment rule, eligibility, score timing, and whether the design is sharp, fuzzy, kink, or local-randomization;
- local target population and local estimand;
- manipulation/sorting, heaping, bandwidth choice, covariate continuity, outcome timing, and clustering;
- whether the data have enough observations near the cutoff and a credible comparison window;
- whether fuzzy RD requires IV handoff (`13`).

If the cutoff is not assignment-relevant or manipulation dominates, return feedback to the main skill.

## Package And Code Fit

Candidate tools include R/Python `rdrobust` and R `rddensity`. Confirm support for fuzzy/kink designs, clustering, covariates, bandwidth sensitivity, and plots.

Before `production_gate.status` is ready, consider these analysis paths:

- sharp RD with local polynomial estimation and robust bias-corrected intervals;
- fuzzy RD as a local IV estimand with `13-instrumental-variables` support when treatment jumps but not deterministically;
- local-randomization checks when a small window around cutoff is treated as as-if randomized;
- kink RD only when the assignment derivative change is truly the design feature;
- descriptive threshold analysis when manipulation or continuity is not credible.

Simple sample scripts to provide or adapt:

- top-level `scripts/R/rdrobust_template.R`
- top-level `scripts/python/rdrobust_template.py`
- a project-specific RD plot and covariate-continuity script saved under `artifacts/`

Post-fit diagnostics must cover:

- running-variable density/manipulation around cutoff;
- RD plot with binned means and local fits;
- bandwidth sensitivity and polynomial/order sensitivity;
- covariate continuity and placebo outcomes/cutoffs when available;
- donut RD or heaping checks when sorting near cutoff is plausible;
- fuzzy first-stage strength and monotonicity concerns when treatment is imperfect;
- local sample size, clustering, and uncertainty method.

## Pass / Fail Output

If fit passes, produce RD plan, diagnostics, bandwidth/sensitivity strategy, code path, and reporting handoff. If fit fails, identify whether the issue is design, data density, manipulation, timing, or software support.

Main-skill feedback should include:

- whether the RD route is credible, fragile, or blocked;
- the local estimand and population near the cutoff that can be claimed;
- which manipulation, continuity, bandwidth, and placebo diagnostics were reviewed;
- the next user question, if any, such as confirming the assignment rule or accepting a local-only claim;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- cutoff, running variable, assignment rule, sharp/fuzzy/kink status, local estimand, and analysis bandwidth;
- RD plot, density/manipulation test, covariate-continuity checks, placebo cutoffs/outcomes, and bandwidth/polynomial sensitivity;
- local estimate, uncertainty method, first-stage diagnostics if fuzzy, and artifact paths;
- explanation of the local population near the cutoff and limits on generalization;
- wording that avoids implying effects away from the cutoff unless separately supported.

When the Report Writer uses the gate-ready or exploratory data-backed templates, contribute:

- **Summary / Claim Status:** supported local estimand and whether the RD evidence is credible enough for gate-ready local causal wording or only exploratory threshold analysis.
- **Question, Data, And Design:** running variable, cutoff, assignment rule, sharp/fuzzy/kink status, score timing, local population, and target window.
- **Data Readiness And Analysis Specification:** bandwidth choice, local polynomial order, covariates, clustering, fuzzy first-stage plan when relevant, and package path.
- **Results And Diagnostics:** RD plot, local estimate, uncertainty, density/manipulation test, covariate continuity, placebo checks, donut/heaping checks, and bandwidth sensitivity.
- **Interpretation And Next Step:** local-only generalization limits, manipulation or heaping concerns, fuzzy-IV handoff, bandwidth fragility, or need for cautious/exploratory wording.
- **Reproducibility Appendix:** RD scripts, cutoff and bandwidth settings, polynomial/covariate choices, package versions, seeds if used, and saved plot/table paths.

Recommend `return_to_foundation` when the cutoff is not assignment-relevant, the running variable is measured after treatment/outcome, manipulation dominates the cutoff, no observations exist near the cutoff, or the desired claim is not local and cannot be supported by RD.

Stay in production with a weaker claim when RD logic is plausible but diagnostics are imperfect: mild sorting, heaping, small local samples, bandwidth sensitivity, fuzzy first stage, or covariate imbalance. Then recommend sensitivity checks, narrower local language, fuzzy RD support, or exploratory presentation.

Recommend production-gate readiness only when the local estimand, RD plot, bandwidth choice/sensitivity, manipulation and covariate-continuity diagnostics, first-pass estimate or deferral rationale, limitations, and handoff artifacts are recorded.

## References

- `references/workflow.md`: detailed RD workflow.
- `references/literature_and_software.md`: literature and software notes.
