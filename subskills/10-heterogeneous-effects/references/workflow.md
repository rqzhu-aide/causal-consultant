# Heterogeneous Effects Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for subgroup effects, CATE/GATE estimation, effect-modifier screening, or heterogeneity report support.

## 1. Clarify The Heterogeneity Target

Record the smallest useful target:

- **Question**: "Does the effect differ?", "For whom is it larger?", "Which subgroup is affected?", or "Can we predict CATE?"
- **Effect scale**: risk difference, mean difference, risk ratio, odds ratio, hazard, RMST, cumulative incidence, or utility scale.
- **Modifier set**: prespecified subgroup, domain-defined strata, site/group, continuous baseline feature, learned partition, or high-dimensional covariate set.
- **Timing**: modifiers must be baseline/pre-treatment unless a different target is explicitly justified.
- **Status**: confirmatory, prespecified secondary, exploratory, hypothesis-generating, or report-only descriptive.
- **Use**: scientific interpretation, equity/safety, mechanism clue, design refinement, report section, or handoff to policy-rule module.

If the user wants a decision rule or prioritization, ask main to route `11-point-treatment-rules`. If the modifier is a mediator or post-treatment pathway variable, ask main to route `12-mediation` or another valid post-treatment target before estimating.

## 2. Check Design Fit

Heterogeneity inherits the main design route's identification assumptions and adds subgroup/support requirements.

- Randomized trial: good for prespecified subgroup/GATE and exploratory CATE, but multiplicity and low subgroup power remain serious.
- Observational single-time exposure: require exchangeability, positivity, support within subgroups, and robust nuisance modeling.
- Longitudinal treatment: ask main to route `02-longitudinal-gmethods`; effect modifiers may be baseline or history-dependent depending on the estimand.
- IV/LATE: heterogeneity may describe complier/local effects, not ordinary ATE heterogeneity without extra assumptions.
- DiD/RD/synthetic control: heterogeneity can be possible but often requires design-specific interpretation, support, and diagnostics.
- Survival outcomes: keep this target active, but ask main to route `23-survival-competing-risks` for censoring, time scale, and effect measure.

## 3. Choose A Method Lane

| Situation | Prefer | Why | Watch |
|---|---|---|---|
| Small number of prespecified modifiers | Stratified estimates, interaction models, marginal standardization | Transparent, easy to report | Low power and multiplicity |
| Many groups or sparse strata | Hierarchical/shrinkage models, partial pooling, Bayesian or mixed models | Stabilizes subgroup estimates | Model dependence and scale sensitivity |
| Interpretable discovered groups | Honest causal tree, causal rule ensemble, shallow tree | Human-readable partition | Instability if sample is small |
| Rich nonlinear HTE | `grf` causal forest, EconML `CausalForestDML` | Flexible CATE with honesty/orthogonalization options | Needs support, diagnostics, and cautious individual language |
| ML plugin workflow | S/T/X/R/DR learners in CausalML, EconML, DoubleML | Can use random forests, boosting, lasso, neural nets as nuisance/predictive components | Learner choice affects CATE; cross-fitting matters |
| Reportable GATEs | DoubleML GATE, GRF BLP/GATE, interaction models | Easier inference than raw CATE maps | Groups must be meaningful and supported |
| Policy implication | Heterogeneity plus `11-point-treatment-rules` | Converts effect variation into decision logic | CATE alone ignores costs, harms, and constraints |

## 4. Ask For Focused Data Work

Ask for one or two concrete checks at a time:

- subgroup counts, treatment rates, outcome rates, and missingness;
- overlap/balance by subgroup or candidate effect modifier;
- baseline timing and construct validity check;
- forest/meta-learner train/test or cross-fitting plan;
- CATE calibration and ranking diagnostics;
- GATE table with uncertainty, multiplicity note, and artifact path;
- comparison to a simpler interaction or stratified model.

## 5. Diagnose Before Reporting

Minimum diagnostic set:

- support and overlap within subgroups or high/low predicted CATE regions;
- uncertainty intervals and multiplicity status;
- stability across folds, seeds, covariate sets, and learner classes;
- calibration of CATEs or grouped predicted effects;
- comparison with prespecified/simple models;
- unmeasured confounding sensitivity for observational data;
- effect-scale sensitivity when risk ratios/odds ratios/hazards could change conclusions.

## 6. Reviewer Interaction

- `domain_expert`: validates subgroup meaning, equity/safety relevance, mechanism plausibility, and wording.
- `data_analyst`: prepares support checks, folds, CATE/GATE artifacts, plots, and reproducible code.
- `method_lead`: decides whether the design identifies heterogeneity, which estimand is valid, and how strong the claim can be.
- `report_writer`: integrates heterogeneity results into the working report when substantive.

## 7. Report Language

Use:

- "prespecified subgroup analysis" when defined before seeing results;
- "exploratory heterogeneity analysis" when discovered or heavily data-adaptive;
- "estimated CATE" or "model-based CATE" for flexible predictions;
- "GATE for [group]" for group average effects.

Avoid:

- "individual treatment effect was observed";
- "the model discovered who benefits" unless policy, support, and validation are complete;
- "no heterogeneity" when power/support is weak.
