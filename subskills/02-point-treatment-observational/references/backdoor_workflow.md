# Backdoor / Point-Treatment Workflow

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
- covariate timing table;
- balance/overlap diagnostics;
- estimate with uncertainty;
- sensitivity to unmeasured confounding when possible.
