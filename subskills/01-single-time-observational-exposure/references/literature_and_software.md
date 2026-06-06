# Literature And Software Map

Use this reference when choosing observational point-exposure methods, diagnostics, packages, or report language.

## Core Ideas

- A point observational comparison needs a target trial: eligibility, time zero, exposure, comparator, follow-up, outcome, estimand, and analysis set.
- The main causal condition is not "many controls"; it is credible exchangeability using pre-exposure information, plus positivity, consistency, and measurement quality.
- Estimators differ in transparency, robustness, and target population. They do not repair wrong timing, absent confounders, or no support.
- Good observational reporting names the supported population: full ATE, ATT, matched sample, overlap population, trimmed support region, or descriptive-only set.

## Minimal Math

- ATE: `E[Y(1) - Y(0)]`, the average contrast in a target population.
- ATT: `E[Y(1) - Y(0) | A = 1]`, the contrast among treated or exposed units.
- Propensity score: `e(X) = P(A = 1 | X)`, used to describe support and balance observed baseline covariates.
- IPW weights: for ATE, treated units often receive `1/e(X)` and controls receive `1/(1 - e(X))`; extreme weights signal weak support.
- AIPW/DR idea: combine an outcome model and treatment model so the estimator can be consistent if one nuisance component is correctly specified, under the causal assumptions.

## Selected Literature

- Rubin (1974): potential-outcomes framing for nonrandomized treatment comparisons.
- Rosenbaum and Rubin (1983): propensity score and balancing score logic.
- Rubin (2001): outcome-blind design using propensity scores.
- Stuart (2010): matching methods, diagnostics, and estimand implications.
- Austin (2011): accessible propensity-score methods review.
- Hernan and Robins (2020): target trials, exchangeability, positivity, consistency, IP weighting, standardization, and sensitivity.
- Hernan and Robins (2016): using observational data to emulate a target trial.
- Hernan, Wang, and Leaf (2022): practical target-trial emulation and common failures.
- Bang and Robins (2005): doubly robust estimation foundations.
- van der Laan and Rose (2011): targeted learning and TMLE.
- Chernozhukov et al. (2018): double/debiased machine learning and orthogonalization.
- Li, Morgan, and Zaslavsky (2018): overlap weights and weighting choices.
- VanderWeele and Ding (2017): E-values for unmeasured-confounding sensitivity.

## Package And Tool Lanes

| Need | R options | Python options | Notes |
|---|---|---|---|
| Matching design | `MatchIt`, `optmatch`, `MatchThem` | `pymatch`, custom matching, `causalml` utilities | report discarded units and estimand |
| Weighting and balance | `WeightIt`, `cobalt`, `CBPS`, `survey` | `zepid`, `DoWhy`, custom propensity/weight code | inspect overlap and weight tails |
| Transparent adjustment | `lm`, `glm`, `fixest`, `sandwich`, `marginaleffects` | `statsmodels`, `scikit-learn` plus standardization code | timing and support remain central |
| Doubly robust / TMLE | `tmle`, `drtmle`, `tmle3`, `sl3` | `zepid`, `EconML`, custom AIPW/TMLE workflows | needs nuisance diagnostics and cross-fitting where relevant |
| DML / orthogonal ML | `DoubleML`, `grf`, `mlr3` ecosystem | `DoubleML`, `EconML`, `scikit-learn` | implementation support, not design proof |
| DAG/refuter workflow | DAG packages, manual DAGs | `DoWhy`, `networkx`/graph tools | DAG assumptions must be supplied and reviewed |
| Sensitivity | `sensemakr`, `EValue`, Rosenbaum-style tools | `dowhy` refuters, custom E-value/bounds code | sensitivity usually bounds fragility, not certainty |
| Report tables/plots | `modelsummary`, `gt`, `cobalt`, `ggplot2` | `pandas`, `statsmodels`, `plotnine`, `matplotlib` | include provenance paths |

## Practical Selection Rules

- Need a careful first pass: target-trial table plus transparent adjustment or g-computation.
- Need visible comparability: matching or weighting with balance and overlap diagnostics.
- Need ATE but overlap is weak: consider overlap weights, trimming, or a narrower target.
- Need flexible nuisance modeling: ask main to route `21-doubly-robust-estimation` or `22-double-machine-learning`.
- Need hidden-confounding protection: ask main to consider sensitivity, `08-negative-controls-proximal`, or a stronger design route if credible.
- Need survival, dose-response, heterogeneity, transportability, or policy decisions: ask main to route the specific target-goal or implementation-support subskill that matches the need.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [WeightIt `weightit`](https://ngreifer.github.io/WeightIt/reference/weightit.html), [cobalt `bal.tab`](https://ngreifer.github.io/cobalt/reference/bal.tab.html), [MatchIt `matchit`](https://kosukeimai.github.io/MatchIt/reference/matchit.html)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. Save outputs inside the active `analysis_dir`, update the unit `manifest.json`, and mirror report-relevant source, table, figure, diagnostic, and large-artifact paths into `artifact_index`.

```r
# Tiny sketch, not a complete script.
# Replace A, Y, and X variables after timing and adjustment-set review.
library(WeightIt)
library(cobalt)

w <- weightit(A ~ X1 + X2 + X3, data = analysis_data,
              method = "ps", estimand = "ATE")
balance <- bal.tab(w)
love.plot(w)
```

Artifact outputs to preserve: weighted estimate path, balance/overlap plot path, source code path.
