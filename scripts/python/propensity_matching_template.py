"""Template: nearest-neighbor propensity-score matching in Python.

For production matching/balance diagnostics, R MatchIt + cobalt is usually more mature.
This Python template is a transparent fallback.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

OUTCOME = "Y"
TREATMENT = "A"
COVARIATES = ["X1", "X2", "X3"]


def synthetic_data(n: int = 800, seed: int = 20260429) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    x1 = rng.normal(size=n)
    x2 = rng.normal(size=n)
    x3 = rng.binomial(1, 0.5, size=n)
    ps = 1 / (1 + np.exp(-(-0.3 + 0.9 * x1 - 0.6 * x2 + 0.4 * x3)))
    a = rng.binomial(1, ps)
    y = 1.0 + 1.3 * a + 0.8 * x1 - 0.5 * x2 + 0.4 * x3 + rng.normal(size=n)
    return pd.DataFrame({"Y": y, "A": a, "X1": x1, "X2": x2, "X3": x3})


def fit_ps(df: pd.DataFrame) -> np.ndarray:
    model = Pipeline([("scaler", StandardScaler()), ("logit", LogisticRegression(max_iter=2000))])
    model.fit(df[COVARIATES], df[TREATMENT])
    return np.clip(model.predict_proba(df[COVARIATES])[:, 1], 1e-4, 1 - 1e-4)


def main() -> None:
    df = synthetic_data().reset_index(drop=True)
    df["ps"] = fit_ps(df)
    df["logit_ps"] = np.log(df["ps"] / (1 - df["ps"]))
    treated = df[df[TREATMENT] == 1]
    control = df[df[TREATMENT] == 0]
    caliper = 0.2 * df["logit_ps"].std()
    nbrs = NearestNeighbors(n_neighbors=1).fit(control[["logit_ps"]])
    dist, idx = nbrs.kneighbors(treated[["logit_ps"]])
    pairs = [(treated.index[i], control.index[j[0]]) for i, (d, j) in enumerate(zip(dist[:, 0], idx)) if d <= caliper]
    matched_idx = [i for pair in pairs for i in pair]
    matched = df.loc[matched_idx].copy()
    fit = sm.OLS(matched[OUTCOME], sm.add_constant(matched[[TREATMENT]])).fit(cov_type="HC1")
    print("Matched treated/control counts")
    print(matched[TREATMENT].value_counts())
    print(fit.summary().tables[1])
    print("Reminder: if treated units are unmatched, this targets matchable treated units, not all treated units.")


if __name__ == "__main__":
    main()
