# Route Selection Workflow

## Purpose

Use this compact reference only to build the current-turn `next_step_plan`.
Route selection is mandatory for every substantive turn. Do not answer, analyze,
draft, inspect files, or create outputs directly from the user request; first
write `next_step_plan`, then load and run the planned route reference. Keep
route selection silent unless there is a blocker.

The router chooses who works this turn. It does not decide a member's internal
workflow lane, handoff status, output status, or final answer.

## Inputs

Read these before planning:

1. The current user message.
2. The immediately previous user-facing response, especially `[? Next Steps]`,
   `[+ Consultant Options]`, and `[! Boundary]`.
3. `project_state.yaml`, initialized through `scripts/init_project_state.py`.
4. `references/route_index.yaml`.

Do not load `references/method_route_catalog.yaml` from the router. Only
`causal_check` loads the detailed method catalog when method recommendation is
needed.

## Conditional Routing References

Load conditional routing references only after the intention check below selects
that branch:

- `references/report_routing_workflow.md`: report requests, report approval,
  reviewer-facing writing, limitations wording, report output, or recent
  report-writer chamber feedback.
- `references/analysis_routing_workflow.md`: analysis requests, approval or
  revision of an analysis scope, method design/support selection, or recent
  analysis-execution chamber feedback.

If neither condition applies, do not load these files.

## Allowed Plan Shapes

Always write `next_step_plan` as a YAML list before loading any planned route
reference. The list is current-turn routing only, not a durable queue or deck.

Team-lead-only:

```yaml
next_step_plan:
  - id: team_lead
```

One core route plus team lead:

```yaml
next_step_plan:
  - id: data_audit | domain_expert | causal_check | causal_discovery | report_writer
  - id: team_lead
```

Analysis execution plus team lead:

```yaml
next_step_plan:
  - id: analysis_execution.<design_id>
    support: optional_support_or_null
  - id: team_lead
```

Strict shape rules:

- `team_lead` is always last.
- Team-lead-only plans have exactly one entry.
- Exploration/report plans have at most one core route before `team_lead`.
- Analysis plans have exactly one `analysis_execution.<design_id>` entry before
  `team_lead`.
- Do not mix core routes and `analysis_execution`.
- `team_lead` and core route entries contain only `id`.
- `analysis_execution.<design_id>` entries contain only `id` and `support`.
- `<design_id>` must be a design route id listed in `route_index.yaml`.
- `support` must be `null` or a support route id listed in `route_index.yaml`.

Core routes are `data_audit`, `domain_expert`, `causal_check`,
`causal_discovery`, and `report_writer`.

Method routes are loadable analysis references listed under `method_routes` in
`route_index.yaml`. Design routes are encoded in the route id as
`analysis_execution.<design_id>`; support routes go in the `support` field.

Do not write detailed route payloads, scope cards, approval flags, mode flags,
or route findings into `next_step_plan`. Route-owned sections and
`council_chamber` hold the useful details after the route works.

## Routing Priority

First infer the user's current intention from the current message, the previous
`[? Next Steps]`, `[+ Consultant Options]`, `[! Boundary]`, and the current YAML
state. Route from that inferred intention, not from keywords alone.

Apply these rules in order:

1. If `project_state.yaml` cannot be read as YAML, plan only `team_lead`.
2. If the intention is outside the current project or causal scope, or needs no
   project-state update, plan only `team_lead`.
3. If the intention is unclear, could refer to multiple prior options, rejects
   the options without giving a new in-scope request, or is only meta, setup,
   boundary, synthesis, or no-action, plan only `team_lead`.
4. If the intention is to continue or approve a prior active choice, route the
   matching work only when it remains inside the project and causal boundary.
   For analysis or report execution, a matching `current_status: ready` handoff
   must exist.
5. If the intention is to revise or add work based on the previous user-facing
   headings, route the changed or added work normally inside the current project
   and causal boundary.
6. If the intention is new project-scope information or a new in-scope request,
   route the relevant member or work path using the selection rules below.
7. If no route can make a meaningful state update, plan only `team_lead`.

When a message asks for several in-scope things at once, infer the user's
dominant current intention from the prior headings and current wording, then
route only the first bounded route that can make a useful state update this
turn.

For in-scope work selection after the conversation match:

- If a clear strong preference stays inside causal, data, discovery, or report
  boundaries, route that preference.
- If user-provided information still lacks relevant core review, route the most
  relevant unreviewed or stale core member.
- If there is no clear preference, route the most useful next review or work
  route for the current state.
- Load the report or analysis routing reference only when the selected branch is
  report or analysis work.

For exploration:

- Plan `data_audit` when actual data, a file path, schema, variables, sample
  rows, a data dictionary, or a concrete dataset description is provided. Also
  plan it for timing, leakage, missingness, dependence, support/positivity, data
  validity, or feasible restructuring questions.
- Plan `causal_check` when the user gives a causal question, claim, exposure,
  intervention, outcome, estimand, assumption, target analysis, or method idea.
- Plan `domain_expert` when the user gives a domain, setting, population,
  construct, measurement, endpoint, integration issue, field-practice question,
  common-practice question, precedent, reporting norm, or standard outcome.
- Plan `causal_discovery` when the request is about graph structure, variable
  neighborhoods, discovery artifacts, graph-informed feature work, local
  screening, time-series graph exploration, or reviewing discovery output.
- Prefer missing checks before improving limited checks.
- If multiple checks are missing, choose the one most directly connected to the
  user's current request.
- After `data_audit` inspects actual data and records concrete facts, prefer
  `causal_check` on the next substantive analysis-planning turn.

Analysis scope routing requires the core review gate: `data_facts.data_checked`,
`domain_knowledge.domain_checked`, and `causal_facts.causal_checked` are each
`passing` or `limited`, and `causal_facts.analysis_readiness` is `ready` or
`limited`. Satisfying this gate only allows analysis scope routing; execution
still requires a matching `current_status: ready` analysis handoff and user
approval.

## Do Not Do During Route Selection

- Do not build the final answer.
- Do not update durable route sections.
- Do not write detailed report scope, report outlines, analysis plans, analysis
  payloads, approval state, or route findings into `next_step_plan`.
- Do not load the detailed method catalog.
- Do not exceed the allowed plan shapes.
