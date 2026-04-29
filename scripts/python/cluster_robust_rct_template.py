"""Root template: cluster-randomized experiment with cluster-robust SEs.

Expected dataframe columns:
    y, treatment, cluster_id
Optional:
    block, covariates
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf


def make_synthetic_data() -> pd.DataFrame:
    rng = np.random.default_rng(20260429)
    n_clusters = 50
    sizes = rng.integers(10, 40, n_clusters)
    cluster_id = np.repeat(np.arange(n_clusters), sizes)
    z_cluster = rng.binomial(1, 0.5, n_clusters)
    u_cluster = rng.normal(scale=1.0, size=n_clusters)
    df = pd.DataFrame({"cluster_id": cluster_id})
    df["treatment"] = z_cluster[df["cluster_id"].to_numpy()]
    df["x"] = rng.normal(size=len(df))
    df["y"] = 1 + 0.4 * df["treatment"] + 0.3 * df["x"] + u_cluster[df["cluster_id"].to_numpy()] + rng.normal(size=len(df))
    return df


def run_cluster_analysis(df: pd.DataFrame) -> None:
    print("\nClusters by arm")
    print(df.drop_duplicates("cluster_id")["treatment"].value_counts().sort_index())
    print("\nCluster size summary")
    print(df.groupby("cluster_id").size().describe())

    formula = "y ~ treatment"
    if "x" in df.columns:
        formula += " + x"
    if "block" in df.columns:
        formula += " + C(block)"

    fit = smf.ols(formula, data=df).fit(cov_type="cluster", cov_kwds={"groups": df["cluster_id"]})
    print("\nCluster-robust regression")
    print(fit.summary().tables[1])

    cluster_means = df.groupby(["cluster_id", "treatment"], as_index=False)["y"].mean()
    fit_cluster_level = smf.ols("y ~ treatment", data=cluster_means).fit(cov_type="HC2")
    print("\nCluster-level sensitivity")
    print(fit_cluster_level.summary().tables[1])


if __name__ == "__main__":
    run_cluster_analysis(make_synthetic_data())
