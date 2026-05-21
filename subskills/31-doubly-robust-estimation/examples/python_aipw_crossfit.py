"""Cross-fitted AIPW prototype for a binary point treatment."""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import KFold

DATA = Path("analysis_dataset.csv")
OUT = Path("doubly_robust_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected columns:
# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: approved pre-treatment confounders

x_cols = ["x1", "x2", "x3"]
x = df[x_cols].to_numpy()
a = df["a"].to_numpy()
y = df["y"].to_numpy()

q1 = np.zeros(len(df))
q0 = np.zeros(len(df))
g = np.zeros(len(df))

kf = KFold(n_splits=5, shuffle=True, random_state=123)
for train, test in kf.split(x):
    g_model = RandomForestClassifier(n_estimators=500, min_samples_leaf=10, random_state=123)
    q_model_1 = RandomForestRegressor(n_estimators=500, min_samples_leaf=10, random_state=123)
    q_model_0 = RandomForestRegressor(n_estimators=500, min_samples_leaf=10, random_state=123)

    g_model.fit(x[train], a[train])
    q_model_1.fit(x[train][a[train] == 1], y[train][a[train] == 1])
    q_model_0.fit(x[train][a[train] == 0], y[train][a[train] == 0])

    g[test] = g_model.predict_proba(x[test])[:, 1]
    q1[test] = q_model_1.predict(x[test])
    q0[test] = q_model_0.predict(x[test])

g = np.clip(g, 0.01, 0.99)
phi = q1 - q0 + a * (y - q1) / g - (1 - a) * (y - q0) / (1 - g)
ate = phi.mean()
se = phi.std(ddof=1) / np.sqrt(len(phi))

pd.Series(
    {
        "estimand": "ATE",
        "estimate": ate,
        "std_error": se,
        "ci_low": ate - 1.96 * se,
        "ci_high": ate + 1.96 * se,
        "influence_curve_mean_centered": (phi - ate).mean(),
        "influence_curve_sd": (phi - ate).std(ddof=1),
        "propensity_min": g.min(),
        "propensity_max": g.max(),
    }
).to_csv(OUT / "crossfit_aipw_summary.csv")
