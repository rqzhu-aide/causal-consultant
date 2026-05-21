"""Template: source-to-target inverse odds weighting in Python.

S = 1 for source/study rows, S = 0 for target population rows. This is a
diagnostic and estimation scaffold; add robust uncertainty before reporting.
"""

import numpy as np
import pandas as pd
import statsmodels.api as sm
from sklearn.linear_model import LogisticRegression

selection_cols = ["age", "sex", "baseline_risk"]
treatment_col = "treatment"
outcome_col = "outcome"

X = stacked_source_target[selection_cols]
S = stacked_source_target["S"]

sel_model = LogisticRegression(max_iter=1000)
sel_model.fit(X, S)
p_source = sel_model.predict_proba(X)[:, 1]

source = stacked_source_target[stacked_source_target["S"] == 1].copy()
p_source_src = p_source[stacked_source_target["S"].to_numpy() == 1]

source["transport_weight"] = (1.0 - p_source_src) / np.clip(p_source_src, 1e-3, 1.0)

X_eff = sm.add_constant(source[[treatment_col]])
fit = sm.WLS(source[outcome_col], X_eff, weights=source["transport_weight"]).fit(cov_type="HC3")
print(fit.summary())

print(source["transport_weight"].describe())
