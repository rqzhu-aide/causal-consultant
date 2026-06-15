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
   analysis scope from route-owned readiness notes and the plan entry, and ask
   the user to approve or revise it.
3. If `analysis_precheck: true`, enforce `mode: deep`, review the
   `analysis_execution` `artifact_records` output record from this turn, update
   aggregate output state if artifacts or analysis results were created, and
   clear the entry only after execution is complete or blocked.

Preserve pending `analysis_execution` entries while approval or execution is
still outstanding.

After `team_lead` finishes a turn, remove completed non-report and completed
analysis work entries and remove the `team_lead` entry itself. Preserve pending
entries that should still work later, especially `report_writer` and
`analysis_execution`.
