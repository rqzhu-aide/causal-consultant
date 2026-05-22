# YAML Management

Use `assets/causal_project_spec_template.yaml` as shared working memory. Use `assets/workflow_enums.yaml` for controlled state values. Update only fields whose remembered state changed. Do not expose YAML mechanics in ordinary user replies.

## Validation

When the project YAML is created, structurally edited, or about to support a reportable deliverable, validate it with the active Python interpreter:

```bash
python scripts/validate_project_state.py --project <project-state.yaml>
```

If `python` is not on PATH, use the Python executable available in the current runtime.

The validator keeps the package/project boundary conservative: `artifact_index` may point only to fixed package resources with package-resource artifact types. Clear project-output paths under folders such as `artifacts/`, `outputs/`, `analyses/`, `reports/`, `results/`, `figures/`, `tables/`, `datasets/`, or `notebooks/` are errors there. Unusual paths outside normal package folders are warnings, not errors.

Validate standalone method/task records with:

```bash
python scripts/validate_subskill_record.py --record <subskill-record.yaml>
```

## Lead Consultant Fields

The lead consultant owns these fields:

- `project_summary`: small dashboard for project name, dates, user goal, deliverable, audience, `current_phase`, status, data location, and report folder. Do not duplicate reviewer details here.
- `team_synthesis`: turn-level convergence checkpoint. Use `user_turn_summary` for what the user just asked or provided, including immediate intent and any current confusion. Use `turn_goal` for the small internal purpose of this turn, usually to prepare the next useful user-facing question, choice, or action. Keep working facts, missing information, key tensions, material updates, and whether the team is ready to reply here too.
- `variable_roster`: lean shared variable index. The lead consultant may add entries and write only `variable_id`, `label`, and `user_stated_role` from the user's language. Do not write final causal roles or data bindings here.
- `causal_gate`: whether the causal claim, framework, assumptions, and wording boundary are ready enough for reportable use.
- `production_gate`: whether evidence, diagnostics, provenance, and materials are ready enough for `report_production`.
- `working_agenda`: what the next few turns should try to learn or resolve.
- `bounded_continuation`: bounded continuation when the user wants progress despite unresolved issues. It records scope and claim limits; it does not clear gate blockers or mark gates ready.
- `next_action`: the next user-facing question, explanation, action, or continuation.
- `analysis_state`: high-level analysis outputs, active sidecars, report working draft path, report structure notes path, recommended method-job subskills, and limitations.
- `retired_tasks`: parked, resumed, or completed task history.

## Reviewer Fields

Reviewer-owned fields are updated by the reviewer skill, not by the lead consultant. Reviewers may also update only their assigned fields in `variable_roster`.

- `domain_expert`: domain context, construct guidance, causal-structure guidance, domain data standards, common practice, interpretation, external validity, and wording cautions.
- `data_analyst`: data sources, data properties, variables, timing, missingness/selection, exploratory outputs, method-support handoffs, datasets, and report assets.
- `method_lead`: causal question variants, candidate frameworks, selected framework, estimand set, validity requirements, `causal_structure`, assumptions, method literature, tools/subskills, diagnostics, sensitivity, and wording boundary.

## Section Ownership And Use

Use this table as the audit checklist for who writes each top-level YAML section and how the rest of the team should consume it. "Writer" means the permanent project-state writer; other skills may return requests or feedback for that writer instead of mutating the section directly.

| YAML section | Writer | When written | Main readers | When read |
|---|---|---|---|---|
| `project_summary` | Lead consultant | Project start, phase/status changes, and user updates to goal, deliverable, audience, dataset location, or report folder. | Entire team. | Before reviewer work, phase guidance, report framing, or artifact planning. |
| `team_synthesis` | Lead consultant | Start of a meaningful turn, after reviewer/subskill updates, and before replying. | Entire team. | To understand the user turn, working facts, missing information, tensions, and reply readiness. |
| `causal_gate` | Lead consultant | After relevant reviewer updates or required method rechecks. | Lead consultant, `method_lead`, `report_writer`, and reviewers when gate status affects their work. | To decide causal-specification readiness, claim strength, phase movement, and report wording limits. |
| `production_gate` | Lead consultant | During `report_production` after evidence, diagnostics, provenance, and report materials are reviewed. | Lead consultant, `data_analyst`, `report_writer`, and `method_lead` when results affect causal claims. | To decide deliverable readiness, visible blockers, diagnostic completeness, and report claim strength. |
| `working_agenda` | Lead consultant | After synthesis and gates, when the next few turns need a small internal purpose. | Lead consultant and reviewers. | At the next turn or reviewer pass to keep the interaction focused. |
| `variable_roster` | Field-level owners: lead, `domain_expert`, `data_analyst`, `method_lead`. | As decision-relevant variables or variable families become clear. | Entire team, method/task subskills, and `report_writer`. | Whenever construct meaning, data binding, method role, diagnostics, or report interpretation depends on variables. |
| `bounded_continuation` | Lead consultant | Only when the user knowingly wants progress despite unresolved blockers or incomplete specification. | Lead consultant, `method_lead`, `report_writer`, and any reviewer whose work is bounded. | Before replies, reports, or artifacts that must stay inside the acknowledged limits while gate blockers remain visible. |
| `next_action` | Lead consultant | End of each meaningful turn. | Lead consultant. | To form the immediate user-facing reply or continue the next turn. |
| `domain_expert` | `domain_expert`. | Default reviewer pass or focused domain recheck. | `data_analyst`, `method_lead`, `report_writer`, lead consultant, and subskills when domain meaning is needed. | Before data processing, method fit review, interpretation, wording, and report writing. |
| `data_analyst` | `data_analyst`. | Default reviewer pass, data inspection, data-description review, or bounded subskill request. | `method_lead`, `report_writer`, lead consultant, and subskills when data feasibility is needed. | Before method triage, implementation, diagnostics, reproducibility review, and report writing. |
| `method_lead` | `method_lead`. | Default reviewer pass, causal-specification work, candidate triage, and required method rechecks. | Lead consultant, `data_analyst`, `report_writer`, method/task subskills, and `domain_expert` when interpretation needs it. | Before activation, gates, diagnostics, claim wording, and report production. |
| `analysis_state` | Lead consultant. | After outputs, recommended subskills, sidecar breadcrumbs, report draft paths, report structure notes paths, report artifacts, or durable limitations are returned to the lead. | Entire team. | To locate current artifacts, sidecars, report drafts, report structure notes, recommendations, and cross-cutting limitations. |
| `subskill_records` | Lead consultant after a specialist subskill returns a durable packet. | Only when a method/task subskill or sidecar is activated or produces durable feedback. | `method_lead`, `data_analyst`, `report_writer`, `domain_expert`, and lead consultant. | For bounded rechecks, implementation requests, report modules, domain interpretation, and future provenance. |
| `retired_tasks` | Lead consultant. | Only when tasks are parked, resumed, completed, or abandoned. | Lead consultant. | When resuming work or explaining why a deferred task is not active. |
| `artifact_index` | Package maintainer, not normal project workflow. | Only when the packaged skill resources change. | Entire team. | To locate bundled subskills, templates, references, and scripts. Do not use it as project reasoning or output history. |

## Variable Roster

`variable_roster` is a compact bridge across the team, not a full data dictionary, DAG database, or literature memo. Include only variables or variable families that matter for the causal question, data construction, design, diagnostics, or report.

Use field-level ownership:

| Field | Writer | Purpose |
|---|---|---|
| `variable_id` | lead consultant or `data_analyst` | Stable short name for a discussed variable or variable family. |
| `label` | lead consultant or `data_analyst` | User-facing or domain-facing label. |
| `user_stated_role` | lead consultant | Provisional role from the user's framing; never final causal classification. |
| `domain_meaning` | `domain_expert` | Brief construct meaning or domain interpretation. |
| `data_binding` | `data_analyst` | Compact source, column, or artifact links. |
| `data_status` | `data_analyst` | Availability or constructability status. |
| `method_role` | `method_lead` | Final causal/design role after domain and data review. |
| `method_use_note` | `method_lead` | Usage rule such as adjust, do not adjust, timing anchor, diagnostic only, or sensitivity issue. |

Keep the roster lean:

- Use one entry for a meaningful variable family, such as baseline labs or neighborhood features, when individual columns are not decision-relevant.
- Put full schemas, missingness tables, inventories, data profiles, and long role reasoning in reviewer fields or artifacts.
- Treat empty fields as normal early in the project. The roster matures as reviewers inspect meaning, data, and method logic.
- If the roster becomes large, keep only the variables needed for gates and report interpretation, and point to an artifact for the detailed inventory.

## Specialist And Artifact Fields

- `report_writer`: does not own a YAML section. It keeps a polished Markdown project notebook, working report, and optional report-structure notes once the project has durable content to preserve, including during `project_exploration`. By `causal_specification`, the draft should be active unless the project is too brief. During `causal_specification`, data-analysis results, method-picking logic, causal reasoning, interpretation, limitations, and user-goal alignment should be reflected in the working report or structure notes when they change. The lead consultant invokes it when report-worthy content changes, then records returned paths in `analysis_state.report_working_draft_path`, `analysis_state.report_structure_notes_path`, and `analysis_state.report_production_artifacts` as applicable.
- `subskill_records`: append compact records only when specialist subskills are activated or produce durable feedback. Use `assets/method_job_subskill_record_template.yaml` for method/task subskills: common envelope plus one `type_specific` packet for `design_route`, `target_goal`, or `implementation_support`. Records are not automatically merged into reviewer sections; routine records can guide data or report work, while `method_lead_recheck.required` marks records that need method-lead review before gates or causal-claim updates.
- `artifact_index`: fixed package registry for bundled subskills, templates, references, scripts, and assets. Do not use it as a project reasoning field or output log; project output paths belong in `analysis_state`, `subskill_records`, the working report, or linked artifacts.
- `method_lead.causal_structure`: progressive causal-structure memory. It records the decision-relevant narrative, graph artifact path, edge summary, role summary, timing constraints, forbidden adjustments, identification status, identification gaps, and assumptions. Detailed DAGs, SWIGs, timing diagrams, or edge tables should live in artifacts.

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
- variable-level constructability risk: `variable_roster[].data_status` plus richer evidence in `data_analyst`;
- data, timing, support, missingness, or provenance risk: `data_analyst.blockers`, `data_analyst.data_quality_issues`, or `data_analyst.method_support.feasibility_notes`;
- causal validity, estimand, framework, diagnostic, sensitivity, or claim-language risk: `method_lead.blockers`, `method_lead.causal_structure`, `method_lead.validity_requirements`, `method_lead.diagnostics_plan`, `method_lead.sensitivity_plan`, or `method_lead.report_wording_boundary`;
- cross-cutting durable limitation: `analysis_state.limitations`;
- phase-level blocker: `causal_gate.blockers` or `production_gate.blockers`.

## Update Order

On each meaningful user conversation turn:

1. Update only changed lead-consultant fields from the user turn. Add or revise lean `variable_roster` entries only when the user mentions a decision-relevant variable or variable family.
2. Let reviewers update their own sections and their assigned `variable_roster` fields through the workflow in `backend_workflow.md`.
3. Update `team_synthesis.material_updates_this_turn`.
4. Invoke `report_writer` when the turn has report-worthy content, report-support subskill output, or a deliverable/revision request; record only returned path updates, report artifacts, and durable limitations in lead-owned YAML fields.
5. Update gates only after relevant reviewer, subskill, and report-writer feedback has been considered.
6. Update `working_agenda`, `bounded_continuation` if relevant, `next_action`, and durable limitations.
7. Update `retired_tasks` only when tasks are parked, resumed, or completed.
