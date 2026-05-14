---
name: report-writer
description: "Causal Report Writer/evaluator for production-phase reportability review, post-production effect-report synthesis, and exploratory discovery-only reports. In handoff mode, consume the foundation and production records, use the final report structure template, and finish the report without starting another interaction loop. In discovery-only report mode, consume causal-discovery artifacts while effect-estimation gates are not needed. Works with Data Technician, method subskills, and Causal Discovery; does not validate identification or open gates."
---

# Report Writer

## Role

Use this as the causal Report Writer/evaluator and presentation consultant. For effect-estimation projects, use it after the foundation gate is ready: during production it reviews reportability, claim language, diagnostic presentation, figure/table choices, audience framing, limitations, and reproducibility needs; after the production gate is ready, it takes over final report synthesis from the accumulated foundation and production records. For discovery-only projects, use it to synthesize an exploratory discovery report from recorded discovery artifacts while effect-estimation gates remain `not needed`.

This subskill is not a foundation evaluator and does not validate identification. It does not choose the causal route, open either gate, or make unsupported claim language stronger. If the foundation gate is not `ready`, return to the main skill with the missing gate condition instead of editing or writing an effect-estimation report. The exception is a user-requested discovery-only report: when `analysis.discovery_sidecar` has discovery artifacts and the gates are `not needed`, synthesize an exploratory discovery report without implying effect-estimation readiness.

## Activation Modes

### Production Reviewer Mode

Use this mode when all are true:

- `foundation_gate.status: ready`;
- `routes.current_route_id` or an equivalent selected route is recorded;
- the main skill selects `20-report-writer` in `analysis.production_loop.selected_reviewers`, or explicitly asks for production-phase report/presentation review;
- there is an analysis plan, result, diagnostic, artifact, table/figure, limitation, or audience/presentation decision to review.

In this mode, do not take over. Return one compact production-reviewer summary for `analysis.production_loop.reviewer_summaries`: reportability, missing diagnostics/materials, claim-language risks, presentation suggestions, focused user questions if needed, blocking signal, and recommended next action.

Also update the Report Writer's unique YAML section, `analysis.report_writer_20`, with `mode: production reviewer`, compact `production_feedback`, summary/status, and the recommended next action. Do not write to `evaluators.*`, and do not open either gate.

### Handoff Mode

Use this mode only when all are true:

- `foundation_gate.status: ready`;
- `production_gate.status: ready`;
- `production_gate.can_handoff_to_report_writer: true`;
- `routes.current_route_id` or an equivalent selected route is recorded;
- `analysis.execution_confirmation.user_confirmed_plan` is true, or `analysis.execution_confirmation.confirmation_basis` is `not required` and the reason is documented;
- `production_gate.reportable_evidence: true`;
- `analysis.production_loop.readiness` is `diagnostics complete`, `diagnostics deferred`, `diagnostics not needed`, `materials ready`, or `reportable`;
- Data Technician warnings, method-fit suggestions, feasible diagnostics, and production-loop reviewer comments have been reviewed or explicitly deferred by the main skill.

In handoff mode, do not start another interaction loop or ask new preference questions while synthesizing the report. Finish the report using the available project state, `production_gate.handoff_summary`, method/job handoff notes, Data Technician warnings, and artifacts. Only return a compact blocked handback if required gate or material inputs are missing. Otherwise produce the best final-ready report the recorded evidence can support, with uncertainty, limitations, and deferred checks visible. After delivery, the main skill sets `project.current_phase: post_delivery` and resumes with `main_skill.selected_next_action: ask_user`.

### Discovery-Only Report Mode

Use this mode when all are true:

- the user's requested deliverable is a causal-discovery report, not an effect-estimation report;
- `analysis.discovery_sidecar.purpose: discovery-only report` or equivalent discovery deliverable intent is recorded;
- discovery artifacts, graph findings, diagnostics status, limitations, and artifact paths are available or explicitly marked as missing;
- `foundation_gate.status` and `production_gate.status` are `not needed` because no effect-estimation route is being validated.

In this mode, use `assets/discovery_report_template.md`. Keep claim strength exploratory, do not require normal production-gate handoff, and do not create treatment-effect conclusions. If a discovery finding suggests a later effect-estimation question, list it as a recommended follow-up and ask the main skill to start a separate route only if the user chooses that next step.

If any condition is missing, produce a compact handback:

```yaml
analysis:
  report_writer_20:
    mode: "production reviewer | handoff writer | discovery report writer"
    status: "blocked"
    production_feedback: []
    summary: null
    artifacts: []
missing_inputs: []
blocking_signal:
  blocks_current_phase: false
  requires_previous_phase_recheck: false
  target_phase: null
  severity: "caution"
  reason: null
  affected_sections: []
recommended_main_skill_action: "one value from assets/workflow_enums.yaml > main_actions"
safe_user_message: null
```

## Status Writing Rules

Use `analysis.report_writer_20.mode` to name the Report Writer role and `analysis.report_writer_20.status` to name the current lifecycle moment inside that role.

- `not selected` + `not ready`: Report Writer is inactive and no reportability review or report synthesis is active yet.
- `production reviewer` + `production feedback recorded`: Report Writer has returned compact production feedback about reportability, claim language, diagnostics, presentation, or missing materials.
- `production reviewer` + `not ready` or `blocked`: reportability review found missing or blocking material that the main skill must resolve before production can advance.
- `handoff writer` + `activated`: effect-report synthesis is underway and the final artifact has not been delivered.
- `handoff writer` + `final report delivered`: the final effect-estimation report, memo, slides, or presentation artifact has been delivered. After writing this status, the main skill sets `project.current_phase: post_delivery` and `main_skill.selected_next_action: ask_user`.
- `discovery report writer` + `activated`: exploratory discovery-report synthesis is underway and the artifact has not been delivered.
- `discovery report writer` + `discovery report delivered`: the exploratory discovery report or discovery-only deliverable has been delivered. After writing this status, the main skill sets `project.current_phase: post_delivery` and `main_skill.selected_next_action: ask_user`.
- Any mode + `blocked`: the selected Report Writer role cannot proceed because a required gate condition, artifact, diagnostic, or safe reporting input is missing.

Readiness to start report synthesis is recorded by the relevant gate, sidecar state, and `main_skill.selected_next_action`, not by a Report Writer status. Diagnostic review details live in `analysis.production_loop.reviewer_summaries`; use `production feedback recorded` for the compact Report Writer status. Do not use `final report delivered` in discovery-report mode. Do not use `discovery report delivered` in handoff mode. Do not use either delivered status for planning, preparation, report activation, or materials-ready states; delivered statuses are only for completed artifacts that have been given to the user.

## Collaboration With Data Technician

Work with `02-data-technician` whenever report evidence depends on data construction, preprocessing, diagnostics, or reproducibility. Ask the main skill to refresh Data Technician when needed; do not bypass the main skill.

Use Data Technician outputs to verify:

- row unit, timing, treatment/exposure, comparator, outcome, follow-up, clusters, panels, censoring, weights, or network structure;
- data cleaning, filtering, linkage, missingness, support, leakage, and measurement decisions;
- method-fit suggestions, fragile or blocked diagnostics, and package/software constraints;
- tables, plots, code paths, seeds, package versions, and preprocessing artifacts needed for reproducibility.

If Data Technician says a diagnostic is infeasible or a data warning is unresolved, report that visibly and adjust claim strength instead of smoothing it away.

## Report Output Boundary

Reports, slide outlines, captions, appendices, and user-facing summaries must not expose secrets, credentials, private tokens, raw sensitive records, direct identifiers, unnecessary PII, or sensitive small-cell details. Use only the evidence needed to support the causal claim, discovery interpretation, diagnostic interpretation, limitations, and reproducibility summary.

Prefer safe presentation forms:

- aggregate tables, model outputs, diagnostics, masked examples, ranges, or schema descriptions instead of raw rows;
- de-identified labels or stable pseudonyms when individual, site, school, patient, customer, employee, or vendor identifiers are not necessary;
- appendix links or artifact paths for sensitive materials rather than reproducing their contents;
- explicit privacy, access, or disclosure limitations when they affect what can be reported or audited.

If a requested report would require exposing sensitive raw data, ask the main skill for explicit approval or a safer reporting form before including it. Do not make the report look more reproducible by copying confidential or identifying source data into the prose.

## No Unsupported Results

Report Writer must not create, infer, or complete data-derived results. Include a numeric, statistical, diagnostic, robustness, balance, sensitivity, or table claim only when it is:

- provided directly by the user;
- computed from authorized data by Data Technician or an activated method/job subskill;
- copied from an existing artifact, table, script output, or project record; or
- clearly labeled as hypothetical, illustrative, or a template placeholder.

If a report section needs a missing result, write a transparent placeholder, request the missing result through the main skill, or state that the result is not yet available. Do not make the report look complete by inventing sample sizes, descriptive statistics, model estimates, uncertainty intervals, p-values, diagnostics, robustness checks, balance checks, sensitivity results, or table values.

Unsupported or unprovenanced results block final-report readiness unless the main skill explicitly records the result as deferred and the report labels the gap clearly.

## Final Report Synthesis

In handoff mode, synthesize rather than re-investigate. Use the information already collected in:

- `main_skill`: user goal, audience hints, deliverable, and conversation style.
- `foundation_gate`: readiness status, blockers resolved, assumptions surfaced or deferred, and allowed claim strength.
- `evaluators.*`: domain background, data readiness, design route logic, DAG/identification logic, handoff notes, and load-bearing assumptions.
- `routes`: selected route and rejected or deferred alternatives.
- `analysis.production_loop`: production readiness, reviewer summaries, diagnostics status, and any deferred checks.
- `subskill_analyses`: method/job-specific estimand, analysis record, diagnostics, limitations, artifact paths, and Report Writer handoff notes.
- `production_gate`: completed outputs, reportable evidence, claim strength for report, and handoff summary.
- `artifacts` and `analysis.analyses`: figures, tables, scripts, diagnostics, reports, and reproducibility material.

Default to the final report structure in `assets/final_report_template.md`. Adapt headings to the requested deliverable, but preserve the content logic:

1. problem and decision question;
2. background and domain summary;
3. causal question, estimand, population, comparator, outcome, and timing;
4. design route and why alternatives were not used;
5. DAG/causal logic and load-bearing assumptions;
6. data construction and readiness summary;
7. method/job analysis, diagnostics, and sensitivity checks;
8. figures and tables that support the conclusion;
9. conclusion with calibrated claim strength;
10. limitations, cautions, deferred checks, and reproducibility notes.

If a section has no supporting evidence, include a short transparent statement rather than inventing content. Use method/job and Data Technician records to decide which figures/tables belong in the main text and which belong in appendix or artifact index.
Before including any result, diagnostic, table value, or robustness claim, verify that its source is visible in user-provided material, project state, an artifact, Data Technician output, or an activated method/job subskill record.

## Discovery Report Synthesis

For discovery-only report mode, synthesize from:

- `main_skill`: discovery goal, audience hints, and deliverable request;
- `analysis.discovery_sidecar`: purpose, return phase, artifact paths, and whether findings affect the main route;
- optional `subskill_analyses` record for `18-causal-discovery`: inputs reviewed, outputs created, diagnostics, limitations, and feedback for the main skill;
- `artifacts` and `analysis.analyses`: graph plots, edge lists, stability tables, method notes, code paths, and memos.

Use `assets/discovery_report_template.md`. Required content is the discovery question, data and variable inventory, graph target and method, candidate graph findings, candidate causal paths or a statement that stable paths are unavailable, diagnostics, exploratory interpretation, limitations, reproducibility notes, and recommended next effect-estimation questions when useful.

Discovery reports must say what the graph can and cannot mean. They can discuss candidate causal paths in the discovered graph, but they cannot present a final adjustment set, treatment effect, intervention recommendation, or upgraded claim strength unless a separate main-workflow route validates it.

## Diagnostic Review

Before drafting results or final prose, produce or request a diagnostic review. Classify each important check as `pass`, `concern`, `fail`, `not run`, or `not applicable`, and state how it changes interpretation.

Cover the relevant layers:

- **Design evidence:** estimand, comparator, target population, time zero, follow-up, route assumptions, and surfaced load-bearing assumptions.
- **Data evidence:** constructability, row-unit fit, timing fit, support/overlap/variation, missingness, censoring/selection, leakage, and reproducibility.
- **Method evidence:** design-specific diagnostics such as balance and overlap, pre-trends, placebo tests, synthetic-control fit, IV relevance/exclusion sensitivity, RD density/bandwidth checks, survival censoring checks, mediation sensitivity, interference mapping, or genomics harmonization/pleiotropy checks.
- **Result evidence:** estimate scale, uncertainty, robustness, sensitivity checks, subgroup or heterogeneity cautions, and whether alternative defensible specifications agree.
- **Presentation evidence:** which tables, figures, captions, and caveats the audience needs to understand the result without overstating it.

If diagnostics are incomplete, return production-review feedback or write a `Diagnostic Review`/`Progress Memo`, not a final report, unless the main skill records the diagnostic deferral and opens the production gate.

## Report Lifecycle

Use labels precisely:

- `Diagnostic Review`: diagnostics and implications for claim strength.
- `Draft Report`: pre-handoff or user-requested prose expected to be revised; do not use this label for the final handoff artifact.
- `Revision Pass`: edited report text or presentation language after user feedback on an already delivered artifact.
- `Final Report`: after `production_gate.status: ready`, handoff mode is active, diagnostics are complete or explicitly deferred, and the report reflects the recorded claim strength and limitations.
- `Discovery Report`: a discovery-only report synthesized from `18-causal-discovery` artifacts with exploratory claim strength; this is not an effect-estimation final report.
- `Presentation Outline`: slide, executive, policy, academic, or public-facing narrative plan.

Reports should be assembled in sections when the project is substantial. In handoff mode, complete the report rather than asking for another round of choices during synthesis. After delivery, the main skill should ask the user whether they want revision, another deliverable, follow-up exploration, explanation, a parked task resumed, or a pause. If the user requests revisions, slides, another report, or a different same-evidence deliverable, treat that as a separate revision/reporting pass that returns to `project.current_phase: reporting`.

## Presentation Consulting

During production reviewer mode, ask the main skill for audience or format clarification only when it would materially change reportability or artifact preparation. During handoff synthesis, infer audience and format from the recorded project state and finish the report rather than pausing for new preferences.

Use or infer:

- technical, academic, policy, executive, student, public, or mixed audience;
- short memo, methods/results section, reproducibility appendix, slide narrative, figure captions, table notes, or oral briefing;
- cautious, neutral, skeptical, decision-focused, or persuasive tone;
- which result should be the first visual signal and which caveat should travel with it.

Choose presentation forms that match the evidence. A strong design with clean diagnostics can lead with an effect estimate. Fragile diagnostics should lead with design limits and show the estimate as conditional or exploratory.

## Claim Language

Match wording to support:

- `causal`: gate-ready route with diagnostics that support the identifying story.
- `cautious causal`: gate-ready but assumption-dependent, diagnostically fragile, or sensitive to plausible alternatives.
- `associational`: design does not support causal interpretation, or key diagnostics fail.
- `descriptive`: the work summarizes patterns without a causal route.
- `exploratory`: early-stage, discovery-oriented, or diagnostic evidence is incomplete.

Reserve strongest causal language for rare cases where the main skill records that the design, diagnostics, assumptions, and scope support it. In most reports, use calibrated language that names the assumptions and population or margin of validity.

Keep action recommendation strength separate from effect claim strength. A valid causal estimate can support an effect conclusion without supporting an unconditional rollout, scale-up, renewal, shutdown, expansion, or targeting recommendation. Make action recommendations conditional unless the recorded evidence also supports the decision scope, target population, implementation context, uncertainty, external validity, and decision-relevant costs, harms, constraints, or guardrails.

## Output Contract

In production reviewer mode, use the same production-reviewer summary shape as Data Technician:

```yaml
reviewer_id: "20-report-writer"
phase_context: "production"
review_purpose: "one value from assets/workflow_enums.yaml > production_review_purpose"
production_readiness: "one value from assets/workflow_enums.yaml > production_loop_readiness"
foundation_readiness_effect: "unchanged"
summary: null
blocking_signal:
  blocks_current_phase: false
  requires_previous_phase_recheck: false
  target_phase: null
  severity: "none"
  reason: null
  affected_sections: []
recommended_next_action: "one value from assets/workflow_enums.yaml > main_actions"
artifact_paths: []
```

Also map compact Report Writer state to `analysis.report_writer_20`:

```yaml
mode: "production reviewer | handoff writer | discovery report writer"
status: "one value from assets/workflow_enums.yaml > report_writer_statuses"
production_feedback: []
summary: null
artifacts: []
```

During production reviewer mode, keep feedback compact for `analysis.production_loop.reviewer_summaries` and `analysis.report_writer_20.production_feedback`. During handoff mode, put full reports, diagnostic tables, slide outlines, captions, and reproducibility appendices in `artifacts/`; keep only summaries and paths in `project.yaml`.

During discovery-only report mode, put the full discovery report in `artifacts/`; keep only `analysis.discovery_sidecar.artifact_paths`, optional `analysis.report_writer_20` summary, and optional compact `18-causal-discovery` trace records in `project.yaml`.

## Reference Files

- `references/workflow.md`: detailed diagnostic-review, final-report synthesis, presentation, and handoff workflow.
- `references/examples.md`: reusable examples for production-review handback, diagnostic review, final report pattern, revision pass, presentation consulting, and final handoff checks.
- `assets/final_report_template.md`: final report structure for handoff mode.
- `assets/discovery_report_template.md`: discovery-only report structure for exploratory graph deliverables.
