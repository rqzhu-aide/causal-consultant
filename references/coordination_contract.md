# Coordination Contract

Use this reference only when the main skill needs the detailed state, gate, reviewer, or YAML-ownership contract. The main `SKILL.md` remains the first source of truth; this file exists to keep the main skill lean while making the two-loop architecture explicit.

## Actor And Kernels

The main skill is the policy actor. It observes the user turn and `project.yaml`, chooses the next action, selects zero, one, or multiple reviewers, updates gates, and speaks to the user.

Subskills are transition-kernel experts. They inspect their slice of state, write compact feedback to YAML or artifacts, and return signals that help the main skill choose the next state. They do not speak directly to the user unless explicitly requested.

## YAML Ownership

Keep `project.yaml` as a lean coordination ledger:

| Section | Owner | Purpose |
|---|---|---|
| `project` | Main skill | Metadata, state folder, current phase, project status. |
| `main_skill` | Main skill | User goal, intent, rigor mode, conversation style, selected next action, open questions, user-directed continuation. |
| `foundation_gate` | Main skill | Validity status for route commitment and causal support. |
| `production_gate` | Main skill | Readiness for Report Writer handoff after production work. |
| `evaluator_loop` | Main skill | Foundation-loop trigger, selected reviewers, review purpose, action queue, loop control. |
| `evaluators.domain_helper_01` | Domain Helper | Domain facts, candidate formulations, handoff notes, requests, assumptions. |
| `evaluators.data_technician_02` | Data Technician | Data status, constructability, data-enabled opportunities, method-fit suggestions, data warnings. |
| `evaluators.design_planner_03` | Design Planner | Route hypotheses, preferred route, design feasibility, fallback logic. |
| `evaluators.dag_builder_04` | DAG Builder | Causal logic, timing, variable roles, identification status, assumptions. |
| `routes` | Main skill | Current route, active hypotheses, rejected or deferred routes. |
| `analysis` | Main skill | Route commitment, execution stage, production loop, discovery sidecar breadcrumb, diagnostics, method/job recommendations and activations, report writer state, claim strength. |
| `analysis.report_writer_20` | Report Writer | Production feedback and post-production handoff state. |
| `subskill_analyses` | Activated method/job subskills and optional discovery sidecar records | Compact records appended only when method/job subskills are activated or discovery traceability is useful. |
| `artifacts` | Main skill and subskills | Index of external notes, analyses, tables, plots, reports, and reproducibility material. |

Full data audits, DAGs, route memos, code, diagnostic tables, report drafts, and slide outlines belong in `analyses/` or `artifacts/`, with compact summaries in YAML.

Allowed action/status values live in `assets/workflow_enums.yaml`. Use that file as the canonical enum source for templates, scaffolding, validation, and subskill records.

## Foundation Loop

Before `foundation_gate.status` is `ready`, the reviewer pool is:

- `01-domain-helper`
- `02-data-technician`
- `03-design-planner`
- `04-dag-builder`

`18-causal-discovery` may be activated during foundation only as a sidecar, not as a foundation evaluator. The main skill records this with `analysis.discovery_sidecar`, not `evaluator_loop.selected_reviewers`, keeps discovery artifacts in `analyses/` or `artifacts/`, and returns to the foundation loop afterward unless the user only requested a discovery deliverable.

At each user turn or project-state update, the main skill records the selected foundation reviewers in `evaluator_loop.selected_reviewers`. It may select zero reviewers only when the user turn is purely conversational, a fresh reviewer result already determines the next action, durable state is not being updated, or a blocking user decision must come first. It must select at least one relevant reviewer after data updates, design or route changes, new foundation evidence, diagnostic failures that affect foundation support, or any foundation-gate transition.

Foundation evaluators write only their own `evaluators.*` section. Cross-evaluator feedback flows through a shared `handoff_notes` list and `requests_for_main_skill`; the main skill synthesizes it.

Foundation evaluator records use the same compact reporting contract:

```yaml
readiness: "unknown"
summary: null
key_findings: []
handoff_notes: []
requests_for_main_skill: []
load_bearing_assumptions: []
```

Each evaluator then adds only its unique contribution: Domain Helper adds `candidate_formulations`; Data Technician adds `readiness_scope`, `data_status`, `data_enabled_opportunities`, and `method_fit_suggestions`; Design Planner adds `design_status`, `preferred_route_id`, and `route_hypotheses`; DAG Builder adds `supported_status`, `supported_scope`, `identification_status`, and `causal_logic_hypotheses`.

The main skill opens `foundation_gate.status: ready` only when the route is named, blocking reviewer signals are resolved or explicitly deferred, load-bearing assumptions are surfaced or deferred, and data/timing/method-fit checks are recorded when they could change execution.

`foundation_gate.status` never stores user-forced progress. User-directed continuation belongs under `main_skill.user_directed` and `analysis.route_commitment_status`.

## Production Loop

After `foundation_gate.status` is `ready` and before `production_gate.status` is `ready`, the main skill runs `analysis.production_loop`.

The production reviewer pool is:

- activated or candidate method/job subskills;
- `02-data-technician` for data construction, diagnostics, reproducibility, timing, and package feasibility;
- `20-report-writer` for reportability, claim language, diagnostic presentation, figure/table choice, audience framing, and presentation structure.

`18-causal-discovery` can still be activated during production, but it remains a sidecar rather than a production reviewer. It uses `analysis.discovery_sidecar` plus artifacts, not `analysis.production_loop.selected_reviewers`, and any implication for the main causal route must be routed back through Data Technician, Design Planner, DAG Builder, or Report Writer as appropriate.

Record ordered production reviewers in `analysis.production_loop.selected_reviewers`, not in `evaluator_loop.selected_reviewers`.

Select at least one production reviewer after new result artifacts, diagnostic failures, material package changes, route-fit changes, foundation-recheck signals, or any production-gate transition. A zero-reviewer production turn is appropriate only for pure conversation, user confirmation with no state change, or when the previous reviewer output already fixes the next action.

Production reviewer write rules:

- Data Technician records production readiness in `analysis.production_loop.reviewer_summaries`; it updates `evaluators.data_technician_02` only for durable data facts that change foundation data support.
- Method/job subskills append or update one compact record in `subskill_analyses` only when activated. Discovery sidecar records are optional and also use `subskill_analyses` when traceability is useful. Do not duplicate full method/job or discovery feedback in `analysis.production_loop.reviewer_summaries`. Recommended-but-not-activated method/job subskills stay in `analysis.recommended_method_job_subskills`.
- Report Writer production-reviewer mode records a compact entry in `analysis.production_loop.reviewer_summaries` and updates `analysis.report_writer_20`. Handoff mode writes `analysis.report_writer_20` plus artifacts.
- Full code, diagnostics, plots, tables, and draft material go to `analyses/` or `artifacts/`.

## Unified Blocking Signal

Main-level blocking has only two gate destinations: `foundation_gate.blockers` and `production_gate.blockers`. Subskills do not write those lists directly. They inform the main skill with the same optional signal shape wherever they already report feedback:

```yaml
blocking_signal:
  blocks_current_phase: false
  requires_previous_phase_recheck: false
  target_phase: null
  severity: "none"
  reason: null
  affected_sections: []
```

Foundation evaluators put `blocking_signal` on blocking `requests_for_main_skill` entries. Production reviewers put it on their production handback or activated `subskill_analyses` record. If `target_phase: foundation` and `requires_previous_phase_recheck: true`, the main skill decides whether to record `analysis.production_loop.foundation_recheck` and return to foundation review.

If production reveals a severe flaw in causal question, timing, constructability, route fit, identification logic, or required data, record it under `analysis.production_loop.foundation_recheck`. The main skill may then choose `return_to_foundation`, set `project.current_phase: foundation`, mark `production_gate.status` as `not ready` or `blocked`, and select the relevant foundation evaluators.

## Conflict Resolution

The main skill arbitrates conflicts among reviewers. A subskill can recommend an action, but cannot open a gate, upgrade claim strength, or overrule another subskill's blocker.

When reviewer feedback conflicts, higher-priority blockers dominate until resolved, explicitly deferred as nonfatal, or narrowed to a weaker claim. Priority order:

1. Data constructability, timing, leakage, support, and reproducibility blockers from Data Technician.
2. Identification, variable-role, forbidden-adjustment, and causal-timing blockers from DAG Builder.
3. Design feasibility, estimand, comparator, population, and route-fit blockers from Design Planner or the activated method/job subskill.
4. Method diagnostics, sensitivity, package feasibility, and artifact completeness from production reviewers.
5. Reportability, claim language, presentation, and audience fit from Report Writer.

For example, if Data Technician says the treatment is not constructible, a method subskill says the model can run, and Report Writer says the presentation is readable, the main skill treats the project as not ready. It records the conflict in the active loop, selects the reviewer needed to adjudicate constructability, and keeps the relevant gate non-ready until the conflict is resolved or the claim is narrowed.

## Production Gate

The main skill opens `production_gate.status: ready` only when:

- `foundation_gate.status` is `ready`;
- the route is ready or committed;
- reportable evidence exists;
- diagnostics are complete, explicitly deferred, or not needed;
- required outputs are produced or explicitly deferred;
- no unresolved foundation recheck remains;
- `production_gate.handoff_summary` says what Report Writer should combine and what limitations/claim strength remain.

Production-gate readiness means Report Writer can take over final report synthesis from the recorded project state. It does not upgrade the claim beyond the gate and diagnostics.

## Report Writer Boundary

`20-report-writer` has two roles:

- production reviewer before `production_gate.status: ready`;
- handoff writer after `production_gate.status: ready` and `production_gate.can_handoff_to_report_writer: true`.

Before handoff, it gives reportability and presentation feedback but does not write the final report. After handoff, it uses the Report Writer final report template to combine the foundation record, production loop, method/job handoff notes, Data Technician warnings, diagnostics, figures, tables, artifacts, limitations, and claim-strength constraints into final-ready report or presentation material. It should not start a new interaction loop unless a required handoff input is missing.
