# Heterogeneous Effects Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, report material, or connected-specialist needs as council/result recommendations unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when `SKILL.md` is not enough for subgroup effects, CATE/GATE estimation, effect-modifier screening, or heterogeneity report support.

## 1. Clarify The Heterogeneity Target

Record the smallest useful target:

- **Question**: "Does the effect differ?", "For whom is it larger?", "Which subgroup is affected?", or "Can we predict CATE?"
- **Effect scale**: risk difference, mean difference, risk ratio, odds ratio, hazard, RMST, cumulative incidence, or utility scale.
- **Modifier set**: prespecified subgroup, domain-defined strata, site/group, continuous baseline feature, learned partition, or high-dimensional covariate set.
- **Timing**: modifiers must be baseline/pre-treatment unless a different target is explicitly justified.
- **Status**: confirmatory, prespecified secondary, exploratory, hypothesis-generating, or report-only descriptive.
- **Use**: scientific interpretation, equity/safety, mechanism clue, design refinement, report section, or policy-rule review.

If the user wants a decision rule or prioritization, recommend `11-point-treatment-rules` review. If the modifier is a mediator or post-treatment pathway variable, recommend `12-mediation` or another valid post-treatment target before estimating.

## 2. Check Design Fit

Heterogeneity inherits the main design route's identification assumptions and adds subgroup/support requirements.

- Randomized trial: good for prespecified subgroup/GATE and exploratory CATE, but multiplicity and low subgroup power remain serious.
- Observational single-time exposure: require exchangeability, positivity, support within subgroups, and robust nuisance modeling.
- Longitudinal treatment: recommend `02-longitudinal-gmethods` review; effect modifiers may be baseline or history-dependent depending on the estimand.
- IV/LATE: heterogeneity may describe complier/local effects, not ordinary ATE heterogeneity without extra assumptions.
- DiD/RD/synthetic control: heterogeneity can be possible but often requires design-specific interpretation, support, and diagnostics.
- Survival outcomes: keep this target active, but recommend `23-survival-competing-risks` review for censoring, time scale, and effect measure.

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

## 4. Recommend Focused Evidence

Recommend one or two concrete checks at a time:

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

## 6. Connected Reviewer Relevance

Preserve reviewer relevance in the `method_task_results` item rather than assigning work directly.

- `domain_expert`: subgroup meaning, equity/safety relevance, mechanism plausibility, site/time interpretation, and wording.
- `data_analyst`: support checks, modifier timing, folds, CATE/GATE artifacts, plots, and reproducible code paths.
- `method_lead`: whether the base design identifies the heterogeneity target, which estimand is valid, and how strong the method claim can be.
- `causal_gatekeeper`: whether subgroup/CATE wording overstates the base route, support, multiplicity, validation, or causal claim.
- `report_writer`: subgroup/GATE/CATE visuals, validation notes, limitations, and careful report wording.

## 7. Report-Support Fields

For downstream `method_lead`, `causal_gatekeeper`, and `report_writer` review, preserve compact report-support fields in the `method_task_results` item.

Suggested wording:

- "prespecified subgroup analysis" when defined before seeing results;
- "exploratory heterogeneity analysis" when discovered or heavily data-adaptive;
- "estimated CATE" or "model-based CATE" for flexible predictions;
- "GATE for [group]" for group average effects.

Avoid:

- "individual treatment effect was observed";
- "the model discovered who benefits" unless policy, support, and validation are complete;
- "no heterogeneity" when power/support is weak.
