# Workflow: Point-Treatment Observational

## Purpose

Use this workflow when the user has observational data, one primary treatment or exposure time, a comparator, and a causal effect question under measured-confounding assumptions.

This workflow should define the design and route. Detailed matching/weighting diagnostics belong in `07-matching-weighting-balance`; detailed AIPW/TMLE/DML implementation belongs in `08-doubly-robust-ml`.

## Stage 1: Target-Trial Frame

Define:

- eligibility;
- time zero;
- treatment or exposure;
- comparator;
- outcome and follow-up window;
- target population;
- intended effect scale;
- existing data structure.

If treatment timing, eligibility, or outcome timing is ambiguous, stop and resolve that before estimator choice. Time-zero mistakes can invalidate the whole analysis.

## Stage 2: Variable Role and Data Audit

Create a variable role map:

- baseline confounders;
- baseline prognostic variables;
- effect modifiers;
- instruments or variables that predict treatment only;
- mediators and other post-treatment variables;
- colliders and selection variables;
- missingness/censoring variables;
- cluster/site/provider variables;
- sampling weights or survey design variables.

Ask whether covariates were measured before treatment. If rows are visits, claims, events, sessions, or repeated measures, define the causal unit and baseline summary window before modeling.

## Stage 3: Estimand and Assumptions

Choose the estimand:

- ATE for the full eligible target population;
- ATT for treated-like units;
- ATC for control-like units;
- ATO/overlap effect when full support is weak;
- dose-response for continuous treatments;
- CATE/GATE when heterogeneity is the target.

Explain assumptions in plain language:

- treatment and comparator are well-defined;
- key reasons for treatment choice and outcome risk were measured before treatment;
- similar units received both treatment options;
- one unit's treatment does not affect another unit's outcome unless modeled;
- missingness and selection do not create uncontrolled bias or are handled.

## Stage 4: Route Shortlist

Choose one primary route and one fallback or comparator.

Use transparent standardization or regression when:

- the covariate set is modest;
- the outcome model can be explained;
- overlap is adequate;
- the user needs a simple, auditable first analysis.

Route to matching/weighting/balance (`07-matching-weighting-balance`) when:

- the user wants propensity scores, matching, IPW, overlap weights, entropy balancing, or balance plots;
- target population and common support are central;
- visual design diagnostics are needed before outcome modeling.

Route to doubly robust ML (`08-doubly-robust-ml`) when:

- the user asks for AIPW, TMLE, DML, Super Learner, cross-fitting, or high-dimensional nuisance models;
- flexible modeling is important but the same measured-confounding assumptions remain.

Route elsewhere when:

- treatment or confounders vary over time (`10-longitudinal-gmethods`);
- outcome is survival/censoring/competing risks (`15-survival-competing-risks`);
- missingness, measurement, selection, or transportability dominates (`02-data-technician`);
- CATE, treatment rules, or policy targeting are central (`09-heterogeneous-effects-policy`);
- IV, RD, DiD, synthetic control, mediation, or interference better matches the design.

## Stage 5: Diagnostics Before Interpretation

Always plan:

- time-zero and eligibility check;
- baseline covariate table or distribution summary;
- treatment prevalence by important covariates;
- overlap/common support check;
- missingness and follow-up summary;
- sensitivity analysis for unmeasured confounding when causal claims matter.

When using specific routes:

- matching/weighting requires balance, weight, and effective sample size diagnostics;
- standardization requires outcome-model checks and marginal scale clarity;
- DR/ML requires nuisance-model, cross-fitting, and influence-function diagnostics;
- survival outcomes require censoring and competing-risk diagnostics.

## Stage 6: Interpretation and Fallback

Interpret results as conditional on the measured-confounding design. If diagnostics fail:

- narrow the target population;
- switch from ATE to ATT or overlap estimand;
- improve baseline covariate construction;
- route to `02-data-technician` or `10-longitudinal-gmethods`;
- report sensitivity or descriptive analysis instead of a definitive causal effect;
- recommend prospective data collection if key confounders or timing are missing.

## Suggested Response Pattern

```markdown
I would treat this as an observational point-treatment comparison because [reason].

The target trial-like comparison is [A] versus [comparator] among [population], starting at [time zero], with [outcome] measured over [follow-up].

The causal interpretation depends on whether baseline variables capture the main reasons treatment was chosen and outcome risk, and whether comparable units exist in both treatment groups.

My primary route would be [route], with [fallback/comparator route]. Before interpreting the estimate, I would check [diagnostics].

If [main support/timing/confounding concern] fails, I would [fallback plan].
```

## Code Template Index

Root templates:

- `scripts/python/dowhy_point_treatment_template.py`
- `scripts/python/propensity_weighting_template.py`
- `scripts/python/doubleml_irm_template.py`
- `scripts/R/matchit_weightit_cobalt_template.R`
- `scripts/R/tmle3_aipw_template.R`

Use the first template only for simple DoWhy workflows. Use the other templates through their corresponding subskills when matching/weighting or doubly robust estimation is selected.

## Literature and Software Map

For key papers, textbooks, and software notes, read `literature_and_software.md` in this folder.
