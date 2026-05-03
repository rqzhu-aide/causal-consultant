# Method Selection Matrix

Use this matrix after the user need, data structure, and candidate design routes are provisionally clear. Do not use it as a keyword-to-package lookup table. The matrix suggests candidate routes; the activated subskill determines the estimand, assumption audit, diagnostics, and whether the route is supported.

## Core Matrix

| Data/design | Target | Candidate approaches | Subskill | Typical implementation resources |
|---|---|---|---|---|
| No data yet; future study or data collection | future causal effect or design feasibility | target-trial planning, experiment/quasi-experiment comparison, measurement plan | 03 + 04 + candidate method subskills | design blueprint; optional simulation or power tools |
| Randomized individual-level trial | ITT, ATE | difference in means, regression adjustment, randomization inference | 05 | R `estimatr`, `randomizr`; Python `statsmodels` |
| Cluster randomized trial | cluster-level ATE | mixed models, GEE, cluster-robust SEs, randomization inference | 05 | R `lme4`, `geepack`, `clubSandwich`; Python `statsmodels` |
| Noncompliant randomized trial | ITT, per-protocol, CACE/LATE | ITT, IV, adherence-adjusted analyses | 05 + 13 | R `ivreg`; Python `linearmodels` |
| Observational binary treatment | ATE/ATT/ATO | regression, matching, weighting, g-computation, AIPW, TMLE | 06 + 07 + 08 | R `MatchIt`, `WeightIt`, `cobalt`, `tmle`; Python `DoWhy`, `DoubleML` |
| High-dimensional covariates | ATE/ATT/CATE | DML, TMLE, SuperLearner, causal forests | 08 + 09 | R `DoubleML`, `tmle3`, `grf`; Python `DoubleML`, `EconML` |
| Multivalued/continuous treatment | dose-response | generalized propensity score, g-computation, TMLE/DML variants | 06 + 07 + 08 | R `WeightIt`, `CBPS`; Python `EconML`, `DoWhy` |
| Heterogeneity/personalization | CATE, GATE, policy value | causal forests, meta-learners, DR-learners, policy learning | 09 | R `grf`, `policytree`; Python `EconML`, `CausalML` |
| Time-varying treatment/confounding | regime mean/value | MSM/IPW, g-formula, longitudinal TMLE, LMTP | 10 | R `ipw`, `gfoRmula`, `ltmle`, `lmtp` |
| Panel/policy, multiple units | ATT, event-study effects | modern DiD, group-time ATT, event studies | 11 | R `did`, `fixest`, `DRDID`, `did2s` |
| Cutoff assignment | local treatment effect | sharp/fuzzy RD, local polynomial, bandwidth sensitivity | 12 | R/Python `rdrobust`, R `rddensity` |
| Valid instrument | LATE/CACE | 2SLS, LIML, IV-DML | 13 | R `ivreg`, `fixest`, `DoubleML`; Python `linearmodels`, `DoubleML` |
| One/few treated aggregate units | ATT over post-period | synthetic control, augmented synthetic control, BSTS/CausalImpact | 14 | R `Synth`, `tidysynth`, `gsynth`, `CausalImpact` |
| Time-to-event | survival/risk/RMST contrast | adjusted survival, IPCW, AIPW/TMLE survival, RMST | 15 | R `survival`, `adjustedCurves`, `riskRegression`, `survtmle` |
| Mediation | direct/indirect effects | mediation models, g-computation, interventional effects | 16 | R `mediation`, `medflex`, `CMAverse`, `regmedint` |
| Interference/spillovers | direct/indirect/spillover effects | exposure mapping, cluster/network estimators, TMLE/IPW | 17 | R `inferference`, `tmlenet` |
| Causal graph learning | DAG/CPDAG/PAG | PC, FCI, GES/GIES, LiNGAM, ANM | 18 | R `pcalg`; Python `causal-learn`, `lingam` |
| Genomics/omics | MR effect, colocalized effect, mediated effect | MR, colocalization, fine mapping, pleiotropy checks | 19 | R `TwoSampleMR`, `MendelianRandomization`, `coloc`, `MR-PRESSO` |
| Causal data preprocessing | analysis-ready dataset and route constraints | data profiling, structure checks, variable-role map, leakage audit, modeling-difficulty triage | 02 + primary route | route-specific diagnostics and sensitivity tools |
| Report, interpretation, or reproducibility | causal claim and communication | assumption ledger, diagnostic summary, limitations, report skeleton | 20 + primary route | Quarto/R Markdown/Jupyter; package version records |

## Primary Method Selection Heuristics

### Start with route feasibility, not estimator sophistication

For each candidate route, ask:

1. What data structure does the route require?
2. Which assumptions are satisfied by design, checkable from data, or untestable?
3. Which missing condition would invalidate the route?
4. What fallback route is available if the condition fails?

Choose the best-supported design first. Use more complex estimators only when they address a real feature of the data or estimand.

### Prefer simple, design-transparent methods when possible

If treatment is randomized and compliance is high, a simple design-based estimator with appropriate standard errors is often preferable to complex ML.

### Prefer design-stage diagnostics for observational point treatment

For confounding adjustment, matching/weighting plus explicit balance and overlap diagnostics can be more transparent than a black-box regression alone.

### Prefer doubly robust/orthogonal methods when nuisance functions are complex

Use AIPW, TMLE, or DML when high-dimensional covariates or flexible ML models are needed, but remember that they require the same causal identification assumptions.

### Prefer modern DiD for staggered adoption

Avoid naive two-way fixed effects as the default when treatment effects may vary across cohorts or over time.

### Prefer target-trial thinking for longitudinal healthcare data

Define eligibility, treatment strategies, assignment, follow-up, outcome, causal contrast, and analysis plan before fitting models.

### Prefer survival estimands that match the scientific question

Use survival probability, cumulative incidence, risk difference, or RMST when the user wants risks or event-free time. Do not default to hazard ratios unless hazards are the scientific target.

### Allow defensible preprocessing before implementation selection

If existing packages require a clearer treatment, covariate, exposure, or unit structure, propose preprocessing only when it is defined before outcome analysis and has a scientific interpretation. Examples include baseline summary windows, event-row aggregation, lagged histories, exposure intensity definitions, network exposure mappings, and audited text-derived variables. Document these choices as part of the design.

## Route Proposal Checklist

Before recommending a route or method, answer:

1. What estimand does the method target?
2. What assumptions identify that estimand?
3. What data structure does the method require?
4. What diagnostics are required?
5. Which route conditions are known satisfied, checkable, plausible but untestable, unresolved, or likely violated?
6. What will happen if overlap, pretrends, bandwidth, IV strength, measurement quality, censoring, or other route-specific checks fail?
7. What fallback routes, weaker estimands, descriptive analyses, or data-collection steps are available?
8. If code is requested, what implementation resources can be used reproducibly without changing the causal question?
9. What data reshaping or feature construction is required before using those resources?
