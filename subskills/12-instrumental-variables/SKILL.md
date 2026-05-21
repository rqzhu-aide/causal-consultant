---
name: instrumental-variables
description: "Use as a design_route method/task subskill for instrumental variables, encouragement designs, lotteries, judge/physician/distance/preference instruments, noncompliance, LATE/CACE, Wald ratios, 2SLS, LIML, control functions, weak instruments, overidentification, monotonicity, exclusion restriction, IV-DML, Mendelian randomization, genetic instruments, GWAS summary-data MR, pleiotropy diagnostics, and IV report support."
---

# instrumental_variables

## Role

Act as a bounded `design_route` specialist for IV-style identification. Clarify the instrument, exposure/treatment, outcome, compliance or first-stage structure, target complier/local population, assumptions, weak-instrument risk, and reportable causal interpretation.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module can support econometric IV, randomized encouragement with noncompliance, natural-experiment instruments, and Mendelian randomization. It does not turn an associated proxy into a valid instrument; it only recommends IV analysis when relevance, independence, exclusion, and target interpretation can be argued.

## When To Activate

Use this module when the project involves instruments, encouragement, lotteries, randomized assignment with noncompliance, policy eligibility rules, judge/physician/provider/practice variation, distance instruments, preference instruments, supply shocks, quarter/birth/timing instruments, two-stage least squares, Wald estimates, LATE, CACE, weak instruments, overidentification, exclusion restriction, monotonicity, control functions, IV-DML, or a genetic instrument/Mendelian randomization design.

Also use it when another module needs an IV analog, such as fuzzy RD, encouragement experiments, IV mediation sensitivity, IV-DML nuisance support, or survival/longitudinal outcomes with an instrument.

## Inputs To Read

Read only the compact state needed for IV support:

- `project_summary`: user goal, phase, data paths, deliverable, audience.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `domain_expert`: substantive instrument mechanism, exclusion pathways, compliers, pleiotropy or biological pathways for MR, and interpretation boundary.
- `data_analyst`: instrument/treatment/outcome schema, first-stage summaries, balance by instrument, missingness, clusters, sample restrictions, genetic summary data, and reproducibility assets.
- `method_lead`: causal claim, target estimand, assumptions, design route compatibility, diagnostics, and wording boundary.
- related `subskill_records`: especially randomized experiments, RD, longitudinal g-methods, DML, survival, mediation, transportability, or negative controls/proximal records.

## Fit / Failure Logic

Check these before recommending software:

- Relevance: instrument changes treatment/exposure enough to identify a stable target.
- Independence: instrument is plausibly as-if random or conditionally independent of potential outcomes.
- Exclusion: instrument affects outcome only through the target treatment/exposure, not direct or alternate pathways.
- Monotonicity: no meaningful defiers, or monotonicity is replaced by a clearly justified alternative.
- Target: IV estimand is LATE/CACE/complier effect, local Wald ratio, structural parameter, or MR causal estimate; do not label it ATE by default.
- Timing: instrument precedes treatment/exposure and outcome; covariates are pre-instrument or clearly valid.
- Strength: weak-instrument diagnostics and weak-robust inference are planned.
- Multiple instruments: overidentification tests are treated as diagnostics, not proof of validity.
- MR-specific: variants are associated with exposure, not confounded through population structure/LD, and not horizontally pleiotropic except under sensitivity-method assumptions.

Block or caveat causal IV claims when the instrument has plausible direct effects, is confounded with prognosis/access/ancestry, is weak, shifts multiple treatments without a separable target, violates monotonicity, has no meaningful complier group, uses post-instrument controls improperly, or MR instruments have uncontrolled pleiotropy/sample-overlap/population-stratification problems.

## Data Work It May Request

Ask `data_analyst` for one small, concrete IV check by default:

- first-stage table and plot: treatment/exposure by instrument, partial F, partial R2, and subgroup/cluster versions;
- reduced-form outcome by instrument and Wald ratio for simple binary instruments;
- covariate balance and missingness by instrument;
- instrument distribution, compliance/treatment receipt, and complier-descriptive clues;
- weak-instrument diagnostics, Anderson-Rubin or weak-robust confidence sets if feasible;
- cluster, fixed effect, and many-instrument diagnostics;
- for MR: harmonized SNP-exposure/SNP-outcome table, LD clumping, F statistics, allele alignment, sample overlap, ancestry, MR-Egger intercept, heterogeneity, leave-one-out, and pleiotropy/outlier diagnostics;
- reproducible paths for IV datasets, GWAS summary data, model outputs, diagnostic plots, and package versions.

## Method Or Support Guidance

Choose the lane from the instrument and target:

- Randomized encouragement or noncompliance: report ITT/reduced form first; estimate CACE/LATE only if relevance, exclusion, monotonicity, and assignment integrity are plausible.
- Single binary instrument and binary treatment: Wald ratio is transparent; 2SLS should agree in the simplest setting.
- Linear endogenous treatment model: use 2SLS with robust/clustered SE and weak-instrument diagnostics; consider LIML or weak-robust inference if instruments are weak or many.
- Multiple instruments: use overidentification and first-stage diagnostics as probes; do not treat Sargan/Hansen tests as validation.
- Nonlinear outcomes/treatments: 2SLS may still target a linear projection/local effect; control-function or nonlinear IV requires stronger modeling assumptions and careful wording.
- High-dimensional controls or flexible nuisance models: coordinate with `32-double-machine-learning`; use PLIV/IIVM/IV-DML only when the IV assumptions and score model match the causal question.
- Fuzzy RD: coordinate with `11-regression-discontinuity`; IV supplies local compliance logic at the cutoff.
- Mendelian randomization: use IVW as a baseline for summary-data MR; use MR-Egger, weighted median/mode, MR-PRESSO, multivariable MR, or colocalization/sensitivity checks when pleiotropy, LD, or correlated traits threaten exclusion.

Use `scripts/recommend.py` with `sample_input.json` when quick IV/MR/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- first-stage strength, partial F, partial R2, weak-robust tests/intervals, and many-instrument risk;
- reduced form, first stage, and Wald/2SLS sign consistency;
- covariate balance by instrument and sensitivity to covariates/fixed effects;
- exclusion pathways, alternate treatments, direct instrument effects, and negative-control/falsification checks;
- monotonicity and complier interpretation;
- clustering, heteroskedasticity, serial correlation, and finite-sample issues;
- overidentification tests only when multiple instruments have independent credibility;
- MR: LD, ancestry, sample overlap, allele harmonization, Steiger directionality, heterogeneity, MR-Egger intercept, leave-one-out, MR-PRESSO/outlier checks, and biological pleiotropy review.

## Output To Main Team

Return:

- IV lane, instrument, treatment/exposure, outcome, target estimand, local/complier population, and assumption status;
- whether implementation is direct, adapted, exploratory, blocked, or not applicable;
- candidate packages/models, diagnostics, assumptions, sensitivity checks, and limitations;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- one controlled `recommended_next_action`.

For durable records, use:

- `subskill_id`: `12-instrumental-variables`
- `module_type`: `design_route`
- `role`: `instrumental_variables_design`
- `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Instrumental Variables Design", "Encouragement and CACE Analysis", or "Mendelian Randomization Analysis";
- instrument, exposure/treatment, outcome, timing, population, compliance/first-stage structure, and target estimand;
- assumption table: relevance, independence, exclusion, monotonicity, and MR-specific assumptions when relevant;
- implementation route, packages, models, covariates, fixed effects, clustering, and weak-instrument inference;
- first-stage, reduced-form, IV estimate, weak-instrument diagnostics, sensitivity checks, and MR pleiotropy diagnostics if used;
- limitations: local/complier interpretation, exclusion uncertainty, weak instruments, many instruments, pleiotropy, ancestry/sample overlap, or invalid nonlinear interpretation;
- code, table, figure, model-object, GWAS-summary, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed IV/MR workflow, team coordination, diagnostics, and report integration.
- `references/literature_and_software.md`: IV, weak-instrument, DML-IV, and Mendelian randomization literature/software map.
- `examples/`: short R/Python templates for 2SLS, weak diagnostics, IV-DML, and Mendelian randomization.
- `scripts/recommend.py`: rule-based IV/MR recommender for quick internal triage.
