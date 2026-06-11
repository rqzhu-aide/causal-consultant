# Portable Start/Stop Hook Contract

This optional contract audits workflow structure. The skill must still work
without hooks. Hooks read durable state and the proposed action or response; they
do not mutate state, select methods, inspect data, write reports, or perform
causal reasoning.

## Hook Results

- `pass`: continue.
- `warn`: continue, but surface the warning to the agent.
- `repair_required`: do not send the user-facing response until the agent fixes
  the response or state.
- `block`: stop attempted execution, report delivery, or final wrap-up until main
  asks the user or repairs state.

## Shared State Inputs

Read the live state from `outputs/project_state.yaml` when it exists. Subskill
routing, execution, and report work require this file.

Read these sections when available:

- `project_summary`
- `next_step_plan`
- `pending_actions`
- `council_chamber`
- `domain_records`
- `discovery_sidecar`
- `report_assembly`
- `artifact_index`

## `start_hook`

Run at the beginning of a turn or before loading task-specific context.

Return:

```yaml
hook: start_hook
allowed_mode: first_turn | planning | review_step | execution | return_gate | report | repair
active_plan_step: null
pending_work_summary: null
hard_stop: null
warnings: []
```

Checks:

- If no live `outputs/project_state.yaml` exists, allow only user-facing
  orientation or lead-owned planning. Any routed subskill step, execution, or
  report work must return `repair_required` or `block` until main creates the
  live YAML file.
- If a subskill route is proposed, require `state_file_path:
  outputs/project_state.yaml`, `agent_called`, `mode`, `action_goal`, and
  `action_id` in the routed payload.
- If `next_step_plan.steps` contains pending routed/internal steps, surface the
  earliest pending step as `active_plan_step`. Main must resume from this first
  pending step; later steps are not considered ready just because they are listed.
- If `next_step_plan.steps` contains ordinary `lead` or `user_response` steps
  that only ask the user a question or present a menu, warn that these should be
  handled in the chat response and not kept as plan steps.
- If a later step is marked `done` while an earlier routed/internal step is still
  `pending`, warn that plan order is inconsistent and set `active_plan_step` to
  the earliest pending step.
- Treat `done`, `blocked`, and `superseded` as terminal step statuses. A
  `superseded` step is not a failure if main has reviewed it and no earlier
  pending step remains.
- If an execution step is active, surface the selected step's `execution`:
  scope, claim boundary, analysis directory, and expected outputs.
- If execution has occurred but the produced-output closeout facts are missing,
  set `allowed_mode: return_gate` and `hard_stop: return_gate_required`.
- Summarize open `pending_actions` that should appear before report delivery or
  final wrap-up.
- If report work is requested, surface `report_assembly.status`, `report_type`,
  `template_path`, `included_actions`, required assets, final path, and whether
  final HTML belongs under `outputs/reports/`.

## `stop_hook`

Run before a user-facing response is sent, or immediately after response
generation when pre-send hooks are unavailable.

Return:

```yaml
hook: stop_hook
status: pass | warn | repair_required | block
reason: null
required_fix: null
```

Critical failures:

- A routed subskill call is attempted without live `outputs/project_state.yaml`
  or without `state_file_path` in the routed payload: `block`.
- A script, model, diagnostic, table, artifact, or report execution is attempted
  without `next_step_plan.confirmed: true`, a matching active step whose
  `mode` is `execution_authorized`, and a complete step-local execution object
  with `analysis_dir`, `scope`, `claim_boundary`, and `expected_outputs`:
  `block`.
- A routed/internal plan step remains pending before the next user-facing step,
  but the response speaks to the user as if the plan finished:
  `repair_required`.
- A blocked routed/internal step lacks a boundary, repair, or user-choice
  explanation before the response speaks as if work can continue:
  `repair_required`.
- All routed/internal plan steps are terminal, but `next_step_plan` has not been
  reset to `status: none`, `selected: null`, `confirmed: false`, and `steps: []`
  before the user-facing response:
  `repair_required`.
- A step is marked `done` without the expected owner/result write inferred from
  `agent_called`, plus matching current `council_chamber` entry
  `id: <agent_called>.<action_id>`: `repair_required`.
- A numbered method/task step is marked `done` without a matching
  `method_task_results` item and matching council entry:
  `repair_required`.
- A numbered method/task `feedback_only` or `bounded_inspection` step creates
  new analysis artifacts instead of writing specialist feedback only:
  `repair_required`.
- A `causal_discovery` step is marked `done` without a `discovery_sidecar` write
  and matching current `council_chamber` opinion:
  `repair_required`.
- A downstream core review or report step uses discovery artifacts before
  matching `artifact_index` entries exist for `discovery_sidecar` artifact
  paths: `repair_required`.
- A user-facing response is attempted from a later step while an earlier
  routed/internal step is still pending, or while an earlier blocked step lacks
  explanation:
  `repair_required`.
- Execution occurred and the response is not the full Return Gate shape:
  `repair_required`.
- Execution closeout marks an analysis complete without the selected step's
  analysis directory and the actual produced outputs promised by
  `execution.expected_outputs`, unless the run is explicitly blocked or partial:
  `repair_required`.
- The response offers or delivers final HTML while `report_assembly` is missing,
  blocked, inconsistent with the report type/template mapping, or points outside
  `outputs/reports/`: `block`.
- The response wraps up or moves to report delivery while open `pending_actions`
  that affect the work remain unhandled: `repair_required`.
- A substantive causal-project response omits `[> Framing]` before consultant
  options or next steps: `repair_required`.
- A missing package, replacement estimator, custom implementation, dropped
  diagnostic, changed report asset, or changed output plan continues silently:
  `block`.

Return Gate shape required after execution:

```text
[> Framing] This step is complete, and the result should be interpreted within
the confirmed claim boundary.

[OK Confirmed] Ran: [completed unit]. Folder: [analysis_dir]. Source: [source_path]. Note: [analysis_note_path]. Manifest: [manifest_path].

[! Boundary] Status: [claim boundary and any dependency/deviation/gatekeeper issue.]

[+ Consultant Options]
[Optional useful pending analysis, sensitivity, discovery, report asset, or planning idea.]

[? Next Steps]
1. [recommended next action]
2. [HTML report option when completed artifacts exist]
3. [pending action, repair, stop, or alternative direction]
```

Warnings:

- Runtime labels are not one of `[> Framing]`, `[= Data Reality]`,
  `[+ Consultant Options]`, `[? Next Steps]`, `[! Boundary]`, `[OK Confirmed]`,
  or `[# Report]`.
- A staged response needs a user decision but does not end with `[? Next Steps]`.
- Consultant suggestions are shown without `[+ Consultant Options]`.
- The menu omits open pending actions that should reasonably be surfaced.
- A completed analysis response omits an HTML report option for completed work
  when report artifacts could be created.

## Host Runtime Notes

If the host only supports start and stop hooks, implement only this file. If the
host supports more hooks, map them to the same checks:

- pre-execution: block execution without a confirmed active plan.
- post-execution: require closeout and Return Gate next.
- pre-report: block unless report state and pending actions allow report work.
- pre-response: run `stop_hook` before the message is shown.
