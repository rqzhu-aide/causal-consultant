# Transportability And Generalizability Workflow

Use this reference when `SKILL.md` is not enough for source-to-target evidence, trial-to-target translation, site transport, or external-validity report support.

## 1. Clarify The Transport Target

Record the smallest useful target:

- **Source**: trial, cohort, site, sample, study, or setting that supplies effect evidence.
- **Target**: population, site, policy setting, product environment, time period, or clinical/practice population of interest.
- **Target effect**: target ATE, target subgroup effect, site-specific effect, or qualitative applicability judgment.
- **Evidence role**: internally valid source result, exploratory source result, published estimate, or raw source data.
- **Target data**: individual covariates, aggregate margins, codebook only, or no target data.
- **Effect modifiers**: variables that plausibly change treatment effects across source and target.

If the user only wants subgroup effects in the same data, use `20-heterogeneous-effects`. If the source effect is not internally valid, fix that first.

## 2. Check Design Fit

Transportability adds assumptions on top of source identification.

- Randomized source trial: often strong internal validity, but target overlap and treatment/follow-up version still matter.
- Observational source study: transport cannot repair unmeasured confounding in the source effect.
- Multi-site source data: can support site heterogeneity and partial pooling, but target site compatibility remains needed.
- Published source estimate only: transport may be impossible without enough effect-modifier-stratified results or target data.
- Aggregate target margins only: standardization may be possible for limited covariates; uncertainty and compatibility need caution.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Target individual covariates available | Standardization/g-computation or inverse odds of sampling weights | Directly targets target covariate distribution | Outcome/selection model dependence |
| Trial source plus target registry/survey | Trial-to-target weighting, `generalize`, `WeightIt`, `survey` | Common practical external-validity workflow | Weight instability and missing effect modifiers |
| Good source-target overlap but many covariates | DR transport, SuperLearner/ML nuisance, calibration weighting | More robust if one nuisance model is good | Requires careful cross-fitting/reporting |
| Poor overlap | Restrict target, redefine population, or qualitative external-validity assessment | Avoids unsupported extrapolation | May not answer original target question |
| Multiple sites/studies | Site-specific effects, meta-regression, hierarchical model | Uses between-site variation | Needs enough sites and comparable measures |
| No target data | Descriptive applicability memo | Honest about limits | Cannot estimate a transported effect |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- source-target covariate table and standardized differences;
- overlap plot or propensity of source membership;
- missing target effect modifiers;
- treatment/outcome/follow-up version comparison;
- weight distribution and effective sample size;
- target-standardized effect table;
- site-specific effect plot if multiple sites exist.

## 5. Diagnose Before Reporting

Minimum diagnostic set:

- source internal validity status;
- source-target covariate overlap;
- missing effect modifiers;
- treatment/outcome/follow-up compatibility;
- weight stability and effective sample size;
- sensitivity to effect-modifier set and selection/standardization model;
- qualitative context differences from `domain_expert`;
- whether the target population was narrowed after seeing poor support.

## 6. Reviewer Interaction

- `domain_expert`: validates treatment/outcome version compatibility, setting differences, effect modifiers, and external-validity wording.
- `data_analyst`: prepares source-target diagnostics, weights, standardization models, target codebook checks, and artifacts.
- `method_lead`: decides transport assumptions, target estimand, source validity, and claim boundary.
- `report_writer`: integrates target-population and external-validity material into the working report.

## 7. Report Language

Use:

- "target-population estimate";
- "transported under the measured effect-modifier and overlap assumptions";
- "generalizability appears limited by...";
- "external-validity assessment" when no transport estimate is supportable.

Avoid:

- "applies to everyone" without target definition;
- "representative" as a substitute for effect-modifier overlap;
- "transport fixes bias" when source internal validity is weak.
