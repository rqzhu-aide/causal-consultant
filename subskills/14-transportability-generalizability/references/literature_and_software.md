# Literature And Software Map

Use this file to choose credible transportability/generalizability estimands, diagnostics, and packages. Keep source validity and target definition ahead of software.

## Core Literature

### Transportability And Selection Diagrams

- Pearl and Bareinboim (2011), [Transportability of causal and statistical relations](https://ftp.cs.ucla.edu/pub/stat_ser/r372.pdf): selection diagrams and graphical transport logic.
- Bareinboim and Pearl (2016), [Causal inference and the data-fusion problem](https://www.pnas.org/doi/10.1073/pnas.1510507113): data fusion, transportability, and identifiability.

### Trial Generalizability And Target Validity

- Cole and Stuart (2010), [Generalizing evidence from randomized clinical trials to target populations](https://academic.oup.com/aje/article/172/1/107/96650): inverse probability of sampling weights for trial-to-target generalization.
- Stuart et al. (2011), [Use of propensity scores to assess the generalizability of results from randomized trials](https://academic.oup.com/jrsssa/article/174/2/369/7072177): propensity-style diagnostics for trial representativeness.
- Dahabreh et al. (2019), [Generalizing causal inferences from individuals in randomized trials to all trial-eligible individuals](https://academic.oup.com/aje/article/188/5/941/5303532): weighting and outcome modeling for trial generalization.
- Westreich, Edwards, Lesko, Stuart, and Cole (2017), [Transportability of trial results using inverse odds of sampling weights](https://academic.oup.com/aje/article/186/8/1010/3852285): distinction between generalizability and transportability.
- Lesko et al. (2017), [Generalizing study results: a potential outcomes perspective](https://journals.lww.com/epidem/fulltext/2017/07000/generalizing_study_results__a_potential_outcomes.17.aspx): target validity and effect-modifier thinking.

### Practical Guidance

- Dahabreh and Hernan (2019), [Extending inferences from a randomized trial to a target population](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6748259/): practical estimators and assumptions.
- Degtiar and Rose (2023), [A review of generalizability and transportability](https://arxiv.org/abs/2102.11904): modern review and estimator taxonomy.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`generalize`](https://cran.r-project.org/package=generalize) | R | Trial generalization/transport estimators | Purpose-built for target-population causal effects | Check estimator assumptions and package status for the project environment |
| [`WeightIt`](https://ngreifer.github.io/WeightIt/) | R | Inverse odds of sampling weights, balancing source to target | Mature weighting interface | Requires careful selection model and overlap diagnostics |
| [`cobalt`](https://ngreifer.github.io/cobalt/) | R | Source-target balance and overlap diagnostics | Strong reporting support | Diagnostics only |
| [`survey`](https://cran.r-project.org/package=survey) | R | Weighted target-effect estimation and uncertainty | Mature survey-weighted inference | Weight construction remains external |
| [`SuperLearner`](https://cran.r-project.org/package=SuperLearner) | R | Flexible outcome/selection nuisance models for DR transport | Good for ensemble nuisance modeling | Needs cross-fitting and careful reporting |
| [`DoWhy`](https://www.pywhy.org/dowhy/) | Python | Graph/assumption documentation and refutation support | Helpful for explicit causal assumptions | Not a complete transport estimator suite |
| Custom sklearn/statsmodels weighting | Python | Inverse-odds weighting or standardization templates | Flexible when Python-only | More responsibility for diagnostics and uncertainty |
| Meta-analysis / hierarchical models | R/Python | Multi-site source evidence and site heterogeneity | Useful when several comparable sources exist | Needs enough sites and comparable estimands |

## Practical Selection Rules

- Need trial-to-target effect with target covariates: use inverse odds of sampling weights or standardization.
- Need robust workflow with both source and target individual data: consider doubly robust transport with flexible nuisance models.
- Need only target aggregate margins: standardize only over available modifiers and clearly report residual external-validity limits.
- Poor source-target overlap: narrow the target population or report descriptive external-validity assessment.
- Treatment or outcome versions differ: ask `domain_expert` and usually avoid numeric transport until versions are reconciled.
- Source effect not internally valid: return to the source design route; transport cannot fix internal bias.

## Tiny Code Skeletons

Docs checked: 2026-05-31
Primary docs: [WeightIt `weightit`](https://ngreifer.github.io/WeightIt/reference/weightit.html), [cobalt `bal.tab`](https://ngreifer.github.io/cobalt/reference/bal.tab.html), [survey CRAN manual](https://cran.r-project.org/web/packages/survey/survey.pdf), [marginaleffects `comparisons`](https://marginaleffects.com/man/r/comparisons.html)

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after causal validity is ready or qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. Save estimate/table, diagnostic/plot, and source code paths for `artifact_index`.

```r
# Tiny sketch, not a complete script.
# Stack source and target records; selection is 1 for source, 0 for target.
library(WeightIt)
library(cobalt)

sw <- weightit(selection ~ X1 + X2 + X3, data = stacked_data,
               estimand = "ATE", method = "ps")
overlap <- bal.tab(sw)
# Apply source-to-target weights to an internally valid source effect workflow.
```

Artifact outputs to preserve: transported-effect table path, source-target overlap/balance plot path, source code path.
