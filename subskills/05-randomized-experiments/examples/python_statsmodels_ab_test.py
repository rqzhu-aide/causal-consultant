"""A/B test or individual-level randomized experiment in Python.

Runnable synthetic example. Replace the synthetic-data block with your own
user/patient/unit-level dataframe for production use.

Required packages:
    pip install pandas numpy scipy statsmodels
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy import stats
import statsmodels.formula.api as smf
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep


def sample_ratio_mismatch(z: pd.Series, expected_probs: dict[int, float]) -> pd.DataFrame:
    levels = list(expected_probs.keys())
    observed = z.value_counts().reindex(levels, fill_value=0).astype(float)
    expected = observed.sum() * pd.Series(expected_probs, dtype=float).reindex(levels)
    chi2 = ((observed - expected) ** 2 / expected).sum()
    p_value = stats.chi2.sf(chi2, df=len(levels) - 1)
    return pd.DataFrame(
        {
            "arm": levels,
            "observed": observed.to_numpy(),
            "expected": expected.to_numpy(),
            "chisq": chi2,
            "df": len(levels) - 1,
            "p_value": p_value,
        }
    )


def standardized_mean_difference(x: pd.Series, z: pd.Series) -> float:
    x1 = x[z == 1]
    x0 = x[z == 0]
    pooled = np.sqrt((x1.var(ddof=1) + x0.var(ddof=1)) / 2)
    return float((x1.mean() - x0.mean()) / pooled)


def mean_difference(y: pd.Series, z: pd.Series) -> dict[str, float]:
    y1 = y[z == 1]
    y0 = y[z == 0]
    est = y1.mean() - y0.mean()
    se = np.sqrt(y1.var(ddof=1) / len(y1) + y0.var(ddof=1) / len(y0))
    return {
        "control_mean": float(y0.mean()),
        "treatment_mean": float(y1.mean()),
        "absolute_effect": float(est),
        "relative_lift": float(est / y0.mean()),
        "std_error": float(se),
        "ci_low": float(est - 1.96 * se),
        "ci_high": float(est + 1.96 * se),
    }


def main() -> None:
    rng = np.random.default_rng(20260429)
    n = 10_000
    df = pd.DataFrame(
        {
            "unit_id": np.arange(n),
            "treatment": rng.binomial(1, 0.5, size=n),
            "x_pre": rng.normal(size=n),
            "age": rng.normal(50, 12, size=n),
        }
    )
    df["outcome"] = 1 + 0.25 * df["treatment"] + 0.8 * df["x_pre"] + rng.normal(size=n)
    p = 1 / (1 + np.exp(-(-1.2 + 0.15 * df["treatment"] + 0.25 * df["x_pre"])))
    df["converted"] = rng.binomial(1, p)

    print("\nAllocation / SRM check")
    print(sample_ratio_mismatch(df["treatment"], {0: 0.5, 1: 0.5}))

    print("\nBaseline balance")
    balance = pd.DataFrame(
        {
            "variable": ["x_pre", "age"],
            "smd": [
                standardized_mean_difference(df["x_pre"], df["treatment"]),
                standardized_mean_difference(df["age"], df["treatment"]),
            ],
        }
    )
    print(balance)

    print("\nRaw mean difference")
    print(pd.Series(mean_difference(df["outcome"], df["treatment"])))

    print("\nRobust OLS treatment effect")
    ols = smf.ols("outcome ~ treatment", data=df).fit(cov_type="HC2")
    print(ols.summary().tables[1])

    print("\nRegression adjustment with pre-treatment covariates")
    adj = smf.ols("outcome ~ treatment + x_pre + age", data=df).fit(cov_type="HC2")
    print(adj.summary().tables[1])

    print("\nBinary outcome: risk difference and proportions z-test")
    count = np.array([
        df.loc[df.treatment == 1, "converted"].sum(),
        df.loc[df.treatment == 0, "converted"].sum(),
    ])
    nobs = np.array([(df.treatment == 1).sum(), (df.treatment == 0).sum()])
    zstat, pval = proportions_ztest(count=count, nobs=nobs, alternative="two-sided")
    ci_low, ci_high = confint_proportions_2indep(
        count1=count[0], nobs1=nobs[0], count2=count[1], nobs2=nobs[1], method="wald"
    )
    risk_t = count[0] / nobs[0]
    risk_c = count[1] / nobs[1]
    print(
        {
            "risk_control": float(risk_c),
            "risk_treatment": float(risk_t),
            "risk_difference": float(risk_t - risk_c),
            "ci_low": float(ci_low),
            "ci_high": float(ci_high),
            "z": float(zstat),
            "p_value": float(pval),
        }
    )

    print("\nInterpretation reminder")
    print(
        "This estimates the ITT/assignment effect if treatment is randomized, "
        "the dataframe is at the randomization-unit level, and there is no unhandled attrition or interference."
    )


if __name__ == "__main__":
    main()
