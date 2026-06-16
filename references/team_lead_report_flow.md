# Team Lead Report Flow

Load this reference only when the plan includes `report_writer`, the user asks
about report approval/output/conversion, `report_assembly` changed this turn, or
an HTML conversion option may be relevant. This file does not select report
routes; it only helps `team_lead` review an existing report route and close out
report state.

## Report Precheck

`report_precheck` is allowed only on a `next_step_plan` entry where
`id: report_writer`.

Use `report scope` for the shallow precheck package, `approved report task` for
deep report work, and `study plan` or `analysis plan` only for
causal/statistical work. `report_precheck: false` means the report scope is not
approved; `true` means approved report work may proceed in the active route, or
direct Markdown-to-HTML conversion was requested for an existing Markdown
report.

Markdown-to-HTML conversion does not need a separate report precheck when
`project_summary.report_output: exist`, `report_assembly.current_format: md`,
`council_chamber.report_writer.current_status: produced`, and an actual `.md`
report file from prior `report_writer` work exists in a recorded report output
location.

When `next_step_plan` contains a `report_writer` entry:

1. If `report_precheck` is missing, treat it as `false` and use
   `mode: shallow`.
2. Review `report_assembly.planned_structure`, `key_points`, `draft_notes`,
   `wording_constraints`, `current_format`, and any report-writer readiness
   note from this turn.
3. If results-focused drafting is requested before
   `project_summary.analysis_output: exist`, keep `report_precheck: false`,
   explain that only a study-planning report, outline, safer wording, or
   limitations work is available until analysis output exists, and ask whether
   to approve that report scope instead.
4. If `report_precheck: false` and the user has not approved the pending scope,
   enforce `mode: shallow`, summarize the proposed report scope and envisioned
   structure from `report_assembly`, then ask the user to approve or revise it.
5. If `report_precheck: true`, enforce `mode: deep`, review report-writer
   output, update aggregate output state if report output was created, and clear
   the entry only after the approved report task is complete or blocked.

Do not clear a pending `report_writer` entry merely because `team_lead` ran.
Preserve it while report creation remains possible and either report-scope
approval or the approved report task is still outstanding. If
`council_chamber.report_writer.current_status` starts with `scope_ready:`,
preserve the shallow `report_writer` entry with `report_precheck: false` and
remove only the completed `team_lead` entry.

## HTML Conversion Option

When preparing `[+ Consultant Options]:`, check whether an actual Markdown `.md`
report file is ready for HTML conversion.

Offer HTML conversion as the final consultant option only when all of these are
true:

- `project_summary.report_output: exist`
- `report_assembly.current_format: md`
- `council_chamber.report_writer.current_status: produced`
- an actual `.md` report file from prior `report_writer` work exists in a
  recorded report output location

Use wording like: `Convert the completed Markdown report into a polished HTML
report.`

Do not make HTML conversion the recommended next step unless the user
specifically asks for it. Do not offer it when `report_assembly.current_format:
html`, when no report output exists, when no actual `.md` report file exists, or
when `council_chamber.report_writer.current_status` starts with `blocked:`.
