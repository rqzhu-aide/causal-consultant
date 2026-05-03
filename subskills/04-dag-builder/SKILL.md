---
name: dag-builder
description: "Use as the concurrent backend causal-logic component in a causal project: build and check DAGs, target-trial framing, variable role and timing classification, adjustment-set selection, graphical identification, causal-structure audits, and method-selection implications before estimation or routing. Coordinate with the main skill, domain helper, data inspector, and design planner."
---

# DAG Builder

## Core Behavior

When this subskill is invoked, focus on causal structure: what comparison the user wants, which variables play which roles, and whether the requested effect is identifiable from the available design and assumptions. In the main-skill architecture, this is the backend causal-logic record that follows the higher-level design frame and translates it into identification, adjustment, and method-selection implications. It should coordinate with the main skill for the user's goal, `01-domain-helper` for substantive context and common domain risks, `02-data-inspector` for actual or conceptual variable/timing facts, and `03-design-planner` for study-design feasibility.

The main skill usually speaks with the user. This component should maintain the `04-dag-builder` YAML entry, identify what causal logic implies for routing, and pass compact findings to the main skill for user-facing conversation.

Always do these six things:

1. **Start from the causal question.** Clarify treatment/action, comparator, outcome, target population, time zero, and follow-up before drawing or checking a graph.
2. **Classify variables by role and timing.** Separate pre-treatment confounders, precision variables, effect modifiers, mediators, colliders, selection variables, instruments, censoring/missingness variables, outcomes, and unmeasured common causes.
3. **Use the graph as an assumption map.** A DAG records domain claims; it does not prove them. Mark uncertain edges, latent variables, and alternative plausible structures.
4. **Identify the estimand before the estimator.** Decide whether the structure supports a total effect, direct effect, mediated effect, local effect, transported effect, or only descriptive/predictive analysis.
5. **Check adjustment sets and forbidden variables.** Do not adjust for mediators, colliders, descendants of treatment, or selection variables when targeting a total effect unless the estimand explicitly requires that structure.
6. **Route out when needed.** If the graph implies IV, mediation, missingness/selection, interference, longitudinal treatment, causal discovery, or a quasi-experimental design, update the project spec and route to the relevant subskill.

## Coordination Role

- Use the main skill state to understand the user's goal, audience, desired deliverable, and preferred explanation depth.
- Use `01-domain-helper` to understand domain terminology, plausible common causes, mechanisms, instruments, selection processes, and timing constraints.
- Use `02-data-inspector` to ground the graph in actual or conceptual variables, IDs, timing, missingness, censoring, clusters, networks, and data-quality limitations.
- Use `03-design-planner` to check whether the causal logic is compatible with the actual or proposed assignment/exposure mechanism, time zero, follow-up plan, and measurement schedule.
- Feed method-selection implications back to the main skill. The user should hear a plain-language route recommendation, not an internal graph audit unless they ask for it.

## User-Facing Style

Be gentle and concrete. In a full project, this component's findings are usually surfaced by the main skill. Most users do not know graphical criteria. Translate the graph into plain questions:

- "What caused treatment choice?"
- "What caused the outcome?"
- "Which variables were known before treatment started?"
- "Could this variable be affected by the treatment?"
- "Could selecting this dataset depend on treatment or outcome risk?"
- "Are there important causes we do not measure?"

Do not require a formal DAG up front. If the user has enough context to proceed, create a provisional variable-role map and explain what would change if one of the uncertain arrows is wrong.

## Activation and Route-Out

Use this subskill when the user says or implies:

- "what should I adjust for", "is this a confounder", "is this a mediator/collider/instrument", or "which variables can go in the model";
- they have or want a DAG, causal graph, target trial, variable timing table, adjustment set, or assumption audit;
- the route depends on confounding, mediation, IV exclusion, selection/censoring, transportability, or interference;
- they need to decide whether a causal effect is identifiable before coding;
- causal discovery output must be interpreted before effect estimation.

Do **not** use this as the only workflow when:

- treatment was clearly randomized and the user mainly needs experiment analysis: route to `subskills/05-randomized-experiments/`;
- the user already has a credible point-treatment observational route and needs matching/weighting or DR estimation: coordinate with `subskills/06-point-treatment-observational/`, `subskills/07-matching-weighting-balance/`, or `subskills/08-doubly-robust-ml/`;
- the user wants to learn a graph from data: route to `subskills/18-causal-discovery/`;
- the main issue is time-varying treatment/confounding: route to `subskills/10-longitudinal-gmethods/`;
- mediation, interference, missingness/selection, IV, RD, DiD, survival, or genomics is the active design problem: route to that subskill and use this one only for structure support.

If no plausible graph can identify the requested effect, record the route as `rejected`, `fallback`, or `exploratory/user-forced`, explain the missing structural condition in plain language, and return to the main skill's route shortlist.

## DAG and Identification Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Use `assets/dag_builder_entry.yaml` as the reusable template. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `main_skill`, `data_inspector_02`, `dag_builder_04`, `design_planner_03`, or `analysis_routing`.

```yaml
subskill_analyses:
  - subskill_id: "04-dag-builder"
    status: "candidate | selected | rejected | fallback | support-route | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "learn DAG | classify variables | choose adjustment set | target trial framing | identify effect | audit assumptions | route support | unknown"
    coordination:
      main_skill_goal_summary: null
      domain_record_used: "01-domain-helper"
      data_record_used: "02-data-inspector"
      design_record_used: "03-design-planner"
      user_facing_summary_for_main_skill: null
    causal_question:
      treatment_or_action: null
      comparator: null
      outcome: null
      target_population: null
      time_zero: null
      follow_up: null
    estimand:
      label: "ATE | ATT | total effect | controlled direct effect | interventional direct/indirect effect | front-door effect | transported effect | local effect | unknown"
      scale: null
      interpretation: null
    graph_status:
      graph_type: "DAG | SWIG | CPDAG | PAG | variable-role map | target-trial protocol | unknown"
      nodes_recorded: []
      directed_edges: []
      uncertain_edges: []
      latent_or_unmeasured_common_causes: []
      selection_nodes: []
      alternative_graphs_considered: []
    variable_roles:
      pre_treatment_confounders: []
      precision_variables: []
      effect_modifiers: []
      mediators: []
      colliders_or_selection_variables: []
      instruments_or_encouragements: []
      missingness_or_censoring_variables: []
      post_treatment_variables_to_avoid_for_total_effect: []
      unmeasured_needed_variables: []
    identification:
      candidate_adjustment_sets: []
      preferred_adjustment_set: []
      forbidden_adjustment_variables: []
      frontdoor_possible: null
      iv_or_local_design_needed: null
      mediation_or_direct_effect_needed: null
      selection_or_transport_issue: null
      identifiable_under_current_assumptions: null
    method_selection_implications:
      plausible_method_routes: []
      routes_supported_by_graph: []
      routes_blocked_by_graph: []
      route_conditions_to_check_in_data_or_design: []
      recommended_next_subskills: []
    diagnostics_or_checks:
      timing_table_needed: null
      adjustment_set_check: null
      testable_implications_or_negative_controls: []
      sensitivity_analysis_needed: null
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(A\): treatment, exposure, or action;
- \(Y\): outcome;
- \(X\): pre-treatment covariates;
- \(M\): mediator;
- \(S\): selection or sample inclusion;
- \(U\): unmeasured common cause;
- \(G\): causal graph.

If the user uses different notation or variable names, adapt responses to the user's notation.

### DAG

A directed acyclic graph represents assumptions about causal direction and absence of cycles. Arrows are domain claims, not estimates from the dataset. Missing arrows are also assumptions.

### Intervention and estimand

A causal effect compares potential outcomes under interventions, such as \(Y(a)\) versus \(Y(a')\). Before adjustment or modeling, define the intervention, comparator, outcome timing, target population, and effect scale.

### Backdoor and adjustment

For a total effect of \(A\) on \(Y\), an adjustment set should block noncausal backdoor paths from \(A\) to \(Y\) without blocking causal paths or opening collider paths. In plain language: adjust for common causes measured before treatment; avoid variables caused by treatment or variables created by selection.

### Front-door and do-calculus

Front-door or general do-calculus identification can sometimes identify effects when unmeasured confounding prevents ordinary adjustment. These cases require strong structural claims, such as a well-measured mediator intercepting all causal paths and no unblocked confounding on the required links. Treat front-door identification as uncommon and audit carefully.

### SWIGs and target trials

For applied work, a target-trial protocol or SWIG-style intervention graph may be more helpful than a decorative DAG. Use whichever structure best clarifies eligibility, time zero, treatment assignment, follow-up, and the counterfactual comparison.

## Identification and Routing Rules

### Design-to-structure table

| Situation | Default structural task | Likely next route |
|---|---|---|
| User asks what to adjust for | Build timing table, DAG or role map, then find valid adjustment sets | `02-data-inspector`, `06-point-treatment-observational`, `07-matching-weighting-balance`, or `08-doubly-robust-ml` |
| User has observational point treatment | Check confounders, post-treatment variables, overlap-relevant modifiers | `06-point-treatment-observational` plus `07-matching-weighting-balance`/`08-doubly-robust-ml` |
| User wants direct/indirect effects | Distinguish total, controlled direct, natural, and interventional effects | `16-mediation` |
| User proposes an instrument | Audit exclusion, independence, relevance, monotonicity as graph claims | `13-instrumental-variables` |
| User conditions on selection, complete cases, censoring, or responders | Map selection/censoring node and causes | `02-data-inspector` |
| User worries about spillovers | Replace ordinary DAG with exposure mapping or interference structure | `17-interference-spillovers` |
| User has time-varying treatment or confounders | Use longitudinal structure, not a single baseline DAG | `10-longitudinal-gmethods` |
| User asks whether data can learn the graph | Route to discovery and treat output as uncertain graph/equivalence class | `18-causal-discovery` |
| User has no data yet | Use target trial and prospective variable map | `03-design-planner` |
| User has a clean randomized experiment | Use assignment mechanism summary; DAG optional | `05-randomized-experiments` |

### Adjustment rules

- Prefer pre-treatment common causes of treatment and outcome.
- Include design variables that controlled treatment assignment or sampling when relevant.
- Include strong outcome predictors for precision only when they are not post-treatment or colliders.
- Do not adjust for mediators when estimating a total effect.
- Do not adjust for colliders or descendants of colliders.
- Do not adjust for instruments solely because they predict treatment; this can hurt precision and overlap and may amplify bias.
- Do not use variables measured after time zero as baseline confounders unless the estimand is explicitly longitudinal or direct-effect.
- If multiple minimal valid sets exist, prefer the one that is easiest to measure reliably, avoids severe missingness, preserves overlap, and is scientifically explainable.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `dagitty`: draw and parse DAGs, find adjustment sets, test d-separation implications, enumerate equivalent models, and identify instruments.
- `ggdag`: tidyverse plotting and visualization around `dagitty` objects.
- `causaleffect`: implement ID-style graphical identification for interventional distributions when simple adjustment is insufficient.
- `pcalg`: use only when the task is causal discovery or equivalence-class reasoning; coordinate with `subskills/18-causal-discovery/`.

### Python preferred stack

- `DoWhy`: model-identify-estimate-refute workflow using graph-based identification criteria. Useful for transparent workflow, but refuters do not prove identification assumptions.
- `networkx` or `graphviz`: useful for lightweight graph representation and visualization.
- `ananke`, `causalgraphicalmodels`, or similar packages may be useful for specialized graph queries, but check maintenance and feature support before recommending.
- `causal-learn` belongs primarily to causal discovery, not ordinary adjustment-set selection.

When the user proposes another tool, check whether it distinguishes identification from estimation, supports the graph class being used, and handles latent variables, selection, or equivalence classes if those matter.

## Data and Graph Construction Rules

1. Define time zero before classifying variables.
2. Separate the causal unit from the row unit. Aggregate or reshape data before graph work if rows are visits, claims, events, sessions, or repeated measurements.
3. For each variable, record measurement time, causal role, whether it is measured, and whether it is eligible for total-effect adjustment.
4. Represent important unmeasured common causes explicitly as latent variables when they change identification.
5. Mark uncertain arrows rather than hiding uncertainty.
6. Treat sample selection, censoring, missingness, and complete-case indicators as variables that may be caused by treatment or outcome risk.
7. Do not use automated feature importance, p-values, or treatment prediction alone to define confounders.
8. Do not let the outcome result decide which variables belong in the DAG.
9. For high-dimensional covariates such as text, images, claims, omics, or histories, define auditable pre-treatment summaries before adjustment.
10. If the graph is too uncertain, compare a small number of plausible graphs and report which adjustment sets remain valid across them.

## Required Checks

### Structural checks

- treatment, comparator, outcome, time zero, follow-up, and target population are defined;
- all adjustment variables are measured before treatment for a total-effect analysis;
- proposed adjustment set blocks confounding paths without conditioning on forbidden variables;
- latent variables and selection nodes are documented when they matter;
- route-out triggers are recorded when the graph indicates a more specific subskill.

### Graphical diagnostics

Use when data and graph permit:

- list minimal and canonical adjustment sets;
- check whether proposed covariate set is a valid adjustment set;
- list implied conditional independencies or local tests;
- compare adjustment sets across plausible alternative DAGs;
- use negative controls or placebo variables when domain knowledge supplies them;
- plan sensitivity analysis for unmeasured confounding when key common causes are missing.

Do not call a conditional independence test proof that the DAG is correct. Tests can reveal incompatibilities, but many causal assumptions are untestable from one observed distribution.

## Failure Modes and Guardrails

Escalate warnings when:

- the intervention or comparator is vague;
- time zero is after treatment, outcome, or selection has already occurred;
- the adjustment set includes mediators, colliders, descendants of treatment, or selection variables for a total effect;
- important causes of both treatment and outcome are unmeasured;
- the graph assumes away a direct path, exclusion restriction, or selection process without a design argument;
- causal discovery output is treated as a confirmed DAG;
- a statistically selected model is treated as an identification strategy;
- front-door or IV identification is claimed because a variable is merely predictive;
- competing plausible graphs imply different adjustment sets;
- the user wants final causal code before the causal structure is stable enough.

## Step-by-Step Operating Procedure

1. Restate the causal question in domain language.
2. Define treatment/action, comparator, outcome, target population, time zero, and follow-up.
3. Build a variable timing and role table from user knowledge, schema, or codebook.
4. Draft a lightweight DAG, target-trial protocol, SWIG, or variable-role map. Mark uncertainty.
5. Decide whether the target is total effect, direct effect, mediated effect, transported effect, local effect, or route support.
6. Identify forbidden adjustment variables for the target effect.
7. Find candidate adjustment sets or state why adjustment cannot identify the effect.
8. Check whether another subskill should own the active design problem.
9. Record assumptions, open questions, and limitations in the project specification.
10. If code is requested, use `dagitty`, `DoWhy`, or another suitable tool to express the graph and check adjustment, then route to the estimation subskill for final analysis code.

## Output Template

```markdown
### DAG / Identification Analysis

#### 1. Causal question
- Treatment/action:
- Comparator:
- Outcome:
- Time zero and follow-up:
- Target population:
- Target estimand:

#### 2. Variable role map
- Pre-treatment confounders:
- Precision variables:
- Effect modifiers:
- Mediators:
- Instruments:
- Colliders/selection variables:
- Missingness/censoring variables:
- Unmeasured variables:

#### 3. Graph status
- Graph type:
- Key arrows:
- Uncertain arrows:
- Latent variables:
- Alternative plausible graphs:

#### 4. Identification result
- Candidate adjustment sets:
- Preferred adjustment set:
- Forbidden variables:
- Non-adjustment route needed:
- Identifiable under current assumptions:

#### 5. Checks and next steps
- Testable implications or negative controls:
- Sensitivity analysis:
- Route to activate next:
- Fatal flaws or major limitations:
- Open questions:
```

## Related Subskills

- `subskills/06-point-treatment-observational/`: primary route for measured-confounding point-treatment effects.
- `subskills/07-matching-weighting-balance/`: adjustment-set output can feed matching/weighting.
- `subskills/08-doubly-robust-ml/`: adjustment-set output can feed AIPW, TMLE, or DML.
- `subskills/10-longitudinal-gmethods/`: use when treatment/confounding changes over time.
- `subskills/13-instrumental-variables/`: use when the graph requires an instrument.
- `subskills/16-mediation/`: use when direct/indirect effects are targeted.
- `subskills/17-interference-spillovers/`: use when ordinary no-interference structure fails.
- `subskills/18-causal-discovery/`: use when learning graph structure from data.
- `subskills/02-data-inspector/`: use when sample selection, missingness, or censoring affects identification.
- `subskills/03-design-planner/`: use when planning future data collection.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For the literature and software map behind this subskill, read `references/literature_and_software.md`. For the reusable YAML entry, use `assets/dag_builder_entry.yaml`.
