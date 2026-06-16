# Route Selection Workflow

## Purpose

Use this compact reference only to build the ordered `next_step_plan` for the
current turn. Keep route selection silent unless there is a blocker.

Route selection is mandatory for every causal-consultant project response. Do
not answer, analyze, draft, inspect files, or create outputs directly from the
user request; first write the `next_step_plan` fragment, apply it with
`scripts/state_next_step_plan.py --state project_state.yaml set-active --from-file <plan-fragment>`,
then load and run the planned route reference.

The router initializes `project_state.yaml`, reads `route_index.yaml`, applies
the complete assignment list through the plan helper, loads planned
non-`team_lead` references first, then loads `team_lead` exactly once as the
final planned reference.

## Inputs

Read these before planning:

1. The current user message.
2. `project_state.yaml`, initialized through `scripts/init_project_state.py`.
3. `references/route_index.yaml`.

Do not load `references/method_route_catalog.yaml` from the router. Only
`causal_check` loads the detailed method catalog when method recommendation is
needed.

## Conditional Routing References

Load conditional routing references only when needed:

- `references/report_routing_workflow.md`: report requests, report-scope
  approval, reviewer-facing writing, limitations wording, report conversion, or
  any pending `report_writer` entry.
- `references/analysis_routing_workflow.md`: analysis execution requests,
  approval of a pending analysis scope, method design/support selection, or any
  pending `analysis_execution` entry.

If neither condition applies, do not load these files.

## Allowed Plan Shapes

Always write `next_step_plan` as a YAML list fragment and apply it through the
plan helper before loading any planned route reference. Use only these plan
shapes.

Team-lead-only:

```yaml
next_step_plan:
  - id: team_lead
    task: "review the turn, update aggregate state if needed, and respond"
```

One core route plus team lead:

```yaml
next_step_plan:
  - id: data_audit | domain_expert | causal_check | causal_discovery | report_writer
    request: "what the user instructed or approved"
    task: "concrete assignment for this route"
    mode: shallow | deep
    report_precheck: false | true
  - id: team_lead
    task: "review route work, update aggregate state if needed, and respond"
```

Use `report_precheck` only on `report_writer` entries. Core routes such as
`data_audit`, `domain_expert`, `causal_check`, and `causal_discovery` use only
`mode: shallow | deep`.

Analysis execution plus team lead:

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

Strict shape rules:

- `team_lead` is always last.
- Team-lead-only plans have exactly one entry.
- Exploration/report plans have at most one core route before `team_lead`.
- Analysis plans have exactly one `analysis_execution` entry before
  `team_lead`.
- Do not mix core routes and `analysis_execution`.
- `team_lead` entries may contain only `id` and `task`.
- Core route entries may contain only `id`, `request`, `task`, `mode`, and
  `report_precheck` for `report_writer`.
- `analysis_execution` entries may contain only `id`, `design`, `support`,
  `task`, `mode`, and `analysis_precheck`.

Core routes are `data_audit`, `domain_expert`, `causal_check`,
`causal_discovery`, and `report_writer`.

Method routes are loadable analysis references listed under `method_routes` in
`route_index.yaml`. Design routes go in `analysis_execution.design`; support
routes go in `analysis_execution.support`.

Do not write detailed route payloads in `next_step_plan`. The planned route
writes findings, blockers, run summaries, and output locations into its
route-owned section. Routes append `artifact_records` only when they actually
create durable output.

## Routing Priority

Apply these rules in order.

1. If `project_state.yaml` cannot be read as YAML, plan only `team_lead`.
2. If the current turn clearly approves an existing pending shallow
   `report_writer` or `analysis_execution` scope already present in
   `project_state.yaml`, route the approved work directly: `report_writer` with
   `mode: deep` and `report_precheck: true`, or `analysis_execution` with
   `mode: deep` and `analysis_precheck: true`, then `team_lead`.
3. If the current turn needs report routing, load
   `references/report_routing_workflow.md` and follow it.
4. If the current turn needs analysis execution routing, load
   `references/analysis_routing_workflow.md` and follow it.
5. If the user approves or continues a prior core recommendation, route to the
   referenced core route when it clearly names one route.
6. During exploration, choose exactly one core route that can make the most
   useful state update.
7. Use only `team_lead` when no route can make a meaningful state update or the
   turn is meta, setup, boundary-only, approval-only, synthesis-only,
   outside-scope, or no-action.

For cross-turn core approvals:

- Treat short approvals such as "yes", "do that", "run it", "go ahead", or
  "use that option" as referring to the most recent actionable core-route
  recommendation in `council_chamber` or `discovery_sidecar.reviewer_requests`.
- If the approval clearly refers to an existing pending shallow `report_writer`
  or `analysis_execution` scope already present in `project_state.yaml`, route
  that approved work directly in deep mode.
- If the user clearly changes or adds work instead of approving the pending
  scope, route the new work normally.
- If the message could be approval or a changed request and the intended action
  is unclear, plan only `team_lead` to clarify.
- Route only when the prior item clearly names or implies one core route:
  `data_audit`, `domain_expert`, `causal_check`, `causal_discovery`, or
  `report_writer`.
- Use the prior recommendation text as `request` context and write a compact
  `task` that states what the route should inspect, update, or review.
- Use `shallow` by default for core routes. Use `deep` when the routed task
  itself calls for fuller source review, actual data/artifact inspection,
  bounded discovery work, or approved report writing/revision/conversion.
- If the approval could refer to multiple routes and the user did not identify
  one, plan only `team_lead` to summarize the options and ask the user to
  choose.

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
  `causal_check` in `deep` mode on the next substantive analysis-planning turn.

Exploration can become complete only when `data_facts.data_checked`,
`domain_knowledge.domain_checked`, and `causal_facts.causal_checked` are all
`passing` or `limited`. This does not authorize execution by itself.

## Mode Summary

Use:

- `shallow`: compact check, intake, readiness review, scope planning, or bounded
  recommendation from current state.
- `deep`: fuller review, source-grounded domain work, detailed analysis
  preparation, approved report writing/revision/conversion, or approved method
  execution.

Core route mode notes:

- `data_audit`: shallow audits structure, timing, leakage, dependencies,
  missingness, support, and validity. Deep requires actual data and a task that
  calls for exploratory causal-preparation analysis.
- `causal_discovery`: shallow scopes graph questions or reviews existing graph
  artifacts; deep requires actual data or named discovery artifacts.
- `causal_check`: shallow frames the causal question and missing facts; deep
  integrates inspected data facts with design/support recommendations.
- `domain_expert`: deep is for extensive source-grounded review; otherwise use
  shallow.
- `report_writer`: load `report_routing_workflow.md`.
- `analysis_execution`: load `analysis_routing_workflow.md`.

Only shallow `data_audit` may create durable output, and only when actual data
or files exist and a useful audit artifact is created. All other shallow work is
feedback, readiness review, planning, or drafting state only.

## Do Not Do During Route Selection

- Do not build the final answer.
- Do not update durable route sections.
- Do not write detailed report scope, report outlines, analysis plans, analysis
  payloads, or route findings into `next_step_plan`.
- Do not load the detailed method catalog.
- Do not exceed the allowed plan shapes.
