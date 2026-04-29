#!/usr/bin/env python3
"""scripts/python/doubleml_iv_template.py

Reusable template for high-dimensional instrumental variables with DoubleML.

Use when IV identification is plausible and flexible/high-dimensional adjustment
for X is needed. Cross-fitting helps with nuisance estimation; it does not make
the instrument valid.

Install manually if needed:
    pip install doubleml scikit-learn pandas numpy
"""

from __future__ import annotations

from typing import Iterable
import numpy as np
import pandas as pd


def require_packages(packages: Iterable[str]) -> None:
    missing = []
    for pkg in packages:
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)
    if missing:
        raise SystemExit(
            "Missing packages: "
            + ", ".join(missing)
            + "\nInstall with: pip install "
            + " ".join(missing)
        )


require_packages(["doubleml", "sklearn", "pandas", "numpy"])

import doubleml as dml
from sklearn.base import clone
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LassoCV


# ----------------------------------------------------------------------
# USER INPUT SECTION
# ----------------------------------------------------------------------
# df = pd.read_csv("your_data.csv")
# outcome = "Y"
# treatment = "D"
# instrument = "Z"
# x_cols = ["X1", "X2", ...]

if "df" not in globals():
    rng = np.random.default_rng(202611)
    n = 1000
    p = 10
    x = rng.normal(size=(n, p))
    cols = [f"X{j+1}" for j in range(p)]
    z = 0.6 * x[:, 0] - 0.3 * x[:, 1] + rng.normal(size=n)
    u = rng.normal(size=n)
    d = 0.9 * z + np.sin(x[:, 0]) + 0.4 * x[:, 1] ** 2 + 0.8 * u + rng.normal(size=n)
    y = 1.25 * d + np.cos(x[:, 0]) + x[:, 1] * x[:, 2] + u + rng.normal(size=n)
    df = pd.DataFrame(x, columns=cols)
    df["Y"] = y
    df["D"] = d
    df["Z"] = z

outcome = "Y"
treatment = "D"
instrument = "Z"
x_cols = [c for c in df.columns if c not in [outcome, treatment, instrument]]

df_iv = df.dropna(subset=[outcome, treatment, instrument] + x_cols).copy()
print(f"Analysis N: {len(df_iv)}, covariates: {len(x_cols)}")

obj_dml_data = dml.DoubleMLData(df_iv, y_col=outcome, d_cols=treatment, z_cols=instrument, x_cols=x_cols)

learner = RandomForestRegressor(
    n_estimators=200,
    max_depth=6,
    min_samples_leaf=5,
    random_state=202611,
    n_jobs=-1,
)

pliv = dml.DoubleMLPLIV(
    obj_dml_data,
    ml_l=clone(learner),  # E[Y | X]
    ml_m=clone(learner),  # E[Z | X]
    ml_r=clone(learner),  # E[D | X]
    n_folds=5,
)
pliv.fit(store_predictions=True)

print("DoubleML PLIV summary:")
print(pliv.summary)
print("\nConfidence intervals:")
print(pliv.confint())

# Optional benchmark with LassoCV.
lasso = LassoCV(cv=5, random_state=202611)
pliv_lasso = dml.DoubleMLPLIV(
    obj_dml_data,
    ml_l=clone(lasso),
    ml_m=clone(lasso),
    ml_r=clone(lasso),
    n_folds=5,
)
pliv_lasso.fit()
print("\nLassoCV benchmark:")
print(pliv_lasso.summary)

print("\nInterpretation reminder:")
print("IV-DML still requires a credible instrument. Report first-stage strength and instrument validity arguments separately.")
