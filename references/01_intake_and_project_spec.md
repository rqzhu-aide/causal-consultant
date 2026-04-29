# Intake and Causal Project Specification

The intake stage transforms a vague request into a causal project specification. The agent should ask only the questions needed for the next decision.

## Core Intake Fields

### Scientific question

Convert the user's goal into the form:

> Among population `P`, what is the effect of intervention `A=a` versus comparator `A=a'` on outcome `Y` measured over follow-up window `T`?

### Treatment/intervention

Clarify:

- Is treatment binary, categorical, continuous, ordinal, multivalued, time-varying, cluster-level, policy-level, or encouragement/instrumental?
- Is it well-defined enough that different analysts would agree who is treated?
- Does treatment have versions? If yes, are versions causally equivalent or should they be distinct interventions?
- When does treatment start?
- Is treatment adherence important?

### Comparator

Clarify:

- untreated/no intervention;
- usual care;
- alternative active treatment;
- lower dose;
- different policy;
- threshold just below cutoff;
- never treated versus not-yet-treated;
- another dynamic regime.

### Outcome

Clarify:

- outcome type: continuous, binary, count, ordinal, survival/time-to-event, recurrent event, competing risk, longitudinal, time series;
- measurement time;
- follow-up window;
- clinical/scientific meaningful scale;
- whether outcome can occur before treatment;
- whether death or competing events affect interpretability.

### Time zero

Time zero is the start of causal follow-up. It must be defined before or at treatment assignment/initiation. It should not depend on future events.

Ask:

- When does a unit become eligible?
- When is treatment assigned or initiated?
- When does outcome follow-up start?
- Are treated and comparator groups aligned at the same eligibility time?

### Unit and population

Clarify:

- row-level unit: person, visit, hospital, county, school, product, gene, SNP, time point, network node;
- independent unit versus repeated observations;
- inclusion/exclusion criteria;
- target population for interpretation;
- whether sampling weights or survey design are present.

### Estimand

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

### Variable timing classification

Create a variable role table:

| Variable | Measured when? | Role | Include for total-effect adjustment? | Notes |
|---|---:|---|---|---|
| X | pre-treatment | confounder/effect modifier | often yes |  |
| M | post-treatment | mediator | no for total effect | maybe mediation analysis |
| C | post-treatment | censoring/selection | maybe through IPCW | avoid naive conditioning |
| Z | pre-treatment | instrument | usually not as confounder | use IV if assumptions plausible |
| S | affected by A/Y | collider/selection | no naive adjustment | selection-bias concern |

## Question Strategy

Ask questions in layers.

### Layer 1: mandatory for any causal analysis

1. What is the treatment/intervention?
2. What is the comparator?
3. What is the outcome and follow-up time?
4. What is time zero?
5. What is the target population/unit?
6. Is treatment randomized, quasi-random, or observational?

### Layer 2: needed for method selection

1. Are data cross-sectional, cohort, longitudinal, panel, time series, networked, or genomic?
2. Is treatment time-varying?
3. Are there repeated measures or clustering?
4. Is the outcome censored or time-to-event?
5. Are there spillovers/interference?
6. Are there missing data, attrition, censoring, or selection mechanisms?

### Layer 3: needed for final analysis

1. What variables are candidate pre-treatment confounders?
2. What variables are post-treatment or mediators?
3. What model scale is scientifically meaningful?
4. What diagnostics or sensitivity analyses are required by the field?
5. What software does the user prefer?

## When to Proceed With Provisional Assumptions

Proceed if the treatment, comparator, outcome, time zero, and data design are sufficiently clear. State assumptions as provisional, for example:

> I will proceed under the provisional assumption that all listed covariates were measured before treatment and that the target estimand is the ATE. If this is wrong, the method and interpretation may change.

## Intake Output Template

```markdown
## Causal project specification

- Scientific question:
- Unit of analysis:
- Treatment:
- Comparator:
- Outcome:
- Time zero:
- Follow-up:
- Target population:
- Estimand:
- Data design:
- Candidate confounders:
- Post-treatment variables to avoid in total-effect adjustment:
- Missingness/censoring/selection concerns:
- Clustering/interference concerns:
- Candidate methods:
- Key unresolved questions:
```
