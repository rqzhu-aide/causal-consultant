"""
From-scratch nearest-neighbor propensity-score matching in Python.

Requires:
    pip install pandas numpy scikit-learn statsmodels matplotlib

This script demonstrates ATT-style matching with replacement and a logit-PS caliper.
It is intended as a transparent template. For production diagnostics, R MatchIt/cobalt
is usually richer.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt


def simulate_data(n: int = 900, seed: int = 20260429) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    age = rng.normal(55, 12, n)
    severity = rng.normal(size=n)
    female = rng.binomial(1, 0.52, n)
    lin_ps = -0.5 + 0.025 * (age - 55) + 0.9 * severity - 0.2 * female
    ps = 1 / (1 + np.exp(-lin_ps))
    treat = rng.binomial(1, ps)
    y = 10 + 2.0 * treat + 0.04 * age + 1.2 * severity - 0.3 * female + rng.normal(size=n)
    return pd.DataFrame({"y": y, "treat": treat, "age": age, "severity": severity, "female": female})


def fit_ps(df: pd.DataFrame) -> np.ndarray:
    x = df[["age", "severity", "female"]].copy()
    x["age_sq"] = df["age"] ** 2
    model = Pipeline([("scaler", StandardScaler()), ("logit", LogisticRegression(max_iter=2000))])
    model.fit(x, df["treat"])
    return np.clip(model.predict_proba(x)[:, 1], 1e-4, 1 - 1e-4)


def logit(p: np.ndarray) -> np.ndarray:
    return np.log(p / (1 - p))


def smd(df: pd.DataFrame, cols: list[str], weights: np.ndarray | None = None) -> pd.DataFrame:
    a = df["treat"].to_numpy()
    if weights is None:
        weights = np.ones(len(df))
    rows = []
    for col in cols:
        x = df[col].to_numpy(float)
        mt = np.average(x[a == 1], weights=weights[a == 1])
        mc = np.average(x[a == 0], weights=weights[a == 0])
        denom = np.sqrt((np.var(x[a == 1], ddof=1) + np.var(x[a == 0], ddof=1)) / 2)
        rows.append({"covariate": col, "smd": (mt - mc) / denom})
    return pd.DataFrame(rows)


def match_with_replacement(df: pd.DataFrame, ps: np.ndarray, caliper_sd: float = 0.2) -> pd.DataFrame:
    df = df.copy().reset_index(drop=True)
    df["ps"] = ps
    df["logit_ps"] = logit(ps)
    treated = df[df["treat"] == 1].copy()
    controls = df[df["treat"] == 0].copy()

    caliper = caliper_sd * df["logit_ps"].std()
    nbrs = NearestNeighbors(n_neighbors=1).fit(controls[["logit_ps"]])
    distances, indices = nbrs.kneighbors(treated[["logit_ps"]])

    pairs = []
    for treated_pos, (dist, control_pos) in enumerate(zip(distances[:, 0], indices[:, 0])):
        if dist <= caliper:
            t_row = treated.iloc[treated_pos]
            c_row = controls.iloc[control_pos]
            pairs.append((int(t_row.name), int(c_row.name), float(dist)))

    if not pairs:
        raise RuntimeError("No matches found within caliper. Try a wider caliper or inspect overlap.")

    matched_indices = [p[0] for p in pairs] + [p[1] for p in pairs]
    matched = df.loc[matched_indices].copy()
    matched["match_weight"] = 1.0
    matched["pair_id"] = np.repeat(np.arange(len(pairs)), 2)
    return matched


def main() -> None:
    df = simulate_data()
    ps = fit_ps(df)
    df["ps"] = ps

    print("Original treatment counts")
    print(df["treat"].value_counts())
    print("\nUnadjusted SMDs")
    print(smd(df, ["age", "severity", "female"]).round(3))

    matched = match_with_replacement(df, ps, caliper_sd=0.2)
    print("\nMatched treatment counts")
    print(matched["treat"].value_counts())
    print("\nMatched SMDs")
    print(smd(matched, ["age", "severity", "female"], matched["match_weight"].to_numpy()).round(3))

    fit = sm.OLS(matched["y"], sm.add_constant(matched[["treat"]])).fit(cov_type="HC1")
    print("\nOutcome model on matched sample, robust SE")
    print(fit.summary().tables[1])

    plt.figure()
    plt.hist(df.loc[df["treat"] == 1, "ps"], bins=30, alpha=0.6, density=True, label="treated")
    plt.hist(df.loc[df["treat"] == 0, "ps"], bins=30, alpha=0.6, density=True, label="control")
    plt.xlabel("Estimated propensity score")
    plt.ylabel("Density")
    plt.legend()
    plt.title("Pre-match propensity score overlap")
    plt.tight_layout()
    plt.savefig("python_matching_ps_overlap.png", dpi=150)
    plt.close()

    print("\nSaved plot: python_matching_ps_overlap.png")
    print("Interpretation reminder: this is an ATT-style matched-sample estimate. If treated units are unmatched, the target is matchable treated units.")


if __name__ == "__main__":
    main()
