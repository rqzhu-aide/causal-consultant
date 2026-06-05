# Difference-In-Differences And Event-Study Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for DiD, staggered adoption, event studies, comparative interrupted time series, synthetic DiD, or conditional parallel-trend workflows.

## 1. Clarify The DiD Design

Record the smallest useful DiD specification:

- Unit: person, firm, school, region, site, product, market, or aggregate unit.
- Time: calendar time, period index, event time, pre/post window, and frequency.
- Treatment path: binary absorbing adoption, one-time shock, reversible treatment, repeated exposure, continuous/intensity treatment, or multiple treatments.
- Cohort: first treated period, never-treated units, not-yet-treated units, earlier/later cohorts, and treatment reversals.
- Outcome: scale, measurement timing, aggregation, and comparability across groups/time.
- Population: stable panel, unbalanced panel, repeated cross section, or changing composition.
- Comparison group: never-treated, not-yet-treated, selected controls, donor pool, or synthetic comparison.
- Target: 2x2 ATT, group-time ATT, cohort effect, event-time effect, aggregate ATT, policy effect, intensity effect, or descriptive trend comparison.

## 2. Check Before Modeling

Before fitting any DiD estimator:

- confirm treatment timing and event-time coding;
- ask `domain_expert` whether anticipation, spillovers, or concurrent shocks are plausible;
- ask `data_analyst` for treatment timing maps and pre/post outcome plots;
- check whether pre-period support is long enough for design learning;
- verify sample composition and measurement stability across time;
- choose the comparison group and estimand before choosing software;
- check clustering and serial correlation structure;
- decide whether TWFE is a benchmark, a special-case estimator, or not useful.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Two groups, two periods, clear treated/control | Simple DiD or DR-DiD | Transparent ATT under parallel trends | Covariate adjustment needs conditional PT |
| Multi-period with one treated cohort | Event-study/DiD with clear pre/post and controls | Dynamic effects and pre-period diagnostics | Serial correlation and time-window choices |
| Staggered absorbing adoption | Callaway-Sant'Anna, Sun-Abraham, imputation, did2s, did_multiplegt | Robust to heterogeneous treatment effects better than plain TWFE | Estimands and aggregation differ |
| Weak untreated comparison but rich pre-period | Synthetic DiD or synthetic control/time-series support | Uses pre-period fit and weights | Needs donor pool and fit diagnostics |
| Repeated cross sections | DiD estimators supporting repeated cross sections | Does not require same units over time | Requires stable population/composition assumptions |
| Conditional parallel trends with covariates | DR-DiD, Callaway-Sant'Anna with covariates, DoubleML DiD | Combines outcome and treatment/covariate adjustment | Covariates must be pre-treatment/time-ordered |
| Dynamic effects central | Event-time estimates by cohort/group-time | Matches policy response over time | Avoid contaminated TWFE leads/lags |
| Few treated units or aggregate policy | Synthetic control, synthetic DiD, randomization/placebo inference | Better suited for aggregate intervention settings | May belong partly to `06-synthetic-control-time-series` |
| Continuous or dose treatment | Continuous DiD or dose-response module | Binary adoption DiD is not enough | ask main to route `13-dose-response-effects` |
| Spillovers or contamination | Spillover/interference design | Controls may be indirectly treated | ask main to route `07-interference-spillovers` |

## 4. Coordinate With Other Subskills

- `01-domain-expert`: treatment meaning, anticipation, concurrent policy shocks, spillovers, and stable outcome definitions.
- `02-data-analyst`: panel structure, timing map, balance/composition, event-time construction, plots, and code outputs.
- `03-method-lead`: estimand, assumptions, comparison group, design fit, and wording boundary.
- `06-synthetic-control-time-series`: one/few treated units, donor pools, synthetic DiD, comparative interrupted time series.
- `07-interference-spillovers`: treatment contamination, network or spatial spillovers, control exposure.
- `10-heterogeneous-effects`: subgroup, cohort-specific, or effect-modification targets beyond standard group-time heterogeneity.
- `13-dose-response-effects`: continuous or intensity treatment versions of DiD.
- `14-transportability-generalizability`: when DiD estimates must be transported to another target population.
- `20-matching-weighting-balance`: pre-treatment matching/weighting or composition support.
- `21-doubly-robust-estimation`: DR-DiD and influence-function style reporting.
- `22-double-machine-learning`: flexible nuisance models under conditional parallel trends.

## 5. Ask For Focused Data Work

Ask for one or two checks at a time:

- unit/time uniqueness and panel balance;
- adoption cohort and event-time variables;
- treatment timing heatmap or cohort table;
- outcome means by cohort/time and treated/control group;
- pre-trend plots and placebo windows;
- missingness/composition by group/time;
- cluster counts and serial-correlation structure;
- estimator-ready long-format dataset;
- reproducible figure/table/model paths.

## 6. Diagnostics Before Reporting

Minimum diagnostic set:

- treatment timing and event-time coding confirmation;
- cohort and comparison group table;
- raw outcome trends by group/cohort;
- pre-period evidence and placebo checks;
- estimator choice and estimand/aggregation statement;
- clustering/inference plan;
- sensitivity to anticipation, window choice, comparison group, and parallel-trend violations;
- limitation statement on untestable parallel trends and any unsupported claim boundaries.

## 7. TWFE Use

Use TWFE carefully:

- acceptable as a simple benchmark in balanced 2x2 or homogeneous-effect special cases;
- useful as a diagnostic table if clearly labeled;
- risky for staggered adoption with heterogeneous effects due to forbidden comparisons, negative weights, and lead/lag contamination;
- do not let a significant TWFE coefficient override group-time, event-time, or cohort-specific diagnostics.

## 8. Report Language

Prefer:

- "group-time ATT";
- "event-time effect relative to the period before adoption";
- "aggregate ATT over treated cohorts and post-treatment periods";
- "conditional parallel-trend assumption";
- "sensitivity to violations of parallel trends";
- "TWFE benchmark, not the primary estimator."

Avoid:

- "pre-trends prove parallel trends";
- "fixed effects control for all confounding";
- "event-study leads prove no anticipation";
- "staggered TWFE estimate equals the average treatment effect" unless assumptions are justified;
- "policy caused the outcome" when comparison group, timing, or composition is weak.

## 9. Report Packet Template

For the report writer, return:

- `section_title`: concise DiD or event-study section title.
- `design_lane`: 2x2, staggered, event-study, repeated cross-section, synthetic DiD, DR-DiD, or exploratory.
- `timing`: treatment timing, cohorts, reference period, anticipation window, and event-time bins.
- `comparison`: never-treated, not-yet-treated, donor pool, or synthetic comparison.
- `estimand`: group-time ATT, dynamic effect, aggregate ATT, cohort-specific effect, or another target.
- `method`: estimator, package, covariates, weights, clustering, inference, and aggregation.
- `diagnostics`: pre-trend, placebo, timing, composition, spillover, clustering, and sensitivity checks.
- `results`: table/figure/model paths and interpretation limits.
- `appendix_assets`: code, package versions, robustness results, and supplemental plots.
