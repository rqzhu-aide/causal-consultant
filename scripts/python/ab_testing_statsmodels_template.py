"""Root template: A/B test or individual RCT analysis with statsmodels.

Expected dataframe columns for production:
    unit_id, treatment, outcome
Optional:
    x_pre, cluster_id
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy import stats
import statsmodels.formula.api as smf


def sample_ratio_mismatch(z: pd.Series, expected_probs: dict[int, float]) -> pd.DataFrame:
    levels = list(expected_probs.keys())
    observed = z.value_counts().reindex(levels, fill_value=0).astype(float)
    expected = observed.sum() * pd.Series(expected_probs).reindex(levels)
    chi2 = ((observed - expected) ** 2 / expected).sum()
    p_value = stats.chi2.sf(chi2, df=len(levels) - 1)
    return pd.DataFrame({"arm": levels, "observed": observed.values, "expected": expected.values, "chisq": chi2, "p_value": p_value})


def mean_effect(y: pd.Series, z: pd.Series) -> pd.Series:
    y1, y0 = y[z == 1], y[z == 0]
    est = y1.mean() - y0.mean()
    se = np.sqrt(y1.var(ddof=1) / len(y1) + y0.var(ddof=1) / len(y0))
    return pd.Series({"control_mean": y0.mean(), "treatment_mean": y1.mean(), "absolute_effect": est, "relative_lift": est / y0.mean(), "std_error": se, "ci_low": est - 1.96 * se, "ci_high": est + 1.96 * se})


def make_synthetic_data(n: int = 5000) -> pd.DataFrame:
    rng = np.random.default_rng(20260429)
    df = pd.DataFrame({"unit_id": np.arange(n), "treatment": rng.binomial(1, 0.5, n), "x_pre": rng.normal(size=n)})
    df["outcome"] = 1 + 0.2 * df["treatment"] + 0.7 * df["x_pre"] + rng.normal(size=n)
    return df


def run_analysis(df: pd.DataFrame) -> None:
    print("\nSRM check")
    print(sample_ratio_mismatch(df["treatment"], {0: 0.5, 1: 0.5}))

    print("\nRaw mean effect")
    print(mean_effect(df["outcome"], df["treatment"]))

    formula = "outcome ~ treatment"
    if "x_pre" in df.columns:
        formula += " + x_pre"
    model = smf.ols(formula, data=df)
    if "cluster_id" in df.columns:
        fit = model.fit(cov_type="cluster", cov_kwds={"groups": df["cluster_id"]})
    else:
        fit = model.fit(cov_type="HC2")
    print("\nRegression estimate")
    print(fit.summary().tables[1])


if __name__ == "__main__":
    data = make_synthetic_data()
    run_analysis(data)
