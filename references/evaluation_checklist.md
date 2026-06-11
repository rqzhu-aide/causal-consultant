# Evaluation Checklist

Use this file only when auditing, revising, or preparing a version update for
`causal-consultant`. Do not load it during ordinary causal consultation.

## Static Contract Checks

- Main remains the only user-facing voice.
- Activation message has one canonical definition in `SKILL.md` and matches
  `manifest.json` version.
- Main creates and maintains live state at `outputs/project_state.yaml` once
  causal-project information exists and before any subskill route.
- `assets/project_state_template.yaml` centers on `next_step_plan`,
  `pending_actions`, `council_chamber`, owner evidence sections,
  `method_task_results`, `discovery_sidecar`, `report_assembly`, and
  `artifact_index`.
- `pending_actions` is the only backlog.
- `council_chamber` is the only shared opinion log.
- Core subskills have role-focused `SKILL.md` files and local
  `backend_workflow.md` files when they own a routed backend contract.
- Core reviewers read `state_file_path`, write only their owned evidence section
  plus one council opinion, and do not mutate plan, pending action, artifact,
  report, or user-facing state directly.
- Numbered method/task specialists use
  `references/method_task_specialist_contract.md`, have no local
  `backend_workflow.md`, and write one `method_task_results` item, artifact
  entries only for execution-created specialist artifacts, and one council
  entry.
- `method_task_results` is the durable compact summary registry for numbered
  specialist probes and executions.
- `next_step_plan.steps` is the active internal plan and not a history log.
- Ordinary lead questions, menus, and user-facing turns are not represented as
  `next_step_plan.steps`; use `pending_actions` and the chat response instead.
- Main preserves unfinished planned steps during the internal chain, revises
  them in place or marks stale ones `superseded`, and clears terminal steps only
  after all planned internal work is terminal and checks pass, resetting
  `next_step_plan` to the neutral empty shape.
- Step-local `execution` is used only on the selected `execution_authorized`
  step and contains `analysis_dir`, `scope`, `claim_boundary`, and
  `expected_outputs`.
- Backend, consultation patterns, hooks, architecture map, catalog, and
  templates use the current lean YAML names and do not refer to old owner sections or
  `specialist_outputs`.
- Runtime examples use `[+ Consultant Options]` for suggestions and
  `[? Next Steps]` for decisions.
- Final reports still live under `outputs/reports/`; analysis artifacts live
  under `outputs/analyses/`.

## Runtime Checks

- User asks for several things: main records useful choices in
  `pending_actions`; `next_step_plan.steps` is populated only when internal
  routed work or confirmed execution must happen before the next reply.
- Main runs a Core Relevance Scan after substantive user updates and completed
  internal steps.
- After each routed step, main reviews unfinished planned steps and routes only
  the earliest pending step.
- A core review runs: live `outputs/project_state.yaml` already exists, the
  routed payload includes `state_file_path`, and the reviewer writes owner
  evidence plus one council opinion directly.
- A method/task specialist runs: it writes one `method_task_results` item,
  artifact entries only for execution-created specialist artifacts, and one
  council entry; main decides whether options become `pending_actions`.
- A specialist artifact implication that needs owner review uses a lean council
  option with `agent_called`, `action_goal`, and `refs`.
- Lead scans all current council entries before speaking and pools actionable
  `options[]` items into `pending_actions`.
- Lead shows user-facing options from `pending_actions`, not directly from owner
  evidence sections.
- Execution requires a confirmed active plan and complete selected-step
  execution object.
- After execution, the next user-facing message is the Return Gate.
- Report work is selected through `pending_actions` and tracked in
  `report_assembly`.
- Open report-relevant actions are done, declined, parked, or blocked before
  report delivery.
- Hooks, when available, audit structure only and do not mutate state or perform
  causal reasoning.

## Scenario Dry Reviews

- Vague "analyze X on Y": main frames the causal ambiguity and asks or offers a
  compact next-step menu before analysis.
- Data provided: main plans the smallest useful data reality review, receives a
  council opinion, and returns options.
- First data role card with domain-laden variables: main routes a bounded
  `domain_expert` step before method synthesis; a simple domain-neutral update
  may skip it.
- Several reviewers become relevant: main orders them as `next_step_plan.steps`
  and runs one bounded step at a time, preserving unfinished steps until the
  chain is terminal.
- Method comparison needed: method lead writes a council entry with options;
  main pools useful options from all current council entries into pending
  actions.
- Numbered specialist feedback needed: main routes the numbered specialist in
  `feedback_only`, verifies the written `method_task_results` item, and routes
  `method_lead` or `causal_gatekeeper` if method choice or claim boundary
  changes.
- User selects multiple choices: main selects one immediate action and leaves the
  others open or parked in pending actions.
- Execution completes: actual produced outputs are indexed by the executing
  subskill through its owner/result pathway, and the Return Gate includes
  folder, output paths, boundary/status, and next steps.
- Planning report before data analysis: report type is planning-only and no
  empirical estimates are implied.
- Empirical report after analysis: report uses completed artifacts and final HTML
  path under `outputs/reports/`.

## Scorecard

Rate changed components 0, 1, or 2:

- Role clarity
- State ownership clarity
- Option-menu usefulness
- Execution permission control
- Report/artifact traceability
- Interaction pacing
- Workload restraint

Revise before versioning if any score is 0.
