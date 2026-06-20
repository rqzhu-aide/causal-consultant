# Design Execution Contract

Use this reference from design routes only. Support routes do not load this file.

The selected design route owns the combined design/support work for
`analysis_execution`. Support routes provide analytic guidance inside the
selected design scope. The design route is responsible for any final
`artifact_records` write when it creates approved output.

## Plan Lookup

Each design route must use its route-index design id, such as
`randomized_assignment`, `single_time_observational`, or
`difference_in_differences`.

Find the matching current-turn `next_step_plan` entry:

```yaml
- id: analysis_execution.<that_design_id>
  support: optional_support
```

If no matching `analysis_execution.<that_design_id>` entry exists, do not
proceed with design-route work. Use the current user message, live project
state, selected design id, and optional support id as the assignment.

## Route Decision

The design route decides what is responsible this turn:

- A user command such as "run it" or "go ahead" is not enough by itself.
  Execution requires an existing `current_status: ready` handoff for the same
  design slot and the same analysis scope.
- Missing, null, or `current_status: requested`: do scope review only; then set
  the slot to `ready` or `blocked`.
- Existing `current_status: ready` plus clear approval of the same scope: run
  the approved analysis and set the slot to `done`.
- `current_status: ready` plus a changed target, model, contrast, output, data
  source, or claim boundary: revise the scope instead of executing.
- `current_status: blocked` plus user-provided repair, clarification, or revised
  scope: re-evaluate the same design slot; set it to `ready` if the blocker is
  resolved, or keep it `blocked` with updated summary and questions.
- `current_status: done` plus a new or changed analysis request: prepare or
  revise scope feedback instead of reusing the completed output as approval.
- Block when the requested analysis cannot responsibly be proposed or executed.

New or changed analysis requests should become scope feedback first, not silent
execution, even when the user uses execution language.

## Scope Feedback

For scope feedback, do not run analysis, create output folders, append
`artifact_records`, or set `project_summary.analysis_output: exist`. Write the
handoff only in `council_chamber.analysis_execution.<that_design_id>`.

If an older live YAML lacks `council_chamber.analysis_execution` or the design
slot, create the mapping or slot with `last_updated`, `current_status`,
`support`, `summary`, `questions_for_user`, and `feedback_to_route`.

Set `council_chamber.analysis_execution.<that_design_id>.last_updated` to the
current local time. Use one of these handoff statuses:

- `current_status: requested` only for a selected scope review that has not
  finished yet; a missing or null slot should be treated as `requested`.
- `current_status: ready` when the scope can be presented for approval.
- `current_status: blocked` when the scope cannot responsibly be proposed.
- `current_status: done` when approved analysis output was created.
- `support`: the selected support route id from the active route entry, or
  `null`.
- `summary`: one compact description of the proposed or blocked analysis.
- `questions_for_user`: 1-3 questions, choices, or approval points for
  `team_lead` to surface.
- `feedback_to_route`: 0-2 route-facing notes about fit, needed review,
  implementation cautions, or why the selected route is or is not suitable.

Keep the handoff compact and cover design fit, support-route role, required
inputs, estimand or target contrast, diagnostics, planned outputs, and claim
boundary only as needed.

Do not store shallow analysis scope in `discovery_sidecar`, `report_assembly`,
fake or pending `artifact_records`, output folders, or `project_summary`.

## Approved Execution

When execution is approved, run the user-approved `analysis_execution` task and
keep support work inside the selected design scope.

Minor in-scope adjustment: if a practical execution adjustment is needed and it
does not change the estimand, data source, model family, main output, or claim
boundary, continue and document the rationale in the output note/manifest and
`artifact_records.summary`.

Required material change: if completing the approved task would require
changing the estimand, data source, model family, main output, or claim
boundary, do not execute the changed version silently. Stop and update
`council_chamber.analysis_execution.<that_design_id>` with `current_status:
blocked` or `current_status: ready`, the selected `support`, plus compact
`summary`, `questions_for_user`, and `feedback_to_route` explaining the required
change, why it matters, and what approval or clarification is needed.

## Artifact Records Write

Append `artifact_records` only after approved execution creates an output
location. Do not append `artifact_records` for scope feedback, readiness review,
planning notes, or verbal-only work.

When execution creates output, append exactly one compact entry:

```yaml
artifact_records:
  - route: analysis_execution
    location: "output/analysis_name"
    created_at: "HH:MM:SS"
    design: selected_design
    support: optional_support_or_null
    summary: "Short summary of the work and findings, including limitations or suggested additional work."
```

The `location` value should be one meaningful subfolder directly under
`output/`, not a route-specific nested path and not a timestamp-only folder. Use
a short stable slug tied to the approved work. Do not list individual files in
`artifact_records`; put detailed files, notes, diagnostics, and manifests inside
that location if needed.

After execution creates output, also refresh
`council_chamber.analysis_execution.<that_design_id>` with `current_status:
done`, the selected `support`, a compact output `summary`,
`questions_for_user` for the next analytical choice, and `feedback_to_route` only
for real follow-up review needs.

Do not update `project_summary` or `next_step_plan`; `team_lead` updates
aggregate state after route work.
