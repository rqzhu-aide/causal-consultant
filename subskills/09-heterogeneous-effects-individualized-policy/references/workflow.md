# Workflow: Heterogeneous Effects, Individualized Decisions, And Policy

## Purpose

Use this workflow when the user wants to learn how treatment effects differ across people or settings, or when they want to turn causal evidence into a single-stage individualized treatment rule, treatment prioritization score, policy rule, treatment-arm choice, or dose/intensity recommendation.

This workflow is downstream of identification. It should inherit a credible design from the main skill or another subskill before recommending CATE, uplift, individualized treatment-rule, or policy learning methods.

## Stage 1: Intent and Data Triage

Classify the user's immediate goal:

- learn about possible heterogeneity;
- estimate CATEs or individual-level scores;
- compare interpretable subgroups or GATEs;
- rank units by expected treatment benefit;
- learn an individualized treatment rule or treatment assignment policy;
- evaluate an existing policy;
- prepare results for a report.

Collect only the information needed for the next step:

- treatment/action and comparator, including whether the decision is binary, multi-arm, or continuous dose/intensity;
- outcome or reward, including whether higher is better;
- target population;
- parent causal design or why treatment assignment is credible;
- candidate effect modifiers;
- variables available at individual decision or policy assignment time;
- allowed treatment arms or dose/intensity range, including any minimum, maximum, step size, contraindication, budget, capacity, or implementation constraint;
- sample size, treatment prevalence, missingness, censoring, clusters, and repeated units;
- budget, capacity, equity, legal, or interpretability constraints.

If the user is learning, explain the difference between subgroup effects, CATEs, individualized treatment rules, treatment prioritization, and policy learning in plain language before asking for more details.

If the user has data but the design is still unclear, avoid an estimator catalog. Say that several popular methods may be suitable, offer to inspect the data structure first, and flag that method suitability will later depend on treatment timing, confounding measurement, overlap, sample size, and the new patient's support.

## Stage 2: Feasibility and Route Check

Before choosing an estimator, decide whether this subskill is the right active route.

Use this route when:

- there is a plausible randomized, observational, IV, RD, DiD, or other parent causal design;
- the variables used for heterogeneity, individualized decisions, or policy assignment are measured before treatment or at decision time;
- there is some support for treatment alternatives within the intended modifier or policy groups, or adequate generalized propensity/dose support for a continuous dose rule;
- the user accepts that CATEs and policies will be conditional on the inherited assumptions.

Route out or coordinate when:

- no causal design supports the treatment contrast;
- the task is pure prediction or risk scoring;
- the requested rule has more than one decision point, which belongs to the longitudinal g-methods skill rather than this single-stage module;
- censoring, competing risks, spillovers, missingness, or measurement error dominate;
- heterogeneity is local to compliers under IV or local to a cutoff under RD.

When routing out, update `subskill_analyses` with the rejected or fallback reason and return to the main route shortlist.

## Stage 3: Estimand and Project Spec Entry

Update the project specification entry from the top-level `../../../SKILL.md`.

At minimum, record:

- user task;
- parent identification route;
- target estimand;
- treatment contrast;
- treatment type: binary, multi-arm, or continuous dose/intensity;
- outcome or utility scale;
- effect modifiers and policy variables;
- action set, dose grid, or allowed dose/intensity bounds;
- validation strategy;
- candidate estimator families;
- fatal flaws or major limitations.

Do not fill method-specific details that are not yet known. Keep unknowns as `null` or `[]`.

## Stage 4: Method Selection

Recommend in layers rather than as a large menu. Choose only one primary family and one simpler comparator unless the user explicitly asks for a broad survey.

Start with a simple method if it answers the question:

- pre-specified subgroup/GATE analysis for a few meaningful modifiers;
- interaction regression or spline interactions for transparent scientific moderation;
- weighted or doubly robust subgroup estimates when the parent design uses weighting or DR estimation.

Move to flexible CATE methods when the user needs exploratory heterogeneity, ranking, or nonlinear modifiers and the data look suitable:

- causal forest or generalized random forest;
- R-learner, DR-learner, X-learner, T-learner, or S-learner;
- Bayesian causal forest/BART as an optional sensitivity or shrinkage-oriented analysis;
- EconML or CausalML when Python is preferred;
- continuous-treatment causal forests or DML only when the treatment is a single continuous dose/intensity and the target is a local marginal effect or dose-response component, not an unconstrained "best dose" claim.

Move to policy learning methods when the output is an action rule:

- simple threshold on validated CATE or net benefit;
- empirical welfare maximization;
- policy tree for interpretable rules;
- outcome weighted learning or residual weighted learning for individualized treatment rules;
- augmented or doubly robust outcome weighted learning when nuisance models and validation support it;
- targeted-learning optimal-rule estimation when the estimand is the mean under a single-stage optimal rule;
- doubly robust policy learning when the parent design supports it;
- for multi-arm decisions, use a package or custom workflow that explicitly handles multiple treatment arms rather than forcing repeated binary comparisons without a coherent baseline;
- for continuous dose/intensity decisions, estimate the dose-response or conditional marginal response first, then evaluate a bounded candidate dose grid or rule class against simple fixed-dose/current-policy baselines.

Always specify at least one simpler comparator, such as a pre-specified subgroup table, interaction model, treat-all/treat-none policy, current policy, or a simple risk-score baseline. If the data have not yet been inspected, label the recommendation provisional.

## Stage 5: Diagnostics and Validation

Report diagnostics that match the task.

For identification and support:

- overlap/positivity by key modifiers or policy groups;
- generalized propensity, density, or dose-support diagnostics for continuous dose/intensity decisions;
- parent-route balance, propensity, or nuisance diagnostics;
- subgroup sizes and effective sample sizes;
- timing of modifiers and decision variables.

For CATE and heterogeneity:

- CATE distribution with caution around tails;
- GATE or subgroup ATE table;
- best linear projection, calibration, or equivalent forest/DR checks;
- RATE, TOC, Qini, gain curve, or other rank validation for prioritization;
- sensitivity to learner family, tuning, covariates, trimming, and sample restrictions.

For policies:

- held-out or cross-fit policy value;
- value difference versus treat-all, treat-none, current policy, or another meaningful baseline;
- uncertainty intervals when supported;
- treatment fraction, capacity use, and group-level distribution of assignments;
- reward coding, class weights, and whether the learned rule is sensitive to outcome scale or benefit/harm definitions;
- continuous-dose rule checks: support across the proposed dose grid, uncertainty in the dose-response curve, sensitivity to grid resolution, and whether the recommended dose lies near unsupported tails;
- feasibility, fairness, harm, and cost checks.

Do not call variable importance, subgroup discovery, or SHAP-style explanations proof of causal heterogeneity. Treat them as descriptive summaries unless validated through held-out causal estimands.

## Stage 6: Interpretation and Fallback

Interpret results on three levels:

- **Causal support:** what follows if the inherited assumptions hold.
- **Statistical support:** how strong and stable the heterogeneity or policy value evidence is.
- **Actionability:** whether the result is ready for reporting, decision support, prospective validation, or only exploration.

If diagnostics fail, choose one of these fallbacks:

- narrow the target population to regions with overlap;
- switch from CATEs to GATEs or pre-specified subgroups;
- simplify the policy rule;
- discretize a continuous dose into clinically meaningful levels only as an exploratory sensitivity analysis, and label the resulting rule as grid-dependent;
- use the result only as hypothesis generation;
- route back to the parent design or another subskill;
- recommend prospective validation before deployment.

## Suggested Response Pattern

```markdown
I would treat this as a heterogeneous-effects/individualized-policy problem because [reason].

The parent causal route appears to be [design]. The HTE analysis will inherit assumptions from that route, especially [plain-language assumption summary].

There are several popular methods for this task. I would first look at [data/design feature] and then narrow the shortlist. The early candidates are [one primary family] plus [one simpler comparator].

The target is [plain-language estimand], which corresponds to [CATE/GATE/individualized treatment rule/policy value/uplift/ranking] if we need the formal label.

Before treating the result causally, I would check [plain-language support/confounding/timing condition]. If [main support or validation check] fails, I would [fallback plan].
```

## Code Template Index

Root templates:

- `scripts/R/grf_causal_forest_template.R`
- `scripts/python/econml_cate_template.py`

Use these as starting points only. Adapt treatment type, outcome scale, covariates, validation folds, clustering, and parent-route assumptions before returning code.

## Literature and Software Map

For key papers, package capabilities, and method-selection notes, read `literature_and_software.md` in this folder.
