# Literature and Software Map: Heterogeneous Effects and Policy

## How to Use This Reference

This is a compact map, not an exhaustive bibliography. Use it to choose a safe estimator family, explain why a tool fits or does not fit, and avoid overclaiming causal interpretation from flexible prediction methods.

## Core Lessons

- HTE and policy learning usually sit downstream of identification. The core causal assumptions still come from randomized assignment, measured-confounding adjustment, IV, RD, DiD, or another parent design.
- CATE estimation is statistically hard. In many applied projects, validated GATEs, rankings, or simple policies are more defensible than noisy individual-level CATEs.
- Policy learning optimizes a reward or value function. It is not the same as estimating the most accurate CATE everywhere.
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
- Tsiatis, Davidian, Holloway, and Laber, *Dynamic Treatment Regimes: Statistical Methods for Precision Medicine*. Key lesson: sequential individualized decisions are a dynamic-regime problem, not just static CATE/policy learning. Publisher page: <https://www.routledge.com/Dynamic-Treatment-Regimes-Statistical-Methods-for-Precision-Medicine/Tsiatis-Davidian-Holloway-Laber/p/book/9781498769778>

## Evaluation and Targeting Metrics

- RATE, TOC, and Qini metrics are useful for evaluating treatment prioritization rules, especially when a score is meant to rank treatment benefit rather than produce precise individual CATEs. `grf` RATE vignette: <https://grf-labs.github.io/grf/articles/rate.html>
- Held-out policy value should compare the learned policy to meaningful baselines: treat-all, treat-none, current policy, a simple subgroup rule, or a risk-score rule.
- Calibration and best linear projection are useful for checking whether a CATE model captures systematic heterogeneity. `grf` diagnostics: <https://grf-labs.github.io/grf/articles/diagnostics.html>

## Software Map

### R

- `grf`: first-line R tool for causal forests, generalized random forests, CATE prediction, RATE/TOC/Qini-style validation, best linear projection, calibration, clusters, and doubly robust scores. Docs: <https://grf-labs.github.io/grf/reference/causal_forest.html>
- `policytree`: interpretable shallow policy trees from doubly robust rewards, often using `grf` scores. Docs: <https://grf-labs.github.io/policytree/>
- `DoubleML`: DML/orthogonal nuisance estimation when the parent design uses high-dimensional adjustment.
- `bcf`, `BART`, `bartCause`: optional Bayesian/sensitivity tools; check maintenance, outcome/treatment support, and propensity handling before recommending.

### Python

- `EconML`: broad Python stack for DML, CausalForestDML, DRLearner, ForestDRLearner, orthogonal forests, interpreters, and DoWhy integration. Docs: <https://www.pywhy.org/EconML/>
- `CausalML`: meta-learners, uplift trees/forests, and applied uplift metrics. Docs: <https://causalml.readthedocs.io/en/latest/methodology.html>
- `DoubleML`: Python/R DML workflows for orthogonal nuisance estimation.
- `DoWhy`: useful for graph/refutation framing, but not by itself an HTE or policy-validation solution.

## Method Selection Heuristics

- If the user has a few scientifically motivated modifiers, start with GATEs and interactions.
- If the user wants discovery and the sample is adequate, consider causal forests or R/DR learners with honest validation.
- If the user needs a decision rule, define the reward and constraints first, then use policy learning or a simple threshold rule.
- If the user has observational data, run parent-route overlap and nuisance diagnostics before trusting HTE or policy results.
- If the user has a small sample, sparse treatment support, or many candidate modifiers, frame CATE results as exploratory and prefer simpler validated summaries.
- If the user wants deployment, recommend prospective validation, monitoring, and pre-specified rollback criteria.
