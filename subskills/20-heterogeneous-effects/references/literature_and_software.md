# Literature And Software Map

Use this file to choose credible method families and packages for heterogeneous treatment effects. Keep identification and support checks ahead of software.

## Core Literature

### Trees, Forests, And Honest Estimation

- Athey and Imbens (2016), [Recursive Partitioning for Heterogeneous Causal Effects](https://www.gsb.stanford.edu/faculty-research/publications/recursive-partitioning-heterogeneous-causal-effects): honest causal trees for subgroups with treatment-effect-oriented splitting.
- Wager and Athey (2018), [Estimation and Inference of Heterogeneous Treatment Effects using Random Forests](https://arxiv.org/abs/1510.04342): causal forests with asymptotic inference for CATE.
- Athey, Tibshirani, and Wager (2019), [Generalized Random Forests](https://arxiv.org/abs/1610.01271): forest weights for local moment estimation, foundation for `grf`.

### Meta-Learners And Orthogonal Estimation

- Kunzel, Sekhon, Bickel, and Yu (2019), [Meta-learners for Estimating Heterogeneous Treatment Effects using Machine Learning](https://arxiv.org/abs/1706.03461): S-, T-, X-, and related learners; no single learner is uniformly best.
- Nie and Wager (2021), [Quasi-Oracle Estimation of Heterogeneous Treatment Effects](https://arxiv.org/abs/1712.04912): R-learner formulation using residualization/orthogonalization.
- Kennedy (2020), [Optimal doubly robust estimation of heterogeneous causal effects](https://arxiv.org/abs/2004.14497): doubly robust CATE estimation and bias-robust inference ideas.
- Chernozhukov et al. (2018), [Double/debiased machine learning for treatment and structural parameters](https://academic.oup.com/ectj/article/21/1/C1/5056401): orthogonal nuisance estimation principles that support robust heterogeneity workflows.

### Reporting, Subgroups, And Validation

- Imai and Ratkovic (2013), [Estimating treatment effect heterogeneity in randomized program evaluation](https://imai.fas.harvard.edu/research/het.html): structured heterogeneity search for experiments.
- Chernozhukov et al. (2018), [Generic Machine Learning Inference on Heterogeneous Treatment Effects in Randomized Experiments](https://arxiv.org/abs/1712.04802): sorted/grouped effects and validation of ML-discovered heterogeneity.
- Zhao et al. (2017), [Causal inference in randomized trials with heterogeneous treatment effects](https://arxiv.org/abs/1711.03135): subgroup and individualized effect evaluation concerns.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`grf`](https://grf-labs.github.io/grf/articles/grf_guide.html) | R | Causal forests, best linear projection, calibration, variable importance, CATE/GATE support | Strong default for flexible HTE with honesty and forest diagnostics | Needs overlap, enough sample size, and careful CATE wording |
| [`causalTree`](https://cran.r-project.org/package=causalTree) | R | Honest causal trees and interpretable subgroup partitions | Transparent discovered groups | Less current than `grf`; tree instability is common |
| [`DoubleML`](https://docs.doubleml.org/stable/guide/heterogeneity.html) | R/Python | GATEs, group effects, orthogonal nuisance adjustment | Good for reportable group effects and joint inference | More target-specific than generic CATE discovery |
| [`EconML`](https://www.pywhy.org/EconML/_autosummary/econml.dml.CausalForestDML.html) | Python | `CausalForestDML`, DML/orthogonal forests, and S/T/X/DR-style meta-learners | Flexible sklearn-compatible nuisance learners and intervals | Requires careful cross-fitting, treatment coding, and design review |
| [`CausalML`](https://causalml.readthedocs.io/) | Python | S-learner, T-learner, X-learner, R-/residual-style and DR learner workflows, uplift-style CATE visualizations | Practical ML ecosystem for CATE and uplift; X-learner is useful when treatment groups are imbalanced | Some outputs are better for exploration/ranking than inference |
| [`metalearners`](https://metalearners.readthedocs.io/) | Python | Unified S-, T-, X-, R-, and DR-learner style interfaces | Explicit meta-learner comparison workflow | Younger ecosystem; still needs design validity and out-of-sample checks |
| [`bartCause`](https://cran.r-project.org/package=bartCause) / BART tools | R | Bayesian flexible HTE under outcome/propensity modeling | Captures nonlinearities and interactions with uncertainty summaries | Model-dependent; identification still external |
| [`marginaleffects`](https://marginaleffects.com/) | R/Python | Interaction contrasts, subgroup marginal effects, model-based standardization | Good for transparent GLM/LM subgroup reporting | Not a causal design tool by itself |
| [`emmeans`](https://cran.r-project.org/package=emmeans) | R | Estimated marginal means and contrasts after simple models | Useful for prespecified interactions | Model and scale choices drive interpretation |

## Practical Selection Rules

- Need confirmatory subgroup reporting: use prespecified strata, simple interactions, marginal standardization, and multiplicity-aware uncertainty.
- Need flexible discovery: use `grf`, EconML `CausalForestDML`, or S/T/X/R/DR meta-learners, but call results exploratory until validated.
- Need imbalanced treated/control groups: consider the X-learner lane, then compare against T-/R-/DR-learner or forest results for stability.
- Need reportable group effects after ML nuisance adjustment: use DoubleML GATE or GRF grouped summaries.
- Need policy or targeting: activate `21-point-treatment-rules`; heterogeneity alone does not define costs, constraints, or assignment rules.
- Need observational HTE: activate the design route and usually `30-matching-weighting-balance`, `31-doubly-robust-estimation`, or `32-double-machine-learning`.
- Need survival/time-to-event HTE: activate `33-survival-competing-risks`; ordinary CATE tooling may not handle censoring correctly.
- Need many sparse groups: consider hierarchical/shrinkage models or group pooling before high-variance subgroup claims.
