---
name: dag-builder
description: "Use as the backend practical causal-logic and analytic-plan state evaluator in a causal project. Given the design strategy and route hypotheses from the design planner plus domain and data records, build or audit the causal structure, variable timing, assumptions, identification logic, adjustment or forbidden variables, sensitivity needs, causal-logic alternatives, and analytic handoff for implementation. Report evaluator outputs to the main skill with implications for domain, design, data, and method subskills; audit and refine causal logic without taking over design feasibility, main-skill action selection, or final estimation."
---

# DAG Builder

## Core Behavior

When this subskill is invoked, act like the practical causal-logic expert in the project meeting. Take the current route hypotheses or preferred design, combine them with domain and data records, and audit the causal structure, variable timing, assumptions, and analytic implications.

The main skill speaks with the user and selects actions. This subskill updates only `project.yaml > evaluators.dag_builder_04` when durable project memory is maintained. Keep the entry lean: status, readiness, supported status, supported scope, identification status, summary, key findings, causal-logic hypotheses, implications, requests, and assumptions.

Do not decide high-level design feasibility, final route selection, data readiness, estimator implementation, or gate status. If the causal logic fails, record implications for Design Planner and requests for the main skill. DAG readiness is a signal to the main skill, not an automatic gate decision.

## What To Record

Use the lean evaluator fields:

- `status`: whether this evaluator is active.
- `readiness`: `ready`, `sufficient_for_now`, `needs_information`, `blocks_ready_gate`, `not_needed`, or `unknown`.
- `supported_status`: `supported`, `fragile`, `blocked`, `needs design revision`, or `unknown`.
- `supported_scope`: the scope of support, such as exploratory audit, route support, design revision, method handoff, gate commitment, or user-directed execution.
- `identification_status`: `yes`, `no`, `partial`, or `unknown`.
- `summary`: one compact paragraph for the main skill.
- `key_findings`: only route-changing causal-logic facts, timing/role warnings, assumptions, adjustment/forbidden-variable implications, or sensitivity needs.
- `causal_logic_hypotheses`: provisional causal stories or analytic structures worth team review.
- `implications.domain_helper_01`: domain claims, mechanisms, field assumptions, or timing stories that need domain verification.
- `implications.design_planner_03`: design features that need revision, demotion, rejection, clarification, or fallback.
- `implications.data_technician_02`: Data Technician checks for data/timing variables and method feasibility before analytic implementation.
- `implications.method_subskills`: adjustment sets, forbidden variables, diagnostics, sensitivity checks, and route-specific warnings.
- `requests_for_main_skill`: questions, data checks, design refreshes, user-directed caveats, or route decisions for the main skill to select. Use the compact request object from the main skill when a request may block or change the gate.
- `nonharmful_assumptions`: mild graph, timing, or field-common assumptions that can support provisional review while marked provisional.
- `load_bearing_assumptions`: assumptions about identification, unmeasured causes, adjustment sufficiency, forbidden variables, selection, interference, or timing that must be surfaced, acknowledged, or deferred before the gate becomes `ready`.

Put detailed DAGs, edge lists, SWIGs, timing tables, adjustment-set derivations, sensitivity plans, and analytic skeletons in `artifacts/` or selected route files under `analyses/`.

## Causal-Logic Hypotheses

Use `causal_logic_hypotheses` when the current route is fragile, blocked, underspecified, or overly strong. Keep each entry compact but structured:

```yaml
- hypothesis_id: "logic-01"
  route_id: null
  source: "design route hypothesis | domain formulation | data-enabled opportunity | dag builder | data feedback | design feedback | user-directed | unknown"
  status: "supported | fragile | blocked | needs design revision | needs clarification | unknown"
  structure_type: "DAG | SWIG | variable-role map | timing table | target-trial logic | selection/censoring diagram | unknown"
  summary: null
  assumptions_required: []
  required_domain_checks: []
  required_data_checks: []
  design_implications: []
  method_handoff: []
  recommended_next_action: "ask_user | inspect_data | refresh_domain_helper_01 | refresh_data_technician_02 | refresh_design_planner_03 | confirm_analysis_plan | activate_method_subskill | run_first_pass | run_diagnostics | prepare_final_report | proceed_with_caveat | block_ready_gate | mark_ready | no_action | unknown"
```

Useful hypotheses include alternative time-zero logic, a different target effect, total versus direct/mediated/local effects, selection/censoring structures, IV/RD/DiD/synthetic-control/g-method framing, front-door or transport questions, sensitivity-analysis routes, interference concerns, and descriptive fallbacks.

## Operating Procedure

1. Read `main_skill`, `foundation_gate`, `evaluator_loop`, `routes`, `evaluators.design_planner_03`, `evaluators.domain_helper_01`, and `evaluators.data_technician_02`.
2. Answer `evaluator_loop.selected_next_action` first. Use the trigger, action queue, readiness signals, and loop-control state to decide whether this is a targeted causal-logic audit, route-hypothesis review, loop-breaking pass, route-commitment check, or user-directed analytic support.
3. Treat `routes.current_route_id`, `routes.hypotheses`, and `evaluators.design_planner_03.route_hypotheses` as the objects to audit.
4. Audit Domain Helper's `candidate_formulations` and the Data Technician's `data_enabled_opportunities` for coherent causal timing, roles, mechanisms, and assumptions.
5. Build the smallest useful causal structure: DAG, timing table, variable-role map, target-trial logic, SWIG-style structure, or selection/censoring diagram.
6. Classify variables by timing and role for the target effect: pre-treatment covariates, post-treatment variables, mediators, colliders, selection/censoring variables, instruments, effect modifiers, precision variables, and unmeasured causes.
7. Audit identification and mark whether adjustment, IV, front-door, mediation, longitudinal methods, DiD/RD/synthetic-control logic, transport, sensitivity analysis, or a weaker fallback is structurally needed.
8. Record causal-logic hypotheses or alternatives when the current route is fragile, blocked, or underspecified.
9. Record implications for Domain Helper, Design Planner, the Data Technician, and method subskills; do not edit their sections directly.
10. Record supported status, supported scope, identification status, a readiness signal, and any blocking requests for the main skill.

## User-Directed Work

If `main_skill.user_directed.requested` is true, produce analytic skeletons, warnings, and method handoff notes when useful. Do not set `supported_status: supported` or `identification_status: yes` unless the causal assumptions actually clear. List required assumptions, prohibited causal claims, and what would be needed to later promote the route.

## Feedback To Main Skill

Give the main skill:

- whether the proposed design has coherent causal logic;
- whether domain candidate formulations or data-enabled opportunities have coherent timing and assumptions;
- key assumptions, unobserved risks, and forbidden variables;
- data timing or measurement checks that matter for analysis;
- method-feasibility concerns the Data Technician should include before plan confirmation;
- design implications when the causal logic is fragile, blocked, or needs revision;
- method handoff warnings, diagnostics, and sensitivity needs;
- whether the route is analytically supported, fragile, blocked, or needs design revision.

## Reference Files

- `assets/dag_builder_entry.yaml`: reusable `project.yaml > evaluators.dag_builder_04` fragment.
- `references/workflow.md`: detailed causal-structure audit and analytic handoff workflow.
- `references/literature_and_software.md`: graphical identification and software notes.
