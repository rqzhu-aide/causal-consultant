# Intake and Causal Project Specification

The intake stage transforms a vague request into an evolving causal project specification. Ask only the questions needed for the next routing decision. The goal is to understand the user's need and data structure well enough to narrow the analysis route, not to force a full form at the start.

When durable memory is useful, create or reuse a dated state folder and create `project.yaml` from `assets/causal_project_spec_template.yaml`. Keep selected method-analysis YAMLs under `analyses/` and human-facing outputs under `artifacts/`.

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

Maintain the main skill and four backend foundation subskills concurrently once a concrete causal project is being formed. The user should experience one coherent conversation led by the main skill; the backend subskills maintain compact evaluator records in `project.yaml` that make that conversation informed.

- `main_skill`: tracks user goal, intent, rigor mode, conversation style, open questions, assumptions to surface, user-directed continuation, and next conversation moves.
- `evaluators.domain_helper_01`: tracks domain facts, user terminology, field norms, scientific conventions, measurement practices, ethical/privacy/access constraints, candidate formulations, implications, requests, and assumptions.
- `evaluators.data_inspector_02`: tracks actual or expected data, row/unit meaning, data status, scoped readiness, data quality, constructability, data-enabled opportunities, implications, requests, and assumptions.
- `evaluators.design_planner_03`: actively tracks design strategy, preferred route ID, route hypotheses, feasibility, route-changing user questions, data-check requests, DAG-audit instructions, and assumptions.
- `evaluators.dag_builder_04`: audits the proposed route's causal structure, variable timing/roles, assumptions, identification, adjustment concerns, forbidden variables, causal-logic hypotheses, and analytic handoff.

The backend foundation subskills are not alternatives. They provide different project memory and state evaluations. Analysis/modeling subskills are selected after these components make the user goal, domain context, data situation, design options, and causal logic clearer. Domain helper preserves subject-matter knowledge and candidate formulations; data inspector provides data reality checks; design planner actively proposes and compares feasible study strategies; DAG builder audits the proposed design's causal logic, identification, assumptions, adjustment implications, and analytic handoff. Each evaluator reports implications and requests to the main skill, and the main skill selects the next action. Design and DAG reasoning should be informed by, but not dictated by, domain facts from `domain_helper_01` and data facts from `data_inspector_02`.

Use `foundation_gate.status` to summarize whether the foundation records support causal commitment: `not needed`, `exploratory`, `ready`, `blocked`, or `unknown`. Before `ready`, the route being supported should be named under `routes.current_route_id` or `evaluators.design_planner_03.preferred_route_id`, and any load-bearing assumptions recorded by the main skill or foundation evaluators should be surfaced, acknowledged, or deferred with rationale under `foundation_gate.surfaced_or_acknowledged_assumptions` or `foundation_gate.deferred_assumptions`.

Use `evaluator_loop.loop_control` when evaluator coordination stops making progress. If two consecutive evaluator rounds repeat the same unresolved blocker, the same cross-subskill dependency, or no material readiness change, the main skill should not schedule another full foundation cycle by default. It should choose a loop-break action: ask one decisive user question, make and record a permissible non-harmful working assumption, surface a load-bearing assumption, demote or block the route, choose a fallback, or proceed user-directed if the user clearly wants progress despite incomplete support.

If the user asks to continue, accepts a caveated analysis, repeatedly prefers continuation, signals urgency, or otherwise makes clear that they want progress while the gate is `exploratory` or `blocked`, give a brief validity warning, record acknowledged continuation under `main_skill.user_directed`, and set `analysis.route_commitment_status` to `user-directed`. User-directed continuation may include full method-specific implementation and complex model fitting. The user can override the workflow pace, not the validity label.

## Prospective Design Planning

Use this mode when the user does not yet have data, is planning data collection, or wants to know which data would make later causal analysis possible.

Do not ask for a dataset or code first. Instead:

1. Define the causal question, target population, treatment, comparator, outcome, time zero, and follow-up.
2. Sketch the ideal target trial or strongest feasible quasi-experiment.
3. Use `evaluators.domain_helper_01` to record domain facts, terminology, field norms, measurement practices, ethical/privacy/access constraints, candidate formulations, implications, requests, and assumptions before design or DAG formalization.
4. Use `evaluators.design_planner_03` to compare 1 to 3 feasible design routes, list the data each route would require, and ask `evaluators.dag_builder_04` what causal assumptions each route needs audited.
5. Recommend a minimum data schema and measurement schedule.
6. Identify diagnostics and sensitivity analyses that the planned data should make possible.
7. Name fallback routes if the preferred design is infeasible.

Prospective planning output should usually be a study/data blueprint, not analysis code.

### Prospective Planning Fields

```yaml
main_skill:
  primary_intent: "design study"
  conversation_style: "suggest-and-invite | suggest-and-confirm"
  selected_next_action: "refresh_domain_helper_01 | refresh_design_planner_03 | unknown"
evaluators:
  domain_helper_01:
    status: active
    readiness: "sufficient_for_now | needs_information | unknown"
    summary: null
    key_findings: []
    candidate_formulations: []
    implications:
      data_inspector_02: []
      design_planner_03: []
      dag_builder_04: []
    requests_for_main_skill: []
  data_inspector_02:
    status: active
    readiness: "sufficient_for_now | needs_information | unknown"
    readiness_scope: "route comparison | design-data fit | gate commitment | unknown"
    data_status: conceptual
    summary: null
    data_enabled_opportunities: []
  design_planner_03:
    status: active
    readiness: "sufficient_for_now | needs_information | blocks_ready_gate | unknown"
    design_status: "promising | feasible | fragile | blocked | needs clarification | unknown"
    preferred_route_id: null
    route_hypotheses: []
  dag_builder_04:
    status: active
    readiness: "sufficient_for_now | needs_information | blocks_ready_gate | unknown"
    supported_status: "fragile | blocked | needs design revision | unknown"
    causal_logic_hypotheses: []
routes:
  current_route_id: null
  hypotheses: []
```

Do not add a separate top-level prospective schema unless the project truly needs it. Prospective planning details should live primarily in `evaluators.design_planner_03` and route artifacts, with `evaluators.data_inspector_02.data_status` labeled as conceptual unless actual or partial data appear.

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
evaluators:
  data_inspector_02:
    data_status: "existing | partially existing | conceptual | unknown"
    readiness_scope: "exploratory review | route comparison | design-data fit | dag-data fit | preprocessing | gate commitment | unknown"
    summary: null
    key_findings:
      - "Rows represent: null"
      - "Unit of observation: null"
      - "Time zero observable: yes | no | partial | unknown"
      - "Required design fields missing: []"
    data_enabled_opportunities: []
  design_planner_03:
    design_status: "promising | feasible | fragile | blocked | needs clarification | unknown"
    preferred_route_id: null
    route_hypotheses:
      - route_id: "route-01"
        summary: null
        required_data_checks: []
        required_dag_checks: []
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

Create a timing-evidence table. Data inspector records what is observable and when; DAG builder owns the final causal role classification.

| Variable | Measured when? | Data evidence | Needs DAG/design review? | Notes |
|---|---:|---|---|---|
| X | pre-treatment | candidate baseline variable | yes | DAG builder decides whether it is an adjustment variable, precision variable, or something else |
| M | post-treatment | candidate intermediate variable | yes | may be mediator, follow-up measure, or outcome-related process |
| C | post-treatment | observation/censoring field | yes | may require explicit censoring or selection handling |
| Z | pre-treatment | assignment/encouragement-like field | yes | DAG/design records decide whether it can support an IV-like argument |
| S | affected by A/Y | sample inclusion field | yes | possible selection process |

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

Do not run the layers as an opening questionnaire. For a broad cold-start request, begin with one warm invitation and wait for the user's first concrete detail. Once the user provides a dataset, decision, treatment, outcome, or desired deliverable, ask only the next one or two questions that would change routing.

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

Do not proceed to supported final code if the chosen route depends on an unresolved condition that would invalidate identification. Instead, show the route shortlist and the missing condition. If the user asks to run the model anyway, accepts a caveated analysis, repeatedly prefers continuation, or signals urgency, record user-directed continuation, proceed only within the requested and safe implementation scope, and label outputs as user-directed, exploratory, or assumption-dependent rather than validated causal evidence.

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
- Foundation gate status:
- Load-bearing assumption review:
- User-directed continuation, if active: intent basis, warning, acknowledged limits, requested/allowed scope, prohibited claims
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
