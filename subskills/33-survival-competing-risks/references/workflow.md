# Survival And Competing-Risk Workflow

Use this reference when `SKILL.md` is not enough for time-to-event outcomes, censoring, competing risks, RMST, survival CATE, or survival models used as nuisance/prediction plugins.

## 1. Clarify The Survival Target

Record the smallest useful survival specification:

- Design route: randomized experiment, point observational exposure, longitudinal g-method, transportability, policy rule, or other selected route.
- Target goal: ATE/ATT at a time horizon, survival probability, risk, RMST, CIF, CATE, policy value, prediction/nuisance support, or descriptive exploratory output.
- Time zero: eligibility and start of follow-up, treatment/exposure assignment, and index date.
- Event of interest: event code, event date source, recurrence rule, adjudication, and composite definition.
- Censoring: administrative censoring, loss to follow-up, dropout, study end, missing event status, or artificial censoring.
- Competing events: death before nonfatal event, alternative failure type, treatment-disabling event, or other event that precludes the event of interest.
- Follow-up horizon: fixed time point or RMST truncation time with enough at-risk support.
- Outcome scale: risk difference/ratio, survival difference/ratio, RMST difference/ratio, CIF contrast, hazard ratio, subdistribution hazard ratio, CATE, or policy value.

## 2. Check Before Modeling

Before fitting a survival model:

- confirm time zero aligns across treatment/exposure groups;
- check treatment timing to avoid immortal time;
- separate censoring from competing events;
- verify event definitions and measurement windows with `domain_expert`;
- ask `data_analyst` for event, censoring, at-risk, and follow-up summaries;
- confirm the chosen horizon is scientifically meaningful and data-supported;
- decide whether hazards, survival probability, risk, CIF, or RMST is the causal estimand;
- confirm the design route identifies the target under stated assumptions.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Clear fixed horizon and absolute effect needed | Adjusted fixed-time risk/survival or CIF contrast | Directly interpretable causal scale | Needs enough at-risk support at horizon |
| Non-proportional hazards likely | RMST difference or ratio | Interpretable average event-free time up to tau | Tau must be pre-specified and supported |
| Conventional clinical survival summary | Cox model, weighted Cox, or stratified Cox | Familiar and efficient if PH is adequate | Hazard ratio is not always a causal contrast |
| Competing event precludes event of interest | Aalen-Johansen/CIF, cause-specific hazards, Fine-Gray if useful | Avoids treating competing events as ordinary censoring | Cause-specific and subdistribution hazards answer different questions |
| Censoring may depend on covariates | IPCW, AIPW/TMLE, censoring models | Addresses measured informative censoring | Cannot fix unmeasured censoring causes |
| Flexible nuisance/prediction support | Coxnet, random survival forest, boosting, neural survival model | Useful regression analog for outcome/censoring models | Prediction quality is not causal validity |
| Survival heterogeneity | Causal survival forest or survival-adapted CATE workflow | Targets survival/RMST CATE | Needs events, support, and heterogeneity module |
| Time-varying treatment/exposure | Longitudinal g-method with survival support | Handles treatment histories and time-varying confounding | Needs `09-longitudinal-gmethods` |
| Policy rule with survival outcome | Policy value/risk/RMST score plus held-out evaluation | Converts survival target into decision support | Needs `21` or `25` and decision constraints |

## 4. Coordinate With Other Subskills

- `07-randomized-assignment-and-experiments`: randomized assignment, noncompliance, stratified/clustered trials, ITT/CACE survival summaries.
- `08-single-time-observational-exposure`: target-trial emulation, baseline treatment, adjustment, weights, and survival outcome construction.
- `09-longitudinal-gmethods`: time-varying treatment, artificial censoring, clone-censor-weight, sequential g-formula, MSM, LMTP, or longitudinal TMLE.
- `20-heterogeneous-effects`: survival CATE/GATE/ITE, effect modification, causal survival forests, survival learner diagnostics.
- `21-point-treatment-rules`: one-time treatment rules using fixed-time risk, RMST, or survival CATE scores.
- `25-dynamic-treatment-policies`: sequential decision rules with time-to-event utility/value.
- `30-matching-weighting-balance`: propensity weights/matching and balance before weighted survival curves or weighted Cox.
- `31-doubly-robust-estimation`: AIPW, TMLE, one-step, or IPCW/DR survival targets.
- `32-double-machine-learning`: cross-fitted survival/censoring nuisance models and orthogonal survival-style support.

## 5. Ask For Focused Data Work

Ask for one or two checks at a time:

- event, censoring, and competing-risk counts by group;
- Kaplan-Meier and censoring Kaplan-Meier curves;
- CIF/Aalen-Johansen curves for competing-risk data;
- risk table and late follow-up sparsity check;
- RMST tau support and horizon sensitivity;
- censoring model features, IPCW distribution, and truncation sensitivity;
- PH tests, Schoenfeld residuals, log-minus-log plots, or time-varying coefficient checks;
- prediction diagnostics for nuisance models: calibration, Brier score, C-index, time-dependent AUC;
- reproducible analysis dataset and code paths.

## 6. Diagnostics Before Reporting

Minimum diagnostic set:

- time-zero and event-definition confirmation;
- event/censoring/competing event table;
- follow-up and at-risk support at chosen horizons;
- censoring assumption and IPCW diagnostics when used;
- PH and time-varying-effect diagnostics when hazard models are reported;
- competing-risk handling statement;
- comparison between primary scale and at least one simpler descriptive survival summary;
- limitations on censoring, support, sparse events, and causal identification.

## 7. Report Language

Prefer:

- "risk difference at 12 months";
- "survival probability through 24 months";
- "restricted mean event-free time through tau";
- "cumulative incidence of the event in the presence of competing death";
- "survival CATE for RMST at tau";
- "survival model used as an outcome/censoring nuisance model."

Avoid:

- "the hazard ratio is the treatment effect" unless the hazard scale is explicitly the target;
- "competing risks were censored" without explaining why that matches the estimand;
- "random survival forest adjusted for confounding" without design-route support;
- "CATE" when the output is only predicted risk;
- "causal survival forest proves heterogeneity" without support, honesty, and validation diagnostics.

## 8. Report Packet Template

For the report writer, return:

- `section_title`: concise survival section title.
- `target`: risk, survival probability, RMST, CIF, hazard, CATE, policy value, or nuisance support.
- `time_zero`: index date and eligibility definition.
- `event_definition`: event of interest and competing events.
- `followup`: horizon, tau, truncation, censoring, and delayed-entry notes.
- `method`: model, package, weights, adjustment, censoring model, and uncertainty method.
- `diagnostics`: event counts, support, censoring, PH, competing-risk, prediction, and sensitivity checks.
- `results`: tables/figures/model paths and interpretation limits.
- `appendix_assets`: code, package versions, model objects, and supplemental diagnostics.
