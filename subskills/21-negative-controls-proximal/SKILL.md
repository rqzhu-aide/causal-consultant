---
name: negative-controls-proximal
description: "Primary or specialized identification route subskill for negative-control exposures/outcomes, proximal causal inference, proxy variables for unmeasured confounding, bridge functions, falsification checks, bias-detection workflows, custom estimating equations, and route-fit feedback when standard measured-confounding assumptions are not enough."
---

# Negative Controls And Proximal Causal Inference

## Role

Use this as a **primary or specialized identification route subskill** when the route relies on negative controls, proxy variables, or proximal causal inference to address unmeasured confounding. It should be tightly coordinated with `04-dag-builder`, because the identifying logic is mainly structural.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "21-negative-controls-proximal"`
- `role: "primary_route"` or `diagnostic_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: negative-control exposure/outcome, proxy variables, proximal identification, bridge functions, falsification, or unmeasured-confounding concern
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: treatment, outcome, negative controls/proxies, timing, DAG logic, data support, bridge assumptions, and artifacts
- `outputs_created`: proximal/negative-control plan, falsification table, bridge-estimation script, sensitivity memo, or report-ready artifact
- `diagnostics_reviewed`: control/proxy validity, timing, relevance, no-direct-effect checks, bridge fit, falsification results, and sensitivity checks
- `limitations`: weak proxies, invalid controls, bridge nonidentifiability, package limitations, or sensitivity-only status
- `feedback_for_main_skill`: whether controls/proxies support identification, falsification, or only cautionary evidence
- `requests_for_main_skill`: ask user to justify controls/proxies, refresh DAG Builder, collect proxy variables, choose sensitivity framing, or accept weaker claim language
- `readiness`: production readiness after negative-control/proximal review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when proxy/control logic invalidates the selected causal route
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `refresh_dag_builder_04`, `refresh_data_technician_02`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to control/proxy tables, bridge scripts, falsification outputs, sensitivity plots, or memos

## Route-Fit Check

Given the route handoff, check:

- treatment/action, outcome, target population, unit, time zero, and target effect;
- proposed negative-control exposure, negative-control outcome, treatment-inducing proxy, outcome-inducing proxy, or other proxy variables;
- timing and exclusion logic: controls/proxies must not be affected in ways that violate the intended bridge or falsification argument;
- whether completeness, relevance, proxy-quality, bridge-function, and no-direct-effect assumptions are plausible enough for the intended claim;
- whether the data can support bridge estimation, falsification checks, sensitivity analysis, or only qualitative bias assessment.

If controls/proxies are not credible, return feedback to the main skill and recommend data collection, a weaker estimand, sensitivity analysis, or user-directed caveats.

## Package And Code Fit

Package support is less standardized than for DiD, RD, IV, or matching. Expect some workflows to require custom regression, GMM, flexible nuisance estimation, simulation, or sensitivity/falsification code. Verify any specialized package before using it for a causal claim.

Before `production_gate.status` is ready, consider these analysis paths:

- negative-control outcome or exposure falsification tests for bias detection;
- proximal causal inference with treatment-inducing and outcome-inducing proxies when bridge assumptions are plausible;
- custom regression/GMM or flexible nuisance bridge estimation when the data support it;
- sensitivity analysis when controls/proxies are suggestive but not identification-grade;
- descriptive bias assessment when the route cannot support primary causal estimation.

Simple sample scripts to provide or adapt:

- a project-specific negative-control falsification script saved under `artifacts/`;
- a project-specific proxy/bridge diagnostic script saved under `artifacts/`;
- top-level `scripts/python/statsmodels_treatment_effect_template.py` only as a transparent baseline, not a proximal estimator.

Post-fit diagnostics must cover:

- timing and no-direct-effect plausibility for each negative control or proxy;
- association of controls/proxies with treatment and outcome in the expected directions;
- falsification test estimates and uncertainty;
- bridge-function fit, stability, and sensitivity to basis/learner choices when proximal estimation is attempted;
- sensitivity to control/proxy definitions and excluded variables;
- whether findings undermine the primary route or merely lower confidence.

## Pass / Fail Output

If fit passes, produce a proximal/negative-control estimand, assumption ledger, bridge/falsification plan, candidate code path, diagnostics, and reporting handoff. If fit fails, identify whether the problem is proxy definition, timing, bridge assumptions, data support, package support, or claim strength.

## Handoff Back To Main Skill

Return structured feedback to the main skill when:

- controls or proxies look post-treatment, invalid, or too weak;
- bridge-function assumptions are not defensible;
- package/code support is too custom for the requested deliverable;
- results should remain sensitivity/falsification evidence rather than a primary causal effect.

Main-skill feedback should include:

- whether negative controls/proxies support identification, bias detection, or only cautionary interpretation;
- which controls/proxies are credible and which failed timing or exclusion checks;
- which falsification or bridge diagnostics constrain claim strength;
- the next user question, if any, such as whether the user can justify proxy logic or accept sensitivity-only evidence;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- negative-control exposure/outcome or proxy definitions, timing, DAG rationale, and whether the task is falsification, sensitivity, or proximal estimation;
- falsification estimates, bridge/proxy model results, stability checks, and artifact paths;
- assumptions about no direct effect, proxy relevance, bridge existence, unmeasured-confounding structure, and control validity;
- sensitivity to alternative control/proxy definitions and whether findings support, weaken, or undermine the main route;
- wording that clearly separates primary causal evidence from falsification, sensitivity, or proximal-support evidence.

When the Report Writer uses the gate-ready or exploratory data-backed templates, contribute:

- **Summary / Claim Status:** whether negative controls/proxies support identification, provide falsification/sensitivity evidence, weaken the main route, or remain exploratory.
- **Question, Data, And Design:** target effect, negative-control exposure/outcome or proxy definitions, timing, DAG rationale, bridge or falsification role, and target population.
- **Data Readiness And Analysis Specification:** control/proxy constructability, bridge or falsification model, relevance and no-direct-effect checks, sensitivity plan, and package/custom-code path.
- **Results And Diagnostics:** falsification estimates, bridge/proxy model results, uncertainty, stability, proxy relevance, timing/exclusion diagnostics, and sensitivity to control/proxy definitions.
- **Interpretation And Next Step:** whether findings strengthen, weaken, or undermine the main route; whether bridge assumptions need user defense; or whether only cautionary language is justified.
- **Reproducibility Appendix:** control/proxy tables, bridge scripts, model formulas, basis/learner settings, sensitivity parameters, package versions, seeds if used, and artifact paths.

Recommend `return_to_foundation` when proposed controls/proxies are invalid, timing contradicts the DAG, unmeasured-confounding structure differs from the selected route, bridge assumptions cannot be stated, or falsification results undermine the main identification story.

Stay in production with a weaker claim when controls/proxies are imperfect but informative, falsification is mixed, bridge estimation is unstable, or evidence is best treated as sensitivity analysis. Then recommend cautious causal, associational, or exploratory language.

Recommend production-gate readiness only when the control/proxy logic, diagnostics, falsification or bridge results, sensitivity/deferral rationale, limitations, and handoff artifacts are recorded.
