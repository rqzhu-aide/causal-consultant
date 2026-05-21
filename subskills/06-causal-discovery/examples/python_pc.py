"""PC baseline with causal-learn.

Run:
  pip install causal-learn pandas graphviz pydot
  python python_pc.py data.csv
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
        raise SystemExit("Usage: python python_pc.py data.csv")
    main(sys.argv[1])
