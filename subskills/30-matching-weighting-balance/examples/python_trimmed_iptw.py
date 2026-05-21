"""Trimmed IPTW analysis skeleton for weak overlap."""

from pathlib import Path

import pandas as pd
import statsmodels.formula.api as smf

DATA = Path("analysis_dataset_with_weights.csv")
OUT = Path("matching_weighting_outputs")
OUT.mkdir(exist_ok=True)

df = pd.read_csv(DATA)

# Expected columns:
# y: outcome
# a: treatment/exposure, 0/1
# ps: propensity score

trimmed = df.query("ps >= 0.05 and ps <= 0.95").copy()
trimmed["w_ate"] = trimmed["a"] / trimmed["ps"] + (1 - trimmed["a"]) / (1 - trimmed["ps"])
trimmed["w_ate_trunc"] = trimmed["w_ate"].clip(upper=trimmed["w_ate"].quantile(0.99))

fit = smf.wls("y ~ a", data=trimmed, weights=trimmed["w_ate_trunc"]).fit(cov_type="HC1")

pd.Series(
    {
        "n_original": len(df),
        "n_trimmed": len(trimmed),
        "effective_n": trimmed["w_ate_trunc"].sum() ** 2 / (trimmed["w_ate_trunc"] ** 2).sum(),
        "effect": fit.params["a"],
        "std_error": fit.bse["a"],
        "p_value": fit.pvalues["a"],
    }
).to_csv(OUT / "trimmed_iptw_summary.csv")
