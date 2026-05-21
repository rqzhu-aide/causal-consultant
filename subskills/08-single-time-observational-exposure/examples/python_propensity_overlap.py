"""Propensity score overlap and IPTW diagnostic prototype."""

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

DATA = Path("analysis_dataset.csv")
OUT = Path("observational_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected columns:
# a: exposure/treatment, 0/1
# x1, x2, x3: baseline confounders

x_cols = ["x1", "x2", "x3"]
model = make_pipeline(
    StandardScaler(),
    LogisticRegression(max_iter=2000),
)
model.fit(df[x_cols], df["a"])
ps = model.predict_proba(df[x_cols])[:, 1]
ps = ps.clip(0.01, 0.99)

df["propensity_score"] = ps
df["iptw_ate"] = df["a"] / ps + (1 - df["a"]) / (1 - ps)

df.groupby("a")["propensity_score"].plot(kind="hist", bins=30, alpha=0.45, legend=True)
plt.xlabel("Estimated propensity score")
plt.ylabel("Count")
plt.tight_layout()
plt.savefig(OUT / "propensity_overlap_hist.png", dpi=300)

diagnostics = df.groupby("a").agg(
    n=("a", "size"),
    ps_min=("propensity_score", "min"),
    ps_p05=("propensity_score", lambda x: x.quantile(0.05)),
    ps_median=("propensity_score", "median"),
    ps_p95=("propensity_score", lambda x: x.quantile(0.95)),
    ps_max=("propensity_score", "max"),
    max_iptw=("iptw_ate", "max"),
)
diagnostics.to_csv(OUT / "propensity_overlap_diagnostics.csv")
