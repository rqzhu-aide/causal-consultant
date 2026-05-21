# Dose Response Workflow

Use this reference when `SKILL.md` is not enough for continuous, ordinal, multi-level, intensity, threshold, stochastic shift, or modified treatment policy targets.

## 1. Clarify The Dose Target

Record the smallest useful target:

- **Dose variable**: continuous amount, ordinal level, categorical intensity, cumulative dose, average dose, peak dose, or transformed exposure.
- **Decision/intervention**: fixed dose, contrast, range, threshold, shift, MTP, or descriptive curve.
- **Feasible range**: values that can realistically be assigned or modified.
- **Time zero and follow-up**: when dose is measured and when outcome starts.
- **Effect scale**: mean, risk, hazard, RMST, count, utility, or other scale.
- **Status**: causal target, exploratory design-learning, descriptive exposure-response, or report support.

If the treatment is binary, route to the relevant design route. If dose changes over time, coordinate with `09-longitudinal-gmethods` and maybe `25-dynamic-treatment-policies`.

## 2. Check Design Fit

Dose-response inherits the main design route's assumptions and adds dose support requirements.

- Randomized dose: good for fixed contrasts if randomization covers the dose range.
- Observational dose: requires measured confounding control and positivity across the dose distribution.
- Longitudinal dose accumulation: needs g-methods, time-varying confounding handling, or MTP/LMTP estimands.
- Survival outcomes: coordinate with `33-survival-competing-risks`.
- Interference/spillovers: dose exposure mapping may be the target; coordinate with `14-interference-spillovers`.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Few meaningful dose categories | Multi-level contrasts, standardization, weighting | Clear interpretation | Multiple comparisons and sparse cells |
| Smooth curve with good support | Splines, kernels, flexible outcome regression, GPS adjustment | Communicates nonlinear pattern | Functional form can dominate |
| Continuous observational exposure | GPS weighting/stratification, CausalGPS, WeightIt | Explicit dose assignment diagnostics | GPS balance for continuous doses is harder than binary balance |
| Realistic feasible changes | MTP/shift estimands via `lmtp` or `tmle3shift` | Avoids unsupported fixed-dose contrasts | Target differs from "set everyone to dose d" |
| Flexible nuisance adjustment | TMLE/DML/orthogonal continuous-treatment estimators | Can use ML plugins | Identification and positivity still dominate |
| Time-varying dose strategy | `gfoRmula`, `lmtp`, `ltmle`, longitudinal g-methods | Handles evolving dose/confounders | Requires long-format histories |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- dose histogram/density and range by key covariates;
- dose support for proposed fixed contrasts or shifts;
- descriptive dose-outcome plot with adjustment caveat;
- covariate balance across dose quantiles or GPS diagnostics;
- outlier, heaping, measurement error, and transformation checks;
- sparse-range flags for high/low dose;
- feasible shift or MTP rule proposed by `domain_expert`.

## 5. Diagnose Before Reporting

Minimum diagnostic set:

- support/positivity for every reported dose contrast or shift;
- extrapolation flag for curve segments outside dense support;
- functional-form sensitivity: linear, spline, binned, kernel, and flexible learners;
- dose-scale sensitivity: raw, log, standardized, thresholded, or clinically meaningful units;
- measurement error and outlier influence;
- unmeasured confounding sensitivity where feasible;
- clear separation of descriptive curve from causal curve.

## 6. Reviewer Interaction

- `domain_expert`: validates dose meaning, feasible intervention, thresholds, safety, and interpretation.
- `data_analyst`: prepares dose distributions, support diagnostics, balance checks, plots, and reproducible code.
- `method_lead`: decides target estimand, identification assumptions, positivity, and claim wording.
- `report_writer`: integrates dose-response results, unsupported ranges, and figure captions.

## 7. Report Language

Use:

- "within the observed support range";
- "estimated dose-response curve under the stated assumptions";
- "modified treatment policy that shifts dose by...";
- "exploratory exposure-response pattern" when causal support is incomplete.

Avoid:

- "optimal dose" unless a policy/value target is defined;
- "threshold discovered" without validation and binning sensitivity;
- "effect at dose d" when no comparable units support that dose.
