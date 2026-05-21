"""EconML DRLearner template for a binary treatment."""

from pathlib import Path

import pandas as pd
from econml.dr import DRLearner
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

DATA = Path("analysis_dataset.csv")
OUT = Path("doubly_robust_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: approved pre-treatment confounders

x_cols = ["x1", "x2", "x3"]

est = DRLearner(
    model_propensity=RandomForestClassifier(n_estimators=300, min_samples_leaf=10, random_state=123),
    model_regression=RandomForestRegressor(n_estimators=300, min_samples_leaf=10, random_state=123),
    model_final=RandomForestRegressor(n_estimators=300, min_samples_leaf=10, random_state=123),
    cv=5,
    random_state=123,
)

est.fit(Y=df["y"], T=df["a"], X=df[x_cols])
effects = est.effect(df[x_cols])

pd.Series(
    {
        "mean_effect": effects.mean(),
        "effect_sd": effects.std(),
        "effect_p05": pd.Series(effects).quantile(0.05),
        "effect_p95": pd.Series(effects).quantile(0.95),
    }
).to_csv(OUT / "econml_drlearner_effect_summary.csv")
