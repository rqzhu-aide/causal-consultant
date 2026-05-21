"""DoubleML PLR/IRM templates for orthogonal causal estimation."""

from pathlib import Path

import pandas as pd
from doubleml import DoubleMLData, DoubleMLIRM, DoubleMLPLR
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

DATA = Path("analysis_dataset.csv")
OUT = Path("dml_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# y: outcome
# a: treatment/exposure
# x1, x2, x3: approved pre-treatment covariates

x_cols = ["x1", "x2", "x3"]
dml_data = DoubleMLData(df, y_col="y", d_cols="a", x_cols=x_cols)

ml_l = RandomForestRegressor(n_estimators=500, min_samples_leaf=10, random_state=123)
ml_m_reg = RandomForestRegressor(n_estimators=500, min_samples_leaf=10, random_state=123)
ml_m_clf = RandomForestClassifier(n_estimators=500, min_samples_leaf=10, random_state=123)

plr = DoubleMLPLR(dml_data, ml_l=ml_l, ml_m=ml_m_reg, n_folds=5)
plr.fit()
plr.summary.to_csv(OUT / "doubleml_plr_summary.csv")

irm = DoubleMLIRM(dml_data, ml_g=ml_l, ml_m=ml_m_clf, n_folds=5, score="ATE")
irm.fit()
irm.summary.to_csv(OUT / "doubleml_irm_summary.csv")
