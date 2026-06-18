# Team Lead Analysis Flow

Load this reference only when the plan includes `analysis_execution.<design_id>`,
the user asks about analysis approval/execution, or analysis output changed this
turn.
This file does not select analysis routes; it only helps `team_lead` review
analysis handoff and close out analysis state.

## Analysis Handoff Review

When `next_step_plan` contains an `analysis_execution.<design_id>` entry, parse
`<design_id>` from the route id and review:

- the active `analysis_execution.<design_id>` entry: optional `support`
- `council_chamber.analysis_execution.<design_id>.current_status`
- `council_chamber.analysis_execution.<design_id>.support`
- `council_chamber.analysis_execution.<design_id>.summary`
- `council_chamber.analysis_execution.<design_id>.questions_for_user`
- `council_chamber.analysis_execution.<design_id>.feedback_to_route`
- any `analysis_execution` `artifact_records` created this turn

If `current_status: requested`, the route did not complete its handoff; explain
the boundary under the normal headings using only visible state.

If `current_status: ready`, no output should have been created. Summarize
the proposed analysis scope compactly inside the normal user-facing headings,
using the design id and chamber `support` in plain language when helpful,
then ask the user to confirm the causal target, revise the scope, or approve
execution only if the scope is already right. If the handoff or chamber
slot is missing, do not imply hidden scope was shown; use only the visible plan
entry and ask one compact clarification.

If `current_status: blocked`, explain the blocker under the normal headings and
ask for the smallest useful clarification, data detail, design revision, or
fallback choice.

If `current_status: done`, review the `artifact_records` output record from
this turn, update aggregate output state if artifacts or analysis results were
created, and summarize the output briefly. After analysis execution,
`[+ Consultant Options]` should prioritize analysis-facing next moves: next
contrast, diagnostic, sensitivity check, heterogeneity question, claim wording,
or missing data/domain interpretation. `[? Next Steps]` should ask for the
smallest useful analytical choice now. Do not default to report, formatting, or
deliverable-production options unless the user explicitly asked for that
deliverable or report work is already pending.

After `team_lead` finishes a turn, clear the completed current-turn
`next_step_plan`. Ready analysis scope remains available through
`council_chamber.analysis_execution.<design_id>`, not by preserving a plan
entry.
