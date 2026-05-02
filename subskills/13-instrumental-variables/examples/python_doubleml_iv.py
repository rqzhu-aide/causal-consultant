#!/usr/bin/env python3
"""python_doubleml_iv.py

High-dimensional IV example using DoubleML's partially linear IV model.

This is useful when many observed covariates X must be adjusted flexibly while
identification still comes from an instrument Z. IV-DML does not make an invalid
instrument valid; it only helps estimate nuisance functions with cross-fitting.

Install manually if needed:
    pip install doubleml scikit-learn pandas numpy
"""

from __future__ import annotations

import sys
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


def main() -> None:
    rng = np.random.default_rng(202606)
    n = 1200
    p = 20

    x = rng.normal(size=(n, p))
    cols = [f"X{j+1}" for j in range(p)]

    z = 0.5 * x[:, 0] - 0.25 * x[:, 1] + rng.normal(size=n)
    u = rng.normal(size=n)

    # Treatment with unobserved confounding U and nonlinear covariate effects.
    d = (
        0.8 * z
        + np.sin(x[:, 0])
        + 0.5 * x[:, 1] ** 2
        - 0.3 * x[:, 2]
        + 0.8 * u
        + rng.normal(size=n)
    )

    theta = 1.5
    y = (
        theta * d
        + np.cos(x[:, 0])
        + x[:, 1] * x[:, 2]
        - 0.5 * x[:, 3]
        + u
        + rng.normal(size=n)
    )

    df = pd.DataFrame(x, columns=cols)
    df["Y"] = y
    df["D"] = d
    df["Z"] = z

    print(f"Analysis N: {len(df)}, covariates: {p}")

    # DoubleMLData specifies outcome, treatment, instrument, and covariates.
    obj_dml_data = dml.DoubleMLData(df, y_col="Y", d_cols="D", z_cols="Z", x_cols=cols)

    # Choose learners. Random forests are flexible; Lasso is a useful faster alternative.
    # For real work, tune learners and report nuisance performance.
    learner = RandomForestRegressor(
        n_estimators=200,
        max_depth=6,
        min_samples_leaf=5,
        random_state=202606,
        n_jobs=-1,
    )

    ml_l = clone(learner)  # E[Y | X]
    ml_m = clone(learner)  # E[Z | X]
    ml_r = clone(learner)  # E[D | X]

    pliv = dml.DoubleMLPLIV(obj_dml_data, ml_l=ml_l, ml_m=ml_m, ml_r=ml_r, n_folds=5)
    pliv.fit(store_predictions=True)

    print("\nDoubleML PLIV result:")
    print(pliv.summary)

    print("\nConfidence interval:")
    print(pliv.confint())

    # A fast linear benchmark. This is not a substitute for the flexible model;
    # it helps detect extreme instability due to learner choice.
    lasso = LassoCV(cv=5, random_state=202606)
    pliv_lasso = dml.DoubleMLPLIV(
        obj_dml_data,
        ml_l=clone(lasso),
        ml_m=clone(lasso),
        ml_r=clone(lasso),
        n_folds=5,
    )
    pliv_lasso.fit()

    print("\nDoubleML PLIV with LassoCV benchmark:")
    print(pliv_lasso.summary)

    print("\nInterpretation reminder:")
    print("IV-DML estimates a structural/IV parameter under the same IV assumptions.")
    print("Cross-fitting and flexible ML help with high-dimensional X; they do not validate Z.")


if __name__ == "__main__":
    sys.exit(main())
