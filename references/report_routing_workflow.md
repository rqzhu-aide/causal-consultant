# Report Routing Workflow

Load this reference only for report requests, report-scope approval,
Markdown-to-HTML conversion, reviewer-facing writing, safer claim wording,
limitations language, or pending `report_writer` work.

## Report Vocabulary

- `report scope`: the shallow `report_writer` precheck package that proposes
  what a report would cover before approval.
- `approved report task`: the deep `report_writer` assignment after the user
  approves the report scope.
- `report output`: created Markdown, HTML, section draft, reviewer response, or
  other report artifact.

## Routing Rules: No Existing Report Writer Work

- If there is no remaining `report_writer` item in `next_step_plan`, a report
  request starts as shallow scope work.
- This includes report-scope setup, study-planning reports, outline structure,
  results reporting, manuscript/report text, reviewer-facing material, report
  polishing, rewriting, safer causal wording, limitations language, or
  claim-boundary wording.
- Plan `report_writer` with `report_precheck: false` and `mode: shallow`.

## Routing Rules: Existing Report Writer Work

- If there is a remaining shallow `report_writer` item in `next_step_plan` and
  the user clearly approves that existing report scope, route `report_writer`
  directly with `mode: deep` and `report_precheck: true`.
- If there is a remaining `report_writer` item but the user changes or adds
  report/analysis work instead of approving it, route the new work normally.
- If the approval target is ambiguous, plan only `team_lead` to clarify.
- If `report_precheck: true` or the task is approved Markdown-to-HTML
  conversion, keep `mode: deep`.
- Do not add any other core route or `analysis_execution` while preserving
  pending report work.

## Markdown-To-HTML Conversion

Plan `report_writer` with `report_precheck: true` and `mode: deep` for direct
Markdown-to-HTML conversion only when all of these are true:

- `project_summary.report_output: exist`
- `report_assembly.current_format: md`
- `council_chamber.report_writer.current_status: produced`
- an actual `.md` report file from prior `report_writer` work exists in a
  recorded report output location

Otherwise, use shallow `report_writer` report-scope review.

## Report Mode Rules

- `report_precheck` belongs only to `report_writer` entries.
- `report_precheck: false` means report scope is not approved; shallow mode may
  build an approval-ready `report_assembly.planned_structure` but must not
  create final report output.
- `report_precheck: true` means approved report work may proceed in the current
  route, or direct Markdown-to-HTML conversion was requested for an existing
  Markdown report.
- Clear approval of an existing pending shallow report scope can route approved
  report writing in the same user turn. Markdown-to-HTML conversion of an
  existing Markdown report does not need an additional approval step.

## Plan Entry

Use this shape:

```yaml
next_step_plan:
  - id: report_writer
    request: "what the user requested or approved"
    task: "concrete report assignment"
    mode: shallow | deep
    report_precheck: false | true
  - id: team_lead
    task: "review route work, update aggregate state if needed, and respond"
```

For clear approval of an existing pending shallow report scope already present
in `project_state.yaml`, use the same shape with `mode: deep` and
`report_precheck: true`.
