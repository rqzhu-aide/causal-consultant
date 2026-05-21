"""2SLS instrumental variables with linearmodels.

Use after the IV assumptions and local estimand have been reviewed.
"""

from pathlib import Path

import pandas as pd
from linearmodels.iv import IV2SLS


DATA = Path("analysis_iv_dataset.csv")
df = pd.read_csv(DATA)

# Required columns:
# y: outcome
# d: endogenous treatment/exposure
# z: instrument
# x1, x2: valid covariates
# cluster_id: optional clustering unit

model = IV2SLS.from_formula("y ~ 1 + x1 + x2 + [d ~ z]", data=df)

if "cluster_id" in df.columns:
    fit = model.fit(cov_type="clustered", clusters=df["cluster_id"])
else:
    fit = model.fit(cov_type="robust")

with open("linearmodels_iv2sls_summary.txt", "w", encoding="utf-8") as f:
    f.write(str(fit.summary))

fit.params.to_csv("linearmodels_iv2sls_params.csv")
