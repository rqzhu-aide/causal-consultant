# Route Selection Workflow

## Purpose

Use this reference only to build the ordered `next_step_plan` for the current turn.

The router runs `scripts/init_project_state.py --project-root <project root>` to initialize `project_state.yaml` if needed, reads `route_index.yaml`, writes the complete assignment list, loads planned non-`team_lead` references first, then loads `team_lead` exactly once as the final planned reference. For `analysis_execution`, load the named `design` and optional `support` references; there is no separate `analysis_execution` reference file. `team_lead` owns synthesis plus the final user-facing answer.

Use this vocabulary consistently:

- `analysis plan` or `study plan`: the causal/statistical work plan owned by `causal_check`, `analysis_execution`, design routes, and support routes.
- `report scope`: the shallow `report_writer` precheck package that proposes what a report would cover before approval.
- `approved report task`: the deep `report_writer` assignment after the user approves the report scope.
- `report output`: the created Markdown, HTML, section draft, reviewer response, or other report artifact.

## Inputs

Read these before planning:

1. The current user message.
2. `project_state.yaml`, initialized first through `scripts/init_project_state.py --project-root <project root>` if needed.
3. `references/route_index.yaml`.

Do not load `references/method_route_catalog.yaml` from the router. Only `causal_check` loads the detailed method catalog when method recommendation is needed.

## Allowed Plan Shapes

Always write `next_step_plan` as a YAML list before loading any planned route reference.

Use only these plan shapes.

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

Use `report_precheck` only on `report_writer` entries. Use
`analysis_precheck` only on `analysis_execution` entries. Core routes such as
`data_audit`, `domain_expert`, `causal_check`, and `causal_discovery` use only
`mode: shallow | deep`; they do not have precheck fields.

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
- Analysis plans have exactly one `analysis_execution` entry before `team_lead`.
- Do not mix core routes and `analysis_execution`.
- `team_lead` entries may contain only `id` and `task`.
- Core route entries may contain only `id`, `request`, `task`, `mode`, and `report_precheck` for `report_writer`.
- `analysis_execution` entries may contain only `id`, `design`, `support`, `task`, `mode`, and `analysis_precheck`.
- `analysis_execution` requires exactly one loadable `design`, no more than one loadable `support`, and `analysis_precheck`.

Core routes are `data_audit`, `domain_expert`, `causal_check`, `causal_discovery`, and `report_writer`.

Method routes are loadable analysis references listed under `method_routes` in `route_index.yaml`. Design routes go in `analysis_execution.design`; support routes go in `analysis_execution.support`.

Do not write detailed route payloads in `next_step_plan`. The planned route writes findings, blockers, run summaries, and output locations into its route-owned section. Routes append `artifact_records` only when they actually create durable output.

## Routing Priority

Apply these rules in order.

1. If `project_state.yaml` cannot be read as YAML, plan only `team_lead`.
2. If the user requests Markdown-to-HTML report conversion and the state already has `project_summary.report_output: exist`, `report_assembly.current_format: md`, `council_chamber.report_writer.current_status: produced`, and an actual `.md` report file from prior `report_writer` work in a recorded report output location, plan `report_writer` with `report_precheck: true` and `mode: deep`.
3. Preserve an existing pending `report_writer` or `analysis_execution` entry only when the user approves it, continues it, gives no new substantive route material, or otherwise does not change that gated request. If the user provides new data, clarification, domain facts, causal facts, discovery material, or a changed report/analysis task, route the new material under the rules below.
4. If the user approves or continues a prior core recommendation, route to the referenced core route.
5. If the user requests new report work, including report-scope setup, a study-planning report, outline structure, results reporting, manuscript/report text, reviewer-facing material, report polishing, rewriting, safer causal wording, limitations language, or claim-boundary wording, plan `report_writer` with `report_precheck: false` and `mode: shallow`.
6. If the user requests analysis execution, use `analysis_execution` only when exploration is complete, `causal_facts.analysis_readiness` is `ready` or `limited`, and `causal_facts.recommended_method_routes` includes one recommended loadable design route with method readiness `precheck_ready` or `limited`. Use `descriptive_association` only as an explicit non-causal fallback with method readiness `limited`. Otherwise plan `causal_check` or `team_lead` if causal_check already blocked execution.
7. During exploration, choose exactly one core route that can make the most useful state update.
8. Use only `team_lead` when no route can make a meaningful state update or the turn is meta, setup, boundary-only, approval-only, synthesis-only, or no-action.

When preserving pending work:

- Missing `report_precheck` means `false` and `mode: shallow`.
- Missing `analysis_precheck` means `false` and `mode: shallow`.
- Preserving means using the pending gated entry as the active plan for this turn. Do not preserve it as the active plan when the current message provides new substantive route material; route the new material instead.
- If the user clearly approves a pending report scope, preserve the report entry for this turn; `team_lead` changes it to `report_precheck: true` and `mode: deep` for the next turn.
- If the user clearly approves a pending analysis scope, preserve the analysis entry for this turn; `team_lead` changes it to `analysis_precheck: true` and `mode: deep` for the next turn.
- If `report_precheck: true` or `analysis_precheck: true`, keep `mode: deep`.
- Do not add any other core route or `analysis_execution` while preserving pending gated work.

For cross-turn core approvals:

- Treat short approvals such as "yes", "do that", "run it", "go ahead", or "use that option" as referring to the most recent actionable core-route recommendation in `council_chamber` or `discovery_sidecar.reviewer_requests`.
- Route only when the prior item clearly names or implies one core route: `data_audit`, `domain_expert`, `causal_check`, `causal_discovery`, or `report_writer`.
- Use the prior recommendation text as `request` context and write a compact `task` that states what the route should inspect, update, or review.
- Use `shallow` by default for core routes. Use `deep` when the current routed
  task itself calls for fuller source review, actual data/artifact inspection,
  bounded discovery work, or approved report writing/revision/conversion. Do
  not add a precheck field to core routes.
- If the approval could refer to multiple routes and the user did not identify one, plan only `team_lead` to summarize the options and ask the user to choose.
- If the prior item points to `report_writer`, keep the report gate rules: new report writing, report-scope setup, revision, outline, safer-wording, limitations, or reviewer-facing work uses `report_precheck: false`; approved Markdown-to-HTML conversion may use `report_precheck: true` when an actual `.md` report file from prior `report_writer` work exists.
- If the prior item points to method execution rather than a core route, follow the analysis execution rules instead of creating a core-route entry.

For analysis execution requests:

- New analysis requests use `analysis_precheck: false` and `mode: shallow`, even when the user asks to run now.
- Approved preserved analysis uses `analysis_precheck: true` and `mode: deep`.
- Match method recommendations to `route_index.yaml` by exact `id`.
- Select exactly one `design` route and at most one `support` route. Strongly prefer selecting one recommended support route; use `statistical-validity` as the default support unless another recommended support is more immediately relevant.
- Do not create support-only execution plans; route to `causal_check` when a support tool is requested without a settled design.
- If a named method has not been recommended, plan `causal_check` to evaluate fit.
- Check `causal_facts.analysis_readiness` before method readiness. If it is missing or `not_ready`, plan `causal_check`. If it is `blocked`, plan `team_lead` to explain that analysis execution is blocked.
- For causal design routes, create `analysis_execution` only when the design recommendation has `readiness: precheck_ready` or `readiness: limited`.
- If `support` is non-null, create `analysis_execution` only when the support recommendation has the same support ID, `category: support`, and `readiness: precheck_ready` or `readiness: limited`.
- If a recommendation has `id: null`, missing readiness, free-text readiness, `readiness: not_ready`, or `readiness: blocked`, treat it as malformed; plan `causal_check` or `team_lead` and do not create `analysis_execution`.
- If the recommendation has `id: descriptive_association`, create `analysis_execution` only when `causal_facts.analysis_readiness: limited`, method readiness is exactly `limited`, and the recommendation or `causal_facts.support_status` explicitly says causal claims are not supported and the planned or approved work is non-causal association/descriptive analysis.
- If the recommendation is not a loadable method route, plan `team_lead` to explain that it can be discussed but not executed as a method route yet.

For exploration:

- Plan `data_audit` when actual data, a file path, schema, variables, sample rows, a data dictionary, or a concrete dataset description is provided. Also plan `data_audit` when the user asks about variable timing, leakage, missingness, dependence, support/positivity, data validity, whether the data can support an analysis, or what data restructuring could make analysis feasible.
- Plan `causal_check` when the user gives a causal question, claim, exposure, intervention, outcome, estimand, assumption, target analysis, or method idea.
- Plan `domain_expert` when the user gives a domain, setting, population, construct, measurement, endpoint, data integration issue, field-practice question, popular-methods question, common-practice question, current precedent, recent approaches, reporting norms, standard outcomes, or data integration practice.
- Plan `causal_discovery` when the request is about graph structure, variable neighborhoods, discovery artifacts, graph-informed feature work, local screening, time-series graph exploration, or reviewing discovery output.
- Prefer missing checks before improving limited checks.
- If multiple checks are missing, choose the one most directly connected to the user's current request.
- After `data_audit` inspects actual data and records concrete data facts, prefer `causal_check` in `deep` mode on the next substantive analysis-planning turn.

Exploration can become complete only when `data_facts.data_checked`, `domain_knowledge.domain_checked`, and `causal_facts.causal_checked` are all `passing` or `limited`. This does not authorize execution by itself.

## Mode And Gate Rules

Use:

- `shallow`: compact check, intake, readiness review, scope planning, or bounded recommendation from current state.
- `deep`: fuller review, source-grounded domain work, detailed analysis preparation, approved report-writing, approved conversion, or approved method execution.

Only shallow `data_audit` may create durable output, and only when actual data or files exist and a useful audit artifact is created. All other shallow work is feedback, readiness review, planning, or drafting state only; it must not create output folders or `artifact_records`.

Route-specific mode rules:

- `data_audit`: `shallow` audits structure, timing, leakage, dependencies, missingness, support, and validity. Shallow data audit may create durable audit artifacts only when actual data or files exist. Use `deep` only when actual data are available and the routed task calls for exploratory causal-preparation analysis.
- `causal_discovery`: `shallow` scopes graph questions, reviews existing graph artifacts, frames local neighborhoods, or assesses discovery opportunities; it must not create new output folders or `artifact_records`. Use `deep` only when actual data or named discovery artifacts are available and the task supports bounded discovery execution or artifact inspection.
- `causal_check`: use `shallow` before data are available to frame the question, estimand, claim boundary, and missing facts. Use `deep` after `data_audit` inspected actual data and the next substantive turn needs integrated causal assessment or design/support recommendations.
- `domain_expert`: use `deep` for extensive domain-practice search or detailed source-grounded review; otherwise use `shallow`.
- `report_writer`: `report_precheck` belongs only to `report_writer` entries. It gates new report writing, report-scope setup, outlining, revision, safer wording, limitations language, and reviewer-facing work. When `report_precheck: false`, shallow mode may build an approval-ready `report_assembly.planned_structure` but must not create final report output. Markdown-to-HTML conversion may set it directly to `true` when an actual `.md` report file from prior `report_writer` work exists.
- `analysis_execution`: `analysis_precheck: false` requires `mode: shallow` and readiness/precheck only; it must not create output folders, `artifact_records`, or analysis output. `analysis_precheck: true` requires `mode: deep` and approved execution only.

Approval transition and execution/report-writing should happen in separate turns for portability. Markdown-to-HTML conversion of an existing Markdown report file does not need a separate approval turn.

## Do Not Do During Route Selection

- Do not build the final answer.
- Do not update durable route sections.
- Do not write detailed report scope, report outlines, analysis plans, analysis payloads, or route findings into `next_step_plan`.
- Do not load the detailed method catalog.
- Do not exceed the allowed plan shapes.
