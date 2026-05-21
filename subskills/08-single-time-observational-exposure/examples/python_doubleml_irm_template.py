"""DoubleML IRM template for a binary point treatment.

Use after target-trial timing, confounding, and support have been reviewed.
"""

from pathlib import Path

import pandas as pd
from doubleml import DoubleMLData, DoubleMLIRM
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

DATA = Path("analysis_dataset.csv")
OUT = Path("observational_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected columns:
# y: outcome
# a: exposure/treatment, 0/1
# x1, x2, x3: baseline confounders

x_cols = ["x1", "x2", "x3"]
dml_data = DoubleMLData(df, y_col="y", d_cols="a", x_cols=x_cols)

ml_g = RandomForestRegressor(
    n_estimators=500,
    min_samples_leaf=10,
    random_state=123,
)
ml_m = RandomForestClassifier(
    n_estimators=500,
    min_samples_leaf=10,
    random_state=123,
)

irm = DoubleMLIRM(
    dml_data,
    ml_g=ml_g,
    ml_m=ml_m,
    n_folds=5,
    score="ATE",
)
irm.fit()

summary = irm.summary.reset_index().rename(columns={"index": "term"})
summary.to_csv(OUT / "doubleml_irm_summary.csv", index=False)
