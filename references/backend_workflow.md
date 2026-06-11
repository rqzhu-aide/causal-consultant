# Backend Workflow

This file is main's runtime contract for live YAML state, routed calls, return
checks, execution gates, and user-facing option menus. Subskill reasoning lives
in each subskill's `SKILL.md`; subskill runtime detail lives in that subskill's
local backend or in the shared method/task specialist contract. All routed
subskills use `references/council_chamber_contract.md` for their chamber entry.

## Main Turn Loop

As soon as the user gives causal-project information, main creates and maintains
`outputs/project_state.yaml` from `assets/project_state_template.yaml`.

Each project turn:

1. Read `outputs/project_state.yaml`.
2. Compact any old-style fields into the lean live shape before continuing.
3. Update `project_summary` and `pending_actions`. Create or update
   `next_step_plan` only when a routed/internal step must run before the next
   user-facing response, or when a user-confirmed execution step is selected.
4. Run the Core Relevance Scan.
5. Route only the earliest planned internal step whose `status` is `pending`.
6. After every routed step, run the Return-To-Main Checkpoint.
7. When all planned internal steps are terminal, run the Pre-User Response
   Check, reset `next_step_plan` to `status: none`, `selected: null`,
   `confirmed: false`, and `steps: []`, and only then speak to the user.
8. Return concise `[> Framing]` synthesis, optional
   `[+ Consultant Options]`, and `[? Next Steps]`.

## Lean Live State

When populated, `next_step_plan` is a transient sequential route plan for the
internal subskill or confirmed execution steps that must finish before the next
user-facing response. It is not history and not a user-response tracker. Its
live shape is:

```yaml
next_step_plan:
  status: none
  selected: null
  confirmed: false
  steps: []
```

If the next move is simply to ask the user a question or present a menu, keep
`next_step_plan.status: none` and `steps: []`. Do not create `lead`,
`user_response`, or completed-history steps just to represent the user-facing
reply. The chat response and `pending_actions` already carry that work.

Each planned step uses only:

```yaml
- id: null
  agent_called: null
  mode: feedback_only
  action_goal: null
  status: pending
  refs: []
```

For the selected `execution_authorized` step only, include an `execution` object
inside that step:

```yaml
- id: run_taxa_audit
  agent_called: data_analyst
  mode: execution_authorized
  action_goal: "Run a genus-level baseline-to-end taxa-change audit."
  status: pending
  refs:
    - outputs/data/avocado_gg.csv
  execution:
    analysis_dir: outputs/analyses/run_taxa_audit
    scope: "Profile baseline-to-end genus-level taxa changes for Avocado versus Control."
    claim_boundary: "Descriptive/data-support audit only; no causal claim."
    expected_outputs:
      - source
      - note
      - manifest
      - result_artifacts
```

Use the same action shape in `pending_actions` and council options. `refs` holds
evidence pointers, artifact ids, paths, or owner-section references. It replaces
older linked-evidence and routed-artifact fields.

## Routed Call Context Boundary

Main routes by `agent_called + mode + action_goal`. Stage names are private
reasoning lanes inside backend docs; they are not live YAML fields, opinion ids,
or routed payload requirements.

A routed call receives only the active step id as `action_id` plus the compact
route context:

```yaml
action_id: <next_step_plan.steps[].id>
agent_called: null
mode: feedback_only
action_goal: null
state_file_path: outputs/project_state.yaml
refs: []
```

The routed call also loads the target subskill `SKILL.md` and the target local
backend, or the shared method/task specialist contract for numbered specialists.
It also loads `references/council_chamber_contract.md`. It must not receive the
full main `SKILL.md`, this full backend, the full conversation transcript,
unrelated subskill files, unrelated artifacts, or hidden lead reasoning. The
subskill reads the live YAML itself from `state_file_path`; main does not paste a
YAML snapshot into the routed prompt.

## Ownership Expectations

Main infers the expected live-YAML write from `agent_called`.

| `agent_called` | Expected effect |
| --- | --- |
| `data_analyst` | direct write to `data_facts` and one current `council_chamber` entry |
| `domain_expert` | direct write to `domain_records` and one current `council_chamber` entry |
| `method_lead` | direct write to `method_records` and one current `council_chamber` entry |
| `causal_gatekeeper` | direct write to `causal_gatekeeper` and one current `council_chamber` entry |
| `causal_discovery` | direct write to `discovery_sidecar`, `artifact_index` for created discovery artifacts, and one current `council_chamber` entry |
| numbered method/task specialist | direct write to `method_task_results`, `artifact_index` for execution artifacts, and one current `council_chamber` entry |
| `report_writer` | direct write to `report_assembly`, `artifact_index` for created report artifacts, and one current `council_chamber` entry |

Main owns `project_summary`, `next_step_plan`, `pending_actions`,
and user-facing synthesis. Only main selects, confirms, blocks, parks, or
completes actions.

## Allowed Modes

| `agent_called` | Allowed modes |
| --- | --- |
| `domain_expert` | `feedback_only`, `bounded_inspection` |
| `method_lead` | `feedback_only`, `bounded_inspection` |
| `causal_gatekeeper` | `feedback_only`, `bounded_inspection` |
| `data_analyst` | `feedback_only`, `bounded_inspection`, `execution_authorized` |
| `causal_discovery` | `feedback_only`, `bounded_inspection`, `execution_authorized` |
| `report_writer` | `feedback_only`, `bounded_inspection`, `execution_authorized` |
| numbered method/task specialist | `feedback_only`, `bounded_inspection`, `execution_authorized` |

Mode meanings:

- `feedback_only`: reason from live state and routed references; no new
  analysis artifacts.
- `bounded_inspection`: inspect only named existing files, fields, outputs,
  diagnostics, or artifacts in `refs`; no new analysis artifacts.
- `execution_authorized`: run only the confirmed scope in the selected step's
  `execution` object; create outputs implied by `scope`, `claim_boundary`, and
  `expected_outputs` inside `execution.analysis_dir`.

`domain_expert`, `method_lead`, and `causal_gatekeeper` never use
`execution_authorized`.

## Council Chamber

Every routed subskill follows `references/council_chamber_contract.md`. Main
verifies the entry with `id: <agent_called>.<action_id>` after each routed step.
The chamber is the live recommendation layer; durable detail stays in the
owner/result section.

## Council Option Pooling

After each routed step and before every user-facing response, main scans all
current `council_chamber` entries and pools every valid `options[]` item.

Pooling rules:

- ignore empty, malformed, duplicate, completed, superseded, or stale options;
- merge by `id` into `pending_actions`, updating an existing pending action
  rather than creating a duplicate;
- preserve only the lean action fields: `id`, `agent_called`, `mode`,
  `action_goal`, and `refs`;
- if an option lacks an `id` but is useful, create a short stable id from the
  action goal before adding it to `pending_actions`;
- do not promote options that would violate mode permissions, execution gates,
  report gates, or owner boundaries;
- keep lower-priority useful options in `pending_actions` rather than dropping
  them merely because they will not be shown this turn.

When speaking to the user, main ranks pooled pending actions by urgency,
blocker/repair value, information gain, user relevance, and report/execution
readiness. Present the top 3-4 meaningful actions and keep the rest open,
parked, or superseded.

## Pending Actions

`pending_actions` is the single backlog for useful but not immediate work. Its
items use the lean action shape plus `status`:

```yaml
- id: null
  agent_called: null
  mode: feedback_only
  action_goal: null
  status: open
  refs: []
```

When promoting a council option, use the Council Option Pooling rules. Do not
preserve old routing fields.

## Return-To-Main Checkpoint

Every routed step returns control to main before any next step or user-facing
response. Subskills must not call another subskill, continue a multi-step chain,
or speak to the user.

After each routed step, main must:

1. Reread `outputs/project_state.yaml`.
2. Verify the expected owner/result write for `agent_called`.
3. Verify a current council entry with `id: <agent_called>.<action_id>`.
4. Mark the active step `done`, `blocked`, or `superseded`.
5. Run Council Option Pooling into `pending_actions`.
6. Run the Core Relevance Scan.
7. Review unfinished planned steps in order.
8. If an unfinished step still represents the same intended work, main may
   revise its `action_goal`, `mode`, or `refs` in place.
9. If an unfinished step is no longer the right work, mark it `superseded` and
   add a replacement pending step when needed. Do not delete unfinished steps
   during the internal chain.
10. If any pending step remains, route the earliest pending step.
11. If all planned steps are terminal, run the Pre-User Response Check, reset
   `next_step_plan` to `status: none`, `selected: null`, `confirmed: false`,
   and `steps: []`, and send the user-facing response.

If the expected write, artifact record, or council entry is missing, main blocks
or repairs the step before continuing. A `superseded` step is terminal when it
has been reviewed by main and no pending earlier step remains.

For `causal_discovery`, numbered method/task specialists, and `report_writer`,
execution-created artifacts are indexed by the routed subskill in
`artifact_index` before it stops. Main verifies the relevant entries before
routing downstream core review or report work.

For numbered method/task specialists, `feedback_only` writes a
`method_task_results` item and council entry without new artifacts;
`bounded_inspection` may reference inspected existing artifacts but creates no
new artifacts; `execution_authorized` may create artifacts implied by the active
step's `execution.expected_outputs` and must index them.

## Core Routing Gates

Use only the smallest useful route.

- Route `data_analyst` when data, files, fields, timing, support, provenance,
  variable roles, or processing possibilities affect the next move.
- Route `domain_expert` when construct meaning, endpoint convention, mechanisms,
  precedent, comparator meaning, population, proxy interpretation, reporting
  norms, or interpretation boundaries matter.
- Route `method_lead` before scripts, models, method choice, reportable tables,
  or report work.
- Route `causal_gatekeeper` before causal estimation, stronger causal wording,
  load-bearing timing/DAG/adjustment logic, or reportable claims.
- Route `causal_discovery` only for a bounded exploratory graph, role, lag, or
  structure question. Discovery implications must be reviewed by the relevant
  core subskill before changing methods, claims, or reports.
- If `method_lead` recommends a concrete numbered specialist option needed to
  evaluate the current menu, route that specialist in `feedback_only` before the
  next user-facing response unless the user must choose first. Advisory
  specialist names inside durable evidence are not automatic routes.

If several reviewers are relevant, plan a short sequence and run one step at a
time through Return-To-Main.

## Execution Gate

Execution is allowed only when:

- selected planned step has `mode: execution_authorized`;
- `next_step_plan.confirmed: true`;
- the selected step contains `execution.analysis_dir`, `execution.scope`,
  `execution.claim_boundary`, and `execution.expected_outputs`;
- the user has confirmed that exact scope.

Expected outputs are expected if execution succeeds, not guaranteed. If the run
is blocked or partial, the subskill must record the blocker and missing outputs
through its normal result or owner section plus council opinion.

`expected_outputs` uses only these tokens:

- `source`: runnable script/notebook or code record when execution used code.
- `note`: compact technical note explaining what was run, produced, and limited.
- `manifest`: machine-readable run manifest or output inventory when useful.
- `result_artifacts`: ordinary outputs such as tables, figures, derived data,
  diagnostics, reports, or report assets.
- `subskill_specific`: outputs interpreted by the called subskill, such as a
  discovery packet, graph object, route-specific diagnostic bundle, or report QA
  closeout.

Execution may create only outputs implied by the selected step's scope and
`expected_outputs` inside `execution.analysis_dir`. The subskill may choose tools
internally. Package fallback, custom estimators, dropped diagnostics, changed
result plan, report-like artifacts, or stronger claim wording are material drift
and require return to main.

After execution, main returns with `[> Framing]`, `[OK Confirmed]`,
`[! Boundary]`, optional `[+ Consultant Options]`, and `[? Next Steps]`.

## Report And Artifact Handling

Completed work is remembered through:

- `method_task_results` for compact technical specialist summaries;
- `artifact_index` for analysis folders, manifests, source, notes, figures,
  tables, data, reports, plans, graphs, diagnostics, and discovery packets;
- `report_assembly` for report intent and readiness.

`report_writer` is routed only for readiness, planning, drafting, revision, QA,
or delivery closeout. It does not validate causal claims, choose methods, rerun
analysis, or invent missing assets.

## Old-State Realignment

When main reads old-style YAML, compact it before continuing:

- `action_id` or `step_id` -> `id`
- `owner` or `target_owner` -> `agent_called`
- `instruction`, `label`, or `why_it_matters` -> `action_goal`
- `linked_evidence`, routed artifact lists, and file paths -> `refs`
- `user_confirmed` -> `confirmed`
- legacy execution object -> selected step's `execution`

Remove `action_type`, routed stage fields, writable-section declarations,
legacy output-control fields, predeclared source/note/manifest paths,
`selected_from`, and ordinary lead or user-response plan entries. During an
internal chain, preserve unfinished steps by revising them in place or marking
them `superseded`; after the user-facing return, old terminal steps should have
been cleared from `next_step_plan.steps`.

## Pre-User Response Check

Before every user-facing reply, main checks:

- Does `outputs/project_state.yaml` exist?
- Is any pending planned internal step required before speaking?
- Has every routed step returned through main?
- Are all planned internal steps terminal before the plan is cleared?
- Has each new current council opinion been considered?
- Has main pooled all current council options into `pending_actions`?
- Does the substantive causal-project reply include `[> Framing]` before
  options or next steps?
- Is execution or report work being implied without confirmed plan state?
- If execution occurred, are closeout facts and artifact records present?

If a check fails, run the missing planned step, ask one user question, or present
the missing choice instead of sending the draft.
