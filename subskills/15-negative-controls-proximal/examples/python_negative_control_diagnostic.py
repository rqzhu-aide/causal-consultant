"""Negative control outcome diagnostic using the primary adjustment strategy."""

import pandas as pd
import statsmodels.formula.api as smf


df = pd.read_csv("analysis_dataset.csv")

primary = smf.ols(
    "primary_outcome ~ treatment + age + baseline_risk + prior_utilization",
    data=df,
).fit(cov_type="HC1")

negative_control = smf.ols(
    "negative_control_outcome ~ treatment + age + baseline_risk + prior_utilization",
    data=df,
).fit(cov_type="HC1")

summary = pd.DataFrame(
    {
        "model": ["primary_outcome", "negative_control_outcome"],
        "estimate": [
            primary.params["treatment"],
            negative_control.params["treatment"],
        ],
        "se": [
            primary.bse["treatment"],
            negative_control.bse["treatment"],
        ],
        "p_value": [
            primary.pvalues["treatment"],
            negative_control.pvalues["treatment"],
        ],
    }
)

print(summary)
summary.to_csv("negative_control_outcome_diagnostic.csv", index=False)
