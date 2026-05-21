---
name: regression-discontinuity
description: "Use as a design_route method/task subskill for regression discontinuity, RD/RDD, sharp or fuzzy RD, regression kink designs, geographic or border RD, score/rank/date cutoffs, running or forcing variables, bandwidths, robust bias correction, local randomization, McCrary/rddensity checks, covariate continuity, manipulation/sorting/heaping diagnostics, donut RD, placebo cutoffs, multiple cutoffs, rdrobust/rdlocrand/rdmulti/rdpower support, and RD report support."
---

# regression_discontinuity

## Role

Act as a bounded `design_route` specialist for cutoff-based local causal designs. Decide whether a known threshold in a running variable creates a credible local comparison, what local estimand is supportable, which RD lane fits, and what diagnostics or caveats are required before the main team treats the result as causal.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module is about the design route. It does not replace target-goal modules for heterogeneity, policy learning, mediation, transportability, survival outcomes, or dose-response; call those when the RD estimand needs them.

## When To Activate

Use this module when treatment, eligibility, intensity, encouragement, exposure, assignment probability, or policy status changes at a known cutoff, threshold, score, rank, age, date, margin, distance, boundary, or other running/forcing variable.

Also use it when another module needs an RD-style design check, local comparison, cutoff validity review, manipulation/sorting diagnostic, bandwidth choice, fuzzy RD/local IV coordination, regression kink support, or RD report packet.

## Inputs To Read

Read only the compact state needed for RD support:

- `project_summary`: user goal, phase, data paths, deliverable, audience.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `domain_expert`: cutoff rule meaning, institutional assignment process, manipulation incentives, simultaneous policy changes, meaningful local population, and interpretation boundaries.
- `data_analyst`: running-variable construction, cutoff coding, treatment jump, density evidence, covariate/outcome continuity plots, sample near cutoff, clustering, and reproducibility assets.
- `method_lead`: causal claim, target population, estimand, assumptions, diagnostics, sensitivity checks, related subskills, and wording boundary.
- related `subskill_records`: especially instrumental variables, randomized experiments, DiD/event study, synthetic control/time series, interference, transportability, survival, heterogeneity, or dose-response records.

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
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- one controlled `recommended_next_action`.

For durable records, use:

- `subskill_id`: `11-regression-discontinuity`
- `module_type`: `design_route`
- `role`: `regression_discontinuity_design`
- `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`

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
