# Method Lead Backend Workflow

This file governs a routed `method_lead` call. Use `SKILL.md` for methodological
reasoning and this file for the live-state write contract.

## Loading Order

On invocation, use local `SKILL.md`, this backend file,
`../../references/council_chamber_contract.md`, the compact routed payload,
`state_file_path`, and `refs`. Do not load main's full backend, the full
conversation, unrelated subskills, unrelated artifacts, or hidden lead reasoning.

## Routed Payload

```yaml
action_id: null
agent_called: method_lead
mode: feedback_only
action_goal: null
state_file_path: outputs/project_state.yaml
refs: []
```

`action_goal` carries the task intent. Internal reasoning lanes below are
guidance only; they are not payload fields or live YAML fields.

## Mode Contract

- `feedback_only`: reason from live YAML and routed summaries.
- `bounded_inspection`: inspect only named artifacts, notes, manifests, figures,
  tables, method-task results, or report materials in `refs`.

`method_lead` does not use `execution_authorized`.

## Read Contract

Read `state_file_path`. Shallow-read the full durable state. Deep-read routed or
method-relevant material only when it affects route choice, estimands,
diagnostics, data shape, implementation lane, report assets, post-analysis
review, or method innovation.

Pay special attention to:

- `data_facts.items` and their `core_relevance.method_lead`;
- `domain_records.items` and their route clues or interpretation boundaries;
- `causal_gatekeeper.supported_alternatives` and
  `causal_gatekeeper.claim_strengthening_ideas`;
- `method_task_results` for specialist technical summaries;
- discovery packets and artifacts when exploratory structure affects method
  choice;
- report needs when formulas, diagnostics, figures, tables, or wording
  boundaries matter.

## Write Contract

Write only:

- `method_records.status`
- `method_records.items`
- `method_records.questions`
- one current `council_chamber` entry

Use `method_records.items` for durable method evidence. Each item should include
a compact `kind`, such as `candidate_method`, `estimand`, `data_shape_need`,
`diagnostic_sensitivity`, `implementation_note`, `report_relevance`,
`method_repair`, `method_innovation`, or `method_question`.

Useful item metadata includes `status`, `source_status`,
`current_support_level`, `candidate_subskills`, `likely_specialists`,
`core_relevance`, `claim_boundary`, and `refs`. It is very helpful to name likely
method/task subskills when a specific specialist would help evaluate the idea;
main owns routing.

After writing method evidence, follow
`../../references/council_chamber_contract.md`: create or update one current
entry keyed by `id: method_lead.<action_id>`, then stop.

## Reasoning Lanes

| Lane | Question Answered | Required Output Emphasis | Forbidden Drift | Stop Condition |
| --- | --- | --- | --- | --- |
| method option map | What routes, fallbacks, repairs, or innovations are feasible from current data, domain, validity, discovery, artifact, and report evidence? | Several `candidate_method` or `method_innovation` items in normal cases, with evidence hooks, support level, requirements, diagnostics, likely specialists, claim boundary, and next check. | Do not choose for the user, authorize execution, treat reviewer relevance as a command, or treat gatekeeper alternatives as validity approval. | Stop after method records and one current council opinion with 3-4 high-value options when useful. |
| selected path refinement | What does one selected path require to become coherent and explainable? | Route-specific estimand, assumptions, data shape, diagnostics, implementation lane, fallback policy, report needs, and gatekeeper review need. | Do not broaden into a new route map unless the selected path is blocked. | Stop after refinement items and one council opinion naming proceed, repair, review, or stop. |
| analysis spec draft | What method content belongs in the execution packet for main/user confirmation? | Estimand, analytic population, data shape, estimator/model lane, diagnostics, sensitivities, report assets, limitations, and execution-readiness caveats. | Do not run analysis, create scripts, or present the draft as permission to execute. | Stop after method spec items and one council opinion for main confirmation. |
| specialist routing recommendation | What bounded specialist feedback would most change the method menu? | One prioritized specialist feedback option, or a short set only when a combination is needed, with action goal and refs. | Do not activate the specialist or queue execution. | Stop after council option(s) and any durable method rationale. |

## Boundaries

`method_lead` does not inspect raw data beyond routed scope, run analysis, create
scripts, fit models, generate reports, validate causal claims by itself, or
activate other subskills directly.
