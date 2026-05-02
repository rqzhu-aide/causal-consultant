# Software and Packages: Matching, Weighting, and Balance

## R: Preferred Production Stack

R has the strongest end-to-end tooling for matching, weighting, and balance diagnostics.

### Core packages

```r
install.packages(c("MatchIt", "WeightIt", "cobalt", "sandwich", "lmtest", "survey"))
```

#### MatchIt

Use for matching and preprocessing. Supports many matching designs through a unified interface, including nearest-neighbor, optimal, full, exact, coarsened exact, subclassification, and related workflows depending on installed dependencies.

Common pattern:

```r
m.out <- MatchIt::matchit(
  treat ~ x1 + x2 + x3,
  data = dat,
  method = "nearest",
  distance = "glm",
  estimand = "ATT",
  ratio = 1,
  caliper = 0.2
)

summary(m.out)
md <- MatchIt::match.data(m.out)
```

#### WeightIt

Use for weighting. Supports binary, multi-category, continuous, and longitudinal treatments; estimands such as ATE, ATT, ATC, and ATO; and methods including GLM propensity scores, CBPS, entropy balancing, optimization, and machine learning methods.

Common pattern:

```r
w.out <- WeightIt::weightit(
  treat ~ x1 + x2 + x3,
  data = dat,
  method = "glm",
  estimand = "ATE"
)

summary(w.out)
dat$w <- w.out$weights
```

#### cobalt

Use for balance diagnostics after matching, weighting, or subclassification.

```r
bal <- cobalt::bal.tab(w.out, un = TRUE, thresholds = c(m = .1, v = 2))
print(bal)
cobalt::love.plot(w.out, stats = "mean.diffs", abs = TRUE, thresholds = c(m = .1))
```

`cobalt` integrates with `MatchIt`, `WeightIt`, `CBPS`, `Matching`, `optmatch`, `twang`, and other preprocessing packages.

#### survey

Use when survey/sample weights are part of the target population or when fitting design-weighted outcome models.

```r
des <- survey::svydesign(ids = ~1, weights = ~w, data = dat)
survey::svyglm(y ~ treat, design = des)
```

#### sandwich and lmtest

Use for robust covariance in simple weighted outcome models.

```r
fit <- lm(y ~ treat, data = dat, weights = w)
lmtest::coeftest(fit, vcov. = sandwich::vcovHC(fit, type = "HC1"))
```

## R: Advanced and Specialized Packages

### optmatch

Use for optimal and full matching with distance restrictions, exact matching, and calipers. `MatchIt` can call optimal/full matching methods when dependencies are installed.

### Matching

Use for multivariate matching, propensity-score matching, and genetic matching via `GenMatch()` and `Match()`.

### CBPS

Use for covariate balancing propensity score methods. CBPS estimates propensity scores while optimizing balance conditions.

### ebal

Use for entropy balancing when working directly with Hainmueller-style entropy balancing.

### optweight

Use for stable balancing weights and optimization-based balancing.

### PSweight

Use for a comprehensive propensity-score weighting workflow, including overlap weights and augmented weighting estimators.

### twang

Use for generalized boosted-model propensity score weighting, especially when machine-learning propensity estimation is desired. Still diagnose balance and weights.

## Python: Practical Stack

Python can implement many matching/weighting analyses, but balance diagnostics are often more manual than in R.

### Core packages

```bash
pip install pandas numpy scipy scikit-learn statsmodels matplotlib
```

Use for transparent from-scratch workflows:

- fit propensity score with `sklearn.linear_model.LogisticRegression` or another classifier;
- compute IPW, stabilized weights, ATT weights, overlap weights;
- compute SMDs and ESS manually;
- estimate weighted effects with `statsmodels`;
- plot overlap and weight distributions with `matplotlib`.

### DoWhy

Install:

```bash
pip install dowhy
```

Use when the workflow should include explicit causal model specification, identification, estimation, and refutation. DoWhy includes propensity-score matching and weighting estimators, including inverse propensity weighting variants.

### causalml

Install:

```bash
pip install causalml
```

Use for ML-oriented causal workflows and propensity-score matching utilities. It is especially useful if the broader project also includes uplift modeling or CATE estimation.

### zEpid

Install:

```bash
pip install zepid
```

Use for epidemiologic IPTW, AIPTW, IPCW, missingness weights, g-formula, and related workflows.

## Backend Selection Rules

| User preference/data need | Recommended backend |
|---|---|
| Best diagnostics and publication workflow | R: `MatchIt` + `WeightIt` + `cobalt` |
| Simple ATT matching | R `MatchIt`; Python from-scratch or `causalml` |
| ATE/ATT/ATO weights | R `WeightIt`; Python from-scratch or `zepid` |
| Entropy balancing | R `WeightIt(method="ebal")` or `ebal` |
| CBPS | R `WeightIt(method="cbps")` or `CBPS` |
| Full/optimal matching | R `MatchIt` with `optmatch` |
| Genetic matching | R `Matching` or `MatchIt` genetic method where available |
| Survey weights | R `WeightIt` + `survey`; careful target-population statement |
| Strong Python-only workflow | Python from-scratch diagnostics + `statsmodels`; optionally `DoWhy` |
| High-dimensional nuisance/final estimator | Route to `08-doubly-robust-ml` after balance design |

## Version and Reproducibility Notes

Always report:

- package names and versions;
- propensity model formula;
- matching method and parameters;
- weighting method and estimand;
- exact constraints, calipers, trimming rules;
- missing-data handling;
- balance thresholds;
- random seeds for stochastic algorithms;
- final analysis sample size.

In R:

```r
sessionInfo()
```

In Python:

```python
import sys, pandas, numpy, sklearn, statsmodels
print(sys.version)
print(pandas.__version__, numpy.__version__, sklearn.__version__, statsmodels.__version__)
```

## Installation Policy for Agents

Do not silently install packages. Provide commands and ask the user to approve installation in interactive settings. If package installation is not possible, provide a self-contained fallback using base R or Python where feasible, but state limitations.
