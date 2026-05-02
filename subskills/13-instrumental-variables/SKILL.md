---
name: instrumental-variables
description: Use when a user proposes or needs an instrumental-variable design, encouragement design, imperfect-compliance randomized experiment, fuzzy regression discontinuity, or LATE/CACE analysis. This subskill audits the instrument, defines the IV estimand, selects IV estimators, generates R/Python code, and reports first-stage, weak-instrument, falsification, overidentification, and complier diagnostics.
version: 0.2.0
---

# Instrumental Variables

## Core Behavior

When this subskill is invoked, focus on the instrument-specific parts of the causal analysis:

1. **Audit the proposed instrument.** Clarify why the instrument affects treatment, why it is as-if random or valid conditional on covariates, why it has no direct effect on the outcome, and whether monotonicity is plausible.
2. **Define the estimand.** Usually this is a LATE/CACE for compliers, not an ATE. State the population and scale.
3. **Recommend a method and backend.** Choose Wald, 2SLS, LIML, GMM, IV-DML, fuzzy-RD local IV, or an RCT noncompliance workflow based on the data structure.
4. **Require diagnostics and interpretation guardrails.** Report first stage, reduced form, weak-IV diagnostics, falsification tests, overidentification tests when applicable, and a LATE-not-ATE warning.

Do not treat `Z` as a valid instrument merely because the user calls it an instrument. The design argument is the main object of analysis.

## Activation and Route-Out

Use this subskill when the plausible route involves:

- instrumental variables with one or more instruments;
- encouragement designs;
- randomized trials with noncompliance;
- randomized assignment as an instrument for treatment received;
- fuzzy regression discontinuity;
- natural experiments where assignment, eligibility, distance, policy exposure, price shifters, genes, or institutional rules are proposed as instruments;
- high-dimensional covariates with IV identification, where IV-DML may be appropriate.

If one of the conditions below appears, route out of IV as the primary workflow. Update the IV `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition under `fatal_flaws_or_major_limitations` or `limitations`, and return to the main skill's route shortlist.

- treatment was randomized and compliance is perfect: use the randomized-experiments subskill;
- the user only has observed confounders and no credible instrument: use point-treatment observational methods;
- the proposed instrument directly changes the outcome by construction;
- the instrument is only a predictor of treatment with no design-based exclusion argument;
- the user wants to discover instruments automatically from arbitrary features without a causal design argument. If the user still wants to proceed, treat this as an exploratory or user-forced IV route and surface the limitation clearly in any report.

## IV Project Specification Entry

Use this entry as the instrumental-variables audit checklist. When a project specification is being maintained, append or update it under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant; leave unknown fields as `null` or `[]`. Do not duplicate global fields already captured under `data`, `variables`, `intervention`, `outcomes`, `study_design`, or `analysis_routes`.

```yaml
subskill_analyses:
  - subskill_id: "13-instrumental-variables"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    estimand:
      label: "LATE | CACE | linear structural coefficient | policy-relevant weighted average | unknown"
      target_population: null
      scale: null
      interpretation: null
    assumptions_needed:
      relevance: null
      independence_or_as_if_random: null
      exclusion_restriction: null
      monotonicity: null
      positivity_or_instrument_support: null
    diagnostics_or_checks:
      first_stage: null
      reduced_form: null
      weak_iv: null
      falsification_checks: []
      overidentification: null
      complier_characterization: null
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
    subskill_specific_details:
      instrument_variable: null
      endogenous_treatment: null
      instrument_type: null
      number_of_instruments: null
      treatment_type: null
      covariates: []
      fixed_effects_or_blocks: []
      cluster_variable: null
      assignment_or_institutional_source_of_instrument: null
      exclusion_basis: null
      independence_basis: null
      monotonicity_plausible: null
      first_stage_expected: null
      data_setting: null
      language: "R | Python | either | unknown"
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(Y\): outcome;
- \(D\) or \(A\): endogenous treatment or exposure;
- \(Z\): instrument;
- \(X\): pre-instrument or pre-treatment covariates;
- \(U\): unobserved causes of treatment and outcome.

If the user uses different notation or variable names, adapt responses to the user's notation rather than forcing these symbols.

### Structural IV model

A common linear IV model is

\[
Y_i = \alpha + \beta D_i + X_i^\top\gamma + u_i,
\]

where \(D_i\) is endogenous, meaning

\[
\mathbb{E}[D_i u_i \mid X_i] \neq 0.
\]

An instrument \(Z_i\) is used when it satisfies, at minimum,

\[
\mathbb{E}[Z_i u_i \mid X_i] = 0
\]

and has a nonzero partial association with \(D_i\):

\[
\operatorname{Cov}(Z_i, D_i \mid X_i) \neq 0.
\]

For one endogenous variable and one excluded instrument, the covariate-adjusted IV estimand can be interpreted as the ratio of a reduced-form effect to a first-stage effect after conditioning or partialling out \(X\):

\[
\beta_{\mathrm{IV}}
=
\frac{
\operatorname{Cov}(\tilde Z_i, \tilde Y_i)
}{
\operatorname{Cov}(\tilde Z_i, \tilde D_i)
},
\]

where \(\tilde Z,\tilde Y,\tilde D\) are residuals after projecting on exogenous covariates \(X\).

### Wald estimand

For binary \(Z\) and binary or continuous \(D\), with no covariates shown,

\[
\widehat{\beta}_{\mathrm{Wald}}
=
\frac{\bar Y_{Z=1} - \bar Y_{Z=0}}
{\bar D_{Z=1} - \bar D_{Z=0}}.
\]

The denominator is the first stage. If the denominator is close to zero, the design is weak or unidentified.

### LATE / CACE

Let \(D_i(z)\) denote treatment received under instrument value \(z\), and \(Y_i(d)\) the potential outcome under treatment \(d\). For binary \(Z\) and binary \(D\), under relevance, independence, exclusion, and monotonicity,

\[
\frac{\mathbb{E}[Y_i \mid Z_i=1] - \mathbb{E}[Y_i \mid Z_i=0]}
{\mathbb{E}[D_i \mid Z_i=1] - \mathbb{E}[D_i \mid Z_i=0]}
=
\mathbb{E}[Y_i(1)-Y_i(0)\mid D_i(1)>D_i(0)].
\]

This is the **local average treatment effect** or **complier average causal effect**. It is local to units whose treatment is changed by the instrument.

### 2SLS

Let \(W=[X,D]\), and let \(Q=[X,Z]\), where \(X\) includes the intercept and all exogenous regressors. The 2SLS estimator is

\[
\widehat\beta_{2SLS}
=
(W^\top P_Q W)^{-1}W^\top P_QY,
\qquad
P_Q = Q(Q^\top Q)^{-1}Q^\top.
\]

Equivalently, first regress the endogenous treatment \(D\) on \(X\) and \(Z\), obtain fitted values \(\widehat D\), and then regress \(Y\) on \(X\) and \(\widehat D\). For correct standard errors, use an IV estimator object rather than manually running the two stages.

### Reduced form and first stage

The first stage is

\[
D_i = \pi_0 + \pi_Z Z_i + X_i^\top\pi_X + v_i.
\]

The reduced form is

\[
Y_i = \rho_0 + \rho_Z Z_i + X_i^\top\rho_X + e_i.
\]

For one instrument and one endogenous treatment,

\[
\beta_{\mathrm{IV}} = \rho_Z / \pi_Z.
\]

Always report both \(\widehat{\pi}_Z\) and \(\widehat{\rho}_Z\), not only the final IV coefficient.

## Identification Assumptions

State assumptions separately from modeling choices.

### Relevance

The instrument changes or predicts treatment:

\[
P(D=1\mid Z=1,X) \neq P(D=1\mid Z=0,X)
\]

or, for continuous treatment,

\[
\operatorname{Cov}(Z,D\mid X)\neq 0.
\]

This is partly testable through first-stage diagnostics, but a strong first stage alone does not validate the instrument.

### Independence / Exogeneity

The instrument is independent of unmeasured causes of the outcome, possibly conditional on covariates:

\[
Z \perp (Y(0),Y(1),D(0),D(1)) \mid X.
\]

This is a design assumption. Baseline covariate balance and placebo tests can make violations more or less plausible, but they cannot prove the assumption.

### Exclusion Restriction

The instrument affects the outcome only through the treatment:

\[
Y_i(d,z)=Y_i(d).
\]

A direct arrow \(Z\to Y\) violates this assumption.

### Monotonicity

For binary \(Z\) and binary \(D\),

\[
D_i(1) \ge D_i(0)
\]

for every unit, or the reverse inequality for every unit after recoding \(Z\). This rules out defiers. It is needed for the standard LATE interpretation.

### Consistency and SUTVA

The observed outcome equals the potential outcome under the observed treatment and instrument, and one unit's instrument/treatment does not affect another unit's outcome unless the estimand explicitly models interference.

### Positivity / Instrument Support

Each relevant level of \(Z\) occurs with positive probability within the target covariate support. If \(Z\) is deterministic in some strata, covariate-adjusted IV effects may be unsupported in those strata.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required additions |
|---|---|---|
| One binary instrument, one binary treatment, no major covariate complexity | Wald estimator and 2SLS | first stage, reduced form, complier share, LATE statement |
| One instrument, one continuous treatment | 2SLS | linearity/constant-slope interpretation, first-stage plot |
| Multiple excluded instruments, one endogenous treatment | 2SLS or GMM; consider LIML | overidentification test, leave-one-in/out, instrument-specific first stages |
| Weak or borderline first stage | weak-robust inference; consider LIML; possibly abandon IV | Anderson-Rubin/CLR-style inference when available; do not rely only on conventional t tests |
| Heteroskedastic, clustered, or serially correlated errors | 2SLS with robust/cluster/HAC covariance | report covariance choice; use cluster-aware first-stage diagnostics when possible |
| High-dimensional covariates or flexible nuisance functions | IV-DML / DoubleML PLIV or IIVM | cross-fitting, learner specification, nuisance performance, still require IV design argument |
| Noncompliance in randomized trial | ITT primary; CACE/LATE secondary using assignment as \(Z\) | treatment receipt table by assignment, monotonicity, exclusion of assignment |
| Fuzzy regression discontinuity | local 2SLS near cutoff | bandwidth sensitivity, density/manipulation checks, local estimand |
| Panel data or many fixed effects | fixed-effect IV, often with `fixest` in R | fixed-effect support, cluster-robust SEs, within variation of instrument |
| Multiple endogenous treatments | system IV/GMM if instruments are sufficient | rank condition, separate first stages, method-specific diagnostics |
| Nonlinear outcome model desired | clarify estimand; linear IV may target a weighted average | do not automatically use logistic second stage as causal IV |

### Weak instrument policy

Report the conventional first-stage partial F or robust Wald statistic, but do not use a single threshold mechanically.

- \(F>10\) is a common rough screening rule, not a proof of valid inference.
- If there are heteroskedastic, clustered, or serially correlated errors, prefer diagnostics designed for that covariance structure when available.
- With one instrument, a robust first-stage Wald statistic is often displayed as \(\chi^2(1)\); an approximate F-like value is the statistic divided by the number of excluded instruments.
- If instruments are weak, conventional 2SLS confidence intervals can be badly distorted. Prefer weak-robust tests or report that the IV analysis is underpowered/unreliable.
- Recent weak-IV work shows that conventional t-ratio inference can require much stronger first stages than the rule-of-thumb threshold. Therefore, do not say “F > 10 means no weak-IV problem”; say “F > 10 passes a conventional screening rule, but weak-IV-robust inference or sensitivity is still preferable for important claims.”

## Language Backend Policy

### R

- `ivreg`: classical 2SLS with diagnostics, robust covariance support through `sandwich`, and regression diagnostics.
- `fixest`: fast IV with high-dimensional fixed effects, clustered standard errors, first-stage summaries, and convenient tables.
- `AER::ivreg`: legacy/common in older examples; prefer the standalone `ivreg` package for new code.
- `DoubleML`: IV-DML through PLIV/IIVM when high-dimensional covariates or flexible nuisance functions are needed.

### Python

- `linearmodels.iv.IV2SLS`: standard 2SLS with robust, clustered, and other covariance options.
- `linearmodels.iv.IVLIML` and `IVGMM`: LIML/GMM variants when appropriate.
- `DoubleML`: PLIV/IIVM with cross-fitting for high-dimensional covariates.
- `statsmodels`: useful for auxiliary OLS, placebo tests, and custom diagnostics; not the primary IV backend for modern applied workflows.

## Data Preprocessing Rules

1. Keep a single consistent analysis sample for first stage, reduced form, second stage, and diagnostic tests unless explicitly reporting why samples differ.
2. Include all exogenous covariates in both the structural equation and the instrument set. In formula syntax this usually means `Y ~ D + X | Z + X`.
3. Do not adjust for post-treatment variables in the primary IV model.
4. Do not residualize \(D\), \(Y\), or \(Z\) by hand unless you know how to preserve the IV estimand and compute valid standard errors. Use package IV functions.
5. Check collinearity: an instrument that is absorbed by fixed effects or perfectly predicted by covariates cannot identify the effect.
6. Report missingness for \(Y\), \(D\), \(Z\), covariates, clusters, and fixed effects.
7. If the instrument is cluster-level, use cluster-appropriate inference and avoid pretending individual rows are independently assigned.
8. If the treatment or outcome is binary, a linear IV model may still identify a LATE on the risk-difference scale, but fitted values and model interpretation require care.

## Required Diagnostics

### First-stage diagnostics

Always report:

- first-stage coefficient(s) of excluded instrument(s);
- partial \(R^2\);
- first-stage F or robust Wald statistic;
- first-stage sample size;
- whether the instrument has variation after covariate/fixed-effect adjustment;
- a first-stage visualization when feasible.

Suggested reporting language:

> The excluded instrument changes the treatment by \(\widehat{\pi}_Z=...\). The partial \(R^2\) is ..., and the first-stage statistic is .... This passes/fails a conventional screening rule, but instrument validity still depends on exclusion and independence.

### Reduced-form diagnostics

Report the effect of \(Z\) on \(Y\). If the reduced form is near zero while the IV estimate is large, explain that the ratio may be unstable.

### Weak-IV diagnostics and inference

Use the diagnostics available in the chosen backend:

- `ivreg`: diagnostic tests through `summary(..., diagnostics = TRUE)` and robust covariance through `sandwich`.
- `fixest`: first-stage F, Wu-Hausman, Sargan where relevant, and `fitstat()` for additional IV tests.
- `linearmodels`: `res.first_stage`, `res.first_stage.diagnostics`, `res.sargan`, `res.wu_hausman()`, and covariance-aware summaries.
- specialized weak-IV procedures may be needed for publication-grade weak-robust confidence sets.

### Exclusion restriction falsification checks

Run these when the design permits:

1. **Covariate balance by instrument:** regress pre-treatment covariates on \(Z\) and covariates/blocks that define the assignment mechanism.
2. **Placebo outcome tests:** test whether \(Z\) predicts outcomes that should not be affected by \(D\).
3. **Pre-trend checks:** for panel or policy instruments, test whether \(Z\) predicts pre-treatment outcome trends.
4. **Mechanism checks:** identify possible direct channels from \(Z\) to \(Y\) not mediated by \(D\).
5. **Subsample credibility checks:** compare settings where exclusion is more versus less plausible.

Do not call these tests “proof” of validity. They are falsification and credibility checks.

### Overidentification diagnostics

If the model has more excluded instruments than endogenous variables, report Sargan/Hansen/Wooldridge overidentification tests when available. Interpret carefully:

- failure to reject does not prove all instruments are valid;
- rejection suggests at least one instrument or model assumption is inconsistent with the others;
- overidentification tests require at least one valid instrument as a baseline.

### Endogeneity tests

Wu-Hausman or Durbin tests evaluate whether IV and OLS differ in a way consistent with endogeneity of \(D\). They do not validate the instrument.

### Complier characterization

For binary \(Z\) and binary \(D\), report the estimated complier share:

\[
\widehat{P}(\mathrm{complier})
=
\widehat{\mathbb{E}}[D\mid Z=1]
-
\widehat{\mathbb{E}}[D\mid Z=0].
\]

For a pre-treatment covariate \(X\), a simple complier mean estimator is

\[
\widehat{\mathbb{E}}[X\mid \mathrm{complier}]
=
\frac{
\widehat{\mathbb{E}}[X D\mid Z=1]
-
\widehat{\mathbb{E}}[X D\mid Z=0]
}{
\widehat{\mathbb{E}}[D\mid Z=1]
-
\widehat{\mathbb{E}}[D\mid Z=0]
}.
\]

Use this to describe who the LATE is about. Warn the user if compliers are a narrow or non-generalizable subset.

## LATE != ATE Guardrail

Always include a statement like:

> This IV estimate is a LATE/CACE for units whose treatment status is changed by the instrument. It is not automatically the ATE for all units. Generalizing from LATE to ATE requires additional assumptions, such as homogeneous treatment effects or a defensible model for how complier effects relate to effects for always-takers and never-takers.

Extrapolation from LATE to ATE may be discussed only if the user provides a credible reason, for example:

- treatment effects are plausibly homogeneous;
- the instrument shifts treatment broadly across the target population;
- multiple instruments identify similar effects across different complier groups;
- external evidence supports effect homogeneity.

## Sensitivity Analysis

When exclusion is uncertain, propose sensitivity analyses.

### Direct-effect sensitivity for a single instrument

Suppose

\[
Y = \beta D + \delta Z + X^\top\gamma + u.
\]

Here \(\delta\) is a direct effect of \(Z\) on \(Y\), violating exclusion. With one instrument and one endogenous treatment, an approximate sensitivity calculation is

\[
\beta(\delta)
=
\frac{\rho_Z - \delta}{\pi_Z},
\]

where \(\rho_Z\) is the reduced form and \(\pi_Z\) is the first stage. Vary \(\delta\) over scientifically meaningful values and report how large a direct effect would be needed to overturn the conclusion.

### Multiple-instrument sensitivity

For multiple instruments:

- leave one instrument out at a time;
- compare estimates by instrument or instrument group;
- test overidentification where available;
- report which instruments drive the result.

### Alternative specifications

Check robustness to:

- covariate sets justified by the design;
- fixed effects or blocks;
- clustering level;
- transformations of treatment/outcome;
- sample restrictions defined before looking at the outcome.

## DAG Interpretation

A valid simple IV DAG is:

```text
Z --> D --> Y
      ^     ^
      |     |
      U ----
X --> D
X --> Y
```

Violations:

```text
Z --> Y        # exclusion violation
U --> Z        # independence violation
Z --> D weak   # weak or irrelevant instrument
D(1)<D(0) for some units # monotonicity violation/defiers
```

The graph helps organize assumptions but does not prove them.

## Special Workflows

### Noncompliance in randomized trials

If \(Z\) is randomized assignment and \(D\) is treatment received:

1. Report ITT effect of assignment on outcome:
   \[
   \mathbb{E}[Y\mid Z=1]-\mathbb{E}[Y\mid Z=0].
   \]
2. Report first-stage compliance:
   \[
   \mathbb{E}[D\mid Z=1]-\mathbb{E}[D\mid Z=0].
   \]
3. Estimate CACE/LATE as the ratio or with 2SLS.
4. Explain monotonicity and exclusion: assignment should affect outcome only through treatment received for the CACE interpretation.
5. Do not present as-treated or per-protocol comparisons as randomized causal effects without extra assumptions.

Also read `subskills/05-randomized-experiments/`.

### Fuzzy regression discontinuity

If treatment probability jumps at a cutoff but treatment is not deterministic:

1. Use cutoff eligibility \(Z=1(R\ge c)\) as a local instrument for treatment \(D\).
2. Estimate a local Wald/2SLS effect near the cutoff.
3. Use bandwidth selection and sensitivity.
4. Check density/manipulation and covariate continuity.
5. State that the estimand is local to cutoff compliers.

Also read `subskills/12-regression-discontinuity/`.

### Heterogeneous IV effects

If the user asks who benefits among compliers:

- start with interactions in 2SLS only if pre-specified and interpretable;
- consider causal forests with instrumental variables or local IV methods for CATE-like questions;
- warn that heterogeneity is among complier groups induced by the instrument, not necessarily the full-population CATE.

Also read `subskills/09-heterogeneous-effects-policy/`.

## Code Templates and Examples

Root templates:

- `scripts/R/ivreg_fixest_template.R`
- `scripts/R/doubleml_iv_template.R`
- `scripts/python/linearmodels_iv_template.py`
- `scripts/python/doubleml_iv_template.py`

Subskill examples:

- `subskills/13-instrumental-variables/examples/r_ivreg_diagnostics.R`
- `subskills/13-instrumental-variables/examples/r_fixest_iv.R`
- `subskills/13-instrumental-variables/examples/python_linearmodels_iv.py`
- `subskills/13-instrumental-variables/examples/python_doubleml_iv.py`
- `subskills/13-instrumental-variables/examples/r_late_characterization.R`

## Output Template

```markdown
### Instrumental Variables Analysis

#### 1. Causal question
- Outcome:
- Endogenous treatment:
- Proposed instrument:
- Target population:
- Estimand:

#### 2. Instrument audit
- Relevance argument:
- Independence/as-if-random argument:
- Exclusion restriction argument:
- Monotonicity argument:
- Possible violations:

#### 3. Method recommendation
- Primary method:
- Alternative method:
- Software/backend:
- Covariance/SE choice:
- Analysis sample:

#### 4. First stage and reduced form
- First-stage estimate:
- Partial R²:
- First-stage F/Wald statistic:
- Reduced-form estimate:
- Weak-IV concern:

#### 5. Main IV estimate
- Estimate:
- Standard error:
- Confidence interval:
- p-value, if hypothesis testing is requested:
- Scale and units:

#### 6. Validity and falsification checks
- Covariate balance by Z:
- Placebo outcomes:
- Pre-trends, if applicable:
- Overidentification tests, if applicable:
- Sensitivity analysis:

#### 7. Complier/LATE interpretation
- Estimated complier share:
- Complier characteristics:
- LATE/CACE warning:
- Generalizability limits:

#### 8. Conclusion
- Interpretation under assumptions:
- Fatal flaws or major limitations:
- Most important threats:
- Recommended next steps:
```

## Red Flags

Escalate warnings when:

- the instrument plausibly affects the outcome directly;
- the proposed IV route lacks a credible exclusion-restriction argument;
- the first stage is weak or unstable;
- the instrument is strongly associated with pre-treatment covariates without a design explanation;
- the analysis adjusts for post-treatment variables;
- the instrument is absorbed by fixed effects;
- multiple instruments give inconsistent estimates;
- the user interprets LATE as ATE;
- monotonicity is implausible;
- the sample is selected based on post-instrument or post-treatment variables;
- treatment and outcome timing are ambiguous;
- the proposed instrument is only a machine-learning feature selected for prediction.
