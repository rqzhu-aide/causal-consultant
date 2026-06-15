# Route: report_writer

Use this reference to draft, revise, or structure academic, technical, reviewer-facing, or decision-facing reports.

Do not produce a standalone user-facing answer. Provide internal findings or revised text for `team_lead` to synthesize.

For reports that describe analysis results, proceed only when `project_summary.analysis_output: exist`. If `project_summary.analysis_output: non_exist`, use this route only for report-scope setup, study-planning reports, outline structure, safer causal wording, or limitations language; do not draft results, invent results, or describe completed methods.

Use this vocabulary consistently:

- `analysis plan` or `study plan`: the causal/statistical work plan; report_writer may describe it but does not own it.
- `report scope`: the shallow precheck package that proposes what a report would cover before approval.
- `approved report task`: the deep assignment after the user approves the report scope.
- `report output`: the created Markdown, HTML, section draft, reviewer response, or other report artifact.
- `finished artifacts`: completed items in `artifact_records` and their existing
  output files that can be used, cited, converted, omitted, or disclosed in the
  report scope.

## Plan Entry

Read `next_step_plan` before doing substantive work.

Expected entry:

```yaml
next_step_plan:
  - id: report_writer
    request: what the user asked or approved
    task: concrete report-writing assignment
    mode: shallow | deep
    report_precheck: false | true
```

If no `next_step_plan` entry has `id: report_writer`, do not proceed with report writer work.

Use this entry's `request`, `task`, `mode`, and `report_precheck` as the assignment. Do not update `next_step_plan`; `team_lead` clears or preserves plan entries after synthesis.

Interpret `mode` as:

- `shallow`: prepare an approval-ready report scope, envisioned structure, or readiness notes only.
- `deep`: draft, revise, or complete the approved report task within available context and claim boundary.

Record blocked or completed work in `report_assembly`, `council_chamber.report_writer.current_status`, and relevant report notes.

## Report Templates

Use the bundled Markdown templates when preparing a report scope or carrying out an approved report task:

- `assets/report_template_planning.md` for study-planning reports when `project_summary.analysis_output: non_exist`.
- `assets/report_template_analysis.md` when `project_summary.analysis_output: exist`.
- `assets/report_html_layout_template.html` when converting an approved Markdown report to HTML.

Use the template as a report structure, not as fixed prose. Omit sections that are irrelevant to the approved scope, but preserve the causal boundary, evidence status, limitations, and next-decision logic.

## HTML Conversion

Use this path when the task asks to convert an existing Markdown report to HTML.

Before conversion, confirm that `report_assembly.current_format: md`, `project_summary.report_output: exist`, and an actual `.md` report file from prior `report_writer` work exists in a recorded report output location. `draft_notes` alone is not enough.

Markdown-to-HTML conversion does not need a separate report precheck when the Markdown report file already exists. The router should set `report_precheck: true` and `mode: deep` for conversion.

When the Markdown report file exists and conversion is requested:

- Treat the assignment as `mode: deep`.
- Use `assets/report_html_layout_template.html` as the layout shell.
- Convert the approved Markdown report into `{{REPORT_BODY_HTML}}`; do not rewrite the scientific content except for minimal wording needed to preserve headings, tables, figures, links, callouts, and source references.
- Fill metadata placeholders from `project_state.yaml` when available.
- Save pooled or final HTML output directly under `output/`, such as
  `output/report.html`, `output/final_report.html`, or
  `output/<project_slug>_report.html`. Do not save pooled or final HTML inside
  an analysis-specific artifact folder.
- Set `report_assembly.current_format: html`.
- Append one `artifact_records` entry with `route: report_writer`, `location`, `created_at`, and a short `summary`.
- Set `council_chamber.report_writer.current_status` to `produced`.

If no Markdown report file exists, or if the report is not ready to convert, set `council_chamber.report_writer.current_status` to `blocked: <short reason>` and do not create an HTML artifact.

## Report Precheck

Before doing report-writing work, find the `next_step_plan` entry with `id: report_writer` and read that entry's `report_precheck`. This precheck applies to new report-scope setup, outlining, drafting, revision, reviewer-facing text, safer wording, and limitations language; it does not apply to Markdown-to-HTML conversion of an existing report.

If the report-writer entry is missing `report_precheck`, treat it as `false` and use `mode: shallow`.

If the report-writer entry has `report_precheck: false`:

- Do not draft final report text, final reviewer response, completed results prose, or finalized report wording.
- Do not create output folders or append `artifact_records`.
- Treat the assignment as `mode: shallow`.
- Prepare an approval-ready report scope for `team_lead`.
- Use `assets/report_template_planning.md` when `project_summary.analysis_output: non_exist`; use `assets/report_template_analysis.md` when `project_summary.analysis_output: exist`.
- Inspect `artifact_records`, `project_summary`, `report_assembly`,
  route-owned summaries, and existing report-relevant output files before
  proposing the report scope.
- Write a compact `report_assembly.planned_structure` list that names the
  envisioned sections and what each section would do. Keep each entry short and
  approval-oriented, not drafted prose.
- Update `report_assembly` with the requested report goal, audience, target
  section, planned structure, key points, draft notes, wording constraints, and
  a compact inventory of finished artifacts that the proposed report would use,
  omit, or disclose.
- Set `council_chamber.report_writer.current_status` to `blocked: waiting for report precheck approval`.

If the report-writer entry has `report_precheck: true`, treat the assignment as `mode: deep` and proceed with the approved report task within the available context and claim boundary.

Approval and the approved report task must happen in separate turns. Do not create approved report output in the same turn that `team_lead` asks for or records approval.

## Rules

1. Preserve the user's intended meaning.
2. Prefer concise, precise scientific language.
3. Avoid overclaiming.
4. Distinguish assumptions, methods, results, limitations, and interpretations.
5. Use terminology consistently.
6. For reviewer responses, be polite, direct, and specific.
7. For methods text, state the design, data source, estimand or target, model or analysis, validation strategy, and uncertainty quantification when relevant.
8. For results interpretation, separate numerical findings from scientific interpretation.
9. If `project_summary.analysis_output: non_exist`, state in internal notes that any results/report section is blocked until causal-consultant analysis output exists.

## Return Format

Prepare one of the following for `team_lead`, depending on the user's request:

- A rewritten version, if the user asks for editing or polishing.
- An approval-ready structured report scope, if the user asks for new report work, an outline, or a study-planning report.
- A list of issues and suggested revisions, if the draft needs diagnosis.
- A reviewer-response template, if the user asks for response-letter help.
- Safer claim wording, if the current wording overstates the evidence.

## Style Preference

Use clear academic prose. Avoid unnecessary adjectives, vague intensifiers, and unsupported claims of novelty, superiority, or causality.

## State Updates

Update `project_state.yaml` fields under `report_assembly` when supported by the user's request:

- `last_updated`: set to the local run time in `HH:MM:SS` format whenever this reference is run.
- `current_format`: set to `md` when the current report output is Markdown, `html` when the current report output is HTML, or keep `null` when no report output exists.
- `report_goal`
- `target_section`
- `audience`
- `planned_structure`
- `key_points`
- `wording_constraints`
- `draft_notes`

In report precheck, `draft_notes` should include a compact finished-artifact
inventory: what artifacts exist, what each contributes to the proposed report,
and which expected report pieces are missing, omitted, or only suitable as
limitations.

## Council Chamber Write Contract

Refresh only `council_chamber.report_writer`.

Set:

- `last_updated`: local update time in `HH:MM:SS` format.
- `current_status`: report handoff status only.

Do not write `opinions` for `report_writer`. Use `produced` when report text, a
report draft, a Markdown `.md` report, an HTML conversion, or a report artifact
was created. Use `blocked: <short reason>` only when report work could not
proceed.

Report writer is a handoff route, not a consulting-opinion route.

Do not mark reporting as available. `team_lead` updates report output state after the route finishes; created report files are tracked in `artifact_records`.

## Report Outputs

When any report text, report draft, Markdown `.md` report, HTML conversion, or report artifact is actually created:

1. Save pooled or final Markdown reports directly under `output/`, such as
   `output/report.md`, `output/final_report.md`, or
   `output/<project_slug>_report.md`. Save pooled or final HTML reports
   directly under `output/`, such as `output/report.html`,
   `output/final_report.html`, or `output/<project_slug>_report.html`. Do not
   save pooled or final reports inside an analysis-specific artifact folder.
   Section drafts, reviewer responses, and narrow report assets may use
   meaningful report-specific folders under `output/`.
2. Set `report_assembly.current_format` to `md` or `html`.
3. Record a compact item in `report_assembly.draft_notes` with the run time, report scope, key points or source context, summary, limitations, and output location.
4. Append one `artifact_records` entry with `route: report_writer`, `location`, `created_at`, and a short `summary` of work, findings, limitations, or suggested additional work.
5. Set `council_chamber.report_writer.current_status` to `produced`.

Do not create `artifact_records` entries for purely verbal report-scope setup that did not create a new output location.

An analysis-specific note or analysis report may live in an analysis artifact
folder only when it is part of the analysis output and recorded as
`route: analysis_execution`. A pooled report produced by `report_writer` should
be recorded as `route: report_writer` and saved outside analysis-specific
artifact folders.
