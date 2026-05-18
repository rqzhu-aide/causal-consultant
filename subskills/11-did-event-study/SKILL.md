---
name: did-event-study
description: "Primary route subskill for difference-in-differences, event studies, panel or repeated cross-section policy evaluation, staggered adoption, group-time ATT, dynamic effects, pretrend diagnostics, anticipation, parallel-trends sensitivity, and route-fit feedback to the main skill."
---

# Difference-In-Differences And Event Studies

## Role

Use this as a **primary route subskill** when the route relies on treated and comparison units observed before and after adoption or policy change. The main skill owns route activation; this subskill audits DiD-specific fit.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "11-did-event-study"`
- `role: "primary_route"`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: policy adoption, panel/repeated cross-section, pre/post contrast, staggered treatment, or event-study need
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: unit/time IDs, treatment timing, comparison group, pre/post periods, outcome, covariates, clusters, adoption reversals, and artifacts
- `outputs_created`: DiD/event-study plan, estimator script, pretrend plot, first-pass table, placebo/sensitivity output, or report-ready artifact
- `diagnostics_reviewed`: pretrends, anticipation, comparison support, treatment timing, composition, spillovers, clustering, and sensitivity checks
- `limitations`: weak preperiods, contaminated controls, staggered-adoption limitations, anticipation, spillovers, imprecision, or parallel-trends concerns
- `feedback_for_main_skill`: whether DiD remains supportable and what user-facing caveat or choice is needed
- `requests_for_main_skill`: ask about intervention date, anticipation window, preferred aggregation, comparison group, or accepting descriptive/associational wording
- `readiness`: production readiness after this review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when panel timing or comparison structure invalidates the selected route
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `refresh_data_technician_02`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `activate_method_subskill`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to scripts, event-study plots, diagnostics, tables, or memos

## Route-Fit Check

Given the route handoff, check:

- unit, time period, treatment adoption timing, comparison group, absorbing/nonabsorbing treatment, and outcome timing;
- target estimand: group-time ATT, dynamic/event-time effect, calendar-time aggregate, simple ATT, or policy effect;
- pre-treatment periods, anticipation, staggered adoption, treatment reversals, spillovers, compositional changes, and clustering;
- whether parallel trends is plausible, diagnosable, or only assumption-dependent;
- whether synthetic control/time-series, RD, IV, or descriptive fallback is more appropriate.

If pre-periods, comparison units, or treatment timing are inadequate, return feedback to the main skill before code.

## Package And Code Fit

Candidate R tools include `did`, `fixest`, `DRDID`, `did2s`, and sensitivity packages. Python support is less standardized for modern staggered DiD; verify package capability before production use.

Before `production_gate.status` is ready, consider these analysis paths:

- group-time ATT with `did` for staggered adoption when assumptions and data support it;
- event-study or two-way fixed effects with caution and modern alternatives when treatment effects may be heterogeneous;
- doubly robust DiD with `DRDID` when covariates and repeated cross-sections/panels fit;
- synthetic control or synthetic DiD handoff to `14` when one/few treated units dominate;
- interrupted time-series or descriptive monitoring when comparison units are inadequate.

Simple sample scripts to provide or adapt:

- top-level `scripts/R/did_callaway_santanna_template.R`
- R `fixest` event-study snippets when appropriate and clearly labeled
- a project-specific pretrend and event-time plotting script saved under `artifacts/`

Post-fit diagnostics must cover:

- pre-treatment outcome trends and event-study leads;
- anticipation windows and treatment timing validity;
- comparison-group composition and treated/control support over time;
- treatment reversals, staggered-adoption heterogeneity, and contaminated controls;
- clustering level, number of clusters, serial correlation, and uncertainty method;
- placebo dates, placebo outcomes/groups, sensitivity to preperiod length, cohort aggregation, and covariate adjustment.

## Pass / Fail Output

If fit passes, produce event-study/DiD plan, estimator choice, diagnostic and sensitivity plan, code path, and reporting cautions. If fit fails, report the failed route condition and recommended next action.

Main-skill feedback should include:

- whether the DiD/event-study route is supportable, fragile, or blocked;
- which estimand is supported, such as group-time ATT, dynamic effect, or aggregate policy effect;
- which pretrend/placebo/sensitivity diagnostics constrain interpretation;
- the next user question, if any, such as anticipation window, comparison group choice, or whether a descriptive trend summary is acceptable;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- treatment timing, treated/control cohorts, panel unit/time definitions, estimator, comparison group, and aggregation target;
- event-study plot, ATT table, pretrend/lead tests, anticipation checks, placebo tests, and support diagnostics;
- clustering/serial-correlation uncertainty method and any staggered-adoption or treatment-heterogeneity caveat;
- sensitivity to donor/comparison restrictions, event window, cohort aggregation, and calendar shocks;
- wording that ties the claim to parallel-trends and no-anticipation assumptions.

When the Report Writer uses the gate-ready or exploratory data-backed templates, contribute:

- **Summary / Claim Status:** supported DiD/event-study estimand and whether the evidence is gate-ready, diagnostic, descriptive, or exploratory.
- **Question, Data, And Design:** units, time periods, adoption timing, treated/control cohorts, comparison group, pre/post windows, and aggregation target.
- **Data Readiness And Analysis Specification:** panel or repeated-cross-section shape, estimator, cohort/event-time construction, clustering level, covariates, anticipation window, and package path.
- **Results And Diagnostics:** ATT or event-study table, event-time plot, pretrend/lead checks, placebo tests, support diagnostics, serial-correlation handling, and sensitivity outputs.
- **Interpretation And Next Step:** parallel-trends and no-anticipation limits, comparison contamination, cohort heterogeneity, calendar shocks, or whether a descriptive trend report is safer.
- **Reproducibility Appendix:** estimator code, cohort definitions, event windows, clustering settings, package versions, seeds if used, and saved plot/table paths.

Recommend `return_to_foundation` when there are no credible pre-treatment periods, no usable comparison group, treatment timing is not observable, intervention timing follows outcome changes, spillovers dominate the comparison, or the route is really synthetic control/RD/IV rather than DiD.

Stay in production with a weaker claim when pretrends are suggestive but imperfect, comparison support is limited, treatment heterogeneity complicates aggregation, placebo checks are mixed, or uncertainty is large. Then recommend sensitivity checks, narrower estimand, caveated policy framing, or descriptive language.

Recommend production-gate readiness only when estimator choice, first-pass result or deferred execution rationale, pretrend/anticipation/placebo diagnostics, uncertainty approach, limitations, and handoff artifacts are recorded.

## References

- `references/workflow.md`: detailed DiD workflow.
- `references/did_design_notes.md`: compact design notes.
- `references/literature_and_software.md`: literature and software map.
