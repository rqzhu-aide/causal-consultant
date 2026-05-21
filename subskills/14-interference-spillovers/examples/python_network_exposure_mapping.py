"""Construct simple network exposure variables in Python.

Replace paths and column names before use.
"""

import networkx as nx
import pandas as pd


nodes = pd.read_csv("units.csv")
edges = pd.read_csv("edges.csv")

graph = nx.from_pandas_edgelist(edges, source="source_id", target="target_id")
treatment = nodes.set_index("unit_id")["treatment"].to_dict()

records = []
for unit_id in nodes["unit_id"]:
    neighbors = list(graph.neighbors(unit_id)) if unit_id in graph else []
    treated_count = sum(treatment.get(neighbor, 0) == 1 for neighbor in neighbors)
    degree = len(neighbors)
    treated_prop = treated_count / degree if degree else 0.0
    records.append(
        {
            "unit_id": unit_id,
            "degree": degree,
            "treated_neighbor_count": treated_count,
            "treated_neighbor_prop": treated_prop,
        }
    )

exposure = pd.DataFrame.from_records(records)
analysis = nodes.merge(exposure, on="unit_id", how="left")
analysis["peer_exposure_bin"] = pd.cut(
    analysis["treated_neighbor_prop"],
    bins=[-0.01, 0, 0.25, 0.5, 1],
)

print(analysis.groupby(["treatment", "peer_exposure_bin"], observed=True).size())
analysis.to_csv("analysis_with_network_exposure.csv", index=False)
