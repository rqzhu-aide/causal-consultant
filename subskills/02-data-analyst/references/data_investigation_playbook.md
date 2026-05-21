# Data Investigation Playbook

Use this as a menu when data are provided or the data structure is nontrivial. Do not run every item. Choose the smallest investigation that would help `domain_expert`, `method_lead`, `report_writer`, or the lead consultant make the next decision.

## General Principles

1. Start with meaning before modeling. Confirm what rows, columns, codes, timestamps, and missing values mean in the domain.
2. Separate data possibility from causal validity. Data can make a framework feasible, infeasible, or worth exploring, but identification belongs to `method_lead`.
3. Inspect severity, not just existence. Missingness, imbalance, high dimension, clustering, sparse cells, and timing problems matter by degree, role, and location.
4. Prefer decision-support artifacts. A small profile table, missingness plot, timing audit, support summary, PCA scree plot, or prototype analysis dataset is often more useful than a long explanation.
5. Preserve time order. Do not construct baseline covariates from post-exposure information, use future data in imputation, or let train/test leakage enter predictive checks.
6. Treat exploratory models as probes. Regression, random forests, PCA, clustering, or embeddings can reveal structure and feasibility, but they do not create causal identification.
7. Make domain-specific preprocessing explicit. Learn from `domain_expert` before processing specialized data: valid ranges, impossible values, measurement devices, coding conventions, standard transformations, domain packages/tools, reporting standards, clinical/business/scientific thresholds, and whether engineered features have interpretable meaning.
8. Hand off compactly. Tell `method_lead` what frameworks the data appear to support or strain, and tell `report_writer` what was inspected, what artifacts exist, and what limitations must be visible.
9. Use the ecosystem that fits the project. Python is often natural for large ML pipelines and mixed production stacks. R is often especially strong for statistical summaries, survey data, missing-data workflows, survival analysis, reproducible reports, and compact analyst-facing diagnostics.
10. Use statistical learning methods only as a causal-support toolkit. ESL-style topics such as shrinkage, splines/GAMs, trees, boosting, SVMs, nearest-neighbor methods, ensembles, and unsupervised learning can help explore construct measurement, data structure, support, missingness, heterogeneity, nuisance functions, and feature engineering. They do not by themselves justify a causal claim.

## Investigation Cycle

For any provided data, consider this cycle:

- Identify source and provenance: file/table/query, access status, date/version, and whether contents were inspected.
- Classify structure: cross-sectional, panel, repeated measures, time series, survival/time-to-event, clustered, survey, network, geospatial, text, image, high-dimensional, or mixed.
- Confirm units: row unit, causal unit, clustering/grouping, time index, subject/entity IDs, and repeated rows.
- Map constructs: exposure, comparator, outcome, covariates, IDs, time fields, censoring, sampling frame, and domain-specific derived variables.
- Import domain guidance: standards, package/tool conventions, invalid values, transformations, thresholds, and interpretation constraints learned from `domain_expert`.
- Audit timing: eligibility, time zero, baseline window, exposure window, follow-up, outcome measurement, censoring, and possible leakage.
- Quantify data health: missingness, duplicates, impossible values, outliers, support/overlap, sparse cells, class imbalance, and selection/exclusion patterns.
- Create bounded artifacts: summaries, plots, profiling tables, missingness maps, prototype datasets, feature dictionaries, or diagnostic notebooks.
- Record handoff notes: data facts, unresolved questions, artifacts, limitations, and data-compatible next steps.

## Domain Guidance Handoff

Because `domain_expert` usually reviews before `data_analyst`, treat domain guidance as input to data processing rather than as background color. Before domain-specific cleaning, feature construction, dimension reduction, or package/tool choice, ask:

- What measurements, codes, values, or units are valid or impossible in this domain?
- Are there accepted preprocessing standards, scoring rules, transformations, normalization choices, quality thresholds, or exclusion conventions?
- Are there domain-standard packages, file formats, ontologies, controlled vocabularies, pipelines, or reporting tools the analysis should respect?
- Which derived variables are scientifically meaningful, and which would be convenient but uninterpretable?
- Which summaries, plots, or diagnostics would a domain scientist expect to see?

Record the answer compactly in `data_analyst.domain_processing_guidance`. If the answer is missing and affects analysis readiness, add a `requests_for_progression` item rather than improvising a domain-specific pipeline.

## Missingness Work

When missingness appears, investigate:

- Amount: per variable, per row, by exposure/outcome/group/time/site/source, and among variables needed for the causal framework.
- Pattern: monotone dropout, block missingness, intermittent gaps, structural missingness, survey skip logic, censoring, linkage failure, or device/reporting failure.
- Mechanism hypotheses: plausibly MCAR, MAR with observed auxiliaries, MNAR, structural, administrative, or unknown.
- Role: missing exposure, missing outcome, missing confounder, missing timing, missing ID/linkage field, or missing auxiliary feature.
- Severity: whether complete-case analysis changes the target population, loses support, creates sparse cells, or threatens power/privacy.
- Imputability: whether enough pre-exposure auxiliary variables exist, whether time order can be respected, whether variable bounds/types can be preserved, and whether imputation should be only sensitivity/prototype.
- Sensitivity: compare complete-case, missing-indicator/descriptive checks, simple imputation, multiple imputation, and "missing as informative" summaries when appropriate.

Useful package families:

- `pandas` for missing-value representation, summaries, filtering, and data manipulation.
- `scikit-learn` imputers for simple and iterative imputation in predictive/prototype workflows.
- `statsmodels.imputation.mice` for MICE-style multiple imputation with model-based inference workflows.
- `missingno` or ordinary heatmaps/bar plots for missingness pattern visualization.

R package families:

- `mice` for multiple imputation workflows and imputation diagnostics.
- `naniar` for tidy missingness summaries and visualizations.
- `VIM` for missingness visualization, imputation, and imputation-process checks.
- `missForest` for random-forest imputation of mixed numeric/categorical tabular data when a predictive/prototype imputation is appropriate.
- `Amelia` can be considered for some cross-sectional/time-series-cross-sectional multiple-imputation settings, especially when its assumptions fit the design.

## High-Dimensional Or Feature-Rich Data

When the number of variables is large, features are sparse, or feature engineering is central:

- Check p/n, sparsity, near-zero variance, duplicate or highly correlated columns, and feature leakage.
- Separate unsupervised structure learning from supervised prediction. PCA or clustering can describe structure; supervised feature selection must be nested inside validation if used for prediction.
- Use PCA/eigenvalue or singular-value concentration to see whether a few dimensions dominate. Interpret components only after checking loadings and asking `domain_expert` whether the combinations make scientific sense.
- Consider domain grouping before generic reduction: scales, subscales, concept groups, time-window summaries, text topics, graph features, spatial summaries, or biologically/business-defined feature sets.
- Record whether dimension reduction is intended for visualization, noise reduction, nuisance modeling, matching/adjustment, heterogeneity exploration, or report illustration.
- Warn when dimension reduction harms interpretability, uses post-treatment information, or changes the estimand.

Useful package families:

- `scikit-learn.decomposition` for PCA, TruncatedSVD, NMF, and related reductions.
- `scikit-learn.feature_selection` for feature screening inside predictive workflows.
- `scikit-learn.manifold` or UMAP-style tools for visualization, with exploratory language.
- `seaborn`/`matplotlib` for scree plots, loadings, heatmaps, and pairwise summaries.

R package families:

- base R `stats::prcomp()` for standard PCA and eigenvalue/scree checks.
- `recipes::step_pca()` for PCA inside reproducible tidymodels preprocessing pipelines.
- `FactoMineR` and `factoextra` for exploratory multivariate analysis, PCA/MCA/FAMD-style workflows, and readable visual diagnostics.
- `irlba` for fast truncated SVD/PCA on larger or sparse matrices.
- `uwot` for UMAP-style exploratory visualization when nonlinear embeddings are useful, with clear non-causal language.
- `glmnet`, `ranger`, or `tidymodels` can support predictive screening or nuisance-model prototypes, but use validation and avoid interpreting selected features as causal by default.

## Flexible Learners Inside Causal Analyses

Use this menu only when flexible modeling clarifies a causal-consulting decision or could serve as a plugin inside a causal method subskill. `data_analyst` is not a supervised-learning specialist. These tools are probes and implementation options that produce evidence for `domain_expert`, `method_lead`, `report_writer`, or the lead consultant.

Before using these tools, answer:

- What causal-project question will this clarify?
- Which reviewer or report section will use the result?
- Is the input restricted to information available at the right causal time?
- Will the result be used as a diagnostic/prototype, a nuisance model inside an approved framework, or a report artifact?
- What would change if the result looks good, bad, unstable, or uninterpretable?

Valid causal-support purposes:

- Construct validation: check whether observed variables or derived features plausibly represent the domain construct, then ask `domain_expert` to interpret them.
- Data feasibility: test whether exposure, comparator, outcome, baseline covariates, follow-up, censoring, or analysis units are constructible.
- Missingness and selection diagnosis: model or summarize who is missing, censored, selected, linked, or excluded, and whether this threatens the target population or estimand.
- Support and overlap: estimate exposure/propensity patterns, sparse regions, separability, influential subgroups, and whether the planned comparison has empirical support.
- High-dimensional pre-treatment adjustment: reduce or regularize large covariate sets when the candidate framework needs adjustment or nuisance modeling.
- Nuisance-function feasibility: prototype outcome, treatment, censoring, or missingness models for doubly robust, DML, TMLE, weighting, survival, or g-method workflows selected by `method_lead`.
- Exploratory heterogeneity: find candidate subgroup, interaction, time/site, or effect-modifier patterns for review, not final causal discovery.
- Sensitivity and diagnostics: benchmark simple versus flexible specifications, residual patterns, calibration, influential observations, or robustness of constructed features.
- Report support: create reproducible plots, tables, validation summaries, and cautious language for `report_writer`.

Learner-plugin handoff to method/job subskills:

- Outcome model plugin: replace or augment linear/logistic outcome regression with GAMs, forests, boosting, elastic net, or Super Learner when the selected framework uses outcome modeling, AIPW, TMLE, g-computation, survival prediction, or DML-style nuisance functions.
- Treatment/propensity model plugin: replace or augment logistic/multinomial treatment models with regularized models, forests, boosting, or Super Learner for propensity scores, weighting, matching diagnostics, overlap checks, or doubly robust workflows.
- Censoring/missingness model plugin: use flexible learners for censoring weights, missingness diagnostics, inverse-probability weights, or sensitivity checks when time order and auxiliary variables are appropriate.
- Feature-reduction plugin: use PCA/SVD, grouped summaries, screening, penalization, or domain-informed embeddings for high-dimensional pre-treatment covariates before adjustment, matching, nuisance modeling, or exploratory heterogeneity.
- Heterogeneity plugin: use causal forests/`grf`, uplift-style learners, trees, or interaction screens only when heterogeneity/CATE is part of the question or an exploratory add-on approved by `method_lead`.
- Diagnostic plugin: use flexible models to benchmark simple specifications, identify nonlinearities/interactions, detect separability, check calibration, locate poor-support regions, or reveal subgroup/time/site instability.

For every handoff, specify:

- causal framework and model role;
- simple model being replaced or augmented;
- candidate learner families or packages;
- data facts supporting the learner choice;
- leakage/timing constraints;
- diagnostics, tuning, and sensitivity checks required;
- whether the result is production-ready, exploratory, or only a feasibility probe.

Core checks:

- Preserve design order: no post-treatment features in baseline models; no future data in imputation or prediction; no leakage across train/test, entities, or time.
- Use resampling, cross-validation, or held-out checks when prediction quality matters.
- Report tuning, preprocessing, and variable screening as exploratory unless they are part of a locked production pipeline.
- Treat variable importance, selected features, and nonlinear patterns as clues for team review, not causal mechanisms.

Topic families, when tied to one of the causal-support purposes or plugin roles above:

- Shrinkage and regularization: ridge, lasso, elastic net, group penalties, sparse GLMs, and path algorithms.
- Basis expansions and smoothers: splines, polynomial bases, kernel smoothing, generalized additive models, and interaction screens.
- Tree-based learning: CART-style trees, random forests, bagging, gradient boosting, and additive trees.
- Kernel and margin methods: support vector machines, kernel methods, and flexible discriminants.
- Prototype/local methods: nearest neighbors, local regression, clustering-based summaries, and representative-case checks.
- Neural networks: mainly for prediction or feature extraction when sample size, validation, and interpretability constraints allow.
- Ensemble and Super Learner workflows: stacked or cross-validated learner libraries for nuisance prediction, imputation prototypes, or benchmark comparisons.
- Unsupervised learning: PCA/SVD, NMF, mixture models, k-means, hierarchical clustering, spectral clustering, and anomaly detection.
- Model assessment and selection: cross-validation, bootstrap, calibration, ROC/PR curves, residual diagnostics, and error analysis by subgroup/time/site.

Python package families:

- `scikit-learn.linear_model` for ridge/lasso/elastic-net-style models and regularized logistic regression.
- `glmnet` Python bindings if available in the environment, or `sklearn` alternatives when not.
- `scikit-learn.preprocessing`, `SplineTransformer`, `KernelRidge`, and `pygam`-style tools for smooth nonlinear probes.
- `scikit-learn.tree`, `ensemble`, `svm`, `neighbors`, `mixture`, `cluster`, `decomposition`, and `model_selection` for trees, forests, boosting, SVMs, nearest neighbors, mixtures, clustering, decomposition, and validation.
- `xgboost`, `lightgbm`, or `catboost` when gradient boosting is useful and available.
- `tensorflow`, `keras`, or `torch` only when a neural-net probe is justified by scale and the team can validate it.

R package families:

- `glmnet` for lasso, ridge, elastic net, penalized GLMs, multinomial models, Poisson models, and Cox models.
- `ncvreg` or `grpreg` when nonconvex penalties or grouped penalties are relevant.
- `mgcv`, `splines`, `gamlss`, or `earth` for splines, GAMs, and flexible-but-readable nonlinear probes.
- `rpart`, `partykit`, `randomForest`, `ranger`, `gbm`, `xgboost`, `lightgbm`, or `catboost` for trees, forests, bagging, and boosting.
- `e1071` or `kernlab` for SVMs and kernel-method probes.
- `FNN`, `class`, `cluster`, `mclust`, `dbscan`, `NMF`, or base `stats` for nearest neighbors, clustering, mixture models, NMF, and unsupervised structure checks.
- `tidymodels`, `caret`, or `mlr3` for unified model training, resampling, tuning, and comparison.
- `SuperLearner`, `sl3`, `stacks`, or `workflowsets` for learner libraries, stacking, and benchmark comparisons.
- `grf` for generalized random forests, including causal forests and related forest-based estimators when the selected framework and estimand justify them.
- `DoubleML`, `tmle3`, or `drtmle` when the selected framework specifically needs learner-based nuisance models in DML, TMLE, or doubly robust workflows.
- `yardstick`, `pROC`, `vip`, `DALEX`, or `iml` for model assessment, calibration/performance summaries, and interpretable predictive diagnostics.

## Specialized Data Types

Use domain and structure to choose preprocessing:

- Panel or repeated measures: check entity IDs, time index, balanced/unbalanced panels, gaps, exposure changes, clustering, lag construction, and whether rows preserve ordering.
- Time series: check frequency, gaps, seasonality, stationarity/proxy changes, intervention timing, autocorrelation, and pre/post windows.
- Survival/time-to-event: check entry time, event time, censoring time, competing events, delayed entry, interval censoring, and time-varying covariates.
- Survey data: check weights, strata, clusters, skip logic, nonresponse, and whether estimates need design-aware summaries.
- Geospatial data: check CRS/projection, spatial joins, boundary changes, distance construction, aggregation level, and spatial leakage.
- Network/interference data: check node/edge definitions, direction, weights, time-varying ties, exposure radius, and missing edges.
- Text or unstructured data: check source, de-identification, language, document unit, time stamps, preprocessing, embeddings/topics, and whether extracted features are pre-exposure.
- Images/signals: check acquisition protocol, resolution/sampling rate, preprocessing, batch/site effects, and whether feature extraction is reproducible.

Useful package families:

- `statsmodels` for statistical models, time series, and regression diagnostics.
- `lifelines` or `scikit-survival` for survival/time-to-event workflows.
- `geopandas` for geospatial dataframes and spatial operations.
- `networkx` for graph/network representation and summaries.
- `polars` when dataframe size or speed makes pandas inconvenient.

R package families:

- Tabular/data wrangling: `tidyverse` for readable analyst workflows, `data.table` for fast large-table operations, `arrow` for larger columnar files and dplyr-style work on Arrow-backed data, and `skimr` for compact data summaries.
- Panel/repeated measures: `dplyr`, `tidyr`, `lubridate`, `data.table`, `plm`, `lme4`, `nlme`, and `fixest` can help audit IDs, timing, clustering, repeated rows, and prototype models.
- Time series: `tsibble`, `fable`, `feasts`, `forecast`, and base `stats` can help check frequency, gaps, seasonality, autocorrelation, and intervention timing.
- Survival/time-to-event: `survival` is the core R workhorse; `cmprsk`, `riskRegression`, or `survminer` may help with competing risks, prediction summaries, and visualization.
- Survey data: `survey` and `srvyr` are often richer than quick Python alternatives for design-aware summaries using weights, strata, and clusters.
- Geospatial data: `sf` is the central modern R package; `terra` can help with raster/spatial data.
- Network/interference data: `igraph`, `tidygraph`, and `ggraph` can represent, summarize, and visualize network structures.
- Text/unstructured data: `quanteda`, `tidytext`, `textrecipes`, and `stm` can support document-feature matrices, text summaries, embeddings/topics, and preprocessing pipelines.

## Validation And Reproducibility

Create durable checks when data or reports will be reused:

- Use schema/data-contract checks for required columns, types, valid ranges, uniqueness, nonmissing constraints, and relational integrity.
- Save data dictionaries, construction scripts, notebook paths, random seeds, package notes, and output paths.
- Keep sensitive values, direct identifiers, credentials, small cells, and raw private records out of YAML and public-facing reports.

Useful package families:

- `pandera` for dataframe schema validation.
- `Great Expectations` for reusable validation suites and human-readable data quality documentation.
- `pyjanitor` for readable cleaning pipelines around pandas.

R package families:

- `pointblank` or `validate` for reusable validation rules, data-quality checks, and human-readable validation outputs.
- `assertr` or `checkmate` for lightweight assertions inside scripts or functions.
- `targets` for reproducible R pipelines with dependency tracking and reruns.
- `renv` for project-specific R package environments.
- `quarto`, `rmarkdown`, `knitr`, `gt`, `gtsummary`, and `broom` for reproducible reports, tables, and model-output tidying.

## Report-Ready Handoff

After a useful investigation, send compact notes:

- To `domain_expert`: domain-specific data meanings, invalid values, derived features needing interpretation, and surprising patterns.
- To `method_lead`: data structure, constructability, timing, support, missingness, candidate diagnostics, and framework feasibility.
- To `report_writer`: inspected sources, artifacts created, key findings, limitations, cautious wording, code paths, and whether outputs are exploratory or report-ready.

## Reference Links

- pandas missing data user guide: https://pandas.pydata.org/pandas-docs/stable/user_guide/missing_data.html
- scikit-learn imputation: https://scikit-learn.org/stable/modules/impute.html
- statsmodels MICE: https://www.statsmodels.org/stable/imputation.html
- scikit-learn PCA: https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html
- scikit-learn feature selection: https://scikit-learn.org/stable/modules/feature_selection.html
- scikit-learn manifold learning API: https://scikit-learn.org/stable/api/sklearn.manifold.html
- seaborn documentation: https://seaborn.pydata.org/
- pandera documentation: https://pandera.readthedocs.io/
- Great Expectations validation docs: https://docs.greatexpectations.io/docs/guides/validation/validate_data_overview/
- Polars Python API reference: https://docs.pola.rs/api/python/stable/reference/
- pyjanitor documentation: https://pyjanitor.readthedocs.io/
- statsmodels user guide: https://www.statsmodels.org/stable/user-guide.html
- lifelines documentation: https://lifelines.readthedocs.io/
- scikit-survival documentation: https://scikit-survival.readthedocs.io/
- GeoPandas documentation: https://geopandas.org/en/stable/docs.html
- NetworkX documentation: https://networkx.org/en/
- Elements of Statistical Learning official page: https://hastie.su.domains/ElemStatLearn/
- tidyverse packages: https://www.tidyverse.org/packages/
- data.table documentation: https://rdatatable.gitlab.io/data.table/
- Apache Arrow R package: https://arrow.apache.org/docs/r/
- skimr documentation: https://docs.ropensci.org/skimr/
- mice overview: https://amices.org/mice/articles/overview.html
- naniar package docs: https://naniar.njtierney.com/
- VIM package docs: https://rdrr.io/cran/VIM/
- missForest package docs: https://rdrr.io/cran/missForest/man/missForest.html
- recipes `step_pca`: https://recipes.tidymodels.org/reference/step_pca.html
- tidymodels packages: https://www.tidymodels.org/packages/
- glmnet package docs: https://glmnet.stanford.edu/
- mgcv package docs: https://cran.r-project.org/package=mgcv
- ranger package docs: https://imbs-hl.github.io/ranger/
- xgboost R package docs: https://xgboost.readthedocs.io/en/stable/R-package/
- grf documentation: https://grf-labs.github.io/grf/
- DoubleML documentation: https://docs.doubleml.org/stable/
- tmle3 manual: https://ictml-project.r-universe.dev/tmle3/doc/manual.html
- FactoMineR: https://factominer.free.fr/
- irlba package docs: https://bwlewis.github.io/irlba/
- survey package: https://r-survey.r-forge.r-project.org/survey/
- survival package: https://cran.r-project.org/package=survival
- sf package docs: https://r-spatial.github.io/sf/
- igraph R package: https://r.igraph.org/
- pointblank package docs: https://rstudio.github.io/pointblank/
- targets package docs: https://docs.ropensci.org/targets/
- renv package docs: https://rstudio.github.io/renv/
