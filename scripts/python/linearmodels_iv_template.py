#!/usr/bin/env python3
"""scripts/python/linearmodels_iv_template.py

Reusable template for instrumental variables with Python linearmodels.

Replace variable names:
    Y: outcome
    D: endogenous treatment/exposure
    Z: excluded instrument
    X1, X2: exogenous pre-treatment covariates

Install manually if needed:
    pip install linearmodels statsmodels pandas numpy
"""

from __future__ import annotations

from typing import Iterable
import numpy as np
import pandas as pd


def require_packages(packages: Iterable[str]) -> None:
    missing = []
    for pkg in packages:
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)
    if missing:
        raise SystemExit(
            "Missing packages: "
            + ", ".join(missing)
            + "\nInstall with: pip install "
            + " ".join(missing)
        )


require_packages(["linearmodels", "statsmodels", "pandas", "numpy"])

from linearmodels.iv import IV2SLS, IVLIML, IVGMM
import statsmodels.formula.api as smf


# ----------------------------------------------------------------------
# USER INPUT SECTION
# ----------------------------------------------------------------------
# df = pd.read_csv("your_data.csv")
# Required columns: Y, D, Z, X1, X2

if "df" not in globals():
    rng = np.random.default_rng(202609)
    n = 1000
    x1 = rng.normal(size=n)
    x2 = rng.binomial(1, 0.4, size=n)
    z = rng.binomial(1, 1 / (1 + np.exp(-(0.1 * x1 - 0.1 * x2))), size=n)
    u = rng.normal(size=n)
    d = 0.8 * z + 0.6 * x1 - 0.2 * x2 + 0.8 * u + rng.normal(size=n)
    y = 1.5 * d + 0.7 * x1 - 0.3 * x2 + u + rng.normal(size=n)
    df = pd.DataFrame({"Y": y, "D": d, "Z": z, "X1": x1, "X2": x2})

outcome = "Y"
treatment = "D"
instrument = "Z"
covariates = ["X1", "X2"]
cluster = None  # e.g., "cluster_id"

analysis_cols = [outcome, treatment, instrument] + covariates + ([cluster] if cluster else [])
df_iv = df.dropna(subset=analysis_cols).copy()
print(f"Analysis N: {len(df_iv)}\n")

# ----------------------------------------------------------------------
# First stage and reduced form.
# ----------------------------------------------------------------------
cov_rhs = " + ".join(covariates)
first_stage_formula = f"{treatment} ~ {instrument} + {cov_rhs}"
reduced_form_formula = f"{outcome} ~ {instrument} + {cov_rhs}"

first_stage = smf.ols(first_stage_formula, data=df_iv).fit(cov_type="HC1")
reduced_form = smf.ols(reduced_form_formula, data=df_iv).fit(cov_type="HC1")

print("First stage:")
print(first_stage.summary().tables[1])
fs_coef = first_stage.params[instrument]
fs_f_like = first_stage.tvalues[instrument] ** 2
print(f"Robust first-stage F-like statistic for one excluded instrument: {fs_f_like:.2f}\n")

print("Reduced form:")
print(reduced_form.summary().tables[1])
rf_coef = reduced_form.params[instrument]
print(f"Wald ratio, reduced form / first stage: {rf_coef / fs_coef:.4f}\n")

# ----------------------------------------------------------------------
# IV2SLS model.
# Formula syntax:
#   Y ~ 1 + X1 + X2 + [D ~ Z]
# ----------------------------------------------------------------------
iv_formula = f"{outcome} ~ 1 + {cov_rhs} + [{treatment} ~ {instrument}]"
iv_mod = IV2SLS.from_formula(iv_formula, data=df_iv)

if cluster is None:
    iv_res = iv_mod.fit(cov_type="robust")
else:
    iv_res = iv_mod.fit(cov_type="clustered", clusters=df_iv[cluster])

print("IV2SLS result:")
print(iv_res.summary)
print()

print("First-stage diagnostics:")
print(iv_res.first_stage)
print(iv_res.first_stage.diagnostics)
print()

print("Wu-Hausman endogeneity test; this does not validate the instrument:")
print(iv_res.wu_hausman())
print()

# Optional LIML comparison when multiple instruments are available.
# liml_res = IVLIML.from_formula(iv_formula, data=df_iv).fit(cov_type="robust")
# print(liml_res.summary)

print("Interpretation reminder:")
print("State relevance, independence, exclusion, and monotonicity/constant-effect assumptions.")
print("Report the estimate as LATE/CACE when using binary instrument/binary treatment unless stronger assumptions justify ATE language.")
