# Common Failure Modes in Causal Analysis

Use this file to proactively protect the user from common errors.

## Estimand and Design Errors

### Estimator-first analysis

Symptom: user asks to run propensity score matching, causal forest, or DiD without defining the causal question.

Response: define treatment, comparator, outcome, time zero, follow-up, target population, and estimand first.

### Ambiguous intervention

Symptom: treatment is a vague exposure such as “high quality care,” “healthy diet,” “AI adoption,” or “high inflammation.”

Response: ask for an intervention version or convert to descriptive association if no manipulable intervention is credible.

### Wrong comparator

Symptom: comparing treated units to “everyone else” when controls include future-treated units, contraindicated units, or ineligible units.

Response: define comparator consistent with the target question and eligibility.

### Bad time zero / immortal time bias

Symptom: treated units must survive or remain event-free long enough to receive treatment, while controls are followed from an earlier time.

Response: align eligibility, assignment, and follow-up start. Consider target trial emulation or cloning/censoring/weighting for grace periods.

## Variable Adjustment Errors

### Adjusting for mediators in total-effect analysis

Symptom: controlling for variables affected by treatment when estimating total effect.

Response: remove post-treatment mediators from total-effect adjustment, or switch to mediation/direct-effect estimand.

### Collider adjustment

Symptom: conditioning on a common effect of treatment and outcome causes, such as hospitalization, study participation, survival, or follow-up completion.

Response: avoid naive conditioning; consider selection models, inverse probability of censoring/selection weights, or changed target population.

### Treating instruments as confounders

Symptom: adjusting for a strong predictor of treatment that has no independent relationship with outcome except through treatment.

Response: evaluate whether it is a confounder, instrument, or design variable; avoid balance goals that force unnecessary instrument adjustment if it increases variance or bias under some scenarios.

## Positivity and Overlap Errors

### Extreme weights

Symptom: propensity scores near 0 or 1, huge inverse probability weights, small effective sample size.

Response: diagnose overlap, consider trimming, stabilization, alternative estimand such as overlap population, or acknowledge non-identifiability for unsupported population regions.

### Extrapolation disguised as regression

Symptom: regression predicts counterfactual outcomes in covariate regions with no treated or no controls.

Response: use overlap diagnostics and avoid interpreting unsupported counterfactuals.

## Design-Specific Errors

### Naive two-way fixed effects in staggered DiD

Symptom: treatment adoption occurs at different times and treatment effects may be heterogeneous.

Response: use group-time ATT, cohort-specific event studies, or modern DiD estimators.

### DiD without pretrend or no-anticipation checks

Symptom: policy outcome trends already diverge before treatment, or units change behavior before formal treatment.

Response: event-study diagnostics, placebo tests, alternative controls, or weaker causal claims.

### RD without manipulation checks

Symptom: running variable can be precisely manipulated or density jumps at cutoff.

Response: density/manipulation tests, covariate continuity checks, bandwidth sensitivity, and local interpretation.

### IV without exclusion restriction

Symptom: instrument directly affects outcome or shares unmeasured causes with outcome.

Response: do not present IV estimate as causal unless assumptions are plausible. Report as sensitivity or exploratory otherwise.

### Synthetic controls affected by treatment

Symptom: control units experience spillovers or the same policy shock.

Response: remove contaminated controls, use negative controls, sensitivity to donor pool, or alternative design.

### Causal discovery overclaiming

Symptom: user wants a learned DAG to prove causality from observational data.

Response: explain assumptions and present graph as candidate/equivalence class. Validate with domain knowledge and interventions when possible.

## Outcome-Specific Errors

### Hazard ratio misinterpretation

Symptom: hazard ratio is described as risk ratio or probability ratio.

Response: report survival probabilities, cumulative incidence, or RMST if those match the question.

### Competing risks ignored

Symptom: treating competing events as independent censoring when they are scientifically meaningful.

Response: define whether estimand targets cause-specific hazard, subdistribution, cumulative incidence, or total burden.

## Missingness and Selection Errors

### Complete-case analysis by default

Symptom: dropping missing observations without considering missingness mechanism.

Response: describe missingness, compare complete/incomplete cases, consider multiple imputation, IPW, or sensitivity analysis.

### Conditioning on observed follow-up

Symptom: analyzing only people with complete follow-up when follow-up depends on treatment or outcome risk.

Response: censoring/selection weights, multiple imputation, bounds, or limitation.

## Interpretation Errors

### Good prediction mistaken for causal validity

Symptom: ML model has high predictive accuracy and user interprets feature effects causally.

Response: causal validity requires causal assumptions, not just predictive accuracy.

### Subgroup fishing

Symptom: many subgroups explored post hoc and strongest result highlighted.

Response: pre-specify subgroups or use honest HTE methods, multiplicity caution, and validation.

### Transportability overreach

Symptom: estimate from one population is generalized to a different population without checking covariate support or effect modifiers.

Response: state target population, check representativeness, consider standardization/transportability analysis.
