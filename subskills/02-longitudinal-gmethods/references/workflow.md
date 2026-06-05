# Longitudinal G-Methods Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for time-varying treatment, treatment histories, sustained strategies, dynamic regimes, censoring, or time-varying confounding affected by prior treatment.

## 1. Define The Longitudinal Target

Record the smallest useful longitudinal design:

- time zero and time grid: baseline, visits, intervals, lag rules, grace periods, and follow-up end;
- eligibility over time;
- treatment or exposure history;
- baseline and time-varying covariate history;
- censoring, competing events, missingness, and adherence;
- intervention strategy: static, sustained, dynamic, stochastic, modified treatment policy, threshold, dose accumulation, or grace-period rule;
- outcome: final, repeated, survival, recurrent, competing-risk, cumulative, or utility outcome;
- estimand: mean, risk, survival, RMST, cumulative incidence, contrast between strategies, regime value, or modified-policy effect;
- model-input dataset: row structure and histories retained, summarized, lagged, or collapsed.

If the user wants a learned or deployable adaptive rule, ask main to route `15-dynamic-treatment-policies`.

## 2. Generate A Strategy Menu

Offer 2-3 distinct views when more than one longitudinal target is credible:

| View | Use When | Watch |
|---|---|---|
| Sustained/static strategy | "always/never/continue/stop" style question is meaningful | support and adherence may be thin |
| Dynamic regime | treatment depends on evolving history | policy target and validation may require `15-dynamic-treatment-policies` |
| Cumulative/dose history | duration, intensity, thresholds, or trajectories matter | may require `13-dose-response-effects` |
| Modified treatment policy | static regimes are unrealistic or unsupported | intervention shift must be well-defined |
| Survival/censoring strategy | outcome is time to event or censoring is central | ask main to route `23-survival-competing-risks` |
| Collapse/reframe | histories are weak but baseline or cumulative summaries are usable | claim becomes single-time or summary-exposure, not longitudinal g-method evidence |

Main should usually show only one or two views to the user at a time.

## 3. Check Identification And Data Reality

Minimum checks before estimation:

- every treatment/censoring decision is ordered before later covariates and outcomes;
- time-varying confounders affected by prior treatment are measured before the next treatment decision;
- strategies are feasible interventions, not just labels for observed behavior;
- observed histories support the candidate strategies;
- estimator input preserves the histories required by the chosen method;
- censoring and missingness are measurable and can be modeled, bounded, or caveated;
- outcome and follow-up windows align with the strategy and target population;
- competing events and death match the target question.

## 4. Choose A Method Lane

| Situation | Prefer | Watch |
|---|---|---|
| Sustained binary or categorical treatment with stable support | MSM with IP treatment/censoring weights | extreme weights, truncation, few adherent histories |
| Complex strategy and absolute risk target | parametric g-formula | model dependence and simulation assumptions |
| Discrete-time strategies with flexible nuisance models | sequential regression, longitudinal TMLE, sequential DR | ordering and cross-fitting discipline |
| Realistic treatment modification | LMTP or stochastic intervention estimator | intervention definition and positivity |
| Treatment-duration or blip effect | structural nested model or g-estimation | specialized assumptions and reporting |
| Dynamic policy target | pair with `15-dynamic-treatment-policies` | learned policies need honest evaluation |
| Time-to-event or competing-risk outcome | pair with `23-survival-competing-risks` | hazard models may not answer risk questions |

## 5. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- long-format person-time data dictionary;
- model-input audit showing retained, summarized, and collapsed histories;
- timeline diagram or table for treatment, confounders, censoring, and outcomes;
- visit grid, lag, and grace-period sensitivity plan;
- strategy adherence counts over time;
- support/positivity table by treatment and key history strata;
- treatment/censoring weight distributions and effective sample size;
- first-pass MSM, g-formula, sequential-regression, LMTP, or longitudinal TMLE prototype with exploratory label.

## 6. Diagnose Before Reporting

Minimum diagnostic set:

- time-ordering and history-construction checks;
- model-input compatibility;
- strategy definitions and feasibility;
- positivity/support over histories;
- treatment and censoring model diagnostics;
- weight distribution, truncation, and effective sample size if IPW/MSM is used;
- covariate balance over time after weighting;
- sensitivity to time grid, lag definitions, grace periods, weight truncation, learner class, and strategy variants;
- missingness, censoring, competing events, and adherence summaries;
- claim boundary tied to consistency, sequential exchangeability, positivity, and censoring assumptions.

## 7. Report Language

Prefer:

- "mean outcome under the sustained strategy";
- "contrast between specified longitudinal strategies";
- "under consistency, sequential exchangeability, positivity, and censoring assumptions";
- "weighted pseudo-population estimate from a marginal structural model";
- "parametric g-formula simulation under the specified strategy";
- "modified treatment policy effect";
- "exploratory longitudinal association" when identification is incomplete.

Avoid calling a naive time-updated regression coefficient a longitudinal causal effect when time-varying confounders affected by prior treatment are present.
