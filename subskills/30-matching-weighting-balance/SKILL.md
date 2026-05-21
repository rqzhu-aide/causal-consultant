---
name: matching-weighting-balance
description: "Use as an implementation_support method/task subskill for matching, weighting, propensity scores, balancing scores, overlap, positivity, trimming, exact or coarsened matching, entropy balancing, overlap weights, ATT/ATE/ATO weighting, survey-weight integration, balance diagnostics, effective sample size, and report-ready matched or weighted comparison evidence."
---

# matching_weighting_balance

## Role

Act as a bounded `implementation_support` specialist for constructing and diagnosing matched or weighted comparisons inside a selected design route and target. Improve balance, support, estimand clarity, and report transparency without supplying identification by itself.

Do not speak to the user, own gates, or maintain a permanent YAML section. Return compact feedback using `assets/method_job_subskill_record_template.yaml` when durable.

This module supports designs such as observational point exposure, longitudinal IPW/MSM, transportability, and some trial-to-target settings. It must not override `method_lead` on the causal claim, estimand, DAG/theory, or gate status.

## When To Activate

Use this module when a design route needs propensity scores, balancing scores, matching, weighting, trimming, overlap checks, positivity diagnostics, covariate balance, standardized mean differences, effective sample size, ATT/ATE/ATO/overlap targets, survey-weight integration, calibration, entropy balancing, or matched/weighted report tables.

Do not use it when treatment is actually randomized and simple design-based adjustment is enough, unless balance diagnostics, trial-to-target weighting, noncompliance weighting, or precision/support checks are specifically needed.

## Inputs To Read

Read only the compact state needed for balance/support implementation:

- `project_summary`: goal, phase, deliverable, audience, data paths.
- `team_synthesis`: current user turn, facts, tensions, missing information.
- `domain_expert`: confounder meaning, exact-match variables, target population, and acceptable support restrictions.
- `data_analyst`: covariate timing, missingness, treatment prevalence, support, survey weights, clusters, and artifacts.
- `method_lead`: design route, estimand, adjustment set, positivity concerns, sensitivity plan, and wording boundary.
- related `subskill_records`: especially observational exposure, longitudinal g-methods, transportability, dose-response, doubly robust estimation, DML, or survival records.

## Fit / Failure Logic

Check these before recommending a matching/weighting plan:

- Estimand: ATE, ATT, ATC, ATO/overlap, target-population, longitudinal strategy, or survey-weighted target is explicit.
- Covariates: adjustment variables are pre-treatment and match the DAG/theory; mediators/colliders are not included as ordinary confounders.
- Support: comparison groups overlap enough for the chosen estimand.
- Missingness: covariate and outcome missingness handling is specified before matching/weighting.
- Treatment model: propensity or balancing model can be estimated without separation, leakage, or unstable high-dimensional overfit.
- Weights/matches: extreme weights, discarded units, replacement, calipers, exact-match constraints, and clustering are tracked.
- Diagnostics: balance is checked on covariates and important transforms/interactions, not only propensity scores.
- Report target: the final matched/weighted population is interpretable to the domain and user.

Block or caveat implementation when key confounders are missing, covariates are post-treatment, support is absent, weights are unstable, matching discards the target population, survey design is ignored when required, or balance diagnostics remain poor after reasonable attempts.

## Data Work It May Request

Ask `data_analyst` for one small, concrete follow-up by default:

- pre-treatment adjustment-set table with missingness and timing flags;
- propensity score and overlap plots by treatment;
- balance table before and after matching/weighting using standardized mean differences;
- weight distribution, truncation, and effective sample size;
- matched-pair or subclass counts, discarded units, and target-population shift;
- exact-match or coarsened-match feasibility for domain-critical variables;
- survey-weight, cluster, or repeated-measure implications;
- reproducible matched/weighted analysis dataset and diagnostic artifacts.

## Method Or Support Guidance

Choose the support lane from estimand and support:

- Nearest-neighbor, optimal, exact, or coarsened matching when the goal is transparent ATT-style comparison and adequate controls exist.
- Full matching, subclassification, or matching with replacement when support is uneven and preserving more units matters.
- IPW/IPTW or stabilized weights when ATE or longitudinal MSM-style targets are supported and weights are stable.
- ATT/ATC weights when one observed group is the target population.
- Overlap weights or trimming when broad ATE support is weak but a supported overlap population is meaningful.
- Entropy balancing, calibration, raking, CBPS, or stable balancing weights when direct balance is more important than a propensity model story.
- Survey or transport weights when the target is a population or trial-to-target effect, coordinated with `24-transportability-generalizability`.

Machine learning can estimate propensity scores or balancing weights, but balance, support, and target-population meaning matter more than predictive accuracy.

Use `scripts/recommend.py` with `sample_input.json` when quick implementation/package triage is useful. Load `references/workflow.md` for detailed workflow and `references/literature_and_software.md` for paper/package selection.

## Diagnostics And Sensitivity

Review:

- pre/post standardized mean differences, variance ratios, empirical CDF/KS-style differences, and distribution plots;
- overlap/common support and propensity score separation;
- effective sample size, weight tails, truncation, and influence of large weights;
- discarded units, matched-pair quality, replacement, calipers, and target-population shift;
- balance on exact-match variables, nonlinear terms, interactions, and high-priority domain covariates;
- robustness to method, caliper, trimming, propensity learner, weight type, and estimand;
- compatibility with clustering, survey design, missingness, censoring, and outcome type.

Do not present balance improvement as proof of no unmeasured confounding. It is evidence about measured covariate comparability only.

## Output To Main Team

Return:

- selected matching/weighting target, estimand implications, and target population;
- whether the implementation is direct, adapted, exploratory, blocked, or not applicable;
- feasible package/model lane and why it fits;
- balance, overlap, weight, and matched-sample diagnostics needed or reviewed;
- limitations, robustness checks, and report-ready artifacts;
- concrete requests for `domain_expert`, `data_analyst`, `method_lead`, user, or another subskill;
- one controlled `recommended_next_action`.

For durable records, use:

- `subskill_id`: `30-matching-weighting-balance`
- `module_type`: `implementation_support`
- `role`: `implementation_support`
- `status`: `candidate`, `activated`, `reviewing`, `plan_proposed`, `first_pass_supported`, `diagnostics_reviewed`, `materials_ready`, `blocked`, or `deferred`

## Report Support

When this module affects the deliverable, provide a report packet with:

- proposed section title such as "Matching and Balance Diagnostics" or "Weighting and Positivity Checks";
- estimand, target population, adjustment set, and why matching/weighting was used;
- method, software, propensity/balancing model, caliper/trimming/weight choices;
- units retained/discarded, effective sample size, and target-population shift;
- balance and overlap figures/tables;
- limitations: measured confounding only, support restrictions, extreme weights, missingness, or survey/cluster issues;
- code, table, figure, and appendix paths.

## Reference Files

- `references/workflow.md`: detailed matching/weighting workflow, reviewer handoffs, diagnostics, and report integration.
- `references/literature_and_software.md`: literature map and R/Python package matrix.
- `examples/`: short R/Python templates for matching, weighting, balance plots, overlap weights, entropy balancing, and diagnostics.
- `scripts/recommend.py`: rule-based matching/weighting recommender for quick internal triage.
