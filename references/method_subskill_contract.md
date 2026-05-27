# Method/Task Subskill Contract

Use this reference when creating or migrating method/job subskills into `causal-consultant`.

Method/task subskills are bounded specialist modules. They do not replace the core team, speak to the user, own gates, or maintain permanent YAML sections. They are activated when the lead consultant and reviewers need focused support for a design route, causal target, implementation choice, diagnostic, or report module.

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

Current method/task subskills use one of these three module types: `design_route`, `target_goal`, or `implementation_support`. A subskill may still return diagnostic evidence or use `role: diagnostic_module` when the method lead activated it for a focused diagnostic task, but that role does not create a separate sidecar module type. Standalone diagnostic modules should be added later only with an explicit template, validator, and workflow update.

## Activation Boundary

Activate a method/task subskill only for a bounded reason:

- a candidate route or target needs fit review;
- `method_lead` requests focused causal-method support;
- `data_analyst` has data evidence that suggests a route, target, estimator, or diagnostic;
- a user asks about a named method or target;
- a report module needs method-specific wording, diagnostics, or limitations.

Do not activate a method/task subskill just because its keywords appear. Candidate subskills are advisory until checked against current domain guidance, current data evidence, and especially `method_lead` triage. Refresh `domain_expert` only when domain meaning is missing, stale, disputed, or material to the candidate's fit.

## Inputs To Read

A method/task subskill should read only the compact state needed for its bounded task:

- `project_summary`: goal, phase, deliverable, audience.
- `team_synthesis`: user turn, small turn goal, facts, missing information, tensions.
- `variable_roster`: lean index of decision-relevant variables, construct meanings, data bindings, data status, and method-role notes.
- `domain_expert`: construct meaning, mechanisms, domain data standards, effect scale, external validity, wording cautions.
- `data_analyst`: data status, unit, timing, variable map, missingness/selection, `analysis_alignment`, method-support handoffs, artifacts.
- `method_lead`: causal question, candidate/selected framework, estimand set, validity requirements, causal structure, diagnostics, sensitivity, wording boundary.
- `analysis_state`: recommended subskills, active sidecars, limitations, report draft path.
- existing `subskill_records` for related activated modules.

Use `variable_roster` and `method_lead.causal_structure` as the compact shared state. Consult reviewer sections for supporting detail needed for the bounded task, but do not re-synthesize the whole project from raw reviewer notes. Do not duplicate reviewer-owned fields. Return compact feedback that those reviewers can use.

## Common Constructed-Input Claim Checks

Judge the analysis input used by the method, not a source-data transformation in isolation. Collapsing, grouping, imputing, windowing, lagging, aggregating, restricting, feature engineering, or dimension reduction can be valid when the constructed analysis input still supports the module's target. Use these common checks before judging claim strength:

1. **Compatibility Check**: Does the actual analysis input passed to the method still match the method's estimand, identification logic, assumptions, diagnostics, and intended claim?
2. **Timing And Variable-Role Check**: Did construction preserve required timing and roles, avoiding post-treatment leakage, mediator/collider adjustment, outcome-derived features, or collapsed histories that erase needed ordering?
3. **Estimand Drift Check**: Did grouping, dose binning, trimming, aggregation, baseline collapse, windowing, feature construction, or restriction change the estimand, effect scale, target population, or interpretation?
4. **Selection And Reuse Check**: Was the constructed feature, subgroup, threshold, donor pool, rule, model, or specification chosen using the same outcome/effect data being interpreted? If so, stronger claims need prespecification, sample splitting, cross-fitting, held-out validation, placebo checks, multiplicity control, or a method-specific validation route.
5. **Support And Scope Check**: Does the constructed input still have enough overlap, sample size, variation, and domain meaning for the claim, or should the result be limited to a restricted sample, model-implied pattern, descriptive finding, or exploratory analysis?

Use `data_analyst` as the owner of data facts. Read `data_analyst.analysis_dataset`, `data_analyst.method_support`, and `data_analyst.analysis_alignment` to understand what source data existed, what analysis input was constructed, what simplifications or derived constructs were used, and what claim limits were already recorded. Do not create a parallel data ledger inside the subskill.

When the constructed input changes what this module can support, record the consequence in existing durable-record fields: `statistical_evidence.claim_scope`, `statistical_evidence.method_specific_limits`, `requests.data_analyst`, `requests.method_lead`, and `method_lead_recheck`. If the constructed input supports a different valid estimand or design route, recommend reframing or rerouting rather than treating the data treatment itself as invalid.

## Standard Output

Use `assets/method_job_subskill_record_template.yaml` when a durable record is needed.

Every activated method/task subskill should return a common envelope plus one type-specific packet. The common envelope is stable so the lead consultant, reviewers, validator, and report writer know where to look:

- `subskill_id`, `module_type`, `role`, `status`, and `activation_reason`;
- `inputs_reviewed` and `provenance_summary`;
- `fit_summary`: direct, adapted, exploratory, blocked, or not applicable;
- assumptions, diagnostics, and sensitivity needs;
- `statistical_evidence`: whether the module output is exploratory, descriptive, internally validated, inference-supported, externally validated, blocked, or not applicable; the claim scope it supports; the method-specific inference or validation route; and limits on stronger claims;
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

## Statistical Evidence And Claim Scope

Every activated method/task subskill should distinguish usable in-sample results from valid statistical evidence for a stronger claim. In-sample estimates, fitted patterns, selected specifications, and exploratory diagnostics are allowed, but the subskill must state the claim scope they support.

Use the common `statistical_evidence` packet to say:

- whether the output is exploratory/descriptive only, internally validated, inference-supported, externally validated, blocked, or not applicable;
- whether the claim scope is in-sample, model-implied, internally validated, target-sample, target-population, or only exploratory;
- what method-specific route could justify stronger statistical claims, such as asymptotic or robust intervals, randomization/permutation inference, honest sample splitting, cross-fitting, held-out validation, bootstrap schemes, simultaneous intervals, placebo/falsification checks, sensitivity analysis, or package-specific guarantees;
- what the method does not guarantee, especially when a package can compute estimates but cannot validate a discovered pattern, selected subgroup, treatment rule, model choice, or narrative interpretation.

State the exact claim boundary the main team can use, such as "in-sample descriptive pattern only," "model-implied exploratory ranking," "target-sample estimate with valid uncertainty under stated assumptions," or "not reportable as a statistical claim until a named diagnostic or validation step is completed."

Do not treat one family-specific guarantee as portable to another family. For example, DML orthogonalization, generalized random forest inference, bootstrap intervals, synthetic-control placebo checks, or regression-discontinuity bandwidth procedures answer different statistical questions and need method-specific wording.

### Writing `statistical_evidence`

Write this packet before finalizing the subskill record:

1. Identify the strongest result the module is actually returning: plan, diagnostic, fitted estimate, selected pattern, validated pattern, or inference-supported estimate.
2. Set `status` to the strongest defensible evidence level, not the most ambitious user-facing claim.
3. Set `claim_scope` to the actual scope, such as in-sample, model-implied, internally validated, target sample, target population, or exploratory only.
4. Put only method-specific routes in `inference_or_validation_route`: what was used, or what would be needed, for a stronger claim in this method family.
5. Put the exact claim boundary in `method_specific_limits`, including what cannot be claimed from the current output.
6. Add bounded requests to `requests.data_analyst` when a data check, diagnostic, split, validation run, uncertainty calculation, or artifact would resolve the limit.
7. Add `method_lead_recheck.required: true` only when the claim boundary could change causal strategy, selected framework, estimand set, gate status, claim strength, or report wording.

## Adaptive Loop Rules

Method/task subskills participate in the main skill's bounded adaptive loop.

- `data_analyst` runs or prepares data checks, diagnostics, prototype datasets, code, tables, and plots.
- `method_lead` keeps independent causal-method judgment and rechecks specialist outputs only when they may change causal strategy, selected framework, estimand set, causal structure, gates, claim strength, or wording boundary.
- The specialist module supplies route/target/implementation-specific guidance.
- `report_writer` integrates durable outputs into the working report.
- The lead consultant returns to the user once the next useful interaction is clear.

Each specialist request must be concrete enough to fit one small internal follow-up by default. Avoid open-ended requests like "do all diagnostics" unless the user explicitly asked for deeper analysis and data work is already authorized.

When `method_lead_recheck.required` is true, the lead consultant routes the new `subskill_records` entry back to `method_lead` before gate updates or causal-claim changes. If the user needs bounded progress before that recheck, keep the relevant gate blockers and claim limits visible rather than treating the specialist output as gate clearance.

## Report Owner Review Pass

During `report_production`, the lead consultant may ask an activated method/task subskill to review only the drafted report section or appendix module that represents its own work. This is a consistency and polish check, not a new analysis activation by default.

For report review, return compact feedback rather than a new `subskill_records` entry unless the review produces new substantive method feedback, a new diagnostic/result, or a change that must be durable for future turns. Use a small feedback shape:

```yaml
report_review_feedback:
  reviewer: null
  status: "approved"  # approved|needs_revision|blocked|not_applicable
  checked_sections: []
  stale_or_missing_materials: []
  factual_or_method_corrections: []
  claim_language_corrections: []
  artifact_or_provenance_issues: []
  required_report_edits: []
```

Check whether the drafted section matches the activated record's method logic, diagnostics, statistical-evidence status, claim scope, limitations, artifact paths, and method-specific wording boundary. Do not broaden the review into unrelated method advice. If the draft needs data refresh, causal recheck, or report revision, state the bounded route in `stale_or_missing_materials`, `claim_language_corrections`, or `required_report_edits` as appropriate.

## Report Support Packet

When a module matters for the final deliverable, return a report-ready packet:

- section title suggestion;
- module purpose and relation to the user's question;
- design/target/implementation logic;
- inputs reviewed and provenance;
- key methods, diagnostics, and sensitivity checks;
- statistical-evidence status, claim scope, and method-specific inference or validation limits;
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
7. Statistical Evidence, Diagnostics, And Sensitivity
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
