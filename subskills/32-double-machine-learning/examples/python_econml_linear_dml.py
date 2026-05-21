"""EconML LinearDML template."""

from pathlib import Path

import pandas as pd
from econml.dml import LinearDML
from sklearn.ensemble import RandomForestRegressor

DATA = Path("analysis_dataset.csv")
OUT = Path("dml_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# y: outcome
# a: treatment/exposure
# x1, x2, x3: approved pre-treatment covariates

x_cols = ["x1", "x2", "x3"]
est = LinearDML(
    model_y=RandomForestRegressor(n_estimators=500, min_samples_leaf=10, random_state=123),
    model_t=RandomForestRegressor(n_estimators=500, min_samples_leaf=10, random_state=123),
    discrete_treatment=False,
    cv=5,
    random_state=123,
)

est.fit(Y=df["y"], T=df["a"], X=df[x_cols])
interval = est.effect_interval(df[x_cols])
effects = est.effect(df[x_cols])

pd.Series(
    {
        "mean_effect": effects.mean(),
        "effect_sd": effects.std(),
        "mean_ci_low": interval[0].mean(),
        "mean_ci_high": interval[1].mean(),
    }
).to_csv(OUT / "econml_linear_dml_summary.csv")
