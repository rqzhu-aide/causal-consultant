# Design Router

Use this file after the intake has identified the basic causal question and the rough data structure. The router should not merely classify the user's design label; it should check whether the data and implementation actually support the claimed design.

The router's main job is to narrow the problem to a small set of plausible high-level approaches, state the conditions each approach requires, and help the user choose the most defensible route when some conditions are uncertain or unavailable.

At the start of a project, activate `subskills/01-user-need-understander/` to clarify the user's objective, causal components, data availability, and deliverable. If data exist, activate `subskills/02-user-data-inspector/` before selecting a modeling route. Use `subskills/03-dag-builder/` when variable roles or adjustment assumptions are unclear.

If no data exist yet, activate `subskills/04-design-planner/` and use the router prospectively: compare designs by what the user could realistically assign, measure, and follow over time. The output should be a data collection and design blueprint, not a package recommendation.

## Top-Level Design Questions

1. What decision or scientific claim does the user want to support?
2. What do rows represent, and is that the same as the causal unit?
3. Was treatment assigned by an investigator, platform, protocol, randomization device, cutoff, instrument, policy rule, or self/clinician/market choice?
4. If randomized, what was randomized: individual, cluster, household, school, clinic, physician, account, cookie, device, session, time period, sequence, or site?
5. Was assignment recorded before treatment/exposure/outcome, and is it separate from treatment received?
6. Were units excluded after assignment or treatment? If yes, why and based on variables measured when?
7. Are missing outcomes, attrition, censoring, or logging failures present and differential by group?
8. Could one unit's assigned treatment affect another unit's outcome?
9. Is the outcome time-to-event, repeated, longitudinal, ratio-valued, count-valued, binary, or continuous?
10. Is the user asking for average effects, heterogeneity, mechanisms, spillovers, policy value, or graph discovery?
11. Are available covariates already analysis-ready, or do they require scientifically meaningful construction or aggregation?

## Route Shortlisting Protocol

After the top-level questions, produce a shortlist of 1 to 3 plausible routes. For each route, list the conditions needed and the current status of those conditions.

Use these status labels:

- **Known satisfied**: directly stated by the user or visible in the data.
- **Checkable from data**: can be audited with the dataset, codebook, or diagnostics.
- **Plausible but untestable**: must be argued from design/domain knowledge.
- **Unresolved**: ask a targeted question if it would change the route.
- **Likely violated**: route should be downgraded, modified, or abandoned.

Prefer the route with the strongest design support, not the most sophisticated estimator. If no route can support a causal claim, recommend a descriptive, predictive, sensitivity, or data-collection next step.

If an activated subskill shows that a candidate route is unsupported, do not force the method. Mark the route as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed conditions or fatal limitations, explain the issue in plain language, and return to the shortlist with the new information.

## Prospective Route Planning

When `interaction.has_existing_data` is false or unknown, route by feasible data creation:

| Feasible future design feature | Preferred route to consider | Data to plan now |
|---|---|---|
| User can randomize treatment, offer, encouragement, timing, or rollout | `04-design-planner` + `05-randomized-experiments`; add `13-instrumental-variables` for noncompliance | assignment variable, probabilities, randomization unit, treatment received, pre-specified outcomes, attrition tracking |
| User cannot randomize but can follow treated/comparator units from eligibility | `04-design-planner` + `06-point-treatment-observational`; add `03-dag-builder`, `07-matching-weighting-balance`, or `08-doubly-robust-ml` when needed | eligibility/time zero, treatment definition, comparator definition, rich pre-treatment confounders, outcome follow-up |
| Policy/treatment may start at different times across units | `04-design-planner` + `11-did-event-study` | unit IDs, treatment adoption dates, multiple pre-period outcomes, stable composition, possible controls |
| Assignment can use a cutoff or threshold | `04-design-planner` + `12-regression-discontinuity`; add `13-instrumental-variables` if fuzzy | running variable, cutoff, treatment uptake, outcomes near cutoff, manipulation checks |
| A credible encouragement or natural experiment can shift treatment | `04-design-planner` + `13-instrumental-variables` | instrument, treatment received, outcome, first-stage data, exclusion-restriction evidence |
| One/few aggregate units may be treated | `04-design-planner` + `14-synthetic-control-time-series` | long pre-period outcome series, donor pool, covariates, intervention date, donor contamination checks |
| Outcome is time-to-event | `04-design-planner` + `15-survival-competing-risks` plus primary design | time zero, event dates, censoring dates, competing events, follow-up plan |
| Mechanism/pathway is central | `04-design-planner` + `16-mediation` after total-effect design | mediator timing, mediator-outcome confounders, treatment-mediator timing |
| Spillovers are plausible or intentional | `04-design-planner` + `17-interference-spillovers` plus primary design | cluster/network links, exposure mapping, treatment coverage, cluster/network outcomes |

For each prospective route, state:

- what the user must be able to control or observe;
- the minimum variables to collect;
- timing and measurement requirements;
- diagnostics the future dataset should support;
- what causal claim becomes unavailable if those data are not collected.

## Data Reshaping and Feature Construction Route

Sometimes the data are not immediately compatible with existing causal packages. The router may recommend preprocessing before estimator choice when the transformation is scientifically meaningful and defined without outcome leakage.

Examples:

- aggregate event/session/claim rows to the randomized or causal unit;
- define baseline windows and summarize histories before time zero;
- construct lagged treatment and confounder histories for longitudinal methods;
- map network exposure or cluster-level spillover summaries;
- convert free text or unstructured covariates into auditable indicators;
- construct dose categories, exposure windows, or clinically meaningful thresholds;
- build valid genetic instruments or omics summaries before MR/colocalization.

Treat these transformations as part of the design. Document the construction, timing, and assumptions, and route to `02-user-data-inspector` if the constructed variables may introduce bias through missingness, measurement error, sample conditioning, or leakage.

## Causal-Structure Feasibility Gate

During route shortlisting, use a lightweight DAG, design diagram, assignment-mechanism summary, or variable-role map when the route depends on adjustment, mediation, IV exclusion, selection/censoring, transportability, or interference. The purpose is to detect obvious feasibility problems before code, not to force a formal assumption lecture up front.

Detailed assumptions, failure-mode audits, and model diagnostics belong inside the activated subskill. Do not wait until after code to discover that the proposed adjustment set includes mediators or colliders.

## Routing Logic

### Prospective design planning

Activate `subskills/04-design-planner/` when the user has no dataset yet, is planning a study or data collection process, or asks what to collect so future causal analysis will be possible.

Use this route as the primary planning frame, then add candidate analysis subskills only to explain what each future design would require.

### DAG, identification, and causal structure

Activate `subskills/03-dag-builder/` when the user asks what to adjust for, wants a DAG, needs a target-trial framing, or the route depends on confounding, mediation, instruments, selection/censoring, transportability, or interference.

Use this as a support route alongside the primary analysis route, not as a replacement for the design route unless the user's main goal is learning or graph work.

### Randomized experiment, A/B test, or investigator-assigned treatment

Activate `subskills/05-randomized-experiments/` when the user says or the data indicate any of the following:

- randomized controlled trial, clinical trial, field experiment, lab experiment, online A/B test, experiment arm, treatment/control arm, random assignment, split test, holdout, encouragement trial, randomized rollout;
- treatment was assigned by a randomization protocol;
- a design file contains assignment probabilities, block IDs, cluster IDs, or experiment arms;
- the user wants power, MDE, randomization, CONSORT-style flow, randomization-inference, online experiment diagnostics, pre-period adjustment, or trial reporting.

At the router level, only verify that random assignment is real, that assignment precedes outcomes, and that the analysis unit can be aligned with the randomized unit. The randomized-experiments subskill owns detailed randomization audits, online experiment checks, pre-period adjustment, cluster/factorial/crossover specifics, and trial reporting details.

Also activate:

- `13-instrumental-variables` for noncompliance, encouragement designs, or treatment-received targets;
- `02-user-data-inspector` for causal data preprocessing, triggered-only datasets, logging failures, missingness, or data-readiness problems;
- `15-survival-competing-risks` for time-to-event endpoints;
- `17-interference-spillovers` for contamination or spillovers;
- `09-heterogeneous-effects-policy` for subgroup, CATE, uplift, or treatment-rule targets;
- `16-mediation` for mechanisms or pathways after the total-effect route is clarified.

Route out of `05-randomized-experiments` as the primary route if there was no actual random assignment, if randomization happened after conditioning on a post-treatment event, or if the claimed treatment is actually a policy adoption, cutoff, instrument, or observational exposure better handled by another route.

### Observational point treatment

Activate `subskills/06-point-treatment-observational/` when treatment is measured once, treatment was not randomized, and the user wants a causal effect under measured-confounding assumptions.

Also activate:

- `07-matching-weighting-balance` if design uses propensity scores, matching, stratification, or weighting;
- `08-doubly-robust-ml` if using AIPW/TMLE/DML or high-dimensional nuisance models;
- `09-heterogeneous-effects-policy` if CATE/HTE is requested;
- `15-survival-competing-risks` for time-to-event outcomes;
- `16-mediation` if the target is mechanism;
- `02-user-data-inspector` for data preprocessing, missingness, censoring, or variable-role/timing problems.

### Longitudinal treatment

Activate `subskills/10-longitudinal-gmethods/` when treatment or confounders change over time, especially when past treatment affects later confounders.

Also activate:

- `15-survival-competing-risks` for survival outcomes;
- `09-heterogeneous-effects-policy` for dynamic treatment regimes or individualized policies;
- `02-user-data-inspector` for preprocessing time-varying rows, IDs, visits, censoring indicators, or observation-process variables.

### Panel/policy/staggered adoption

Activate `subskills/11-did-event-study/` when there are units observed before and after policy/treatment adoption.

Also activate:

- `14-synthetic-control-time-series` if few treated units or aggregate units;
- `02-user-data-inspector` if panel preprocessing, missing periods, composition changes, or ID/time structure matters.

### Cutoff-based assignment

Activate `subskills/12-regression-discontinuity/` when treatment assignment changes at a threshold or score cutoff.

Also activate:

- `13-instrumental-variables` if assignment at cutoff is fuzzy rather than deterministic;
- `05-randomized-experiments` only if there is explicit randomization inside a bandwidth or lottery window.

### Instrument or encouragement design

Activate `subskills/13-instrumental-variables/` when a variable affects treatment uptake but is claimed not to affect outcome except through treatment.

Also activate:

- `05-randomized-experiments` if the instrument is randomized assignment or encouragement;
- `12-regression-discontinuity` if the instrument is cutoff eligibility;
- `19-causal-genomics` if the instrument is genetic/omics-based.

### Aggregate time-series intervention

Activate `subskills/14-synthetic-control-time-series/` when there is a treated time series, a policy shock, pre/post periods, and possibly control series.

### Survival/competing risks

Activate `subskills/15-survival-competing-risks/` whenever the outcome is time-to-event or censoring is central.

This may combine with randomized, observational, longitudinal, DiD, IV, or HTE subskills.

### Mediation/mechanism

Activate `subskills/16-mediation/` when the user asks about pathways, direct effects, indirect effects, mechanisms, or mediators.

### Interference/spillovers

Activate `subskills/17-interference-spillovers/` if one unit's treatment can affect another unit's outcome.

### Causal discovery

Activate `subskills/18-causal-discovery/` if the user asks to learn a causal graph from data.

Do not confuse causal discovery with causal effect estimation from a known treatment and outcome.

### Causal genomics

Activate `subskills/19-causal-genomics/` for Mendelian randomization, colocalization, eQTL, GWAS, fine mapping, multi-omics mediation, and pleiotropy concerns.

### Causal Data Preprocessing

Activate `subskills/02-user-data-inspector/` when the user needs causal data preprocessing: dataset profiling, structure validation, variable-role mapping, treatment/outcome/covariate construction, missingness/outlier/dimensionality triage, leakage checks, or early modeling-difficulty flags before selecting the final causal route.

This often supports another primary route rather than replacing it.

### Reporting and interpretation

Activate `subskills/20-reporting-interpretation/` when the user wants a report, methods section, result interpretation, diagnostic summary, limitations section, or reproducibility appendix.

Use this route after the relevant design subskill has supplied the estimand, assumptions, diagnostics, and limitations.

## Mixed Designs

Many real projects need multiple subskills. Examples:

- Online A/B test with session-level data: randomized experiments + unit-of-analysis diagnostics; possibly cluster-robust inference.
- Noncompliant randomized clinical trial: randomized experiments + IV.
- Cluster-randomized trial with spillovers: randomized experiments + interference.
- RCT with time-to-event endpoint and censoring: randomized experiments + survival + missingness/censoring.
- EHR treatment effect with survival outcome and censoring: point-treatment + survival + missingness/censoring + matching/DR.
- Policy adoption by states over years: DiD + synthetic control + reporting.
- Treatment effect with strong subgroup interest: point-treatment or randomized experiments + doubly robust ML + HTE/policy.
- MR with gene expression mediator: causal genomics + IV + mediation.
- Future study with no dataset yet: prospective design planning + one or more candidate design subskills.

## Routing Output Template

```markdown
## Design route

Current mode:
Requested deliverable:
Existing data:
Primary design family:
Fallback design family:
Activated subskills:
Subskills considered but not activated:
Rejected, fallback, or exploratory subskills:

Data structure:
- Rows represent:
- Causal unit:
- Unit analyzed:
- Time variables:
- Assignment mechanism:
- Treatment timing:
- Outcome timing:

Route shortlist:
1. Route:
   - Conditions needed:
   - Status of conditions:
   - Main risks:
2. Route:
   - Conditions needed:
   - Status of conditions:
   - Main risks:

DAG, design diagram, or causal-structure status:
Primary estimand:
Candidate analysis approaches:
Feature construction or reshaping needed:
Prospective data collection requirements:
Future diagnostics to enable:
High-level assumptions explained to the user:
Design-specific assumptions or failure modes deferred to activated subskills:
Diagnostics required before interpretation:
Route-out triggers to monitor:
Unresolved questions that would change the route:
```
