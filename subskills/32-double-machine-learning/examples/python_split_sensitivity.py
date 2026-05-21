"""Repeated split sensitivity skeleton for DML-style estimators."""

from pathlib import Path

import pandas as pd
from doubleml import DoubleMLData, DoubleMLIRM
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

DATA = Path("analysis_dataset.csv")
OUT = Path("dml_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)
x_cols = ["x1", "x2", "x3"]
dml_data = DoubleMLData(df, y_col="y", d_cols="a", x_cols=x_cols)

rows = []
for seed in range(10):
    ml_g = RandomForestRegressor(n_estimators=300, min_samples_leaf=10, random_state=seed)
    ml_m = RandomForestClassifier(n_estimators=300, min_samples_leaf=10, random_state=seed)
    irm = DoubleMLIRM(dml_data, ml_g=ml_g, ml_m=ml_m, n_folds=5, score="ATE")
    irm.fit()
    summary = irm.summary.iloc[0]
    rows.append(
        {
            "seed": seed,
            "estimate": summary["coef"],
            "std_error": summary["std err"],
            "p_value": summary["P>|t|"],
        }
    )

pd.DataFrame(rows).to_csv(OUT / "dml_repeated_split_sensitivity.csv", index=False)
