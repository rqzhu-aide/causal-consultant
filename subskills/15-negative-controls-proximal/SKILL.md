---
name: negative-controls-proximal
description: "Use as a design_route or diagnostic-sidecar method/task subskill for negative control outcomes, negative control exposures, placebo/falsification tests, residual or unmeasured confounding probes, empirical calibration, control-outcome calibration, proxy variables, proximal causal inference, proximal causal learning, treatment/outcome confounding proxies, bridge functions, proximal g-computation, proximal AIPW, proximal DML/ML bridge support, sensitivity to hidden bias, and report wording around falsification versus identification."
---

# negative_controls_proximal

## Role

Act as a bounded `design_route` or diagnostic-sidecar specialist for negative controls, falsification tests, empirical calibration, and proximal causal inference. Decide whether candidate controls/proxies can diagnose bias, calibrate uncertainty, partially adjust bias, or support proximal identification under stronger bridge assumptions.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Keep two roles separate:

- Negative controls are usually diagnostics, calibration devices, or bias-sensitivity aids.
- Proximal causal inference may identify effects under specific proxy, completeness/relevance, and bridge-function assumptions.

## When To Activate

Use this module when the project mentions negative control outcomes, negative control exposures, placebo outcomes, placebo exposures, falsification tests, empirical calibration, residual confounding, unmeasured confounding, proxy variables, treatment confounding proxies, outcome confounding proxies, bridge functions, proximal causal learning, proximal g-computation, proximal AIPW, or sensitivity to hidden bias.

Also use it when another design route needs credibility checks: observational exposure with unmeasured confounding concerns, DiD placebo outcomes or pre-period falsification, IV exclusion probes, RD placebo cutoffs/outcomes, synthetic control placebo tests, survival or longitudinal analyses with proxy variables, or report wording around residual bias.

## Inputs To Read

Read only the compact state needed for negative-control/proximal support:

- `project_summary`: user goal, phase, data paths, deliverable, audience.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: scientific plausibility of candidate negative controls/proxies, timing, exclusion from causal effect, shared bias structure, and interpretation cautions.
- `data_analyst`: candidate variables, timing, missingness, measurement quality, sample support, association summaries, model outputs, and reproducibility assets.
- `method_lead`: causal claim, causal structure, adjustment strategy, unmeasured-confounding concern, estimand, diagnostics plan, and wording boundary.
- related `subskill_records`: especially single-time observational exposure, longitudinal g-methods, DiD/event study, RD, IV, synthetic/time-series, survival, DML, doubly robust estimation, mediation, or transportability records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded design details needed by this module.

## Fit / Failure Logic

Check these before recommending software:

- Control/proxy role: distinguish negative control outcome, negative control exposure, treatment confounding proxy, outcome confounding proxy, placebo test, or empirical-calibration control.
- Timing: controls/proxies are measured before the causal pathway they are meant to probe, and are not post-treatment descendants unless explicitly allowed.
- Exclusion/null logic: a negative control outcome is not affected by the treatment; a negative control exposure does not affect the outcome except through shared bias structure.
- Shared bias structure: the control/proxy is expected to share the relevant confounding, selection, measurement, or healthcare-seeking process with the primary association.
- Relevance: proximal proxies are informative about the hidden confounding mechanism, not merely convenient variables.
- Completeness/bridge plausibility: proximal identification is treated as an assumption requiring subject-matter justification and stability checks.
- Measurement quality: controls/proxies are measured well enough to avoid turning noise into false reassurance.
- Support: enough variation exists in treatment, outcome, controls, proxies, and covariates to fit falsification or bridge models.
- Multiplicity: candidate controls are not cherry-picked after seeing results.

Block or heavily caveat claims when a negative control is plausibly affected by treatment, a negative control exposure plausibly causes the primary outcome, proxies are post-treatment colliders or descendants, only one weak proxy is available for a proximal claim that needs paired proxies, bridge functions are unstable or uninterpretable, or controls are selected mechanically without domain support.

## Data Work It May Request

Ask `data_analyst` for one small, concrete check by default:

- inventory of candidate negative control outcomes/exposures and proximal proxies with timing and domain rationale;
- DAG-style role table: primary exposure, primary outcome, measured covariates, unmeasured-confounding concern, negative controls, treatment proxies, outcome proxies;
- association summaries: treatment-control outcome, negative-control exposure-outcome, proxy-treatment, proxy-outcome, and proxy-proxy relationships;
- falsification regressions using the same adjustment set as the primary analysis;
- empirical-calibration table across multiple negative/positive controls when available;
- bridge-model feasibility: sample size, proxy variation, collinearity, outcome/proxy type, convergence, and instability;
- sensitivity to alternative controls/proxies, model classes, covariate sets, and trimming rules;
- reproducible code, model objects, tables, plots, and package versions.

## Method Or Support Guidance

Choose the lane from the control/proxy role:

- Negative control outcome: best for detecting residual confounding, selection bias, measurement bias, or reverse causation when the outcome should not be causally affected by the treatment.
- Negative control exposure: best when a placebo exposure shares bias mechanisms with the treatment but should not cause the outcome.
- Paired negative controls: stronger than a single control because exposure and outcome controls can triangulate shared bias.
- Empirical calibration: useful when many negative controls and sometimes positive controls are available; especially common in large healthcare databases.
- Control-outcome adjustment: can correct bias in specific settings, but should be treated as model-dependent and not generic proof of validity.
- Proximal identification: use when there are credible treatment and outcome confounding proxies, bridge assumptions are interpretable, and the team can report the assumptions clearly.
- Proximal survival or longitudinal support: coordinate with `33-survival-competing-risks` or `09-longitudinal-gmethods`; bridge functions must respect time and censoring.
- ML bridge support: flexible regression, random forests, boosting, neural nets, kernels, or DML can estimate nuisance/bridge functions, but do not create proxy validity.

Use `scripts/recommend.py` with `sample_input.json` when quick lane/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- whether negative controls/proxies are justified by domain knowledge, not only availability;
- timing relative to exposure, outcome, and hidden bias source;
- null-effect logic for negative controls;
- proxy relevance and whether proxies capture the same hidden confounding process;
- falsification model uses the same design/adjustment as the primary analysis;
- multiple controls show consistent bias patterns rather than a cherry-picked null;
- bridge-model stability, overfitting, weak proxy behavior, and positivity;
- sensitivity to alternative controls, proxy sets, bridge forms, learner choices, and sample restrictions;
- whether report wording says "did not detect bias" rather than "proved no bias" when only diagnostics were run.

## Output To Main Team

Return:

- lane, candidate controls/proxies, assumed role, fit classification, diagnostics, and required assumptions;
- whether output is diagnostic, calibration support, adapted bias correction, proximal identification, exploratory, blocked, or not applicable;
- candidate packages/models, sensitivity checks, and limitations;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `15-negative-controls-proximal`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `type_specific.design_route`: `causal_comparison`, `design_route`, `identification_status`, `required_timing`, `comparison_group_logic`, `key_identification_assumptions`, `invalidating_conditions`, and `estimands_supported`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Negative Control Diagnostics", "Falsification and Empirical Calibration", "Proxy-Based Unmeasured Confounding Analysis", or "Proximal Causal Inference";
- hidden-bias concern, candidate controls/proxies, timing, domain rationale, and DAG role;
- whether each result is diagnostic, calibration, sensitivity, or identification support;
- estimator/model, package, covariates, bridge function or calibration model, and uncertainty method;
- falsification results, empirical-calibration plots/tables, bridge diagnostics, proxy relevance, and sensitivity analyses;
- limitations: negative controls cannot prove no bias, invalid controls/proxies can mislead, proximal assumptions are strong, and bridge estimates are model-dependent;
- code, table, figure, model-object, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed negative-control/proximal workflow, team coordination, diagnostics, and report integration.
- `references/literature_and_software.md`: negative control, empirical calibration, proximal causal inference, and package matrix.
- `examples/`: short R/Python templates for falsification tests, empirical calibration, and linear proximal bridge sketches.
- `scripts/recommend.py`: rule-based negative-control/proximal recommender for quick internal triage.
