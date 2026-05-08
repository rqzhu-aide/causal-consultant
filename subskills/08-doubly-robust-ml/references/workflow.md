# Workflow: Doubly Robust and Orthogonal ML

## Purpose

Use this workflow when the causal design and adjustment set are already plausible, but the estimator needs AIPW, TMLE, one-step estimation, DoubleML, orthogonal scores, cross-fitting, Super Learner, or flexible nuisance models.

This workflow is about estimation after identification. It should not be used to skip the design audit.

## Stage 1: Parent Route and Estimand

Confirm:

- parent causal route;
- treatment and comparator;
- outcome and scale;
- target population;
- estimand;
- valid adjustment set or design-specific identification condition;
- whether missingness, censoring, clustering, or repeated units affect splitting and inference.

If the parent route is unresolved, route back to the appropriate design subskill.

## Stage 2: Nuisance Components

Identify nuisance models:

- outcome regression, often \(E[Y \mid A, X]\);
- treatment or propensity model, often \(P(A=1 \mid X)\);
- censoring or missingness model, when needed;
- final-stage CATE/policy model, when HTE is the target.

Make sure all nuisance covariates are valid for the parent design. Do not include post-treatment variables for better prediction in a total-effect analysis.

## Stage 3: Method Choice

Choose one method family:

- AIPW for a direct doubly robust point-treatment estimator;
- TMLE when a targeted substitution estimator and bounded predictions are useful;
- one-step estimator when the influence-function approach is explicit;
- DoubleML PLR when the target is a partially linear coefficient;
- DoubleML IRM when the target is an ATE/ATTE under binary treatment with flexible nuisances;
- DRLearner or causal forest DML when heterogeneity is the target, usually with `09-heterogeneous-effects-policy`;
- survival or censoring-specific DR/TMLE when the endpoint requires `15-survival-competing-risks` or `02-data-technician`.

Choose one simpler comparator, such as adjusted regression, IPW, matching/weighting estimate, or a simpler learner library.

## Stage 4: Cross-Fitting and Implementation Plan

Specify:

- fold count and repeated cross-fitting if needed;
- split unit: individual, cluster, site, household, time block, or other;
- learner library for each nuisance component;
- treatment/outcome type support;
- propensity truncation or bounds;
- random seeds and software versions;
- inference method: influence-curve SE, package SE, bootstrap, cluster-robust method, or repeated-split summary.

Use cluster- or group-aware splitting when rows are dependent. Use stratified splits when treatment or outcome is rare.

## Stage 5: Diagnostics

Report:

- overlap and propensity distribution;
- nuisance model performance and calibration;
- extreme weights or clever covariates;
- influence-curve or score distribution;
- fold-specific estimates and failures;
- estimate sensitivity to learner library, trimming, and covariate set;
- comparison to the simpler estimator.

Do not rely only on predictive performance. The nuisance models support a causal score; the final estimate still depends on identification and overlap.

## Stage 6: Interpretation and Fallback

Interpret:

- the causal estimate and uncertainty;
- what assumptions come from the parent route;
- what double robustness protects against;
- what it does not protect against;
- whether diagnostics support final reporting or only exploratory analysis.

If diagnostics fail:

- simplify learner library;
- change fold strategy;
- improve preprocessing;
- trim or narrow target population;
- route to matching/weighting for design repair;
- route to missingness/censoring/survival/longitudinal methods;
- report sensitivity or descriptive findings only.

## Suggested Response Pattern

```markdown
I would treat this as a doubly robust / orthogonal ML problem because [reason], assuming the parent causal route is [route].

The target estimand is [estimand] on [scale]. The nuisance pieces are [outcome model] and [treatment/censoring model].

My primary method would be [AIPW/TMLE/DoubleML/etc.] with [cross-fitting plan], and I would compare it to [simpler estimator].

The main diagnostics are [overlap], [nuisance performance], [influence-curve/score checks], and [learner sensitivity].

If [diagnostic failure] occurs, I would [fallback plan].
```

## Code Template Index

Root templates:

- `scripts/R/tmle3_aipw_template.R`
- `scripts/python/doubleml_irm_template.py`
- `scripts/python/statsmodels_treatment_effect_template.py`

Templates are skeletons. Adapt outcome type, treatment type, adjustment set, fold structure, cluster IDs, learner library, and inference method before returning runnable code.

## Literature and Software Map

For key papers, textbooks, and software notes, read `literature_and_software.md` in this folder.
