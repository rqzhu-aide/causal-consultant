# Route: report_writer

Use this reference to draft, revise, or structure academic, technical,
reviewer-facing, or decision-facing reports.

Do not produce a standalone user-facing answer. Provide internal findings or revised text for `team_lead` to synthesize.

For reports that describe analysis results, proceed only when
`project_summary.analysis_output: exist`. If
`project_summary.analysis_output: non_exist`, use this route only for
planning report scope or claim-boundary language; do not draft results, invent
results, or describe completed methods.

Approved report output is HTML by default. Requests for PPT, DOCX, PDF, slides,
email, letter, memo, Markdown, or another form become scope, structure,
audience, or writing-style cues unless a future workflow explicitly supports
that file type; do not manage a separate file-format workflow or promise those
file types.

Use this vocabulary consistently:

- `analysis report`: report grounded in completed causal-consultant analysis
  output.
- `planning report`: report for framing, scope, missing evidence, and next
  decisions before analysis output exists.
- `report scope`: the proposed report structure, evidence use, audience, and
  limitations that `team_lead` can synthesize for approval or revision.
- `report output`: created or revised HTML report.
- `finished artifacts`: completed items in `artifact_records` and their existing
  output files that can be used, cited, linked, omitted, or disclosed in the
  report scope.

## Plan Entry

Read `next_step_plan` before route work.

Expected entry:

```yaml
next_step_plan:
  - id: report_writer
```

If no `next_step_plan` entry has `id: report_writer`, do not proceed with report writer work.

Use the current user message, `report_assembly`, `artifact_records`, and live
project state as the assignment. Do not update `next_step_plan`; `team_lead`
clears the current-turn plan after synthesis.

Classify the task into one of three content states:

- **No ready scope yet**: null, missing, or `current_status: requested`
  prepares report scope feedback, sets status to `ready` or `blocked`, and
  creates no files.
- **Ready scope**: compare the current user message with the existing
  `report_assembly`.
  - Clear approval of the same scope creates the report and sets status to
    `done`.
  - Approval with minor refinements also creates the report, incorporates the
    refinements, and sets status to `done`.
  - Material redesign revises `report_assembly`, keeps or sets status to
    `ready`, and creates no files.
  - Ambiguous or non-approval messages update questions, blocker notes, or
    route feedback as needed, keep status `ready` or set `blocked`, and create
    no files.
- **Blocked scope**: if the user provides the missing asset, scope repair,
  omission decision, audience or purpose clarification, or claim-boundary
  revision, update `report_assembly`; set status to `ready` if the report scope
  can now be presented, or keep it `blocked` if it still cannot proceed. Create
  no files unless the repaired state is already a clear approval of an existing
  ready scope.
- **Done report**: a revision request creates a new revised HTML report with a
  note describing the requested revision, while staying inside the causal
  boundary. A materially new purpose, evidence base, audience, or structure
  returns to scope preparation.

Minor refinements include shorter or longer length, reviewer-facing tone,
cautious wording, emphasizing or omitting a small section, adding a brief
limitation or heterogeneity paragraph, or changing report style without
changing the evidence base.

Material redesign includes a different report purpose, a different audience
with a different decision context, a different primary artifact or evidence
base, a different causal claim boundary, or a different structure that makes the
previous scope misleading.

Record blocked or completed work in `report_assembly`, `council_chamber.report_writer.current_status`, and relevant report notes.

## Report Templates

Use the bundled templates when preparing a report scope or carrying out an
approved report output:

- `assets/report_template_planning.md` as structural guidance for
  planning reports when `project_summary.analysis_output: non_exist`.
- `assets/report_template_analysis.md` as structural guidance when
  `project_summary.analysis_output: exist`.
- `assets/report_html_layout_template.html` as the required final HTML shell for
  approved report output.

Use the Markdown templates as section logic, not output targets or fixed prose.
Omit sections that are irrelevant to the approved scope, but preserve the causal
boundary, evidence status, limitations, and next-decision logic. Build the
approved report directly in the HTML shell, including figures, tables, artifact
links, callouts, sources, and report notes when supported by state and
artifacts.

## Causal Report Writing Logic

Before preparing scope or output, read the report-relevant parts of the full
project record, especially `project_summary`, `data_facts`, `domain_knowledge`,
`causal_facts`, `causal_discovery`, `council_chamber`, `artifact_records`, and
`report_assembly`.

For analysis reports, organize around the refined causal target, data reality,
design/method fit, artifact-backed results, diagnostics, claim boundary, and
decision implication. Every table or figure should answer a report question and
carry its main limitation.

For planning reports, organize around the decision context, missing
causal/data/domain facts, candidate targets or designs, evidence needed before
analysis, unsupported paths, and the next user decision.

Calibrate wording to evidence status:

- Use causal language only when `causal_facts` and completed artifacts support
  it.
- Use qualified language such as "consistent with" or "suggests" for limited
  designs or incomplete diagnostics.
- Use "association", "difference", "pattern", or "descriptive" when causal
  identification is not supported.
- Use "exploratory" or "hypothesis-generating" for screens, subgroups,
  discovery findings, or unvalidated contrasts.

Make missing diagnostics, omitted analyses, weak support, and parked items
visible. Avoid invented results, YAML field names as prose, decorative figures,
tables without interpretation, hidden omissions, and claims beyond
`artifact_records` or route-owned state.

Keep prose concise and consistent: preserve the approved scope, separate
assumptions, methods, results, limitations, and interpretations, use consistent
terms, and keep report prose clear, concise, and direct.

## Report Scope And Handoff

Before doing report-writing work, decide whether this turn should prepare scope
feedback, block, or create output. For requests that are not simply an analysis
report or planning report, follow the user's requested scope as writing style,
structure, or audience guidance while preserving the causal boundary.

When scope feedback is needed:

- Do not draft final report text, completed results prose, or finalized wording.
- Do not create output folders or append `artifact_records`.
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
- Set `council_chamber.report_writer.current_status` to `ready`.
- Set `council_chamber.report_writer.summary` to one compact description of the
  proposed report scope.
- Set `council_chamber.report_writer.questions_for_user` to 1-3 audience,
  scope, omission, claim-boundary, or approval questions for `team_lead`.
- Set `council_chamber.report_writer.feedback_to_route` only when another route
  should review something before report output.

Create report output only when the current user message clearly approves the
existing report scope, approves it with refinements, requests revision of a done
report, or asks for another format as a style cue that can be represented inside
the approved HTML report scope.

Prepare one of the following for `team_lead`, depending on the user's request:

- An approval-ready analysis report or planning report scope.
- A created or revised HTML report, with revision notes when relevant.
- A bounded requested-scope or style-focused report output when the user
  requests it and the causal boundary is preserved.

If `project_summary.analysis_output: non_exist`, record internally that any
results section is blocked until causal-consultant analysis output exists.

## State And Chamber Updates

Update `project_state.yaml` fields under `report_assembly` when supported by the user's request:

- `last_updated`: set to the local run time in `HH:MM:SS` format whenever this reference is run.
- `current_format`: set to `html` when report output exists, or keep `null`
  when no report output exists.
- `report_goal`
- `target_section`
- `audience`
- `planned_structure`
- `key_points`
- `wording_constraints`
- `draft_notes`

In report scope setup, `draft_notes` should include a compact finished-artifact
inventory: what artifacts exist, what each contributes to the proposed report,
and which expected report pieces are missing, omitted, or only suitable as
limitations.

Refresh only `council_chamber.report_writer`.

Set:

- `last_updated`: local update time in `HH:MM:SS` format.
- `current_status`: report handoff status only.
- `summary`: one compact description of the report scope, produced output, or
  blocker.
- `questions_for_user`: 1-3 questions, choices, or approval points for
  `team_lead` to surface.
- `feedback_to_route`: 0-2 handoffs when another member should review something
  before report output.

Use `requested` only for report scope review that has not finished yet; treat a
missing or null status as `requested`. Use `ready` when report scope/readiness
was prepared but no report output was created. Use `done` when report text, a
report draft, an HTML report, or a report artifact was created. Use `blocked`
only when report work could not proceed, with the reason in `summary`.

Report writer is a handoff route, not a consulting-opinion route.

Do not update global output status directly. Record report scope, output facts,
and created files here; `team_lead` handles any global synthesis after the route
finishes.

## Report Outputs

When any report text, report draft, HTML report, or report artifact is actually created:

1. Save pooled or final HTML reports directly under `output/`, such as
   `output/report.html`, `output/final_report.html`, or
   `output/<project_slug>_report.html`. Do not save pooled or final reports
   inside an analysis-specific artifact folder.
   Narrow report assets may use meaningful report-specific folders under
   `output/`.
2. Set `report_assembly.current_format` to `html`.
3. Record a compact item in `report_assembly.draft_notes` with the run time, report scope, key points or source context, summary, limitations, and output location.
4. Append one `artifact_records` entry with `route: report_writer`, `location`, `created_at`, and a short `summary` of work, findings, limitations, or suggested additional work.
5. Set `council_chamber.report_writer.current_status` to `done`.

Do not create `artifact_records` entries for purely verbal report-scope setup that did not create a new output location.

An analysis-specific note or analysis report may live in an analysis artifact
folder only when it is part of the analysis output and recorded as
`route: analysis_execution`. A pooled report produced by `report_writer` should
be recorded as `route: report_writer` and saved outside analysis-specific
artifact folders.
