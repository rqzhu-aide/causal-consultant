# Design Router

Use this file after the intake has identified the basic causal question.

## Top-Level Design Questions

1. Was treatment assigned by the investigator?
2. If randomized, is there noncompliance, clustering, attrition, or interference?
3. If observational, is treatment measured once or repeatedly over time?
4. Is there a natural experiment: policy change, cutoff, instrument, or staggered adoption?
5. Is the outcome time-to-event or subject to censoring/competing risks?
6. Is the user asking for average effects, heterogeneity, mechanisms, spillovers, or graph discovery?

## Routing Logic

### Randomized experiment

Activate `subskills/01-randomized-experiments/`.

Also activate:

- `11-survival-competing-risks` if outcome is time-to-event;
- `05-heterogeneous-effects-policy` for subgroup/personalized effects;
- `13-interference-spillovers` for cluster spillover or network effects;
- `16-missingness-measurement-selection` for attrition/nonresponse.

### Observational point treatment

Activate `subskills/02-point-treatment-observational/`.

Also activate:

- `03-matching-weighting-balance` if design uses propensity scores, matching, stratification, or weighting;
- `04-doubly-robust-ml` if using AIPW/TMLE/DML or high-dimensional nuisance models;
- `05-heterogeneous-effects-policy` if CATE/HTE is requested;
- `11-survival-competing-risks` for time-to-event outcomes;
- `12-mediation` if the target is mechanism;
- `16-missingness-measurement-selection` for missingness/censoring/selection.

### Longitudinal treatment

Activate `subskills/06-longitudinal-gmethods/`.

Use this when treatment or confounders change over time, especially when past treatment affects later confounders.

Also activate:

- `11-survival-competing-risks` for survival outcomes;
- `05-heterogeneous-effects-policy` for dynamic treatment regimes or individualized policies.

### Panel/policy/staggered adoption

Activate `subskills/07-did-event-study/`.

Use this when there are units observed before and after policy/treatment adoption.

Also activate:

- `10-synthetic-control-time-series` if few treated units or aggregate units;
- `16-missingness-measurement-selection` if panel attrition or changing composition matters.

### Cutoff-based assignment

Activate `subskills/08-regression-discontinuity/`.

Also activate:

- `09-instrumental-variables` if assignment at cutoff is fuzzy rather than deterministic.

### Instrument or encouragement design

Activate `subskills/09-instrumental-variables/`.

Use this when a variable affects treatment uptake but is claimed not to affect outcome except through treatment.

### Aggregate time-series intervention

Activate `subskills/10-synthetic-control-time-series/`.

Use this when there is a treated time series, a policy shock, pre/post periods, and possibly control series.

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

- EHR treatment effect with survival outcome and censoring: point-treatment + survival + missingness/censoring + matching/DR.
- Policy adoption by states over years: DiD + synthetic control + reporting.
- Treatment effect with strong subgroup interest: point-treatment + doubly robust ML + HTE/policy.
- Noncompliant randomized trial: randomized experiments + IV.
- MR with gene expression mediator: causal genomics + IV + mediation.

## Routing Output Template

```markdown
## Design route

Primary design family:
Activated subskills:
Excluded design families and why:
Primary estimand:
Candidate methods:
Design-specific assumptions to audit:
Diagnostics required before interpretation:
```
