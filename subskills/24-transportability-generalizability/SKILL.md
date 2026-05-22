---
name: transportability-generalizability
description: "Use as a target_goal method/task subskill for transportability, generalizability, external validity, target-population effects, trial-to-target translation, site transport, population reweighting, selection diagrams, source-target overlap, and whether causal evidence applies to another population or setting."
---

# transportability_generalizability

## Role

Act as a bounded `target_goal` specialist for moving evidence from one sample, study, trial, site, time period, or population to another. Clarify the source population, target population, transported estimand, selection process, effect modifiers, treatment/outcome versions, and whether the required source-target data exist.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

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
- `data_analyst`: source and target data availability, covariate overlap, sampling/selection variables, missing target variables, weights, and artifacts.
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
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.target_goal`:

- set `subskill_id`: `24-transportability-generalizability`
- set `module_type`: `target_goal`
- set `role`: `target_module`
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
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
