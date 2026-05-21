"""DoubleML DiD template for conditional parallel trends.

Use when flexible nuisance models are needed and the DoubleML DiD target matches
the design. This is not a substitute for staggered-adoption design checks.
"""

from pathlib import Path

import pandas as pd
from doubleml import DoubleMLDID, DoubleMLDIDData
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor


DATA = Path("analysis_did_2x2_or_supported_panel.csv")
df = pd.read_csv(DATA)

# Required columns for simple panel-difference setup:
# dy: outcome change, post minus pre
# d: treated group indicator
# x1, x2, x3: pre-treatment covariates

x_cols = ["x1", "x2", "x3"]
dml_data = DoubleMLDIDData(
    df,
    y_col="dy",
    d_cols="d",
    x_cols=x_cols,
)

ml_g = RandomForestRegressor(n_estimators=300, min_samples_leaf=10, random_state=123)
ml_m = RandomForestClassifier(n_estimators=300, min_samples_leaf=10, random_state=123)

dml_did = DoubleMLDID(dml_data, ml_g=ml_g, ml_m=ml_m, n_folds=5)
dml_did.fit()

dml_did.summary.to_csv("doubleml_did_summary.csv")
