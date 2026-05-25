---
name: transportability-generalizability
description: "Use as a target_goal method/task subskill for transportability, generalizability, external validity, target-population effects, trial-to-target translation, site transport, population reweighting, selection diagrams, source-target overlap, and whether causal evidence applies to another population or setting."
---

# transportability_generalizability

## Role

Act as a bounded `target_goal` specialist for moving evidence from one sample, study, trial, site, time period, or population to another. Clarify the source population, target population, transported estimand, selection process, effect modifiers, treatment/outcome versions, and whether the required source-target data exist.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module defines the target-population question and external-validity logic. It does not supply identification by itself; the original design route and `method_lead` still determine whether the source effect is internally valid.

## When To Activate

Use this module when the project asks whether results apply elsewhere, whether a trial generalizes to a target population, how to transport an effect across sites, how external validity should be handled, whether site/population differences change interpretation, or how to estimate a target-population effect from source evidence.

Do not use it for ordinary subgroup effects inside one population unless the user explicitly asks about applying evidence to a different target. Do not treat reweighting as valid if treatment/outcome versions or key effect modifiers are incompatible.

## Inputs To Read

Read only the compact state needed for the target question:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: source-target context, treatment/outcome version meaning, effect-modifier plausibility, site standards, and external-validity cautions.
- `data_analyst`: analysis alignment, source and target data availability, covariate overlap, sampling/selection variables, missing target variables, weights, and artifacts.
- `method_lead`: source design validity, estimand set, transport assumptions, selection diagram logic, and wording boundary.
- related `subskill_records`: especially heterogeneous effects, randomized experiments, observational exposure, matching/weighting, and survival records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded target-goal details needed by this module.

## Fit / Failure Logic

Check these before recommending a method:

- Source and target populations are explicitly defined.
- Source effect is internally valid enough to transport or generalize.
- Target estimand is clear: target ATE, target ATT-like effect, site-specific effect, policy population effect, or qualitative external-validity judgment.
- Treatment, comparator, outcome, follow-up, and measurement versions are compatible or differences are modeled.
- Effect modifiers that drive source-target differences are observed in both source and target data.
- Source-target overlap is adequate for reweighting, matching, or standardization.
- Selection mechanism into the source study is understood enough to model or reason about.
- Site-level context and implementation differences are not so large that transport is scientifically implausible.

Apply the common constructed-input checks to transport inputs. Target-population weights, calibration variables, site strata, eligibility filters, harmonized measures, or source/target restrictions can be valid when they preserve treatment/outcome versions, effect-modifier meaning, and source-target support. If construction changes the target population, omits key modifiers, harmonizes away meaningful differences, or selects a target after seeing results, limit the transported claim accordingly.

Block or caveat transported claims when the target population is undefined, source validity is unresolved, key effect modifiers are missing, source-target overlap is poor, treatment/outcome versions differ materially, target data are unavailable for needed modifiers, or domain context makes transport implausible.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- source-target covariate comparison table and standardized differences;
- overlap/positivity diagnostics for target covariates;
- selection model or inverse-odds-of-sampling weight diagnostics;
- target-population codebook and missing effect-modifier screen;
- treatment/outcome/follow-up version comparison;
- site-level summaries or random-effects/meta-analytic inputs;
- standardized or weighted target-effect prototype table.

## Method Or Support Guidance

Distinguish common transport targets:

- **Generalizability**: source sample is viewed as drawn from or nested in the target population; estimate the target-population effect.
- **Transportability**: source and target populations/settings differ; extra assumptions or selection diagrams are needed.
- **Trial-to-target translation**: transport randomized trial evidence to a real-world target population using target covariates.
- **Site transport**: move evidence across sites, systems, countries, clinics, schools, or product environments.
- **Meta-transport**: combine multiple sources or sites while targeting a specific population.
- **Descriptive external-validity assessment**: report differences and limits when transport identification is not supportable.

Candidate method lanes:

- Standardization/g-computation when outcome models are credible and target covariates are available.
- Inverse odds of sampling or selection weights when source-target selection can be modeled.
- Matching/weighting to target covariate distribution when overlap is adequate.
- Doubly robust transport estimators when both outcome and selection models can be fit.
- Selection diagrams and do-calculus reasoning when graphical transport assumptions are central.
- Multi-site/meta-analytic transport when multiple source studies or sites exist.
- Descriptive external-validity tables when target data or assumptions are insufficient.

Use `scripts/recommend.py` with `sample_input.json` when quick method/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the target-population claim supported by source-target evidence:

- `inference_supported` only when target population, source sample, effect modifiers, selection/sampling variables, overlap, and weighting/standardization uncertainty are recorded and defensible.
- `exploratory_only` when source-target differences are only described, target covariates are missing, selection models are unstable, or important effect modifiers are unavailable.
- `claim_scope`: generalizability to a sampled target population, transportability to a non-overlapping target population, site-specific effect, or source-only effect; keep these distinct.
- Valid routes include post-stratification, inverse-probability or inverse-odds transport weights, outcome standardization, doubly robust transport estimators, selection-diagram logic, site/meta-analytic models, and sensitivity to unmeasured effect modifiers and poor overlap.
- Do not claim external validity from a well-estimated source effect alone; the statistical evidence must address source-target exchangeability and support.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted transport/generalizability routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For transportability and generalizability, the statistical claim has two layers: the source effect must be internally valid, and the source-to-target move must be justified. Treat these as claim-boundary issues:

- source validity problems are not repaired by reweighting or standardization;
- generalizability, transportability, site-specific estimation, qualitative external-validity assessment, and meta-transport are distinct targets;
- source-target overlap must be checked on variables that modify effects, not only on variables that predict sample selection;
- treatment, comparator, outcome, follow-up, measurement, adherence, and implementation versions may differ even when covariates overlap;
- unstable selection weights, missing target modifiers, and unmeasured site/context modifiers should weaken or block target-population wording.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when source internal validity is adequate, the target population is explicit, effect modifiers and selection variables are measured in source/target as needed, overlap is adequate, and uncertainty reflects both source effect estimation and transport/standardization.
2. Set `status: internally_validated` when source-target balance/overlap, weight stability, standardization, or sensitivity checks support a target-population estimate but unmeasured effect-modifier or context assumptions remain important.
3. Set `status: exploratory_only` when the module only describes source-target differences, target covariates are incomplete, weights are unstable, or effect modifiers are uncertain.
4. Set `status: descriptive_only` for external-validity tables, site comparison summaries, or qualitative applicability assessments without identified transport.
5. Set `status: blocked` when source effect is not internally valid, target population is undefined, treatment/outcome versions are incompatible, key effect modifiers are unavailable, or source-target overlap is absent.
6. Set `claim_scope` to `target_population` for a supported transported/generalized estimand, `target_sample` for source-only or sampled-target results, `internally_validated` for supported but assumption-heavy transport, or `exploratory_only` for descriptive applicability.
7. Use `inference_or_validation_route` for transport-specific support: inverse-odds/sampling weights, post-stratification, outcome standardization/g-computation, doubly robust transport estimators, survey/calibration weights, selection-diagram identification, multi-site/meta-analytic transport, overlap/effective sample size diagnostics, and sensitivity to unmeasured effect modifiers.
8. Use `method_specific_limits` to state the exact boundary: source-only effect, target-population effect under measured modifiers, poor overlap caveat, incompatible treatment/outcome versions, unstable weights, no repair of source bias, or qualitative external-validity only.
9. Ask `data_analyst` for the smallest missing check: source-target covariate/modifier table, overlap/effective sample size, selection-weight diagnostics, target missingness for modifiers, version-comparison table, site heterogeneity summaries, and transport sensitivity.
10. Set `method_lead_recheck.required: true` when the record changes the claim from source effect to target-population effect, blocks external-validity wording, reveals incompatible versions, or changes the audience-facing conclusion.

Example - descriptive external-validity assessment:

```yaml
statistical_evidence:
  status: descriptive_only
  claim_scope: exploratory_only
  inference_or_validation_route:
    - "Current output compares source and target covariates but does not identify a transported target-population effect."
    - "Target effect modifiers, overlap, and source validity need review before transport wording."
  method_specific_limits:
    - "Report as external-validity assessment, not as evidence that the effect generalizes."
    - "A well-estimated source effect alone does not support target-population claims."
requests:
  data_analyst:
    - "Produce source-target effect-modifier comparison, overlap/effective sample size, missing target modifier screen, and treatment/outcome version table."
method_lead_recheck:
  required: true
  reason: "The source-only claim may not support the user's target-population interpretation."
```

Example - supported transported estimate:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_population
  inference_or_validation_route:
    - "Target-population estimate produced using source-target standardization, transport weights, or doubly robust transport with adequate overlap."
    - "Uncertainty and sensitivity to effect-modifier set, selection model, and weight instability documented."
  method_specific_limits:
    - "Claim applies to the recorded target population and treatment/outcome versions under measured effect-modifier assumptions."
    - "Source internal-validity limitations remain part of the transported claim."
```

## Diagnostics And Sensitivity

Review:

- source-target covariate balance, overlap, and target support;
- selection-weight instability and effective sample size;
- missing or weakly measured effect modifiers;
- treatment, comparator, outcome, follow-up, and implementation differences;
- site heterogeneity and context changes;
- sensitivity to alternative effect-modifier sets, selection models, and standardization models;
- whether transported estimates depend on extrapolation from unsupported source regions;
- source internal validity limitations that cannot be fixed by transport.

Do not let external-validity reweighting hide internal-validity problems. A transported biased effect remains biased.

## Output To Main Team

Return:

- source and target populations/settings;
- transported estimand and target effect scale;
- effect modifiers and source-target compatibility status;
- whether the request is direct, adapted, exploratory, blocked, or not applicable;
- feasible method/package lane and why it fits;
- assumptions, diagnostics, limitations, and robustness needs;
- statistical_evidence: status, source-target claim scope, transport-specific inference or validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.target_goal`:

- set `subskill_id`: `24-transportability-generalizability`
- set `module_type`: `target_goal`
- set `role`: `target_module`
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.target_goal`: `target_goal`, `estimand_targets`, `target_population`, `effect_scale`, `decision_or_interpretation_goal`, `design_route_needed`, and `reporting_boundary`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Transportability and Target Population" or "External Validity";
- source and target populations and why transport/generalization was considered;
- target estimand and source design;
- treatment/outcome/follow-up version comparison;
- effect modifiers, target data availability, and overlap diagnostics;
- method, software, weighting/standardization model, and sensitivity checks;
- transported estimate or qualitative external-validity assessment if computed;
- claim boundary: transportable, cautiously generalizable, descriptive only, or not supportable;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed transportability workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for inverse-odds weighting, target standardization, and source-target diagnostics.
- `scripts/recommend.py`: rule-based target/package recommender for quick internal triage.
