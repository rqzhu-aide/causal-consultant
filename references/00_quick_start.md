# Quick Start for Agents

Use this file when you need the shortest possible operating procedure.

## Minimal Workflow

1. Identify what the user wants next: learn, get design help, audit data, plan analysis, draft code, interpret results, or write a report.
2. Restate the likely causal question or learning goal in the user's domain language.
3. Clarify only the treatment/intervention, comparator, outcome, time zero, follow-up, target population, and data structure details needed for the next step.
4. When durable memory is useful, create or reuse a dated state folder with `project.yaml`, `analyses/`, and `artifacts/`; otherwise track the state conceptually.
5. Keep the main skill and four backend foundation subskills active concurrently: the main skill speaks with the user, tracks goal/alignment, and selects next actions; `evaluators.domain_helper_01`, `evaluators.data_technician_02` (Data Technician), `evaluators.design_planner_03`, and `evaluators.dag_builder_04` act as state evaluators that update their own sections and report summaries, implications, and requests back to the main skill.
6. In `project.yaml > evaluators.data_technician_02`, set `data_status` as existing, partially existing, conceptual, or unknown; then set a route- or next-step-specific `readiness_scope`.
7. If data do not exist yet, create a study or data-collection blueprint while keeping the data track labeled as conceptual.
8. Use `design_planner_03` to shortlist 1 to 3 feasible high-level design strategies, state the key conditions, and identify route-changing user questions.
9. Use `dag_builder_04` to audit the proposed design's causal logic, identification, adjustment implications, assumptions, and analytic handoff, checked against `data_technician_02` data readiness and `design_planner_03` design feasibility.
10. Track `foundation_gate.status` as `not needed`, `exploratory`, `ready`, `blocked`, or `unknown`. Use `ready` only when a named route, evaluator records, and load-bearing assumption review are reconciled enough to support causal commitment.
11. If two consecutive evaluator rounds repeat the same blocker, cross-subskill dependency, or readiness state, record `evaluator_loop.loop_control` and stop the full loop. Choose one loop-break action: ask one decisive user question, make a permissible working assumption, surface a load-bearing assumption, demote/block the route, choose a fallback, or proceed user-directed with limits.
12. Route to one or more candidate method subskills once the rough design is known. For supported causal work, wait for gate status `ready`. If the user asks for model execution, accepts a caveated analysis, repeatedly prefers continuation, signals urgency, or otherwise makes clear that they want progress while the gate is `exploratory` or `blocked`, give a brief validity warning, record acknowledged limits under `main_skill.user_directed`, and set `analysis.route_commitment_status` to `user-directed`.
13. If a subskill rejects a route, record why and return to the route shortlist.
14. Before substantial method execution, ask the Data Technician to record method-fit suggestions when multiple methods are plausible or the data structure could change implementation.
15. When the gate becomes ready, briefly confirm the planned analysis with the user before running substantial models: treatment/exposure, comparator, outcome, unit/time, method family, diagnostics or sensitivity checks, and intended claim strength. If the user accepts user-directed execution, confirm the caveated plan in the same way.
16. Build analysis code and run a first pass only after the route, estimand, data suitability, and execution plan are clear enough or user-directed limits are recorded and acknowledged.
17. After a first pass, summarize the preliminary result and recommend diagnostics or sensitivity checks. Do not write a final report until those checks are complete, explicitly deferred, or unnecessary for the requested deliverable.
18. Report estimates with assumptions, diagnostics, limitations, and appropriately cautious causal language. User-directed model execution may include complex model fitting, but it does not upgrade the validity label.

## Minimal Clarifying Questions

Use these as a menu, not a script. For a broad cold-start request with no project detail, ask only one warm opener first, such as "Yes, of course. What do you have in mind?" or "Are you trying to estimate an effect, plan a study, or check whether your data can support a causal claim?"

After the user gives a dataset, decision, treatment, outcome, or method goal, choose only the next question that would change the next action. Ask two questions only when they are tightly related and both are needed for the same decision:

1. What do you want to do next: learn, choose a design, audit the data, draft code, interpret results, or write a report?
2. What is the treatment or intervention, and what is the comparator?
3. What outcome do you want to affect, and when is it measured?
4. What is the unit of analysis and the target population?
5. Was treatment randomized, assigned by a policy/cutoff/instrument, or chosen observationally?
6. What do rows represent, and are there repeated observations, censoring, missingness, clustering, or spillovers?
7. What variables were measured before treatment that may affect both treatment and outcome?

## Minimal Output

For any proposed route or analysis, produce:

```markdown
Current mode:
Causal question or learning goal:
Existing data and data structure:
Data status and readiness scope for `evaluators.data_technician_02`:
Data Technician method-fit suggestions:
Foundation components:
Foundation gate status:
Execution stage and plan confirmation:
Load-bearing assumption review:
User-directed continuation, if active: intent basis, warning, acknowledged limits, requested/allowed scope, prohibited claims
Domain context:
Main skill/user-facing summary:
Route shortlist:
Activated subskills:
Provisional estimand:
Key route assumptions in plain language:
Data suitability concerns:
Diagnostics or checks needed:
Next step:
Known limitations:
```

## Escalation Rule

If the user supplies enough information to make progress, do not stall with more questions. Continue with provisional assumptions and clearly label them. Provisional assumptions can support exploration, design planning, or a quick first pass; they should not silently replace user confirmation for treatment, outcome, method, or final-report readiness.
