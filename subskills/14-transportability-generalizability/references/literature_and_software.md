# Literature And Software Map

Use this file to choose credible transportability/generalizability estimands, diagnostics, and packages. Package/software details are reference-only; the specialist writes one `method_task_results` item, artifact_index entries only for execution-created artifacts, and one council entry through the shared contract. Keep source validity and target definition ahead of software.

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
| [`generalize`](https://benjamin-ackerman.github.io/generalize/) | R | Trial generalization/transport estimators | Purpose-built for target-population causal effects | Check estimator assumptions and package status for the project environment |
| [`TransportHealth`](https://coreclinicalsciences.github.io/TransportHealth/) | R | Transportability/generalizability analysis across several data scenarios | Includes weighting, g-computation, aggregate-data workflows, and tutorials | Newer ecosystem; verify version, data scenario, and assumptions before use |
| [`WeightIt`](https://ngreifer.github.io/WeightIt/) | R | Inverse odds of sampling weights, balancing source to target | Mature weighting interface | Requires careful selection model and overlap diagnostics |
| [`cobalt`](https://ngreifer.github.io/cobalt/) | R | Source-target balance and overlap diagnostics | Strong reporting support | Diagnostics only |
| [`survey`](https://search.r-project.org/CRAN/refmans/survey/html/00Index.html) | R | Weighted target-effect estimation and uncertainty | Mature survey-weighted inference | Weight construction remains external |
| [`SuperLearner`](https://www.rdocumentation.org/packages/SuperLearner/versions/2.0-9/topics/SuperLearner) | R | Flexible outcome/selection nuisance models for DR transport | Good for ensemble nuisance modeling | Needs cross-fitting and careful reporting |
| [`marginaleffects`](https://www.rdocumentation.org/packages/marginaleffects/versions/0.32.0/topics/comparisons) | R | Standardized contrasts and model-based target summaries | Useful for reportable comparisons after a fitted model | Not a transport design by itself |
| [`DoWhy`](https://www.pywhy.org/dowhy/) | Python | Graph/assumption documentation and refutation support | Helpful for explicit causal assumptions | Not a complete transport estimator suite |
| [`causaleffect`](https://rdrr.io/cran/causaleffect/man/generalize.html) | R | Graphical transport formulas across source and target domains | Useful for selection-diagram reasoning | Requires explicit graph and transport assumptions |
| Custom sklearn/statsmodels weighting | Python | Inverse-odds weighting or standardization templates | Flexible when Python-only | More responsibility for diagnostics and uncertainty |
| Meta-analysis / hierarchical models | R/Python | Multi-site source evidence and site heterogeneity | Useful when several comparable sources exist | Needs enough sites and comparable estimands |

## Practical Selection Rules

- Need trial-to-target effect with target covariates: use inverse odds of sampling weights or standardization.
- Need robust workflow with both source and target individual data: consider doubly robust transport with flexible nuisance models.
- Need only target aggregate margins: standardize only over available modifiers and clearly report residual external-validity limits.
- Poor source-target overlap: narrow the target population or report descriptive external-validity assessment.
- Treatment or outcome versions differ: recommend `domain_expert` review and usually avoid numeric transport until versions are reconciled.
- Source effect not internally valid: return to the source design route; transport cannot fix internal bias.

## Tiny Code Skeletons

Docs checked: 2026-06-09
Primary docs: [generalize](https://benjamin-ackerman.github.io/generalize/), [TransportHealth](https://coreclinicalsciences.github.io/TransportHealth/), [WeightIt manual](https://cran.r-universe.dev/WeightIt/WeightIt.pdf), [cobalt `bal.tab`](https://ngreifer.github.io/cobalt/reference/bal.tab.html), [survey package index](https://search.r-project.org/CRAN/refmans/survey/html/00Index.html), [SuperLearner](https://www.rdocumentation.org/packages/SuperLearner/versions/2.0-9/topics/SuperLearner), [marginaleffects `comparisons`](https://www.rdocumentation.org/packages/marginaleffects/versions/0.32.0/topics/comparisons), [causaleffect `generalize`](https://rdrr.io/cran/causaleffect/man/generalize.html).

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after the relevant gatekeeper status is ready or appropriately qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. When execution is authorized, create only outputs implied by the active step's `execution.scope`, `execution.claim_boundary`, and `execution.expected_outputs` inside `execution.analysis_dir`; write `artifact_index` entries for produced source, note, manifest, result artifacts, and subskill-specific paths.

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

Execution output examples for `result_artifacts` or `subskill_specific`: transported-effect table path, source-target overlap/balance plot path, manifest path, and source code path.
