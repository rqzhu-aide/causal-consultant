# Literature And Software Map

Use this file to choose credible experiment method families and packages. Keep the main team focused on assignment, estimand, analysis set, diagnostics, and claim boundary before software.

## Core Literature

### Foundations And Randomization-Based Inference

- Neyman (1923/1990), [On the Application of Probability Theory to Agricultural Experiments](https://doi.org/10.1214/ss/1177012031): finite-population potential-outcomes foundation for randomized experiments.
- Fisher (1935), *The Design of Experiments*: classic randomization and permutation-test framing.
- Rubin (1974), [Estimating Causal Effects of Treatments in Randomized and Nonrandomized Studies](https://doi.org/10.1037/h0037350): potential-outcomes language connecting randomized and observational designs.
- Holland (1986), [Statistics and Causal Inference](https://doi.org/10.1080/01621459.1986.10478354): estimand clarity and the "no causation without manipulation" framing.
- Rosenbaum (2002), *Observational Studies*: useful for randomization inference logic and sensitivity ideas even when the design is randomized.

### Regression Adjustment And Precision

- Freedman (2008), [On regression adjustments in experiments with several treatments](https://projecteuclid.org/journals/annals-of-applied-statistics/volume-2/issue-1/On-regression-adjustments-in-experiments-with-several-treatments/10.1214/07-AOAS143.full): warnings about model-based regression adjustment in randomized experiments.
- Lin (2013), [Agnostic notes on regression adjustments to experimental data](https://projecteuclid.org/journals/annals-of-applied-statistics/volume-7/issue-1/Agnostic-notes-on-regression-adjustments-to-experimental-data--Reexamining-Freedmans/10.1214/12-AOAS583.full): recommends robust, interacted covariate adjustment for precision under randomization.
- Tsiatis et al. (2008), [Covariate adjustment for two-sample treatment comparisons in randomized clinical trials](https://doi.org/10.1111/j.1541-0420.2007.00894.x): semiparametric view of efficient covariate adjustment.
- Deng et al. (2013), [Improving the sensitivity of online controlled experiments by utilizing pre-experiment data](https://dl.acm.org/doi/10.1145/2433396.2433413): CUPED variance reduction for online experiments.

### Field, Clinical, And Online Experiments

- Gerber and Green (2012), *Field Experiments: Design, Analysis, and Interpretation*: field-experiment design, compliance, spillovers, and interpretation.
- Imbens and Rubin (2015), *Causal Inference for Statistics, Social, and Biomedical Sciences*: experiment estimands, noncompliance, Bayesian/frequentist analysis, and design principles.
- Kohavi, Tang, and Xu (2020), [Trustworthy Online Controlled Experiments](https://www.cambridge.org/core/books/trustworthy-online-controlled-experiments/9781108724265): A/B testing, SRM, triggering, novelty, guardrails, and scalable experimentation practice.
- Imai, King, and Nall (2009), [The Essential Role of Pair Matching in Cluster-Randomized Experiments](https://doi.org/10.2202/1557-4679.1129): paired/clustered design and analysis issues.
- Hayes and Moulton (2017), *Cluster Randomised Trials*: cluster design, ICC, analysis, and reporting.

### Noncompliance, Encouragement, And IV-Linked Designs

- Angrist, Imbens, and Rubin (1996), [Identification of causal effects using instrumental variables](https://doi.org/10.1080/01621459.1996.10476902): LATE/CACE assumptions for encouragement and noncompliance.
- Bloom (1984), [Accounting for no-shows in experimental evaluation designs](https://doi.org/10.1016/0191-8869(84)90071-0): early practical CACE/no-show framing.
- Jo (2002), [Estimation of intervention effects with noncompliance](https://doi.org/10.1111/1467-9868.00349): compliance classes and sensitivity in trials.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`randomizr`](https://declaredesign.org/r/randomizr/) | R | Generate, audit, or reconstruct complete, blocked, clustered, or factorial assignment | Transparent assignment probabilities and design declarations | Does not analyze outcomes by itself |
| [`DeclareDesign`](https://declaredesign.org/) | R | Simulate designs, diagnose power, bias, coverage, and estimators before/after experiments | Strong design-to-diagnosis workflow | More useful for planning/simulation than quick one-off analysis |
| [`estimatr`](https://declaredesign.org/r/estimatr/) | R | `difference_in_means`, `lm_robust`, `iv_robust`, clustered/blocked robust inference | Good defaults for design-based experiment analysis | User still must match estimator to design |
| [`ri2`](https://alexandercoppock.com/ri2/) | R | Randomization inference with declared assignment/design | Design-based p-values and test statistics | Requires known or reconstructable randomization procedure |
| [`randomizationInference`](https://cran.r-project.org/package=randomizationInference) | R | Fisherian randomization inference for experiments | Useful for small or constrained experiments | Less general than writing custom tests for complex designs |
| [`clubSandwich`](https://jepusto.github.io/clubSandwich/) | R | Cluster-robust variance with few clusters or complex models | Small-sample corrections | Does not fix design or attrition issues |
| [`sandwich`](https://sandwich.r-forge.r-project.org/) / [`lmtest`](https://cran.r-project.org/package=lmtest) | R | Robust covariance for linear/generalized models | Broad, familiar, lightweight | Needs careful cluster and finite-sample choices |
| [`fixest`](https://lrberge.github.io/fixest/) | R | Fast fixed effects, clustered SE, multi-arm regressions | Efficient for large experiments with strata or panels | Defaults should be checked against design |
| [`broom`](https://broom.tidymodels.org/) / [`modelsummary`](https://modelsummary.com/) | R | Report-ready tidy tables | Helps report writer integrate results | Formatting only; not a design check |
| [`statsmodels`](https://www.statsmodels.org/stable/index.html) | Python | OLS/WLS/GLM with robust or cluster covariance | Flexible Python baseline for ITT and adjusted models | Experiment-specific diagnostics must be coded |
| [`scipy.stats.permutation_test`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.permutation_test.html) | Python | Permutation/randomization-style tests for simple designs | Lightweight and reproducible | Complex assignment mechanisms need custom resampling |
| [`EconML`](https://www.pywhy.org/EconML/) | Python | Heterogeneity, DR learners, policy trees from randomized or logged data | Strong ML plugin ecosystem | Not a substitute for experiment diagnostics |
| [`causalml`](https://github.com/uber/causalml) / [`scikit-uplift`](https://www.uplift-modeling.com/en/latest/) | Python | Uplift and targeting diagnostics in randomized marketing/product data | Practical targeting metrics | Usually target-goal support, not primary experiment design |

## Practical Selection Rules

- Need simple ITT: start with `estimatr::difference_in_means`, `estimatr::lm_robust`, or `statsmodels` OLS with robust/cluster covariance.
- Need blocked/clustered design: use `randomizr` to represent assignment and `estimatr` or cluster-level analysis to estimate.
- Need small-sample design-based inference: use `ri2` or a custom randomization-inference script.
- Need noncompliance/CACE: report ITT first, then activate `12-instrumental-variables` and consider `estimatr::iv_robust`.
- Need online A/B robustness: run SRM, triggering/exposure checks, guardrails, CUPED/ANCOVA, and multiplicity review.
- Need heterogeneity or policy learning: keep this experiment module as design route and activate the target module; use ML only after held-out/cross-fitted evaluation is planned.
- Need report polish: provide assignment diagram, flow counts, primary estimand, diagnostics, tables, and code appendix paths.
