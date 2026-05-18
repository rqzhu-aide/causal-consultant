# Literature and Software Map: Heterogeneous Effects, Individualized Decisions, And Policy

## How to Use This Reference

This is a compact map, not an exhaustive bibliography. Use it to choose a safe estimator family, explain why a tool fits or does not fit, and avoid overclaiming causal interpretation from flexible prediction methods.

## Core Lessons

- HTE and policy learning usually sit downstream of identification. The core causal assumptions still come from randomized assignment, measured-confounding adjustment, IV, RD, DiD, or another parent design.
- CATE estimation is statistically hard. In many applied projects, validated GATEs, rankings, or simple policies are more defensible than noisy individual-level CATEs.
- Individualized policy learning in this skill is single-stage: it optimizes a reward, utility, or value function for one decision point. It is not the same as estimating the most accurate CATE everywhere.
- Binary, multi-arm, and continuous-dose decisions need different support checks. Continuous-dose recommendations require a bounded, supportable dose range and should not extrapolate beyond observed or design-justified treatment levels.
- Honest estimation, sample splitting, cross-fitting, out-of-bag predictions, external validation, or prospective validation are central safeguards.
- A risk model can be highly predictive and still be poor for treatment targeting if risk is not aligned with treatment benefit.

## Foundational Causal Framing

- Hernan and Robins, *Causal Inference: What If*. Use for consistency, exchangeability, positivity, target-trial thinking, and the warning that causal inference is not a recipe. Official PDF: <https://www.hsph.harvard.edu/miguel-hernan/wp-content/uploads/sites/1268/2024/04/hernanrobins_WhatIf_26apr24.pdf>
- Imbens and Rubin, *Causal Inference for Statistics, Social, and Biomedical Sciences* (2015). Use for potential outcomes, assignment mechanisms, randomized and observational designs. Cambridge page: <https://www.cambridge.org/core/books/causal-inference-for-statistics-social-and-biomedical-sciences/71126BE90C58F1A431FE9B2DD07938AB>

## Heterogeneous Effect Estimation

- Athey and Imbens (2016), "Recursive Partitioning for Heterogeneous Causal Effects." Key lesson: honest causal trees use one sample to discover partitions and another to estimate subgroup effects. DOI: <https://doi.org/10.1073/pnas.1510489113>
- Wager and Athey (2018), "Estimation and Inference of Heterogeneous Treatment Effects using Random Forests." Key lesson: causal forests target CATEs under unconfoundedness and provide forest-based inference. DOI: <https://doi.org/10.1080/01621459.2017.1319839>
- Athey, Tibshirani, and Wager (2019), "Generalized Random Forests." Key lesson: generalized forests estimate quantities defined by local moment equations, including CATEs and heterogeneous IV effects. DOI: <https://doi.org/10.1214/18-AOS1709>
- Kunzel, Sekhon, Bickel, and Yu (2019), "Metalearners for estimating heterogeneous treatment effects using machine learning." Key lesson: S-, T-, and X-learners decompose CATE estimation into supervised-learning subproblems; no learner is uniformly best. DOI: <https://doi.org/10.1073/pnas.1804597116>
- Nie and Wager (2021), "Quasi-oracle estimation of heterogeneous treatment effects." Key lesson: R-learning residualizes outcome and treatment to isolate the treatment-effect signal and can use flexible learners in both stages. DOI: <https://doi.org/10.1093/biomet/asaa076>
- Kennedy (2023), "Towards optimal doubly robust estimation of heterogeneous causal effects." Key lesson: DR-style pseudo-outcome approaches can give strong guarantees when nuisance estimation and sample splitting are handled carefully. DOI: <https://doi.org/10.1214/23-EJS2157>
- Foster and Syrgkanis (2023), "Orthogonal Statistical Learning." Key lesson: orthogonalization can stabilize learning of causal/statistical targets when nuisance functions are estimated flexibly. DOI: <https://doi.org/10.1214/23-AOS2258>

## Bayesian and Regularized Heterogeneity

- Hill (2011), "Bayesian Nonparametric Modeling for Causal Inference." Key lesson: BART can flexibly model response surfaces and naturally surface heterogeneity, but still relies on the treatment-assignment assumptions. DOI: <https://doi.org/10.1198/jcgs.2010.08162>
- Hahn, Murray, and Carvalho (2020), "Bayesian Regression Tree Models for Causal Inference: Regularization, Confounding, and Heterogeneous Effects." Key lesson: Bayesian causal forests regularize treatment heterogeneity separately from prognostic structure and incorporate propensity information. DOI: <https://doi.org/10.1214/19-BA1195>

## Policy Learning and Individualized Treatment Rules

- Qian and Murphy (2011), "Performance Guarantees for Individualized Treatment Rules." Key lesson: treatment-rule learning can be framed as optimizing value, with performance guarantees under suitable conditions. DOI: <https://doi.org/10.1214/10-AOS864>
- Zhao, Zeng, Rush, and Kosorok (2012), "Estimating Individualized Treatment Rules Using Outcome Weighted Learning." Key lesson: outcome weighted learning turns treatment-rule estimation into a weighted classification problem. DOI: <https://doi.org/10.1080/01621459.2012.695674>
- Kitagawa and Tetenov (2018), "Who Should Be Treated? Empirical Welfare Maximization Methods for Treatment Choice." Key lesson: EWM estimates a treatment assignment policy by maximizing sample analog social welfare over constrained policy classes. DOI: <https://doi.org/10.3982/ECTA13288>
- Kallus (2018), "Balanced Policy Evaluation and Learning." Key lesson: policy evaluation/learning from observational data can use balance-oriented weights to reduce variance and support off-policy evaluation. Proceedings page: <https://papers.nips.cc/paper/8105-balanced-policy-evaluation-and-learning>
- Athey and Wager (2021), "Policy Learning with Observational Data." Key lesson: doubly robust scores can be used to learn treatment assignment policies under constraints, but the causal design must identify those scores. DOI: <https://doi.org/10.3982/ECTA15732>
- Kallus and Zhou (2018), "Policy Evaluation and Optimization with Continuous Treatments." Key lesson: continuous-dose policy evaluation cannot use discrete-action rejection ideas directly; kernel/IPW/DR approaches need dose proximity, bandwidth, and support checks. PMLR page: <https://proceedings.mlr.press/v84/kallus18a.html>
- Hirano and Imbens (2004), "The Propensity Score with Continuous Treatments." Key lesson: generalized propensity scores are the standard starting point for continuous exposure support and dose-response adjustment. PDF: <https://scholar.harvard.edu/files/imbens/files/hir_07feb04.pdf>

## Evaluation and Targeting Metrics

- RATE, TOC, and Qini metrics are useful for evaluating treatment prioritization rules, especially when a score is meant to rank treatment benefit rather than produce precise individual CATEs. `grf` RATE vignette: <https://grf-labs.github.io/grf/articles/rate.html>
- Held-out policy value should compare the learned policy to meaningful baselines: treat-all, treat-none, current policy, a simple subgroup rule, a risk-score rule, or fixed-dose/current-dose baselines for dose decisions.
- Calibration and best linear projection are useful for checking whether a CATE model captures systematic heterogeneity. `grf` diagnostics: <https://grf-labs.github.io/grf/articles/diagnostics.html>
- Continuous-dose rules need dose-response uncertainty, generalized propensity or density support, grid/bandwidth sensitivity, and an explicit check that recommended doses do not cluster in unsupported tails.

## Software Map

### R

- `grf`: first-line R tool for causal forests, generalized random forests, CATE prediction, RATE/TOC/Qini-style validation, best linear projection, calibration, clusters, doubly robust scores, multi-arm causal forests, and continuous-treatment conditional partial effects. Docs: <https://grf-labs.github.io/grf/reference/causal_forest.html>
- `policytree`: interpretable shallow policy trees from doubly robust rewards, often using `grf` scores. Docs: <https://grf-labs.github.io/policytree/>
- `polle`: policy learning and evaluation using doubly robust loss functions; use here only when the selected workflow is a single decision point. Docs: <https://rdrr.io/cran/polle/>
- `tmle3mopttx`: targeted-learning estimation of the mean under a single-stage optimal individualized rule, including categorical treatment and resource/realistic constraints. Docs: <https://tlverse.r-universe.dev/tmle3mopttx/tmle3mopttx.pdf>
- `evalITR` and `evalHTE`: evaluation-focused tools for ITRs, GATEs, AUPEC/PAPE-style quantities, and randomized-experiment HTE checks. Docs: <https://search.r-project.org/CRAN/refmans/evalITR/html/00Index.html>
- `GenericML`: randomized-experiment HTE inference with generic ML scores, especially GATES-style summaries. Docs: <https://cran-e.com/package/GenericML>
- Outcome weighted learning, residual weighted learning, and augmented OWL may require custom weighted-classification or estimating-equation code; verify reward coding, treatment coding, support, and validation before treating a learned rule as actionable.
- `CausalGPS`, `causaldrf`, and `CausalSpline`: continuous-exposure or dose-response support tools; use them to estimate or diagnose dose-response structure and generalized propensity support before proposing a bounded dose rule. Docs: <https://cran.r-universe.dev/CausalGPS/doc/manual.html>, <https://cran.r-universe.dev/causaldrf/doc/manual.html>, <https://www.rdocumentation.org/packages/CausalSpline/versions/0.1.0/topics/CausalSpline-package>
- `DoubleML`: DML/orthogonal nuisance estimation when the parent design uses high-dimensional adjustment.
- `marginaleffects` and `emmeans`: lean interaction, contrast, adjusted-prediction, and subgroup/GATE summaries when interpretability is more important than flexible CATE modeling.
- `bcf`, `BART`, `bartCause`: optional Bayesian/sensitivity tools; check maintenance, outcome/treatment support, and propensity handling before recommending.

### Python

- `EconML`: broad Python stack for DML, CausalForestDML, DRLearner, ForestDRLearner, orthogonal forests, interpreters, DoWhy integration, continuous-treatment DML, and policy classes such as `DRPolicyTree` and `DRPolicyForest`. Docs: <https://www.pywhy.org/EconML/>
- `CausalML`: meta-learners, uplift trees/forests, applied uplift metrics, and `PolicyLearner` for treatment recommendation workflows. Docs: <https://causalml.readthedocs.io/en/latest/methodology.html>
- `scikit-uplift`: sklearn-style uplift models, metrics, and plots for applied targeting; use as applied uplift tooling, not a complete causal validation framework. Docs: <https://www.uplift-modeling.com/en/latest/index.html>
- `causallib`: potential-outcome prediction and multi-treatment-friendly Python workflows; useful when individual counterfactual outcome prediction is the operational target. Docs: <https://causallib.readthedocs.io/>
- `DoubleML`: Python/R DML workflows for orthogonal nuisance estimation.
- `DoWhy`: useful for graph/refutation framing, but not by itself an HTE or policy-validation solution.

## Method Selection Heuristics

- If the user has a few scientifically motivated modifiers, start with GATEs and interactions.
- If the user wants discovery and the sample is adequate, consider causal forests or R/DR learners with honest validation.
- If the user needs a decision rule, define the reward and constraints first, then use policy learning or a simple threshold rule.
- If the user has multiple treatment arms, require a coherent baseline and package support for multi-arm actions.
- If the user has a continuous dose, start with dose support and dose-response diagnostics, then evaluate bounded dose rules against fixed-dose or current-policy baselines.
- If the user has observational data, run parent-route overlap and nuisance diagnostics before trusting HTE or policy results.
- If the user has a small sample, sparse treatment support, or many candidate modifiers, frame CATE results as exploratory and prefer simpler validated summaries.
- If the user wants deployment, recommend prospective validation, monitoring, and pre-specified rollback criteria.
