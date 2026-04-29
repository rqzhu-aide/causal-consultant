"""Template: propensity-score weighting with diagnostics in Python.

Replace the synthetic-data block with your dataset and update OUTCOME, TREATMENT, and COVARIATES.
Requires: pandas, numpy, scikit-learn, statsmodels, matplotlib.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression
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
    return np.clip(model.predict_proba(df[COVARIATES])[:, 1], 1e-3, 1 - 1e-3)


def weighted_mean(x: np.ndarray, w: np.ndarray) -> float:
    return float(np.sum(x * w) / np.sum(w))


def ess(w: np.ndarray) -> float:
    return float(np.sum(w) ** 2 / np.sum(w ** 2))


def main() -> None:
    df = synthetic_data()
    a = df[TREATMENT].to_numpy()
    ps = fit_ps(df)
    weights = a / ps + (1 - a) / (1 - ps)  # ATE IPW
    df["weights"] = weights
    print("Weight summary")
    print(df.groupby(TREATMENT)["weights"].describe())
    print("ESS treated:", ess(weights[a == 1]))
    print("ESS control:", ess(weights[a == 0]))
    y = df[OUTCOME].to_numpy()
    tau = weighted_mean(y[a == 1], weights[a == 1]) - weighted_mean(y[a == 0], weights[a == 0])
    print("Weighted ATE difference:", tau)
    fit = sm.WLS(df[OUTCOME], sm.add_constant(df[[TREATMENT]]), weights=weights).fit(cov_type="HC1")
    print(fit.summary().tables[1])
    print("Reminder: this targets ATE only if positivity and measured-confounding assumptions are credible.")


if __name__ == "__main__":
    main()
