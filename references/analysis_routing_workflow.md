# Analysis Routing Workflow

Load this reference only for analysis requests, approval or revision of an
analysis scope, method design/support selection, or recent
`analysis_execution` chamber feedback.

## Routing Role

Use this file only after route selection has inferred an in-scope analysis
intention. The router selects a valid `analysis_execution.<design_id>` route
with optional support. The selected design route decides whether the current
turn calls for scope preparation, revision, blocked feedback, or approved
execution.

Do not put scope status, mode, task text, or approval state in
`next_step_plan`.

## Existing Analysis Feedback

Read `council_chamber.analysis_execution` as a mapping of design ids to current
analysis handoffs. For each relevant design slot, review `current_status`,
`support`, `summary`, `questions_for_user`, and `feedback_to_route`.

Status meanings: `requested` means scope review is unfinished or the slot is
missing; `ready` means reviewed and waiting for user approval; `blocked` means
clarification, repair, or fallback is needed; `done` means analysis output was
created.

Decision rules:

- If the user continues or approves the most recent relevant `ready` slot,
  route `analysis_execution.<design_id>` with that slot's `support` if valid.
- If multiple `ready` slots exist, prefer the most recent relevant slot unless
  the user points to another one.
- If the user changes the causal model, contrast, data source, output, or claim
  boundary, do not approve the old scope; route the new work normally.
- If the relevant slot is missing, unknown, invalid, or method fit changed
  without a clear design/support route, route `causal_check` or `team_lead`
  instead of guessing.
- If no current analysis route can reasonably match the user's intent, plan
  only `team_lead`.

## Route Recommendation Rules

- Check `causal_facts.analysis_readiness` before route recommendations.
- If analysis readiness is missing or `not_ready`, plan `causal_check`.
- If analysis readiness is `blocked`, plan only `team_lead` for boundary
  synthesis.
- For causal design routes, create `analysis_execution.<design_id>` only when
  `recommended_method_routes` includes one loadable item with that design id and
  `category: design`.
- If `support` is non-null, create `analysis_execution.<design_id>` only when
  `recommended_method_routes` includes a loadable item with that support ID and
  `category: support`.
- Treat null IDs, non-loadable IDs, missing category, support-only
  recommendations, or multiple competing design recommendations as malformed;
  plan `causal_check` or `team_lead`.
- If the recommendation has `id: descriptive_association`, create
  `analysis_execution.descriptive_association` only when
  `causal_facts.analysis_readiness: limited` and route cautions or
  `support_status` explicitly say causal claims are not supported.
- If the recommendation is not loadable, plan only `team_lead` for boundary
  synthesis.

## Plan Entry

Use this shape:

```yaml
next_step_plan:
  - id: analysis_execution.<design_id>
    support: optional_support_or_null
  - id: team_lead
```

The selected design route reads the current user message and live state to
decide whether to prepare/revise scope feedback or execute approved work.
