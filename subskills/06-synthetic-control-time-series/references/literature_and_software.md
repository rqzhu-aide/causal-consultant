# Literature And Software Map

Use this file to choose credible synthetic-control, synthetic DiD, interrupted time-series, and Bayesian structural time-series tools. Keep the main team focused on treated-unit definition, donor/control validity, pre-period fit, intervention timing, and sensitivity evidence.

## Core Literature

### Classic Synthetic Control

- Abadie and Gardeazabal (2003), [The economic costs of conflict: a case study of the Basque Country](https://doi.org/10.1257/000282803321455188): early synthetic-control application.
- Abadie, Diamond, and Hainmueller (2010), [Synthetic control methods for comparative case studies](https://doi.org/10.1198/jasa.2009.ap08746): core SCM method and California tobacco application.
- Abadie, Diamond, and Hainmueller (2011), [Synth: An R package for synthetic control methods](https://doi.org/10.18637/jss.v042.i13): `Synth` package paper.
- Abadie, Diamond, and Hainmueller (2015), [Comparative politics and the synthetic control method](https://doi.org/10.1111/ajps.12116): comparative case-study guidance.
- Abadie (2021), [Using synthetic controls: feasibility, data requirements, and methodological aspects](https://doi.org/10.1257/jel.20191450): practical review and failure modes.

### Extensions, Synthetic DiD, And Factor Models

- Xu (2017), [Generalized synthetic control method](https://doi.org/10.1017/pan.2016.2): interactive fixed-effect/generalized SCM.
- Ben-Michael, Feller, and Rothstein (2021), [The augmented synthetic control method](https://doi.org/10.3386/w28885): augmented SCM for imperfect pre-fit.
- Arkhangelsky et al. (2021), [Synthetic difference-in-differences](https://doi.org/10.1257/aer.20190159): synthetic DiD estimator.
- Athey et al. (2021), [Matrix completion methods for causal panel data models](https://doi.org/10.1080/01621459.2021.1891924): matrix completion for panel counterfactuals.
- Ben-Michael, Feller, and Rothstein (2022), [Synthetic controls with staggered adoption](https://doi.org/10.1111/rssb.12448): SCM ideas for staggered adoption settings.
- Chernozhukov, Wuthrich, and Zhu (2021), [An exact and robust conformal inference method for counterfactual and synthetic controls](https://doi.org/10.1080/01621459.2021.1920957): conformal inference for SCM-style settings.

### Interrupted Time Series And Bayesian Structural Time Series

- Bernal, Cummins, and Gasparrini (2017), [Interrupted time series regression for the evaluation of public health interventions](https://doi.org/10.1093/ije/dyw098): applied ITS guidance.
- Lopez Bernal, Soumerai, and Gasparrini (2018), [A methodological framework for model selection in interrupted time series studies](https://doi.org/10.1016/j.jclinepi.2018.05.026): ITS model-selection guidance.
- Brodersen et al. (2015), [Inferring causal impact using Bayesian structural time-series models](https://research.google/pubs/pub41854): BSTS/CausalImpact method and package.
- Hyndman and Athanasopoulos, [Forecasting: Principles and Practice](https://otexts.com/fpp3/): time-series diagnostics, seasonality, and forecasting background useful for ITS/BSTS.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`Synth`](https://search.r-project.org/CRAN/refmans/Synth/html/synth.html) | R | Classic synthetic control for one/few treated aggregate units | Canonical implementation, donor weights, placebo logic | Requires careful data prep and good pre-fit |
| [`tidysynth`](https://www.rdocumentation.org/packages/tidysynth/versions/0.2.1) | R | Tidyverse SCM workflow and plots | Easy diagnostics/plots/weights in tidy style | Wrapper ecosystem; validate details for publication |
| [`augsynth`](https://github.com/ebenmichael/augsynth) | R | Augmented SCM and staggered synthetic-control variants | Handles imperfect pre-fit via bias correction | More model-dependent; extrapolation risk |
| [`gsynth`](https://search.r-project.org/CRAN/refmans/gsynth/html/gsynth.html) | R | Generalized synthetic control / interactive fixed effects | Supports multiple treated units and treatment periods | Requires model assumptions and sufficient panel support |
| [`synthdid`](https://synth-inference.github.io/synthdid/) | R | Synthetic difference-in-differences | Strong option when SCM and DiD both plausible | Needs panel structure and clear treatment block |
| [`fect`](https://yiqingxu.org/packages/fect/) | R | Fixed effects counterfactuals, matrix completion, generalized SCM | Broad panel counterfactual toolkit | Model selection/diagnostics are central |
| [`CausalImpact`](https://google.github.io/CausalImpact/CausalImpact.html) | R | Bayesian structural time-series counterfactual with control series | Good for marketing/product/time-series interventions | Assumes controls unaffected by intervention |
| [`bsts`](https://cran.r-project.org/package=bsts) | R | Custom Bayesian structural time-series models | Flexible seasonality/regression/state-space modeling | Requires modeling expertise |
| [`CausalImpact`](https://search.r-project.org/CRAN/refmans/CausalImpact/html/CausalImpact.html) | R | Simple BSTS causal-impact workflow | Standard reporting and plots | Control series assumptions are often the weak point |
| [`pysyncon`](https://sdfordham.github.io/pysyncon/) | Python | Python SCM, augmented SCM, robust synthetic control | Useful when Python-only workflow is needed | Smaller ecosystem than R SCM packages |
| [`causal-impact`](https://github.com/tcassou/causal_impact) | Python | Python BSTS-style CausalImpact analog | Familiar API for CausalImpact-style use | Check maturity and model assumptions before production |
| [`statsmodels`](https://www.statsmodels.org/stable/index.html) | Python | Segmented regression, SARIMAX, autocorrelation checks | Mature time-series/regression baseline | ITS causal assumptions remain external |
| [`pycausalimpact`](https://github.com/dafiti/causalimpact) | Python | Another CausalImpact-style port | Practical for Python workflows | Package maturity varies; validate outputs |
| [`SDID`](https://github.com/Daniel-Pailanir/sdid) | Stata | Synthetic DiD in Stata | Implements Arkhangelsky et al.-style workflow | Stata-specific |
| [`synth_runner`](https://github.com/bquistorff/synth_runner) | Stata | Placebo/permutation wrappers around Synth | Helpful applied Stata workflow | Stata-specific and classic SCM-oriented |

## Practical Selection Rules

- Need one treated aggregate unit and excellent pre-fit: start with `Synth` or `tidysynth`.
- Need imperfect pre-fit but credible donor structure: use `augsynth`, with explicit extrapolation and model-dependence caveats.
- Need multiple treated units or treatment timing variation with latent factors: use `gsynth`, `fect`, or matrix-completion methods.
- Need DiD plus synthetic weighting: use `synthdid` and ask main to route `03-did-event-study`.
- Need a product/marketing time-series intervention with unaffected control series: use `CausalImpact`/BSTS after checking controls and seasonality.
- Need no donor pool: use interrupted time series with strong caveats, autocorrelation/seasonality handling, and alternative-date sensitivity.
- Need Python only: use `pysyncon`, `statsmodels`, or Python CausalImpact-style ports, but validate against R/reference examples when high stakes.
- Need report-ready evidence: include pre-fit, donor weights, treated-versus-synthetic plot, gap plot, placebo distribution, leave-one-out, alternative dates, and concurrent-shock review.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [Synth CRAN manual](https://cran.r-project.org/web/packages/Synth/Synth.pdf), [gsynth docs](https://yiqingxu.org/packages/gsynth/), [CausalImpact docs](https://google.github.io/CausalImpact/CausalImpact.html), [augsynth GitHub](https://github.com/ebenmichael/augsynth)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. Save estimate/table, diagnostic/plot, and source code paths for `artifact_index`.

```r
# Tiny sketch, not a complete script.
# Replace unit/time/outcome identifiers, treated unit, donors, and periods.
library(Synth)

prep <- dataprep(foo = panel_data, dependent = "Y",
                 unit.variable = "unit", time.variable = "time",
                 treatment.identifier = treated_unit,
                 controls.identifier = donor_units,
                 time.predictors.prior = pre_period,
                 time.optimize.ssr = pre_period,
                 time.plot = full_period)
sc_fit <- synth(prep)
```

Artifact outputs to preserve: donor-weight/gap table path, treated-versus-synthetic/placebo plot paths, source code path.
