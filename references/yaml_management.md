# YAML Management

Use `assets/causal_project_spec_template.yaml` as shared working memory. Use `assets/workflow_enums.yaml` for controlled state values. Update only fields whose remembered state changed. Do not expose YAML mechanics in ordinary user replies.

## Validation

When the project YAML is created, structurally edited, or about to support a reportable deliverable, validate it with the active Python interpreter:

```bash
python scripts/validate_project_state.py --project <project-state.yaml>
```

If `python` is not on PATH, use the Python executable available in the current runtime.

Validate standalone method/task records with:

```bash
python scripts/validate_subskill_record.py --record <subskill-record.yaml>
```

## Lead Consultant Fields

The lead consultant owns these fields:

- `project_summary`: small dashboard for project name, dates, user goal, deliverable, audience, `current_phase`, status, data location, and report folder. Do not duplicate reviewer details here.
- `team_synthesis`: turn-level convergence checkpoint. Use `user_turn_summary` for what the user just asked or provided, including immediate intent and any current confusion. Use `turn_goal` for the small internal purpose of this turn, usually to prepare the next useful user-facing question, choice, or action. Keep working facts, missing information, key tensions, material updates, and whether the team is ready to reply here too.
- `causal_gate`: whether the causal claim, framework, assumptions, and wording boundary are ready enough for reportable use.
- `production_gate`: whether evidence, diagnostics, provenance, and materials are ready enough for `report_production`.
- `working_agenda`: what the next few turns should try to learn or resolve.
- `bounded_continuation`: bounded continuation when the user wants progress despite unresolved issues.
- `next_action`: the next user-facing question, explanation, action, or continuation.
- `analysis_state`: high-level analysis outputs, active sidecars, report working draft path, recommended/activated method-job subskills, and limitations.
- `retired_tasks`: parked, resumed, or completed task history.

## Reviewer Fields

Reviewer-owned fields are updated by the reviewer skill, not by the lead consultant.

- `domain_expert`: domain context, construct guidance, causal-structure guidance, domain data standards, common practice, interpretation, external validity, and wording cautions.
- `data_analyst`: data sources, data properties, variables, timing, missingness/selection, exploratory outputs, method-support handoffs, datasets, and report assets.
- `method_lead`: causal question variants, candidate frameworks, selected framework, estimand set, validity requirements, DAG/theory, assumptions, method literature, tools/subskills, diagnostics, sensitivity, and wording boundary.

## Specialist And Artifact Fields

- `report_writer`: does not own a YAML section. It keeps a polished Markdown project notebook and working report once the project has durable content to preserve, including during `project_exploration`. By `causal_specification`, the draft should be active unless the project is too brief. Track the draft path in `analysis_state.report_working_draft_path`.
- `subskill_records`: append compact records only when specialist subskills are activated or produce durable feedback. Use `assets/method_job_subskill_record_template.yaml` for method/task subskills.
- `artifact_index`: fixed registry for bundled artifacts and durable outputs. Do not use it as a reasoning field.

## Evidence Preflight

Before relying on any factual information, classify its provenance. This includes user-provided statements, domain background, data descriptions, file paths, variable meanings, sample sizes, estimates, diagnostics, robustness checks, artifacts, and saved outputs:

- user stated it;
- workspace file or artifact was inspected;
- a tool/subskill computed it;
- it was copied from an inspected artifact;
- it is hypothetical/template text;
- it is unavailable.

User-provided information can be recorded and used as user-stated evidence, but do not treat it as independently verified unless the team inspected, computed, or cross-checked it. If a user-stated fact conflicts with inspected evidence, project logic, or another recorded fact, flag the tension and ask or verify before building on it.

When evidence is unsupported, conflicting, user-stated only, or not yet inspected, record the limitation in the relevant reviewer blockers, gate blockers, or `analysis_state.limitations` before using it in a reply or report.

Do not imply inspection, computation, verification, or external confirmation unless it happened. Numeric results and diagnostics require inspected, computed, copied, user-stated, or clearly hypothetical provenance.

## Risk Recording

Record risks or unsupported claims in the most specific owner field first:

- domain meaning or interpretation risk: `domain_expert.blockers`, `domain_expert.wording_cautions`, or `domain_expert.constraints_and_external_validity`;
- data, timing, support, constructability, missingness, or provenance risk: `data_analyst.blockers`, `data_analyst.data_quality_issues`, or `data_analyst.method_support.feasibility_notes`;
- causal validity, estimand, framework, diagnostic, sensitivity, or claim-language risk: `method_lead.blockers`, `method_lead.validity_requirements`, `method_lead.diagnostics_plan`, `method_lead.sensitivity_plan`, or `method_lead.report_wording_boundary`;
- cross-cutting durable limitation: `analysis_state.limitations`;
- phase-level blocker: `causal_gate.blockers` or `production_gate.blockers`.

## Update Order

On each meaningful user conversation turn:

1. Update only changed lead-consultant fields from the user turn.
2. Let reviewers update their own sections through the workflow in `backend_workflow.md`.
3. Update `team_synthesis.material_updates_this_turn`.
4. Update gates only after relevant reviewer fields have changed.
5. Update `working_agenda`, `bounded_continuation` if relevant, `next_action`, and durable limitations.
6. Update `retired_tasks` only when tasks are parked, resumed, or completed.
