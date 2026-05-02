# Software and Package Guide for Randomized Experiments

## R Stack

### `randomizr`

Use for creating and documenting random assignments. It supports common designs such as simple, complete, blocked, clustered, and blocked-clustered random assignment.

Typical functions:

```r
simple_ra(N, prob = 0.5)
complete_ra(N, m = N/2)
block_ra(blocks = block_id, prob = 0.5)
cluster_ra(clusters = cluster_id, prob = 0.5)
block_and_cluster_ra(blocks = block_id, clusters = cluster_id, prob = 0.5)
```

### `estimatr`

Use for design-aware estimation in experiments:

- `difference_in_means()` for treatment-control comparisons with support for blocks/clusters;
- `lm_robust()` for robust and cluster-robust OLS;
- `lm_lin()` for Lin-style regression adjustment with pre-treatment covariates;
- `iv_robust()` for noncompliance/encouragement designs when IV is appropriate.

### `ri2`

Use for randomization inference when the randomization procedure is known. Especially useful for small samples, blocked/clustered designs, and multi-arm experiments.

### `fixest`

Use for fast regression with fixed effects and clustered standard errors. Good for large experiments with strata, site fixed effects, or high-dimensional fixed effects.

Examples:

```r
feols(y ~ z + x1 + x2, data = df, vcov = "HC1")
feols(y ~ z + x1 | block, data = df, cluster = ~ cluster_id)
```

### `clubSandwich`

Use for cluster-robust variance estimators and small-sample corrections, especially with limited clusters.

### `DeclareDesign`

Use for pre-experiment design simulation, power, MDE, diagnosis, and design declaration. Useful before data collection or when evaluating whether a planned experiment can answer the question.

### Supporting R packages

- `broom`: tidy model outputs.
- `modelsummary`: publication-ready tables.
- `ggplot2`: plots.
- `survival`: time-to-event trial endpoints.
- `geepack`: GEE for clustered/repeated binary/count outcomes.

## Python Stack

### `pandas` and `numpy`

Use for data cleaning, unit aggregation, metric computation, assignment counts, and reproducible simulation.

### `scipy`

Use for t-tests, chi-square tests, exact tests, and distribution functions.

Examples:

```python
from scipy import stats
stats.ttest_ind(y_treat, y_control, equal_var=False)
stats.chisquare(f_obs=observed, f_exp=expected)
```

### `statsmodels`

Use for OLS/GLM, robust and cluster-robust covariance, proportions tests, confidence intervals, power calculations, and GEE.

Examples:

```python
import statsmodels.formula.api as smf
fit = smf.ols("y ~ treatment + x1 + x2", data=df).fit(cov_type="HC2")
fit_cluster = smf.ols("y ~ treatment", data=df).fit(
    cov_type="cluster", cov_kwds={"groups": df["cluster_id"]}
)
```

For binary outcomes:

```python
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
```

For GEE:

```python
import statsmodels.api as sm
import statsmodels.formula.api as smf
gee = smf.gee("y ~ treatment", groups="cluster_id", data=df, family=sm.families.Binomial())
```

### `linearmodels`

Use mainly for IV/noncompliance or panel-style extensions. For ordinary RCTs, `statsmodels` is usually enough.

### Supporting Python tools

- `matplotlib`: diagnostic plots.
- `scikit-learn`: optional auxiliary prediction for variance reduction or HTE workflows, not for primary identification.
- `lifelines` or `scikit-survival`: only if routing to survival-specific analyses.

## Backend Selection Rules

| User need | Recommended backend |
|---|---|
| Design-based RCT with blocks/clusters | R `estimatr`, `randomizr`, `ri2` |
| Product A/B test with large dataframe | Python `pandas`, `statsmodels`, `scipy` or R `fixest` |
| CUPED / pre-period metric adjustment | Either R or Python; simple to implement manually |
| Cluster randomized trial with few clusters | R `estimatr` + `clubSandwich`; consider randomization inference |
| High-dimensional fixed effects | R `fixest` |
| Randomization inference | R `ri2` |
| Power/MDE simulation | R `DeclareDesign` or Python `statsmodels`/custom simulation |
| Noncompliance | R `ivreg`/`estimatr::iv_robust`/`fixest` or Python `linearmodels`; route to IV subskill |

## Package Installation Policy

Scripts should never install packages automatically. Include comments such as:

```r
# install.packages(c("randomizr", "estimatr", "ri2", "fixest"))
```

```python
# pip install pandas numpy scipy statsmodels
```

Production reports should include package versions.
