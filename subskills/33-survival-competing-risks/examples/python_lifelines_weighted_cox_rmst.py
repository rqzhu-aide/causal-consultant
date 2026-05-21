"""Weighted Cox and RMST-style survival summary with lifelines.

This is a template for exploratory or report-support analysis. Causal validity
comes from the design route, adjustment/weighting plan, and diagnostics.
"""

from pathlib import Path

import numpy as np
import pandas as pd
from lifelines import CoxPHFitter, KaplanMeierFitter


DATA = Path("analysis_survival_dataset.csv")
TAU = 365.0

df = pd.read_csv(DATA)

# Required columns:
# time: follow-up time from valid time zero
# event: 1 event of interest, 0 censored
# a: treatment/exposure, coded 0/1
# weight: optional design/IPTW/transport weight

km_rows = []
for group, part in df.groupby("a"):
    km = KaplanMeierFitter()
    km.fit(part["time"], event_observed=part["event"], weights=part.get("weight"), label=f"a={group}")
    surv_at_tau = float(km.predict(TAU))
    timeline = km.survival_function_.index.to_numpy()
    survival = km.survival_function_.iloc[:, 0].to_numpy()
    rmst = float(np.trapz(survival[timeline <= TAU], timeline[timeline <= TAU]))
    km_rows.append({"a": group, "tau": TAU, "survival_at_tau": surv_at_tau, "rmst_approx": rmst})

cox_cols = ["time", "event", "a", "weight", "x1", "x2", "x3"]
cox_df = df[[col for col in cox_cols if col in df.columns]].copy()
cph = CoxPHFitter()
cph.fit(cox_df, duration_col="time", event_col="event", weights_col="weight", robust=True)

pd.DataFrame(km_rows).to_csv("lifelines_weighted_survival_rmst.csv", index=False)
cph.summary.to_csv("lifelines_weighted_cox_summary.csv")
