# Method/Task Subskill Contract

Use this reference when creating or migrating method/job subskills into `causal-consultant`.

Method/task subskills are bounded specialist modules. They do not replace the five-member team, speak to the user, own gates, or maintain permanent YAML sections. They are activated when the lead consultant and reviewers need focused support for a design route, causal target, implementation choice, diagnostic, or report module.

Gate authority is never delegated to a method/task subskill. A subskill may report blockers, readiness, claim-language limits, and whether `method_lead_recheck.required` is true, but it must not claim that `causal_gate` or `production_gate` is open, ready, or complete. Gate decisions remain lead-consultant updates after reviewer evidence and any required method-lead recheck.

## Module Types

Use these categories to keep method subskills from becoming oversized.

### `design_route`

Answers: what causal comparison is valid, if any?

Use for randomized experiments, single-time observational exposure, longitudinal g-methods, DiD/event studies, RD, IV, synthetic control/time series, interference/spillovers, negative controls/proximal designs, and other identification structures.

Design routes may suggest estimands and estimators, but their main job is identification logic, fit, assumptions, blockers, and diagnostics.

### `target_goal`

Answers: what causal target or decision goal does the user want?

Use for heterogeneous effects, subgroup/strata/GATE/CATE analysis, point treatment rules, mediation/mechanism targets, dose-response effects, transportability/generalizability, dynamic treatment policies, and other causal target or decision-specific goals.

Keep heterogeneous effects, point treatment rules, and dynamic treatment policies distinct:

- heterogeneous effects ask whether effects differ across observed groups, strata, covariates, units, sites, or time;
- point treatment rules ask how to choose a one-time action from baseline or current information;
- dynamic treatment policies ask how actions should adapt over sequential histories and changing covariates.

These targets can share estimators, but they have different user goals, diagnostics, and report wording.

Target-goal modules still require a design route before strong causal claims. They clarify targets, decision constraints, reporting language, and what data/method support is needed.

### `implementation_support`

Answers: how should an already-specified design and target be estimated, diagnosed, or implemented?

Use for matching, weighting, balance, doubly robust estimation, TMLE/AIPW, Double Machine Learning, survival/competing-risk analysis, flexible learners, nuisance models, resampling, and package-specific workflows.

Implementation support never supplies identification by itself. It can improve estimation, diagnostics, precision, robustness, or reproducibility only inside a valid design/target setup.

### `diagnostic_sidecar`

Answers: what extra diagnostic or sensitivity check should be run?

Use when the module is not a main design route or estimator, but supplies falsification, placebo, stability, sensitivity, assumption, or data-quality support.

## Activation Boundary

Activate a method/task subskill only for a bounded reason:

- a candidate route or target needs fit review;
- `method_lead` requests focused causal-method support;
- `data_analyst` has data evidence that suggests a route, target, estimator, or diagnostic;
- a user asks about a named method or target;
- a report module needs method-specific wording, diagnostics, or limitations.

Do not activate a method/task subskill just because its keywords appear. Candidate subskills are advisory until reviewed by `domain_expert`, `data_analyst`, and especially `method_lead`.

## Inputs To Read

A method/task subskill should read only the compact state needed for its bounded task:

- `project_summary`: goal, phase, deliverable, audience.
- `team_synthesis`: user turn, small turn goal, facts, missing information, tensions.
- `variable_roster`: lean index of decision-relevant variables, construct meanings, data bindings, data status, and method-role notes.
- `domain_expert`: construct meaning, mechanisms, domain data standards, effect scale, external validity, wording cautions.
- `data_analyst`: data status, unit, timing, variable map, missingness/selection, method-support handoffs, artifacts.
- `method_lead`: causal question, candidate/selected framework, estimand set, validity requirements, causal structure, diagnostics, sensitivity, wording boundary.
- `analysis_state`: recommended subskills, active sidecars, limitations, report draft path.
- existing `subskill_records` for related activated modules.

Use `variable_roster` and `method_lead.causal_structure` as the compact shared state. Consult reviewer sections for supporting detail needed for the bounded task, but do not re-synthesize the whole project from raw reviewer notes. Do not duplicate reviewer-owned fields. Return compact feedback that those reviewers can use.

## Standard Output

Use `assets/method_job_subskill_record_template.yaml` when a durable record is needed.

Every activated method/task subskill should return a common envelope plus one type-specific packet. The common envelope is stable so the lead consultant, reviewers, validator, and report writer know where to look:

- `subskill_id`, `module_type`, `role`, `status`, and `activation_reason`;
- `inputs_reviewed` and `provenance_summary`;
- `fit_summary`: direct, adapted, exploratory, blocked, or not applicable;
- assumptions, diagnostics, and sensitivity needs;
- limitations and blockers;
- `requests`: bounded requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another specialist;
- `report_support`, `readiness`, `recommended_next_action`, and `artifact_paths`;
- whether `method_lead_recheck.required` is true and why;
- `blocking_signal` only when the specialist output blocks the current phase or creates a severity-rated blocker.

Fill only the `type_specific` packet that matches `module_type` in durable records. The template shows all packet options for reference.

### `design_route` Packet

Use for modules that judge whether the causal comparison is identifiable or defensible:

- `causal_comparison`;
- `design_route`;
- `identification_status`;
- `required_timing`;
- `comparison_group_logic`;
- `key_identification_assumptions`;
- `invalidating_conditions`;
- `estimands_supported`.

### `target_goal` Packet

Use for modules that clarify what causal target, decision, or interpretation the user wants:

- `target_goal`;
- `estimand_targets`;
- `target_population`;
- `effect_scale`;
- `decision_or_interpretation_goal`;
- `design_route_needed`;
- `reporting_boundary`.

### `implementation_support` Packet

Use for modules that estimate, diagnose, or operationalize a chosen design and target:

- `implementation_role`;
- `estimator_or_model_family`;
- `required_data_shape`;
- `nuisance_or_prediction_components`;
- `diagnostic_outputs`;
- `reproducibility_outputs`;
- `package_or_code_options`.

## Adaptive Loop Rules

Method/task subskills participate in the main skill's bounded adaptive loop.

- `data_analyst` runs or prepares data checks, diagnostics, prototype datasets, code, tables, and plots.
- `method_lead` keeps independent causal-method judgment and rechecks specialist outputs only when they may change causal strategy, selected framework, estimand set, causal structure, gates, claim strength, or wording boundary.
- The specialist module supplies route/target/implementation-specific guidance.
- `report_writer` integrates durable outputs into the working report.
- The lead consultant returns to the user once the next useful interaction is clear.

Each specialist request must be concrete enough to fit one small internal follow-up by default. Avoid open-ended requests like "do all diagnostics" unless the user explicitly asked for deeper analysis and data work is already authorized.

When `method_lead_recheck.required` is true, the lead consultant routes the new `subskill_records` entry back to `method_lead` before gate updates or causal-claim changes. If the user needs bounded progress before that recheck, keep the relevant gate blockers and claim limits visible rather than treating the specialist output as gate clearance.

## Report Support Packet

When a module matters for the final deliverable, return a report-ready packet:

- section title suggestion;
- module purpose and relation to the user's question;
- design/target/implementation logic;
- inputs reviewed and provenance;
- key methods, diagnostics, and sensitivity checks;
- results or artifacts, if any;
- limitations and claim-language boundary;
- code/table/figure/report paths.

Report support should be integrated by `report_writer`, not pasted mechanically.

## Migration Template For SKILL.md

Use this compact structure for migrated method/task subskills:

1. Role
2. When To Activate
3. Inputs To Read
4. Fit / Failure Logic
5. Data Work It May Request
6. Method Or Support Guidance
7. Diagnostics And Sensitivity
8. Output To Main Team
9. Report Support
10. References

Move long package lists, math notes, bibliographies, examples, and extended diagnostics into `references/` or `examples/`.

## Numbering Convention

Use family bands for future method/task subskills:

- `07`-`19`: design routes.
- `20`-`29`: target goals.
- `30`-`39`: implementation support.

Bundled families:

- Design routes: `07-randomized-assignment-and-experiments`, `08-single-time-observational-exposure`, `09-longitudinal-gmethods`, `10-did-event-study`, `11-regression-discontinuity`, `12-instrumental-variables`, `13-synthetic-control-time-series`, `14-interference-spillovers`, `15-negative-controls-proximal`.
- Target goals: `20-heterogeneous-effects`, `21-point-treatment-rules`, `22-mediation`, `23-dose-response-effects`, `24-transportability-generalizability`, `25-dynamic-treatment-policies`.
- Implementation support: `30-matching-weighting-balance`, `31-doubly-robust-estimation`, `32-double-machine-learning`, `33-survival-competing-risks`.
