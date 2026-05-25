---
name: instrumental-variables
description: "Use as a design_route method/task subskill for instrumental variables, encouragement designs, lotteries, judge/physician/distance/preference instruments, noncompliance, LATE/CACE, Wald ratios, 2SLS, LIML, control functions, weak instruments, overidentification, monotonicity, exclusion restriction, IV-DML, Mendelian randomization, genetic instruments, GWAS summary-data MR, pleiotropy diagnostics, and IV report support."
---

# instrumental_variables

## Role

Act as a bounded `design_route` specialist for IV-style identification. Clarify the instrument, exposure/treatment, outcome, compliance or first-stage structure, target complier/local population, assumptions, weak-instrument risk, and reportable causal interpretation.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module can support econometric IV, randomized encouragement with noncompliance, natural-experiment instruments, and Mendelian randomization. It does not turn an associated proxy into a valid instrument; it only recommends IV analysis when relevance, independence, exclusion, and target interpretation can be argued.

## When To Activate

Use this module when the project involves instruments, encouragement, lotteries, randomized assignment with noncompliance, policy eligibility rules, judge/physician/provider/practice variation, distance instruments, preference instruments, supply shocks, quarter/birth/timing instruments, two-stage least squares, Wald estimates, LATE, CACE, weak instruments, overidentification, exclusion restriction, monotonicity, control functions, IV-DML, or a genetic instrument/Mendelian randomization design.

Also use it when another module needs an IV analog, such as fuzzy RD, encouragement experiments, IV mediation sensitivity, IV-DML nuisance support, or survival/longitudinal outcomes with an instrument.

## Inputs To Read

Read only the compact state needed for IV support:

- `project_summary`: user goal, phase, data paths, deliverable, audience.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: substantive instrument mechanism, exclusion pathways, compliers, pleiotropy or biological pathways for MR, and interpretation boundary.
- `data_analyst`: analysis alignment, instrument/treatment/outcome schema, first-stage summaries, balance by instrument, missingness, clusters, sample restrictions, genetic summary data, and reproducibility assets.
- `method_lead`: causal claim, target estimand, assumptions, design route compatibility, diagnostics, and wording boundary.
- related `subskill_records`: especially randomized experiments, RD, longitudinal g-methods, DML, survival, mediation, transportability, or negative controls/proximal records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded design details needed by this module.

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

Apply the common constructed-input checks to IV/MR inputs. Instrument scores, genetic risk scores, encouragement indicators, residualized instruments, exposure transformations, or sample restrictions can be valid when relevance, exclusion, independence, monotonicity, and the complier/target population remain interpretable. If construction uses outcome information, induces ancestry/geography/access confounding, combines multiple causal channels, or changes the complier group, record the narrower claim or request `method_lead_recheck`.

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

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the IV or Mendelian randomization claim that remains after assumption checks:

- `inference_supported` only when relevance is strong enough or weak-robust inference is used, exclusion and independence are plausible, monotonicity/complier interpretation is explicit, and clustering/sample overlap/many-instrument issues are handled.
- `exploratory_only` when instruments are weak, exclusion is speculative, overidentification or pleiotropy checks are merely suggestive, or nonlinear/heterogeneous effects make the estimand unclear.
- `claim_scope`: LATE/CACE for compliers, a local genetic IV estimand, or the MR estimand under stated assumptions; do not report as population ATE without extra justification.
- Valid routes include 2SLS/LIML with robust or clustered SE, Anderson-Rubin/CLR/weak-robust confidence sets, first-stage diagnostics, overidentification and falsification checks, and MR sensitivity such as IVW, MR-Egger, weighted median/mode, leave-one-out, and pleiotropy diagnostics.
- Do not treat a significant first stage, many SNPs, or package-generated MR estimates as proof of valid instruments.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted validation routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For IV and MR, the statistical evidence is only as strong as the instrument logic plus the weak-instrument and sensitivity route. A precise estimate from an invalid or weak instrument is not strong causal evidence. Treat these as claim-boundary issues:

- relevance is necessary but not enough; independence, exclusion, monotonicity, timing, and target-complier interpretation must also be stated;
- weak instruments can make conventional Wald/2SLS intervals misleading, even when the first stage is statistically significant;
- overidentification, balance, falsification, and pleiotropy tests are diagnostics, not proof of valid instruments;
- nonlinear models, heterogeneous treatment effects, and multiple instruments can change the estimand away from a simple ATE;
- MR additionally needs allele harmonization, LD/population-structure review, sample-overlap awareness, and pleiotropy sensitivity.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when relevance is adequate or weak-robust inference is used, the exclusion/independence/monotonicity argument is defensible, the estimand is local/complier/genetic as appropriate, and clustering/many-instrument/MR issues are handled.
2. Set `status: internally_validated` when first-stage, reduced-form, balance, falsification, overidentification, or MR sensitivity results are coherent but some identifying assumptions remain substantively uncertain.
3. Set `status: exploratory_only` when instrument validity is speculative, the first stage is weak, weak-robust intervals are missing, MR pleiotropy checks are preliminary, or nonlinear/local interpretation is unclear.
4. Set `status: blocked` when the instrument plausibly affects the outcome directly, is confounded with prognosis/access/ancestry, has no meaningful first stage, or has no interpretable complier/proxy mechanism.
5. Set `claim_scope` to `target_sample` for a sample LATE/CACE/local IV estimate, `model_implied` for model-dependent nonlinear or control-function outputs, `internally_validated` for coherent diagnostic support, or `exploratory_only` for instrument screens.
6. Use `inference_or_validation_route` for IV-specific support: 2SLS/LIML with robust or clustered SE, Anderson-Rubin/CLR/weak-robust confidence sets, first-stage partial F/R2 or effective F, reduced form, overidentification/falsification checks, IV-DML if used, MR-IVW, MR-Egger, weighted median/mode, MR-PRESSO, heterogeneity, leave-one-out, Steiger, colocalization, or multivariable MR.
7. Use `method_specific_limits` to state the exact boundary: LATE/CACE not ATE, complier or genetic instrument population only, exclusion not proven, weak-instrument uncertainty, pleiotropy/LD/sample-overlap limits, no broad mechanism claim, or no nonlinear probability-effect interpretation.
8. Ask `data_analyst` for the smallest missing check: first stage with partial F/R2, reduced form, covariate balance by instrument, weak-robust interval, cluster/many-instrument diagnostics, harmonized MR table, SNP F statistics, LD clumping, MR-Egger intercept, heterogeneity, and leave-one-out results.
9. Set `method_lead_recheck.required: true` when the record changes the estimand to LATE/CACE, reveals weak or invalid instruments, changes claim strength, requires a different IV/MR lane, or blocks the causal design.

Example - weak or speculative IV:

```yaml
statistical_evidence:
  status: exploratory_only
  claim_scope: exploratory_only
  inference_or_validation_route:
    - "Current IV result is a screening estimate; weak-robust confidence sets and exclusion/falsification review are missing."
    - "Report first-stage, reduced-form, balance, and Anderson-Rubin or CLR-style weak-instrument intervals before strengthening the claim."
  method_specific_limits:
    - "Cannot report a supported IV causal effect from a weak or substantively unverified instrument."
    - "The target would be a LATE/CACE for compliers, not a population ATE."
requests:
  data_analyst:
    - "Produce partial F/R2, reduced-form estimate, covariate balance by instrument, and weak-robust confidence interval."
method_lead_recheck:
  required: true
  reason: "Instrument strength and validity may lower claim strength or block the IV route."
```

Example - supported IV/MR route:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_sample
  inference_or_validation_route:
    - "2SLS/LIML or MR estimator reported with relevance, weak-instrument, falsification, and sensitivity diagnostics."
    - "Weak-robust or sensitivity-compatible uncertainty is used for the stated local/complier/MR estimand."
  method_specific_limits:
    - "Claim is local to compliers or the genetic-instrument estimand under stated IV/MR assumptions."
    - "Overidentification or pleiotropy diagnostics support but do not prove exclusion."
```

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
- statistical_evidence: status, IV/MR claim scope, instrument-specific inference or validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `12-instrumental-variables`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.design_route`: `causal_comparison`, `design_route`, `identification_status`, `required_timing`, `comparison_group_logic`, `key_identification_assumptions`, `invalidating_conditions`, and `estimands_supported`

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
