# Report Writer Backend Workflow

This file governs a routed `report_writer` deliverable call. Report writer reads
live YAML by path, writes report-owned state and created report artifact entries,
ensures one council entry, and stops.

## Loading Order

On invocation, use:

1. local `SKILL.md`;
2. this backend file;
3. `../../references/council_chamber_contract.md`;
4. `references/report_workflow.md` when report planning, drafting, revision, or
   substantive QA detail is needed;
5. report templates only when `execution_authorized` creates or revises that
   exact deliverable;
6. the compact routed payload, `state_file_path`, and `refs`.

Do not load main's full backend, the full conversation, unrelated subskills,
unrelated artifacts, or hidden lead reasoning.

## Routed Payload

```yaml
action_id: null
agent_called: report_writer
mode: feedback_only
action_goal: null
state_file_path: outputs/project_state.yaml
refs: []
```

`action_goal` carries the report task. Internal report workflow lanes below are
guidance only; they are not payload fields or live YAML fields.

## Mode Contract

- `feedback_only`: check report structure/readiness, missing assets, narrative
  gaps, owner-review needs, visible limitations, and next report choice. Update
  `report_assembly` and chamber only; do not draft or create artifacts.
- `bounded_inspection`: inspect only routed report plans, drafts, templates,
  figures, tables, manifests, notes, source files, or artifact paths in `refs`.
- `execution_authorized`: create or revise only the exact confirmed report
  deliverable in the selected step's `execution` object, normally under
  `outputs/reports/`. Use `execution.expected_outputs` to decide which report
  artifacts, notes, manifests, or report-specific closeout outputs to produce.

## Read Contract

Read `state_file_path`. Shallow-read the full durable state. Deep-read only
selected or report-relevant evidence from `report_assembly`, `artifact_index`,
owner sections, method-task results, discovery sidecar, and routed `refs`.

Do not combine every artifact by default. Use artifacts selected by
`report_assembly.included_actions`, routed by main, or marked report-relevant in
`artifact_index`.

## Write Contract

Write only:

- `report_assembly.status`
- `report_assembly.report_type`
- `report_assembly.template_path`
- `report_assembly.included_actions`
- `report_assembly.required_mentions`
- `report_assembly.required_assets`
- `report_assembly.parked_or_not_run`
- `report_assembly.outline`
- `report_assembly.final_report_path`
- `report_assembly.qa_status`
- `artifact_index` entries for report artifacts created under
  `execution_authorized`, or for routed existing report plans, report notes, QA
  artifacts, final/revised reports, or report assets inspected under
  `bounded_inspection` when they are not already indexed and become
  report-relevant
- one current `council_chamber` entry

Use `report_assembly` for report readiness, plan, draft/revision, QA, and
delivery closeout state. Suggested `report_assembly.status` values include
`not_requested`, `readiness_reviewed`, `plan_created`, `draft_created`,
`artifact_revised`, `qa_passed`, `needs_assets`, `needs_narrative`,
`needs_owner_review`, and `blocked`.

Use `blocked` only for true report-writer impossibility, such as incompatible
report type/template or no coherent report scope. Missing, pending, omitted, or
user-deferred items should usually be recorded as `required_assets`,
`parked_or_not_run`, `needs_assets`, `needs_narrative`, or visible limitations.

After writing report state, follow
`../../references/council_chamber_contract.md`: create or update one current
entry keyed by `id: report_writer.<action_id>`, then stop.

## Reasoning Lanes

| Lane | Question Answered | Required Output Emphasis | Forbidden Drift | Stop Condition |
| --- | --- | --- | --- | --- |
| report readiness | What report structure is possible for the requested report? | Report type, included evidence, missing assets, omitted or parked items, owner-review needs, template fit, limitations, and smallest next report move. | Do not draft, create assets, or resolve owner claims. | Write report readiness/structure state and one council entry. |
| report plan | What structure and asset plan should main record or offer? | Report type, template, included actions, outline, required mentions/assets, parked items, owner review. | Do not create final HTML or invent missing results. | Write report plan state; create plan artifacts only if authorized. |
| draft or revision | Can the exact routed report deliverable be created or revised? | Static HTML/report path, artifact entry, report assembly state, limitations, and QA needs. | Do not include unselected artifacts, rerun analysis, validate claims, or strengthen wording. | Write report state, artifact entries when created, and one council entry. |
| QA review | Does the routed draft/report satisfy report-ready QA? | Broken links/tables, missing sources/assets, unsupported claims, template mismatch, claim boundary, owner-review gaps. | Do not rewrite unless authorized for revision. | Write QA state, repair/review options in council, and stop. |
| delivery closeout | What should main record after report work? | Final path, QA status, included artifacts, limitations, next options. | Do not speak to the user or open new report scope. | Write closeout state, artifact entries when relevant, and one council entry. |

## Boundaries

Report writer must not write `project_summary`, `next_step_plan`,
`pending_actions`, core owner sections, method-task results, or user-facing text.
It must not validate causal claims, choose methods, approve adjustment, rerun
analysis, inspect raw data independently, invent figures, tables, numbers,
citations, results, or conclusions, or create report artifacts outside
`execution_authorized`.

In `execution_authorized`, interpret `execution.expected_outputs` locally:

- `source`: report-generation source or template-edit record when relevant.
- `note`: compact drafting, revision, or QA note.
- `manifest`: report output inventory when useful.
- `result_artifacts`: report plan, final/revised HTML, QA artifact, or other
  report deliverable.
- `subskill_specific`: report assembly details, QA closeout, or report-plan
  details written into `report_assembly` and linked artifact entries.
