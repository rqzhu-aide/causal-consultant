# Workflow: Causal DAG and Identification

## Purpose

Use this workflow when the user needs causal-structure support: a DAG, variable-role map, target-trial framing, adjustment set, or identification audit before estimation.

In the main-skill architecture, this workflow is the backend causal-logic record. It should usually produce a better route and clearer assumptions, not a final estimator by itself. The main skill normally speaks with the user; this workflow maintains the `04-dag-builder` YAML entry and feeds method-selection implications to the main skill.

Coordinate continuously with:

- main skill state for user goal, deliverable, understanding, and explanation depth;
- `01-domain-helper` for domain terminology, substantive constraints, and plausible causal roles;
- `02-data-inspector` for actual or conceptual variables, measurement timing, missingness, censoring, clustering, network links, and data-quality constraints;
- `03-design-planner` for the actual or planned design, assignment/exposure mechanism, time zero, follow-up, and feasibility constraints.

Use this record as the main causal-logic basis for selecting methods after the high-level design route is framed, but never select methods from causal logic alone. Check whether the data and design records can actually support the route.

## Stage 1: Question and Timing

Start with the practical question:

- treatment or action;
- comparator;
- outcome;
- target population;
- time zero;
- follow-up window;
- requested deliverable.

If any of these are unclear, ask the smallest number of questions needed to proceed. Do not ask the user to provide a formal DAG unless they already have one.

## Stage 2: Variable Role Map

Classify variables in a table before recommending adjustment:

- pre-treatment common causes of treatment and outcome;
- pre-treatment precision variables;
- effect modifiers;
- mediators or post-treatment variables;
- colliders or selection variables;
- instruments or encouragement variables;
- missingness, censoring, or sample-inclusion variables;
- unmeasured common causes;
- outcome variables or outcome proxies.

Plain-language rule: ask whether the variable was known before treatment and whether it helped cause treatment choice, outcome risk, both, or selection into the dataset.

## Stage 3: Provisional Structure

Create one of these, depending on what helps most:

- a lightweight DAG;
- a target-trial protocol;
- a SWIG-style intervention diagram;
- a variable-role map;
- a selection/censoring diagram;
- a small set of alternative plausible graphs.

Mark uncertainty explicitly. If two plausible graphs imply different adjustment sets, keep both until domain knowledge resolves the difference or report the result as a sensitivity concern.

## Stage 4: Identification Check

For a total effect:

- identify forbidden variables: mediators, colliders, descendants of treatment, selection variables, and post-treatment variables;
- find candidate adjustment sets among pre-treatment variables;
- prefer adjustment sets that are scientifically justified, measured reliably, and preserve overlap;
- route to matching/weighting or DR/ML only after the adjustment variables are structurally defensible.

For direct or mediated effects:

- route to mediation;
- specify whether the target is total, controlled direct, natural direct/indirect, or interventional direct/indirect;
- record mediator-outcome confounding and treatment-induced confounding concerns.

For unmeasured confounding:

- check whether IV, front-door, RD, DiD, negative controls, sensitivity analysis, or prospective data collection is plausible;
- do not pretend ordinary adjustment solves missing common causes.

For selection, censoring, or missingness:

- draw or describe the selection node;
- route to missingness/measurement/selection;
- avoid complete-case adjustment without a selection argument.

## Stage 5: Tool Use

Use tools only after the structure is meaningful:

- `dagitty` or `ggdag` for adjustment sets, implied independencies, and visualization;
- `DoWhy` for model-identify-estimate-refute workflows, especially when Python is requested;
- `causaleffect` for do-calculus/ID-style identification when simple adjustment is insufficient;
- discovery packages only through `subskills/18-causal-discovery/`.

Software output is not a proof of causal assumptions. It checks implications of the graph the user supplied.

## Stage 6: Output and Route Handoff

Return a compact result:

- causal question;
- variable role map;
- graph status and uncertainties;
- candidate and preferred adjustment sets;
- forbidden variables;
- assumptions in plain language;
- tests or negative controls that could reveal problems;
- next subskill route for estimation or reporting.

If identification fails, state what is missing and offer a fallback:

- collect missing confounders;
- redefine the estimand or target population;
- use sensitivity/descriptive analysis;
- consider IV/RD/DiD/front-door only if the design actually supports it;
- plan future data collection.

## Suggested Response Pattern

```markdown
I would treat this as a DAG/identification problem because [reason].

The causal comparison seems to be [A] versus [comparator] for [Y] starting at [time zero].

Before choosing a model, I would classify the variables this way: [short role map].

Under the current graph, a defensible adjustment set is [set], and these variables should not be adjusted for in a total-effect analysis: [forbidden variables].

This depends on [plain-language assumption]. If [unresolved structural concern] is true, I would route to [subskill/fallback].
```

## Code Template Index

Root template:

- `scripts/python/dowhy_point_treatment_template.py`

Use this only after graph assumptions, variable timing, and the target estimand are explicit. For R DAG checks, prefer short project-specific `dagitty` code generated from the variable names and graph.

## Literature and Software Map

For key papers, textbooks, and software notes, read `literature_and_software.md` in this folder.
