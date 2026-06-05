# Literature And Software Map

Use this reference when choosing longitudinal g-methods, diagnostics, packages, or report language.

## Core Ideas

- Longitudinal causal questions need intervention histories, not just "time" in a model.
- The target is often `E[Y^g]`: the mean outcome if everyone followed strategy `g`.
- Sequential exchangeability means treatment/censoring decisions are as good as random conditional on observed history, at each decision time.
- Positivity is over histories: each strategy must be possible for relevant treatment and covariate histories.
- Naive time-updated regression can be biased when prior treatment affects later confounders that also predict future treatment and outcome.

## Minimal Math

- Strategy mean: `psi(g) = E[Y^g]`.
- Strategy contrast: `E[Y^{g1} - Y^{g0}]`, comparing two longitudinal strategies.
- Dynamic rule: `A_t = d_t(H_t)`, where treatment at time `t` depends on observed history `H_t`.
- Sequential exchangeability cue: `Y^g independent of A_t given H_t` at each treatment time, plus censoring assumptions when follow-up can end early.
- IPW/MSM weight cue: weights accumulate across time, roughly as products of inverse probabilities for treatment and censoring decisions given history.

## Selected Literature

- Robins (1986): foundational g-computation/g-formula logic for sustained exposures.
- Robins (1989): structural nested models and g-estimation for longitudinal treatments.
- Robins, Hernan, and Brumback (2000): marginal structural models and inverse-probability weighting for time-varying confounding.
- Hernan, Brumback, and Robins (2000): applied MSM example with treatment/censoring weights.
- Hernan and Robins (2020): sequential exchangeability, IP weights, g-formula, and longitudinal target-trial logic.
- Taubman et al. (2009): parametric g-formula for strategy simulation.
- Daniel et al. (2013): tutorial comparison of g-methods for time-dependent confounding.
- Keil et al. (2014): parametric g-formula for time-to-event data.
- Young et al. (2011): dynamic-regime comparison with parametric g-formula.
- van der Laan and Gruber (2012): longitudinal TMLE.
- Lendle et al. (2017): `ltmle` software for longitudinal targeted learning.
- Diaz and van der Laan (2018): stochastic treatment regimes.
- Haneuse and Rotnitzky (2013): modified treatment policies.
- Rudolph et al. (2024): longitudinal modified treatment policies.

## Package And Tool Lanes

| Need | R options | Python options | Notes |
|---|---|---|---|
| MSM/IPW | `ipw`, `WeightIt`, `survey`, `cobalt` | `zepid`, custom `statsmodels` weights | inspect weights, truncation, ESS, balance |
| Parametric g-formula | `gfoRmula`, custom simulation | custom simulation, `statsmodels` | model dependence is central |
| Longitudinal TMLE / sequential DR | `ltmle`, `tmle3`, `sl3`, `SuperLearner` | custom workflows, limited Python support | ordering and node specification are fragile |
| LMTP / stochastic intervention | `lmtp`, `sl3` | custom workflows | useful for realistic treatment modifications |
| Dynamic regimes | `DynTxRegime`, `polle` | custom policy evaluation, ML libraries | pair with `15-dynamic-treatment-policies` |
| Survival outcomes | `survival`, `riskRegression`, `gfoRmula` | `lifelines`, `statsmodels`, `zepid` | pair with `23-survival-competing-risks` |
| Flexible nuisance learners | `sl3`, `SuperLearner`, `grf`, `mlr3` | `scikit-learn`, `DoubleML`, `EconML` | ML is support, not identification |

## Practical Selection Rules

- Need a marginal contrast of sustained strategies: start with MSM/IPW if weights are stable.
- Need absolute risks under complex strategies: use parametric g-formula.
- Need flexible nuisance and targeted inference: consider longitudinal TMLE or sequential DR.
- Need realistic shifts rather than impossible static regimens: consider LMTP or stochastic intervention logic.
- Need learned policies: ask main to route `15-dynamic-treatment-policies`.
- Need time-to-event or competing-risk reporting: ask main to route `23-survival-competing-risks`.
- Need high-dimensional histories: use Super Learner, DML-style nuisance support, or TMLE/LMTP, while keeping time ordering and positivity central.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [lmtp manual](https://cran.r-universe.dev/lmtp/doc/manual.html), [ltmle `ltmle`](https://www.rdocumentation.org/packages/ltmle/versions/1.3-0/topics/ltmle), [gfoRmula index](https://search.r-project.org/CRAN/refmans/gfoRmula/html/00Index.html)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. Save estimate/table, diagnostic/plot, and source code paths for `artifact_index`.

```r
# Tiny sketch, not a complete script.
# Use wide longitudinal data ordered by time; replace node names.
library(lmtp)

fit <- lmtp_sdr(data = wide_data,
                trt = c("A1", "A2", "A3"),
                outcome = "Y",
                baseline = c("W1", "W2"),
                time_vary = list(c("L1"), c("L2"), c("L3")),
                cens = c("C1", "C2", "C3"),
                shift = NULL, mtp = FALSE)
```

Artifact outputs to preserve: strategy-effect table path, weight/positivity diagnostic path, source code path.
