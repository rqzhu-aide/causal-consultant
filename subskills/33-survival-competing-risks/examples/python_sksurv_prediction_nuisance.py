"""Random survival forest as prediction or nuisance-model support.

Use this as a regression analog inside a causal workflow only when the design
route already identifies the target and leakage/timing checks have passed.
"""

from pathlib import Path

import pandas as pd
from sksurv.ensemble import RandomSurvivalForest
from sksurv.metrics import concordance_index_censored
from sksurv.util import Surv


DATA = Path("analysis_survival_dataset.csv")

df = pd.read_csv(DATA)

# Required columns:
# time: follow-up time from valid time zero
# event: 1 event of interest, 0 censored
# x1, x2, x3: approved pre-treatment covariates

features = ["x1", "x2", "x3"]
x = df[features]
y = Surv.from_arrays(event=df["event"].astype(bool), time=df["time"].astype(float))

rsf = RandomSurvivalForest(
    n_estimators=500,
    min_samples_split=20,
    min_samples_leaf=10,
    random_state=123,
    n_jobs=-1,
)
rsf.fit(x, y)

risk_score = rsf.predict(x)
cindex = concordance_index_censored(y["event"], y["time"], risk_score)

pd.DataFrame({"id": df.get("id", df.index), "risk_score": risk_score}).to_csv(
    "sksurv_random_survival_forest_scores.csv",
    index=False,
)
pd.DataFrame([{"c_index": cindex[0]}]).to_csv("sksurv_prediction_diagnostics.csv", index=False)
