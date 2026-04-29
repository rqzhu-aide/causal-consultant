# Survival and Competing-Risk Estimand Notes

## Prefer Risk-Scale Interpretations When Appropriate

Hazard ratios are not risk ratios. If the scientific question concerns probability of an event by time `t`, use survival probabilities, risks, cumulative incidence, or RMST.

## Common Estimands

```math
S_a(t) = P(T^a > t)
```

```math
Risk_a(t) = P(T^a \le t)
```

```math
RMST_a(\tau) = \int_0^\tau S_a(t) dt
```

For competing event type `k`:

```math
F_{ak}(t) = P(T^a \le t, J^a=k)
```

## Time Zero

Time zero must be eligibility/assignment/initiation time and must be comparable across treatment groups. Misaligned time zero is a common source of immortal time bias.

## Censoring

If censoring depends on treatment and prognostic factors, consider inverse probability of censoring weights, multiple imputation for censoring-related missingness, or sensitivity analyses.
