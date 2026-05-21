"""Template: source-target covariate diagnostics."""

import pandas as pd

def standardized_difference(x_source, x_target):
    m1, m0 = x_source.mean(), x_target.mean()
    v1, v0 = x_source.var(), x_target.var()
    pooled = ((v1 + v0) / 2) ** 0.5
    return (m1 - m0) / pooled if pooled > 0 else float("nan")

selection_cols = ["age", "baseline_risk"]
source = stacked_source_target[stacked_source_target["S"] == 1]
target = stacked_source_target[stacked_source_target["S"] == 0]

rows = []
for col in selection_cols:
    rows.append({
        "variable": col,
        "source_mean": source[col].mean(),
        "target_mean": target[col].mean(),
        "std_diff": standardized_difference(source[col], target[col]),
    })

diagnostics = pd.DataFrame(rows)
print(diagnostics)

# Add categorical covariate summaries and overlap plots before reporting.
