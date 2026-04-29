# Design Router

Use this file after the intake has identified the basic causal question. The router should not merely classify the user's design label; it should check whether the data and implementation actually support the claimed design.

## Top-Level Design Questions

1. Was treatment assigned by an investigator, platform, protocol, randomization device, or policy rule?
2. If randomized, what was randomized: individual, cluster, household, school, clinic, physician, account, cookie, device, session, time period, sequence, or site?
3. Is the dataset row the same as the randomization unit? If not, does inference account for clustering/repeated observations?
4. Was assignment actually random and recorded before treatment/exposure/outcome?
5. Were units excluded after randomization? If yes, why and based on variables measured when?
6. Did assignment equal treatment receipt/exposure, or is there noncompliance/triggering/crossover?
7. Are missing outcomes, attrition, censoring, or logging failures present and differential by arm?
8. Could one unit's assigned treatment affect another unit's outcome?
9. Is the outcome time-to-event, repeated, longitudinal, ratio-valued, count-valued, binary, or continuous?
10. Is the user asking for average effects, heterogeneity, mechanisms, spillovers, policy value, or graph discovery?

## Routing Logic

### Randomized experiment, A/B test, or investigator-assigned treatment

Activate `subskills/01-randomized-experiments/` when the user says or the data indicate any of the following:

- randomized controlled trial, clinical trial, field experiment, lab experiment, online A/B test, experiment arm, treatment/control arm, random assignment, split test, holdout, encouragement trial, randomized rollout;
- treatment was assigned by a randomization protocol;
- a design file contains assignment probabilities, block IDs, cluster IDs, or experiment arms;
- the user wants power, MDE, randomization, CONSORT-style flow, randomization-inference, sample-ratio mismatch, CUPED, or trial reporting.

The root skill should first ask only the minimum randomized-design audit questions:

```yaml
randomization_claim: true | false | unclear
unit_randomized: individual | cluster | time-period | sequence | account | session | device | site | unknown
unit_analyzed: row meaning in dataset
assignment_variable: name or unknown
treatment_received_variable: name or same_as_assignment | unknown
assignment_probabilities: known | unknown
randomization_scheme: simple | complete | blocked | clustered | blocked-clustered | factorial | crossover | SMART | adaptive | unknown
primary_outcome: name and scale
follow_up_window: defined | unclear
post_randomization_exclusions: none | present | unknown
missing_outcomes_or_attrition: none | present | unknown
interference_plausible: no | yes | unknown
```

Then route as follows:

| Randomized-design finding | Primary route | Additional route or exit condition |
|---|---|---|
| Individual-level assignment, one row per randomized unit, complete follow-up | `01-randomized-experiments` | Use difference in means/proportions, randomization inference, or regression adjustment. |
| User says A/B test but data are event/session rows while assignment is user/account-level | `01-randomized-experiments` | Keep RCT route, but require aggregation to randomization unit or cluster-robust/repeated-measure inference. |
| Assignment probabilities known and observed arm counts available | `01-randomized-experiments` | Require sample-ratio mismatch check before interpreting online-experiment results. |
| Strong baseline/pre-period metric available | `01-randomized-experiments` | Allow CUPED/ANCOVA/regression adjustment using pre-treatment covariates. |
| Blocked or stratified randomization | `01-randomized-experiments` | Use block-aware estimator or block fixed effects. |
| Cluster randomization | `01-randomized-experiments` | Use cluster-level analysis, cluster-robust inference, or GEE/mixed model; clarify cluster-weighted vs individual-weighted estimand. |
| Noncompliance, crossover, treatment switching, or imperfect take-up | `01-randomized-experiments` + `09-instrumental-variables` | ITT remains primary; CACE/LATE requires IV assumptions. |
| Fuzzy exposure / triggered analysis in online experiment | `01-randomized-experiments` | Distinguish all-assigned ITT from triggered/exposure estimand. If trigger is post-treatment, warn strongly. |
| Attrition, outcome missingness, censoring, logging failures | `01-randomized-experiments` + `16-missingness-measurement-selection` | Report missingness by arm; consider bounds, IPCW, imputation, or sensitivity analysis. |
| Time-to-event endpoint, death, competing risks, administrative censoring | `01-randomized-experiments` + `11-survival-competing-risks` | Define risk/survival/RMST/CIF estimand before modeling. |
| Spillovers, network exposure, household contamination, marketplace effects | `01-randomized-experiments` + `13-interference-spillovers` | Do not use naive SUTVA-based individual RCT interpretation. |
| Subgroup effects, personalization, uplift, optimal treatment rules | `01-randomized-experiments` + `05-heterogeneous-effects-policy` | Keep randomized identification but use held-out or honest HTE workflow. |
| Multiple post-treatment mediators/pathways requested | `01-randomized-experiments` + `12-mediation` | Do not adjust for mediators in the primary total-effect analysis. |
| Longitudinal dynamic treatment sequences or SMART | `01-randomized-experiments` + `06-longitudinal-gmethods` | Define regime-specific estimands and randomization stages. |
| Crossover trial with period/carryover effects | `01-randomized-experiments` + possibly `06-longitudinal-gmethods` | Check sequence, period, washout, and carryover assumptions. |
| Randomization claim unsupported or randomization happened after outcome/exclusion | Exit `01` as primary | Reclassify as observational point-treatment (`02`), DiD (`07`), RD (`08`), IV (`09`), or descriptive analysis. |
| Assignment is based on a deterministic or probabilistic cutoff | `08-regression-discontinuity`; if fuzzy, also `09-instrumental-variables` | Do not treat as ordinary RCT unless randomization within cutoff bands was explicit. |
| Treatment is a policy adopted by some units over time, not randomized | `07-did-event-study` and possibly `10-synthetic-control-time-series` | Do not route to RCT merely because treatment timing varied. |

#### Conditions that route out of randomized-experiments as the primary design

The randomized-experiment subskill should hand control back to the root router when any of these are true:

1. **No actual random assignment.** Treatment was chosen by users, clinicians, firms, schools, or policy makers without randomized assignment. Route to `02-point-treatment-observational`, `07-did-event-study`, `08-regression-discontinuity`, `09-instrumental-variables`, or `10-synthetic-control-time-series` depending on the design.
2. **Randomization occurred after conditioning on a post-treatment event.** If the provided dataset contains only exposed, triggered, surviving, adherent, or retained units, then the original all-randomized ITT estimand is not directly available. Keep `01` for describing the failed/mutated experiment, but use `16` and possibly `02` for selection/missingness analysis.
3. **The treatment being analyzed differs from assigned treatment.** If the user wants the effect of treatment actually received rather than assigned treatment, activate `09-instrumental-variables` for CACE/LATE or route to observational methods if IV assumptions are not plausible.
4. **Interference dominates the design.** If spillovers are central, activate `13-interference-spillovers` and redefine exposure mappings before any RCT estimator.
5. **The trial estimand is a survival or competing-risk estimand.** Activate `11-survival-competing-risks`; keep `01` only for randomization and trial conduct diagnostics.
6. **The user's target is mechanism rather than total effect.** Activate `12-mediation` after first reporting the primary randomized total effect if available.

### Observational point treatment

Activate `subskills/02-point-treatment-observational/` when treatment is measured once, treatment was not randomized, and the user wants a causal effect under measured-confounding assumptions.

Also activate:

- `03-matching-weighting-balance` if design uses propensity scores, matching, stratification, or weighting;
- `04-doubly-robust-ml` if using AIPW/TMLE/DML or high-dimensional nuisance models;
- `05-heterogeneous-effects-policy` if CATE/HTE is requested;
- `11-survival-competing-risks` for time-to-event outcomes;
- `12-mediation` if the target is mechanism;
- `16-missingness-measurement-selection` for missingness/censoring/selection.

### Longitudinal treatment

Activate `subskills/06-longitudinal-gmethods/` when treatment or confounders change over time, especially when past treatment affects later confounders.

Also activate:

- `11-survival-competing-risks` for survival outcomes;
- `05-heterogeneous-effects-policy` for dynamic treatment regimes or individualized policies;
- `16-missingness-measurement-selection` for time-varying censoring or observation processes.

### Panel/policy/staggered adoption

Activate `subskills/07-did-event-study/` when there are units observed before and after policy/treatment adoption.

Also activate:

- `10-synthetic-control-time-series` if few treated units or aggregate units;
- `16-missingness-measurement-selection` if panel attrition or changing composition matters.

### Cutoff-based assignment

Activate `subskills/08-regression-discontinuity/` when treatment assignment changes at a threshold or score cutoff.

Also activate:

- `09-instrumental-variables` if assignment at cutoff is fuzzy rather than deterministic;
- `01-randomized-experiments` only if there is explicit randomization inside a bandwidth or lottery window.

### Instrument or encouragement design

Activate `subskills/09-instrumental-variables/` when a variable affects treatment uptake but is claimed not to affect outcome except through treatment.

Also activate:

- `01-randomized-experiments` if the instrument is randomized assignment or encouragement;
- `08-regression-discontinuity` if the instrument is cutoff eligibility;
- `15-causal-genomics` if the instrument is genetic/omics-based.

### Aggregate time-series intervention

Activate `subskills/10-synthetic-control-time-series/` when there is a treated time series, a policy shock, pre/post periods, and possibly control series.

### Survival/competing risks

Activate `subskills/11-survival-competing-risks/` whenever the outcome is time-to-event or censoring is central.

This may combine with randomized, observational, longitudinal, DiD, IV, or HTE subskills.

### Mediation/mechanism

Activate `subskills/12-mediation/` when the user asks about pathways, direct effects, indirect effects, mechanisms, or mediators.

### Interference/spillovers

Activate `subskills/13-interference-spillovers/` if one unit's treatment can affect another unit's outcome.

### Causal discovery

Activate `subskills/14-causal-discovery/` if the user asks to learn a causal graph from data.

Do not confuse causal discovery with causal effect estimation from a known treatment and outcome.

### Causal genomics

Activate `subskills/15-causal-genomics/` for Mendelian randomization, colocalization, eQTL, GWAS, fine mapping, multi-omics mediation, and pleiotropy concerns.

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

## Routing Output Template

```markdown
## Design route

Primary design family:
Activated subskills:
Subskills considered but not activated:
Excluded design families and why:
Randomization claim audit:
Unit randomized:
Unit analyzed:
Assignment mechanism:
Primary estimand:
Candidate methods:
Design-specific assumptions to audit:
Diagnostics required before interpretation:
Route-out triggers to monitor:
```
