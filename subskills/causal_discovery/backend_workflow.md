# Causal Discovery Backend Workflow

This file governs one routed `causal_discovery` sidecar call. Use `SKILL.md` for
discovery reasoning and this file for mode permissions, execution boundaries,
and live-state writes.

## Loading Order

On invocation, use:

1. local `SKILL.md`;
2. this backend file;
3. `../../references/council_chamber_contract.md`;
4. `references/workflow.md` only when lifecycle, diagnostics, reintegration, or
   closure detail is needed;
5. `references/literature_and_software.md` only when algorithm-family or
   package-lane detail is needed;
6. `assets/discovery_sidecar_output_template.yaml` when a compact packet shape
   helps;
7. the compact routed payload, `state_file_path`, and `refs`.

Do not load main's full backend, the full conversation, unrelated subskills,
unrelated artifacts, or hidden lead reasoning.

## Routed Payload

```yaml
action_id: null
agent_called: causal_discovery
mode: feedback_only
action_goal: null
state_file_path: outputs/project_state.yaml
refs: []
```

`action_goal` carries the discovery question. Internal workflow lanes below are
guidance only; they are not payload fields or live YAML fields.

## Mode Contract

- `feedback_only`: reason about opportunity, scope, diagnostics, reviewer needs,
  and next choices. Do not inspect raw data beyond routed summaries, run code, or
  create artifacts.
- `bounded_inspection`: inspect only named graph artifacts, existing outputs,
  code, manifests, variable lists, settings, or notes in `refs`. Do not run a
  new discovery algorithm or create new discovery artifacts.
- `execution_authorized`: run only the exact confirmed discovery task in
  the selected step's `execution` object; write only outputs implied by
  `execution.expected_outputs` inside `execution.analysis_dir`; update
  `discovery_sidecar`; then stop.

## Read Contract

Read `state_file_path`. Shallow-read the full durable state. Deep-read only
routed or discovery-relevant evidence: data structure, variables, timing,
domain mechanisms, method questions, claim boundaries, prior discovery packets,
artifact paths, graph outputs, diagnostics, and report needs.

## Write Contract

Write only:

- `discovery_sidecar.status`
- `discovery_sidecar.purpose`
- `discovery_sidecar.packets`
- `discovery_sidecar.artifact_paths`
- `discovery_sidecar.reviewer_requests`
- `discovery_sidecar.report_relevance`
- `artifact_index` entries for discovery artifacts created or inspected under
  the routed scope
- one current `council_chamber` entry

For created or inspected artifacts, write concise paths and roles into
`discovery_sidecar.artifact_paths` and matching entries into `artifact_index`
when execution creates new artifacts. After writing discovery evidence, follow
`../../references/council_chamber_contract.md`: create or update one current
entry keyed by `id: causal_discovery.<action_id>`, then stop.

Reviewer requests in `discovery_sidecar` should name the reviewer with
`agent_called`, give the desired `action_goal`, include `refs`, and explain the
`decision_value`.

## Reasoning Lanes

| Lane | Question Answered | Required Output Emphasis | Forbidden Drift | Stop Condition |
| --- | --- | --- | --- | --- |
| discovery opportunity | Is discovery useful enough to offer as a bounded sidecar? | Purpose, graph question, evidence hooks, required prechecks, sidecar status, and next choice. | Do not run code, imply discovery is required, or replace core review. | Update sidecar opportunity and one council opinion. |
| scope design | What exact discovery scope could be confirmed? | Graph target, variables, background knowledge, diagnostics, expected output needs, and return path. | Do not execute, overbroaden variables, or silently choose assumptions. | Update sidecar scope and confirmation/repair option. |
| artifact or graph review | What can be learned from an existing graph, code, diagnostics, or packet? | Provenance, graph target, settings, findings, diagnostics, limitations, reviewer requests, and report support. | Do not rerun discovery or upgrade claims. | Update packet/reviewer requests and one council opinion. |
| discovery execution | What did the authorized run create, and what does it suggest? | Source/note/manifest paths, graph/diagnostic artifacts, packet summary, limitations, reviewer requests, material drift status. | Do not exceed the active execution scope, change algorithm/variables/diagnostics silently, or create final reports. | Write in-scope artifacts under `execution.analysis_dir`, update sidecar, ensure council opinion, stop. |
| reintegration | How should main route or park discovery implications? | Reviewer requests, report relevance, whether main framework is affected, and next action. | Do not mutate core records, methods, adjustment sets, claims, or reports. | Update lifecycle/reviewer requests and one council opinion. |

## Execution Rules

For `execution_authorized`, first verify:

- active planned step calls `causal_discovery`;
- `next_step_plan.confirmed: true`;
- the selected step has `execution.analysis_dir`, `execution.scope`,
  `execution.claim_boundary`, and `execution.expected_outputs`;
- the requested graph target, variable set, algorithm family, diagnostics, and
  outputs match `action_goal` and the selected step's `execution` object.

Interpret `execution.expected_outputs` locally:

- `source`: source script or notebook when code is run.
- `note`: compact technical note or discovery run note.
- `manifest`: run manifest or output inventory.
- `result_artifacts`: graph plots, edge tables, local-neighborhood tables,
  diagnostic figures, and stability tables.
- `subskill_specific`: discovery packet, graph object, reviewer-request
  summary, or report-module input.

Never create final HTML.

Material drift includes missing packages, changed algorithm family, changed
variable set, omitted diagnostics, changed graph target, different output plan,
or report-like artifacts not authorized. On material drift, stop and write a
blocked or repair council option rather than substituting silently.

## Boundaries

Discovery suggests graph hypotheses, local neighborhoods, edge uncertainty,
diagnostic needs, and reviewer requests. It does not validate adjustment, choose
the causal framework, approve a method, open a validity gate, strengthen claims,
write final reports, or activate another reviewer directly.
