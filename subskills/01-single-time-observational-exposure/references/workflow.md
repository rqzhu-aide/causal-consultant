# Single-Time Observational Exposure Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for a baseline or one-time observational exposure comparison.

## 1. Build The Target-Trial View

Record the smallest useful target trial:

- eligibility: who could enter the comparison at time zero;
- time zero or index date;
- exposure strategy and comparator;
- assignment-proxy logic: measured baseline covariates that make exposure conditionally comparable;
- follow-up start and end;
- outcome measure, timing, and scale;
- estimand: ATE, ATT, ATC, overlap effect, risk difference, risk ratio, mean difference, survival contrast, or another target;
- analysis set: full target sample, treated sample, matched sample, weighted population, trimmed support region, complete-case set, or imputed set.

If this cannot be stated, keep work exploratory and ask for the missing design facts before selecting a polished estimator.

## 2. Generate A Small View Menu

Offer 2-3 distinct views when observational data can be analyzed in several honest ways:

| View | Use When | Watch |
|---|---|---|
| Transparent adjustment | Confounders are clear and model interpretability matters | functional form and extrapolation |
| Matching or weighting | The user needs visible comparability and support diagnostics | discarded units, extreme weights, estimand drift |
| Overlap or restricted target | ATE positivity is weak but a supported comparison exists | target population changes |
| Doubly robust or DML | Covariates are rich and flexible nuisance modeling is justified | still needs timing, exchangeability, and support |
| Sensitivity or negative controls | unmeasured confounding is plausible | probes or bounds do not automatically identify the effect |
| Target twist | ATT, CATE, dose-response, survival, policy, or transport better matches the real decision | may require another subskill |

Main should usually show only one or two of these to the user at a time.

## 3. Check Timing, Confounding, And Support

Minimum checks before causal estimation:

- exposure precedes outcome follow-up;
- all adjustment variables are pre-exposure;
- domain-plausible confounders are available or their absence is recorded;
- mediators, colliders, and selection variables are not used as ordinary confounders;
- selection into the dataset is understood;
- missingness is evaluated before complete-case, imputation, weighting, or sensitivity choices;
- overlap is plausible for the chosen estimand;
- exposure and outcome definitions have domain-valid windows.

## 4. Choose An Implementation Lane

| Situation | Prefer | Why |
|---|---|---|
| Clear confounders, need interpretability | regression adjustment or g-computation | transparent first pass |
| Treated group is central | matching or ATT weighting | explains treated-versus-comparable-controls support |
| Population ATE with good support | IPW/IPTW or augmented weighting | direct weighting estimand |
| Limited support | overlap weights, trimming, or restricted target | avoids unsupported extrapolation |
| Rich covariates/nonlinear nuisance | AIPW, TMLE, DML, Super Learner, causal forests as support | more flexible nuisance estimation |
| Unmeasured confounding concern | sensitivity analysis, negative controls, proximal methods, or IV if credible | bounds or probes causal fragility |
| Time-to-event outcome | survival/competing-risks support | preserves time scale and censoring logic |

## 5. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- target-trial emulation table with unresolved gaps;
- variable timing map for exposure, confounders, mediators, colliders, selection, and outcomes;
- exposure/comparator counts by key covariates;
- missingness table by exposure and outcome;
- overlap plot, propensity histogram, common-support flag, or sparse-cell table;
- balance table before and after adjustment, matching, weighting, or trimming;
- first-pass estimate plus diagnostics, labeled exploratory until design checks pass.

## 6. Coordinate With Other Subskills

Use this route with:

- matching/weighting support for propensity scores, balance, weights, overlap, and trimming;
- doubly robust or DML support for AIPW, TMLE, orthogonal scores, cross-fitting, and flexible nuisance modeling;
- negative-control/proximal support for hidden-confounding probes;
- dose-response support for continuous, ordinal, or intensity exposure;
- heterogeneity or point-treatment-rule support when the user wants CATE, subgroup effects, targeting, or decisions;
- transportability support for target-population claims;
- survival support for time-to-event outcomes.

## 7. Report Language

Prefer:

- "target-trial emulation using observed baseline covariates";
- "under the stated exchangeability, positivity, consistency, and measurement assumptions";
- "effect among treated/exposed units" for ATT;
- "effect in the supported overlap population" when trimming or overlap weighting is used;
- "exploratory adjusted association" when causal assumptions are incomplete.

Avoid implying that a rich model, many covariates, or high predictive accuracy removes confounding by itself.
