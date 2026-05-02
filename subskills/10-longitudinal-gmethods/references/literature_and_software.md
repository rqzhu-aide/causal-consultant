# Literature and Software Map: Longitudinal G-Methods

## How to Use This Reference

This is a compact map, not an exhaustive bibliography. Use it to choose a safe longitudinal causal route, explain treatment-confounder feedback, and avoid using ordinary regression for problems that require g-methods.

## Core Lessons

- Longitudinal g-methods are needed when later treatment depends on evolving covariates that are also affected by earlier treatment.
- The target is a strategy over time, such as always treat, never treat, treat when a biomarker crosses a threshold, reduce dose by a fixed amount, or follow a grace-period protocol.
- Sequential exchangeability and sequential positivity are the central assumptions; they must be assessed by treatment/covariate history, not just baseline covariates.
- Censoring, competing events, treatment switching, death, and irregular visit processes are often part of the design, not afterthoughts.
- R currently has the strongest practical package ecosystem for end-to-end longitudinal g-methods.

## Foundational Papers and Textbooks

- Robins (1986), "A new approach to causal inference in mortality studies with a sustained exposure period." Key lesson: introduced the g-formula framework for sustained exposure strategies and treatment-confounder feedback. DOI: <https://doi.org/10.1016/0270-0255(86)90088-6>
- Robins, Hernan, and Brumback (2000), "Marginal Structural Models and Causal Inference in Epidemiology." Key lesson: marginal structural models with inverse probability weights handle time-dependent confounding affected by prior treatment. DOI: <https://doi.org/10.1097/00001648-200009000-00011>
- Hernan and Robins, *Causal Inference: What If*. Key lesson: g-formula, IP weighting, target trials, sustained strategies, sequential exchangeability, and positivity. Official PDF: <https://www.hsph.harvard.edu/miguel-hernan/wp-content/uploads/sites/1268/2024/04/hernanrobins_WhatIf_26apr24.pdf>
- Daniel et al. (2013), "Methods for dealing with time-dependent confounding." Key lesson: tutorial comparison of g-computation, IPW for MSMs, and g-estimation of structural nested models. DOI: <https://doi.org/10.1002/sim.5686>
- Murphy (2003), "Optimal Dynamic Treatment Regimes." Key lesson: dynamic regimes are sequential decision rules and can be estimated to maximize mean outcomes. DOI: <https://doi.org/10.1111/1467-9868.00389>
- Tsiatis, Davidian, Holloway, and Laber, *Dynamic Treatment Regimes: Statistical Methods for Precision Medicine*. Key lesson: comprehensive treatment of evaluation and discovery of dynamic treatment regimes. Publisher page: <https://www.routledge.com/Dynamic-Treatment-Regimes-Statistical-Methods-for-Precision-Medicine/Tsiatis-Davidian-Holloway-Laber/p/book/9781498769778>

## Modern Estimators and Software Papers

- van der Wal and Geskus (2011), "`ipw`: An R Package for Inverse Probability Weighting." Key lesson: practical estimation of IP weights for point and time-varying treatments and marginal structural models. DOI: <https://doi.org/10.18637/jss.v043.i13>
- Lendle et al. (2017), "`ltmle`: An R Package Implementing Targeted Minimum Loss-Based Estimation for Longitudinal Data." Key lesson: longitudinal TMLE, IPTW, and g-computation for intervention-specific means and MSMs. DOI: <https://doi.org/10.18637/jss.v081.i01>
- McGrath et al. (2020), "`gfoRmula`: An R Package for Estimating the Effects of Sustained Treatment Strategies via the Parametric g-formula." Key lesson: package implementation of parametric g-formula for sustained strategies, survival outcomes, censoring, and competing event options. DOI: <https://doi.org/10.1016/j.patter.2020.100008>
- Diaz et al. (2023), "Nonparametric Causal Effects Based on Longitudinal Modified Treatment Policies." Key lesson: LMTPs define feasible interventions for continuous or multivalued longitudinal treatments and support sequentially doubly robust estimation. DOI: <https://doi.org/10.1080/01621459.2021.1955691>

## Software Map

### R

- `ipw`: inverse probability weights for point and time-varying treatments. Docs/paper: <https://www.jstatsoft.org/article/view/v043i13>
- `gfoRmula`: parametric g-formula for sustained strategies and survival or end-of-follow-up outcomes. Docs: <https://www.rdocumentation.org/packages/gfoRmula/versions/1.1.1>
- `ltmle`: longitudinal TMLE, IPTW, and g-computation. Docs: <https://www.rdocumentation.org/packages/ltmle/versions/1.3-0/topics/ltmle-package>
- `lmtp`: longitudinal modified treatment policies, TMLE, sequentially doubly robust estimators, binary/continuous/categorical treatments, censored and survival outcomes. Docs: <https://www.rdocumentation.org/packages/lmtp/versions/1.5.3>
- `survival` and `riskRegression`: often needed for endpoint and censoring support.

### Python

- There is no single Python equivalent to the mature R longitudinal g-methods stack. Use custom transparent code only for simple IPW/g-computation workflows, or use R when production-quality longitudinal g-methods are needed.
- `pandas`, `statsmodels`, `scikit-learn`, and `lifelines` may support data construction, nuisance models, and survival components, but the analyst must implement the causal estimator and diagnostics carefully.

## Method Selection Heuristics

- If the user has discrete sustained strategies and good support, start with MSM/IPW or g-formula.
- If the user wants realistic dose shifts or continuous-treatment interventions, consider LMTP.
- If flexible nuisance modeling and double robustness are central, consider longitudinal TMLE or LMTP.
- If the question is per-protocol with treatment switching and grace periods, consider cloning-censoring-weighting.
- If support is poor for a static regime, redefine the strategy or target population rather than forcing extrapolation.
- If the timeline is not well measured, recommend prospective data collection or descriptive trajectory analysis.
