# Literature And Software Map

Use this file to choose credible longitudinal g-methods and packages. Keep the main team focused on time ordering, intervention strategies, sequential exchangeability, positivity over histories, censoring, and claim boundary before software.

## Core Literature

### Foundations And Identification

- Robins (1986), [A new approach to causal inference in mortality studies with a sustained exposure period](https://doi.org/10.1016/0270-0255(86)90088-6): foundational g-computation/g-formula logic for sustained exposures.
- Robins (1989), [The analysis of randomized and non-randomized AIDS treatment trials using a new approach to causal inference in longitudinal studies](https://doi.org/10.1002/sim.4780080107): structural nested models and g-estimation logic for longitudinal treatments.
- Robins, Hernan, and Brumback (2000), [Marginal structural models and causal inference in epidemiology](https://doi.org/10.1097/00001648-200009000-00011): MSMs and inverse-probability weighting for time-varying confounding affected by prior treatment.
- Hernan, Brumback, and Robins (2000), [Marginal structural models to estimate the causal effect of zidovudine on the survival of HIV-positive men](https://doi.org/10.1097/00001648-200009000-00012): applied MSM example with treatment/censoring weights.
- Hernan and Robins (2020), [Causal Inference: What If](https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/): readable treatment of sequential exchangeability, IP weights, g-formula, and longitudinal causal questions.

### Parametric G-Formula, Strategy Comparison, And Tutorials

- Taubman et al. (2009), [Intervening on risk factors for coronary heart disease: an application of the parametric g-formula](https://doi.org/10.1093/ije/dyp192): substantive g-formula strategy simulation.
- Daniel et al. (2013), [Methods for dealing with time-dependent confounding](https://doi.org/10.1002/sim.5686): tutorial comparison of g-methods for time-dependent confounding.
- Keil et al. (2014), [The parametric g-formula for time-to-event data](https://doi.org/10.1093/aje/kwt286): practical tutorial for time-to-event g-formula applications.
- Young et al. (2011), [Comparative effectiveness of dynamic treatment regimes: an application of the parametric g-formula](https://doi.org/10.1093/aje/kwq397): dynamic-regime comparison with parametric g-formula.

### Targeted Learning, Modified Treatment Policies, And Modern Support

- van der Laan and Gruber (2012), [Targeted minimum loss based estimation of causal effects of multiple time point interventions](https://doi.org/10.2202/1557-4679.1370): longitudinal TMLE.
- Lendle, Schwab, Petersen, and van der Laan (2017), [ltmle: An R Package Implementing Targeted Minimum Loss-Based Estimation for Longitudinal Data](https://doi.org/10.18637/jss.v081.i01): software-focused longitudinal TMLE paper.
- Diaz and van der Laan (2018), [Stochastic treatment regimes](https://doi.org/10.1111/rssb.12232): stochastic interventions and realistic longitudinal treatment policies.
- Haneuse and Rotnitzky (2013), [Estimation of the effect of interventions that modify the received treatment](https://doi.org/10.1007/s10985-013-9247-1): modified treatment policy framing.
- Rudolph et al. (2024), [Longitudinal modified treatment policies](https://doi.org/10.1093/aje/kwad251): modern LMTP estimands and estimation.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`gfoRmula`](https://cran.r-project.org/package=gfoRmula) | R | Parametric g-formula for survival, binary, continuous, and competing-event style longitudinal outcomes | Mature g-formula workflow, strategy simulation, absolute risks | Heavy model specification; needs careful covariate/outcome process diagnostics |
| [`ipw`](https://cran.r-project.org/package=ipw) | R | IP treatment/censoring weights for MSMs | Classic longitudinal IPW implementation | Weight models and truncation must be checked; package is not a full report workflow |
| [`WeightIt`](https://ngreifer.github.io/WeightIt/) + [`cobalt`](https://ngreifer.github.io/cobalt/) | R | Time-varying or panel-style weight/balance diagnostics when supported by setup | Excellent balance diagnostics and reporting | Complex longitudinal weights may need custom construction |
| [`survey`](https://cran.r-project.org/package=survey) | R | Weighted MSM outcome models and robust SE | Mature weighted-model infrastructure | Does not construct treatment/censoring weights |
| [`ltmle`](https://cran.r-project.org/package=ltmle) | R | Longitudinal TMLE for static/dynamic treatment regimes and censoring | Implements longitudinal targeted learning | Steeper setup; data ordering and node specification are fragile |
| [`lmtp`](https://github.com/nt-williams/lmtp) | R | Longitudinal modified treatment policies with Super Learner support | Good for realistic continuous/binary treatment modifications | Requires a clear modified policy and careful positivity checks |
| [`sl3`](https://tlverse.org/sl3/) / [`SuperLearner`](https://cran.r-project.org/package=SuperLearner) | R | Flexible nuisance learners for TMLE, LMTP, and sequential regression | Ensemble learning and cross-validation | Learners are plugins, not identification solutions |
| [`simcausal`](https://cran.r-project.org/package=simcausal) | R | Simulating longitudinal causal data and intervention scenarios | Useful for design learning, examples, and power-style exploration | Simulation support, not estimator for observed data by itself |
| [`DynTxRegime`](https://cran.r-project.org/package=DynTxRegime) / [`polle`](https://cran.r-project.org/package=polle) | R | Dynamic regime learning/evaluation | Useful when target becomes an adaptive policy | Usually belongs to `25-dynamic-treatment-policies` with 09 as design support |
| [`rbw`](https://cran.r-project.org/package=rbw) | R | Residual balancing weights for MSM-style analyses | Balancing alternative to standard IPW | Specialized; check method assumptions and diagnostics |
| [`zepid`](https://zepid.readthedocs.io/) | Python | Epidemiologic IPW, g-formula-like, and MSM-style workflows | Practical Python causal epi toolkit | Smaller ecosystem than R; complex longitudinal workflows may need custom code |
| [`statsmodels`](https://www.statsmodels.org/stable/index.html) | Python | Pooled logistic, weighted GLM, GEE, and robust models | Familiar and flexible for prototypes | Weight construction, censoring, and longitudinal diagnostics are manual |
| [`lifelines`](https://lifelines.readthedocs.io/) | Python | Weighted survival models and survival curves | Useful survival implementation support | Needs survival subskill for target scale and censoring logic |
| [`scikit-learn`](https://scikit-learn.org/) / [`econml`](https://www.pywhy.org/EconML/) / [`DoubleML`](https://docs.doubleml.org/) | Python | Flexible nuisance learners, cross-fitting, sequential regression prototypes | Useful ML plugins | Longitudinal identification and policy targets require extra structure |

## Practical Selection Rules

- Need a marginal contrast of sustained strategies: start with MSM/IPW if weights are stable and diagnostics are strong.
- Need absolute risk or survival under complex strategies: use parametric g-formula, especially if the scientific output is strategy-specific risk.
- Need realistic modifications rather than impossible static interventions: use LMTP or stochastic-intervention logic.
- Need dynamic policy learning: activate `25-dynamic-treatment-policies`; keep this module responsible for histories and sequential assumptions.
- Need time-to-event or competing-risk reporting: activate `33-survival-competing-risks`.
- Need high-dimensional histories: use Super Learner, `sl3`, DML-style nuisance support, or TMLE/LMTP, but keep support and time-ordering diagnostics central.
- Need a quick Python prototype: use `zepid` or custom `statsmodels` IPW/pooled-logistic code, with strong caveats if package support is thin.
