---
name: regression-discontinuity
description: "Use as a design_route method/task subskill for regression discontinuity, RD/RDD, sharp or fuzzy RD, regression kink designs, geographic or border RD, score/rank/date cutoffs, running or forcing variables, bandwidths, robust bias correction, local randomization, McCrary/rddensity checks, covariate continuity, manipulation/sorting/heaping diagnostics, donut RD, placebo cutoffs, multiple cutoffs, rdrobust/rdlocrand/rdmulti/rdpower support, and RD report support."
---

# regression_discontinuity

## Role

Act as a bounded `design_route` specialist for cutoff-based local causal designs. Decide whether a known threshold in a running variable creates a credible local comparison, what local estimand is supportable, which RD lane fits, and what diagnostics or caveats are required before the main team treats the result as causal.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

Follow the shared `Common Constructed-Input Claim Checks` in `references/method_subskill_contract.md`: judge the analysis dataset used by this method, not source-data transformations in isolation. When `data_analyst` records constructed inputs, simplifications, or alignment limits, use existing `statistical_evidence`, `method_specific_limits`, `requests`, and `method_lead_recheck` fields to state whether the input supports this module's estimand and assumptions or needs reframing.

This module is about the design route. It does not replace target-goal modules for heterogeneity, policy learning, mediation, transportability, survival outcomes, or dose-response; call those when the RD estimand needs them.

## When To Activate

Use this module when treatment, eligibility, intensity, encouragement, exposure, assignment probability, or policy status changes at a known cutoff, threshold, score, rank, age, date, margin, distance, boundary, or other running/forcing variable.

Also use it when another module needs an RD-style design check, local comparison, cutoff validity review, manipulation/sorting diagnostic, bandwidth choice, fuzzy RD/local IV coordination, regression kink support, or RD report packet.

## Inputs To Read

Read only the compact state needed for RD support:

- `project_summary`: user goal, phase, data paths, deliverable, audience.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `variable_roster`: current construct, data-binding, data-status, and method-role notes for decision-relevant variables.
- `domain_expert`: cutoff rule meaning, institutional assignment process, manipulation incentives, simultaneous policy changes, meaningful local population, and interpretation boundaries.
- `data_analyst`: analysis alignment, running-variable construction, cutoff coding, treatment jump, density evidence, covariate/outcome continuity plots, sample near cutoff, clustering, and reproducibility assets.
- `method_lead`: causal claim, target population, estimand, assumptions, diagnostics, sensitivity checks, related subskills, and wording boundary.
- related `subskill_records`: especially instrumental variables, randomized experiments, DiD/event study, synthetic control/time series, interference, transportability, survival, heterogeneity, or dose-response records.

Start from `variable_roster` and `method_lead.causal_structure` as the compact shared state; use reviewer sections only for bounded design details needed by this module.

## Fit / Failure Logic

Check these before recommending software:

- Assignment rule: the cutoff is real, known, applied at the right time, and not chosen after seeing outcomes.
- Running variable: measured before treatment, constructed consistently, has support on both sides, and is not a post-treatment variable.
- Treatment jump: treatment probability or intensity changes at the cutoff; sharp, fuzzy, kink, or no-jump status is explicit.
- Local continuity: potential outcomes and predetermined covariates are plausibly smooth through the cutoff.
- Manipulation/sorting: units cannot precisely control the running variable, or any manipulation is diagnosed and bounded.
- Local support: enough observations exist near the cutoff for the intended estimator and subgroup/cluster structure.
- Exclusivity: no other policy, measurement, eligibility, or data-collection rule changes at the same cutoff in a way that explains the outcome jump.
- Outcome timing: outcome is measured after the cutoff-driven assignment and on a scale meaningful near the cutoff.
- Estimand: the target is local to the cutoff unless a separate transportability argument is made.

Apply the common constructed-input checks to RD inputs. Centering, scaling, trimming, donut exclusions, bandwidth choices, binned plots, or running-variable cleaning can be valid when the estimator still uses the correct cutoff logic and local support. If construction bins away local information, chooses bandwidth/windows after seeing effects, changes the cutoff population, or uses an outcome-derived running variable, cap the claim or request recheck.

Block or heavily caveat causal RD claims when the cutoff rule is not real, treatment does not change at the cutoff, running variable is post-treatment, manipulation/sorting is severe, density or covariate continuity fails for important predetermined variables, data are too sparse near the cutoff, major concurrent policies change at the threshold, or the user wants a broad population claim without transportability support.

## Data Work It May Request

Ask `data_analyst` for one small, concrete RD check by default:

- running variable, cutoff, treatment indicator/intensity, outcome, covariates, cluster ids, sample restrictions, weights, and time fields;
- counts and summaries on each side of the cutoff and inside candidate bandwidths;
- RD plot of outcome versus running variable and treatment jump plot;
- density/manipulation check and heaping/rounding review;
- covariate continuity table/plots for predetermined variables;
- bandwidth selection, local sample sizes, kernel/order choices, cluster status, and sensitivity outputs;
- donut RD, placebo cutoff, placebo outcome, alternative bandwidth, or local randomization balance checks when relevant;
- reproducible code, model object, figure/table paths, and package versions.

## Method Or Support Guidance

Choose the lane from the cutoff process, not from software convenience:

- Sharp RD: use local polynomial RD with robust bias-corrected inference when treatment deterministically changes at the cutoff.
- Fuzzy RD: treat the cutoff as a local instrument for treatment receipt or exposure; coordinate with `12-instrumental-variables` and report local complier interpretation.
- Regression kink design: use only when the treatment/intensity slope changes at the cutoff; assumptions and diagnostics are stronger than ordinary RD and require slope-change evidence.
- Local randomization RD: use when a narrow window around the cutoff can credibly be treated as as-if randomized, especially with discrete scores or very local assignment.
- Geographic/border RD: coordinate with `14-interference-spillovers` and domain/geospatial review; sorting, spillovers, boundary-specific confounding, and two-dimensional geography matter.
- Time cutoff RD: coordinate with `10-did-event-study` or `13-synthetic-control-time-series` when secular trends, seasonality, shocks, or other date-specific changes could explain the discontinuity.
- Multiple cutoffs or scores: use multiple-cutoff/multiple-score tools and report whether effects are cutoff-specific or pooled.
- Planning or underpowered RD: use power/design calculations before promising an estimable local effect.
- ML support: machine learning can help construct variables, explore heterogeneity, or support nuisance/diagnostic work, but core RD identification and inference should stay local, transparent, and design-based.

Use `scripts/recommend.py` with `sample_input.json` when quick RD/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Statistical Evidence And Claim Scope

Fill `statistical_evidence` with the local claim supported at the cutoff:

- `inference_supported` when cutoff assignment logic is credible, manipulation/sorting evidence is acceptable, bandwidth/kernel/order choices are defensible, and robust bias-corrected or local-randomization inference is used as appropriate.
- `exploratory_only` when bandwidths, donut rules, polynomial order, covariates, or subgroup contrasts were selected after seeing results without sensitivity checks.
- `claim_scope`: local effect at or near the cutoff, sharp or fuzzy as specified; extrapolation away from the cutoff is descriptive or model-implied unless separately justified.
- Valid routes include local polynomial RD with robust bias correction, fuzzy RD/IV inference, local randomization/permutation inference, density and covariate continuity diagnostics, bandwidth sensitivity, and placebo cutoff/outcome checks.
- Do not let a visually smooth RD plot, global polynomial regression, or strong first stage alone upgrade the claim without local design and inference checks.

Treat the listed routes as examples, not an exhaustive whitelist. Equivalent, newer, or domain-adapted validation routes are acceptable when their assumptions, diagnostics, uncertainty logic, data-dependence handling, and supported claim scope are explicitly recorded in `statistical_evidence`.

For RD, the statistical claim is a local design claim around a known threshold. The strongest evidence comes from a defensible cutoff rule, local support on both sides, continuity or local-randomization logic, and inference that accounts for bandwidth and bias. Treat these as claim-boundary issues:

- the cutoff, running variable, and treatment jump must exist before outcome inspection and must be measured before treatment;
- density discontinuities, heaping, sorting, or manipulation near the cutoff can undermine the local comparison;
- bandwidth, kernel, order, donut, covariate, and subgroup choices can become post-hoc specification searches;
- fuzzy RD estimates a local IV/complier effect at the cutoff, not a broad treatment effect;
- global high-order polynomial fits, visually compelling plots, and a strong first stage do not replace local RD inference.

### Writing The YAML Handoff

When writing `subskill_records.statistical_evidence`:

1. Set `status: inference_supported` only when the cutoff rule, running variable timing, local support, manipulation review, estimator, bandwidth, and inference route are defensible for the reported local effect.
2. Set `status: internally_validated` when RD plots, density/covariate checks, placebo cutoffs/outcomes, and bandwidth sensitivity support the design but the evidence should remain local and assumption-bounded.
3. Set `status: exploratory_only` when the result is a first-pass RD plot/regression, bandwidth or donut choices were made after seeing results, the sample is sparse, or subgroup/covariate choices are provisional.
4. Set `status: blocked` when treatment does not jump at the cutoff, the running variable is post-treatment, manipulation is severe, both-side support is absent, or a concurrent threshold rule explains the outcome.
5. Set `claim_scope` to `target_sample` for the local sample near the cutoff, `internally_validated` when diagnostics support but do not prove continuity, or `exploratory_only` for visual or benchmark fits.
6. Use `inference_or_validation_route` for RD-specific support: robust bias-corrected local polynomial RD, fuzzy RD/local IV, local-randomization/permutation inference, density test, covariate continuity, bandwidth sensitivity, donut RD, placebo cutoff, or placebo outcome.
7. Use `method_specific_limits` to state the exact local boundary: local-to-cutoff only, fuzzy complier effect only, no extrapolation away from cutoff, no high-order polynomial anchor, no causal claim if sorting/concurrent policy remains unresolved.
8. Ask `data_analyst` for the smallest missing check: cutoff-rule table, running-variable histogram/density, local counts, treatment jump, outcome RD plot, predetermined covariate continuity, bandwidth sensitivity, fuzzy first stage, or local-randomization window balance.
9. Set `method_lead_recheck.required: true` when the RD record changes the estimand from broad ATE to local cutoff effect, indicates fuzzy/local IV interpretation, blocks the cutoff design, or changes report wording.

Example - exploratory first-pass RD:

```yaml
statistical_evidence:
  status: exploratory_only
  claim_scope: exploratory_only
  inference_or_validation_route:
    - "Current output is an RD plot and benchmark local-linear fit; robust bias-corrected inference and manipulation/covariate diagnostics are still needed."
    - "Run bandwidth sensitivity and density review before reporting a local causal claim."
  method_specific_limits:
    - "Cannot claim a causal discontinuity until cutoff validity, local support, and manipulation/sorting checks are reviewed."
    - "Any effect is local to the cutoff and should not be generalized away from the threshold."
requests:
  data_analyst:
    - "Produce treatment jump plot, rddensity/McCrary-style density check, local counts by bandwidth, and covariate continuity table."
method_lead_recheck:
  required: true
  reason: "The intended broad claim may need to be narrowed to a local cutoff estimand."
```

Example - supported local RD:

```yaml
statistical_evidence:
  status: inference_supported
  claim_scope: target_sample
  inference_or_validation_route:
    - "Robust bias-corrected local polynomial RD used with transparent bandwidth/kernel/order choices."
    - "Density, covariate continuity, treatment jump, and bandwidth/donut sensitivity reviewed."
  method_specific_limits:
    - "Claim is local at the cutoff under continuity or local-randomization assumptions."
    - "No claim is made for units far from the cutoff without separate transportability or modeling support."
```

## Diagnostics And Sensitivity

Review:

- outcome RD plot and treatment-jump plot with transparent binning;
- density/manipulation test and visual running-variable distribution;
- heaping, bunching, score rounding, and eligibility gaming;
- predetermined covariate continuity near the cutoff;
- bandwidth selection and sensitivity across narrower/wider bandwidths;
- local polynomial order, kernel, robust bias correction, and cluster-robust inference if needed;
- donut RD, placebo cutoffs, placebo outcomes, and alternative samples;
- fuzzy first stage and local Wald/IV diagnostics when treatment receipt is not sharp;
- local randomization balance and window sensitivity when using the randomization framework;
- concurrent policy changes, time shocks, spillovers, and extrapolation beyond the cutoff.

Avoid relying on global high-order polynomials as the primary RD specification. If shown, treat them as sensitivity or descriptive benchmarks, not the credibility anchor.

## Output To Main Team

Return:

- RD lane, cutoff rule, running variable, treatment jump status, local estimand, target population near cutoff, and assignment timing;
- whether implementation is direct, adapted, exploratory, blocked, or not applicable;
- candidate packages/models, diagnostics, assumptions, sensitivity checks, and limitations;
- statistical_evidence: status, local RD claim scope, cutoff-specific inference or validation route, and exact wording limits;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- `method_lead_recheck.required` and a brief reason only when the record could change causal strategy, selected framework, estimand set, `causal_structure`, gate status, claim strength, or wording boundary;
- one controlled `recommended_next_action`.

For durable records, use the common envelope plus `type_specific.design_route`:

- set `subskill_id`: `11-regression-discontinuity`
- set `module_type`: `design_route`
- set `role`: `primary_route`, `support_module`, or `diagnostic_module` as fits the activation
- set `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`
- fill `statistical_evidence` using the section above before finalizing the record
- fill `type_specific.design_route`: `causal_comparison`, `design_route`, `identification_status`, `required_timing`, `comparison_group_logic`, `key_identification_assumptions`, `invalidating_conditions`, and `estimands_supported`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Regression Discontinuity Design", "Fuzzy Regression Discontinuity", "Regression Kink Design", or "Cutoff-Based Local Effect";
- assignment rule, running variable, cutoff, treatment/exposure, outcome, local target population, and timing;
- local estimand and whether the design is sharp, fuzzy, kink, local-randomization, geographic, time-cutoff, or multiple-cutoff;
- estimator and package, bandwidth/kernel/order, robust bias correction, clustering, covariates, and inference choices;
- RD plot, treatment jump, density/manipulation evidence, covariate continuity evidence, bandwidth sensitivity, donut/placebo checks, and first-stage evidence when fuzzy;
- limitations: local estimand, sorting/manipulation, sparse support, heaping, concurrent policies, spillovers, time shocks, weak first stage, or unsupported generalization;
- code, table, figure, model-object, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed RD workflow, team coordination, diagnostics, and report integration.
- `references/literature_and_software.md`: RD literature and R/Python/Stata package matrix.
- `examples/`: short R/Python templates for sharp RD, fuzzy RD, density/manipulation, local randomization, and local-linear benchmarks.
- `scripts/recommend.py`: rule-based RD recommender for quick internal triage.
