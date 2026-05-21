"""Sharp RD with the official Python rdrobust package.

Replace column names and paths before use.
"""

import pandas as pd
from rdrobust import rdbwselect, rdplot, rdrobust


df = pd.read_csv("analysis_dataset.csv")
y = df["outcome"]
x = df["running_variable"]
cutoff = 0

fit = rdrobust(y=y, x=x, c=cutoff)
print(fit)

bw = rdbwselect(y=y, x=x, c=cutoff)
print(bw)

rdplot(y=y, x=x, c=cutoff)
