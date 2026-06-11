# Domain Expert Backend Workflow

This file governs a routed `domain_expert` call. Use `SKILL.md` for domain
reasoning and this file for the live-state write contract.

## Loading Order

On invocation, use local `SKILL.md`, this backend file,
`../../references/council_chamber_contract.md`, the compact routed payload,
`state_file_path`, and `refs`. Do not load main's full backend, the full
conversation, unrelated subskills, or unrelated artifacts.

## Routed Payload

```yaml
action_id: null
agent_called: domain_expert
mode: feedback_only
action_goal: null
state_file_path: outputs/project_state.yaml
refs: []
```

`action_goal` carries the task intent. Internal reasoning lanes below are
guidance only; they are not payload fields or live YAML fields.

## Mode Contract

- `feedback_only`: reason from live YAML and routed summaries.
- `bounded_inspection`: inspect only named source passages, codebooks, notes,
  figures, tables, reports, artifacts, or citations in `refs`.

`domain_expert` does not use `execution_authorized`.

## Read Contract

Read `state_file_path`. Shallow-read the full durable state. Deep-read only
domain-relevant material from `refs` or owner sections when it affects construct
meaning, endpoint conventions, mechanisms, precedent, interpretation
boundaries, method clues, validity wording, discovery plausibility, or report
relevance.

## Write Contract

Write only:

- `domain_records.status`
- `domain_records.items`
- `domain_records.questions`
- one current `council_chamber` entry

Use `domain_records.items` for reusable domain evidence. Each item should
include a compact `kind`, such as `construct_meaning`, `domain_precedent`,
`technique_cue`, `interpretation_boundary`, `method_route_clue`,
`report_relevance`, or `domain_question`. Add optional `source_status`,
`core_relevance`, and `refs` when useful.

After writing domain evidence, follow
`../../references/council_chamber_contract.md`: create or update one current
entry keyed by `id: domain_expert.<action_id>`, then stop.

## Reasoning Lanes

| Lane | Question Answered | Required Output Emphasis | Forbidden Drift | Stop Condition |
| --- | --- | --- | --- | --- |
| construct clarification | What do the exposure, outcome, comparator, population, setting, timing, measurement, coding, and proxies mean? | Construct meanings, mechanisms, measurement caveats, and domain questions. | Do not infer data support, choose methods, or validate causal claims. | Stop after domain meanings and any bounded clarification/check options. |
| domain precedent scan | What common analytic strategies, endpoints, comparators, exclusions, transformations, dependence concerns, diagnostics, or reporting norms matter? | Precedents, technique cues, advisory route clues, report relevance, and source-status labels. | Do not treat precedent as proof, run broad source review, or authorize execution. | Stop after high-value strategy clues and bounded source/data/method options. |
| interpretation boundary | What would results, nulls, subgroup patterns, diagnostics, or recommendations mean or not mean? | Interpretation boundaries, misleading readings, causal wording cautions, practical decision limits, and report relevance. | Do not validate causality, rewrite reports, or strengthen claims. | Stop after boundaries and any repair, gatekeeper, report, or planning options. |

## Boundaries

`domain_expert` must not inspect beyond routed scope, run broad literature
reviews, choose the final method, validate identification, run analysis, generate
reports, or activate other subskills. A bounded source check is allowed only
when main routes that exact inspection task.
