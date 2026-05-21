"""Propensity score weighting, overlap, and simple balance diagnostics."""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

DATA = Path("analysis_dataset.csv")
OUT = Path("matching_weighting_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected columns:
# y: outcome
# a: treatment/exposure, 0/1
# x1, x2, x3: pre-treatment covariates

x_cols = ["x1", "x2", "x3"]
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000))
model.fit(df[x_cols], df["a"])
ps = model.predict_proba(df[x_cols])[:, 1].clip(0.01, 0.99)

df["ps"] = ps
df["w_ate"] = df["a"] / ps + (1 - df["a"]) / (1 - ps)
df["w_att"] = np.where(df["a"] == 1, 1.0, ps / (1 - ps))
df["w_overlap"] = np.where(df["a"] == 1, 1 - ps, ps)


def weighted_mean(x, w):
    return np.sum(x * w) / np.sum(w)


def weighted_var(x, w):
    mu = weighted_mean(x, w)
    return np.sum(w * (x - mu) ** 2) / np.sum(w)


def smd_table(weight_col=None):
    rows = []
    for col in x_cols:
        treated = df["a"] == 1
        if weight_col is None:
            mt = df.loc[treated, col].mean()
            mc = df.loc[~treated, col].mean()
            vt = df.loc[treated, col].var()
            vc = df.loc[~treated, col].var()
        else:
            mt = weighted_mean(df.loc[treated, col], df.loc[treated, weight_col])
            mc = weighted_mean(df.loc[~treated, col], df.loc[~treated, weight_col])
            vt = weighted_var(df.loc[treated, col], df.loc[treated, weight_col])
            vc = weighted_var(df.loc[~treated, col], df.loc[~treated, weight_col])
        pooled = np.sqrt((vt + vc) / 2)
        rows.append({"covariate": col, "smd": (mt - mc) / pooled if pooled > 0 else np.nan})
    return pd.DataFrame(rows)


balance = pd.concat(
    {
        "unweighted": smd_table(),
        "ate_weighted": smd_table("w_ate"),
        "overlap_weighted": smd_table("w_overlap"),
    },
    names=["diagnostic"],
).reset_index(level=0)

weight_summary = df[["w_ate", "w_att", "w_overlap"]].describe(percentiles=[0.01, 0.5, 0.99])
ess = pd.Series(
    {
        col: df[col].sum() ** 2 / (df[col] ** 2).sum()
        for col in ["w_ate", "w_att", "w_overlap"]
    },
    name="effective_sample_size",
)

balance.to_csv(OUT / "balance_smd_table.csv", index=False)
weight_summary.to_csv(OUT / "weight_summary.csv")
ess.to_csv(OUT / "effective_sample_size.csv")
