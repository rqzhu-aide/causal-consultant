# Survival and Competing-Risk Estimand Notes

## Prefer Interpretable Time or Risk Scales

Hazard ratios are not risk ratios. If the scientific question concerns the chance of an event by time `t`, use survival probabilities, risks, cumulative incidence, or RMST. If the question concerns event-free time up to a clinically meaningful horizon, use RMST or restricted mean time lost.

## Common Estimands

```math
S_a(t) = P(T^a > t)
```

```math
Risk_a(t) = P(T^a \le t)
```

```math
RMST_a(\tau) = E[\min(T^a,\tau)] = \int_0^\tau S_a(t) dt
```

For competing event type `k`:

```math
F_{ak}(t) = P(T^a \le t, J^a=k)
```

For heterogeneous survival effects:

```math
\tau_{\text{RMST}}(x) = E[\min(T^1,\tau)-\min(T^0,\tau) \mid X=x]
```

or

```math
\tau_{S(t)}(x) = P(T^1>t \mid X=x)-P(T^0>t \mid X=x)
```

## Time Zero

Time zero must align eligibility, treatment assignment or initiation, and start of follow-up. Misaligned time zero is a common source of immortal time bias. In observational studies, ask what randomized target trial the analysis is trying to emulate.

## Censoring

If censoring depends on treatment and prognostic factors, consider inverse probability of censoring weights, AIPW/TMLE, longitudinal g-methods, or sensitivity analyses. Always distinguish administrative censoring from loss to follow-up and from competing events.

## Competing Events

A competing event is observed, not missing. For most absolute-risk questions, estimate cumulative incidence. Censoring competing events usually targets a different hypothetical estimand and requires stronger assumptions.

## Hazard Models

Cox, cause-specific hazard, Fine-Gray, and AFT models may be useful, but they answer model-scale questions. Translate to survival probabilities, risks, RMST, or CIFs when communicating causal effects or decisions.
