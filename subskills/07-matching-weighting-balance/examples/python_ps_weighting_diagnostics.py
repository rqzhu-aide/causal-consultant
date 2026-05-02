"""
From-scratch propensity-score weighting diagnostics in Python.

This script uses synthetic data and requires:
    pip install pandas numpy scikit-learn statsmodels matplotlib

It demonstrates:
- propensity-score estimation;
- ATE IPW, stabilized ATE IPW, ATT weights, and ATO overlap weights;
- standardized mean differences;
- effective sample size;
- weight summaries;
- overlap and weight plots;
- robust weighted outcome regression.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import matplotlib.pyplot as plt


def simulate_data(n: int = 1200, seed: int = 20260429) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    x1 = rng.normal(size=n)
    x2 = rng.normal(size=n)
    x3 = rng.binomial(1, 0.45, size=n)
    site = rng.choice(["A", "B", "C"], size=n, p=[0.4, 0.35, 0.25])
    site_effect = pd.Series(site).map({"A": 0.0, "B": 0.25, "C": -0.2}).to_numpy()
    lin_ps = -0.35 + 1.0 * x1 - 0.8 * x2 + 0.35 * x3 + site_effect
    ps = 1 / (1 + np.exp(-lin_ps))
    treat = rng.binomial(1, ps)
    y = 2.0 + 1.4 * treat + 1.0 * x1 - 0.6 * x2 + 0.5 * x3 + site_effect + rng.normal(size=n)
    return pd.DataFrame({"y": y, "treat": treat, "x1": x1, "x2": x2, "x3": x3, "site": site})


def design_matrix(df: pd.DataFrame) -> pd.DataFrame:
    x = pd.get_dummies(df[["x1", "x2", "x3", "site"]], columns=["site"], drop_first=True)
    x["x1_sq"] = df["x1"] ** 2
    x["x2_sq"] = df["x2"] ** 2
    return x.astype(float)


def fit_propensity(df: pd.DataFrame) -> np.ndarray:
    x = design_matrix(df)
    model = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("logit", LogisticRegression(max_iter=2000, solver="lbfgs")),
        ]
    )
    model.fit(x, df["treat"])
    ps = model.predict_proba(x)[:, 1]
    return np.clip(ps, 1e-3, 1 - 1e-3)


def weighted_mean(x: np.ndarray, w: np.ndarray) -> float:
    return float(np.sum(w * x) / np.sum(w))


def weighted_var(x: np.ndarray, w: np.ndarray) -> float:
    mu = weighted_mean(x, w)
    return float(np.sum(w * (x - mu) ** 2) / np.sum(w))


def smd_table(df: pd.DataFrame, covariates: list[str], weights: np.ndarray | None = None) -> pd.DataFrame:
    a = df["treat"].to_numpy()
    if weights is None:
        weights = np.ones(len(df))
    rows = []
    for col in covariates:
        x = df[col].to_numpy(dtype=float)
        wt = weights[a == 1]
        wc = weights[a == 0]
        xt = x[a == 1]
        xc = x[a == 0]
        mt = weighted_mean(xt, wt)
        mc = weighted_mean(xc, wc)
        vt_unw = np.var(x[a == 1], ddof=1)
        vc_unw = np.var(x[a == 0], ddof=1)
        denom = np.sqrt((vt_unw + vc_unw) / 2)
        smd = (mt - mc) / denom if denom > 0 else np.nan
        vt_w = weighted_var(xt, wt)
        vc_w = weighted_var(xc, wc)
        vr = vt_w / vc_w if vc_w > 0 else np.nan
        rows.append({"covariate": col, "mean_treated": mt, "mean_control": mc, "smd": smd, "variance_ratio": vr})
    return pd.DataFrame(rows)


def effective_sample_size(weights: np.ndarray) -> float:
    return float(np.sum(weights) ** 2 / np.sum(weights ** 2))


def make_weights(df: pd.DataFrame, ps: np.ndarray) -> dict[str, np.ndarray]:
    a = df["treat"].to_numpy()
    p_treat = a.mean()
    weights = {
        "ate_ipw": a / ps + (1 - a) / (1 - ps),
        "ate_stabilized": a * p_treat / ps + (1 - a) * (1 - p_treat) / (1 - ps),
        "att": a + (1 - a) * ps / (1 - ps),
        "ato_overlap": a * (1 - ps) + (1 - a) * ps,
    }
    return weights


def estimate_effect(df: pd.DataFrame, weights: np.ndarray, label: str) -> None:
    a = df["treat"].to_numpy()
    y = df["y"].to_numpy()
    mu1 = weighted_mean(y[a == 1], weights[a == 1])
    mu0 = weighted_mean(y[a == 0], weights[a == 0])
    x_model = sm.add_constant(df[["treat"]])
    fit = sm.WLS(df["y"], x_model, weights=weights).fit(cov_type="HC1")
    print(f"\n=== {label} ===")
    print(f"weighted treated mean: {mu1:.3f}")
    print(f"weighted control mean: {mu0:.3f}")
    print(f"weighted difference: {mu1 - mu0:.3f}")
    print(fit.summary().tables[1])


def plot_overlap_and_weights(df: pd.DataFrame, ps: np.ndarray, weights: dict[str, np.ndarray]) -> None:
    plt.figure()
    plt.hist(ps[df["treat"] == 1], bins=30, alpha=0.6, density=True, label="treated")
    plt.hist(ps[df["treat"] == 0], bins=30, alpha=0.6, density=True, label="control")
    plt.xlabel("Estimated propensity score")
    plt.ylabel("Density")
    plt.title("Propensity score overlap")
    plt.legend()
    plt.tight_layout()
    plt.savefig("python_ps_overlap.png", dpi=150)
    plt.close()

    for label, w in weights.items():
        plt.figure()
        plt.hist(w, bins=40)
        plt.xlabel("Weight")
        plt.ylabel("Count")
        plt.title(f"Weight distribution: {label}")
        plt.tight_layout()
        plt.savefig(f"python_weights_{label}.png", dpi=150)
        plt.close()


def main() -> None:
    df = simulate_data()
    ps = fit_propensity(df)
    df["ps"] = ps
    weights = make_weights(df, ps)

    covs = ["x1", "x2", "x3"]
    print("\nUnadjusted balance")
    print(smd_table(df, covs).round(3))

    for label, w in weights.items():
        print(f"\nBalance after {label}")
        print(smd_table(df, covs, w).round(3))
        print("Weight summary")
        print(pd.Series(w).describe(percentiles=[0.01, 0.5, 0.95, 0.99]).round(3))
        for group in [0, 1]:
            ess = effective_sample_size(w[df["treat"].to_numpy() == group])
            n_group = int((df["treat"] == group).sum())
            print(f"ESS group {group}: {ess:.1f} / nominal {n_group}")
        estimate_effect(df, w, label)

    plot_overlap_and_weights(df, ps, weights)
    print("\nSaved plots: python_ps_overlap.png and python_weights_*.png")
    print("\nInterpretation reminder: ATE, ATT, and ATO weights target different populations.")


if __name__ == "__main__":
    main()
