"""Network-dependent inference template.

Use after the exposure mapping and causal estimand are fixed. This example is a
benchmark for network-aware uncertainty, not a complete identification strategy.
"""

import networkinference as ni
import numpy as np
import pandas as pd


df = pd.read_csv("analysis_with_network_exposure.csv")
adjacency = pd.read_csv("adjacency_matrix.csv", header=None).to_numpy()

y = df["outcome"].to_numpy()
x = df[["treatment", "treated_neighbor_prop", "baseline_risk"]].to_numpy()
x = np.column_stack([np.ones(len(df)), x])

fit = ni.OLS(y, x, adjacency)
print(fit.network_se())
