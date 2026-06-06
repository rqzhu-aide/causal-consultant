# Literature And Software Map

Use this file to choose credible DML, orthogonal ML, and nuisance-learning tools. Keep the main team focused on target model, cross-fitting, support, leakage, and inference validity before software.

## Core Literature

### Double/Debiased Machine Learning

- Belloni, Chernozhukov, and Hansen (2014), [Inference on treatment effects after selection among high-dimensional controls](https://doi.org/10.1093/restud/rdt044): post-double-selection foundations.
- Belloni, Chernozhukov, and Hansen (2014), [High-dimensional methods and inference on structural and treatment effects](https://doi.org/10.1257/jep.28.2.29): review of high-dimensional causal inference ideas.
- Chernozhukov et al. (2018), [Double/debiased machine learning for treatment and structural parameters](https://doi.org/10.1111/ectj.12097): main DML orthogonality and cross-fitting reference.
- Chernozhukov et al. (2022), [DoubleML - An Object-Oriented Implementation of Double Machine Learning in Python](https://doi.org/10.21105/joss.03906): package and workflow paper.

### Orthogonal Forests, CATE, And Meta-Learners

- Athey, Tibshirani, and Wager (2019), [Generalized random forests](https://doi.org/10.1214/18-AOS1709): GRF framework and causal forests.
- Wager and Athey (2018), [Estimation and inference of heterogeneous treatment effects using random forests](https://doi.org/10.1080/01621459.2017.1319839): causal forests and inference.
- Nie and Wager (2021), [Quasi-oracle estimation of heterogeneous treatment effects](https://doi.org/10.1093/biomet/asaa076): R-learner logic for CATE.
- Knaus (2022), [Double machine learning-based programme evaluation under unconfoundedness](https://doi.org/10.1111/obes.12463): practical comparison and guidance for DML program evaluation.

### Practical ML And Causal Nuisance Support

- Athey and Imbens (2019), [Machine Learning Methods That Economists Should Know About](https://doi.org/10.1146/annurev-economics-080217-053433): ML tools for causal/economic work.
- Kennedy (2020), [Optimal doubly robust estimation of heterogeneous causal effects](https://doi.org/10.48550/arXiv.2004.14497): DR/orthogonal CATE estimation.
- Oprescu, Syrgkanis, and Wu (2019), [Orthogonal random forest for causal inference](https://proceedings.mlr.press/v97/oprescu19a.html): orthogonal forests.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`DoubleML`](https://docs.doubleml.org/) | R/Python | PLR, PLIV, IRM, IIVM, cross-fitting, orthogonal scores | Strong DML implementation and diagnostics | Target model assumptions must match the causal question |
| [`EconML`](https://www.pywhy.org/EconML/) | Python | LinearDML, DML, CausalForestDML, DRLearner, OrthogonalForest, policy tools | Broad sklearn-compatible orthogonal ML ecosystem | Many estimators; easy to choose one with wrong target |
| [`grf`](https://grf-labs.github.io/grf/) | R | Causal forests, local linear forests, ATE/CATE, best linear projection | Strong forest inference and heterogeneity diagnostics | Needs support and honesty; CATE target belongs to `20` |
| [`hdm`](https://cran.r-project.org/package=hdm) | R | Double selection/post-lasso treatment effects | Transparent sparse linear high-dimensional controls | Relies on sparsity and linear target structure |
| [`glmnet`](https://glmnet.stanford.edu/) | R/Python | Sparse nuisance models and baselines | Stable high-dimensional regularization | Nuisance learner only, not DML by itself |
| [`ranger`](https://cran.r-project.org/package=ranger), [`xgboost`](https://xgboost.readthedocs.io/), [`lightgbm`](https://lightgbm.readthedocs.io/) | R/Python | Flexible nuisance learners | Strong predictive plugins | Need cross-fitting, tuning discipline, and support checks |
| [`SuperLearner`](https://cran.r-project.org/package=SuperLearner) / [`sl3`](https://tlverse.org/sl3/) | R | Ensemble nuisance learning | Good targeted-learning integration | Not DML by itself |
| [`scikit-learn`](https://scikit-learn.org/) | Python | Learners, pipelines, grouped CV, preprocessing | Familiar and flexible | Must be wrapped in DML/orthogonal score logic |
| [`causalml`](https://github.com/uber/causalml) | Python | Meta-learners and uplift/CATE tools | Practical product-style workflows | Formal DML inference is limited |
| [`DoWhy`](https://www.pywhy.org/dowhy/) | Python | Identification/refutation around ML estimators | Keeps causal model explicit | Estimator diagnostics still need review |

## Practical Selection Rules

- Need a scalar ATE with high-dimensional controls: start with `DoubleML` PLR/IRM or EconML LinearDML/DRLearner.
- Need CATE/heterogeneity: use `grf` or EconML CausalForestDML with `10-heterogeneous-effects`.
- Need sparse linear controls: use post-double-selection via `hdm`.
- Need ML as a plugin inside AIPW/TMLE: ask main to route `21-doubly-robust-estimation`.
- Need IV with high-dimensional controls: use DML IV only with `05-instrumental-variables` support.
- Need quick robust reporting: run repeated splits, simple benchmarks, and learner sensitivity before trusting one DML estimate.
- Need high-stakes inference: prefer mature packages with explicit standard errors and document all split/tuning decisions.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [DoubleML docs](https://docs.doubleml.org/stable/), [DoubleMLData](https://docs.doubleml.org/stable/api/generated/doubleml.data.DoubleMLData.html), [DoubleMLPLR](https://docs.doubleml.org/stable/api/generated/doubleml.plm.DoubleMLPLR.html)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. DML depends on sample splitting and learner choices; preserve all split/tuning decisions. Save outputs inside the active `analysis_dir`, update the unit `manifest.json`, and mirror report-relevant source, table, figure, diagnostic, and large-artifact paths into `artifact_index`.

```python
# Tiny sketch, not a complete script.
# Replace columns and learners; treatment target must be low-dimensional.
from doubleml import DoubleMLData, DoubleMLPLR

dml_data = DoubleMLData(df, y_col="Y", d_cols="A",
                        x_cols=["X1", "X2", "X3"])
dml = DoubleMLPLR(dml_data, ml_l=learner_y, ml_m=learner_a,
                  n_folds=5)
dml.fit()
```

Artifact outputs to preserve: DML estimate table path, learner/split sensitivity diagnostic path, source code path.
