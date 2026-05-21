"""Weight diagnostics for longitudinal IPW analyses."""

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

DATA = Path("longitudinal_person_time_with_weights.csv")
OUT = Path("longitudinal_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected columns:
# id, time, sw, optional sw_trunc

weight_col = "sw_trunc" if "sw_trunc" in df.columns else "sw"

summary = df.groupby("time")[weight_col].describe(percentiles=[0.01, 0.05, 0.5, 0.95, 0.99])
summary.to_csv(OUT / "weights_by_time_summary.csv")

effective_n = (
    df.groupby("time")[weight_col]
    .apply(lambda w: (w.sum() ** 2) / (w.pow(2).sum()))
    .rename("effective_sample_size")
)
effective_n.to_csv(OUT / "weights_effective_sample_size.csv")

for time_value, part in df.groupby("time"):
    plt.hist(part[weight_col].dropna(), bins=40, alpha=0.6, label=f"time {time_value}")
plt.xlabel(weight_col)
plt.ylabel("Rows")
plt.legend()
plt.tight_layout()
plt.savefig(OUT / "weights_by_time_histogram.png", dpi=300)
