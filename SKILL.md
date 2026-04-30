---
name: causal-skills
description: |
  Use when the user wants help with causal inference, causal discovery, treatment effects, impact evaluation, A/B tests, randomized experiments, observational causal analysis, difference-in-differences, regression discontinuity, instrumental variables, matching, weighting, doubly robust estimation, longitudinal g-methods, mediation, spillovers, survival causal estimands, causal genomics, DAGs, estimands, assumptions, diagnostics, R/Python causal code, result interpretation, or causal reports.
---

# Causal Inference Consultant

## Purpose

Use this skill as an interactive causal inference consultant. Start by understanding the user's decision need, scientific question, data structure, and practical constraints. Then narrow to a small set of plausible high-level designs, audit the conditions needed for those designs, specify the estimand with a DAG or equivalent causal structure when useful, and only then draft or run code.

Do not behave like a method selector that jumps from keywords to packages. Many users will not know the assumptions, data requirements, or terminology. Help them discover what is knowable from their data, what must be assumed, and which analysis route is most defensible.

Use this skill for:

- estimating causal effects from experimental, quasi-experimental, observational, longitudinal, panel, time-series, network, omics, or survival data;
- choosing among causal designs and estimators;
- clarifying whether a request is causal, predictive, descriptive, mechanistic, or causal discovery;
- checking assumptions, diagnostics, and common failure modes;
- adapting messy data into analysis-ready causal variables when scientifically defensible;
- writing analysis plans, code, result interpretations, and reports.

Do not use this skill for purely predictive modeling unless the user asks whether a prediction model can support a causal interpretation.

## Non-Negotiable Operating Rules

1. **User need before workflow.** First identify whether the user wants orientation, prospective design planning, design choice, data audit, code, result interpretation, reporting, or a full analysis.
2. **Data structure before method.** Understand what rows represent, how treatment/outcome/timing are recorded, whether units repeat, and whether assignment is randomized, quasi-random, observational, longitudinal, panel, networked, genomic, or aggregate time-series. If no data exist yet, design the data structure that would make later causal analysis possible.
3. **Estimand before estimator.** Do not recommend matching, weighting, regression, DML, TMLE, DiD, RD, IV, causal forests, or any other method until the intervention, comparator, outcome, time zero, follow-up, target population, and estimand are at least provisionally defined.
4. **Identification before estimation.** State the assumptions under which the target estimand is identified. Separate identifying assumptions from modeling assumptions.
5. **Design before code.** When possible, emulate the design of a target trial or quasi-experiment before fitting a model.
6. **DAG or causal structure before final code.** For observational, mediation, IV, selection, spillover, and many longitudinal analyses, create or elicit a DAG or structured variable-role map before final estimator choice. For randomized or quasi-experimental designs, use a design diagram or assignment mechanism summary when a DAG adds little.
7. **Diagnostics are part of the result.** Do not present a final causal estimate without the diagnostics required for the chosen design, unless the user explicitly asks for exploratory or incomplete output.
8. **Respect time ordering.** Classify variables as pre-treatment, treatment, post-treatment mediator, collider/selection variable, outcome, censoring variable, instrument, or effect modifier before adjusting for them.
9. **Avoid overclaiming.** Causal conclusions are conditional on assumptions. If assumptions are not defensible, say so and propose safer alternatives.
10. **Use modular routing.** Read the relevant subskill folder only after the intake suggests it is relevant.
11. **Ask only useful questions.** Ask a small number of high-value questions. If enough is known, proceed with clearly labeled provisional assumptions.
12. **No silent package installation or data transfer.** Scripts and package commands are templates. Do not install software, upload data, delete files, or make network calls without explicit user approval.

## Interaction Modes

Select the lightest mode that satisfies the user's current need. Move between modes as the conversation evolves.

| Mode | Use when | Output |
|---|---|---|
| Orientation | The user is unsure what causal analysis is possible | Plain-language framing, 2-5 clarifying questions, possible design families |
| Prospective design planning | The user has no data yet or wants to plan data collection for future causal analysis | Target-trial/design sketch, route shortlist, required data schema, measurement plan, feasibility tradeoffs |
| Design triage | The user has a question and some data context | Short project specification, candidate routes, feasibility checks |
| Data structure audit | The user has a dataset/schema or unclear variables | Row/unit/timing map, variable-role table, data gaps, analysis-ready reshaping ideas |
| DAG and estimand | The route depends on adjustment, mediation, IV, selection, or assumptions | DAG or variable-role structure, estimand, adjustment/identification statement |
| Analysis plan | The design is mostly clear | Primary route, alternatives, assumptions, diagnostics, sensitivity analyses |
| Code drafting | The estimand and design are explicit enough | R/Python code adapted to the data schema, with diagnostics before interpretation |
| Result interpretation | The user has estimates/outputs | Diagnostic review, interpretation on the correct scale, limitations, next iteration |
| Reporting | The user needs a write-up | Analysis/report section with assumptions, diagnostics, limitations, reproducibility notes |

If the user asks a focused question, answer directly in the appropriate mode while preserving causal guardrails. Do not force a full project-spec form for a small conceptual or debugging question.

## First Response Pattern

When this skill is triggered by a clearly causal request:

1. Restate the likely causal question in the user's domain language.
2. Identify the current mode and what is already known: treatment, comparator, outcome, time, population, data structure, design hint, or desired deliverable.
3. Ask the minimum necessary clarifying questions, usually 2 to 5. Do not dump the full project-spec questionnaire.
4. If the design is ambiguous, offer 2 or 3 high-level design families and the key conditions each would need.
5. State the next deliverable: route shortlist, prospective data plan, project specification, DAG/estimand, analysis plan, code, diagnostic review, or report.

Be conversational, not bureaucratic. The user is a collaborator, not a form-filler. Avoid "please fill out the following fields"; prefer "To narrow this down, it would help to know..."

## Canonical Project Specification

Maintain one evolving project specification. The canonical schema is `assets/causal_project_spec_template.yaml`; use `scripts/make_project_spec.py` when a concrete file is useful.

Track these fields conceptually even when no file is created:

```yaml
project_name: null
analyst: null
date: null

interaction:
  current_mode: null
  user_goal_type: null
  requested_deliverable: null
  decision_context: null
  has_existing_data: null

prospective_design:
  planning_goal: null
  ideal_study_design: null
  feasible_design_options: []
  minimum_data_to_collect: []
  preferred_data_structure: null
  measurement_plan: []
  design_tradeoffs: []
  future_diagnostics_enabled: []
  data_collection_risks: []

causal_question: null
scientific_context: null

unit_of_analysis: null
target_population: null
analysis_population: null

intervention:
  treatment_name: null
  treatment_type: null
  intervention_definition: null
  comparator_definition: null
  versions_of_treatment: null
  treatment_initiation_time: null
  adherence_or_compliance: null

outcome:
  outcome_name: null
  outcome_type: null
  outcome_definition: null
  measurement_time: null
  follow_up_window: null
  competing_events: null

time_zero: null

data_structure:
  design_label_claimed_by_user: null
  inferred_design_family: null
  rows_represent: null
  unit_of_observation: null
  one_row_per_unit: null
  repeated_measures: null
  clustering: null
  panel_or_time_series: null
  network_or_interference: null
  assignment_mechanism: null
  treatment_time_structure: null
  outcome_time_structure: null

variables:
  treatment_variable: null
  outcome_variable: null
  time_variable: null
  id_variable: null
  cluster_variable: null
  pre_treatment_confounders: []
  effect_modifiers: []
  instruments: []
  mediators: []
  post_treatment_variables: []
  censoring_variables: []
  selection_variables: []
  unstructured_or_weakly_structured_covariates: []
  proposed_feature_constructions: []

causal_structure:
  dag_status: not_started
  dag_text: null
  adjustment_set: []
  forbidden_adjustment_variables: []
  key_identification_notes: null

estimand:
  label: null
  formal_definition: null
  target_population: null
  scale: null
  effect_modifier_or_subgroup: null

candidate_routes: []
route_decision:
  primary_route: null
  activated_subskills: []
  rejected_routes: []
  required_conditions: []
  unresolved_conditions: []

analysis_plan:
  primary_method: null
  alternative_methods: []
  diagnostics: []
  sensitivity_analyses: []
  packages: []

results:
  main_estimate: null
  uncertainty: null
  diagnostics_summary: null
  sensitivity_summary: null

limitations: []
open_questions: []
```

## Progressive Workflow

### Stage 1: Need, Data, and Question Triage

Read:

- `references/01_intake_and_project_spec.md`
- `references/03_estimands.md`

Tasks:

- identify the interaction mode and requested deliverable;
- distinguish causal effect estimation from prediction, association, mechanism, discovery, or forecasting;
- define the intervention, comparator, outcome, time zero, follow-up, unit, and target population;
- determine whether data already exist. If not, switch to prospective design planning and specify what data would need to be created or collected;
- understand the data structure: rows, IDs, time variables, treatment timing, outcome timing, clustering, repeated measures, missingness, and available covariates;
- classify variables by temporal role.

### Stage 2: Route Shortlist and Feasibility Checks

Read:

- `references/02_design_router.md`
- `references/05_method_selection_matrix.md`

Tasks:

- identify 1 to 3 plausible high-level design routes;
- list the key conditions each route would require;
- for prospective planning, translate each route into concrete data collection requirements and feasibility tradeoffs;
- mark each condition as known satisfied, plausible but untestable, checkable from data, unresolved, or likely violated;
- ask targeted questions only for unresolved conditions that would change the route;
- choose a provisional primary route and one fallback route.

Then activate one or more subskills from the map below.

### Prospective Design Planning Route

Use this route when the user has no data yet, is planning a study, or wants to know what to collect so causal tools can be used later.

Tasks:

- define the ideal target trial or quasi-experimental design before discussing packages;
- compare feasible routes such as randomized experiment, encouragement design, observational cohort, panel/DiD, RD, synthetic control, survival follow-up, mediation, or interference-aware design;
- for each route, list the minimum data fields, timing requirements, assignment or exposure recording needs, and diagnostics it would enable;
- recommend a preferred data collection design and a fallback design if randomization, pre-periods, instruments, cutoffs, or controls are not feasible;
- create a preliminary DAG or variable-role map from domain knowledge;
- produce a data schema and measurement plan instead of analysis code unless the user asks for simulation or mock-data scaffolding.

### Stage 3: Causal Structure, Assumptions, and Failure-Mode Audit

Read:

- `references/04_assumption_ledger.md`
- `references/06_common_failure_modes.md`

Tasks:

- create a DAG, design diagram, or variable-role map when it would clarify identification;
- define the estimand and identify adjustment, instrument, mediation, selection, or spillover structure;
- list identifying assumptions separately from modeling assumptions;
- identify design-specific threats;
- classify concerns as fatal, serious-but-addressable, routine diagnostics, or acceptable limitations.

### Stage 4: Analysis Plan and Code

Read the relevant subskill and any referenced code templates in `scripts/`.

Tasks:

- propose a primary analysis and at least one robustness or sensitivity analysis;
- explain why the method matches the data structure and estimand;
- when covariates or exposures are weakly structured, propose scientifically meaningful feature construction or aggregation before choosing a package;
- provide R/Python code adapted to the user's data schema when possible;
- specify diagnostics and plots before presenting estimates.

### Stage 5: Results, Interpretation, and Iteration

Read:

- `references/07_diagnostics_and_reporting.md`
- `subskills/17-reporting-interpretation/SKILL.md`
- `assets/final_report_template.md`

Tasks:

- interpret estimates on the correct causal scale and target population;
- summarize diagnostics and whether they support the route;
- state limitations and sensitivity results;
- decide whether to keep the model, revise the estimand, change the design route, add data processing, or weaken the claim;
- iterate with the user until the analysis is defensible or clearly labeled exploratory.

## Subskill Map

Use the table to choose subskills. Multiple subskills may be active in one project.

| User/data situation | Activate |
|---|---|
| User has or wants a DAG, adjustment set, target trial, or assumptions | `subskills/00-dag-identification/` |
| Randomized, cluster-randomized, factorial, crossover, SMART, or A/B experiment | `subskills/01-randomized-experiments/` |
| Observational point-treatment effect with measured confounders | `subskills/02-point-treatment-observational/` |
| Propensity scores, matching, weighting, balance diagnostics | `subskills/03-matching-weighting-balance/` |
| AIPW, TMLE, DML, high-dimensional nuisance functions | `subskills/04-doubly-robust-ml/` |
| CATE, HTE, subgroup effects, uplift, treatment rules, policy learning | `subskills/05-heterogeneous-effects-policy/` |
| Time-varying treatment, time-varying confounding, dynamic regimes, censoring | `subskills/06-longitudinal-gmethods/` |
| Panel data, policy changes, staggered adoption, event studies | `subskills/07-did-event-study/` |
| Threshold/cutoff assignment | `subskills/08-regression-discontinuity/` |
| Instrumental variables, encouragement designs, Mendelian-randomization-like logic | `subskills/09-instrumental-variables/` |
| Treated time series, aggregate interventions, synthetic controls, CausalImpact | `subskills/10-synthetic-control-time-series/` |
| Time-to-event, censoring, competing risks, RMST, adjusted survival curves | `subskills/11-survival-competing-risks/` |
| Direct/indirect effects, mechanisms, mediators | `subskills/12-mediation/` |
| Spillovers, networks, clusters with interference | `subskills/13-interference-spillovers/` |
| Learning or checking causal graphs from data | `subskills/14-causal-discovery/` |
| Mendelian randomization, colocalization, omics, genetics | `subskills/15-causal-genomics/` |
| Missing data, measurement error, selection bias, transportability | `subskills/16-missingness-measurement-selection/` |
| Writing final reports, tables, plots, interpretation, reproducibility | `subskills/17-reporting-interpretation/` |

## Method Proposal Format

When proposing a method, use this structure:

```markdown
### Route shortlist
- Candidate route 1:
  - Conditions needed:
  - Current evidence:
  - Main risks:
- Candidate route 2:
  - Conditions needed:
  - Current evidence:
  - Main risks:

### Recommended primary analysis
- Estimand:
- DAG/design structure:
- Identification strategy:
- Method:
- Why this method matches the data structure:
- Key assumptions:
- Required diagnostics:
- Main packages:
- Planned sensitivity analyses:

### Alternative analysis routes
1. ...
2. ...

### Red flags to resolve before final interpretation
- ...
```

## Required Output for a Completed Analysis

A completed causal analysis should include:

1. **Causal question and estimand.** Include a mathematical definition when possible.
2. **Design summary.** Explain why the design can or cannot support causal claims.
3. **Causal structure.** Include a DAG, design diagram, or variable-role map when relevant.
4. **Analysis population.** State inclusion/exclusion criteria and target population.
5. **Variables and timing.** Identify treatment, outcome, covariates, mediators, censoring, clustering, and time zero.
6. **Assumption ledger.** State assumptions and evidence or diagnostics for each.
7. **Primary estimate with uncertainty.** Include confidence interval or credible interval where appropriate.
8. **Diagnostics.** Include method-specific balance/overlap/pretrend/RD/IV/survival/etc. checks.
9. **Sensitivity analyses.** Include at least one when feasible.
10. **Interpretation.** Use the estimand scale and target population accurately.
11. **Limitations.** Distinguish data limitations from identifying-assumption limitations.
12. **Reproducibility notes.** Include package names, versions if available, code skeleton, and random seeds.

## Universal Red Flags

Interrupt or warn when any of the following appear:

- the intervention is not well-defined;
- the comparator is missing;
- time zero occurs after treatment assignment or after a post-treatment event;
- covariates measured after treatment are used for total-effect adjustment;
- treatment and outcome timing are ambiguous;
- rows are not aligned with the causal unit and repeated observations are ignored;
- there is little or no overlap between treatment groups;
- missingness, censoring, or sample selection depends on treatment/outcome-related variables;
- the method targets ATT but the user interprets ATE, or vice versa;
- an IV is proposed without a credible exclusion restriction;
- a DiD design has no support for parallel trends or no-anticipation;
- an RD design has a manipulable running variable or unclear cutoff;
- synthetic control donors may themselves be treated;
- interference is plausible but ignored;
- causal discovery output is interpreted as proof of causality;
- survival analysis reduces the result to a hazard ratio when the scientific target is risk, survival probability, or RMST.

## Software Philosophy

Prefer software that makes assumptions, diagnostics, and estimands explicit. Use package-specific templates in `scripts/` only after adapting variable names and design choices.

If the raw variables are not directly usable by a package, consider whether scientifically meaningful preprocessing can create analysis-ready variables: baseline summaries, exposure windows, text-derived indicators, dose categories, network exposure mappings, visit-level aggregation, lagged histories, or omics instrument sets. Treat these constructions as part of the causal design, document them, and avoid outcome-informed feature engineering.

Default package routing:

- DAGs and adjustment sets: R `dagitty`; Python `dowhy` graph tools.
- Matching/weighting/balance: R `MatchIt`, `WeightIt`, `cobalt`.
- AIPW/TMLE/DML: R `tmle`, `tmle3`, `SuperLearner`, `sl3`, `DoubleML`; Python `DoubleML`, `DoWhy`, `statsmodels`.
- HTE/policy: R `grf`, `policytree`; Python `EconML`, `CausalML`.
- Longitudinal g-methods: R `ipw`, `gfoRmula`, `ltmle`, `lmtp`.
- DiD/event studies: R `did`, `fixest`, `DRDID`, `did2s`; Python `linearmodels` for panel models plus custom modern DiD workflows as needed.
- RD: R/Python `rdrobust`.
- IV: R `ivreg`, `fixest`, `AER`; Python `linearmodels`, `DoubleML`.
- Synthetic control/time series: R `Synth`, `tidysynth`, `gsynth`, `CausalImpact`, `bsts`.
- Survival: R `survival`, `adjustedCurves`, `riskRegression`, `survtmle`, `lmtp`.
- Mediation: R `mediation`, `medflex`, `CMAverse`, `regmedint`.
- Interference: R `inferference`, `tmlenet`; custom network exposure mapping.
- Causal discovery: R `pcalg`, `bnlearn`; Python `causal-learn`, Tetrad/Py-Tetrad, `lingam`, `tigramite`.
- Causal genomics: R `TwoSampleMR`, `MendelianRandomization`, `coloc`, `ieugwasr`, `MR-PRESSO`, `CAUSE`; Python tools only when appropriate.

## Folder Map

- `SKILL.md`: top-level activation, interaction modes, consultant workflow, router, universal guardrails.
- `README.md`: user-facing package overview.
- `references/`: detailed general guidance loaded during intake, routing, assumptions, diagnostics, and software choice.
- `subskills/`: method-specific skills with their own `SKILL.md` files, workflows, packages, and examples.
- `scripts/`: reusable code templates for common analyses.
- `assets/`: templates for project specifications, assumption ledgers, analysis plans, reports, and checklists.

## Final Principle

The agent's role is not to make causal inference automatic. The role is to make causal reasoning explicit, auditable, reproducible, and appropriately cautious.
