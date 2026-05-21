# Literature And Software Map

Use this file to choose credible survival, competing-risk, and causal survival tools. Keep the main team focused on the causal target, time zero, event/censoring definitions, horizon support, and whether the model is an estimator, a diagnostic, or a nuisance/prediction plugin.

## Core Survival Literature

### Survival Foundations

- Cox (1972), [Regression Models and Life-Tables](https://doi.org/10.1111/j.2517-6161.1972.tb00899.x): proportional hazards model foundation.
- Kaplan and Meier (1958), [Nonparametric Estimation from Incomplete Observations](https://doi.org/10.1080/01621459.1958.10501452): Kaplan-Meier survival curve foundation.
- Kalbfleisch and Prentice (2002), [The Statistical Analysis of Failure Time Data](https://onlinelibrary.wiley.com/doi/book/10.1002/9781118032985): standard survival text.
- Therneau and Grambsch (2000), [Modeling Survival Data: Extending the Cox Model](https://link.springer.com/book/10.1007/978-1-4757-3294-8): practical Cox extensions, diagnostics, and counting-process data structures.
- Andersen et al. (1993), [Statistical Models Based on Counting Processes](https://link.springer.com/book/10.1007/978-1-4612-4348-9): counting-process survival and multi-state foundations.

### Causal Survival, Censoring, And Target Trials

- Hernan and Robins (2020), [Causal Inference: What If](https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/): target trials, time-to-event outcomes, censoring, IP weighting, and g-method logic.
- Robins, Hernan, and Brumback (2000), [Marginal Structural Models and Causal Inference in Epidemiology](https://doi.org/10.1097/00001648-200009000-00011): MSM/IPW foundations for time-varying treatment and censoring.
- Hernan et al. (2008), [Observational studies analyzed like randomized experiments](https://doi.org/10.1097/EDE.0b013e3181875e61): target trial framing and immortal-time avoidance.
- Hernan (2010), [The hazards of hazard ratios](https://doi.org/10.1097/EDE.0b013e3181c1ea43): caution that hazard ratios can be hard to interpret causally.
- Young et al. (2014), [Identification, estimation and approximation of risk under interventions that depend on the natural value of treatment](https://doi.org/10.1097/EDE.0000000000000131): survival-style g-method intervention targets.

### RMST, Fixed-Time Risk, And Absolute Survival Contrasts

- Royston and Parmar (2013), [Restricted mean survival time: an alternative to the hazard ratio](https://doi.org/10.1186/1471-2288-13-152): practical RMST motivation.
- Uno et al. (2014), [Moving beyond the hazard ratio in quantifying the between-group difference in survival analysis](https://doi.org/10.1200/JCO.2014.55.2208): RMST contrasts in clinical reports.
- Tian et al. (2014), [Predicting the restricted mean event time with the subject's baseline covariates](https://doi.org/10.1093/biostatistics/kxt050): covariate-adjusted RMST prediction and individualized summaries.

### Competing Risks And Multi-State Thinking

- Fine and Gray (1999), [A proportional hazards model for the subdistribution of a competing risk](https://doi.org/10.1080/01621459.1999.10474144): Fine-Gray subdistribution hazards.
- Andersen and Keiding (2002), [Multi-state models for event history analysis](https://doi.org/10.1191/0962280202SM276ra): multi-state framing for event histories.
- Austin, Lee, and Fine (2016), [Introduction to the analysis of survival data in the presence of competing risks](https://doi.org/10.1161/CIRCULATIONAHA.115.017719): applied competing-risk guidance.

### Flexible Prediction, Forests, And Survival CATE

- Ishwaran et al. (2008), [Random survival forests](https://doi.org/10.1214/08-AOAS169): random survival forest foundation.
- Ishwaran et al. (2014), [Random survival forests for competing risks](https://doi.org/10.1093/biostatistics/kxu010): forest support for competing-risk prediction.
- Athey, Tibshirani, and Wager (2019), [Generalized random forests](https://doi.org/10.1214/18-AOS1709): forest framework that motivates causal forests and survival extensions.
- Cui et al. (2023), [Causal Survival Forests](https://doi.org/10.1177/09622802231211009): survival CATE and treatment-effect forest approach for right-censored outcomes.
- Kvamme, Borgan, and Scheel (2019), [Time-to-event prediction with neural networks and Cox regression](https://jmlr.org/papers/v20/18-424.html): neural survival prediction and `pycox` context.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`survival`](https://cran.r-project.org/package=survival) | R | Cox, AFT, Kaplan-Meier, counting-process data, delayed entry | Mature foundation package; strong diagnostics and formula support | Cox summaries need PH and careful causal interpretation |
| [`survminer`](https://cran.r-project.org/package=survminer) | R | Publication-ready survival plots | Easy KM/Cox visualization | Plotting support, not causal estimation |
| [`survRM2`](https://cran.r-project.org/package=survRM2) | R | RMST contrasts | Clear absolute survival-time contrasts | Requires pre-specified tau and support |
| [`adjustedCurves`](https://cran.r-project.org/package=adjustedCurves) | R | Adjusted survival and competing-risk curves | Supports multiple adjustment approaches and reportable curves | Design/adjustment validity still required |
| [`cmprsk`](https://cran.r-project.org/package=cmprsk) | R | CIF estimation and Fine-Gray regression | Standard competing-risk implementation | Subdistribution hazard is not the same as cause-specific hazard |
| [`riskRegression`](https://cran.r-project.org/package=riskRegression) | R | Absolute risk prediction, competing risks, model evaluation | Strong prediction/error metrics and CIF workflows | Mostly prediction/evaluation unless causal design supplies identification |
| [`prodlim`](https://cran.r-project.org/package=prodlim) | R | KM/Aalen-Johansen and prediction support | Useful backend for curves and risk regression | Lower-level support package |
| [`pec`](https://cran.r-project.org/package=pec) | R | Prediction error curves, Brier score, C-index | Good survival model evaluation | Prediction diagnostics only |
| [`flexsurv`](https://cran.r-project.org/package=flexsurv) | R | Flexible parametric survival/AFT models | Interpretable parametric extrapolation and multi-parameter distributions | Parametric assumptions matter, especially extrapolation |
| [`rstpm2`](https://cran.r-project.org/package=rstpm2) | R | Flexible parametric survival models | Smooth baseline hazards and absolute risk predictions | Requires modeling skill and diagnostics |
| [`randomForestSRC`](https://cran.r-project.org/package=randomForestSRC) | R | Random survival forests and competing-risk forests | Mature survival/competing-risk forest implementation | Prediction/nuisance support unless causal target is separately identified |
| [`ranger`](https://cran.r-project.org/package=ranger) | R | Fast survival forests | Scales well and integrates into ML pipelines | Less causal-specific reporting support |
| [`glmnet`](https://glmnet.stanford.edu/) | R/Python | Penalized Cox nuisance or prediction model | Stable high-dimensional baseline | Nuisance/prediction only by itself |
| [`grf`](https://grf-labs.github.io/grf/reference/causal_survival_forest.html) | R | Causal survival forest for heterogeneous effects with censoring | Direct survival CATE support with forest diagnostics | Needs appropriate target, support, event counts, and `20` coordination |
| [`lifelines`](https://lifelines.readthedocs.io/) | Python | KM, Cox, AFT, Aalen-Johansen, survival diagnostics | Friendly Python survival toolkit | Limited causal survival estimators |
| [`scikit-survival`](https://scikit-survival.readthedocs.io/) | Python | Coxnet, random survival forest, boosting, Brier/AUC metrics | Strong sklearn-style prediction/nuisance tooling | Causal claims require external design/estimator logic |
| [`statsmodels` duration](https://www.statsmodels.org/stable/duration.html) | Python | Cox proportional hazards through PHReg | Familiar statsmodels ecosystem | More limited survival ecosystem than R |
| [`pycox`](https://github.com/havakv/pycox) | Python | Neural survival prediction | Useful high-dimensional prediction/nuisance candidate | Prediction-oriented; inference and causal validity limited |
| [`xgbse`](https://loft-br.github.io/xgboost-survival-embeddings/) | Python | XGBoost survival embeddings and calibrated curves | Practical gradient-boosted survival predictions | Prediction/nuisance support, not identification |

## Practical Selection Rules

- Need a reportable causal effect for survival outcome: start with target scale and horizon, not Cox by default.
- Need a transparent clinical summary: fixed-time risk/survival or RMST is often more interpretable than hazard ratios.
- Need conventional survival regression: use `survival::coxph`, but report PH diagnostics and avoid overclaiming hazard ratios.
- Need competing-risk absolute risk: use CIF/Aalen-Johansen or riskRegression-style absolute risk workflows.
- Need competing-risk regression: use Fine-Gray for subdistribution summaries or cause-specific Cox for etiologic process summaries; explain the distinction.
- Need flexible nuisance models: use `survival`, `glmnet`, `randomForestSRC`, `ranger`, `scikit-survival`, `lifelines`, `pycox`, or `xgbse` inside DR/DML/g-method workflows with cross-fitting when needed.
- Need survival heterogeneity: coordinate with `20-heterogeneous-effects`; consider `grf::causal_survival_forest` or survival-adapted meta-learners only when the target and censoring assumptions are explicit.
- Need longitudinal treatment with survival outcome: coordinate with `09-longitudinal-gmethods`; survival module supplies event-time and censoring support only.
- Need high-stakes inference: prefer mature estimators with explicit uncertainty, pre-specified horizons, robust sensitivity checks, and simple benchmark analyses.
