# Literature And Software Map

Use this file to choose credible matching, weighting, and balance tools. Keep the main team focused on estimand, support, measured covariate balance, and target-population meaning before software.

## Core Literature

### Propensity Scores, Matching, And Design

- Rosenbaum and Rubin (1983), [The central role of the propensity score in observational studies for causal effects](https://doi.org/10.1093/biomet/70.1.41): balancing-score foundation for observed covariates.
- Rosenbaum and Rubin (1985), [Constructing a control group using multivariate matched sampling methods that incorporate the propensity score](https://doi.org/10.1080/01621459.1985.10478120): practical propensity-score matching.
- Rubin (2001), [Using propensity scores to help design observational studies](https://doi.org/10.1198/016214501753208573): separates design-stage balance work from outcome analysis.
- Ho, Imai, King, and Stuart (2007), [Matching as nonparametric preprocessing for reducing model dependence](https://doi.org/10.1093/pan/mpl013): matching as design preprocessing.
- Stuart (2010), [Matching Methods for Causal Inference: A Review and a Look Forward](https://doi.org/10.1214/09-STS313): broad matching review and diagnostics.
- Austin (2011), [An Introduction to Propensity Score Methods for Reducing the Effects of Confounding in Observational Studies](https://doi.org/10.1080/00273171.2011.568786): accessible propensity-score methods review.

### Weighting, Overlap, And Balance

- Robins, Hernan, and Brumback (2000), [Marginal structural models and causal inference in epidemiology](https://doi.org/10.1097/00001648-200009000-00011): IP weighting and MSM foundations.
- Crump et al. (2009), [Dealing with limited overlap in estimation of average treatment effects](https://doi.org/10.1093/biomet/asp023): trimming and optimal subpopulations under weak support.
- Hainmueller (2012), [Entropy balancing for causal effects](https://doi.org/10.1093/pan/mpr025): direct balance via entropy weights.
- Iacus, King, and Porro (2012), [Causal inference without balance checking: coarsened exact matching](https://doi.org/10.1093/pan/mpr013): coarsened exact matching.
- Diamond and Sekhon (2013), [Genetic matching for estimating causal effects](https://doi.org/10.1162/REST_a_00318): search-based balance optimization.
- Imai and Ratkovic (2014), [Covariate balancing propensity score](https://doi.org/10.1111/rssb.12027): propensity estimation with balance conditions.
- Li, Morgan, and Zaslavsky (2018), [Balancing covariates via propensity score weighting](https://doi.org/10.1080/01621459.2016.1260466): overlap weights and weighting-family comparisons.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`MatchIt`](https://kosukeimai.github.io/MatchIt/) | R | Nearest, optimal, full, exact, coarsened, subclassification matching | Strong design-stage matching interface and diagnostics workflow | Outcome inference and estimand shifts still need care |
| [`WeightIt`](https://ngreifer.github.io/WeightIt/) | R | ATE/ATT/ATC/ATO weights, CBPS, entropy, overlap, multi-category treatments | Broad modern weighting interface | Needs weight, overlap, and balance diagnostics |
| [`cobalt`](https://ngreifer.github.io/cobalt/) | R | Balance tables, love plots, distribution diagnostics | Excellent reporting artifacts across MatchIt/WeightIt/twang | Diagnostic only, not an estimator |
| [`CBPS`](https://cran.r-project.org/package=CBPS) | R | Covariate balancing propensity scores | Directly targets balance | Can be unstable with sparse/high-dimensional covariates |
| [`cobalt` + `survey`](https://cran.r-project.org/package=survey) | R | Weighted outcome models and robust design-weight handling | Mature survey/weighted-model infrastructure | Combining survey and causal weights needs explicit target |
| [`optmatch`](https://cran.r-project.org/package=optmatch) | R | Optimal and full matching | Strong matching algorithms | Setup can be more specialized |
| [`cem`](https://cran.r-project.org/package=cem) | R | Coarsened exact matching | Transparent strata and strong face validity | Coarsening choices can discard many units |
| [`ebal`](https://cran.r-project.org/package=ebal) / [`sbw`](https://cran.r-project.org/package=sbw) | R | Entropy or stable balancing weights | Direct moment balance and stable weights | Target moments and variance need reporting |
| [`twang`](https://cran.r-project.org/package=twang) | R | Boosted propensity weighting | Useful nonlinear propensity estimation | Balance diagnostics, not AUC, decide success |
| [`designmatch`](https://cran.r-project.org/package=designmatch) | R | Cardinality and optimal matching under constraints | Good when exact design constraints matter | More specialized optimization workflow |
| [`DoWhy`](https://www.pywhy.org/dowhy/) | Python | DAG identification plus propensity-score estimators/refuters | Clear causal workflow and refutation framing | Balance diagnostics may need custom code |
| [`causalml`](https://github.com/uber/causalml) | Python | Propensity and uplift workflows | Practical Python examples | Not primarily a balance-reporting toolkit |
| [`causallib`](https://github.com/IBM/causallib) | Python | IPW, matching, standardization estimators | Familiar sklearn-style tools | Smaller ecosystem than R balance packages |
| [`statsmodels`](https://www.statsmodels.org/) / [`scikit-learn`](https://scikit-learn.org/) | Python | Custom propensity models, weights, and diagnostics | Flexible and transparent | Must implement balance and variance carefully |

## Practical Selection Rules

- Need polished balance reports: use R `MatchIt`/`WeightIt` plus `cobalt`.
- Need ATT and transparent retained sample: start with matching or ATT weights.
- Need ATE and support is good: IPW/stabilized weights can work, but check tails.
- Need limited-overlap target: use overlap weights, trimming, or restricted support and state target shift.
- Need exact domain comparability: exact/coarsened/cardinality matching before flexible weights.
- Need high-dimensional propensity: ML can help, but choose by balance/support diagnostics, not classification AUC.
- Need longitudinal treatment/censoring weights: ask main to route `02-longitudinal-gmethods`.
- Need final effect estimation with robustness: pass balance/weight artifacts to `21-doubly-robust-estimation`.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [MatchIt `matchit`](https://kosukeimai.github.io/MatchIt/reference/matchit.html), [WeightIt `weightit`](https://ngreifer.github.io/WeightIt/reference/weightit.html), [cobalt `bal.tab`](https://ngreifer.github.io/cobalt/reference/bal.tab.html)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. Save outputs inside the active `analysis_dir`, update the unit `manifest.json`, and mirror report-relevant source, table, figure, diagnostic, and large-artifact paths into `artifact_index`.

```r
# Tiny sketch, not a complete script.
# Replace A and covariates; choose estimand before fitting.
library(MatchIt)
library(cobalt)

m <- matchit(A ~ X1 + X2 + X3, data = analysis_data,
             method = "nearest", estimand = "ATT")
balance <- bal.tab(m)
matched_data <- match.data(m)
```

Artifact outputs to preserve: matched/weighted sample table path, balance/overlap plot path, source code path.
