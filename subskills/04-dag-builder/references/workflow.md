# Workflow: Causal-Structure Audit and Analytic Handoff

## Purpose

Use this workflow after `03-design-planner` has proposed, shortlisted, or asked to audit a candidate design. The DAG builder's job is to turn that design into practical causal logic: assumptions, timing, variable roles, identification, adjustment or non-adjustment strategy, sensitivity needs, and downstream analytic handoff.

In the main-skill architecture, this workflow is the backend practical causal-logic evaluator. It maintains `project.yaml > evaluators.dag_builder_04` and feeds compact analytic implications to the main skill, feedback to the design planner, data checks to the data inspector, domain checks to Domain Helper, and handoff notes to method subskills.

Start each evaluator pass by reading `evaluator_loop`. The trigger, selected next action, action queue, readiness signals, summaries, and loop-control state tell DAG Builder whether this is a targeted causal-logic audit, route-hypothesis review, route-commitment check, user-directed support, or a loop-breaking pass. Answer that selected action first before adding broader graph alternatives.

Coordinate continuously with:

- `evaluators.design_planner_03` for the design to audit, comparison, population, time zero, follow-up, route hypotheses, preferred route ID, and specific design questions;
- `routes.current_route_id` and `routes.hypotheses` for the main skill's promoted route state;
- `evaluators.domain_helper_01` for field context, scientific conventions, mechanisms, candidate formulations, and domain cautions;
- `evaluators.data_inspector_02` for observed variables, measurement timing, missingness, censoring, clustering, network links, data-enabled opportunities, and data-readiness limitations;
- `main_skill` and `evaluator_loop` for user goal, selected action, action priority, deliverable, and explanation depth.

Do not lead the high-level design conversation. If causal logic breaks the proposed design, record the problem, possible causal-logic alternatives, and feed them back to `03-design-planner`.

## Stage 1: Receive the Design

Start from the current design planner record:

- candidate or preferred design;
- action/exposure and comparator;
- target and analysis populations;
- time zero and follow-up;
- assignment/exposure process;
- design status: promising, feasible, fragile, blocked, or unknown;
- route hypotheses and selected route ID when available;
- design questions that `03` wants audited.

If these are too vague, return a clarification request to `03`/main skill rather than inventing a design.

## Stage 2: Build the Smallest Useful Structure

Choose the lightest causal-structure representation that supports the analytic decision:

- timing table when timing is the main issue;
- variable-role map when adjustment or forbidden variables are the main issue;
- DAG when confounding, mediation, colliders, selection, instruments, or transport matter;
- SWIG-style structure when interventions and counterfactual comparisons need emphasis;
- selection/censoring diagram when observed data depend on follow-up, survival, or inclusion;
- alternative structures when plausible causal stories imply different adjustment or handoff decisions.

Mark uncertain edges, uncertain timing, and unobserved variables explicitly.

## Stage 2b: Review Route And Data-Enabled Hypotheses

When `03` or `02` proposes a route, audit it as a causal claim rather than as a design decision. For each route or opportunity worth keeping:

- identify the required causal story and target effect;
- state which assumptions carry identification;
- mark whether the logic is supported, fragile, blocked, needs design revision, or needs clarification;
- record required domain checks, data checks, design implications, and method handoff;
- keep feasibility decisions with `03-design-planner`.

## Stage 3: Classify Roles for the Proposed Design

For the design's target effect, classify:

- pre-treatment common causes;
- pre-treatment precision variables;
- effect modifiers;
- mediators or intermediate variables;
- colliders and selection variables;
- instruments or encouragements;
- missingness, censoring, and observation-process variables;
- post-treatment variables to avoid for a total effect;
- important unmeasured or unavailable variables;
- variables requiring data timing checks from `02`.

The same variable may need different classification under a different design, time zero, or estimand. If that happens, feed the ambiguity back to `03`.

## Stage 4: Audit Identification

For a total effect:

- identify forbidden variables: mediators, colliders, descendants of treatment, post-treatment variables, and selection variables;
- find candidate adjustment sets among variables measured before treatment/time zero;
- prefer adjustment sets that are scientifically justified, measured reliably, and preserve support;
- record assumptions needed for exchangeability, positivity, consistency, and no relevant interference when they matter.

For other targets:

- direct or mediated effects: route to mediation and record mediator-outcome and treatment-induced confounding concerns;
- unmeasured confounding: ordinary adjustment is insufficient; consider sensitivity analysis or alternative designs only if `03` supports them;
- IV, RD, DiD, synthetic control, or front-door logic: audit the structural conditions and hand off to the relevant method subskill if the design can support them;
- selection, censoring, missingness, or transport: record the selection/observation structure and route to the relevant method or sensitivity workflow.

## Stage 5: Produce the Analytic Skeleton

Record:

- target effect or estimand family;
- supported status: supported, fragile, blocked, needs design revision, or unknown;
- candidate and preferred adjustment sets, when relevant;
- forbidden variables;
- non-adjustment strategy needed, if any;
- required data checks before implementation;
- diagnostics or sensitivity checks;
- assumptions and limitations to report;
- downstream method handoff.
- supported scope, route ID, rationale, and what the route is not supported for.

This is not final model code. It is the causal skeleton that method subskills should implement or challenge.

## Stage 6: Feedback

Return compact feedback:

- to `main_skill`: plain-language assumptions and analytic status;
- to `03-design-planner`: design features that need revision, clarification, or fallback;
- to `02-data-inspector`: variable timing or data availability checks needed before implementation;
- to `01-domain-helper`: mechanisms, timing claims, or field-common assumptions that need domain review;
- to method subskills: adjustment set, forbidden variables, diagnostics, sensitivity checks, and warnings.

## Suggested Response Pattern

```markdown
For the design currently proposed by `03`, the causal structure looks [supported/fragile/blocked/unknown].

The main assumption load is [plain-language assumptions]. For a total-effect analysis, the candidate adjustment variables are [set], and these variables should not be adjusted for: [forbidden variables].

Before implementation, `02` should verify [data timing/availability checks]. If that fails, `03` should consider [design revision or fallback].
```

## Code Template Index

Root template:

- `scripts/python/dowhy_point_treatment_template.py`

Use this only after the proposed design, graph assumptions, variable timing, and target effect are explicit. For R DAG checks, prefer short project-specific `dagitty` code generated from the variable names and graph.

## Literature and Software Map

For key papers, textbooks, and software notes, read `literature_and_software.md` in this folder.
