"""Transparent local-linear RD benchmark with statsmodels.

This is not a replacement for rdrobust-style bandwidth selection and robust
bias-corrected inference. Use it as a diagnostic or sensitivity benchmark.
"""

import pandas as pd
import statsmodels.formula.api as smf


df = pd.read_csv("analysis_dataset.csv")
cutoff = 0
bandwidth = 5

local = df.loc[(df["running_variable"] - cutoff).abs() <= bandwidth].copy()
local["running_centered"] = local["running_variable"] - cutoff
local["above_cutoff"] = (local["running_centered"] >= 0).astype(int)
local["interaction"] = local["above_cutoff"] * local["running_centered"]

model = smf.ols(
    "outcome ~ above_cutoff + running_centered + interaction",
    data=local,
).fit(cov_type="HC1")

print(model.summary())
