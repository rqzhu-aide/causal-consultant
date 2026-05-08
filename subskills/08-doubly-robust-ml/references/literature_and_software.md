# Literature and Software Map: Doubly Robust and Orthogonal ML

## How to Use This Reference

This is a compact map, not an exhaustive bibliography. Use it to choose a safe DR/ML estimator family, explain what the method protects against, and avoid overclaiming what machine learning can do.

## Core Lessons

- DR/ML methods estimate causal parameters after a valid causal design has supplied identification assumptions and valid covariates.
- "Doubly robust" usually means the estimator can remain consistent if either the outcome regression or treatment/censoring model is correctly specified in the relevant sense. It does not mean robust to unmeasured confounding.
- Orthogonal scores and cross-fitting reduce bias from flexible nuisance estimation and overfitting, but they do not solve positivity failure or wrong variable timing.
- Diagnostics should cover overlap, nuisance performance, influence-curve/score behavior, fold stability, and sensitivity to learner libraries.
- A simpler estimator comparison is useful. If a complex estimator and transparent estimator strongly disagree, investigate before reporting.

## Foundational Doubly Robust and Semiparametric Work

- Robins, Rotnitzky, and Zhao (1994), "Estimation of Regression Coefficients When Some Regressors are not Always Observed." Key lesson: semiparametric inverse-probability and influence-function ideas underlie later DR estimators. DOI: <https://doi.org/10.1080/01621459.1994.10476818>
- Bang and Robins (2005), "Doubly Robust Estimation in Missing Data and Causal Inference Models." Key lesson: DR estimators combine a treatment/missingness model with an outcome model and can give "two chances" at consistency under the causal/missingness assumptions. DOI: <https://doi.org/10.1111/j.1541-0420.2005.00377.x>
- van der Laan and Rubin (2006), "Targeted Maximum Likelihood Learning." Key lesson: TMLE targets initial nuisance estimates toward the parameter of interest using the efficient influence curve. Publication page: <https://econpapers.repec.org/RePEc:bep:ijbist:v:2:y:2006:i:1:n:11>
- van der Laan and Rose, *Targeted Learning: Causal Inference for Observational and Experimental Data* (2011). Key lesson: targeted learning integrates machine learning, cross-validation, semiparametric inference, and causal target parameters. DOI: <https://doi.org/10.1007/978-1-4419-9782-1>
- Chernozhukov et al. (2018), "Double/debiased machine learning for treatment and structural parameters." Key lesson: Neyman-orthogonal scores plus sample splitting/cross-fitting enable inference with high-dimensional ML nuisance estimates. DOI: <https://doi.org/10.1111/ectj.12097>
- Hernan and Robins, *Causal Inference: What If*. Key lesson: g-formula, IP weighting, exchangeability, positivity, and target-trial framing remain the identification foundation. Official PDF: <https://www.hsph.harvard.edu/miguel-hernan/wp-content/uploads/sites/1268/2024/04/hernanrobins_WhatIf_26apr24.pdf>

## Method Families

- **AIPW / one-step:** direct influence-function estimators for mean potential outcomes or contrasts.
- **TMLE:** targeted substitution estimator, often attractive for bounded outcomes and plug-in estimates.
- **Super Learner / sl3:** cross-validated ensemble nuisance estimation, commonly paired with TMLE or AIPW.
- **DoubleML PLR:** partially linear regression model for low-dimensional treatment coefficient with high-dimensional controls.
- **DoubleML IRM:** interactive regression model for binary treatment ATE/ATTE with flexible outcome and propensity models.
- **DRLearner / orthogonal CATE methods:** heterogeneity-focused methods; coordinate with `09-heterogeneous-effects-policy`.
- **Survival/missingness DR methods:** require outcome-specific or censoring-specific estimands; coordinate with `15-survival-competing-risks` and `02-data-technician`.

## Software Map

### R

- `tmle`: point-treatment TMLE for marginal effects of binary point treatment on binary/continuous outcomes; supports missing outcomes and SuperLearner. Docs: <https://www.rdocumentation.org/packages/tmle/versions/2.1.1/topics/tmle>
- `tmle3` and `sl3`: extensible targeted-learning framework for many target parameters. Docs: <https://tlverse.org/tmle3/>
- `SuperLearner`: cross-validated ensemble prediction library for nuisance models. Docs: <https://www.rdocumentation.org/packages/SuperLearner/versions/2.0-29/topics/SuperLearner>
- `DoubleML`: R implementation of Double/debiased ML with PLR, IRM, PLIV, IIVM, and orthogonal scores. Docs: <https://docs.doubleml.org/stable/index.html>
- `AIPW`: direct AIPW workflows for common binary treatment settings; check outcome/treatment support before recommending.

### Python

- `DoubleML`: Python implementation of Double/debiased ML with cross-fitting, orthogonal scores, bootstrap, confidence intervals, and multiple model classes. Docs: <https://docs.doubleml.org/stable/index.html>
- `EconML`: DML and doubly robust learners, including CATE-oriented estimators. DML docs: <https://econml.azurewebsites.net/spec/estimation/dml.html>
- `zepid`: AIPTW, TMLE, IPTW/IPCW, and epidemiologic causal estimators. Docs: <https://zepid.readthedocs.io/en/latest/Reference/Causal.html>
- `DoWhy`: graph/identification/refutation wrapper around effect estimation; useful for workflow, not a replacement for DR diagnostics. Docs: <https://www.pywhy.org/dowhy/v0.9.1/user_guide/effect_inference/index.html>

## Method Selection Heuristics

- If the user wants a point-treatment ATE/ATT with flexible adjustment, start with AIPW or TMLE.
- If the user explicitly wants DoubleML or a partially linear/interactive regression parameter, use DoubleML PLR or IRM.
- If binary outcome probabilities must remain bounded, prefer TMLE or carefully bounded nuisance predictions.
- If sample size is small, keep the learner library conservative and compare to simpler estimators.
- If propensities are extreme, fix the target population or design problem before fitting more complex learners.
- If the target is CATE, policy, or uplift, use DR/orthogonal methods as inputs but coordinate with the HTE/policy subskill.
- If the target involves censoring, competing risks, missingness, transportability, or time-varying treatment, use the specialized subskill before writing code.
