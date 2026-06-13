# Design Frame: descriptive_association

Use this file only for approved non-causal descriptive or association analysis. This is not a causal design. It is an absolute fallback when causal identification is not supportable, or when the user explicitly wants association-only results.

Do not use this route to strengthen causal wording, choose adjustment sets for causal interpretation, or imply that observed associations estimate effects.

## Assignment

Find the `next_step_plan` entry with `id: analysis_execution` and `design: descriptive_association`. Use that entry's `task`, `mode`, and `analysis_precheck` as the assignment. If no matching analysis-execution entry exists, do not proceed with design-route work.

After finding a matching `analysis_execution` entry, load `references/design_support_workflow.md` and follow its gate, mode, and artifact-records rules. Support routes do not load that shared workflow; this route owns any combined design/support `artifact_records` write, but only in approved deep execution.

If `analysis_precheck` is missing, treat it as `false`. If `analysis_precheck: false`, `mode` must be `shallow`: prepare readiness notes only. Do not run analysis, create output folders, append `artifact_records`, create analysis output, or mark artifacts as analysis results.

If `analysis_precheck: true`, `mode` should be `deep`: execute only the approved non-causal task using available data/artifacts. If a support route is also named, keep support work inside the descriptive/association scope.

## Use When

- causal_check says causal identification is not supportable, but association-only analysis is useful
- the user asks for descriptive summaries, group comparisons, correlations, screening, exploratory associations, or non-causal pattern finding
- the task is to understand data structure, candidate relationships, signal strength, reporting limitations, or hypotheses for future causal work

Do not use when a causal design is supportable and should be selected instead.

## Data Contract

Record what is observed, not what is intervened on:

- analysis population and inclusion/exclusion rules
- variables to summarize or compare
- outcome scale, measurement timing, and missingness
- grouping/exposure variable, if any, without treating it as assigned treatment
- repeated measures, clusters, sites, batches, or other dependence
- transformations, winsorization, normalization, compositional handling, or zero handling
- planned multiplicity family for many tests or many outcomes

Facts that usually must be inspected: sample size, cell/event counts, missingness, dependence, outliers, sparse categories, skew, zero inflation, and whether variables were measured before or after each other.

## Analysis Lanes

Choose the simplest lane that answers the approved non-causal question:

- Descriptive summaries: counts, denominators, means/SDs, medians/IQRs, proportions, rates, standardized summaries, missingness tables, and plots.
- Two-group comparisons: Welch t-test, paired t-test, Mann-Whitney, Wilcoxon signed-rank, permutation tests, standardized mean differences, risk/rate/proportion differences.
- Multi-group comparisons: ANOVA, Welch ANOVA, Kruskal-Wallis, aligned-rank or permutation tests, post-hoc contrasts with multiplicity control.
- Categorical association: chi-square, Fisher/exact tests, trend tests, Cramer's V, odds/risk ratios as descriptive associations.
- Continuous association: Pearson, Spearman, Kendall, robust correlation, partial correlation as descriptive adjustment, spline/GAM summaries, scatter/smoother plots.
- Regression summaries: linear, logistic, ordinal, multinomial, Poisson, negative binomial, zero-inflated, mixed or clustered models when needed for dependence; report as adjusted associations, not effects.
- High-dimensional screening: univariate screening, penalized association models, dimension reduction, stability summaries, volcano/forest/heatmap displays, and validation splits when prediction-like screening is used.
- Time-to-event association: Kaplan-Meier summaries, log-rank tests, Cox or flexible survival regression as associational summaries only.

## Multiplicity And Robustness

For many outcomes, predictors, subgroups, taxa, features, or timepoints, define the testing family before interpreting results.

Common choices:

- Holm or Bonferroni for small confirmatory families
- Benjamini-Hochberg FDR for exploratory feature screens
- Benjamini-Yekutieli or permutation FDR when strong dependence is a concern
- q-values, local FDR, or empirical-null checks for high-dimensional screens
- bootstrap or permutation intervals when distributional assumptions are weak
- rank-based, robust, transformed, or sensitivity versions for skew, outliers, or sparse support

Report effect sizes and uncertainty next to p-values. Do not treat multiplicity-adjusted significance as causal evidence.

## Required Diagnostics

Run or request the diagnostics relevant to the approved lane:

- missingness and denominator table
- cell counts, sparse strata, event counts, and separation checks
- distribution, outlier, zero inflation, and transformation checks
- dependence checks for repeated measures, clusters, families, sites, batches, or time
- model residuals, calibration, influence, dispersion, and nonlinearity checks where models are used
- multiplicity family, adjusted p-values, and unadjusted p-values clearly labeled
- robustness to plausible transformations, nonparametric alternatives, and exclusion of extreme values

## Packages

Use package choice after the data shape and approved lane are clear.

- R: `stats`, `rstatix`, `coin`, `exact2x2`, `WRS2`, `broom`, `effectsize`, `emmeans`, `multcomp`, `qvalue`, `Hmisc`, `psych`, `mgcv`, `lme4`, `glmmTMB`, `survival`.
- Python: `pandas`, `scipy.stats`, `statsmodels`, `pingouin`, `scikit-posthocs`, `sklearn`, `lifelines`, `seaborn`, `matplotlib`, `numpy`.

## State Write

In approved deep execution, append one compact `artifact_records` entry according to `references/design_support_workflow.md`. Include descriptive-association specifics in the entry summary or in a note/manifest inside the output location, such as:

- variables and outcomes summarized
- association lane and multiplicity control
- key patterns, null findings, and unstable findings
- missingness, support, dependence, and model limits
- explicit statement that results are non-causal
- recommended next step for causal_check, data_audit, domain_expert, or report_writer

Do not update `project_summary` or `next_step_plan`; `team_lead` handles aggregate state after the route finishes.

## Boundary

Use wording like "observed association," "descriptive difference," "pattern in this dataset," or "hypothesis-generating result." Avoid "effect," "impact," "caused by," "protective," "harmful," "mediated," or "adjusted causal estimate" unless a separate causal design supports that claim.
