"""Sequential-regression skeleton for two treatment times.

This is a transparent prototype for design learning, not a full production estimator.
"""

from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestRegressor

DATA = Path("longitudinal_wide.csv")
OUT = Path("longitudinal_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected wide-format columns:
# baseline_x, a_0, l1_1, l2_1, a_1, l1_2, l2_2, y

features_t1 = ["baseline_x", "a_0", "l1_1", "l2_1", "a_1", "l1_2", "l2_2"]
q2 = RandomForestRegressor(n_estimators=300, min_samples_leaf=10, random_state=123)
q2.fit(df[features_t1], df["y"])

def predict_strategy(a0, a1):
    strategy_df = df.copy()
    strategy_df["a_0"] = a0
    strategy_df["a_1"] = a1
    return q2.predict(strategy_df[features_t1]).mean()

results = pd.DataFrame(
    {
        "strategy": ["always_treat", "never_treat"],
        "mean_outcome": [predict_strategy(1, 1), predict_strategy(0, 0)],
    }
)
results["contrast_vs_never"] = results["mean_outcome"] - results.loc[
    results["strategy"] == "never_treat", "mean_outcome"
].iloc[0]

results.to_csv(OUT / "sequential_regression_strategy_means.csv", index=False)
