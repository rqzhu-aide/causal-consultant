# Software Index

This index lists commonly useful packages. Always verify the user's installed package versions and adapt code to the dataset.

## R

### General causal workflows and DAGs

- `dagitty`: DAGs, adjustment sets, testable implications.
- `DoWhy` is primarily Python, but can inform conceptual workflow.

### Matching, weighting, and balance

- `MatchIt`: matching and subclassification.
- `WeightIt`: propensity score and balancing weights.
- `cobalt`: balance tables, standardized mean differences, Love plots, overlap and distribution diagnostics.
- `CBPS`: covariate balancing propensity scores.
- `optweight`: optimization-based weighting.

### Doubly robust, TMLE, DML

- `tmle`, `tmle3`, `sl3`, `SuperLearner`: targeted learning.
- `DoubleML`: double/debiased ML.
- `AIPW`: AIPW estimators for common settings.

### Heterogeneous treatment effects and policy learning

- `grf`: causal forests, instrumental forests, survival forests, policy learning support.
- `policytree`: interpretable treatment rules.

### Longitudinal causal inference

- `ipw`: inverse probability weights for treatment and censoring.
- `gfoRmula`: parametric g-formula.
- `ltmle`: longitudinal TMLE.
- `lmtp`: longitudinal modified treatment policies.

### Difference-in-differences and panels

- `did`: group-time ATT and event-study aggregation.
- `fixest`: high-dimensional fixed effects, event-study formulas, IV.
- `DRDID`: doubly robust DiD.
- `did2s`: two-stage DiD.
- `bacondecomp`: decomposition diagnostics for TWFE.

### Regression discontinuity

- `rdrobust`: RD estimation, inference, bandwidth selection, plots.
- `rddensity`: manipulation/density tests.

### Instrumental variables

- `ivreg`: instrumental-variable regression and diagnostics.
- `AER`: econometric IV utilities.
- `fixest`: IV with fixed effects.
- `ivmodel`: IV diagnostics and robust inference.

### Synthetic control and time-series intervention

- `Synth`: synthetic control.
- `tidysynth`: tidy synthetic control workflow.
- `gsynth`: generalized synthetic control.
- `CausalImpact`: Bayesian structural time-series intervention analysis.
- `bsts`: Bayesian structural time series.

### Survival and competing risks

- `survival`: Cox, Kaplan-Meier, survival infrastructure.
- `adjustedCurves`: adjusted survival and cumulative incidence curves.
- `riskRegression`: risk modeling and prediction for survival/competing risks.
- `prodlim`: survival and competing risk estimation.
- `survtmle`: TMLE for survival curves.

### Mediation

- `mediation`: causal mediation analysis.
- `medflex`: natural effect models.
- `CMAverse`: broad mediation workflows.
- `regmedint`: regression-based mediation with interaction.

### Interference

- `inferference`: causal inference with interference.
- `tmlenet`: TMLE for network-dependent data.

### Causal discovery

- `pcalg`: PC, FCI, RFCI, GES/GIES, IDA.
- `bnlearn`: Bayesian networks; use carefully for causal interpretation.

### Causal genomics

- `TwoSampleMR`: two-sample Mendelian randomization.
- `MendelianRandomization`: MR methods.
- `coloc`: colocalization.
- `ieugwasr`: IEU GWAS resources.
- `MR-PRESSO`: pleiotropy testing.
- `CAUSE`: correlated/uncorrelated horizontal pleiotropy models.

## Python

### General workflows

- `dowhy`: model, identify, estimate, refute workflow.
- `statsmodels`: treatment effect estimators, regression, robust inference.

### Double ML and causal ML

- `DoubleML`: PLR, IRM, IV, DiD, RDD, HTE modules.
- `econml`: CATE, DML, orthogonal forests, DR learners, IV learners.
- `causalml`: uplift modeling, meta-learners, tree/forest methods, validation.

### Econometrics and panel/IV

- `linearmodels`: IV, panel, GMM, fixed effects.

### Regression discontinuity

- `rdrobust`: Python implementation of RD tools.

### Causal discovery

- `causal-learn`: PC, FCI, GES, LiNGAM, ANM and related algorithms.
- `lingam`: LiNGAM algorithms.
- `tigramite`: time-series causal discovery.
- Tetrad/Py-Tetrad: graphical causal discovery ecosystem.

## Package Selection Advice

- Prefer R for matching/weighting diagnostics, modern DiD, longitudinal g-methods, mediation, and many survival causal workflows.
- Prefer Python for DoWhy-style workflows, EconML/CausalML HTE, and Python-native pipelines.
- Use package documentation and version checks before final code.
- Never assume installed package behavior without verifying version-specific arguments.
