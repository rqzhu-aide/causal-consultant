# Team Lead Analysis Flow

Load this reference only when the plan includes `analysis_execution`, the user
asks about analysis approval/execution, or analysis output changed this turn.
This file does not select analysis routes; it only helps `team_lead` review an
existing analysis route and close out analysis state.

## Analysis Precheck

`analysis_precheck` is required only on an `analysis_execution` entry. `false`
means readiness notes only; `true` means the user approved the scope and method
references may execute in the active route.

When `next_step_plan` contains an `analysis_execution` entry:

1. If `analysis_precheck` is missing, treat it as `false` and use
   `mode: shallow`.
2. If `analysis_precheck: false` and the user has not approved the pending
   scope, enforce `mode: shallow`, confirm that no output folder,
   `artifact_records`, or analysis output was created, summarize the proposed
   analysis scope compactly inside the normal user-facing headings, and ask the
   user to confirm the causal target, revise the scope, or approve execution
   only if the scope is already right.
3. If `analysis_precheck: true`, enforce `mode: deep`, review the
   `analysis_execution` `artifact_records` output record from this turn, update
   aggregate output state if artifacts or analysis results were created, and
   clear the entry only after execution is complete or blocked. After analysis
   execution, `[+ Consultant Options]` should prioritize analysis-facing next
   moves: next contrast, diagnostic, sensitivity check, heterogeneity question,
   claim wording, or missing data/domain interpretation. `[? Next Steps]`
   should ask for the smallest useful analytical choice now. Do not default to
   report, formatting, or deliverable-production options unless the user
   explicitly asked for that deliverable or report work is already pending. If
   HTML conversion is relevant and must appear, make it the final item in
   `[+ Consultant Options]`.

Preserve pending `analysis_execution` entries while approval or execution is
still outstanding.

After `team_lead` finishes a turn, remove completed non-report and completed
analysis work entries and remove the `team_lead` entry itself by running
`scripts/state_next_step_plan.py --state project_state.yaml preserve-gated` when
a pending shallow report or analysis scope should remain, or
`scripts/state_next_step_plan.py --state project_state.yaml clear` otherwise.
