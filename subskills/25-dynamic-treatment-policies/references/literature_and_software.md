# Literature And Software Map

Use this file to choose credible dynamic treatment policy estimands, methods, and packages. Keep decision structure, support, and longitudinal identification ahead of software.

## Core Literature

### Foundations And Dynamic Regimes

- Robins (1986, 1997), structural nested models and g-estimation foundations for time-varying treatments.
- Murphy (2003), [Optimal dynamic treatment regimes](https://rss.onlinelibrary.wiley.com/doi/10.1111/1467-9868.00389): formal optimal DTR setup.
- Robins, Hernan, and Brumback (2000), [Marginal structural models and causal inference in epidemiology](https://journals.lww.com/epidem/fulltext/2000/09000/marginal_structural_models_and_causal_inference_in.11.aspx): IPW/MSM foundation for time-varying treatment.
- Hernan and Robins, [Causal Inference: What If](https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/): practical g-methods and dynamic strategy reference.

### Learning Dynamic Regimes

- Murphy (2005), [A generalization error for Q-learning](https://www.jmlr.org/papers/v6/murphy05a.html): Q-learning foundations for DTRs.
- Chakraborty and Moodie (2013), [Statistical Methods for Dynamic Treatment Regimes](https://link.springer.com/book/10.1007/978-1-4614-7428-9): book-length DTR reference.
- Laber et al. (2014), [Dynamic treatment regimes: technical challenges and applications](https://projecteuclid.org/journals/electronic-journal-of-statistics/volume-8/issue-1/Dynamic-treatment-regimes--Technical-challenges-and-applications/10.1214/14-EJS920.full): review of challenges and applications.
- Zhao et al. (2015), outcome weighted and residual weighted learning ideas for individualized and dynamic regimes.

### Longitudinal Policy And Modified Treatment Policies

- van der Laan and Gruber (2012), targeted maximum likelihood for longitudinal data and dynamic regimes.
- McGrath et al. (2020), [gfoRmula: An R Package for Estimating the Effects of Sustained Treatment Strategies](https://cran.r-project.org/package=gfoRmula): parametric g-formula software paper.
- Williams and Diaz, [`lmtp`](https://github.com/nt-williams/lmtp): longitudinal modified treatment policies with TMLE/sequential regression.

## Package Matrix

| Package | Language | Best Use | Pros | Caveats |
|---|---|---|---|---|
| [`DynTxRegime`](https://cran.r-project.org/package=DynTxRegime) | R | Q-learning, weighted learning, value-search, single/multi-stage regimes | Classic DTR toolkit | Specialized API; model choices and support matter |
| [`DTRreg`](https://cran.r-project.org/package=DTRreg) | R | Dynamic treatment regime regression and Q-learning style workflows | Practical DTR regression interface | Less general for complex longitudinal histories |
| [`qLearn`](https://cran.r-project.org/package=qLearn) | R | Q-learning for dynamic regimes | Focused on Q-learning | Check package maintenance and assumptions |
| [`polle`](https://www.rdocumentation.org/packages/polle/versions/1.6.2) | R | Policy learning/evaluation for finite-stage policies | Unifies OWL, RWL, DR Q-learning, policy-tree learning | Advanced setup; target must match finite-stage structure |
| [`gfoRmula`](https://cran.r-project.org/package=gfoRmula) | R | Parametric g-formula for sustained or dynamic strategies | Strong for user-specified regime comparison | Model-heavy and long-format demanding |
| [`ltmle`](https://cran.r-project.org/package=ltmle) | R | Longitudinal TMLE for static/dynamic interventions | Targeted-learning inference for longitudinal settings | Setup can be demanding |
| [`lmtp`](https://github.com/nt-williams/lmtp) | R | Longitudinal modified treatment policies and feasible shifts | Good for realistic dynamic dose/action modifications | Target differs from fixed regimes |
| [`simcausal`](https://cran.r-project.org/package=simcausal) | R | Simulating longitudinal data and dynamic interventions | Useful for design learning and examples | Simulation support, not an estimator by itself |
| Custom fitted-Q / OPE | Python | Prototype logged-policy evaluation or decision support | Flexible with sklearn/RL tooling | Must not replace causal identification or support diagnostics |

## Practical Selection Rules

- Need to compare prespecified regimes: use g-formula, IPW/MSM, `gfoRmula`, `ltmle`, or `lmtp`.
- Need to learn an interpretable regime: consider `DynTxRegime`, `DTRreg`, Q-learning/A-learning, or policy-tree style workflows.
- Need SMART analysis: prefer DTR-specific R packages and respect sequential randomization.
- Need feasible time-varying modifications: consider LMTP rather than impossible "set everyone always to..." regimes.
- Need observational dynamic policy: activate `09-longitudinal-gmethods` first; sequential exchangeability and positivity dominate.
- Need Python-only prototype: use custom fitted-Q/off-policy evaluation scaffolds only as exploratory or implementation support.
