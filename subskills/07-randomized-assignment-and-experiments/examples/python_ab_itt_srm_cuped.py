"""A/B test checks: SRM, ITT, and simple CUPED adjustment.

Replace paths and variable names before use.
"""

from pathlib import Path

import numpy as np
import pandas as pd
import scipy.stats as st
import statsmodels.formula.api as smf

DATA = Path("analysis_dataset.csv")
OUT = Path("experiment_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected columns:
# y: outcome
# z: randomized assignment, 0/1
# y_pre: pre-period outcome or highly predictive pre-treatment metric
# cluster_id: optional cluster identifier

counts = df["z"].value_counts().sort_index()
expected = np.repeat(len(df) / len(counts), len(counts))
srm_stat = ((counts.to_numpy() - expected) ** 2 / expected).sum()
srm_p = st.chi2.sf(srm_stat, df=len(counts) - 1)

itt = smf.ols("y ~ z", data=df).fit(cov_type="HC1")

if "y_pre" in df.columns:
    theta = np.cov(df["y"], df["y_pre"], ddof=1)[0, 1] / np.var(df["y_pre"], ddof=1)
    df["y_cuped"] = df["y"] - theta * (df["y_pre"] - df["y_pre"].mean())
    cuped = smf.ols("y_cuped ~ z", data=df).fit(cov_type="HC1")
else:
    cuped = None

pd.DataFrame(
    {
        "assigned_arm": counts.index,
        "n": counts.to_numpy(),
        "expected_equal_allocation": expected,
    }
).to_csv(OUT / "srm_counts.csv", index=False)

summary = {
    "srm_chisq": float(srm_stat),
    "srm_p_value": float(srm_p),
    "itt_effect": float(itt.params["z"]),
    "itt_se": float(itt.bse["z"]),
}
if cuped is not None:
    summary.update(
        {
            "cuped_effect": float(cuped.params["z"]),
            "cuped_se": float(cuped.bse["z"]),
        }
    )

pd.Series(summary).to_csv(OUT / "experiment_summary.csv")
