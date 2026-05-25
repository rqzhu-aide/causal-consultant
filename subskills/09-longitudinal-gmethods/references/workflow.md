# Longitudinal G-Methods Workflow

Use this reference when `SKILL.md` is not enough for time-varying treatment, treatment histories, sustained strategies, dynamic regimes, censoring, or time-varying confounding affected by prior treatment.

## 1. Define The Longitudinal Target

Record the smallest useful longitudinal design:

- Time zero and time grid: baseline, visits, intervals, lag rules, grace periods, and follow-up end.
- Eligibility over time: who enters, remains eligible, becomes censored, or becomes no longer at risk.
- Treatment/exposure history: binary, multi-level, continuous, cumulative, intermittent, sustained, or dynamic.
- Covariate history: baseline and time-varying confounders, mediators, adherence variables, censoring predictors, and outcome predictors.
- Censoring process: loss to follow-up, administrative censoring, artificial censoring, competing events, or treatment discontinuation.
- Intervention strategy: static, sustained, dynamic, stochastic, modified treatment policy, threshold, dose accumulation, or grace-period rule.
- Outcome: final, repeated, survival, recurrent, competing-risk, cumulative, or utility outcome.
- Estimand: mean/risk/survival under a strategy, contrast between strategies, cumulative effect, regime value, or modified-treatment-policy effect.
- Model-input dataset: row structure, retained time-varying treatment/covariate/censoring/outcome histories, and source-data fields that were summarized, windowed, lagged, or collapsed before estimation.

If the user wants a learned or deployable adaptive rule, activate `25-dynamic-treatment-policies`; keep this module responsible for longitudinal identification and support.

## 2. Check Identification And Data Reality

Minimum checks before estimation:

- every treatment/censoring decision is ordered before later covariates and outcomes;
- time-varying confounders affected by prior treatment are measured before the next treatment decision;
- strategy definitions are feasible interventions, not just labels for observed behavior;
- observed histories support the candidate strategies;
- the analysis dataset actually passed to the estimator preserves the histories required by the chosen longitudinal method;
- censoring and missingness are measurable and can be modeled, bounded, or explicitly caveated;
- outcome and follow-up windows align with the strategy and target population;
- competing events and death are handled with the appropriate target question.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Sustained binary or categorical treatment, stable weights | MSM with IP treatment and censoring weights | Direct marginal contrast of strategies | Extreme weights, few adherent histories, model misspecification |
| Complex static/dynamic strategies with absolute risks | Parametric g-formula or simulation | Handles rich longitudinal covariate/outcome evolution | Outcome/covariate process model dependence |
| Discrete-time strategies with flexible nuisance models | Sequential regression, iterated conditional expectation, longitudinal TMLE | Can use flexible learners and target strategy means | Requires careful ordering and cross-fitting discipline |
| Realistic shifts or modified treatment policies | LMTP or stochastic intervention estimators | Avoids impossible static interventions and extreme positivity demands | Strategy definition must be clear and feasible |
| Treatment-duration or blip effect is central | Structural nested models or g-estimation | Scientifically interpretable time-varying treatment-effect models | Specialized assumptions/software, harder reporting |
| Dynamic decision rule is the target | Pair this route with `25-dynamic-treatment-policies` | Separates identification from policy learning | Learned policies need held-out/cross-fitted evaluation |
| Time-to-event or competing-risk outcome | Pair with `33-survival-competing-risks` | Correct time scale, censoring, and event definition | Weighted Cox hazards may not match risk-difference questions |
| High-dimensional histories | DML/TMLE/Super Learner support | Flexible nuisance modeling | Positivity and time-ordering still dominate |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- long-format person-time data dictionary with id, time, treatment, covariates, censoring, and outcome;
- model-input audit showing what source data were retained longitudinally, what were summarized, and why the resulting input matches or does not match the claimed method;
- timeline diagram or table for treatment, confounders, censoring, and outcomes;
- visit/grid construction and lag/grace-period sensitivity plan;
- regime adherence counts over time;
- support/positivity table by treatment and key history strata;
- treatment/censoring weight distributions and effective sample size;
- covariate balance over time before and after weights;
- first-pass MSM, g-formula, sequential-regression, or LMTP prototype with exploratory label.

## 5. Coordinate With Other Subskills

Use this design route with other modules when the target or implementation needs support:

- `25-dynamic-treatment-policies`: dynamic or learned adaptive policies, SMART-style targets, or policy value.
- `23-dose-response-effects`: continuous, cumulative, threshold, or modified dose/exposure strategies.
- `33-survival-competing-risks`: survival, censoring, competing events, cumulative incidence, hazards, or RMST.
- `30-matching-weighting-balance`: time-varying weights, balance diagnostics, overlap, and positivity summaries.
- `31-doubly-robust-estimation`: longitudinal TMLE, AIPW-style sequential estimators, and influence-function reporting.
- `32-double-machine-learning`: cross-fitting and flexible nuisance learners for longitudinal designs.
- `15-negative-controls-proximal`: unmeasured time-varying confounding probes or proxy-based alternatives.
- `24-transportability-generalizability`: transporting longitudinal strategy effects to a target population.

## 6. Diagnose Before Reporting

Minimum diagnostic set:

- time-ordering and history-construction checks;
- model-input compatibility: estimator rows, retained histories, collapsed/summarized features, and claim consequences;
- strategy definitions and feasibility;
- positivity/support over histories;
- treatment and censoring model diagnostics;
- weight distribution, truncation, and effective sample size if IPW/MSM is used;
- covariate balance over time after weighting;
- sensitivity to time grid, lag definitions, grace periods, weight truncation, learner class, and strategy variants;
- missingness, censoring, competing events, and adherence summaries;
- claim boundary tied to consistency, sequential exchangeability, positivity, and censoring assumptions.

## 7. Report Language

Use careful longitudinal language:

- "mean outcome under the sustained strategy";
- "contrast between specified longitudinal strategies";
- "under consistency, sequential exchangeability, positivity, and censoring assumptions";
- "weighted pseudo-population estimate from a marginal structural model";
- "parametric g-formula simulation under the specified strategy";
- "exploratory longitudinal association" when identification is incomplete.
- "baseline summaries of pre-treatment history were used as covariates while post-baseline treatment/censoring histories remained longitudinal."

Avoid:

- "effect of time-varying treatment" without a strategy definition;
- "adjusted for time-varying confounding" when the time order is not reconstructed;
- "dynamic treatment effect" when the target is only a fixed sustained regimen;
- "optimal regime" unless `25-dynamic-treatment-policies` has defined the policy target and validation.
- "longitudinal g-methods estimate" when the estimator input has collapsed the post-baseline histories required by the claimed strategy; reframe or reroute instead.
