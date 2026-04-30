# Method Selection Matrix

Use this matrix after the user need, data structure, estimand, and candidate design routes are provisionally clear. Do not use it as a keyword-to-package lookup table.

## Core Matrix

| Data/design | Target | Candidate methods | Subskill | Typical packages |
|---|---|---|---|---|
| Randomized individual-level trial | ITT, ATE | difference in means, regression adjustment, randomization inference | 01 | R `estimatr`, `randomizr`; Python `statsmodels` |
| Cluster randomized trial | cluster-level ATE | mixed models, GEE, cluster-robust SEs, randomization inference | 01 | R `lme4`, `geepack`, `clubSandwich`; Python `statsmodels` |
| Noncompliant randomized trial | ITT, per-protocol, CACE/LATE | ITT, IV, adherence-adjusted analyses | 01 + 09 | R `ivreg`; Python `linearmodels` |
| Observational binary treatment | ATE/ATT/ATO | regression, matching, weighting, g-computation, AIPW, TMLE | 02 + 03 + 04 | R `MatchIt`, `WeightIt`, `cobalt`, `tmle`; Python `DoWhy`, `DoubleML` |
| High-dimensional covariates | ATE/ATT/CATE | DML, TMLE, SuperLearner, causal forests | 04 + 05 | R `DoubleML`, `tmle3`, `grf`; Python `DoubleML`, `EconML` |
| Multivalued/continuous treatment | dose-response | generalized propensity score, g-computation, TMLE/DML variants | 02 + 04 | R `WeightIt`, `CBPS`; Python `EconML`, `DoWhy` |
| Heterogeneity/personalization | CATE, GATE, policy value | causal forests, meta-learners, DR-learners, policy learning | 05 | R `grf`, `policytree`; Python `EconML`, `CausalML` |
| Time-varying treatment/confounding | regime mean/value | MSM/IPW, g-formula, longitudinal TMLE, LMTP | 06 | R `ipw`, `gfoRmula`, `ltmle`, `lmtp` |
| Panel/policy, multiple units | ATT, event-study effects | modern DiD, group-time ATT, event studies | 07 | R `did`, `fixest`, `DRDID`, `did2s` |
| Cutoff assignment | local treatment effect | sharp/fuzzy RD, local polynomial, bandwidth sensitivity | 08 | R/Python `rdrobust`, R `rddensity` |
| Valid instrument | LATE/CACE | 2SLS, LIML, IV-DML | 09 | R `ivreg`, `fixest`, `DoubleML`; Python `linearmodels`, `DoubleML` |
| One/few treated aggregate units | ATT over post-period | synthetic control, augmented synthetic control, BSTS/CausalImpact | 10 | R `Synth`, `tidysynth`, `gsynth`, `CausalImpact` |
| Time-to-event | survival/risk/RMST contrast | adjusted survival, IPCW, AIPW/TMLE survival, RMST | 11 | R `survival`, `adjustedCurves`, `riskRegression`, `survtmle` |
| Mediation | direct/indirect effects | mediation models, g-computation, interventional effects | 12 | R `mediation`, `medflex`, `CMAverse`, `regmedint` |
| Interference/spillovers | direct/indirect/spillover effects | exposure mapping, cluster/network estimators, TMLE/IPW | 13 | R `inferference`, `tmlenet` |
| Causal graph learning | DAG/CPDAG/PAG | PC, FCI, GES/GIES, LiNGAM, ANM | 14 | R `pcalg`; Python `causal-learn`, `lingam` |
| Genomics/omics | MR effect, colocalized effect, mediated effect | MR, colocalization, fine mapping, pleiotropy checks | 15 | R `TwoSampleMR`, `MendelianRandomization`, `coloc`, `MR-PRESSO` |

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

### Allow defensible preprocessing before package selection

If existing packages require a clearer treatment, covariate, exposure, or unit structure, propose preprocessing only when it is defined before outcome analysis and has a scientific interpretation. Examples include baseline summary windows, event-row aggregation, lagged histories, exposure intensity definitions, network exposure mappings, and audited text-derived variables. Document these choices as part of the design.

## Method Proposal Checklist

Before recommending a method, answer:

1. What estimand does the method target?
2. What assumptions identify that estimand?
3. What data structure does the method require?
4. What diagnostics are required?
5. What will happen if overlap/pretrends/bandwidth/IV strength/etc. fail?
6. What alternative estimands or methods are available?
7. What software can implement it reproducibly?
8. What data reshaping or feature construction is required before using that software?
