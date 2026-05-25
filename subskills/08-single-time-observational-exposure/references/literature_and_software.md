# Literature And Software Map

Use this file to choose credible observational point-exposure method families and packages. Keep the main team focused on target trial, timing, confounding, support, and sensitivity before software.

## Core Literature

### Foundations, Target Trials, And Identification

- Rubin (1974), [Estimating Causal Effects of Treatments in Randomized and Nonrandomized Studies](https://doi.org/10.1037/h0037350): potential-outcomes framing for treatment comparisons.
- Rosenbaum and Rubin (1983), [The central role of the propensity score in observational studies for causal effects](https://doi.org/10.1093/biomet/70.1.41): balancing score logic for observed confounding.
- Robins (1986), [A new approach to causal inference in mortality studies with sustained exposure periods](https://doi.org/10.1016/0270-0255(86)90088-6): g-methods and time-varying exposure foundations; useful background even for point treatment.
- Hernan and Robins (2020), [Causal Inference: What If](https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/): target trials, exchangeability, positivity, consistency, IP weighting, standardization, and sensitivity.
- Hernan and Robins (2016), [Using Big Data to Emulate a Target Trial When a Randomized Trial Is Not Available](https://doi.org/10.1093/aje/kwv254): practical target-trial emulation.
- Hernan, Wang, and Leaf (2022), [Target trial emulation: applying principles of randomised trials to observational studies](https://www.bmj.com/content/378/bmj-2022-071108): practical BMJ overview of target-trial components and common emulation failures.

### Matching, Weighting, And Balance

- Rubin (2001), [Using propensity scores to help design observational studies](https://doi.org/10.1198/016214501753208573): separate design from outcome analysis.
- Rosenbaum and Rubin (2023), [Propensity scores in the design of observational studies for causal effects](https://doi.org/10.1093/biomet/asac054): revisits propensity scores as outcome-blind design tools, not outcome-chasing models.
- Stuart (2010), [Matching Methods for Causal Inference: A Review and a Look Forward](https://doi.org/10.1214/09-STS313): matching approaches, diagnostics, and estimand changes.
- Austin (2011), [An Introduction to Propensity Score Methods for Reducing the Effects of Confounding in Observational Studies](https://doi.org/10.1080/00273171.2011.568786): accessible propensity-score review.
- Imai and Ratkovic (2014), [Covariate balancing propensity score](https://doi.org/10.1111/rssb.12027): direct balance-oriented propensity estimation.
- Li, Morgan, and Zaslavsky (2018), [Balancing Covariates via Propensity Score Weighting](https://doi.org/10.1080/01621459.2016.1260466): overlap weights and weighting choices.

### Doubly Robust, ML, And Sensitivity Support

- Bang and Robins (2005), [Doubly robust estimation in missing data and causal inference models](https://doi.org/10.1111/j.1541-0420.2005.00377.x): AIPW/doubly robust foundations.
- van der Laan and Rose (2011), *Targeted Learning*: TMLE and Super Learner logic for causal parameters.
- Chernozhukov et al. (2018), [Double/debiased machine learning for treatment and structural parameters](https://doi.org/10.1111/ectj.12097): orthogonal ML and cross-fitting for nuisance models.
- Imbens and Wooldridge (2009), [Recent Developments in the Econometrics of Program Evaluation](https://doi.org/10.1257/jel.47.1.5): broad review of matching, weighting, regression, IV, DiD, and RD.
- VanderWeele and Ding (2017), [Sensitivity Analysis in Observational Research: Introducing the E-Value](https://doi.org/10.7326/M16-2607): interpretable unmeasured-confounding sensitivity for ratio-scale effects.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`MatchIt`](https://kosukeimai.github.io/MatchIt/) | R | Matching design, subclassification, matched samples | Strong design-stage workflow and diagnostics integration | Matching changes estimand and may discard support |
| [`WeightIt`](https://ngreifer.github.io/WeightIt/) | R | Propensity, balancing, overlap, entropy, CBPS-style weights | Flexible estimands and many weighting methods | Extreme weights need diagnostics and possible restriction |
| [`cobalt`](https://ngreifer.github.io/cobalt/) | R | Balance tables, love plots, weighting/matching diagnostics | Excellent reporting diagnostics | Diagnostic only; not an estimator |
| [`CBPS`](https://cran.r-project.org/package=CBPS) | R | Covariate balancing propensity scores | Targets balance directly | Can be unstable with sparse/high-dimensional data |
| [`optmatch`](https://cran.r-project.org/package=optmatch) / [`MatchThem`](https://cran.r-project.org/package=MatchThem) | R | Optimal matching and matching after multiple imputation | Useful for specific design constraints | More setup; estimand and discarded units need tracking |
| [`survey`](https://cran.r-project.org/package=survey) | R | Weighted outcome models and robust SE | Mature design-weight support | Weight source and target estimand must be clear |
| [`fixest`](https://lrberge.github.io/fixest/) / [`sandwich`](https://sandwich.r-forge.r-project.org/) | R | Fast adjusted regressions, robust/clustered inference | Practical first-pass and report tables | Regression alone is sensitive to extrapolation |
| [`tmle`](https://cran.r-project.org/package=tmle), [`drtmle`](https://cran.r-project.org/package=drtmle), [`tmle3`](https://tlverse.org/tmle3/) | R | TMLE and doubly robust estimates | Strong targeted-learning ecosystem | Steeper workflow and nuisance-model choices matter |
| [`DoubleML`](https://docs.doubleml.org/) | R/Python | Orthogonal DML for partially linear/interactive models | Cross-fitting and ML nuisance plugins | Target and identification still need design review |
| [`grf`](https://grf-labs.github.io/grf/) | R | Causal forests, ATE/ATT/CATE, overlap diagnostics | Strong flexible CATE and average-effect tools | Needs support checks; CATE is target support, not design proof |
| [`DoWhy`](https://www.pywhy.org/dowhy/) | Python | DAG-based identification, backdoor adjustment, refutation tests | Good workflow for explicit estimand/refuter discipline | Estimator defaults need statistical review; DAG assumptions are user/team supplied |
| [`EconML`](https://www.pywhy.org/EconML/) | Python | DR/DML, causal forests, metalearners, heterogeneity | Flexible sklearn-compatible nuisance models | Requires cross-fitting/evaluation and claim discipline |
| [`causalml`](https://github.com/uber/causalml) | Python | Meta-learners, uplift, practical CATE workflows | Product and marketing friendly | Formal inference and design checks are limited |
| [`zepid`](https://zepid.readthedocs.io/) | Python | Epidemiologic IPW, g-formula, TMLE-style workflows | Causal epi workflow in Python | Smaller ecosystem than R causal packages |
| [`statsmodels`](https://www.statsmodels.org/stable/index.html) / [`scikit-learn`](https://scikit-learn.org/) | Python | Regression, propensity models, nuisance prediction | Familiar and flexible | General tools, not causal design safeguards |

## Practical Selection Rules

- Need design-stage matching: use `MatchIt` plus `cobalt`, then report discarded units and estimand.
- Need weighting/balance: use `WeightIt` plus `cobalt`; consider overlap weights when ATE positivity is weak.
- Need transparent first pass: use regression/g-computation with explicit confounder timing and support caveats.
- Need robust flexible estimation: activate `31-doubly-robust-estimation` or `32-double-machine-learning`; use TMLE, AIPW, DoubleML, EconML, or GRF as implementation support.
- Need DAG/refuter discipline in Python: use `DoWhy` for identification/refutation structure, with statistical estimation checked separately.
- Need unmeasured-confounding protection: activate `15-negative-controls-proximal` or add sensitivity analysis; do not claim full control from observed covariates.
- Need survival outcome: route outcome handling to `33-survival-competing-risks`.
- Need continuous or multi-level exposure: route target handling to `23-dose-response-effects`.
