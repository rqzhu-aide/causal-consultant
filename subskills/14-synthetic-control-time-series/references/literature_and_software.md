# Literature and Software: Synthetic Control and Time Series

## Purpose

This map supports subskill 10. Use it when selecting among synthetic control, augmented or generalized synthetic control, synthetic DiD, matrix-completion counterfactuals, interrupted time series, Bayesian structural time-series, and CausalImpact-style analyses.

The goal is not to exhaust the field. The goal is to keep method recommendations grounded, cautious, and useful for users who may not know the technical literature.

## Anchor Literature

### Classic synthetic control

- Abadie and Gardeazabal (2003), "The Economic Costs of Conflict: A Case Study of the Basque Country," introduced the synthetic-control case-study logic for an aggregate treated unit. Source: https://www.aeaweb.org/articles?id=10.1257/000282803321455188
- Abadie, Diamond, and Hainmueller (2010), "Synthetic Control Methods for Comparative Case Studies," is the core policy-evaluation SCM paper. Source: https://www.nber.org/papers/w12831
- Abadie, Diamond, and Hainmueller (2011), "Synth: An R Package for Synthetic Control Methods in Comparative Case Studies," documents the canonical R implementation. Source: https://www.jstatsoft.org/article/view/v042i13
- Abadie (2021), "Using Synthetic Controls: Feasibility, Data Requirements, and Methodological Aspects," is the practical review to use for feasibility, data requirements, and failure modes. Source: https://www.aeaweb.org/articles?id=10.1257/jel.20191450

### Extensions for panel counterfactuals

- Xu (2017), "Generalized Synthetic Control Method: Causal Inference with Interactive Fixed Effects Models," connects SCM and DiD-like panel settings through interactive fixed effects. Source: https://www.cambridge.org/core/journals/political-analysis/article/generalized-synthetic-control-method-causal-inference-with-interactive-fixed-effects-models/B63A8BD7C239DD4141C67DA10CD0E4F3
- Ben-Michael, Feller, and Rothstein (2021), "The Augmented Synthetic Control Method," adds bias correction for imperfect pre-treatment fit. Source: https://www.nber.org/papers/w28885
- Arkhangelsky, Athey, Hirshberg, Imbens, and Wager (2021), "Synthetic Difference-in-Differences," combines SCM and DiD weighting ideas. Source: https://www.nber.org/papers/w25532
- Athey, Bayati, Doudchenko, Imbens, and Khosravi (2021), "Matrix Completion Methods for Causal Panel Data Models," frames treated post-period counterfactuals as missing entries in a panel. Source: https://www.nber.org/papers/w25132

### Time-series intervention analysis

- Brodersen, Gallusser, Koehler, Remy, and Scott (2015), "Inferring causal impact using Bayesian structural time-series models," is the paper behind CausalImpact-style workflows. Source: https://research.google/pubs/inferring-causal-impact-using-bayesian-structural-time-series-models/
- Bernal, Cummins, and Gasparrini (2017), "Interrupted time series regression for the evaluation of public health interventions: a tutorial," is a useful applied ITS guide. Source: https://academic.oup.com/ije/article/46/1/348/2622842
- Linden (2015), "Conducting Interrupted Time-series Analysis for Single- and Multiple-group Comparisons," is useful for single- and multiple-group ITS implementation and interpretation. Source: https://journals.sagepub.com/doi/10.1177/1536867X1501500208

### Teaching and textbook-style references

- Cunningham, "Causal Inference: The Mixtape," includes synthetic control as a standard applied causal-inference design with software orientation. Source: https://www.stata.com/bookstore/causal-inference-mixtape/
- Abadie (2021) should be treated as the main compact review for SCM feasibility and applied judgment.

## Method Selection Notes

### Classic SCM

Use when:

- one or a few aggregate units are treated;
- treatment starts at a known time;
- there is a credible untreated donor pool;
- the treated unit can be approximated well in the pre-period;
- transparency of donor weights is valuable.

Be cautious when:

- pre-fit is poor;
- the treated unit is outside donor support;
- donors are contaminated or spillover-exposed;
- one donor dominates;
- there are too few pre-period observations;
- outcome measurement changes at the intervention time.

### Augmented SCM

Use when classic SCM is attractive but exact pre-treatment fit is not feasible. It can reduce bias from imperfect pre-fit, but the result leans more on outcome-model assumptions and extrapolation diagnostics.

### Generalized SCM and matrix completion

Use when the panel has multiple units and time periods, especially with multiple treated units or variable treatment timing. These approaches are useful when latent factors plausibly explain untreated outcome evolution, but diagnostics and cross-validation matter.

### Synthetic DiD

Use when both DiD and SCM are plausible and the user wants a panel estimator that uses unit and time weights. Compare with modern DiD when treatment timing is staggered and cohort/event-study interpretation is central.

### BSTS/CausalImpact

Use when there is one treated time series and one or more control series that should be unaffected by the intervention. The key design issue is whether controls remain stably related to the treated outcome after the intervention.

### Interrupted time series

Use when there is no donor pool but there are enough observations before and after a known intervention. Treat it as weaker when secular changes, seasonality, autocorrelation, and concurrent shocks are hard to rule out.

## Software Map

### R

- `Synth`: canonical classic SCM implementation. Good for donor weights, pre-fit plots, and placebo-style workflows. Documentation: https://www.rdocumentation.org/packages/Synth
- `tidysynth`: tidy SCM workflow with accessible plotting and placebo utilities. Documentation: https://search.r-project.org/CRAN/refmans/tidysynth/html/synthetic_control.html
- `augsynth`: augmented SCM and related panel estimators. Best when imperfect pre-fit and bias correction are central. Documentation/source: https://github.com/ebenmichael/augsynth
- `gsynth`: generalized synthetic control with interactive fixed effects, multiple treated units, and variable timing. Documentation: https://www.rdocumentation.org/packages/gsynth
- `synthdid`: synthetic difference-in-differences. Documentation/source: https://github.com/synth-inference/synthdid
- `CausalImpact`: Bayesian structural time-series intervention analysis. Documentation: https://google.github.io/CausalImpact/
- `bsts`: lower-level Bayesian structural time-series modeling often used under CausalImpact.
- `fixest`, `nlme`, `forecast`, `fable`, and base `stats`: useful for transparent ITS, autocorrelation, seasonality, and sensitivity analyses.

### Python

- `pandas`, `numpy`, `statsmodels`, and plotting libraries are reliable for data audit, ITS, segmented regression, and custom diagnostics.
- `SyntheticControlMethods` implements several SCM variants for Python, mainly for single-treated-unit settings. Documentation: https://pypi.org/project/SyntheticControlMethods/
- For generalized SCM, augmented SCM, and synthetic DiD, R packages are usually more mature. Recommend Python only when the design is simple enough or the user has a maintained package they trust.

### Stata

- `synth` and `allsynth` are common SCM tools.
- `itsa` is a common interrupted time-series command for single- and multiple-group comparisons.

## Diagnostics by Method

### Synthetic control diagnostics

- treated versus synthetic outcome plot;
- pre-treatment RMSPE;
- donor weights and donor leverage;
- predictor balance;
- placebo-in-space gaps;
- RMSPE ratio or rank among placebos;
- leave-one-out donor sensitivity;
- alternative donor pool and predictor-set sensitivity;
- anticipation-window and intervention-date sensitivity.

### Panel extension diagnostics

- held-out pre-period prediction;
- cross-validation for factor dimension or regularization;
- comparison to simple DiD and classic SCM where possible;
- sensitivity to adoption timing and donor pool;
- untreated support for every treated unit-period counterfactual.

### CausalImpact/BSTS diagnostics

- pre-period posterior predictive fit;
- residual autocorrelation and seasonality;
- stability and lack of contamination in control series;
- prior/model sensitivity;
- placebo intervention dates or pre-period holdout;
- comparison with a simple segmented regression or forecast benchmark.

### ITS diagnostics

- pre-intervention trend and seasonality;
- post-intervention level and slope changes;
- autocorrelation-adjusted standard errors or time-series model;
- comparison-group ITS when available;
- sensitivity to transition windows and functional form;
- audit of concurrent shocks and measurement changes.

## Red Flags

Do not let the analysis silently become a causal claim when:

- the intervention date is chosen after inspecting outcomes;
- donors are affected by treatment, anticipation, or spillovers;
- pre-treatment fit is poor and no extension or caveat is used;
- the treated unit is unique in a way donors cannot approximate;
- placebo units show equally large effects;
- a single control series drives the result without a substantive reason;
- a reporting or denominator change occurs at the policy date;
- a single-series ITS is interpreted strongly despite likely concurrent shocks;
- many outcomes, windows, donor pools, or dates were searched without disclosure.
