"""Longitudinal MSM/IPW prototype with treatment and censoring weights.

Replace paths and variable names before use.
"""

from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf
from sklearn.linear_model import LogisticRegression

DATA = Path("longitudinal_person_time.csv")
OUT = Path("longitudinal_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA).sort_values(["id", "time"]).copy()

# Expected long-format columns:
# id, time, a, y, censored, l1, l2, baseline_x

for col in ["a", "l1", "l2"]:
    df[f"lag_{col}"] = df.groupby("id")[col].shift(1)
df[["lag_a", "lag_l1", "lag_l2"]] = df[["lag_a", "lag_l1", "lag_l2"]].fillna(0)


def fit_prob(outcome, features):
    model = LogisticRegression(max_iter=2000)
    model.fit(df[features], df[outcome])
    return model.predict_proba(df[features])[:, 1].clip(0.01, 0.99)


den_treat = fit_prob("a", ["baseline_x", "lag_a", "l1", "l2", "lag_l1", "lag_l2"])
num_treat = fit_prob("a", ["baseline_x", "lag_a"])

den_cens = fit_prob("censored", ["baseline_x", "lag_a", "l1", "l2", "lag_l1", "lag_l2"])
num_cens = fit_prob("censored", ["baseline_x", "lag_a"])

df["w_treat"] = np.where(df["a"] == 1, num_treat / den_treat, (1 - num_treat) / (1 - den_treat))
df["w_cens"] = np.where(
    df["censored"] == 1,
    num_cens / den_cens,
    (1 - num_cens) / (1 - den_cens),
)
df["sw"] = df.groupby("id")["w_treat"].cumprod() * df.groupby("id")["w_cens"].cumprod()
upper = df["sw"].quantile(0.99)
df["sw_trunc"] = df["sw"].clip(upper=upper)

msm = smf.wls("y ~ a + time + lag_a", data=df, weights=df["sw_trunc"]).fit(
    cov_type="cluster",
    cov_kwds={"groups": df["id"]},
)

weight_summary = df["sw"].describe(percentiles=[0.01, 0.5, 0.99])
weight_summary.to_csv(OUT / "ipw_weight_summary.csv")
pd.DataFrame(
    {
        "term": msm.params.index,
        "estimate": msm.params.values,
        "std_error": msm.bse.values,
        "p_value": msm.pvalues.values,
    }
).to_csv(OUT / "weighted_msm_summary.csv", index=False)
