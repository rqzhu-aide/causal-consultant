# Team Lead Report Flow

Load this reference only when the plan includes `report_writer`, the user asks
about report approval/output, or `report_assembly` changed this turn. This file
does not select report routes; it only helps `team_lead` review report handoff
and close out report state.

## Report Handoff Review

When `next_step_plan` contains a `report_writer` entry, review:

- `report_assembly.planned_structure`
- `report_assembly.key_points`
- `report_assembly.draft_notes`
- `report_assembly.wording_constraints`
- `report_assembly.current_format`
- `council_chamber.report_writer.current_status`
- `council_chamber.report_writer.summary`
- `council_chamber.report_writer.questions_for_user`
- `council_chamber.report_writer.feedback_to_route`
- any `report_writer` `artifact_records` created this turn

If results-focused drafting is requested before
`project_summary.analysis_output: exist`, explain that only a planning report or
bounded claim-boundary wording is available until analysis output exists, and ask
which purpose, audience, or claim boundary should shape that scope.

If `current_status: requested`, the route did not complete its report handoff;
explain the boundary under the normal headings using only visible state.

If `current_status: ready`, no report output should have been created.
Summarize the proposed report scope and envisioned structure compactly inside
the normal user-facing headings, using `questions_for_user` for the approval,
scope, audience, purpose, claim-strength, artifact-emphasis, omission, or
disclosure choice that matters before output creation.

If `current_status: done`, review report-writer output, update aggregate
report status from visible report output or artifact records, and summarize the
output briefly. Trust `report_writer` to distinguish refinements that were safe
to incorporate from material redesigns that needed another scope handoff.

If `current_status: blocked`, explain the blocker under the normal headings and
ask for the smallest useful clarification, scope revision, missing asset, or
fallback choice.

After `team_lead` finishes a turn, clear the completed current-turn
`next_step_plan`. Ready report scope remains available through
`report_assembly` and `council_chamber.report_writer`, not by preserving a plan
entry.
