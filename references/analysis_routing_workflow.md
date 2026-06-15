# Analysis Routing Workflow

Load this reference only for analysis execution requests, approval of a pending
analysis scope, method design/support selection, or pending
`analysis_execution` work.

## Routing Rules: No Existing Analysis Execution Work

- If there is no remaining `analysis_execution` item in `next_step_plan`, an
  analysis execution request starts as shallow scope/readiness work.
- Plan `analysis_execution` with `analysis_precheck: false` and `mode: shallow`,
  even when the user asks to run now.

## Routing Rules: Existing Analysis Execution Work

- If there is a remaining shallow `analysis_execution` item in `next_step_plan`
  and the user clearly approves that existing analysis scope, route
  `analysis_execution` directly with `mode: deep` and
  `analysis_precheck: true`.
- If there is a remaining `analysis_execution` item but the user changes or adds
  work instead of approving it, route the new work normally.
- If the approval target is ambiguous, plan only `team_lead` to clarify.
- Match method recommendations to `route_index.yaml` by exact `id`.
- Select exactly one loadable design route and at most one loadable support
  route. Strongly prefer one recommended support route; use
  `statistical-validity` as the default support unless another recommended
  support is more immediately relevant.
- Do not create support-only execution plans; route to `causal_check` when a
  support tool is requested without a settled design.
- If a named method has not been recommended, plan `causal_check` to evaluate
  fit.

## Readiness Rules

- Check `causal_facts.analysis_readiness` before method readiness.
- If analysis readiness is missing or `not_ready`, plan `causal_check`.
- If analysis readiness is `blocked`, plan `team_lead` to explain that analysis
  execution is blocked.
- For causal design routes, create `analysis_execution` only when the design
  recommendation has `readiness: precheck_ready` or `readiness: limited`.
- If `support` is non-null, create `analysis_execution` only when the support
  recommendation has the same support ID, `category: support`, and readiness
  `precheck_ready` or `limited`.
- If a recommendation has `id: null`, missing readiness, free-text readiness,
  `readiness: not_ready`, or `readiness: blocked`, treat it as malformed; plan
  `causal_check` or `team_lead`.
- If the recommendation has `id: descriptive_association`, create
  `analysis_execution` only when `causal_facts.analysis_readiness: limited`,
  method readiness is exactly `limited`, and the recommendation explicitly says
  causal claims are not supported.
- If the recommendation is not loadable, plan `team_lead` to explain that it can
  be discussed but not executed as a method route yet.

## Analysis Mode Rules

- `analysis_precheck: false` requires `mode: shallow` and readiness/precheck
  only; it must not create output folders, `artifact_records`, or analysis
  output.
- `analysis_precheck: true` requires `mode: deep` and approved execution only.
- Clear approval of an existing pending shallow analysis scope can route
  approved execution in the same user turn.

## Plan Entry

Use this shape:

```yaml
next_step_plan:
  - id: analysis_execution
    design: selected_design
    support: optional_support_or_null
    task: "shared analysis assignment"
    mode: shallow | deep
    analysis_precheck: false | true
  - id: team_lead
    task: "review analysis work, update aggregate state if needed, and respond"
```

For clear approval of an existing pending shallow analysis scope already present
in `project_state.yaml`, use the same shape with `mode: deep` and
`analysis_precheck: true`.
