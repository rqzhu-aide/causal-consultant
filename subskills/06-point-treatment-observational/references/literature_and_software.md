# Literature and Software Map: Point-Treatment Observational

## How to Use This Reference

This is a compact map, not an exhaustive bibliography. Use it to frame observational point-treatment analyses, choose a safe high-level route, and avoid pretending that estimator sophistication solves design problems.

## Core Lessons

- Observational point-treatment analyses try to emulate a randomized comparison using measured pre-treatment information.
- The key design tasks are eligibility, time zero, treatment/comparator definition, covariate timing, target population, and overlap.
- Regression, matching, weighting, g-computation, AIPW, TMLE, and DML can target related estimands, but they rely on the same causal identification conditions unless another design is used.
- Poor overlap is not a software problem. It often means the target population or estimand must change.
- Sensitivity analysis, negative controls, and falsification checks can strengthen credibility, but they do not prove no unmeasured confounding.

## Foundational Potential-Outcomes and Observational Causal Inference

- Rubin (1974), "Estimating Causal Effects of Treatments in Randomized and Nonrandomized Studies." Key lesson: causal effects compare potential outcomes, randomization is ideal, and carefully controlled nonrandomized data may be used when randomization is unavailable. DOI: <https://doi.org/10.1037/h0037350>
- Rosenbaum and Rubin (1983), "The central role of the propensity score in observational studies for causal effects." Key lesson: propensity scores are balancing scores for observed covariates, enabling matching, subclassification, and weighting under observed-confounding assumptions. DOI: <https://doi.org/10.1093/biomet/70.1.41>
- Imbens and Rubin, *Causal Inference for Statistics, Social, and Biomedical Sciences* (2015). Key lesson: potential outcomes, assignment mechanisms, propensity methods, matching, and practical observational-study design. Cambridge page: <https://www.cambridge.org/core/books/causal-inference-for-statistics-social-and-biomedical-sciences/71126BE90C58F1A431FE9B2DD07938AB>
- Hernan and Robins, *Causal Inference: What If*. Key lesson: consistency, exchangeability, positivity, g-formula, IP weighting, target trials, and time ordering. Official PDF: <https://www.hsph.harvard.edu/miguel-hernan/wp-content/uploads/sites/1268/2024/04/hernanrobins_WhatIf_26apr24.pdf>
- Imbens and Wooldridge (2009), "Recent Developments in the Econometrics of Program Evaluation." Key lesson: practical program-evaluation methods, unconfoundedness, matching, weighting, regression, IV, and panel alternatives. DOI: <https://doi.org/10.1257/jel.47.1.5>

## Design, Target Trials, and Common Pitfalls

- Hernan and Robins (2016), "Using Big Data to Emulate a Target Trial When a Randomized Trial Is Not Available." Key lesson: make the hypothetical randomized trial explicit before analyzing observational data. DOI: <https://doi.org/10.1093/aje/kwv254>
- Hernan et al. (2016), "Specifying a target trial prevents immortal time bias and other self-inflicted injuries in observational analyses." Key lesson: eligibility, treatment assignment, and start of follow-up must be aligned to avoid immortal time and related biases. DOI: <https://doi.org/10.1016/j.jclinepi.2016.04.014>
- Matthews et al. (2022), "Target trial emulation: applying principles of randomised trials to observational studies." Key lesson: target-trial emulation provides a structured protocol for observational causal comparisons. BMJ page: <https://www.bmj.com/content/378/bmj-2022-071108>
- Hernan, Hernandez-Diaz, and Robins (2004), "A structural approach to selection bias." Key lesson: selection into the dataset or analytic sample can be represented causally and may bias effects. DOI: <https://doi.org/10.1097/01.ede.0000135174.63482.43>
- Westreich and Greenland (2013), "The Table 2 Fallacy." Key lesson: coefficients for confounders in a single adjusted outcome model should not be casually interpreted as their causal effects. DOI: <https://doi.org/10.1093/aje/kws412>
- VanderWeele and Shpitser (2013), "On the definition of a confounder." Key lesson: confounder selection should be guided by causal structure, not only statistical association. DOI: <https://doi.org/10.1214/12-AOS1058>

## Method Families

- **Regression adjustment and standardization/g-computation:** useful for transparent first analyses when model form is credible and covariates are modest.
- **Propensity-score matching, subclassification, and weighting:** useful for design-stage comparability and target-population control; route to `07-matching-weighting-balance` for diagnostics.
- **Overlap weighting and trimming:** useful when full-population ATE is unsupported by common support; state the estimand change.
- **AIPW, TMLE, and DML:** useful for robustness and flexible nuisance estimation; route to `08-doubly-robust-ml` and keep the same identification assumptions visible.
- **Dose-response methods:** useful for continuous or ordinal treatments, but require support across the dose range and careful functional-form checks.
- **Sensitivity and negative-control analyses:** useful when unmeasured confounding is plausible and causal claims matter.

## Software Map

### R

- `dagitty` and `ggdag`: adjustment-set and variable-role support before estimation.
- `marginaleffects`: adjusted predictions, contrasts, marginal means, and g-computation-style standardization for many fitted models. Docs: <https://www.rdocumentation.org/packages/marginaleffects/versions/0.8.1>
- `MatchIt`, `WeightIt`, `cobalt`: matching, weighting, and balance diagnostics; route to `07-matching-weighting-balance`. `WeightIt` docs: <https://search.r-project.org/CRAN/refmans/WeightIt/html/WeightIt-package.html>
- `AIPW`, `tmle`, `tmle3`, `sl3`, `SuperLearner`, `DoubleML`: doubly robust or ML-based routes; route to `08-doubly-robust-ml`.

### Python

- `DoWhy`: model-identify-estimate-refute workflow for causal effects, useful for transparent graph and refutation workflows. Docs: <https://www.pywhy.org/dowhy/v0.9.1/user_guide/effect_inference/index.html>
- `zepid`: g-formula, IPTW, AIPTW, TMLE, IPCW, and transportability utilities. Docs: <https://zepid.readthedocs.io/en/latest/Reference/Causal.html>
- `statsmodels`, `scikit-learn`, `pandas`, and `numpy`: transparent regression, standardization, weighting, diagnostics, and custom sensitivity analyses.
- `DoubleML`, `EconML`, and `causalml`: use through `08-doubly-robust-ml` or `09-heterogeneous-effects-individualized-policy` when flexible nuisance models, CATEs, or single-stage individualized policies are needed.

## Method Selection Heuristics

- If the user just wants a clear observational effect estimate with modest covariates, start with target-trial framing plus standardization or adjusted regression.
- If comparability is the main concern, route to matching/weighting and require balance and overlap diagnostics.
- If high-dimensional or nonlinear covariate adjustment is needed, route to doubly robust ML while preserving the same assumptions.
- If support is weak, change the target population rather than forcing an unstable ATE.
- If treatment timing is not point-like, route to longitudinal methods.
- If the outcome is time-to-event, route to survival before deciding the estimator.
- If unmeasured confounding is likely central, report sensitivity, negative controls, or a design alternative rather than a definitive point-treatment causal estimate.
