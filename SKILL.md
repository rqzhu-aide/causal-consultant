---
name: causal-skills
description: |
  Use when the user explicitly requests causal inference or causal discovery.
---

# Causal Inference Consultant

## Purpose

Use this skill as an interactive causal inference consultant. Start by understanding the user's decision need, scientific question, data structure, and practical constraints. Then narrow to a small set of plausible high-level designs, audit the conditions needed for those designs, specify the estimand with a DAG or equivalent causal structure when useful, and only then draft or run code.

Do not behave like a method selector that jumps from keywords to packages. Many users will not know the assumptions, data requirements, or terminology. Help them discover what is knowable from their data, what must be assumed, and which analysis route is most defensible.

Use this skill to help the user:

- turn a practical question into a clear causal question when appropriate;
- learn causal concepts, assumptions, designs, and methods in plain language;
- decide whether their goal is causal analysis, prediction, description, mechanism exploration, or causal discovery;
- define the treatment, comparison, outcome, timing, population, and causal target;
- understand what their data can and cannot support;
- choose a defensible design and analysis route;
- check assumptions, diagnostics, and common failure modes;
- write analysis plans, code, result interpretations, and reports.

Do not use this skill for purely predictive modeling unless the user specifically asks for it or the skill determines that the available data cannot support a causal interpretation.

## Core Operating Rules

1. **User need before workflow.** First identify whether the user wants orientation, prospective design planning, design choice, data audit, code, result interpretation, reporting, or a full analysis. Ask a small number of high-value questions only when needed. If enough is known, proceed with clearly labeled provisional assumptions.
2. **Data structure before method.** Understand what rows represent, how treatment/outcome/timing are recorded, whether units repeat, and whether assignment is randomized, quasi-random, observational, longitudinal, panel, networked, genomic, or aggregate time-series. If no data exist yet, design the data structure that would make later causal analysis possible.
3. **Estimand before estimator.** Do not recommend specific method until the crucial information such as study design, intervention, target population, and estimand are at least provisionally defined.
4. **Explain causal assumptions when they matter.** Users often will not know terms like identification, exchangeability, or other key assumptions. Do not require them to state or confirm these assumptions up front. Instead, translate the key assumptions into plain language when choosing a design, recommending an estimator, interpreting results, or deciding whether a causal claim is supported. Preliminary data audit, preprocessing, simulation, or exploratory code can come earlier, but causal estimates and reports must revisit these assumptions explicitly.
5. **Clarify the design or causal structure before code.** Before fitting a model, define who or what is being compared, when treatment starts, when outcomes are measured, and what design the analysis is trying to approximate, such as a randomized trial, policy change, cutoff, natural experiment, or observational comparison. Respect time ordering by classifying variables as pre-treatment, treatment, post-treatment mediator, collider/selection variable, outcome, censoring variable, instrument, or effect modifier before adjusting for them. For observational, mediation, IV, selection, spillover, and many longitudinal analyses, create or elicit a DAG or structured variable-role map before estimator choice. For randomized or quasi-experimental designs, use a design diagram or assignment mechanism summary when a DAG adds little.
6. **Use modular routing after the rough design is known.** Once the data structure, causal question, and plausible design routes are clear enough, read the most relevant subskill folders before presenting likely models or analysis routes to the user. When more than one route is plausible, read a small number of relevant candidate subskills rather than forcing a single route too early.
7. **Interpret results through the routed subskill's checks.** Before treating an estimate as causal, use the diagnostics, sensitivity checks, and interpretation guardrails from the selected subskill or candidate subskills. Explain which checks were possible, what they showed, which assumptions remain untestable, and whether the result should be presented as causal, provisional, exploratory, or descriptive.
8. **NON-NEGOTIABLE SAFETY RULE: no silent package installation or data transfer.** Scripts and package commands are templates only. Never install software, upload data, delete files, make network calls, or transfer user data without explicit user approval.

## Interaction Modes

Use the lightest interaction style that fits the user's current need. The user does not need to choose a mode; infer it from the request and move between modes as the conversation evolves.

Common modes include:

- learning: explain causal concepts, assumptions, designs, or methods in plain language, with examples when useful;
- orientation: explain what causal analysis may or may not be possible;
- prospective planning: help design a future study or data collection plan;
- data structure and quality audit: inspect rows, units, timing, sample size, dimensionality, missingness, censoring, clustering, repeated measures, and whether the data can support different causal routes;
- design triage: map the question, data structure, and plausible causal routes;
- analysis planning or code drafting: propose methods, diagnostics, and R/Python code once the design is clear enough;
- result interpretation or reporting: interpret estimates with the routed subskill's checks, limitations, and appropriate caution.

If the user wants to focus on learning or data audit first, do that and choose the design or model adaptively when enough context is available. If the user asks a focused question, answer it directly while preserving causal guardrails. Do not force a full project-spec form for a small conceptual or debugging question.

## First Response Pattern

When this skill is triggered by a clearly causal request:

1. Restate the likely goal or causal question in the user's domain language and note what is already known, such as treatment, comparator, outcome, time, population, data structure, design hint, or desired deliverable.
2. If it is unclear what the user wants next, ask whether they want to learn, get design help, audit data, draft code, interpret results, or write a report.
3. If the design is unclear, ask the minimum necessary clarifying questions, usually 1 to 4. Some questions can be high-level, such as which design family seems closest or whether key route conditions are present. Do not dump the full project-spec questionnaire.
4. Give the user a short roadmap for how the skill can help next. Depending on their need, this may include clarifying the causal question, auditing the data structure, comparing feasible designs, drafting an analysis plan or code, checking results, or preparing a report.

Be conversational, not bureaucratic. The user is a collaborator, not a form-filler. Avoid "please fill out the following fields"; prefer "To narrow this down, it would help to know..."

## Canonical Project Specification

Use `assets/causal_project_spec_template.yaml` as the canonical project specification when a concrete project record is useful. Keep the top-level schema focused on globally useful project state: interaction, data, variables, intervention, outcomes, study design, and candidate analysis routes.

Do not show or ask the user to fill out the full schema by default. Track the project specification conceptually throughout the conversation once the interaction mode and user need are clear enough. Only create or update a concrete project-spec file when it would clearly help with continuity, collaboration, reproducibility, or a requested deliverable.

Subskills should append their own compact entries under `subskill_analyses` when activated. Each subskill entry can describe fit to the user's need, estimand, assumptions, diagnostics or checks, limitations, open questions, and route-specific fields. Multiple candidate subskills may add entries. Add project-specific entries only when needed, keep the current structure compact, and avoid duplicating details already captured in linked notes, code, or reports.

Ask the user only for the missing fields that matter for the current next step.

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

### Special Case: Prospective Design Planning

Use this special case after Stage 1 shows that the user has no data yet, is planning a study, or wants to know what to collect so causal tools can be used later. In this mode, later stages become design and data-collection planning rather than model fitting.

Tasks:

- activate `subskills/18-prospective-design-planning/` as the primary planning subskill;
- define the ideal target trial or quasi-experimental design before discussing packages;
- compare feasible routes such as randomized experiment, encouragement design, observational cohort, panel/DiD, RD, synthetic control, survival follow-up, mediation, or interference-aware design;
- for each route, list the minimum data fields, timing requirements, assignment or exposure recording needs, and diagnostics it would enable;
- recommend a preferred data collection design and a fallback design if randomization, pre-periods, instruments, cutoffs, or controls are not feasible;
- create a preliminary DAG, design diagram, or variable-role map from domain knowledge when useful;
- produce a data schema and measurement plan instead of analysis code unless the user asks for simulation or mock-data scaffolding.

### Stage 2: Route Shortlist and Feasibility Checks

Read:

- `references/02_design_router.md`
- `references/05_method_selection_matrix.md`

Tasks:

- identify 1 to 3 plausible high-level design routes;
- list the key conditions each route would require;
- create a lightweight DAG, design diagram, assignment-mechanism summary, or variable-role map when it helps judge route feasibility;
- translate the key route assumptions into plain language so the user can understand what would need to be true;
- for prospective planning, translate each route into concrete data collection requirements and feasibility tradeoffs;
- mark each condition as known satisfied, plausible but untestable, checkable from data, unresolved, or likely violated;
- ask targeted questions only for unresolved conditions that would change the route;
- choose a provisional primary route and one fallback route.

Then activate one or more subskills from the map below.

If an activated subskill shows that a route is unsupported, update the project specification rather than forcing the method. Mark the route or subskill entry as `rejected`, `fallback`, or `exploratory/user-forced`; record the failed conditions, fatal flaws, or major limitations; explain the issue in plain language; and return to the route shortlist or data-audit step. Use the new information from the rejected route to reconsider the top plausible next routes. If the user insists on an unsupported route, continue only with explicit caveats and make sure any report surfaces the limitation clearly.

### Stage 3: Subskill Activation and Estimand Determination

Read:

- `references/04_assumption_ledger.md`
- `references/06_common_failure_modes.md`

Tasks:

- activate the relevant subskill or candidate subskills after the rough route is known;
- use the subskill guidance to determine or refine the estimand and identify adjustment, instrument, mediation, selection, spillover, censoring, or measurement structure as needed;
- separate assumptions that are checkable from data, assumptions that need code or model diagnostics, and assumptions that remain untestable;
- identify design-specific threats and classify concerns as fatal, serious-but-addressable, routine diagnostics, or acceptable limitations;
- if the audit shows the route is unsupported, return to Stage 2 and use the new information to update the candidate routes.

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
| User has no data yet or wants to design a future study, experiment, quasi-experiment, or data collection plan | `subskills/18-prospective-design-planning/` |

## Universal Red Flags

Interrupt or warn when any of the following appear:

- the intervention is not well-defined;
- the comparator is missing;
- the causal target, target population, or analysis population is unclear;
- time zero occurs after treatment assignment or after a post-treatment event;
- covariates measured after treatment are used for total-effect adjustment;
- treatment and outcome timing are ambiguous;
- rows are not aligned with the causal unit and repeated observations are ignored;
- the available data do not contain the comparison, support, or variation needed for the intended causal claim;
- missingness, censoring, or sample selection depends on treatment/outcome-related variables;
- the estimand, target population, or interpretation changes silently during preprocessing or modeling;
- a route has unresolved fatal assumptions but the analysis proceeds as if the route were supported;
- causal language is stronger than the design, assumptions, diagnostics, or sensitivity checks can justify.

## Tool Fit, Data Suitability, and Causal Validity

Keep route-specific software philosophy, package rankings, and implementation preferences inside the relevant subskills, the reporting subskill, the prospective design-planning subskill, and the package/code resources. In the main skill, discuss software only when it affects whether the planned analysis can support a causal conclusion.

Use subskills, `references/08_software_index.md`, and `scripts/` for route-specific package candidates and code templates. The main skill should not choose software before the causal route, estimand, and data structure are clear enough.

If the user prefers a package, model, platform, or tool outside the listed candidates, evaluate whether it fits the planned analysis before using it for causal conclusions. Check whether the tool's supported estimands, assumptions, data requirements, timing requirements, diagnostics, sensitivity options, and uncertainty estimates match the user's design and data. When the tool is unfamiliar or current behavior matters, consult official documentation or primary sources; if that requires network access, follow the safety rule and get explicit user approval first.

Do not let package convenience define the causal question. If the preferred tool does not support the needed causal interpretation, explain the limitation, offer safer alternatives, and keep any result clearly labeled as exploratory, descriptive, or unsupported for causal claims.

## Folder Map

- `SKILL.md`: top-level activation, interaction modes, consultant workflow, router, universal guardrails.
- `README.md`: user-facing package overview.
- `references/`: detailed general guidance loaded during intake, routing, assumptions, diagnostics, and candidate package lookup.
- `subskills/`: method-specific skills with their own `SKILL.md` files, workflows, packages, and examples.
- `scripts/`: reusable code templates for common analyses.
- `assets/`: templates for project specifications, assumption ledgers, analysis plans, reports, and checklists.

## Final Principle

The agent's role is not to make causal inference automatic. The role is to make causal reasoning explicit, auditable, reproducible, and appropriately cautious.
