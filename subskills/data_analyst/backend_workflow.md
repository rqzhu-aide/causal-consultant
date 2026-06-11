# Data Analyst Backend Workflow

This file governs a routed `data_analyst` call. Use `SKILL.md` for data
reasoning and this file for the live-state write contract.

## Loading Order

On invocation, use:

1. local `SKILL.md`;
2. this backend file;
3. `../../references/council_chamber_contract.md`;
4. the compact routed payload;
5. `state_file_path` and any `refs`.

Do not load main's full backend, the full conversation, unrelated subskills, or
unrelated artifacts.

## Routed Payload

```yaml
action_id: null
agent_called: data_analyst
mode: feedback_only
action_goal: null
state_file_path: outputs/project_state.yaml
refs: []
```

`action_goal` carries the task intent. Internal reasoning lanes below are
guidance only; they are not payload fields or live YAML fields.

## Mode Contract

- `feedback_only`: reason from live YAML and routed summaries; no raw-file
  inspection or new artifacts.
- `bounded_inspection`: inspect only named files, fields, schemas, codebooks,
  notes, manifests, or artifacts in `refs`; no new analysis artifacts.
- `execution_authorized`: run only the confirmed data inventory, profiling,
  schema, or report-data-asset task in the selected step's `execution` object.
  Use `execution.expected_outputs` to decide which source, note, manifest,
  result artifacts, or data-specific outputs to produce.

## Read Contract

Read `state_file_path`. Shallow-read the full durable state. Deep-read only
data-relevant material from `refs` or owner sections when it affects sources,
units, variables, timing, support, quality, provenance, processing
possibilities, analysis support, or report data assets.

## Write Contract

Write only:

- `data_facts.status`
- `data_facts.items`
- `data_facts.questions`
- one current `council_chamber` entry

Use `data_facts.items` for reusable data evidence. Each item should include a
compact `kind`, such as `source`, `observation_structure`, `variable_role`,
`timing`, `quality_support`, `processing_possibility`, `artifact`, or
`data_question`. Add optional `source_status`, `inspection_status`,
`core_relevance`, and `refs` when useful.

After writing data evidence, follow
`../../references/council_chamber_contract.md`: create or update one current
entry keyed by `id: data_analyst.<action_id>`, then stop.

## Reasoning Lanes

| Lane | Question Answered | Required Output Emphasis | Forbidden Drift | Stop Condition |
| --- | --- | --- | --- | --- |
| data reality scan | What sources, row units, IDs, time fields, provenance, and missing data facts are present? | `source`, `observation_structure`, `timing`, and `data_question` items. | Do not choose methods or validate causal claims. | Stop after factual inventory and any bounded data/source options. |
| variable role card | What candidate causal-analysis roles are observed, proxy-only, constructible, missing, ambiguous, or unusable? | `variable_role`, timing, measurement, missingness, comparison, design, grouping, and factual blocker items. | Do not validate adjustment or select estimands. | Stop after role facts and any bounded data/method/gatekeeper options. |
| processing possibilities | What data-shape transformations could make a candidate analysis possible, and what would they change? | `processing_possibility` items with creates_or_changes, helps_with, caution, and reviewer relevance. | Do not execute transformations or treat data-shape cues as method choices. | Stop after feasible transformations and bounded check options. |
| analysis support | Does the active planned unit have the exact data support it claims? | Exact fields, sample constraints, missingness/support, design fields, and data blockers for that unit only. | Do not broaden into modeling, diagnostics, reports, or unplanned artifacts. | Stop after confirming, limiting, or blocking the active unit's data support. |

## Boundaries

`data_analyst` does not choose the final method, validate identification,
strengthen causal claims, run causal models, create reports, or activate other
subskills. In `execution_authorized`, it creates only data inventory,
profiling, schema, role-card, or report-data-asset outputs implied by the active
step's `action_goal` and `execution.expected_outputs`, inside
`execution.analysis_dir`. Typical `result_artifacts` include profile tables,
schema summaries, missingness/support diagnostics, and data role assets; typical
`subskill_specific` outputs include compact data inventory or role-card assets.
