# Negative Controls And Proximal Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, report material, or connected-specialist needs as council/result recommendations unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this file when negative-control or proximal support needs more detail than `SKILL.md`. The main job is to keep bias diagnostics, empirical calibration, and proximal identification from being mixed together.

## 1. Name The Bias Concern

Record the specific concern:

- residual or unmeasured confounding;
- selection bias;
- reverse causation;
- measurement bias;
- healthcare-seeking, surveillance, or reporting bias;
- shared institutional process;
- confounding by indication or severity;
- hidden time-varying confounding.

Recommend `domain_expert` review when the hidden process, control/proxy role, null restriction, or shared-bias rationale needs ordinary scientific interpretation. A negative control or proxy is useful only if it relates to that process in a scientifically meaningful way.

## 2. Classify Each Candidate Variable

Use a simple role table:

- primary exposure/treatment;
- primary outcome;
- measured covariates;
- suspected hidden confounder/process;
- negative control outcome;
- negative control exposure;
- treatment confounding proxy;
- outcome confounding proxy;
- placebo time, placebo group, placebo cutoff, or placebo dose;
- positive control, if empirical calibration is planned.

Do not let one variable silently play multiple incompatible roles.

## 3. Decide The Lane

### Falsification / Diagnostic Negative Controls

Use when the goal is to test whether the primary design leaves a pattern of bias. Run the same design or adjustment used for the primary outcome/exposure. A non-null association is evidence of a problem; a null association is reassuring but not proof of no bias.

### Empirical Calibration

Use when many negative controls, and ideally positive controls, are available. Estimate an empirical null or systematic-error distribution and calibrate p-values or confidence intervals. This is strongest in standardized large-database workflows where controls are selected before final interpretation.

### Bias Adjustment With Negative Controls

Use only when the control outcome/exposure is credible enough to model the shared bias structure. This is more assumption-heavy than a falsification test.

### Proximal Causal Inference

Use when there are at least two meaningful proxy types:

- treatment confounding proxies, often denoted `Z`, associated with hidden confounders and treatment but not directly with outcome after conditioning as required;
- outcome confounding proxies, often denoted `W`, associated with hidden confounders and outcome but not directly affected by treatment as required.

Then estimate a confounding bridge function. In simple linear settings this can look like an IV-style regression. In more complex settings it may require semiparametric, kernel, ML, or doubly robust bridge estimation.

## 4. Recommend Minimal Evidence

First-pass data checks:

- timing table for exposure, outcome, controls/proxies, and covariates;
- descriptive support for each candidate control/proxy;
- correlation/association matrix among exposure, outcome, controls, proxies, and key covariates;
- falsification model using the same adjustment set as the primary model;
- proxy relevance checks: proxy-treatment, proxy-outcome, and proxy-proxy relationships;
- missingness and measurement quality of controls/proxies.

For proximal work, recommend keeping the route diagnostic or exploratory unless the treatment and outcome proxy roles can be explained in ordinary domain language.

## 5. Choose Practical Tools

Negative-control diagnostics often use the same estimator as the primary design:

- adjusted regression, matching/weighting, DiD, RD, IV, survival model, or synthetic-control placebo;
- model outputs should be comparable across primary and control outcomes/exposures.

Empirical calibration:

- use `EmpiricalCalibration` when there are many negative/positive control estimates;
- use cohort-method or domain workflows that produce comparable estimates across controls.

Proximal inference:

- use `PCL`, `pci2s`, `adjustedCurves`, or research code only after checking assumptions and package maturity;
- use `ivreg`, `fixest`, or `linearmodels` for transparent linear bridge sketches;
- use `DoubleML`, `grf`, `SuperLearner`, `xgboost`, `sklearn`, or neural nets only as nuisance/bridge learners after the proxy roles are fixed.

## 6. Connected Reviewer Relevance

Preserve reviewer relevance in the `method_task_results` item rather than assigning work directly.

- `domain_expert`:
  - whether controls/proxies are scientifically plausible;
  - whether treatment could affect the control outcome;
  - whether negative control exposure could affect the primary outcome;
  - whether proxies capture the suspected hidden process;
  - what null or non-null result would mean.

- `data_analyst`:
  - timing, missingness, measurement quality, associations, and model outputs;
  - standardized code to run the same model across primary/control outcomes;
  - empirical calibration inputs if many controls exist.

- `method_lead`:
  - whether the negative control is diagnostic or identification support;
  - bridge assumptions and causal wording;
  - whether another design route should be revised if a falsification test fails.

- `causal_gatekeeper`:
  - whether a null or non-null control result changes the claim boundary;
  - whether proximal assumptions are sufficient for identification wording;
  - whether a failed falsification should block, repair, or downgrade the claim.

## 7. Report-Support Fields

For downstream `method_lead`, `causal_gatekeeper`, and `report_writer` review, preserve compact report-support fields in the `method_task_results` item:

- hidden-bias concern;
- candidate controls/proxies and domain rationale;
- role classification: diagnostic, calibration, adjustment, or proximal identification;
- models and assumptions;
- results and sensitivity;
- claim boundary.

Use plain wording:

- "The negative control did not show evidence of the same bias pattern" rather than "there is no unmeasured confounding."
- "The proximal estimate relies on proxy and bridge assumptions" rather than "the proxy variables remove all hidden bias."

## 8. Common Failure Modes

- Choosing negative controls after seeing results.
- Using a negative control outcome that the treatment can plausibly affect.
- Using a negative control exposure that can plausibly affect the primary outcome.
- Treating one null negative-control result as proof of validity.
- Treating one non-null negative-control result as exact bias correction.
- Calling weak or post-treatment proxies proximal identification.
- Using flexible ML for bridge functions without proxy validity or stability checks.
- Reporting proximal estimates without explaining bridge assumptions.
