"""DirectLiNGAM baseline for linear non-Gaussian discovery.

Run:
  pip install lingam pandas numpy
  python python_lingam_direct.py data.csv

Use only when a linear acyclic non-Gaussian structural model is plausible.
Unique orientations come from those assumptions, not from data alone.
"""

import sys

import numpy as np
import pandas as pd
from lingam import DirectLiNGAM


def main(path: str) -> None:
    df = pd.read_csv(path)
    labels = list(df.columns)
    data = df.to_numpy()

    model = DirectLiNGAM()
    model.fit(data)

    adjacency = pd.DataFrame(model.adjacency_matrix_, index=labels, columns=labels)
    adjacency.to_csv("direct_lingam_adjacency.csv")
    np.save("direct_lingam_causal_order.npy", np.asarray(model.causal_order_))
    print("Causal order:", model.causal_order_)
    print(adjacency)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python python_lingam_direct.py data.csv")
    main(sys.argv[1])
