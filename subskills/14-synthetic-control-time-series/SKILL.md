---
name: synthetic-control-time-series
description: "Primary route subskill for one or a few treated aggregate units, policy shocks at known times, synthetic control, augmented or generalized synthetic control, synthetic DiD, matrix-completion panel counterfactuals, interrupted time series, Bayesian structural time series, CausalImpact-style analyses, and donor-pool fit diagnostics."
---

# Synthetic Control And Time-Series Counterfactuals

## Role

Use this as a **primary route subskill** when the route relies on aggregate units or time-series counterfactual construction around an intervention time.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "14-synthetic-control-time-series"`
- `role: "primary_route"`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: one/few treated units, aggregate intervention, policy shock, donor-pool counterfactual, or interrupted time-series target
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: treated unit(s), intervention date, outcome series, donor pool, pre/post periods, covariates, aggregation, missingness, and artifacts
- `outputs_created`: donor plan, fit plot, placebo/permutation output, first-pass effect path, sensitivity memo, script path, or report-ready artifact
- `diagnostics_reviewed`: pre-fit RMSPE, donor weights, placebo/permutation checks, leave-one-out, donor contamination, concurrent shocks, seasonality, and sensitivity checks
- `limitations`: poor pre-fit, few donors, contaminated donors, short preperiod, concurrent shocks, uncertainty limits, or aggregation concerns
- `feedback_for_main_skill`: whether counterfactual fit is credible and what claim/presentation is safe
- `requests_for_main_skill`: confirm intervention date, donor exclusions, outcome scale, aggregation level, sensitivity priorities, or accept descriptive time-series language
- `readiness`: production readiness after this review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when intervention timing/donor structure invalidates the route
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `refresh_data_technician_02`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to scripts, fit plots, donor tables, placebo outputs, or memos

## Route-Fit Check

Given the route handoff, check:

- treated unit(s), intervention timing, outcome frequency, pre/post periods, donor pool, covariates, and aggregation level;
- target effect over time and post-period estimand;
- pre-treatment fit, donor contamination, spillovers, concurrent shocks, seasonality, missingness, and limited donor support;
- whether DiD, event study, interrupted time series, Bayesian structural time series, or descriptive monitoring is more appropriate;
- whether uncertainty and placebo/permutation diagnostics are possible.

If donor fit or comparison construction is not credible, return feedback to the main skill.

## Package And Code Fit

Candidate tools include R `Synth`, `tidysynth`, `gsynth`, `CausalImpact`, `bsts`, and matrix-completion/synthetic DiD workflows. Confirm the tool supports the number of treated units, panel shape, covariates, diagnostics, and uncertainty needed.

Before `production_gate.status` is ready, consider these analysis paths:

- classic synthetic control for one/few treated aggregate units with a defensible donor pool;
- augmented/generalized synthetic control or matrix completion when multiple units or covariates support it;
- synthetic DiD when panel structure and comparison units are adequate;
- Bayesian structural time series/CausalImpact when the route is time-series counterfactual with covariate controls;
- interrupted time series or descriptive monitoring when donor-based counterfactuals are not credible.

Simple sample scripts to provide or adapt:

- top-level `scripts/R/causalimpact_template.R`
- a project-specific synthetic-control fit and placebo script saved under `artifacts/`
- a donor-screening and pre/post plotting script saved under `artifacts/`

Post-fit diagnostics must cover:

- pre-treatment fit/RMSPE and visual fit;
- donor weights, covariate balance, and donor plausibility;
- placebo-in-space and placebo-in-time checks when possible;
- leave-one-out donor sensitivity and donor-pool restrictions;
- sensitivity to preperiod, covariates, outcome transformations, and intervention date;
- concurrent shocks, spillovers, contamination, seasonality, missingness, and post-period extrapolation.

## Pass / Fail Output

If fit passes, produce synthetic/time-series plan, donor diagnostics, placebo/sensitivity strategy, code path, and reporting handoff. If fit fails, report the failed condition and fallback options.

Main-skill feedback should include:

- whether the counterfactual fit is credible, fragile, or blocked;
- which effect summary is supported, such as time-path effect, average post-period gap, or exploratory pattern;
- which diagnostics constrain interpretation;
- the next user question, if any, such as excluding contaminated donors or accepting a descriptive monitoring result;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- treated unit, intervention date, outcome series, donor pool, pre-period/post-period, and estimator;
- synthetic weights, pre-fit/RMSPE, balance, placebo tests, leave-one-out, donor restrictions, and sensitivity diagnostics;
- effect trajectory plot, cumulative/average effect table, uncertainty or placebo-based reference, and artifact paths;
- concurrent shocks, spillovers, seasonality, aggregation, and donor-quality limitations;
- wording that frames the counterfactual comparison and avoids individual-level claims from aggregate data.

Recommend `return_to_foundation` when no plausible donor/comparison construction exists, intervention timing is wrong or endogenous to outcome shocks, treated/donor aggregation is incoherent, spillovers contaminate all donors, or the requested individual-level claim cannot follow from aggregate time-series data.

Stay in production with a weaker claim when pre-fit is imperfect, donors are few, placebo evidence is mixed, concurrent shocks remain plausible, or uncertainty is limited. Then recommend sensitivity checks, descriptive framing, or cautious counterfactual language.

Recommend production-gate readiness only when the intervention timing, donor pool, fit diagnostics, placebo/sensitivity checks, effect summary, limitations, and handoff artifacts are recorded.

## References

- `references/workflow.md`: detailed workflow.
- `references/literature_and_software.md`: literature and software notes.
