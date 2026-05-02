# Literature and Software: Causal Mediation

## Purpose

This map supports subskill 12. Use it when selecting methods for direct effects, indirect effects, mechanisms, pathways, multiple mediators, high-dimensional mediators, natural/interventional/path-specific effects, and mediation questions in genomics, economics, psychometrics, epidemiology, clinical research, education, and social science.

The field is large. This map emphasizes references that change applied decisions: estimand choice, identification assumptions, sensitivity analysis, multiple mediator structure, software fit, and domain-specific failure modes.

## Anchor Literature

### Foundations and estimand definitions

- Robins and Greenland (1992), "Identifiability and exchangeability for direct and indirect effects," is the classic counterfactual direct/indirect effects paper and the starting point for modern identification concerns. Source: https://pubmed.ncbi.nlm.nih.gov/1576220/
- Pearl (2001), "Direct and indirect effects," formalizes direct and indirect effects in graphical/counterfactual language and connects mediation to identification. Source: https://ftp.cs.ucla.edu/pub/stat_ser/r273-uai.pdf
- Imai, Keele, and Yamamoto (2010), "Identification, Inference and Sensitivity Analysis for Causal Mediation Effects," develops the sequential ignorability framework, ACME/ADE definitions, and sensitivity analysis. Source: https://imai.fas.harvard.edu/research/mediation.html
- Imai, Keele, and Tingley (2010), "A General Approach to Causal Mediation Analysis," is the widely used applied framework across psychology and social science, emphasizing definitions, identification, estimation, and sensitivity beyond linear SEM. Source: https://dash.harvard.edu/entities/publication/b1683a2b-3e1c-444e-99c0-75f7e7022d6e
- VanderWeele (2015), *Explanation in Causal Inference*, is the main book-length reference for mediation, interaction, direct/indirect effects, sensitivity, and applied interpretation. Source: https://global.oup.com/academic/product/explanation-in-causal-inference-9780199325870

### Regression formulas, interactions, and applied workflows

- VanderWeele and Vansteelandt (2009, 2010) extend direct/indirect effect regression formulas beyond simple linear settings and clarify interactions and odds-ratio/risk-ratio scales. Use these through later applied summaries and software.
- Valeri and VanderWeele (2013), "Mediation analysis allowing for exposure-mediator interactions and causal interpretation," provides practical regression-based formulas and SAS/SPSS macros that influenced `regmedint` and `PROC CAUSALMED`. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3659198/
- VanderWeele (2014), "A unification of mediation and interaction: a four-way decomposition," decomposes effects into pure direct, reference interaction, mediated interaction, and pure indirect components. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC4220271/
- Tingley, Yamamoto, Hirose, Keele, and Imai (2014), "mediation: R Package for Causal Mediation Analysis," documents the canonical R package and its model-based/design-based workflows. Source: https://www.jstatsoft.org/article/view/v059i05

### Natural effect models, semiparametric theory, and robust estimation

- Lange, Vansteelandt, and Bekaert (2012) and Vansteelandt, Bekaert, and Lange (2012) introduce natural effect models that directly parameterize path-specific effects. Software entry point: `medflex`. Source: https://www.jstatsoft.org/v76/i11/
- Steen, Loeys, Moerkerke, and Vansteelandt (2017), "medflex: An R Package for Flexible Mediation Analysis using Natural Effect Models," is the main software paper for natural effect models. Source: https://www.jstatsoft.org/v76/i11/
- Tchetgen Tchetgen and Shpitser (2012), "Semiparametric Theory for Causal Mediation Analysis," provides efficiency, multiple robustness, and sensitivity-analysis foundations for more advanced estimators. Source: https://projecteuclid.org/journals/annals-of-statistics/volume-40/issue-3/Semiparametric-theory-for-causal-mediation-analysis--Efficiency-bounds-multiple-robustness/10.1214/12-AOS990.full
- Zheng and van der Laan (2012) and targeted-learning work motivate TMLE-style mediation estimators when flexible nuisance modeling is needed.

### Exposure-induced confounding and interventional effects

- Avin, Shpitser, and Pearl (2005), "Identifiability of path-specific effects," introduces graph-based limits such as recanting-witness problems. Source: https://ftp.cs.ucla.edu/pub/stat_ser/r321.pdf
- VanderWeele, Vansteelandt, and Robins (2014), "Effect decomposition in the presence of an exposure-induced mediator-outcome confounder," explains why standard natural effects can fail and what alternatives are possible. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC4214081/
- Vansteelandt and Daniel (2017), "Interventional Effects for Mediation Analysis with Multiple Mediators," provides a practically important alternative to natural effects for multiple mediators and weaker assumptions. Source: https://pubmed.ncbi.nlm.nih.gov/27922534/
- VanderWeele and Tchetgen Tchetgen's work on interventional effects is useful when natural-effect assumptions are scientifically implausible.

### Multiple mediators and pathway decompositions

- VanderWeele and Vansteelandt (2014), "Mediation Analysis with Multiple Mediators," reviews joint and specific effects with multiple mediators and key identification complications. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC4287269/
- Daniel, De Stavola, Cousens, and Vansteelandt (2015), "Causal mediation analysis with multiple mediators," is a core Biometrics paper on multiple mediator settings and causal ordering. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC4402024/
- Steen, Loeys, Moerkerke, and Vansteelandt (2017), "Flexible Mediation Analysis With Multiple Mediators," supports flexible multiple-mediator analysis in natural effect model frameworks. Source: https://pubmed.ncbi.nlm.nih.gov/28472328/

### Survival and time-to-event mediation

- Lange and Hansen (2011), "Direct and indirect effects in a survival context," is an early survival mediation reference. Source: https://pubmed.ncbi.nlm.nih.gov/21552129/
- VanderWeele (2011), "Causal mediation analysis with survival data," gives survival-outcome cautions and context. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3109321/
- Tchetgen Tchetgen (2011), "On Causal Mediation Analysis with a Survival Outcome," provides semiparametric models for natural effects with failure-time outcomes. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3204669/
- Huang and Yang (2017), "Causal mediation analysis of survival outcome with multiple mediators," extends multi-mediator survival methods. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC5408128/
- Didelez (2019), "Defining causal mediation with a longitudinal mediator and a survival outcome," is useful when mediator processes evolve over time. Source: https://link.springer.com/article/10.1007/s10985-018-9449-0

### Economics, policy, and quasi-experimental mechanism analysis

- Imai, Tingley, and Yamamoto's design-based mediation work is important for randomized and encouragement designs in social science. Source: https://imai.fas.harvard.edu/projects/mechanisms.html
- Celli (2022), "Causal Mediation Analysis in Economics: Objectives, Assumptions, Models," reviews economics-oriented mediation, including quasi-experimental settings. Source: https://ideas.repec.org/a/bla/jecsur/v36y2022i1p214-234.html
- In economics and policy, total effects may be identified by IV, DiD, RD, or synthetic control, but channel/mediator effects need extra assumptions. Treat mechanism decompositions as more fragile than the headline total effect.

### Psychometrics, education, and latent mechanisms

- Baron and Kenny (1986) is historically important but should not be treated as sufficient for causal mediation. Use it mainly to understand legacy terminology.
- MacKinnon, Fairchild, and Fritz (2007) and related psychometric mediation work are useful for indirect effect inference and power, but causal assumptions still need explicit statement.
- Modern psychometric mediation should combine measurement models with causal timing and confounding control. Measurement invariance and scale reliability are design diagnostics, not afterthoughts.

### Genomics, omics, and high-dimensional mediation

- Omics mediation often involves many correlated candidate mediators, measurement error, batch effects, ancestry/population structure, cell composition, and reverse causality.
- High-dimensional mediation methods such as HIMA and related sparse screening tools are useful for discovery, but selected mediators should not be called confirmed mechanisms without validation.
- Multi-omics mediation with genetic instruments should coordinate with Mendelian randomization and colocalization. Genetic association with expression/protein/metabolite plus disease is not enough if pleiotropy or linkage disequilibrium explains the pattern.
- Use interventional or joint mediator-block estimands when mediator ordering is unknown or many mediators share unmeasured common causes.

## Method Selection Notes

### Controlled direct effects

Use when the user can describe a meaningful intervention on the mediator. This is often the most concrete estimand for policy, clinical, and behavioral questions. It does not decompose the total effect into a natural indirect effect, but it avoids some cross-world assumptions.

### Natural direct and indirect effects

Use when the user wants classical decomposition and assumptions are plausible. Natural effects are familiar and supported by common packages, but they become fragile with exposure-induced confounders, multiple mediators, mediator measurement error, and nonlinear scales.

### Interventional effects

Use when a distribution-level mediator shift is a better scientific target or when natural-effect assumptions are too strong. This is often appropriate for multiple mediators, omics, environmental mixtures, or policy-channel questions.

### Path-specific effects

Use only after graph-based identification. Watch for recanting witnesses and variables that lie on both included and excluded pathways.

### Proportion mediated

Report cautiously. It is scale-dependent and unstable when the total effect is small or direct and indirect effects point in different directions.

### High-dimensional mediation

Treat as a discovery workflow unless a strong design, replication set, and biological/domain validation are present. Use multiplicity control, stability checks, sensitivity to preprocessing, and external validation.

## Software Map

### R

- `mediation`: ACME/ADE, model-based and design-based causal mediation, sensitivity analysis for common settings. Documentation/software: https://imai.fas.harvard.edu/software/mediation.html
- `CMAverse`: broad causal mediation workflows including regression, weighting, inverse odds ratio weighting, marginal structural models, multiple mediators, and sensitivity options. Documentation: https://bs1125.github.io/CMAverse/
- `regmedint`: regression-based causal mediation with interactions and several outcome families, including logistic, Poisson, Cox, and AFT. Documentation: https://search.r-project.org/CRAN/refmans/regmedint/html/regmedint.html
- `medflex`: natural effect models using imputation or weighting. Documentation/software paper: https://www.jstatsoft.org/v76/i11/
- `mma`: multiple mediation analysis with model-selection-oriented workflows. Check estimand and causal assumptions carefully.
- `HIMA`, `HDMT`, `DACT`, and related high-dimensional mediation packages: useful for omics screening, with replication and multiplicity safeguards.
- `lavaan`, `OpenMx`, `semTools`, and Mplus-adjacent workflows: latent variable and SEM mediation. Use with explicit causal assumptions and measurement checks.
- `tmle`, `ltmle`, `lmtp`, `SuperLearner`, and custom code: useful for flexible nuisance models, longitudinal mediator processes, and g-methods.

### Python

- `statsmodels.stats.mediation.Mediation`: parametric mediation workflows. Useful for simple models and teaching, but not enough for complex causal mediation by itself. Documentation: https://www.statsmodels.org/stable/generated/statsmodels.stats.mediation.Mediation.html
- `dowhy`: graph-based causal modeling, identification, refutation, and some mediation/front-door workflows. Documentation: https://www.pywhy.org/dowhy/
- `semopy`: SEM and latent-variable modeling in Python. Use for measurement modeling, not as a substitute for causal identification.
- `pandas`, `numpy`, `scikit-learn`, `statsmodels`: custom g-computation, bootstrapping, diagnostics, and high-dimensional screening.

### Stata, SAS, Mplus, and other environments

- Stata: `mediate`, `paramed`, `medeff`, `gsem`, `sem`, and user-written commands can support mediation depending on version and model family.
- SAS: `PROC CAUSALMED` and Valeri/VanderWeele-style macros are common in epidemiology and clinical research.
- Mplus: common for latent mediation, longitudinal mediation, and multilevel mediation. Ensure causal assumptions, temporal order, and confounding are documented.

## Diagnostics by Method

### Single-mediator regression/g-computation

- temporal DAG;
- treatment, mediator, and outcome timing;
- mediator and outcome model fit;
- treatment-mediator interaction;
- covariate overlap;
- bootstrap or robust inference;
- sensitivity to unmeasured mediator-outcome confounding.

### Natural effect models

- all single-mediator diagnostics;
- cross-world assumption statement;
- no exposure-induced mediator-outcome confounder or alternative method;
- imputation/weighting diagnostics depending on implementation;
- clear scale and decomposition language.

### Interventional effects and multiple mediators

- mediator block definition;
- mediator ordering or explicit unordered interpretation;
- joint mediator support;
- sensitivity to mediator grouping;
- robustness to mediator correlation and common causes;
- multiple testing if mediator-specific effects are reported.

### High-dimensional mediators

- preprocessing and normalization audit;
- batch effect and technical covariate checks;
- multiplicity control;
- stability selection/cross-validation;
- external or held-out replication;
- sensitivity to filtering, transformation, and covariate sets;
- domain validation of selected mediators.

### Latent/psychometric mediation

- reliability and factor structure;
- measurement invariance across treatment/time;
- multilevel structure and clustering;
- temporal separation of waves;
- sensitivity to using latent scores versus observed scales.

### Survival mediation

- time zero and mediator timing;
- survival to mediator measurement;
- censoring and competing events;
- chosen effect scale, such as risk, survival probability, RMST, or hazard;
- coordination with survival-specific diagnostics.

## Red Flags

Do not let the analysis silently become a causal mechanism claim when:

- the mediator is measured before treatment or after the outcome;
- the mediator is a proxy for the outcome or part of the outcome definition;
- the total effect itself is not identified;
- mediator-outcome confounding is unmeasured or implausibly controlled;
- treatment affects a mediator-outcome confounder but natural effects are still reported;
- the method relies only on "coefficient shrinkage";
- cross-sectional survey mediation is interpreted causally;
- the proportion mediated is the headline without direct and indirect effects;
- effects are mixed across odds-ratio, hazard-ratio, risk-difference, or standardized scales without explanation;
- high-dimensional mediator selection lacks replication or multiplicity control;
- latent constructs lack measurement validation or invariance checks;
- selection into mediator measurement is ignored.

## Reporting Language

Strong causal mediation language requires strong design and diagnostics:

- "We estimate the natural indirect effect through M under sequential ignorability and no exposure-induced mediator-outcome confounding."
- "This interventional indirect effect asks how the outcome would change if the mediator distribution were shifted to the distribution observed under treatment."
- "Because mediator-outcome confounding is not well controlled, this is a descriptive pathway analysis, not evidence that M is the mechanism."
- "The total effect may be credible under the quasi-experimental design, but the mediator analysis adds assumptions not guaranteed by that design."

Avoid:

- "M explains X% of the effect" without scale, assumptions, and uncertainty.
- "Adjusting for M proves mediation."
- "Randomized treatment makes mediation causal" unless mediator assumptions are addressed.
- "Omics feature M is the mechanism" from a single high-dimensional screen.
