# Literature And Software Map

Use this file to choose credible dose-response estimands, methods, and packages. Keep dose support, intervention meaning, and positivity ahead of software.

## Core Literature

### General Treatment Regimes And Generalized Propensity Scores

- Imbens (2000), [The role of the propensity score in estimating dose-response functions](https://academic.oup.com/biomet/article/87/3/706/249897): early generalized propensity score framing for continuous treatments.
- Hirano and Imbens (2004), [The Propensity Score with Continuous Treatments](https://www.nber.org/papers/t0334): generalized propensity score estimation of dose-response functions.
- Imai and van Dyk (2004), [Causal Inference with General Treatment Regimes](https://imai.fas.harvard.edu/research/pscore.html): propensity score generalization to non-binary treatments.

### Flexible And Robust Continuous-Treatment Estimation

- Kennedy, Ma, McHugh, and Small (2017), [Nonparametric methods for doubly robust estimation of continuous treatment effects](https://arxiv.org/abs/1507.07384): doubly robust dose-response estimation.
- Kennedy (2020), [Optimal doubly robust estimation of heterogeneous causal effects](https://arxiv.org/abs/2004.14497): useful for flexible nuisance reasoning around continuous and heterogeneous effects.
- Colangelo and Lee (2020), [Double Debiased Machine Learning Nonparametric Inference with Continuous Treatments](https://arxiv.org/abs/2004.03036): DML-style inference for continuous treatments.

### Stochastic Shifts And Modified Treatment Policies

- Diaz and van der Laan (2012), [Population intervention causal effects based on stochastic interventions](https://biostats.bepress.com/ucbbiostat/paper293/): stochastic intervention estimands.
- Haneuse and Rotnitzky (2013), [Estimation of the effect of interventions that modify the received treatment](https://academic.oup.com/biomet/article/100/1/165/231752): modified treatment policies that map observed treatment to feasible alternatives.
- Diaz and Hejazi (2020), [Causal mediation analysis for stochastic interventions](https://arxiv.org/abs/1907.03530): stochastic intervention ideas that also motivate shift/MTP thinking.
- Rudolph et al. (2022), [The longitudinal modified treatment policy framework](https://cran.r-project.org/package=lmtp): practical LMTP framework and software orientation.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`CausalGPS`](https://cran.r-project.org/package=CausalGPS) | R | Generalized propensity score workflows for continuous exposures | Purpose-built for continuous treatment weighting/matching and diagnostics | GPS models can be fragile; support and balance need careful review |
| [`WeightIt`](https://ngreifer.github.io/WeightIt/) | R | Continuous and multi-category treatment weighting | Mature weighting interface, works with `cobalt` diagnostics | Weight instability and continuous balance diagnostics can be hard |
| [`cobalt`](https://ngreifer.github.io/cobalt/) | R | Balance diagnostics after weighting/matching | Essential reporting support for dose balance | Diagnostics only; not an estimator |
| [`lmtp`](https://github.com/nt-williams/lmtp) | R | Longitudinal modified treatment policies and shift-style interventions | Good for feasible intervention rules and time-varying treatments | Target differs from fixed-dose curves; requires careful data setup |
| [`tmle3shift`](https://github.com/tlverse/tmle3shift) | R | Stochastic shift interventions with targeted learning | Strong targeted-learning workflow for shift effects | tlverse setup is more advanced |
| [`gfoRmula`](https://cran.r-project.org/package=gfoRmula) | R | Parametric g-formula for sustained or time-varying dose strategies | Practical for longitudinal dose interventions | Model-heavy; requires long-format histories |
| [`EconML`](https://www.pywhy.org/EconML/spec/estimation/dml.html) | Python | Continuous-treatment DML, `LinearDML`, `CausalForestDML`, flexible nuisance models | Strong Python ML integration | Often estimates marginal/conditional effects, not full GPS curve diagnostics |
| [`DoubleML`](https://docs.doubleml.org/stable/) | R/Python | Orthogonal nuisance estimation for continuous treatment models | Useful DML infrastructure | Need target-specific setup for dose-response curves |
| Custom splines/GAMs/TMLE | R/Python | Supported dose contrasts or descriptive curves | Transparent and adaptable | Easy to overinterpret extrapolated or model-driven curves |

## Practical Selection Rules

- Need a supported fixed contrast: start with standardization, weighting, or regression over the supported dose range.
- Need a smooth curve: use splines/GAM/flexible outcome models, but report unsupported ranges and functional-form sensitivity.
- Need observational continuous exposure: consider GPS/WeightIt/CausalGPS plus balance diagnostics.
- Need feasible dose shifts: prefer `lmtp` or `tmle3shift` instead of setting everyone to unsupported dose values.
- Need time-varying dose: activate `09-longitudinal-gmethods` and consider `gfoRmula`, `lmtp`, or `ltmle`.
- Need Python-only ML support: EconML/DoubleML can support nuisance and marginal effect estimation, but still require custom dose-target reporting.
