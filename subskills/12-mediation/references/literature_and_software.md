# Literature And Software Map

Use this file to choose credible mediation estimands, methods, and packages. Package/software details are reference-only; the specialist writes one `method_task_results` item, artifact_index entries only for execution-created artifacts, and one council entry through the shared contract. Keep timing, confounding, and estimand meaning ahead of software.

## Core Literature

### Foundations

- Robins and Greenland (1992), [Identifiability and Exchangeability for Direct and Indirect Effects](https://journals.lww.com/epidem/abstract/1992/03000/identifiability_and_exchangeability_for_direct_and.13.aspx): classic identifiability framing for direct and indirect effects.
- Pearl (2001), [Direct and Indirect Effects](https://arxiv.org/abs/1301.2300): path-specific counterfactual definitions in graphical causal models.
- Imai, Keele, and Tingley (2010), [A General Approach to Causal Mediation Analysis](https://dash.harvard.edu/entities/publication/b1683a2b-3e1c-444e-99c0-75f7e7022d6e): model-agnostic definitions, identification, estimation, and sensitivity analysis.
- VanderWeele (2015), [Explanation in Causal Inference](https://global.oup.com/academic/product/explanation-in-causal-inference-9780199325870): broad reference for mediation, interaction, assumptions, and interpretation.

### Estimand Extensions And Complex Pathways

- Avin, Shpitser, and Pearl (2005), [Identifiability of Path-Specific Effects](https://www.ijcai.org/Proceedings/05/Papers/0886.pdf): identification of pathway-specific effects in DAGs.
- VanderWeele, Vansteelandt, and Robins (2014), interventional direct and indirect effect ideas for settings where natural effects are too strong.
- Vansteelandt and Daniel (2017), [Interventional effects for mediation analysis with multiple mediators](https://biblio.ugent.be/publication/8545462): multiple mediator interventional decomposition.
- Stensrud et al. (2020), [Separable Effects for Causal Inference in the Presence of Competing Events](https://www.tandfonline.com/doi/full/10.1080/01621459.2020.1765783): separable effects when treatment components can be meaningfully decomposed.
- Didelez, Dawid, and Geneletti (2012), [Direct and Indirect Effects of Sequential Treatments](https://arxiv.org/abs/1206.6840): links direct/indirect effects to sequential treatment interventions.

### Software Papers And Applied Guides

- Tingley et al. (2014), [mediation: R Package for Causal Mediation Analysis](https://imai.fas.harvard.edu/research/mediationjss/): R package for model-based and design-based mediation plus sensitivity analysis.
- Steen et al. (2017), [medflex: Flexible Mediation Analysis using Natural Effect Models](https://www.jstatsoft.org/v76/i11/): natural effect model software and expanded-data workflow.
- Valeri and VanderWeele (2013), regression-based closed-form mediation formulas implemented by `regmedint`.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`mediation`](https://search.r-project.org/CRAN/refmans/mediation/html/00Index.html) | R | Standard single mediator natural direct/indirect effects and sensitivity analysis | Widely used, accessible, supports model-based and design-based workflows | Natural effect assumptions are strong; limited for exposure-induced mediator-outcome confounding |
| [`regmedint`](https://search.r-project.org/CRAN/refmans/regmedint/html/regmedint.html) | R | Regression-based closed-form mediation with interactions | Clear interface for common epidemiologic models | Less flexible for complex longitudinal or multiple mediator settings |
| [`medflex`](https://cran.r-universe.dev/medflex/doc/manual.html) | R | Natural effect models and expanded data | Flexible path-specific/natural effect parameterization | Requires careful expanded-data setup |
| [`CMAverse`](https://bs1125.github.io/CMAverse/) | R | Broad causal mediation workflow, DAG plotting, estimation, and sensitivity | Useful hub for multiple approaches and reproducible reports | Many dependencies; estimand choice still requires expert review |
| [`intmed`](https://packages.oit.ncsu.edu/cran/web/packages/intmed/intmed.pdf) | R | Interventional effects for up to several mediators | Aligned with interventional mediation targets | Specialized and less general than custom g-computation |
| [`statsmodels`](https://www.statsmodels.org/stable/generated/statsmodels.stats.mediation.Mediation.html) | Python | Simple model-based mediation templates | Convenient when the workflow must stay in Python | Narrower mediation ecosystem and fewer causal diagnostics |
| [`DoWhy`](https://petergtz.github.io/dowhy/main/user_guide/causal_tasks/estimating_causal_effects/effect_estimation_with_estimators.html) | Python | Graph-based identification/refutation support and explicit assumptions | Good for DAG-centered workflow and assumption tracking | Estimation coverage for mediation is less comprehensive than R mediation packages |
| Custom g-computation/TMLE/DML | R/Python | Complex mediators, longitudinal data, flexible nuisance models | Can match the estimand when packages do not | Requires stronger coding, validation, and reviewer control |

## Practical Selection Rules

- Need simple single-mediator natural effects: start with `mediation`, `regmedint`, or `medflex`, plus sensitivity analysis.
- Need exposure-mediator interaction in common outcome models: `regmedint` is often practical.
- Need multiple mediators or interventional effects: consider `CMAverse`, `intmed`, or custom g-computation.
- Need causal graph discipline and assumption refutation: use DoWhy as support, not as a substitute for estimand review.
- Need survival/competing-risk mediation: recommend `23-survival-competing-risks` review; ordinary product-of-coefficients logic is usually unsafe.
- Need post-exposure confounders affected by treatment: avoid default natural effects unless `method_lead` justifies them; consider interventional/separable/g-method routes.
- Need only descriptive pathway evidence: use regression/SEM/path summaries with descriptive wording and no causal mediation claim.

## Tiny Code Skeletons

Docs checked: 2026-06-09
Primary docs: [mediation CRAN index](https://search.r-project.org/CRAN/refmans/mediation/html/00Index.html), [CMAverse `cmest`](https://bs1125.github.io/CMAverse/reference/cmest), [regmedint docs](https://search.r-project.org/CRAN/refmans/regmedint/html/regmedint.html), [medflex manual](https://cran.r-universe.dev/medflex/doc/manual.html), [statsmodels `Mediation`](https://www.statsmodels.org/stable/generated/statsmodels.stats.mediation.Mediation.html), [DoWhy mediation estimators](https://petergtz.github.io/dowhy/main/user_guide/causal_tasks/estimating_causal_effects/effect_estimation_with_estimators.html).

Reference-only unless main explicitly routes `execution_authorized` after user-confirmed scope. Use only after the relevant gatekeeper status is ready or appropriately qualified. Verify installed package versions and current docs before running. Do not execute this skeleton from `feedback_only` or `bounded_inspection` mode. When execution is authorized, create only outputs implied by the active step's `execution.scope`, `execution.claim_boundary`, and `execution.expected_outputs` inside `execution.analysis_dir`; write `artifact_index` entries for produced source, note, manifest, result artifacts, and subskill-specific paths.

```r
# Tiny sketch, not a complete script.
# Replace model families and covariates after timing and mediator assumptions are checked.
library(mediation)

m_fit <- lm(M ~ A + X1 + X2, data = analysis_data)
y_fit <- lm(Y ~ A + M + X1 + X2, data = analysis_data)
med <- mediate(m_fit, y_fit, treat = "A", mediator = "M", sims = 1000)
```

Execution output examples for `result_artifacts` or `subskill_specific`: direct/indirect effect table path, mediation sensitivity or assumption plot path, manifest path, and source code path.
