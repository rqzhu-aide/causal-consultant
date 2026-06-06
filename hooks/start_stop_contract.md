# Portable Start/Stop Hook Contract

This file defines optional structural hooks for runtimes that support them. The
skill must still work without hooks; hooks only enforce the workflow skeleton.

Hooks do not perform causal reasoning, select methods, inspect data, write
reports, or change project state. They read durable state and the proposed
action or response, then return a guard status.

## Hook Results

- `pass`: continue.
- `warn`: continue, but inject the warning into agent context.
- `repair_required`: do not send the user-facing response until the agent fixes
  the response or missing closeout state.
- `block`: stop the attempted execution, report, or final wrap-up until main
  asks the user or repairs state.

## Shared State Inputs

Read these sections when available:

- `execution_records`
- `pending_user_intents`
- `report_assembly`
- `method_alignments.method_ideas`
- `team_synthesis.exploration_threads`
- `discovery_sidecar`
- `causal_validity`
- `artifact_index`

Treat `execution_records` as the source of truth for the immediate authorized
execution unit and the post-execution closeout. It is not a backlog.
Treat `report_assembly` as the source of truth for final HTML report intent,
included analysis units, report structure, and final report path.

## `start_hook`

Run at the beginning of a turn or before loading task-specific context.

Return:

```yaml
hook: start_hook
allowed_mode: first_turn | planning | specialist_feedback | execution | closeout | report | repair
active_execution_unit: null
closeout_required: false
report_ready: false
pending_work_summary: null
hard_stop: null
warnings: []
```

Checks:

- If no durable state exists, allow only first-turn orientation, bounded
  inspection, or one routed specialist stage.
- If the latest `execution_records` item has `closeout_status: incomplete`,
  set `allowed_mode: closeout` and `hard_stop: return_gate_required`.
- If an execution unit is active, surface its allowed task, allowed outputs,
  forbidden outputs, intended tools, fallback policy, analysis directory,
  manifest path, and permission status.
- If active `pending_user_intents`, worthwhile `method_ideas`, active
  `exploration_threads`, or active/paused `discovery_sidecar` exist, summarize
  items that should appear in the next-choice menu before report or final
  wrap-up.
- If `queue_reconciliation.report_ready` is false or missing after execution,
  set report mode to blocked until the Return Gate is repaired or remaining
  work is resolved, blocked, declined, or parked for report.
- If a final report is requested, surface `report_assembly.status`,
  included execution units, missing analysis folders/manifests, and whether
  final HTML must be under `outputs/reports/`.
- If a final report is requested, audit every unit in
  `report_assembly.included_execution_units` for `analysis_dir`,
  `manifest_path`, source path, analysis note path, `closeout_status:
  complete`, and `queue_reconciliation.report_ready: true`.

## `stop_hook`

Run before a user-facing response is sent, or immediately after the response is
generated when pre-send hooks are not available.

Return:

```yaml
hook: stop_hook
status: pass | warn | repair_required | block
reason: null
required_fix: null
```

Critical failures:

- Script, model, diagnostic, table, artifact, or report execution was attempted
  without a confirmed `execution_records` packet: `block`.
- Execution occurred and the response is not the full Return Gate shape:
  `repair_required`.
- Execution closeout marks an analysis complete without `analysis_dir`,
  `manifest_path`, source path, or analysis note path: `repair_required`.
- The response offers or delivers a final HTML report while
  `queue_reconciliation.report_ready` is false, missing, or inconsistent:
  `block`.
- The response offers or delivers a final HTML report while `report_assembly`
  is missing, not `ready_for_writer`/`delivered`, or missing included execution
  units: `block`.
- The response offers or delivers a final HTML report while any included
  execution unit lacks `analysis_dir`, `manifest_path`, source path, analysis
  note path, `closeout_status: complete`, or `queue_reconciliation.report_ready:
  true`: `block`.
- A final report path is outside `outputs/reports/`, or an analysis-specific
  report-like artifact is treated as the final report: `block`.
- A missing package, replacement estimator, custom implementation, dropped
  diagnostic, changed report asset, or changed output plan is treated as
  non-material or continues silently: `block`.
- The response wraps up or moves to final report while active pending user work,
  worthwhile consultant ideas, or active/paused discovery remain unresolved:
  `repair_required`.

Return Gate shape required after execution:

```text
[OK Confirmed] Ran: [completed unit]. Folder: [outputs/analyses/unit_id/]. Source: [script/notebook path]. Note: [analysis_note path]. Manifest: [manifest.json path].

[! Boundary] Status: [claim boundary]. [Dependency/deviation/packet-match/gatekeeper issue only as needed.]

[+ Method Options] or [+ Next Steps] choices:
1. [recommended next action]
2. [HTML report option for completed work so far, with remaining items parked/listed as not run if needed]
3. [pending user-requested branch, repair, worthwhile consultant idea, sensitivity, discovery sidecar, report asset step, or stop option]

[? Question] Which option should we take next?
```

Warnings:

- User-facing runtime labels are not one of `[> Framing]`, `[= Data Reality]`,
  `[+ Method Options]`, `[+ Next Steps]`, `[! Boundary]`, `[OK Confirmed]`,
  `[? Question]`, or `[# Report]`.
- An ordinary non-closeout response shows too many options instead of one or two choices.
- A staged specialist response ends without either one explicit `[? Question]`
  or a small `[+ Method Options]` / `[+ Next Steps]` menu.
- The post-execution Return Gate does not include 2-3 next choices when pending
  user work, worthwhile consultant ideas, repair choices, stop choices, or HTML
  report options are available.
- A completed analysis Return Gate omits an HTML report option for the completed
  work, or offers report writing while `report_ready` is false without saying
  remaining items must be parked, resolved, or listed as not run first.
- The post-execution Return Gate omits active pending user work or unresolved
  worthwhile consultant ideas from `Next choices`.
- Report delivery omits `report_assembly.final_report_path`, included analysis
  unit folders, or source/analysis-note links for included units.
- Specialist feedback is summarized without a staged handoff or user choice.

## Host Runtime Notes

If the host only supports start and stop hooks, implement only this file. If the
host also supports pre-execution, post-execution, pre-report, or pre-response
hooks, map them to the same checks:

- pre-execution: block execution without a confirmed packet.
- post-execution: require closeout and Return Gate next.
- pre-report: block unless report readiness clearing has passed.
- pre-response: run `stop_hook` before the message is shown.
