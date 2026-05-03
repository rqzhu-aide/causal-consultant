# Intake and Causal Project Specification

The intake stage transforms a vague request into an evolving causal project specification. Ask only the questions needed for the next routing decision. The goal is to understand the user's need and data structure well enough to narrow the analysis route, not to force a full form at the start.

Use `assets/causal_project_spec_template.yaml` as the canonical schema when a concrete file is useful.

## Main Skill Triage

First identify the interaction mode:

| User need | Signs | Next step |
|---|---|---|
| Learning | User asks what a causal idea, assumption, design, or method means | Explain in plain language and use examples; do not force a project spec |
| Orientation | "Can I estimate...", "What should I do?", vague causal language | Explain what is knowable, ask 1-4 high-value questions if needed |
| Prospective design planning | No dataset yet, planning a study, deciding what to collect | Draft target trial/design options, minimum data schema, measurement plan |
| Design triage | User has treatment/outcome/data context | Build a route shortlist and feasibility checklist |
| Data structure audit | User has columns, schema, or messy data | Map rows, units, timing, variables, and possible feature construction |
| DAG and estimand | User asks what to adjust for or assumptions are unclear | Elicit DAG/variable roles before estimator choice |
| Analysis plan | User wants a plan or has a chosen route | Specify route status, estimand, assumptions, diagnostics, and candidate implementation resources |
| Code drafting | User asks for R/Python code | Confirm design is explicit enough, then adapt templates |
| Result interpretation | User has outputs or estimates | Review diagnostics, interpret scale, decide whether to iterate |
| Reporting | User needs methods/results/write-up | Use report template and assumption ledger |

If the user's request is descriptive or predictive rather than causal, explain the difference and offer the safer workflow.

## Foundation Components

Maintain the main skill and four backend foundation subskills concurrently once a concrete causal project is being formed. The user should experience one coherent conversation led by the main skill; the backend subskills maintain records that make that conversation informed.

- `main_skill`: tracks user goal, desired deliverable, user understanding, communication style, understanding confidence, project alignment, and next conversation moves.
- `01-domain-helper`: tracks domain context, user terminology, common working pictures, substantive constraints, domain-specific data expectations, and domain-specific causal/design risks.
- `02-data-inspector`: tracks actual or expected data structure. In its YAML entry, set `data_existence_status` as existing, partially existing, conceptual, or unknown; then add the companion data-basis label.
- `03-design-planner`: tracks actual or planned design, feasible designs, ideal-design comparisons, data requirements, variable-to-design fit, and design gaps.
- `04-dag-builder`: tracks causal structure, variable timing, DAG or target-trial logic, assumptions, identification, adjustment concerns, and method-selection implications.

The backend foundation subskills are not alternatives. They provide different project memory. Analysis/modeling subskills are selected after these components make the user goal, domain context, data situation, design options, and causal logic clearer. Design planning in `03-design-planner` gives the high-level feasible study route; `04-dag-builder` then checks whether the causal logic, identification, adjustment strategy, and method-selection implications are defensible. Both are constrained by domain facts from `01-domain-helper` and data facts from `02-data-inspector`.

## Prospective Design Planning

Use this mode when the user does not yet have data, is planning data collection, or wants to know which data would make later causal analysis possible.

Do not ask for a dataset or code first. Instead:

1. Define the causal question, target population, treatment, comparator, outcome, time zero, and follow-up.
2. Sketch the ideal target trial or strongest feasible quasi-experiment.
3. Use `01-domain-helper` to record domain terms and common working pictures, then create a preliminary design diagram, target-trial sketch, DAG, or variable-role map when useful.
4. Compare 1 to 3 feasible design routes and list the data and causal assumptions each route would require.
5. Recommend a minimum data schema and measurement schedule.
6. Identify diagnostics and sensitivity analyses that the planned data should make possible.
7. Name fallback routes if the preferred design is infeasible.

Prospective planning output should usually be a study/data blueprint, not analysis code.

### Prospective Planning Fields

```yaml
main_skill:
  user_goal:
    primary_intent: "design study"
  communication_plan:
    conversation_style: "suggest-and-invite | suggest-and-confirm"
domain_helper_01:
  status: active
  working_pictures:
    common_working_pictures: []
  domain_data_expectations:
    likely_units: []
    likely_row_structures: []
data_inspector_02:
  data_existence_status: conceptual
  data_basis: "conceptual data"
  evidence_source: "study plan | user description | none | unknown"
design_planner_03:
  design_context:
    actual_or_planned: "planned | hypothetical"
  feasibility:
    feasible_designs: []
    preferred_design: null
    fallback_designs: []
    minimum_data_to_collect_or_verify: []
    measurement_plan: []
    future_diagnostics_enabled: []
    design_constraints: []
    design_gaps: []
```

Do not add a separate top-level prospective schema unless the project truly needs it. Prospective planning details should live primarily in `design_planner_03`, with `data_inspector_02` labeled as conceptual unless actual or partial data appear.

## Core Intake Fields

### Scientific question

Convert the user's goal into the form:

> Among population `P`, what is the effect of intervention `A=a` versus comparator `A=a'` on outcome `Y` measured over follow-up window `T`?

If the user wants mechanisms, heterogeneity, policy rules, or graph discovery, state that explicitly instead of forcing a simple ATE framing.

### Treatment/intervention

Clarify:

- whether treatment is binary, categorical, continuous, ordinal, multivalued, time-varying, cluster-level, policy-level, or encouragement/instrumental;
- whether it is well-defined enough that different analysts would agree who is treated;
- whether treatment has versions that need separate definitions;
- when treatment starts and whether there is a grace period;
- whether adherence, compliance, switching, or exposure intensity matters.

### Comparator

Clarify:

- untreated/no intervention;
- usual care;
- alternative active treatment;
- lower dose;
- different policy;
- threshold just below cutoff;
- never treated versus not-yet-treated;
- another static or dynamic regime.

### Outcome

Clarify:

- outcome type: continuous, binary, count, ordinal, survival/time-to-event, recurrent event, competing risk, longitudinal, time series;
- measurement time and follow-up window;
- scientific scale: mean, risk, rate, survival probability, RMST, cumulative incidence, policy value, or another quantity;
- whether outcome can occur before treatment;
- whether death or competing events affect interpretability.

### Time zero

Time zero is the start of causal follow-up. It must be defined before or at treatment assignment/initiation. It should not depend on future events.

Ask:

- When does a unit become eligible?
- When is treatment assigned or initiated?
- When does outcome follow-up start?
- Are treated and comparator groups aligned at the same eligibility time?

### Unit, row structure, and population

Clarify:

- scientific unit: person, visit, hospital, county, school, product, gene, SNP, time point, network node, market, etc.;
- row-level unit in the dataset;
- whether rows are one per causal unit, repeated observations, event rows, visits, claims, clustered units, panel unit-times, or time-series observations;
- inclusion/exclusion criteria and target population;
- whether sampling weights, survey design, or privacy constraints are present.

## Data Structure Audit

Before routing to a method, understand the data shape. Ask for a schema, a small column list, or a verbal description when available.

Minimum data-structure fields:

```yaml
data_inspector_02:
  data_existence_status: "existing | partially existing | conceptual | unknown"
  data_basis: "actual user data | partial user data | conceptual data | unknown"
  data_profile:
    rows_represent: null
    unit_of_observation: null
    repeated_measures: null
    groups_or_clusters: null
    dependencies_or_networks: null
design_planner_03:
  design_context:
    design_label_claimed_by_user: null
    inferred_design_family: null
  design_structure:
    assignment_or_exposure_mechanism: null
    time_zero: null
    follow_up_window: null
```

Key checks:

- Is treatment recorded before outcome?
- Is assignment recorded separately from treatment received?
- Are there IDs to aggregate event/visit rows to the causal unit?
- Are baseline covariates measured before time zero?
- Are post-treatment variables mixed in with baseline variables?
- Does the data include enough pre-periods for DiD, event study, synthetic control, or pre-period adjustment in experiments?
- Are there censoring, missingness, selection, or logging processes?
- Are cluster, network, or spillover structures identifiable?

## Variable Timing Classification

Create a variable role table:

| Variable | Measured when? | Role | Include for total-effect adjustment? | Notes |
|---|---:|---|---|---|
| X | pre-treatment | confounder/effect modifier | often yes |  |
| M | post-treatment | mediator | no for total effect | maybe mediation analysis |
| C | post-treatment | censoring/selection | maybe through IPCW | avoid naive conditioning |
| Z | pre-treatment | instrument | usually not as confounder | use IV if assumptions plausible |
| S | affected by A/Y | collider/selection | no naive adjustment | selection-bias concern |

If covariates are weakly structured, such as text, images, irregular visits, transaction histories, omics blocks, or free-form clinical notes, propose candidate feature constructions only if they are scientifically interpretable and defined without using the outcome. Examples include baseline summary windows, exposure history summaries, lagged values, clinically meaningful categories, text-derived indicators with audit rules, network exposure metrics, or genetic instrument sets.

## Estimand

Ask whether the user wants:

- ATE: average effect in the target population;
- ATT: average effect among treated units;
- ATC: average effect among controls;
- ATO/overlap estimand;
- CATE: effect conditional on covariates;
- GATE/subgroup effect;
- LATE/CACE: complier effect under IV/noncompliance;
- risk difference, risk ratio, odds ratio, mean difference, RMST difference, survival difference, policy value, or dose-response curve;
- total effect, direct effect, indirect effect, or controlled direct effect.

Do not ask for formal notation if the user is early in the workflow. Translate their goal into a provisional estimand and verify it.

## DAG or Causal Structure Trigger

Create or elicit a lightweight design diagram, assignment-mechanism summary, DAG, or variable-role map during route shortlisting or before code when:

- the route depends on adjustment for measured confounding;
- mediators, colliders, instruments, or selection variables are present;
- the user asks what to adjust for;
- missingness/censoring/selection may depend on treatment or outcome risk;
- interference/spillovers or network exposure mappings are plausible;
- causal discovery output will be used to inform an effect-estimation question.

For clean randomized experiments, DiD, RD, or synthetic control, a design diagram or assignment-mechanism summary may be more useful than a full DAG.

Do not require the user to state formal identification assumptions up front. Use the structure to explain assumptions intuitively during route feasibility checks, then let the activated subskill handle the more rigorous assumption and failure-mode audit.

## Question Strategy

Ask questions in layers.

### Layer 1: enough to understand the need

1. What decision or scientific question is the user trying to answer?
2. What deliverable do they want now: explanation, route choice, plan, code, result interpretation, or report?
3. Do data already exist, or is the user planning a future study or dataset?
4. What treatment/intervention, comparator, outcome, time zero, and population are implied?

### Layer 2: enough to route

1. What do rows represent?
2. Is treatment randomized, quasi-random, policy/cutoff-based, instrumented, observational, longitudinal, networked, genomic, or aggregate time-series?
3. Is treatment time-varying?
4. Are there repeated measures, clustering, panel structure, or time series?
5. Are there enough pre-periods, controls, instruments, cutoffs, or donor units for the design being considered?
6. Are there missing data, attrition, censoring, selection, interference, or measurement concerns?
7. If data do not exist yet, which design features are feasible to collect or assign prospectively?

### Layer 3: enough to analyze

1. Which variables are valid pre-treatment confounders?
2. Which variables are post-treatment, mediators, colliders, instruments, or selection variables?
3. What effect scale is scientifically meaningful?
4. Which assumptions are checkable from data and which are untestable?
5. What diagnostics and sensitivity analyses are required?
6. If code is requested, what software or tool does the user prefer, and does it fit the planned route and data?

## When to Proceed With Provisional Assumptions

Proceed if the treatment, comparator, outcome, time zero, data structure, and at least a provisional estimand are sufficiently clear. State assumptions as provisional, for example:

> I will proceed under the provisional assumption that all listed covariates were measured before treatment and that the target estimand is the ATE. If this is wrong, the route and interpretation may change.

Do not proceed to final code if the chosen route depends on an unresolved condition that would invalidate identification. Instead, show the route shortlist and the missing condition.

## Intake Output Template

```markdown
## Causal project specification

- Current mode:
- Requested deliverable:
- Existing data:
- Scientific question:
- Unit of analysis:
- Rows represent:
- Treatment:
- Comparator:
- Outcome:
- Time zero:
- Follow-up:
- Target population:
- Provisional estimand:
- Data structure:
- Candidate design routes:
- Route status:
- Known route conditions:
- Unresolved route conditions:
- Prospective data to collect:
- Measurement plan:
- Future diagnostics to enable:
- Candidate confounders:
- Post-treatment variables to avoid in total-effect adjustment:
- DAG or causal-structure status:
- Missingness/censoring/selection concerns:
- Clustering/interference concerns:
- Feature construction needed:
- Key unresolved questions:
- Subskill entries to update:
```
