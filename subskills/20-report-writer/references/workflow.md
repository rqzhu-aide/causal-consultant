# Workflow: Report Writer

## Goal

Review reportability, claim language, diagnostic presentation, draft reports, report revisions, final reports, presentation outlines, methods/results sections, limitations, and reproducibility appendices for causal projects. The main skill owns both gates and routing. This skill participates as a production reviewer after the foundation gate opens, then owns report composition after the production gate opens.

In handoff mode, the job is synthesis and completion. Do not restart the interactive workflow, ask new preference questions, or re-open method choice. Use the foundation and production records already collected to write the final-ready report, making limitations and deferred diagnostics explicit.

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

Use `assets/final_report_template.md` as the default structure after `production_gate.status: ready`. Populate it from existing state:

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

## Revision Passes

Do not embed open revision questions in the handoff report. If the user later asks for changes, handle those as a separate revision pass and revise only the requested layer:

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
- a table or plot artifact generated from the current analysis.

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
