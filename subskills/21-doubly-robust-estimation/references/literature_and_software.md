# Literature And Software Map

Use this file to choose credible doubly robust, one-step, and targeted-learning tools. Keep the main team focused on design validity, nuisance functions, positivity, and influence-function diagnostics before software.

## Core Literature

### Doubly Robust And Influence-Function Foundations

- Robins, Rotnitzky, and Zhao (1994), [Estimation of regression coefficients when some regressors are not always observed](https://doi.org/10.1080/01621459.1994.10476818): foundational augmented IPW and semiparametric ideas.
- Scharfstein, Rotnitzky, and Robins (1999), [Adjusting for nonignorable drop-out using semiparametric nonresponse models](https://doi.org/10.1080/01621459.1999.10474168): double robustness in missing data and sensitivity context.
- Bang and Robins (2005), [Doubly robust estimation in missing data and causal inference models](https://doi.org/10.1111/j.1541-0420.2005.00377.x): accessible DR framing.
- Tsiatis (2006), *Semiparametric Theory and Missing Data*: influence functions and semiparametric efficiency background.
- Kang and Schafer (2007), [Demystifying double robustness](https://doi.org/10.1214/07-STS227): cautionary examples showing DR estimators can still be unstable.

### Targeted Learning And Modern Practice

- van der Laan and Rubin (2006), [Targeted maximum likelihood learning](https://doi.org/10.2202/1557-4679.1043): TMLE foundation.
- van der Laan and Rose (2011), *Targeted Learning*: book-length treatment of TMLE and Super Learner.
- Gruber and van der Laan (2012), [tmle: An R Package for Targeted Maximum Likelihood Estimation](https://doi.org/10.18637/jss.v051.i13): practical TMLE package paper.
- Lendle, Schwab, Petersen, and van der Laan (2017), [ltmle](https://doi.org/10.18637/jss.v081.i01): longitudinal TMLE implementation.
- Kennedy (2016), [Semiparametric theory and empirical processes in causal inference](https://doi.org/10.1007/s40471-016-0089-4): modern review of semiparametric causal estimators.
- Benkeser et al. (2017), [Doubly robust nonparametric inference on the average treatment effect](https://doi.org/10.1093/biomet/asx053): robust nonparametric inference and nuisance considerations.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`AIPW`](https://cran.r-project.org/package=AIPW) | R | AIPW for ATE/ATT-style treatment effects with Super Learner options | Direct AIPW workflow | Check package target and variance details for the project |
| [`tmle`](https://cran.r-project.org/package=tmle) | R | Classic point-treatment TMLE | Mature, well documented, simple targets | Older interface; less modular than tlverse |
| [`drtmle`](https://cran.r-project.org/package=drtmle) | R | Doubly robust TMLE-style estimation with flexible nuisance support | Strong DR/TMLE focus | Requires careful nuisance libraries and diagnostics |
| [`tmle3`](https://tlverse.org/tmle3/) + [`sl3`](https://tlverse.org/sl3/) | R | Modular targeted-learning workflows | Modern tlverse architecture and learner pipelines | Steeper learning curve |
| [`SuperLearner`](https://cran.r-project.org/package=SuperLearner) | R | Ensemble nuisance estimation | Strong R ecosystem and cross-validation | Nuisance plugin, not an estimator by itself |
| [`ltmle`](https://cran.r-project.org/package=ltmle) | R | Longitudinal TMLE with time-varying treatment/censoring | Purpose-built longitudinal support | Requires careful node ordering |
| [`lmtp`](https://github.com/nt-williams/lmtp) | R | Longitudinal modified treatment policies | Realistic interventions and Super Learner support | Target must be a clear modified policy |
| [`grf`](https://grf-labs.github.io/grf/) | R | DR scores, ATE/CATE, causal forests | Strong heterogeneity and average-effect tools | Causal forest target/reporting differs from classic TMLE |
| [`EconML`](https://www.pywhy.org/EconML/) | Python | DRLearner, LinearDRLearner, causal forests, orthogonal learners | Flexible sklearn-compatible nuisance models | Often overlaps with DML; validate target and inference |
| [`DoubleML`](https://docs.doubleml.org/) | R/Python | IRM/PLR and orthogonal scores | Cross-fitting and formal DML workflow | More DML than classic TMLE; target model assumptions matter |
| [`zepid`](https://zepid.readthedocs.io/) | Python | Epidemiologic AIPW/TMLE-style workflows | Practical Python causal epi toolkit | Smaller ecosystem than R targeted learning |
| [`DoWhy`](https://www.pywhy.org/dowhy/) | Python | Identification plus estimator/refuter discipline | Good causal workflow wrapper | Estimator and diagnostics still require statistical review |

## Practical Selection Rules

- Need transparent binary-treatment DR estimate: start with AIPW or a one-step estimator.
- Need bounded risk/mean target with Super Learner: use TMLE.
- Need modern modular R targeted learning: use `tmle3`/`sl3`.
- Need longitudinal treatment/censoring: use `ltmle` or `lmtp` with `02-longitudinal-gmethods`.
- Need high-dimensional orthogonal ML: ask main to route `22-double-machine-learning`.
- Need heterogeneity or policy scores: DR scores can feed `10-heterogeneous-effects` or `11-point-treatment-rules`, but those modules define the target.
- Need Python first pass: use EconML, DoubleML, zepid, or custom AIPW, with explicit diagnostics.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [tmle3 manual](https://ictml-project.r-universe.dev/tmle3/doc/manual.html), [drtmle CRAN manual](https://cran.r-project.org/web/packages/drtmle/drtmle.pdf), [AIPW reference](https://yqzhong7.github.io/AIPW/reference/AIPW.html)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. TMLE/AIPW APIs can be package-specific; keep the code minimal and re-check examples. Save estimate/table, diagnostic/plot, and source code paths for `artifact_index`.

```r
# Tiny sketch, not a complete script.
# Define outcome, treatment, covariates, folds, and nuisance learners explicitly.
library(drtmle)

dr_fit <- drtmle(W = covariate_matrix, A = treatment, Y = outcome,
                 family = binomial(), stratify = FALSE)
# Preserve nuisance-model diagnostics and influence-function/SE output.
```

Artifact outputs to preserve: DR/TMLE estimate table path, nuisance/positivity diagnostic path, source code path.
