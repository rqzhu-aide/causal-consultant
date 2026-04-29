"""Causal discovery template using causal-learn FCI algorithm.

Use when hidden confounders are possible. Returns a PAG.

Install:
  pip install causal-learn pandas graphviz pydot

Usage:
  python causal_learn_fci_template.py data.csv
"""

import sys
import pandas as pd
from causallearn.search.ConstraintBased.FCI import fci
from causallearn.utils.GraphUtils import GraphUtils


def main(path: str) -> None:
    df = pd.read_csv(path)
    labels = list(df.columns)
    data = df.to_numpy()

    graph, edges = fci(data, independence_test_method="fisherz", alpha=0.05, verbose=True)
    pyd = GraphUtils.to_pydot(graph, labels=labels)
    pyd.write_png("fci_pag.png")
    print(graph)
    print(edges)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python causal_learn_fci_template.py data.csv")
    main(sys.argv[1])

# Interpret as a PAG under assumptions. Circle marks indicate uncertainty about endpoint orientation.
