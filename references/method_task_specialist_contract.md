# Method/Task Specialist Contract

Use this shared contract for numbered method/task subskills. Individual
subskill `SKILL.md` files stay route-specific and methodological; this file
defines the compact routed-call boundary and live YAML write shape.

## Runtime Role

- Main is the only user-facing lead and the only writer for `project_summary`,
  `next_step_plan`, and `pending_actions`.
- Numbered specialists are routed technical consultants or execution helpers,
  not durable owner-section reviewers.
- Every routed specialist call writes or updates one compact
  `method_task_results` item and one current `council_chamber` entry.
- Execution may also write `artifact_index` entries for artifacts created under
  the routed scope; feedback and inspection normally do not create new artifacts.
- Follow `references/council_chamber_contract.md` for the chamber entry and
  option shape.

## Routed Payload

```yaml
action_id: null
agent_called: null
mode: feedback_only
action_goal: null
state_file_path: outputs/project_state.yaml
refs: []
```

`agent_called` is the numbered specialist id, such as
`00-randomized-trials-and-ab-tests`. `action_goal` carries the route, target,
diagnostic, implementation, inspection, or execution question. Generic lanes
below are internal reasoning guides only; they are not payload fields or live
YAML fields.

## Modes

- `feedback_only`: default consultation after `method_lead` recommends a
  specialist. Review fit, failure modes, alternatives, mathematical target cues,
  diagnostics, report support, and the smallest useful next action. Do not
  inspect files, run code, or create artifacts.
- `bounded_inspection`: review named existing evidence in `refs`, such as an
  artifact, output, field, code fragment, diagnostic, state record, or short
  excerpt. Do not run new analysis or create new artifacts.
- `execution_authorized`: perform only the exact confirmed deliverable in
  the selected step's `execution` object. This is the only specialist mode that
  may run analysis or create new artifacts, and outputs must stay inside
  `execution.analysis_dir`.

## Read Contract

Read `state_file_path`. Shallow-read the full durable state. Deep-read only
routed or specialist-relevant evidence from `refs` and owner sections when it
affects the bounded specialist question.

Relevant deep reads may include data facts, domain records, method records,
prior method-task results, gatekeeper boundaries, discovery packets, selected
artifacts, report needs, named files, fields, code, notes, manifests, figures,
tables, or diagnostics. Do not deep-read the whole project or unrelated raw data
just because it exists.

## Reasoning Lanes

| Lane | Question Answered | Required Output Emphasis | Forbidden Drift | Stop Condition |
| --- | --- | --- | --- | --- |
| fit screen | Does this route, target, diagnostic, or implementation lane plausibly fit current evidence? | Fit summary, blockers, assumptions, estimand/formula cues, diagnostics needed, alternatives, and one next action. | Do not choose the final method, validate claims, inspect unrelated artifacts, or execute. | Write one result item and one council entry. |
| spec refinement | What route-specific details should main or method_lead know for a selected path? | Estimand cues, data shape, assumptions, diagnostics, implementation support, report support, and limitations. | Do not broaden into unrelated routes or authorize execution. | Write refined technical summary and repair/probe options. |
| artifact review | What does a routed existing artifact, note, diagnostic, code fragment, or result imply for this specialist lane? | Provenance, what was checked, specialist interpretation, limitations, report support, and artifact ids. | Do not rerun analysis or review unrelated artifacts. | Write reviewed result and any core-review or repair option. |
| execution support | What exact specialist execution or diagnostic support is needed inside an authorized scope? | Expected outputs, method-specific execution cautions, required diagnostics, material-drift risks, and report assets. | Do not exceed the confirmed execution scope or silently change method/package/output plans. | Write execution-support result, artifact entries when created, and one council entry. |
| post-execution summary | What did the specialist execution produce, and what should downstream reviewers know? | Compact technical summary, diagnostics reviewed, limitations, artifact ids, report support, blocking signal, and next action. | Do not validate causal claims, rewrite reports, or mutate owner sections. | Write durable result, artifact entries when created, and one council entry. |

## Hard Stops

Do not run scripts, fit models, compute diagnostics, create plots or tables,
write reports, create final HTML, or call another specialist unless main routed
that exact work in `execution_authorized` mode. Requests for diagnostics,
visuals, artifacts, data work, literature checks, or connected specialists must
be written as council options or result recommendations for main to consider.

In `execution_authorized`, interpret the selected step's
`execution.expected_outputs` locally:

- `source`: source script/notebook or code record when code is run.
- `note`: compact technical note explaining the specialist execution.
- `manifest`: run manifest or output inventory when useful.
- `result_artifacts`: estimates, tables, figures, diagnostics, derived data, or
  report-support artifacts.
- `subskill_specific`: route-specific outputs such as assignment-integrity
  diagnostics, event-study objects, RD density checks, IV first-stage bundles,
  synthetic-control donor weights, mediation decomposition outputs, or survival
  diagnostics.

Do not write `project_summary`, `next_step_plan`, `pending_actions`, core owner
sections, `report_assembly`, or user-facing response text.

## Write Shape

Create or update exactly one `method_task_results` item keyed by
`id: <agent_called>.<action_id>`:

```yaml
method_task_results:
- id: null
  action_id: null
  action_goal: null
  specialist_id: null
  module_type: null
  mode: null
  status: null
  fit_summary:
    fit: unclear
    reason: null
  technical_summary: []
  method_implications: []
  estimand_cues: []
  diagnostics_needed: []
  diagnostics_reviewed: []
  limitations: []
  report_support: {}
  artifact_ids: []
  reviewer_relevance: {}
  blocking_signal:
    blocks_current_phase: false
    severity: none
    reason: null
  recommended_next_action: null
```

For `specialist_id`, use the same value as `agent_called`, such as
`00-randomized-trials-and-ab-tests`. When execution creates artifacts, add
matching `artifact_index` entries and link them through `artifact_ids`.

After writing the result item, follow `references/council_chamber_contract.md`:
create or update one current council entry keyed by
`id: <agent_called>.<action_id>`, then stop.

Use `assets/design_route_specialist_output_template.yaml` for `design_route`
specialists and `assets/method_specialist_output_template.yaml` for
`target_goal` and `implementation_support` specialists. These templates are
private structure guides for a `method_task_results` item; they do not create a
separate durable section.

## Council Options

Use `references/council_chamber_contract.md` for option shape and policy.
Options can name the core reviewer, report writer, discovery sidecar, numbered
specialist that would help next, or describe a user-facing question for main to
ask. Use `refs` for result fields, artifact ids, or owner-section pointers.

## Mathematical Cue Contract

When the route has a meaningful causal estimand, statistical target, or model
score, provide `report_support.formula_cues` and/or `estimand_cues`. Each cue
should be compact:

- expression;
- target population;
- contrast or intervention levels;
- time horizon, scale, or conditioning set;
- plain-language symbol definitions;
- identification assumptions or claim boundary;
- missing mathematical slots, if the target is not settled;
- suggested report placement: main text or appendix.

Prefer design-specific targets over generic ATE formulas. If the right formula
cannot be named yet, state the missing slot instead of inventing a settled
estimand.
