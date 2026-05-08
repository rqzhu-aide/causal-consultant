# Method Selection Matrix

Use this matrix after the user need, data structure, and candidate design routes are provisionally clear. Do not use it as a keyword-to-package lookup table. The matrix suggests candidate routes; `03-design-planner` owns feasibility and design strategy, `04-dag-builder` audits assumptions and analytic handoff, and the activated method subskill determines route-specific estimation and diagnostics.

The main skill owns method activation. Foundation evaluators propose and check route support; method subskills receive a selected or candidate route and audit whether the route can be implemented with the intended estimand, data structure, diagnostics, and package/code path. If the method audit fails, the method subskill reports the failure back to the main skill instead of changing the project route by itself.

## Method Handoff Protocol

Before activating a method subskill for substantive analysis, the main skill should pass a compact route handoff:

- `route_id` and route label;
- intended estimand and claim strength;
- treatment/action, comparator, outcome, target population, unit, time zero, and follow-up;
- data status and scoped readiness;
- key DAG/assumption handoff notes, including forbidden variables and load-bearing assumptions;
- active limitations or user-directed constraints;
- user software preference and known package/environment constraints, if relevant.

The method subskill should then perform a route-fit and package-fit check:

1. Confirm the method targets the planned estimand without changing the causal question.
2. Confirm the data structure fits the method's required unit, timing, treatment, outcome, clustering, censoring, panel, or network form.
3. Confirm required diagnostics and sensitivity checks are possible.
4. Identify candidate packages/code paths and whether they support the needed estimand, data structure, diagnostics, and uncertainty.
5. If implementation is feasible, write a compact analysis entry and place detailed code/diagnostics under `analyses/` or `artifacts/`.
6. If implementation is not feasible, return a failure note to the main skill with the failed condition, owner of the needed fix, and recommended next action.

Use the software index as a candidate package map, not as proof that a package fits the route.

## Role-Based Subskill Map

| Role | Subskills | Main use |
|---|---|---|
| Foundation evaluators | 01, 02, 03, 04 | Define domain, data, design, DAG, route support, and gate evidence. |
| Primary route/design families | 05, 06, 10, 11, 12, 13, 14, 16, 17, 19, 21 | Audit whether a design or identification family can support the route. |
| Estimation and diagnostics support | 07, 08 | Add matching/weighting/balance, AIPW/TMLE/DML, nuisance modeling, or diagnostics to a primary route. |
| Target/outcome/decision modifiers | 09, 15 | Extend a primary route to CATE/HTE/policy learning or survival/competing-risks targets. |
| Discovery and exploration | 18 | Learn or compare graph hypotheses; usually exploratory unless independently supported. |
| Reporting and interpretation | 20 | Convert the state, diagnostics, limitations, and claim strength into user-facing deliverables. |

Method composition examples:

- Observational ATE with rich confounders: `06` plus `07` or `08`.
- Observational survival outcome: `06` plus `15`, optionally `07` or `08`.
- DiD with subgroup questions: `11` plus `09`.
- IV with flexible first stage or high-dimensional controls: `13` plus `08`.
- Proximal causal inference or negative controls: `21` plus close `04` DAG/assumption handoff.
- Exploratory graph learning: `18`, followed by `04` before any claim is strengthened.

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
| Negative controls or proxy variables | bridge-function effect, bias-detection, proximal estimand | negative controls, proximal causal inference, falsification, bridge functions | 21 + 04 | package support varies; often custom code plus sensitivity/falsification checks |
| One/few treated aggregate units | ATT over post-period | synthetic control, augmented synthetic control, BSTS/CausalImpact | 14 | R `Synth`, `tidysynth`, `gsynth`, `CausalImpact` |
| Time-to-event | survival/risk/RMST contrast | adjusted survival, IPCW, AIPW/TMLE survival, RMST | 15 | R `survival`, `adjustedCurves`, `riskRegression`, `survtmle` |
| Mediation | direct/indirect effects | mediation models, g-computation, interventional effects | 16 | R `mediation`, `medflex`, `CMAverse`, `regmedint` |
| Interference/spillovers | direct/indirect/spillover effects | exposure mapping, cluster/network estimators, TMLE/IPW | 17 | R `inferference`, `tmlenet` |
| Causal graph learning | DAG/CPDAG/PAG | PC, FCI, GES/GIES, LiNGAM, ANM | 18 | R `pcalg`; Python `causal-learn`, `lingam` |
| Genomics/omics | MR effect, colocalized effect, mediated effect | MR, colocalization, fine mapping, pleiotropy checks | 19 | R `TwoSampleMR`, `MendelianRandomization`, `coloc`, `MR-PRESSO` |
| Data Technician review/preprocessing | analysis-ready dataset and route constraints | data profiling, structure checks, domain/design/DAG fit checks, method-fit suggestions, leakage audit, readiness triage | 02 + primary route | route-specific diagnostics and sensitivity tools |
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
