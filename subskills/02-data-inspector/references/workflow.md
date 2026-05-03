# Workflow: User Data Inspection

## Goal

Use this workflow before choosing or fitting a causal model. The goal is to turn a raw or semi-clean dataset into a causal-analysis-ready structure, while flagging issues that could damage validity later.

In the main-skill architecture, this workflow is the backend data/preprocessing record. The main skill usually speaks with the user; this workflow updates the `02-data-inspector` YAML entry and feeds concrete data facts to the main skill, domain helper, design planner, and DAG builder.

This workflow centers on:

- basic data profile: sample size, dimensions, missingness, outliers, variable types;
- data structure: units, IDs, time, repeated measures, clusters, cohorts, panels, longitudinal format;
- causal variable roles: treatment, outcome, covariates, confounder proxies, propensity-score candidates, mediators, post-treatment variables;
- modeling difficulties: high dimension, sparse treatment groups, rare outcomes, limited overlap, too few clusters/time periods, leakage risk.

## Coordination With Other Foundation Components

- Coordinate with the main skill by reporting data facts in user-friendly summaries: what exists, what is missing, what seems safe, and what needs clarification.
- Coordinate with `01-domain-helper` by checking whether actual or conceptual data match domain expectations.
- Coordinate with `03-design-planner` by recording whether the actual or conceptual schema supports the design: assignment/exposure records, time zero, follow-up, IDs, clusters, repeated measures, pre-periods, network links, and measurement schedule.
- Coordinate with `04-dag-builder` by providing variable timing, candidate treatment/outcome variables, baseline covariates, possible confounders, mediators, instruments, selection/censoring variables, and variables with unclear roles.
- Do not let data shape alone choose the final method. A route recommendation from this workflow is provisional until design feasibility and causal logic agree.

## Intake Checklist

- [ ] What does one row represent?
- [ ] What does the user believe the treatment/exposure is?
- [ ] What outcome is intended, and when is it measured?
- [ ] What is the domain story about how treatment is assigned?
- [ ] What variables are known before treatment?
- [ ] Which variables might be post-treatment, mediators, or consequences of treatment?
- [ ] Are there unit IDs, group IDs, time variables, visit numbers, or event dates?
- [ ] Is the data cross-sectional, cohort, panel, longitudinal, repeated-measures, clustered, survival, networked, or aggregate?
- [ ] Are there enough treated/control units, events, clusters, and time periods for plausible modeling?
- [ ] Are there missingness, outlier, high-dimensional, or leakage concerns?

## Analysis Planning

1. Infer expected structure from the user's domain description.
2. Inspect the dataset profile.
3. Identify IDs, time variables, treatment, outcome, and likely covariates.
4. Validate the structure against the expected causal design.
5. Build a variable-role table.
6. Decide safe preprocessing steps.
7. Flag modeling difficulties and method constraints.
8. Route to the next causal subskill or ask targeted questions.

## Data Profile Checklist

- row count and column count;
- unique unit count;
- duplicate unit/time keys;
- variable types;
- missingness by column;
- treatment and outcome missingness;
- numeric ranges and impossible values;
- outliers and heavy tails;
- categorical levels and rare categories;
- constant or near-constant variables;
- high-cardinality variables;
- memory/size constraints;
- \(p/n\), treated/control counts, and event counts.

## Structure Checklist

### Cross-sectional or cohort

- one row per unit;
- treatment or exposure measured before outcome;
- baseline covariate window available;
- follow-up/outcome window available.

### Repeated measures or longitudinal

- unit ID;
- time or visit index;
- repeated outcome and/or treatment measurements;
- irregular visits or missing visits;
- time-varying covariates and possible treatment-confounder feedback.

### Panel or DiD

- unit ID;
- calendar time;
- treatment adoption time;
- pre-period and post-period outcomes;
- balanced or unbalanced panel;
- cluster or region indicators.

### Clustered or multilevel

- group/cluster/site ID;
- treatment assigned at individual or cluster level;
- outcome measured at individual or cluster level;
- number of clusters and cluster sizes.

### Survival or event data

- time zero;
- event date or duration;
- event indicator;
- censoring indicator/date;
- competing event codes if present.

### High-dimensional data

- number of features relative to sample size;
- feature blocks;
- sparsity;
- baseline availability;
- planned screening or dimension reduction;
- leakage risk.

## Variable-Role Mapping

Assign every important variable to one of these roles:

- treatment/exposure;
- treatment timing or dose;
- outcome;
- outcome timing;
- baseline covariate;
- plausible confounder;
- propensity-score candidate;
- effect modifier;
- mediator or post-treatment variable;
- instrument or encouragement;
- cluster/group ID;
- unit ID;
- time variable;
- censoring/observation indicator;
- variable to exclude;
- unclear role.

## Safe Preprocessing Patterns

Generally safe when documented:

- standardize units;
- parse dates;
- recode labels using a codebook;
- remove exact duplicate records after key audit;
- create baseline summaries from pre-treatment windows;
- encode categorical covariates;
- scale continuous covariates for algorithms;
- create missingness indicators for descriptive audit;
- impute baseline covariates when assumptions are plausible;
- use unsupervised dimension reduction on baseline covariates only.

Potentially unsafe:

- use future visits to construct baseline;
- use post-treatment variables in propensity scores;
- drop rows based on outcome availability without checking treatment/prognosis patterns;
- remove outliers after seeing treatment effects;
- infer treatment from downstream behavior;
- include mediators as confounders for a total effect;
- select features by outcome association without sample splitting/cross-fitting;
- collapse repeated rows without preserving time.

## Modeling Difficulty Triage

Flag:

- treated group too small;
- control group too small;
- rare outcome or few events;
- high \(p/n\);
- sparse high-cardinality categories;
- many covariates relative to treated/event count;
- poor covariate overlap;
- continuous treatment with sparse dose range;
- multi-arm treatment with rare arms;
- too few clusters for cluster-robust inference;
- too few pre-periods for DiD/synthetic control;
- irregular time-varying treatment;
- missingness concentrated in treatment/outcome/covariates;
- plausible unmeasured confounding due to absent key variables.

## Route Decisions

| Data finding | Likely route |
|---|---|
| One row per unit, baseline treatment, fixed outcome | point-treatment observational or randomized experiment |
| Strong treatment imbalance and many baseline covariates | matching/weighting/balance |
| High-dimensional baseline covariates | doubly robust/ML or simpler screened model |
| Repeated time-varying treatment/covariates | longitudinal g-methods |
| Panel with adoption timing | DiD/event study |
| One/few treated aggregate units over time | synthetic control/time series |
| Event times and censoring | survival/competing risks |
| Post-treatment mediator variables | mediation |
| Network/geographic spillovers | interference/spillovers |
| Measurement/censoring process dominates | method-specific handoff and sensitivity/reporting |

## Suggested Response Pattern

```markdown
Based on the domain description, I am assuming rows represent [unit], treatment is [column/concept], outcomes are measured at [time], and these variables are likely pre-treatment covariates.

The data structure appears to be [cross-sectional/cohort/panel/longitudinal/etc.] because [IDs/time/repeated rows].

Before causal modeling, I would preprocess [safe steps] and avoid [unsafe steps]. The variables I would consider for the propensity/outcome model are [covariates], while [variables] look post-treatment or unclear.

The main modeling constraints are [sample size/dimension/overlap/rare outcome/etc.]. That suggests [next route] and makes [methods] risky unless [fix/check] is addressed.
```

## Output Template

```markdown
### Causal Data Preprocessing Summary

#### 1. Working assumptions
- Unit:
- Treatment/exposure:
- Outcome:
- Timing:
- Expected structure:

#### 2. Data profile
- Sample size:
- Dimensions:
- IDs/time/group variables:
- Missingness:
- Outliers/range issues:
- Treatment/outcome distribution:

#### 3. Variable roles
- Treatment:
- Outcome:
- Candidate covariates:
- Likely confounders:
- Propensity-score candidates:
- Effect modifiers:
- Post-treatment/mediator variables:
- Unclear variables:

#### 4. Preprocessing plan
- Safe cleaning:
- Encoding/transformation:
- Missingness handling:
- Outlier handling:
- Dimension reduction:
- Leakage checks:

#### 5. Modeling implications
- Key risks:
- Methods supported:
- Methods risky:
- Required fixes:
- Next route:
```

## Reference Files

- `literature_and_software.md`: preprocessing principles and software notes.
