# Synthetic Control And Time-Series Counterfactual Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for synthetic control, synthetic DiD, interrupted time series, Bayesian structural time series, matrix completion, or aggregate intervention analysis.

## 1. Clarify The Design

Record the smallest useful synthetic/time-series specification:

- Treated unit(s): country, state, site, market, firm, product, school, hospital, cluster, or aggregate segment.
- Time: frequency, start/end, intervention date, pre-period, post-period, seasonality, and delayed/phase-in effects.
- Donors/controls: eligible untreated units or control time series, exclusion rules, contamination risks, and comparability.
- Outcome: scale, denominator, transformation, aggregation, and consistency over time.
- Intervention: event meaning, implementation date, anticipation, phase-in, concurrent shocks.
- Target: treated-unit ATT over time, cumulative effect, average post-period effect, synthetic DiD ATT, ITS level/slope change, or forecast-based counterfactual.
- Diagnostics: pre-fit, placebo, donor weights, time weights, leave-one-out, alternative dates, autocorrelation, seasonality, and model sensitivity.

## 2. Check Before Modeling

Before fitting:

- confirm treated unit and intervention date with `domain_expert`;
- ask `data_analyst` for raw treated/donor/control trends;
- verify donors are untreated and not affected by spillovers;
- check pre-period length and whether treated trend can be approximated by donors;
- decide whether comparison is donor-weighted SCM, model-based time-series forecast, synthetic DiD, or DiD/event-study;
- identify concurrent shocks and anticipation windows;
- plan placebo or sensitivity evidence before reporting effect magnitude.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| One treated aggregate unit, good donor pool, long pre-period | Classic SCM | Transparent donor weights and pre-fit | Needs good fit and donor validity |
| One/few treated units, imperfect fit | Augmented SCM | Bias correction while retaining weights | Extrapolation/model dependence |
| Multiple treated units or staggered timing with latent factors | Generalized SCM/matrix completion | Handles interactive fixed effects | Model assumptions and missingness |
| Panel data where both DiD and SCM are plausible | Synthetic DiD | Blends unit/time weights with DiD robustness | Needs clear estimand and panel support |
| No donor pool, one treated series | Interrupted time series | Simple level/slope change design | Highly vulnerable to concurrent shocks |
| Control time series not affected by intervention | BSTS/CausalImpact or comparative ITS | Forecast counterfactual with covariates | Control series must be unaffected |
| Many treated cohorts/policy rollout | DiD/event-study | Staggered adoption estimands | ask main to route `03-did-event-study` |
| Spillover-prone donors | Interference/spillover review | Donor contamination breaks counterfactual | ask main to route `07-interference-spillovers` |

## 4. Coordinate With Other Subskills

- `03-did-event-study`: staggered adoption, group-time ATT, event-study diagnostics, synthetic DiD overlap.
- `07-interference-spillovers`: donor contamination, geographic spillovers, market/network interference.
- `14-transportability-generalizability`: treated-unit specificity and target-population generalization.
- `13-dose-response-effects`: intervention intensity or partial adoption over time.
- `20-matching-weighting-balance`: donor weighting and balance logic where relevant.
- `22-double-machine-learning`: matrix completion/ML prediction support, if used as implementation support.
- `23-survival-competing-risks`: time-to-event/rate outcomes in aggregate panels.

## 5. Ask For Focused Data Work

Ask for one or two checks at a time:

- treated and donor/control trend plot;
- pre/post window table and intervention date verification;
- donor missingness and exclusion table;
- pre-treatment RMSPE/MSPE and predictor balance;
- donor weights and time weights;
- placebo distribution and RMSPE ratios;
- leave-one-donor-out sensitivity;
- alternative intervention date placebo;
- autocorrelation/seasonality diagnostics for ITS/BSTS;
- reproducible figure/model/table paths.

## 6. Diagnostics Before Reporting

Minimum diagnostic set:

- treated/donor/control definition and intervention timing;
- pre-period fit and balance;
- donor weight table and donor contamination check;
- treated-versus-synthetic/control plot;
- gap plot and cumulative effect table;
- placebo/permutation or model-based uncertainty;
- sensitivity to donors, dates, windows, transformations, and seasonality;
- clear limitation statement on concurrent shocks and donor validity.

## 7. Interrupted Time-Series Specifics

ITS can be useful when there is no donor pool, but claims are usually weaker. Require:

- enough pre-period observations to model baseline level/trend/seasonality;
- enough post-period observations to distinguish noise from intervention effect;
- no major concurrent shock at the intervention date;
- autocorrelation and seasonality handling;
- sensitivity to functional form, lagged effects, and alternative break dates.

When a credible control time series exists, comparative ITS or BSTS/CausalImpact is usually stronger than treated-only ITS.

## 8. Report Language

Prefer:

- "treated unit compared with a weighted donor combination";
- "pre-treatment fit";
- "post-treatment gap";
- "placebo distribution";
- "synthetic DiD estimate";
- "forecast-based counterfactual under unaffected control-series assumptions."

Avoid:

- "synthetic control proves causality";
- "good post-period fit validates the method";
- "placebo p-value" without explaining small donor-pool limits;
- "CausalImpact controls for everything";
- "generalizes to all units" without transportability review.

## 9. Report Packet Template

For the report writer, return:

- `section_title`: concise SCM/ITS/BSTS/synthetic DiD title.
- `design_lane`: classic SCM, augmented SCM, generalized SCM, synthetic DiD, ITS, BSTS/CausalImpact, or exploratory.
- `treated_unit`: treated unit(s), donor/control pool, intervention date, and windows.
- `target`: post-period ATT, cumulative effect, level/slope change, or forecast gap.
- `method`: package, predictors/covariates, donor/time weights, model settings, and uncertainty method.
- `diagnostics`: pre-fit, placebo, donor weights, leave-one-out, alternative dates, seasonality, and contamination checks.
- `results`: table/figure/model paths and interpretation limits.
- `appendix_assets`: code, package versions, donor lists, placebo outputs, and supplemental plots.
