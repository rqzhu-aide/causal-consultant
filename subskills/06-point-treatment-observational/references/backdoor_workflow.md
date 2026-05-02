# Backdoor / Point-Treatment Math Summary

## Identification

For binary treatment `A`, pre-treatment covariates `X`, and outcome `Y`, a common identification condition is:

```math
Y(a) \perp A \mid X, \quad a \in \{0,1\}
```

with positivity:

```math
0 < P(A=1 \mid X=x) < 1
```

Then:

```math
E[Y(a)] = E_X\{E[Y \mid A=a, X]\}
```

This identifies the mean potential outcome under treatment level `a`. Contrasts such as `E[Y(1)-Y(0)]`, risk differences, risk ratios, or mean differences depend on the outcome scale and target population.

## Analysis Routes

### Transparent design route

- propensity score matching or weighting;
- balance diagnostics;
- outcome model with robust standard errors.

### Doubly robust route

- AIPW/TMLE/DML;
- flexible outcome and treatment models;
- cross-fitting;
- influence-function inference.

### Continuous treatment route

- generalized propensity score or covariate balancing;
- dose-response curve;
- positivity over the dose range;
- avoid extrapolation outside observed dose support.

## Minimum Reporting

- target estimand and target population;
- eligibility, time zero, treatment, comparator, outcome, and follow-up;
- covariate timing table;
- balance/overlap diagnostics;
- estimate with uncertainty;
- sensitivity to unmeasured confounding when possible.

## Practical Warnings

- Do not adjust for post-treatment variables when estimating a total effect.
- Do not treat a regression coefficient as the desired marginal causal effect without checking the effect scale and model interpretation.
- Do not continue with an ATE if positivity fails for the full target population; consider ATT, ATO, trimming, or a narrower estimand.
- Do not treat AIPW, TMLE, DML, or causal forests as fixes for unmeasured confounding.
