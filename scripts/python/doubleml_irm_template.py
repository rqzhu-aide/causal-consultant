"""DoubleML IRM template for binary treatment."""
import numpy as np
import pandas as pd
from doubleml import DoubleMLData, DoubleMLIRM
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import KFold

# df: pandas DataFrame
# y_col = "Y", d_col = "A", x_cols = ["X1", "X2", "X3"]

dml_data = DoubleMLData(df, y_col="Y", d_cols="A", x_cols=["X1", "X2", "X3"])

ml_g = RandomForestRegressor(n_estimators=500, min_samples_leaf=5, random_state=1)
ml_m = RandomForestClassifier(n_estimators=500, min_samples_leaf=5, random_state=2)

irm = DoubleMLIRM(
    dml_data,
    ml_g=ml_g,
    ml_m=ml_m,
    n_folds=5,
    score="ATE",
)
irm.fit()
print(irm.summary)

# Diagnostics to add:
# - propensity score overlap
# - sensitivity to learners/tuning
# - covariate balance if weighting interpretation is used
# - clear no-unmeasured-confounding assumption
