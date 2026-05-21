"""Cluster-robust ITT estimate for clustered or dependent experiment data."""

from pathlib import Path

import pandas as pd
import statsmodels.formula.api as smf

DATA = Path("analysis_dataset.csv")
OUT = Path("experiment_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected columns:
# y: outcome
# z: randomized assignment, 0/1
# cluster_id: cluster used for assignment or dependence
# strata: optional randomization block/stratum
# x1, x2: pre-treatment covariates

model = smf.ols("y ~ z * (x1 + x2) + C(strata)", data=df).fit(
    cov_type="cluster",
    cov_kwds={"groups": df["cluster_id"]},
)

result = pd.DataFrame(
    {
        "term": model.params.index,
        "estimate": model.params.values,
        "std_error": model.bse.values,
        "p_value": model.pvalues.values,
    }
)
result.to_csv(OUT / "cluster_robust_itt.csv", index=False)
