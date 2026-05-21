"""Simple TWFE/event-study benchmark with statsmodels.

Use this as a benchmark or diagnostic. For staggered adoption with heterogeneous
effects, prefer modern DiD estimators and label this output carefully.
"""

from pathlib import Path

import pandas as pd
import statsmodels.formula.api as smf


DATA = Path("analysis_did_panel.csv")
df = pd.read_csv(DATA)

# Required columns:
# id: unit id
# time: time period
# y: outcome
# treated: treatment indicator
# post: post-treatment indicator for simple DiD, if applicable
# cluster_id: clustering unit

if "did" not in df.columns and {"treated", "post"}.issubset(df.columns):
    df["did"] = df["treated"] * df["post"]

model = smf.ols("y ~ did + C(id) + C(time)", data=df)
fit = model.fit(cov_type="cluster", cov_kwds={"groups": df["cluster_id"] if "cluster_id" in df else df["id"]})

fit.summary2().tables[1].to_csv("python_twfe_benchmark_summary.csv")
with open("python_twfe_benchmark.txt", "w", encoding="utf-8") as f:
    f.write(str(fit.summary()))
