# Single-Time Observational Exposure Workflow

Use this reference when `SKILL.md` is not enough for a baseline or single-time observational exposure comparison.

## 1. Emulate The Target Trial

Record the smallest useful target trial:

- Eligibility: who could enter the comparison at time zero.
- Time zero: date/event when exposure assignment would be made.
- Exposure strategies: treated/exposed versus untreated/unexposed, alternative treatment, usual care, exposure level, or another strategy.
- Comparator: clinically/scientifically meaningful comparison group.
- Assignment procedure proxy: measured baseline covariates that make exposure assignment conditionally comparable.
- Follow-up: start, end, censoring, competing events, and observation requirements.
- Outcome: measure, timing, event window, and scale.
- Estimand: ATE, ATT, ATC, overlap-population effect, risk difference, risk ratio, odds ratio, mean difference, survival contrast, or another target.
- Analysis set: target population, restricted support region, complete-case set, imputed set, or weighted population.

If the target trial cannot be stated, keep work exploratory and ask for the missing design facts before selecting a polished estimator.

## 2. Check Timing And Confounding

Minimum checks before causal estimation:

- exposure precedes outcome follow-up;
- baseline covariates precede exposure and are not consequences of exposure;
- confounders named by `domain_expert` and `method_lead` are available or their absence is recorded;
- selection into the dataset is understood;
- missingness is evaluated before deciding complete-case, imputation, weighting, or sensitivity analysis;
- exposure and outcome definitions have domain-valid measurement windows;
- overlap is plausible for the selected estimand.

## 3. Choose An Implementation Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Small or moderate data, clear confounders, interpretable model needed | Regression adjustment or g-computation | Transparent first-pass estimate | Functional form and extrapolation can dominate |
| Treated group is central and controls are plentiful | Matching or ATT weighting | Easy to explain treatment-comparison support | Matching can discard units and change estimand |
| Need population-average ATE with good support | IPW/IPTW or augmented weighting | Direct estimand weighting | Extreme weights and positivity are common failure modes |
| Limited overlap | Overlap weights, trimming, restricted target population | Avoids unsupported extrapolation | Changes target; report who remains supported |
| Rich covariates or nonlinear confounding | AIPW, TMLE, DML, Super Learner, causal forests as nuisance support | Robust/flexible nuisance estimation | Still requires exchangeability and positivity |
| Unmeasured confounding concern | Sensitivity analysis, negative controls, proximal methods, IV if credible | Tests or bounds causal fragility | Usually cannot "solve" confounding without extra structure |
| Binary or rare outcome | Risk difference/ratio via g-computation, targeted learning, or appropriate GLM | Better effect-scale control | Odds ratios can be misread as risks |
| Time-to-event outcome | Survival module with censoring and competing-risk support | Correct time scale and censoring logic | Do not treat survival as ordinary binary outcome without justification |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- target-trial emulation table with filled gaps;
- variable timing map for exposure, confounders, mediators, colliders, and outcomes;
- analysis-set flow counts and exclusion reasons;
- exposure/comparator counts by key covariates and domain strata;
- missingness table by exposure and outcome;
- overlap plot, propensity histogram, common-support flag, or sparse-cell table;
- balance table before and after adjustment/weighting/matching;
- first-pass estimate plus diagnostics, labeled exploratory until design checks pass.

## 5. Coordinate With Other Subskills

Use the observational route with other modules when the target or implementation needs more support:

- `30-matching-weighting-balance`: propensity scores, matching, weighting, overlap, balance, and weight diagnostics.
- `31-doubly-robust-estimation`: AIPW, TMLE, one-step estimators, and efficient influence-function reporting.
- `32-double-machine-learning`: orthogonalization, cross-fitting, high-dimensional nuisance learners, and ML plugin support.
- `15-negative-controls-proximal`: negative controls, proximal methods, proxies, and unmeasured confounding probes.
- `23-dose-response-effects`: continuous, ordinal, or multi-level exposures.
- `20-heterogeneous-effects`: subgroup, CATE, or effect-modifier targets.
- `21-point-treatment-rules`: targeting or point policy-rule targets.
- `24-transportability-generalizability`: target-population or external-validity claims.
- `33-survival-competing-risks`: time-to-event outcomes, censoring, and competing events.

## 6. Diagnose Before Reporting

Minimum diagnostic set:

- target-trial table with unresolved gaps marked;
- timing map showing all adjustment variables are pre-exposure;
- covariate balance and overlap diagnostics;
- weight distribution, trimming, discarded units, or restricted target population;
- missingness/selection analysis;
- sensitivity to adjustment set, estimand, model/learner class, and support restrictions;
- unmeasured-confounding sensitivity or reason it was not feasible;
- clear claim boundary tied to exchangeability, positivity, consistency, and measurement.

## 7. Report Language

Use careful observational language:

- "under the stated exchangeability, positivity, consistency, and measurement assumptions";
- "target-trial emulation using observed baseline covariates";
- "effect among the treated/exposed units" for ATT;
- "effect in the supported overlap population" when trimming or overlap weighting is used;
- "exploratory adjusted association" when causal assumptions are incomplete.

Avoid:

- "randomized-like" unless the design has a defensible quasi-random mechanism;
- "controlled for all confounding" when unmeasured confounding is possible;
- "causal effect in everyone" when overlap supports only a restricted group;
- "machine learning adjusted away confounding" without design support.
