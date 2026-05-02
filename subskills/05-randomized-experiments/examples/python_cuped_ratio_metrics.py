"""CUPED and ratio metrics for online experiments in Python.

Runnable synthetic example. The dataframe is one row per randomization unit.

Required packages:
    pip install pandas numpy scipy statsmodels
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy import stats


def cuped_adjust(y: pd.Series, x_pre: pd.Series) -> tuple[pd.Series, float]:
    mask = y.notna() & x_pre.notna()
    theta = np.cov(y[mask], x_pre[mask], ddof=1)[0, 1] / np.var(x_pre[mask], ddof=1)
    y_adj = y - theta * (x_pre - x_pre[mask].mean())
    return y_adj, float(theta)


def mean_effect(y: pd.Series, z: pd.Series) -> dict[str, float]:
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


def ratio_delta_method(num: pd.Series, den: pd.Series, z: pd.Series) -> dict[str, float]:
    """Delta-method contrast for ratio of sums by arm.

    Ratio in arm a: R_a = sum(num_i) / sum(den_i). The approximate variance
    of R_a is Var(num_i - R_a den_i) / (n_a * mean(den_i)^2).
    """
    out = {}
    pieces = []
    for arm in [0, 1]:
        m = num[z == arm].astype(float)
        d = den[z == arm].astype(float)
        r = m.sum() / d.sum()
        g = m - r * d
        var_r = g.var(ddof=1) / (len(g) * d.mean() ** 2)
        pieces.append((r, var_r, len(g)))
        out[f"ratio_{arm}"] = float(r)
    est = pieces[1][0] - pieces[0][0]
    se = np.sqrt(pieces[1][1] + pieces[0][1])
    out.update(
        {
            "absolute_ratio_effect": float(est),
            "relative_lift": float(est / pieces[0][0]),
            "std_error": float(se),
            "ci_low": float(est - 1.96 * se),
            "ci_high": float(est + 1.96 * se),
            "z_stat": float(est / se),
            "p_value": float(2 * stats.norm.sf(abs(est / se))),
        }
    )
    return out


def main() -> None:
    rng = np.random.default_rng(20260429)
    n = 50_000
    df = pd.DataFrame(
        {
            "user_id": np.arange(n),
            "treatment": rng.binomial(1, 0.5, size=n),
            "pre_revenue": rng.gamma(shape=1.5, scale=3.0, size=n),
        }
    )
    df["revenue"] = 0.5 + 0.10 * df["treatment"] + 0.8 * df["pre_revenue"] + rng.normal(scale=2.0, size=n)
    df["revenue"] = np.maximum(df["revenue"], 0)

    # Ratio metric: revenue per page view. Compute at user level.
    df["pageviews"] = rng.poisson(lam=5 + 0.2 * df["treatment"], size=n) + 1
    df["clicks"] = rng.binomial(df["pageviews"], p=0.08 + 0.005 * df["treatment"])

    print("\nRaw revenue effect")
    print(pd.Series(mean_effect(df["revenue"], df["treatment"])))

    df["revenue_cuped"], theta = cuped_adjust(df["revenue"], df["pre_revenue"])
    print("\nCUPED theta")
    print(theta)
    print("\nCUPED-adjusted revenue effect")
    print(pd.Series(mean_effect(df["revenue_cuped"], df["treatment"])))

    print("\nClick-through-rate ratio metric by delta method")
    print(pd.Series(ratio_delta_method(df["clicks"], df["pageviews"], df["treatment"])))

    print("\nInterpretation reminder")
    print("For ratio metrics, work at the randomization-unit level and use delta method, bootstrap, or randomization inference; do not treat events as independent users.")


if __name__ == "__main__":
    main()
