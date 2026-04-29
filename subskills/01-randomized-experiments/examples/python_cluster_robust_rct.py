"""Cluster-randomized experiment in Python with cluster-robust inference.

Runnable synthetic example.

Required packages:
    pip install pandas numpy scipy statsmodels
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf


def main() -> None:
    rng = np.random.default_rng(20260429)
    n_clusters = 80
    cluster_sizes = rng.integers(15, 60, size=n_clusters)
    cluster_id = np.repeat(np.arange(n_clusters), cluster_sizes)

    cluster_df = pd.DataFrame(
        {
            "cluster_id": np.arange(n_clusters),
            "block": rng.choice(list("ABCD"), size=n_clusters),
            "cluster_x": rng.normal(size=n_clusters),
        }
    )

    # Within each block, assign approximately half of clusters to treatment.
    z_by_cluster = []
    for _, sub in cluster_df.groupby("block"):
        ids = sub["cluster_id"].to_numpy()
        treated = rng.choice(ids, size=len(ids) // 2, replace=False)
        z_by_cluster.extend([(cid, int(cid in treated)) for cid in ids])
    z_map = dict(z_by_cluster)
    cluster_df["treatment"] = cluster_df["cluster_id"].map(z_map)

    df = pd.DataFrame({"unit_id": np.arange(len(cluster_id)), "cluster_id": cluster_id})
    df = df.merge(cluster_df, on="cluster_id", how="left")
    df["x"] = rng.normal(size=len(df))
    cluster_effect = rng.normal(scale=0.8, size=n_clusters)
    df["y"] = (
        1
        + 0.5 * df["treatment"]
        + 0.25 * df["x"]
        + 0.4 * df["cluster_x"]
        + cluster_effect[df["cluster_id"].to_numpy()]
        + rng.normal(size=len(df))
    )

    print("\nClusters by treatment arm")
    print(cluster_df["treatment"].value_counts().sort_index())
    print("\nIndividuals by treatment arm")
    print(df["treatment"].value_counts().sort_index())
    print("\nCluster size summary")
    print(pd.Series(cluster_sizes).describe())

    naive = smf.ols("y ~ treatment + x + cluster_x", data=df).fit(cov_type="HC2")
    clustered = smf.ols("y ~ treatment + x + cluster_x", data=df).fit(
        cov_type="cluster", cov_kwds={"groups": df["cluster_id"]}
    )
    blocked_clustered = smf.ols("y ~ treatment + x + cluster_x + C(block)", data=df).fit(
        cov_type="cluster", cov_kwds={"groups": df["cluster_id"]}
    )

    print("\nTreatment coefficient comparison")
    comparison = pd.DataFrame(
        {
            "model": ["naive_HC2", "cluster_robust", "block_FE_cluster_robust"],
            "estimate": [naive.params["treatment"], clustered.params["treatment"], blocked_clustered.params["treatment"]],
            "std_error": [naive.bse["treatment"], clustered.bse["treatment"], blocked_clustered.bse["treatment"]],
            "p_value": [naive.pvalues["treatment"], clustered.pvalues["treatment"], blocked_clustered.pvalues["treatment"]],
        }
    )
    print(comparison)

    # Cluster-level sensitivity: one row per randomized cluster.
    cluster_means = df.groupby(["cluster_id", "treatment", "block", "cluster_x"], as_index=False)["y"].mean()
    cluster_level = smf.ols("y ~ treatment + cluster_x + C(block)", data=cluster_means).fit(cov_type="HC2")
    print("\nCluster-level sensitivity treatment effect")
    print(
        {
            "estimate": float(cluster_level.params["treatment"]),
            "std_error": float(cluster_level.bse["treatment"]),
            "p_value": float(cluster_level.pvalues["treatment"]),
        }
    )

    print("\nInterpretation reminder")
    print("If clusters were randomized, cluster-aware inference is required; individual rows are not independent assignment units.")


if __name__ == "__main__":
    main()
