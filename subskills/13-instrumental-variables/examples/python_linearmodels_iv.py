#!/usr/bin/env python3
"""python_linearmodels_iv.py

Self-contained instrumental-variables example using linearmodels.

What this script demonstrates:
    1. simulated data with endogenous treatment D and excluded instrument Z
    2. OLS association, first stage, reduced form, and IV2SLS
    3. first-stage diagnostics from linearmodels
    4. robust covariance
    5. overidentification diagnostics when a second instrument is added
    6. covariate-balance and placebo-outcome checks

Install manually if needed:
    pip install linearmodels statsmodels pandas numpy
"""

from __future__ import annotations

import sys
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

from linearmodels.iv import IV2SLS, IVLIML
import statsmodels.formula.api as smf


def main() -> None:
    rng = np.random.default_rng(202605)

    # ------------------------------------------------------------------
    # 1. Synthetic data: Z affects D; unobserved U confounds D and Y.
    # ------------------------------------------------------------------
    n = 2500
    x1 = rng.normal(size=n)
    x2 = rng.binomial(1, 0.45, size=n)

    p_z = 1 / (1 + np.exp(-(0.10 * x1 - 0.20 * x2)))
    z = rng.binomial(1, p_z, size=n)

    # A second valid instrument for the overidentified example.
    z2 = rng.normal(size=n)

    u = rng.normal(size=n)

    d = 0.85 * z + 0.35 * z2 + 0.60 * x1 - 0.35 * x2 + 0.90 * u + rng.normal(size=n)

    # True causal effect of D is beta = 2.0.
    y = 2.00 * d + 0.80 * x1 - 0.40 * x2 + 1.10 * u + rng.normal(size=n)

    placebo_y = 0.50 * x1 - 0.20 * x2 + rng.normal(size=n)

    df = pd.DataFrame({"Y": y, "D": d, "Z": z, "Z2": z2, "X1": x1, "X2": x2, "placebo_y": placebo_y})
    df = df.dropna(subset=["Y", "D", "Z", "Z2", "X1", "X2", "placebo_y"]).copy()

    print(f"Analysis N: {len(df)}\n")

    # ------------------------------------------------------------------
    # 2. Naive OLS association. This is biased here because D is endogenous.
    # ------------------------------------------------------------------
    ols = smf.ols("Y ~ D + X1 + X2", data=df).fit(cov_type="HC1")
    print("Naive OLS with HC1 robust SEs; not causal here because D is endogenous:")
    print(ols.summary().tables[1])
    print()

    # ------------------------------------------------------------------
    # 3. First stage and reduced form using statsmodels for transparent output.
    # ------------------------------------------------------------------
    first_stage = smf.ols("D ~ Z + X1 + X2", data=df).fit(cov_type="HC1")
    reduced_form = smf.ols("Y ~ Z + X1 + X2", data=df).fit(cov_type="HC1")

    print("First stage D ~ Z + X1 + X2:")
    print(first_stage.summary().tables[1])
    fs_coef = first_stage.params["Z"]
    fs_t = first_stage.tvalues["Z"]
    print(f"First-stage coefficient on Z: {fs_coef:.4f}")
    print(f"Robust first-stage F-like statistic for one instrument (t^2): {fs_t ** 2:.2f}\n")

    print("Reduced form Y ~ Z + X1 + X2:")
    print(reduced_form.summary().tables[1])
    rf_coef = reduced_form.params["Z"]
    print(f"Reduced-form coefficient on Z: {rf_coef:.4f}")
    print(f"Wald ratio, reduced form / first stage: {rf_coef / fs_coef:.4f}\n")

    # ------------------------------------------------------------------
    # 4. IV2SLS with one excluded instrument.
    # Formula syntax:
    #   Y ~ 1 + exogenous_controls + [endogenous_treatment ~ excluded_instrument]
    # ------------------------------------------------------------------
    iv_mod = IV2SLS.from_formula("Y ~ 1 + X1 + X2 + [D ~ Z]", data=df)
    iv_res = iv_mod.fit(cov_type="robust")

    print("IV2SLS with one excluded instrument and robust covariance:")
    print(iv_res.summary)
    print()

    print("linearmodels first-stage summary:")
    print(iv_res.first_stage)
    print()

    print("linearmodels first-stage diagnostics DataFrame:")
    print(iv_res.first_stage.diagnostics)
    print()

    # In robust settings, linearmodels often reports a chi-square Wald statistic.
    diag = iv_res.first_stage.diagnostics
    stat = float(diag.loc["D", "f.stat"])
    dist = str(diag.loc["D", "f.dist"])
    approx_f = stat  # one excluded instrument
    print(f"First-stage statistic reported by linearmodels: {stat:.2f} with distribution {dist}")
    print(f"Approximate F-like value for one excluded instrument: {approx_f:.2f}")
    print("Use this as a screening diagnostic, not as proof that weak-IV concerns are absent.\n")

    # ------------------------------------------------------------------
    # 5. Overidentified model with two instruments.
    # ------------------------------------------------------------------
    iv_over_mod = IV2SLS.from_formula("Y ~ 1 + X1 + X2 + [D ~ Z + Z2]", data=df)
    iv_over_res = iv_over_mod.fit(cov_type="robust")

    print("Overidentified IV2SLS using Z and Z2:")
    print(iv_over_res.summary)
    print()

    print("First-stage diagnostics for overidentified model:")
    print(iv_over_res.first_stage.diagnostics)
    print()

    print("Overidentification tests; failure to reject does not prove validity:")
    try:
        print("Sargan:", iv_over_res.sargan)
    except Exception as exc:  # pragma: no cover
        print(f"Sargan test unavailable: {exc}")
    try:
        print("Wooldridge overidentification:", iv_over_res.wooldridge_overid)
    except Exception as exc:  # pragma: no cover
        print(f"Wooldridge overid test unavailable: {exc}")
    print()

    # LIML comparison can be useful when weak instruments are a concern.
    liml_res = IVLIML.from_formula("Y ~ 1 + X1 + X2 + [D ~ Z + Z2]", data=df).fit(cov_type="robust")
    print("LIML comparison for the overidentified model:")
    print(liml_res.summary)
    print()

    # ------------------------------------------------------------------
    # 6. Falsification checks.
    # ------------------------------------------------------------------
    print("Covariate balance by instrument Z:")
    balance = pd.DataFrame(
        {
            "covariate": ["X1", "X2"],
            "mean_Z0": [df.loc[df["Z"] == 0, "X1"].mean(), df.loc[df["Z"] == 0, "X2"].mean()],
            "mean_Z1": [df.loc[df["Z"] == 1, "X1"].mean(), df.loc[df["Z"] == 1, "X2"].mean()],
        }
    )
    balance["difference_Z1_minus_Z0"] = balance["mean_Z1"] - balance["mean_Z0"]
    print(balance)
    print()

    placebo = smf.ols("placebo_y ~ Z + X1 + X2", data=df).fit(cov_type="HC1")
    print("Placebo outcome test: placebo_y should not be affected by Z after design covariates.")
    print(placebo.summary().tables[1])
    print()

    # Endogeneity test: not an instrument-validity test.
    print("Wu-Hausman test of endogeneity; this does not validate the instrument:")
    print(iv_res.wu_hausman())
    print()

    print("Interpretation reminder:")
    print(
        "The IV estimate is causal only under relevance, independence, exclusion, "
        "monotonicity/constant-effect assumptions as needed, consistency, and no interference."
    )
    print("With binary Z and binary D, the target is usually a LATE/CACE for compliers, not an ATE.")


if __name__ == "__main__":
    sys.exit(main())
