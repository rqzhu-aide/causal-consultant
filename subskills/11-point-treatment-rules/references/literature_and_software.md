# Literature And Software Map

Use this file to choose credible method families and packages. Package/software details are reference-only; the specialist writes one `method_task_results` item, artifact_index entries only for execution-created artifacts, and one council entry through the shared contract. Keep the main team focused on decision target, identification, support, and evaluation before software.

## Core Literature

### Statistical Treatment Rules And Welfare

- Manski (2004), [Statistical Treatment Rules for Heterogeneous Populations](https://www.econometricsociety.org/publications/econometrica/2004/07/01/statistical-treatment-rules-heterogeneous-populations): minimax-regret treatment choice and covariate-use tradeoffs in randomized experiments.
- Hirano and Porter (2009), [Asymptotics for Statistical Treatment Rules](https://doi.org/10.3982/ECTA6630): large-sample theory for statistical treatment assignment.
- Kitagawa and Tetenov (2018), [Who Should Be Treated? Empirical Welfare Maximization Methods for Treatment Choice](https://discovery.ucl.ac.uk/10038909/): empirical welfare maximization over constrained policy classes; especially useful for budget, simplicity, and institutional constraints.

### Individualized Treatment Rules

- Qian and Murphy (2011), [Performance Guarantees for Individualized Treatment Rules](https://arxiv.org/abs/1105.3369): outcome-model route for single-stage ITRs with high-dimensional covariates.
- Zhang, Tsiatis, Laber, and Davidian (2012), [A Robust Method for Estimating Optimal Treatment Regimes](https://pubmed.ncbi.nlm.nih.gov/22550953/): regression, IPW, and augmented approaches for a single treatment decision.
- Zhao, Zeng, Rush, and Kosorok (2012), [Estimating Individualized Treatment Rules Using Outcome Weighted Learning](https://www.tandfonline.com/doi/abs/10.1080/01621459.2012.695674): casts optimal ITR estimation as weighted classification.
- Zhou, Mayer-Hamblett, Khan, and Kosorok (2017), [Residual Weighted Learning for Estimating Individualized Treatment Rules](https://arxiv.org/abs/1508.03179): residualizes outcomes to reduce sensitivity to outcome shifts before weighted learning.
- Zhao et al. (2015), [Doubly robust learning for estimating individualized treatment with censored data](https://academic.oup.com/biomet/article/102/1/151/228900): important when time-to-event outcomes and censoring matter.
- Laber and Zhao (2015), [Tree-based methods for individualized treatment regimes](https://academic.oup.com/biomet/article/102/3/501/2365724): interpretable tree-based rules.
- Luedtke and van der Laan (2018), [Targeted learning ensembles for optimal individualized treatment rules with time-to-event outcomes](https://academic.oup.com/biomet/article/105/3/723/4993546): targeted learning route for censored/time-to-event rule targets.

### Policy Learning, Evaluation, And Uplift

- Athey and Wager (2021), [Policy Learning with Observational Data](https://arxiv.org/abs/1702.02896): doubly robust policy learning with regret guarantees under observational identification strategies and constraints.
- Imai and Li (2023), [Experimental Evaluation of Individualized Treatment Rules](https://imai.sites.fas.harvard.edu/research/indtreat.html): PAPE and AUPEC for randomized-data ITR evaluation.
- Dudik, Langford, and Li (2011), [Doubly Robust Policy Evaluation and Learning](https://arxiv.org/abs/1103.4601): off-policy value evaluation with direct outcome and propensity components.
- Swaminathan and Joachims (2015), [Counterfactual Risk Minimization: Learning from Logged Bandit Feedback](https://arxiv.org/abs/1502.02362): logged-bandit policy optimization with propensity weighting and variance control.
- Kallus (2018), [Balanced Policy Evaluation and Learning](https://arxiv.org/abs/1705.07384): finite-sample balance perspective for off-policy evaluation and learning.
- Nie and Wager (2021), [Quasi-Oracle Estimation of Heterogeneous Treatment Effects](https://arxiv.org/abs/1712.04912): R-learner style CATE estimation that can feed policy rules, but is not itself a policy optimizer.
- Gutierrez and Gerardy (2017), [Causal Inference and Uplift Modelling: A Review of the Literature](https://proceedings.mlr.press/v67/gutierrez17a.html): practical uplift terminology and evaluation context.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`policytree`](https://grf-labs.github.io/policytree/reference/index.html) | R | Interpretable binary or multi-action policy trees from reward/DR score matrices | Exact tree search, easy report graphics, fits EWM/policy-learning logic | Needs good reward scores; shallow trees may underfit |
| [`grf`](https://grf-labs.github.io/grf/articles/policy_learning.html) | R | Causal forests and doubly robust scores feeding policy trees or rankings | Strong CATE/nuisance ecosystem, policy-tree vignette | CATE is not automatically a rule; check overlap and held-out value |
| [`econml.policy`](https://econml.azurewebsites.net/_autosummary/econml.policy.DRPolicyTree.html) | Python | DR policy trees/forests with sklearn-style nuisance learners | Flexible Python workflow, direct `predict` recommendations | Requires careful treatment coding, nuisance choices, and evaluation |
| [`causalml`](https://causalml.readthedocs.io/) | Python | Uplift, CATE, targeting, campaign optimization, meta-learners | Practical examples and diagnostics, good product/marketing fit | APIs include experimental parts; formal causal claims still need design review |
| [`scikit-uplift`](https://www.uplift-modeling.com/en/v0.1.1/api/metrics.html) | Python | Fast uplift baselines, AUUC/Qini, sklearn-style ranking | Simple and familiar for product/marketing teams | Primarily uplift/ranking; weaker for formal policy-value inference |
| [`evalITR`](https://michaellli.github.io/evalITR/index.html) | R | Experimental evaluation of ITRs using PAPE, PAPEp, PAPDp, AUPEC | Good for randomized trials and budget comparisons | Evaluation package, not a full rule learner |
| [`personalized`](https://www.jstatsoft.org/article/view/v098i05) | R | Clinical/biostatistical subgroup and personalized medicine rules | Rich subgroup/benefit-score tooling and validation | More clinical/subgroup oriented than general policy optimization |
| [`DynTxRegime`](https://cran-e.com/package/DynTxRegime) | R | Single-stage or dynamic optimal treatment regimes | Q-learning, weighted learning, value-search methods | Dynamic use belongs to `15-dynamic-treatment-policies`; interface is specialized |
| [`polle`](https://rdrr.io/cran/polle/) | R | Policy learning/evaluation, finite-stage policies, multi-action examples | Unifies OWL, residual weighted learning, DR Q-learning, policy-tree learning | More advanced setup; for repeated stages recommend dynamic-policy support |
| [`tmle3mopttx`](https://github.com/tlverse/tmle3mopttx) | R | Targeted learning for optimal categorical treatment rules and resource constraints | CV-TMLE style evaluation, realistic rules, variable importance | Steep tlverse workflow; needs careful nuisance setup |
| [`glmnet`](https://glmnet.stanford.edu/) | R | Penalized outcome, propensity, or benefit-score nuisance models | Strong default for high-dimensional sparse covariate adjustment | Not a policy method by itself |
| [`xgboost`](https://xgboost.readthedocs.io/) / [`ranger`](https://cran.r-project.org/package=ranger) / [`SuperLearner`](https://cran.r-project.org/package=SuperLearner) | R | Flexible nuisance or uplift/ranking components | Useful plugins inside DR, DML, TMLE, or meta-learner workflows | Require cross-fitting/held-out evaluation; do not fix identification |

## Practical Selection Rules

- Need an interpretable deployable rule: start with `policytree` in R or `DRPolicyTree` in EconML.
- Need formal evaluation of an existing ITR in a randomized experiment: use `evalITR` and report PAPE/AUPEC-style metrics.
- Need product-style uplift ranking: consider `scikit-uplift` or `causalml`, but keep causal language tied to randomization/logging/propensity support.
- Need observational policy learning: prefer doubly robust/orthogonal approaches and recommend `21-doubly-robust-estimation` or `22-double-machine-learning` review.
- Need survival outcome: keep this target module active, but recommend `23-survival-competing-risks` review for censoring and estimand support.
- Need high-stakes deployment: prefer interpretable rules, prospective validation, external validation, and explicit harm/fairness constraints.

## Tiny Code Skeletons

Docs checked: 2026-06-09
Primary docs: [policytree reference](https://grf-labs.github.io/policytree/reference/index.html), [EconML `DRPolicyTree`](https://econml.azurewebsites.net/_autosummary/econml.policy.DRPolicyTree.html), [evalITR](https://michaellli.github.io/evalITR/index.html), [tmle3mopttx workshop](https://tlverse.org/tlverse-workshops/optimal-individualized-treatment-regimes.html), [polle docs](https://rdrr.io/cran/polle/), [CausalML docs](https://causalml.readthedocs.io/), [scikit-uplift metrics](https://www.uplift-modeling.com/en/v0.1.1/api/metrics.html).

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after the relevant gatekeeper status is ready or appropriately qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. When execution is authorized, create only outputs implied by the active step's `execution.scope`, `execution.claim_boundary`, and `execution.expected_outputs` inside `execution.analysis_dir`; write `artifact_index` entries for produced source, note, manifest, result artifacts, and subskill-specific paths.

```r
# Tiny sketch, not a complete script.
# Gamma should be honest estimated welfare scores, not raw outcomes.
library(policytree)

tree <- policy_tree(X = baseline_features, Gamma = welfare_scores, depth = 2)
policy_assignments <- predict(tree, baseline_features)
```

Execution output examples for `result_artifacts` or `subskill_specific`: policy/value table path, rule diagram or validation plot path, manifest path, and source code path.
