# Literature and Software: Survival and Competing Risks

## Purpose

This map supports subskill 11. Use it when selecting methods for causal survival questions, censoring, competing risks, adjusted curves, RMST, survival CATEs, or treatment decisions with time-to-event endpoints.

The field is large. This map focuses on references and tools that help choose safe, interpretable analyses rather than exhaustive survival modeling.

## Anchor Literature

### Target trial and causal survival framing

- Hernan, Sauer, Hernandez-Diaz, Platt, and Shrier (2016), "Specifying a target trial prevents immortal time bias and other self-inflicted injuries in observational analyses," is the key practical time-zero reference. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC5124536/
- Hernan and Robins (2016), "Using Big Data to Emulate a Target Trial When a Randomized Trial Is Not Available," explains target-trial emulation for comparative effectiveness. Source: https://academic.oup.com/aje/article/183/8/758/1739860
- Keogh, Gran, Seaman, Davies, and Vansteelandt (2023), "Causal inference in survival analysis using longitudinal observational data: Sequential trials and marginal structural models," is useful for time-varying treatment and time-to-event outcomes. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC7614580/

### Adjusted survival curves, RMST, and hazard-ratio caution

- Cole and Hernan (2004), "Adjusted survival curves with inverse probability weights," is a core adjusted survival curve reference. Source: https://www.sciencedirect.com/science/article/pii/S0169260703001378
- Royston and Parmar (2013), "Restricted mean survival time: an alternative to the hazard ratio for the design and analysis of randomized trials with a time-to-event outcome," is a practical RMST reference. Source: https://bmcmedresmethodol.biomedcentral.com/articles/10.1186/1471-2288-13-152
- Stensrud and Hernan (2020), "Why Test for Proportional Hazards?" is a concise warning about hazard-ratio interpretation. Source: https://jamanetwork.com/journals/jama/article-abstract/2763185
- Cui, Kosorok, Sverdrup, Wager, and Zhu (2023), "Estimating Heterogeneous Treatment Effects with Right-Censored Data via Causal Survival Forests," supports survival CATEs on RMST or survival-probability scales. Source: https://academic.oup.com/jrsssb/article/85/2/179/7058918

### Competing risks and causal competing-risk estimands

- Fine and Gray (1999), "A Proportional Hazards Model for the Subdistribution of a Competing Risk," is the classic Fine-Gray model reference. Source: https://www.tandfonline.com/doi/abs/10.1080/01621459.1999.10474144
- Austin and Fine (2017), "Practical recommendations for reporting Fine-Gray model analyses for competing risk data," is useful for reporting model-based competing-risk analyses. Source: https://pubmed.ncbi.nlm.nih.gov/28913837/
- Young, Stensrud, Tchetgen Tchetgen, and Hernan (2020), "A causal framework for classical statistical estimands in failure-time settings with competing events," connects classical competing-risk estimands to causal questions. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC7811594/
- Stensrud, Young, Didelez, Robins, and Hernan (2022), "Separable Effects for Causal Inference in the Presence of Competing Events," introduces separable effects for specialized questions where treatment components can be meaningfully decomposed. Source: https://www.tandfonline.com/doi/full/10.1080/01621459.2020.1765783
- Stensrud et al. (2021), "A generalized theory of separable effects in competing event settings," extends separable effects and is advanced material. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC8536652/
- Janvin, Young, Ryalen, and Stensrud (2024), "Causal inference with recurrent and competing events," is useful when recurrent event counts and death/competing events are both central. Source: https://link.springer.com/article/10.1007/s10985-023-09594-8

### Targeted learning and causal software references

- Benkeser, Carone, and Gilbert (2017), bounded TMLE for cumulative incidence, underlies `survtmle`. Package source: https://rdrr.io/cran/survtmle/
- Denz et al. (2023), adjusted curves methods, underlies `adjustedCurves`. Package source: https://rdrr.io/cran/adjustedCurves/
- Vakulenko-Lagun et al. (2023), `causalCmprsk` package paper, supports IPW estimation of ATEs in competing-risk data. Source: https://pubmed.ncbi.nlm.nih.gov/37774426/

## Method Selection Notes

### Survival probability, risk, and RMST

Use these when the user wants an interpretable effect size. RMST is especially helpful when proportional hazards is doubtful or when the decision asks "how much event-free time is gained by tau?"

### Cox and AFT models

Cox models are useful for testing and modeling hazard associations, and AFT models can be useful for time-ratio interpretations. For causal communication, translate model outputs into adjusted survival curves, risk differences, RMST, or predicted absolute risks whenever possible.

### Competing risks

Use cumulative incidence when the user asks for the probability of a specific event in the presence of another event that prevents it. Fine-Gray models target subdistribution hazards and are often useful for CIF prediction/reporting, but the subdistribution hazard ratio is not itself an intuitive causal risk effect. Cause-specific hazards are useful for etiologic or process-oriented questions but do not directly equal absolute event probability.

### Separable effects

Separable effects are important in the causal competing-risk literature but not routine for most applied users. Use them only when the treatment can plausibly be decomposed into components affecting different event pathways, and when the user is asking a mechanism-like question about the competing event pathway.

### Survival CATE and treatment decisions

Use survival CATE methods when the user wants heterogeneity or treatment decisions with censored outcomes. `grf::causal_survival_forest` targets RMST or survival probability contrasts at a user-specified horizon under unconfoundedness and censoring assumptions. Pair it with simpler subgroup RMST/risk estimates and held-out validation.

## Software Map

### R

- `survival`: core survival toolkit for `Surv`, Kaplan-Meier, Cox, AFT, left truncation, multi-state, and Aalen-Johansen workflows. Documentation: https://cran-e.com/package/survival
- `adjustedCurves`: adjusted survival curves and adjusted cause-specific CIFs using direct adjustment, IPW, AIPW, empirical likelihood, and TMLE-style methods. Documentation: https://rdrr.io/cran/adjustedCurves/
- `riskRegression`: absolute-risk prediction, cause-specific Cox/Fine-Gray workflows, Brier/AUC metrics, IPCW, and pseudo-values. Documentation: https://cran-e.com/package/riskRegression
- `cmprsk`: classic cumulative incidence, Gray tests, and Fine-Gray regression. Documentation: https://rdrr.io/cran/cmprsk/
- `tidycmprsk`: tidy interface to `cmprsk` for reporting workflows. Documentation: https://cran-e.com/package/tidycmprsk
- `causalCmprsk`: IPW point-treatment ATEs for survival and competing-risk outcomes, including risk differences, risk ratios, hazard ratios, and restricted-mean-time differences. Documentation: https://rdrr.io/cran/causalCmprsk/
- `survtmle`: TMLE for cumulative incidence in right-censored survival settings with and without competing risks. Documentation: https://benkeser.github.io/survtmle/articles/survtmle_intro.html
- `lmtp`: longitudinal and point-treatment modified treatment policies, including censored survival and competing-risk outcomes. Documentation: https://rdrr.io/cran/lmtp/
- `grf`: causal survival forests for RMST or survival-probability CATEs with right-censored outcomes. Documentation: https://grf-labs.github.io/grf/reference/causal_survival_forest.html
- `flexsurv`, `rstpm2`, `rms`, `survRM2`: flexible parametric, spline, AFT, prediction, and RMST-oriented workflows.
- `timereg`, `mets`, `randomForestSRC`, `ranger`: additive hazards, competing-risk, multi-state, frailty, and machine-learning survival tools.

### Python

- `lifelines`: Kaplan-Meier, Cox, AFT, parametric models, and basic diagnostics. Documentation: https://pypi.org/project/lifelines/
- `scikit-survival`: survival ML, Cox models, random survival forests, performance metrics, and cumulative incidence for competing risks. Documentation: https://scikit-survival.readthedocs.io/en/latest/user_guide/competing-risks.html
- `pycox`: neural survival prediction with PyTorch. Treat as prediction unless a causal design and estimand are handled separately. Documentation: https://pypi.org/project/pycox/
- `iptw-survival`: newer Python IPTW/overlap-weighted survival summaries. Check maturity before using in production. Documentation: https://pypi.org/project/iptw-survival/

### Stata and Other Environments

- Stata has mature `stset`, `stcox`, `streg`, `stcrreg`, `stcurve`, and RMST-related commands.
- SAS has `PROC PHREG`, `PROC LIFETEST`, and macros for RMST and competing-risk workflows.

## Diagnostics by Method

### Adjusted survival or RMST

- time-zero alignment;
- event/censoring table;
- number at risk;
- covariate balance or overlap;
- censoring by treatment and covariates;
- adjusted survival curves with uncertainty;
- RMST horizon sensitivity.

### Cox, AFT, and parametric models

- proportional hazards for Cox and Fine-Gray models;
- functional form and nonlinearity;
- influential observations;
- time-varying effects;
- AFT distributional fit;
- absolute-risk predictions or standardized curves.

### Competing risks

- event-code audit;
- cumulative incidence for each event type;
- cause-specific versus subdistribution target;
- competing-event treatment effects;
- sensitivity to composite endpoints or alternative event definitions.

### Survival CATE and policy

- parent identification assumptions;
- censoring and treatment overlap;
- horizon choice;
- CATE calibration or subgroup validation;
- RATE/TOC or held-out policy value when ranking treatment benefit;
- comparison with subgroup RMST/risk estimates.

## Red Flags

Do not let the analysis silently become a causal claim when:

- time zero is after treatment, diagnosis, eligibility, or survival conditioning;
- "treated" status requires surviving long enough to receive treatment;
- censoring depends on treatment and prognosis but is ignored;
- competing events are censored without explanation;
- hazard ratios are interpreted as risk reductions;
- fewer and fewer people remain at risk at the reported horizon;
- PH failure is ignored while reporting only a Cox/Fine-Gray hazard ratio;
- a survival prediction model is interpreted as a treatment decision rule;
- death is treated as censoring in one part of the analysis and as an outcome in another;
- the RMST horizon, subgroup, or endpoint is chosen after inspecting results.
