# Assumption Ledger

Every causal analysis should maintain an assumption ledger. The ledger distinguishes identification assumptions, measurement/design assumptions, and estimator/model assumptions.

## Universal Identification Assumptions

### Consistency

The observed outcome equals the potential outcome under the treatment actually received:

```math
Y = Y(A)
```

Concerns:

- vague treatment definitions;
- multiple versions of treatment;
- nonadherence;
- inconsistent outcome definitions.

### Exchangeability / No Unmeasured Confounding

For point-treatment observational studies:

```math
Y(a) \perp A \mid X
```

Concerns:

- omitted confounders;
- confounders measured after treatment;
- differential measurement quality;
- reverse causality.

### Positivity / Overlap

For all covariate values in the target population:

```math
0 < P(A=a \mid X=x) < 1
```

Concerns:

- deterministic treatment rules;
- propensity scores near 0 or 1;
- lack of comparable treated/control units;
- extreme weights.

### SUTVA / No Interference

A unit's outcome under treatment does not depend on other units' treatment, unless the estimand explicitly models exposure to others' treatment.

Concerns:

- infectious disease transmission;
- peer effects;
- market equilibrium effects;
- household/school/hospital spillovers;
- network treatment propagation.

## Design-Specific Assumptions

### Randomized experiments

- valid randomization;
- no differential attrition or appropriately handled attrition;
- adherence/noncompliance assumptions if estimating per-protocol or complier effects;
- correct clustering and randomization-unit inference.

### Matching/weighting/backdoor adjustment

- sufficient measured pre-treatment confounders;
- no adjustment for mediators/colliders in total-effect analysis;
- adequate balance after preprocessing;
- positivity and stable weights.

### Doubly robust / ML methods

- same identification assumptions as backdoor adjustment;
- nuisance functions estimated with appropriate sample splitting/cross-fitting where needed;
- standard errors account for estimation procedure;
- machine learning does not remove unmeasured confounding.

### Longitudinal g-methods

- sequential exchangeability;
- sequential positivity;
- correct temporal ordering;
- appropriate handling of censoring and competing events;
- treatment/censoring models or outcome models adequate for chosen estimator.

### Difference-in-differences

- parallel trends or conditional parallel trends;
- no anticipation;
- stable composition;
- no interference/spillovers across units;
- appropriate handling of staggered adoption and heterogeneous treatment effects.

### Regression discontinuity

- continuity of potential outcomes at cutoff;
- no precise manipulation of running variable;
- correct cutoff and running variable;
- local nature of estimand;
- fuzzy RD requires IV-like assumptions near cutoff.

### Instrumental variables

- instrument relevance;
- instrument independence/exogeneity;
- exclusion restriction;
- monotonicity for LATE;
- no weak instrument problems;
- interpretable complier population.

### Synthetic control / CausalImpact

- control units/series are not affected by treatment;
- pre-treatment fit is adequate;
- treated-control relationship remains stable after intervention;
- no simultaneous shocks differentially affecting treated unit;
- intervention timing is known.

### Survival/competing risks

- censoring independent conditional on measured covariates, if censoring adjusted;
- time zero and risk set correctly defined;
- competing event handling matches scientific question;
- hazards not overinterpreted as risks.

### Mediation

- no unmeasured treatment-outcome confounding;
- no unmeasured mediator-outcome confounding;
- no unmeasured treatment-mediator confounding;
- no mediator-outcome confounder affected by treatment, unless using methods that address it;
- cross-world assumptions for natural effects or suitable interventional estimand alternative.

### Interference

- correct exposure mapping;
- partial interference or network assumptions stated;
- positivity for exposure conditions;
- cluster/network dependence handled in inference.

### Causal discovery

- assumptions depend on algorithm: causal sufficiency or hidden-variable allowance, Markov property, faithfulness, acyclicity, functional form, independent errors, stationarity for time series;
- outputs are candidate graphs or equivalence classes, not direct proof.

## Ledger Template

```markdown
| Assumption | Needed for | Evidence/diagnostic | Status | Consequence if violated | Sensitivity/mitigation |
|---|---|---|---|---|---|
| Consistency | estimand definition | treatment protocol clear? | unresolved | ambiguous effect | refine treatment definition |
| Exchangeability | identification | covariate list/DAG | unresolved | confounding bias | DAG, negative controls, sensitivity |
| Positivity | identification and estimation | overlap/weights | unresolved | extrapolation/extreme weights | trimming, overlap estimand |
| No interference | estimand/identification | domain review | unresolved | spillover bias | exposure mapping/interference design |
```

## Status Labels

Use:

- **Satisfied by design**: e.g., randomization was properly implemented.
- **Plausible but untestable**: e.g., no unmeasured confounding.
- **Partially testable**: e.g., balance, pretrends, manipulation checks.
- **Violated or implausible**: requires redesign, different estimand, or descriptive framing.
- **Unresolved**: ask user for more information or report as limitation.
