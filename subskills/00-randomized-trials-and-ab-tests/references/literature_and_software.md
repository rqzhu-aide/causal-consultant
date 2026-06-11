# Literature And Software Map

Use this reference when choosing experiment estimators, diagnostics, packages, or report language. Package and software details are reference-only; the specialist writes one `method_task_results` item, artifact_index entries only for execution-created artifacts, and one council entry through the shared method/task contract.

## Core Ideas

- Randomization identifies effects of assignment for the randomized eligible population.
- ITT is the default randomized estimand when assignment is intact.
- Treatment receipt, per-protocol, triggered-user, or as-treated effects need a different estimand and usually additional assumptions.
- Randomization does not fix post-assignment selection, missing outcomes, interference, multiplicity, or mismatched uncertainty.

## Minimal Math

- ITT by assignment: `tau_ITT = E[Y | Z = 1] - E[Y | Z = 0]`. This is the effect of being assigned, not necessarily receiving treatment.
- CACE/LATE for noncompliance: `tau_CACE = (E[Y | Z = 1] - E[Y | Z = 0]) / (E[D | Z = 1] - E[D | Z = 0])`. Use only when IV assumptions for assignment-as-instrument are credible.
- CUPED adjustment: `Y_adj = Y - theta * (X_pre - mean(X_pre))`. This is a precision tool using pre-assignment information; it does not change the randomized estimand.

## Selected Literature

- Neyman (1923/1990): finite-population potential-outcomes foundation for randomized experiments.
- Fisher (1935): randomization and permutation-test logic.
- Rubin (1974) and Holland (1986): potential outcomes and causal estimand clarity.
- CONSORT 2010: flow, outcomes, subgroup/adjusted analyses, and interpretation for trials.
- ICH E9(R1): estimand framework for treatment condition, population, endpoint, intercurrent events, and summary measure.
- Lin (2013): robust interacted covariate adjustment for randomized experiments.
- Deng et al. (2013): CUPED variance reduction for online experiments.
- Kohavi, Tang, and Xu (2020): online controlled experiments, SRM, triggering, guardrails, and trustworthy A/B testing.
- Angrist, Imbens, and Rubin (1996): LATE/CACE for encouragement and noncompliance.

## Package And Tool Lanes

| Need | R options | Python options | Notes |
|---|---|---|---|
| Simple ITT | `estimatr`, `lm`, `sandwich`, `lmtest` | `statsmodels` | keep design and uncertainty aligned |
| Blocked or clustered experiments | `randomizr`, `estimatr`, `clubSandwich`, `fixest` | `statsmodels` cluster covariance | few clusters need caution |
| Randomization inference | `ri2`, `randomizationInference`, custom randomization code | `scipy.stats.permutation_test`, custom resampling | requires known assignment mechanism |
| Online A/B testing | custom SRM/CUPED code, `estimatr`, `fixest` | `statsmodels`, `scipy`, custom SRM/CUPED | triggered analyses change interpretation |
| Noncompliance/CACE | `estimatr::iv_robust`, IV packages | `statsmodels` IV support or other IV tooling | recommend `05-instrumental-variables` review for IV assumptions |
| Report tables | `broom`, `modelsummary`, `gt` | `pandas`, `statsmodels` summaries | formatting does not validate design |
| Heterogeneity or uplift | `grf`, `causalToolbox`, ML packages | `EconML`, `causalml`, `scikit-uplift` | target-goal support, not primary design |

## Practical Selection Rules

- Start with transparent ITT unless the user explicitly needs a different estimand.
- Use covariate adjustment, ANCOVA, or CUPED for precision only when covariates are pre-treatment.
- Use cluster-aware or block-aware uncertainty when assignment or dependence requires it.
- Use randomization inference when assignment is known and asymptotic assumptions are weak.
- Treat unplanned subgroup, outcome, or time-window findings as exploratory without prespecification or validation.
- Recommend connected method/task review when the user goal is CACE, spillovers, heterogeneity, policy learning, transport, survival, DR, or DML.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [estimatr `difference_in_means`](https://declaredesign.org/r/estimatr/reference/difference_in_means.html), [SciPy `permutation_test`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.permutation_test.html)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after the relevant gatekeeper status is ready or appropriately qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. When execution is authorized, create only outputs implied by the active step's `execution.scope`, `execution.claim_boundary`, and `execution.expected_outputs` inside `execution.analysis_dir`; write `artifact_index` entries for produced source, note, manifest, result artifacts, and subskill-specific paths.

```r
# Tiny sketch, not a complete script.
# Replace Y, A, block, and cluster with project-specific names.
library(estimatr)

itt <- difference_in_means(Y ~ A, data = analysis_data,
                           blocks = block, clusters = cluster)
srm_table <- table(analysis_data$A)
attrition_table <- with(analysis_data, table(A, observed_outcome = !is.na(Y)))
```

Execution output examples for `result_artifacts` or `subskill_specific`: ITT table path, SRM/attrition diagnostic path, source code path.
