# Regression Discontinuity Workflow

Use this file when RD support needs more detail than `SKILL.md`. Keep the workflow local, design-based, and focused on what the cutoff can actually identify.

## 1. Establish The Cutoff Design

Record:

- running or forcing variable and how it was measured;
- cutoff value, units, timing, and source of the assignment rule;
- treatment/exposure/eligibility/intensity definition on each side of the cutoff;
- whether the design is sharp, fuzzy, kink, geographic, time cutoff, multiple cutoff, or local-randomization;
- outcome timing relative to assignment;
- unit of analysis, cluster level, and sample inclusion rule.

Ask `domain_expert` to confirm the institutional, scientific, clinical, product, or policy meaning of the cutoff. Ask whether units know the rule, can manipulate the running variable, or face incentives to sort around the threshold.

## 2. Identify The Local Estimand

RD generally supports a local effect at the cutoff:

- sharp RD: average treatment effect at the cutoff;
- fuzzy RD: local average treatment effect for compliers at the cutoff;
- regression kink: local effect of a marginal change in treatment/intensity induced by a slope change;
- local randomization RD: finite-sample treatment contrast inside a justified local window;
- geographic RD: boundary-local effect with geographic comparability assumptions.

If the user wants an ATE for a broad population, activate `24-transportability-generalizability` or mark the broad claim unsupported until a separate extrapolation argument exists.

## 3. Request Minimal Data Evidence

The first pass should be small and practical:

- plot treatment receipt or exposure intensity by running variable;
- plot outcome by running variable with the cutoff marked;
- count observations on each side inside candidate windows;
- run density/manipulation checks;
- check predetermined covariate continuity;
- identify heaping, rounding, missingness, duplicate scores, and boundary sample exclusions.

For time cutoff designs, request plots before and after the date plus notes about seasonality, shocks, and concurrent interventions. For geographic RD, request maps or boundary-distance construction evidence.

## 4. Choose The RD Lane

Use these choices as defaults:

- continuous score, sharp jump: `rdrobust`, `rdbwselect`, `rdplot`;
- fuzzy compliance: `rdrobust(..., fuzzy=...)` or local IV plus `12-instrumental-variables`;
- discrete score or very narrow local window: `rdlocrand` local randomization workflow;
- multiple cutoffs/scores: `rdmulti`;
- planning before data collection: `rdpower`;
- density/manipulation focus: `rddensity`;
- Python-only exploratory work: Python `rdrobust`, CausalPy for sharp RD, or custom `statsmodels` local-linear benchmark.

Prefer R/Stata `rdrobust` suite or the official Python `rdrobust` implementation for production RD inference when possible.

## 5. Diagnostics Before Interpretation

Minimum report-ready diagnostics:

- treatment jump or first stage;
- density/manipulation check;
- covariate continuity for predetermined covariates;
- bandwidth sensitivity;
- local polynomial order/kernel/inference specification;
- visual RD plot with bins and fitted curves;
- local sample counts;
- local estimand wording.

Add when relevant:

- donut RD for sorting/heaping right at the cutoff;
- placebo cutoffs or placebo outcomes;
- alternative bandwidth selectors;
- cluster-robust or randomization inference;
- local randomization balance/window checks;
- geographic balance/spillover diagnostics;
- time-series diagnostics for date cutoffs.

## 6. Coordinate With The Core Team

Ask `domain_expert` for:

- assignment-rule meaning;
- manipulation incentives;
- simultaneous policy changes;
- whether the local cutoff population is meaningful;
- interpretation limits.

Ask `data_analyst` for:

- running-variable construction and cutoff coding;
- plots, tests, bandwidth support, sample counts;
- data quality issues near the cutoff;
- reproducible scripts and figures.

Ask `method_lead` for:

- local estimand and causal wording;
- continuity/local-randomization assumptions;
- related subskills;
- diagnostics and sensitivity requirements.

## 7. Report Integration

The report writer should include an RD section only if this module is activated or its diagnostics materially affect the analysis. The section should not imply a broad causal effect unless the main team has separately justified transportability.

Recommended section structure:

1. Cutoff assignment rule and local estimand.
2. Data, running variable, cutoff, and local sample.
3. RD estimator and software.
4. Validity diagnostics: treatment jump, density, covariates.
5. Main local estimate and bandwidth/sensitivity evidence.
6. Limitations and scope of interpretation.
7. Appendix links for code, plots, diagnostics, and alternate specifications.

## 8. Common Failure Modes

- The threshold is only an analyst-created split, not an assignment rule.
- Treatment or exposure does not jump at the cutoff.
- The running variable is measured after treatment.
- Units precisely sort around the cutoff.
- The cutoff coincides with another policy, measurement, or reporting change.
- The sample near cutoff is too small for stable inference.
- The design is a date cutoff but the analysis ignores trends, seasonality, and shocks.
- The report states a population-wide effect when only a local cutoff effect was supported.
