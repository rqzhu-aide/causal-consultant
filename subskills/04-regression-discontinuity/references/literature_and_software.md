# Literature And Software Map

Use this file to choose credible regression-discontinuity, regression-kink, local-randomization, geographic RD, and diagnostic tools. Keep the main team focused on the cutoff rule, local estimand, manipulation risk, bandwidth support, and reportable diagnostics.

## Core Literature

### Foundations And Practice

- Thistlethwaite and Campbell (1960), [Regression-discontinuity analysis: an alternative to the ex post facto experiment](https://doi.org/10.1037/h0044319): original RD design paper.
- Hahn, Todd, and van der Klaauw (2001), [Identification and estimation of treatment effects with a regression-discontinuity design](https://doi.org/10.1111/1468-0262.00183): modern identification and estimation foundation.
- Imbens and Lemieux (2008), [Regression discontinuity designs: a guide to practice](https://doi.org/10.1016/j.jeconom.2007.05.001): practical guide to implementation.
- Lee and Lemieux (2010), [Regression discontinuity designs in economics](https://doi.org/10.1257/jel.48.2.281): broad applied user guide and validity discussion.
- Cattaneo, Idrobo, and Titiunik (2020), [A Practical Introduction to Regression Discontinuity Designs: Foundations](https://arxiv.org/abs/1911.09511): current practical monograph for continuity-based RD.
- Cattaneo, Idrobo, and Titiunik (2023/2024), [A Practical Introduction to Regression Discontinuity Designs: Extensions](https://arxiv.org/abs/2301.08958): local randomization, fuzzy, discrete-score, and multidimensional extensions.
- Cattaneo and Titiunik (2022), [Regression Discontinuity Designs](https://arxiv.org/abs/2108.09400): curated review of continuity and local-randomization frameworks.

### Estimation, Bandwidths, And Plots

- Calonico, Cattaneo, and Titiunik (2014), [Robust nonparametric confidence intervals for regression-discontinuity designs](https://doi.org/10.3982/ECTA11757): robust bias-corrected RD inference.
- Calonico, Cattaneo, and Titiunik (2015), [rdrobust: An R package for robust nonparametric inference in regression-discontinuity designs](https://journal.r-project.org/archive/2015/RJ-2015-004/): R implementation.
- Calonico, Cattaneo, Farrell, and Titiunik (2017), [rdrobust: Software for regression-discontinuity designs](https://doi.org/10.1177/1536867X1701700208): R/Stata software and upgraded procedures.
- Calonico, Cattaneo, and Farrell (2020), [Optimal bandwidth choice for robust bias-corrected inference in regression discontinuity designs](https://doi.org/10.3982/ECTA15869): coverage-error optimal bandwidth ideas.
- Calonico, Cattaneo, and Titiunik (2015), [Optimal data-driven regression discontinuity plots](https://doi.org/10.1080/01621459.2015.1017578): RD plotting and binning.
- Gelman and Imbens (2019), [Why high-order polynomials should not be used in regression discontinuity designs](https://doi.org/10.1080/07350015.2017.1366909): caution against global high-order polynomial specifications.

### Validity, Diagnostics, And Extensions

- McCrary (2008), [Manipulation of the running variable in the regression discontinuity design: a density test](https://doi.org/10.1016/j.jeconom.2007.05.005): classic density/manipulation test.
- Cattaneo, Jansson, and Ma (2020), [Simple local polynomial density estimators](https://doi.org/10.1080/01621459.2019.1635480): modern density estimation behind `rddensity`.
- Cattaneo, Frandsen, and Titiunik (2015), [Randomization inference in the regression discontinuity design](https://doi.org/10.1515/jci-2013-0010): local randomization framework.
- Cattaneo, Titiunik, and Vazquez-Bare (2016), [Inference in regression discontinuity designs under local randomization](https://doi.org/10.1177/1536867X1601600205): `rdlocrand` workflow.
- Keele and Titiunik (2015), [Geographic boundaries as regression discontinuities](https://doi.org/10.1093/pan/mpu014): geographic/border RD framework.
- Card, Lee, Pei, and Weber (2015), [Inference on causal effects in a generalized regression kink design](https://doi.org/10.3982/ECTA11224): regression kink designs.
- Barreca, Lindo, and Waddell (2016), [Heaping-induced bias in regression-discontinuity designs](https://doi.org/10.1111/ecin.12225): heaping/rounding and bias issues.
- Cattaneo, Keele, and Titiunik (2023), [Covariate adjustment in regression discontinuity designs](https://doi.org/10.1093/restud/rdad072): covariate adjustment guidance.
- Cattaneo et al. (2020), [Analysis of regression discontinuity designs with multiple cutoffs or multiple scores](https://arxiv.org/abs/1912.07346): multiple-cutoff/multiple-score RD and `rdmulti`.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`rdrobust`](https://rdpackages.github.io/rdrobust/) | R, Stata, Python | Sharp RD, fuzzy RD, kink RD, bandwidth selection, RD plots, robust bias-corrected inference | Canonical modern RD toolkit with active R/Stata/Python support | Still requires valid cutoff design; outputs are local to cutoff |
| [`rddensity`](https://rdpackages.github.io/rddensity/) | R, Stata | Density/manipulation testing around cutoff | Modern successor to simple McCrary-style checks; good companion to RD reports | Passing density tests is not proof of no manipulation |
| [`rdlocrand`](https://rdpackages.github.io/rdlocrand/) | R, Stata | Local randomization RD, window selection, randomization inference | Useful for discrete scores or very local windows | Requires defensible as-if random window |
| [`rdmulti`](https://rdpackages.github.io/rdmulti/) | R, Stata | Multiple cutoffs or multiple scores | Coordinates RD evidence across cutoffs/scores | Interpretation may be cutoff-specific; pooling needs justification |
| [`rdpower`](https://rdpackages.github.io/rdpower/) | R, Stata | Power and sample-size planning for RD | Useful before data collection or when feasibility is uncertain | Depends on design assumptions and variance inputs |
| [`rdhte`](https://arxiv.org/abs/2507.01128) | R, Stata | Heterogeneous treatment effects in sharp RD | Emerging support for RD heterogeneity | Newer ecosystem; ask main to route `10-heterogeneous-effects` |
| [`CausalPy`](https://causalpy.readthedocs.io/en/latest/api/generated/causalpy.experiments.regression_discontinuity.RegressionDiscontinuity.html) | Python | Sharp RD with OLS, sklearn, or Bayesian/PyMC models | Convenient Python workflow and plots | Not a replacement for rdrobust-style RD inference in high-stakes reports |
| [`statsmodels`](https://www.statsmodels.org/stable/index.html) | Python | Custom local-linear benchmarks, clustered/robust regressions, segmented checks | Flexible and mature for transparent regression analogs | Analyst must implement bandwidths, kernels, and RD diagnostics carefully |
| [`fixest`](https://lrberge.github.io/fixest/) | R | Local linear/fuzzy RD regression analogs with fixed effects/clustering | Useful for custom sensitivity and transparent local regressions | Does not replace rdrobust bandwidth/RBC workflow |
| [`ivreg`](https://zeileis.github.io/ivreg/) | R | Fuzzy RD as local IV/2SLS sensitivity | Good diagnostics and IV reporting | Must restrict to local window and keep RD diagnostics explicit |
| [`sf`](https://r-spatial.github.io/sf/) / [`geopandas`](https://geopandas.org/) | R/Python | Geographic RD data construction and boundary distances | Essential for geospatial preprocessing | Identification still depends on boundary comparability and spillovers |

## Practical Selection Rules

- Need a standard continuous-score sharp RD: start with `rdrobust`, `rdbwselect`, `rdplot`, and `rddensity`.
- Need fuzzy compliance or encouragement at a cutoff: use `rdrobust` fuzzy support and ask main to route `05-instrumental-variables`.
- Need a discrete running variable or a very narrow window: consider `rdlocrand` and report local-randomization assumptions.
- Need multiple cutoffs or scores: use `rdmulti` and report cutoff-specific versus pooled interpretations.
- Need an intensity slope change rather than a level jump: consider regression kink design, with stronger slope-change and smoothness checks.
- Need geographic boundary RD: use geospatial preprocessing, boundary balance checks, and interference/spillover review.
- Need a date cutoff: treat it cautiously; ask main to consider time-series, DiD, or synthetic-control modules if trends/shocks could drive the discontinuity.
- Need broad generalization: ask main to route `14-transportability-generalizability`; RD alone is local.
- Need Python-only work: use Python `rdrobust` where available; otherwise use CausalPy or `statsmodels` as exploratory/benchmark tools and validate production inference carefully.
- Need report-ready evidence: include the cutoff rule, local estimand, RD plot, treatment jump, density/manipulation test, covariate continuity, bandwidth sensitivity, local sample counts, and limitations.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [rdrobust GitHub/docs](https://github.com/rdpackages/rdrobust), [rdrobust package reference](https://www.rdocumentation.org/packages/rdrobust/versions/3.0.0), [rddensity reference](https://www.rdocumentation.org/packages/rddensity/versions/2.6/topics/rddensity)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. Save outputs inside the active `analysis_dir`, update the unit `manifest.json`, and mirror report-relevant source, table, figure, diagnostic, and large-artifact paths into `artifact_index`.

```r
# Tiny sketch, not a complete script.
# Replace Y, running, cutoff, and covariates.
library(rdrobust)
library(rddensity)

fit <- rdrobust(y = rd_data$Y, x = rd_data$running, c = cutoff)
density <- rddensity(X = rd_data$running, c = cutoff)
rdplot(y = rd_data$Y, x = rd_data$running, c = cutoff)
```

Artifact outputs to preserve: RD estimate/bandwidth table path, RD and density plot paths, source code path.
