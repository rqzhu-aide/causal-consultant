"""DoubleML partially linear IV template.

Use only when high-dimensional/flexible nuisance support is needed and the IV
target matches a PLIV-style orthogonal score.
"""

from pathlib import Path

import pandas as pd
from doubleml import DoubleMLData, DoubleMLPLIV
from sklearn.ensemble import RandomForestRegressor


DATA = Path("analysis_iv_dataset.csv")
df = pd.read_csv(DATA)

# Required columns:
# y: outcome
# d: endogenous treatment/exposure
# z: instrument
# x1, x2, x3: valid pre-treatment/pre-instrument controls

x_cols = ["x1", "x2", "x3"]
dml_data = DoubleMLData(df, y_col="y", d_cols="d", z_cols="z", x_cols=x_cols)

learner = RandomForestRegressor(n_estimators=300, min_samples_leaf=10, random_state=123)
pliv = DoubleMLPLIV(
    dml_data,
    ml_l=learner,
    ml_m=learner,
    ml_r=learner,
    n_folds=5,
)
pliv.fit()

pliv.summary.to_csv("doubleml_pliv_summary.csv")
