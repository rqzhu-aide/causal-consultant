# Workflow: Report Writer

## Goal

Review reportability, claim language, diagnostic presentation, draft reports, report revisions, final effect reports, discovery-only reports, planning/communication memos, gate-ready reproducible reports, gate-not-ready exploratory/progress reports, presentation outlines, methods/results sections, limitations, and reproducibility appendices for causal projects. The main skill owns both gates and routing. This skill participates as a production reviewer after the foundation gate opens, owns effect-report composition after the production gate opens, may synthesize a discovery-only report when the user requested graph discovery rather than effect estimation, and owns reusable report templates for no-data planning, communication-only deliverables, gate-ready data-backed reports, and exploratory/progress data-backed reports.

In handoff mode, the job is synthesis and completion. While writing the report, do not restart the interactive workflow, ask new preference questions, or re-open method choice. Use the foundation and production records already collected to write the final-ready report, making limitations and deferred diagnostics explicit. After delivery, control returns to the main skill with `project.current_phase: post_delivery` and `main_skill.selected_next_action: ask_user`. Revision, slides, another report, or another same-evidence deliverable returns to `project.current_phase: reporting`.

## Production Reviewer Checklist

- [ ] `foundation_gate.status` is `ready`.
- [ ] Current route, estimand, population, comparator, outcome, time horizon, and method family are recorded.
- [ ] The main skill selected `20-report-writer` in `analysis.production_loop.selected_reviewers`, or explicitly requested production-phase report/presentation review.
- [ ] There is a plan, result, diagnostic, artifact, table/figure, limitation, audience choice, or presentation question to review.

Return one compact production-reviewer summary for `analysis.production_loop.reviewer_summaries`; do not take over report composition in this mode.

## Handoff Checklist

- [ ] `foundation_gate.status` is `ready`.
- [ ] `production_gate.status` is `ready`.
- [ ] `production_gate.can_handoff_to_report_writer` is true.
- [ ] Current route, estimand, population, comparator, outcome, time horizon, and method family are recorded.
- [ ] The analysis plan is confirmed or documented as not requiring confirmation.
- [ ] First-pass results, diagnostics, or a reportable artifact exist.
- [ ] Data Technician method-fit suggestions and data warnings are reviewed or explicitly deferred.
- [ ] `analysis.production_loop.readiness` is `diagnostics complete`, `diagnostics deferred`, `diagnostics not needed`, `materials ready`, or `reportable`.
- [ ] Remaining diagnostics are complete, not applicable, infeasible, or explicitly deferred.

If any item is missing, return a handback to the main skill instead of writing a final report.

## Discovery-Only Report Checklist

- [ ] The requested deliverable is causal discovery, graph exploration, graph comparison, variable screening, discovery diagnostics, or a discovery-only report.
- [ ] `analysis.discovery_sidecar` records the discovery purpose, artifact paths, and whether findings affect the main route.
- [ ] Discovery artifacts or placeholders exist for graph findings, causal-path notes, diagnostics, limitations, and reproducibility.
- [ ] The report will use exploratory claim strength.
- [ ] `foundation_gate.status` and `production_gate.status` are `not needed` because no separate effect-estimation route is being validated.

Use `../assets/discovery_report_template.md`. Do not require normal production-gate handoff for this mode, and do not present a treatment effect, final adjustment set, or intervention recommendation. If discovery is conceptual or based on user-provided graph output, a Markdown report is acceptable. If discovery algorithms are run on data, the discovery report should normally have a source report plus rendered HTML.

## Planning / Communication Memo Checklist

- [ ] The user has not provided analyzable data, or the request is mainly wording, slide bullets, email text, caveats, executive language, or planning advice.
- [ ] The memo will not present new data-derived results, diagnostics, estimates, or plots.
- [ ] Any DAG or design is labeled as candidate, anticipated, or working unless already validated elsewhere.
- [ ] Package suggestions are tied to likely candidate routes or method subskills, not listed generically.
- [ ] Requested communication material, if any, belongs in the appendix.

Use `../assets/planning_communication_memo_template.md`. Treat it as a flexible and informative template: preserve required coverage, but adapt section names, order, and depth to the project. Keep the memo short by default and record it as an artifact rather than a final effect-estimation report.

## Gate-Ready Reproducible Analysis Report Checklist

- [ ] Analyzable data exist and the analysis is run in code.
- [ ] `foundation_gate.status` is `ready` and `foundation_gate.can_support_causal_commitment` is true.
- [ ] `production_gate.status` is `ready` and `production_gate.can_handoff_to_report_writer` is true.
- [ ] `analysis.route_commitment_status` is `ready` or `committed`.
- [ ] The source notebook or report document is executed or explicitly marked as a draft that still needs execution.
- [ ] The rendered HTML report exists, or the missing render is clearly marked as incomplete.
- [ ] Numeric results, diagnostics, plots, and tables come from executed notebook cells, verified artifacts, or explicitly labeled user-provided outputs.
- [ ] The report covers data provenance, causal question/design, data readiness, analysis specification, results, diagnostics/sensitivity, interpretation/limits, and reproducibility somewhere in numbered sections.
- [ ] Package choices match the route or method owner actually used or plausibly activated.

Use `../assets/reproducible_analysis_report_template.md`. Treat it as a flexible and informative template: preserve required coverage, but adapt section names, order, and depth to the project.

## Gate-Not-Ready Exploratory / Progress Analysis Report Checklist

- [ ] Analyzable data exist and the analysis is run in code, or the source report is clearly marked as a draft awaiting execution.
- [ ] At least one gate-ready handoff condition is false: foundation readiness, causal-commitment support, production readiness, production handoff, or route commitment.
- [ ] If foundation is not ready, `analysis.route_commitment_status` is `user-directed`, `exploratory`, or `blocked`, and `foundation_gate.can_support_causal_commitment` is false.
- [ ] If foundation is ready but production is not ready, the report is framed as first-pass, diagnostic, or progress material rather than a final conclusion.
- [ ] If modeling or diagnostics actually ran, an activated method/job owner, compact `subskill_analyses` record, and minimal `analysis.production_loop` trace fields exist or are requested from the main skill.
- [ ] `analysis.claim_strength` is not stronger than the gatekeeper fields allow.
- [ ] `production_gate.can_handoff_to_report_writer` is false.
- [ ] Numeric results, diagnostics, plots, and tables come from executed notebook cells, verified artifacts, or explicitly labeled user-provided outputs.
- [ ] The report states why it is not gate-ready and what would be needed to upgrade the analysis.

Use `../assets/exploratory_analysis_report_template.md`. Treat it as a flexible and informative template for learning, model exploration, production progress, or diagnostics. It can include effect-estimation-style results, but not final causal-report language.

## Status Map

Use the canonical mode/status lifecycle from `../SKILL.md > Status Writing Rules`. In this workflow reference, remember the operational rule: delivered statuses are only for completed artifacts already given to the user through the matching Report Writer mode, and after either `final report delivered` or `discovery report delivered`, the main skill sets `project.current_phase: post_delivery` and `main_skill.selected_next_action: ask_user`.

Planning/communication memos and gate-not-ready exploratory/progress reports can also move the conversation to `post_delivery` when an artifact is delivered, but they do not use Report Writer delivered statuses unless they are part of a valid handoff or discovery-report mode. In those cases, `post_delivery` is supported by `artifacts` or `analysis.report_writer_20.artifacts`, and the next action is still `ask_user`.

## Evidence Intake

Inventory only what is needed for the reporting task:

- project goal, audience, and desired deliverable;
- route and estimand;
- foundation and production gate status, blockers resolved, assumptions surfaced or deferred, and production handoff summary;
- Data Technician findings on row unit, timing, constructability, support, missingness, leakage, package constraints, and reproducibility;
- `analysis.production_loop` reviewer summaries, remaining action queue, readiness, and report-readiness rationale;
- method-subskill outputs, estimates, uncertainty, diagnostics, sensitivity checks, and failed/fallback routes;
- artifacts such as plots, tables, notebooks, scripts, session info, and draft text.

## Handoff Assembly

Use `../assets/final_report_template.md` as the default structure after `production_gate.status: ready`. Populate it from existing state:

- Problem and background come from `main_skill`, `evaluators.domain_helper_01`, and `production_gate.handoff_summary`.
- Causal question, estimand, design choice, rejected alternatives, and claim strength come from `routes`, `foundation_gate`, `analysis.route_commitment_status`, and Design Planner records.
- DAG logic, identifying assumptions, and cautions come from `evaluators.dag_builder_04`, load-bearing assumptions, and method/job limitations.
- Data construction, row unit, timing, missingness, support, leakage, and reproducibility come from Data Technician records and artifacts.
- Method/job analysis, diagnostics, sensitivity checks, estimates, figures, and tables come from `subskill_analyses`, `analysis.analyses`, `analysis.recommended_diagnostics`, `production_gate.completed_outputs`, and artifact paths.
- Limitations, deferred checks, and careful wording come from `foundation_gate.deferred_assumptions`, `production_gate.claim_strength_for_report`, `analysis.limitations`, `subskill_analyses[].limitations`, and Report Writer production feedback.

If expected evidence is missing but the production gate is ready, write the absence as a limitation or deferred check instead of asking the user. Return a blocked handback only when a required gate condition or material is missing.

## Diagnostic Review Pattern

Use a compact table or bullets:

| Check | Status | Evidence | Interpretation impact |
|---|---|---|---|
| Design fit | pass/concern/fail/not run/not applicable | ... | ... |
| Data constructability | ... | ... | ... |
| Required method diagnostic | ... | ... | ... |
| Sensitivity/robustness | ... | ... | ... |
| Reproducibility | ... | ... | ... |

End every diagnostic review with one of:

- `ready for report handoff`;
- `ready for cautious report with caveats`;
- `needs more diagnostics before report`;
- `result should be presented as exploratory/associational`;
- `return to main skill for route revision`.

## Final Report Assembly Sequence

After the production gate opens, assemble the report as a final-ready artifact rather than a new draft loop:

1. Title or claim-framing line.
2. Executive summary with problem, bottom line, claim strength, key evidence, and main caution.
3. Problem background and decision context.
4. Causal question and estimand.
5. Design route, rejected alternatives, DAG logic, and load-bearing assumptions.
6. Data construction and readiness.
7. Method/job analysis, diagnostics, sensitivity checks, results, and uncertainty.
8. Figures and tables that support the conclusion.
9. Interpretation, limitations, cautions, deferred checks, and what should not be inferred.
10. Reproducibility appendix or artifact index.

For short requests, compress these into a brief memo but keep design logic, diagnostics, claim strength, and limitations visible.

## Discovery Report Assembly Sequence

For discovery-only reports, assemble:

1. Title or exploratory framing line.
2. Executive summary with discovery goal, bottom line, artifact, and main caution.
3. Discovery question and scope, including the difference between workflow path and graph path.
4. Data and variable inventory.
5. Discovery target and method.
6. Candidate graph findings.
7. Candidate causal paths, or why stable paths cannot be stated.
8. Possible confounders, mediators, colliders, and adjustment warnings.
9. Diagnostics and stability checks.
10. Interpretation, limitations, recommended next effect-estimation questions, and artifact index.

Keep follow-up effect-estimation questions optional. The report should not silently start a new causal-estimation route.

Preserve causal discovery as a separate report type. When data-backed discovery code was run, use the same discovery sections in the source report and rendered HTML, and include graph plots, edge lists, stability tables, packages, seeds, tuning, and code paths in the reproducibility section. When no discovery code was run, label the report as conceptual, user-provided, or preliminary as appropriate.

## Planning / Communication Memo Assembly Sequence

For no-data planning or communication-only requests, use `../assets/planning_communication_memo_template.md` as the memo scaffold. The memo should normally include:

1. Date.
2. Request and current context, with known facts separated from important unknowns.
3. Working causal structure or design, when applicable.
4. Route-aware first-pass analysis options and packages for later data work.
5. Conclusion, unsupported claims, pitfalls, and one practical next step.
6. Appendix with requested slide bullets, email text, caveats, or executive wording.

This sequence is not mandatory page order. Merge, split, rename, or reorder sections when the project needs it, but do not drop required coverage. Do not turn a memo into a hidden final report. If the user later provides analyzable data, the next deliverable should move toward a reproducible analysis source and rendered report rather than extending the memo with unsupported results.

## Gate-Ready Reproducible Analysis Report Assembly Sequence

For data-backed work with executed code and gate-ready support, use `../assets/reproducible_analysis_report_template.md` as the report scaffold. The report should normally include:

1. A project-specific title and claim-status summary.
2. A combined question, data, and design section that explains treatment/exposure, outcome, comparator, population, timing, estimand, data sources inspected, and design logic.
3. A data readiness and analysis specification section that explains row unit, missingness, timing/leakage, support, measurement, selected method owner, packages, estimand, plain-language analytic specification, and planned diagnostics.
4. A results and diagnostics section where outputs are generated by executed notebook cells or linked verified artifacts.
5. An interpretation and next-step section that calibrates claim strength and separates effect claims from action recommendations.
6. A reproducibility appendix with source report path, rendered HTML, package versions, seeds, code paths, saved figures/tables, and a lean mathematical specification when useful.

This sequence is not mandatory page order. Merge, split, rename, or reorder sections when the project needs it, but do not drop required coverage. If the rendered HTML is missing, call the artifact an analysis source or draft report rather than a completed shareable report.

## Gate-Not-Ready Exploratory / Progress Analysis Report Assembly Sequence

For data-backed reports before gate-ready handoff, use `../assets/exploratory_analysis_report_template.md` as the report scaffold. The report should normally include the same general spine as the gate-ready report:

1. A project-specific title and claim-boundary summary.
2. A question, data, and design section that explains treatment/exposure, outcome, comparator, population, timing, estimand, data sources inspected, and which pieces are provisional or already foundation-ready.
3. A data readiness and analysis specification section that explains row unit, missingness, timing/leakage, support, measurement, selected or attempted method owner, packages, estimand, plain-language analytic specification, and missing diagnostics.
4. A results and diagnostics section where outputs are generated by executed notebook cells or linked verified artifacts.
5. An interpretation and next-step section that states what can be learned, what cannot be claimed, why the report is not gate-ready, and what would upgrade or revise the analysis.
6. A reproducibility appendix with source report path, rendered HTML, package versions, seeds, code paths, saved figures/tables, and a lean exploratory specification when useful.

Keep this artifact lean. It should help the user explore or review progress without implying that Report Writer handoff or final causal reporting has happened.

## Revision Passes

Do not embed open revision questions inside the handoff report body. After the report is delivered, the main skill may ask a separate continuation question. If the user asks for changes, handle those as a separate revision pass and revise only the requested layer:

- audience level or tone;
- causal wording;
- lead estimate, figure, or diagnostic;
- methods detail placement;
- limitation emphasis;
- slide-ready, paper-ready, policy-ready, or executive-ready language.

## Presentation Consulting

Match deliverable to audience:

- **Technical/academic:** estimand, design, assumptions, diagnostics, uncertainty, sensitivity, reproducibility.
- **Policy/executive:** decision question, effect scale, uncertainty, operational meaning, caveats, recommendation limits.
- **Public/student:** plain-language question, what the data can and cannot show, honest bottom line.
- **Slides:** one message per slide, result figure with caveat caption, assumptions/diagnostics in appendix when appropriate.

Use figures and tables as evidence, not decoration. If diagnostics are fragile, pair the result with the diagnostic that most constrains interpretation.

## Claim Calibration

Suggested wording:

- `causal`: "The supported design estimates that..."
- `cautious causal`: "Under the stated assumptions and diagnostics, the estimate suggests..."
- `associational`: "The data show an association between..."
- `descriptive`: "In this dataset, the observed pattern is..."
- `exploratory`: "This first-pass analysis is useful for hypothesis generation, but..."

For discovery-only reports, prefer: "The discovered structure suggests graph hypotheses for review" or "This path is a candidate causal chain in the learned graph, not a validated effect estimate."

Avoid:

- "proves";
- "establishes causality" without qualification;
- "no effect" when uncertainty is wide;
- "robust" when only one specification was checked;
- "controlled for all confounders" in observational work.

## Data Technician Requests

Ask the main skill to refresh Data Technician when the report needs:

- a missing data-cleaning or preprocessing record;
- row-unit/timing clarification;
- support, overlap, missingness, censoring, leakage, or selection diagnostics;
- package versions, seeds, code paths, environment exports, or reproducibility notes;
- a table or plot artifact generated from the current analysis;
- a rendered HTML report path when notebook, Quarto, R Markdown, or equivalent output is intended to be shared.

## Production Reviewer Summary

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
