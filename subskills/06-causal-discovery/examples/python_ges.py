"""GES baseline with causal-learn for score-based graph exploration.

Run:
  pip install causal-learn pandas graphviz pydot
  python python_ges.py data.csv

Use this as a baseline, not as a final causal graph. Compare with PC/FCI
and route any framework or adjustment implication through method_lead.
"""

import sys

import pandas as pd
from causallearn.search.ScoreBased.GES import ges
from causallearn.utils.GraphUtils import GraphUtils


def main(path: str) -> None:
    df = pd.read_csv(path)
    labels = list(df.columns)
    data = df.to_numpy()

    record = ges(data, score_func="local_score_BIC")
    graph = record["G"]
    pyd = GraphUtils.to_pydot(graph, labels=labels)
    pyd.write_png("ges_graph.png")
    print(graph)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python python_ges.py data.csv")
    main(sys.argv[1])
