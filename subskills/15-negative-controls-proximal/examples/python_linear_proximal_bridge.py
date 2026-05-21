"""Linear proximal outcome-bridge sketch with linearmodels.

This is a transparent benchmark, not a general proximal estimator.
"""

import pandas as pd
from linearmodels.iv import IV2SLS


df = pd.read_csv("analysis_dataset.csv")

# Roles:
# treatment = A, outcome = Y, outcome_proxy = W, treatment_proxy = Z,
# measured covariates = X.
fit = IV2SLS.from_formula(
    "outcome ~ 1 + treatment + age + baseline_risk + "
    "[outcome_proxy ~ treatment_proxy]",
    data=df,
).fit(cov_type="robust")

print(fit.summary)
print({"proximal_linear_bridge_treatment_coef": fit.params["treatment"]})
