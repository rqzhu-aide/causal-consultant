"""Causal discovery template using causal-learn PC algorithm.

Install:
  pip install causal-learn pandas graphviz pydot

Usage:
  python causal_learn_pc_template.py data.csv
"""

import sys
import pandas as pd
from causallearn.search.ConstraintBased.PC import pc
from causallearn.utils.GraphUtils import GraphUtils


def main(path: str) -> None:
    df = pd.read_csv(path)
    labels = list(df.columns)
    data = df.to_numpy()

    cg = pc(data, alpha=0.05, indep_test="fisherz", stable=True, show_progress=True)
    pyd = GraphUtils.to_pydot(cg.G, labels=labels)
    pyd.write_png("pc_graph.png")
    print(cg.G)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python causal_learn_pc_template.py data.csv")
    main(sys.argv[1])

# Interpret as an equivalence-class result under assumptions, not proof of a unique causal graph.
