# Workflow: Instrumental Variables

## Purpose

This workflow supports instrumental-variable analyses for unmeasured confounding, encouragement designs, imperfect-compliance randomized trials, fuzzy regression discontinuity, and high-dimensional IV settings. It is intentionally design-first: a strong first stage does not make an invalid instrument valid.

## Step 0: Triage

Use this workflow if the user has:

- an outcome \(Y\);
- an endogenous treatment or exposure \(D\);
- a proposed instrument \(Z\);
- a reason \(Z\) shifts \(D\);
- a causal question where ordinary adjustment may fail because of unmeasured confounding, simultaneity, measurement error, or noncompliance.

Route elsewhere if:

- treatment was randomized and compliance is perfect;
- there is no proposed instrument;
- the question is purely predictive;
- the user wants causal discovery rather than IV effect estimation.

## Step 1: Intake Questions

Ask only the questions needed to fill gaps.

### Variables and timing

- What is the outcome \(Y\)?
- What is the endogenous treatment/exposure \(D\)?
- What is the proposed instrument \(Z\)?
- When is \(Z\) measured relative to \(D\) and \(Y\)?
- Are covariates pre-instrument, pre-treatment, or post-treatment?
- Are there clusters, sites, subjects, repeated measures, or panel units?

### Design argument

- Why should \(Z\) affect \(D\)?
- Why should \(Z\) be independent of unmeasured causes of \(Y\), possibly conditional on covariates?
- Why should \(Z\) affect \(Y\) only through \(D\)?
- Is monotonicity plausible? Could some units move opposite to the instrument?
- What population does the instrument shift?

### Data and software

- Is \(Z\) binary, continuous, or multivalued?
- Is \(D\) binary, continuous, or multivalued?
- How many excluded instruments are there?
- Are there fixed effects or clusters?
- R or Python?
- Is this a standard linear IV problem, or does the user need high-dimensional/flexible covariate adjustment?

## Step 2: State the Estimand

Choose and state one.

### Wald/LATE for binary instrument

\[
\beta_{\text{Wald}}
=
\frac{E(Y\mid Z=1)-E(Y\mid Z=0)}
{E(D\mid Z=1)-E(D\mid Z=0)}.
\]

With binary treatment and monotonicity, this is

\[
E\{Y(1)-Y(0)\mid D(1)>D(0)\}.
\]

### 2SLS linear structural coefficient

Use when the user is working with a linear structural equation, continuous treatment, covariates, or multiple instruments. State whether the coefficient is interpreted as a constant effect, a weighted average of heterogeneous effects, or an approximation.

### CACE in randomized noncompliance

Use when \(Z\) is randomized assignment and \(D\) is actual treatment receipt.

### Local IV for fuzzy RD

Use when \(Z\) is cutoff eligibility and the first stage is local near the cutoff.

## Step 3: Choose the Method

| Data situation | Method | Backend |
|---|---|---|
| one instrument, one endogenous regressor | 2SLS/Wald | R `ivreg`; Python `linearmodels` |
| many fixed effects or large data | fixed-effect IV | R `fixest` |
| multiple instruments | 2SLS/GMM/LIML | R `ivreg`/`fixest`; Python `linearmodels` |
| high-dimensional covariates | IV-DML | R/Python `DoubleML` |
| noncompliance in RCT | ITT + 2SLS CACE | R `ivreg`/`fixest`; Python `linearmodels` |
| fuzzy RD | local Wald/2SLS | combine RD subskill with IV backend |

## Step 4: Prepare Data

- Drop missing data consistently or document imputation.
- Verify variables are numeric/factor-coded as intended.
- Check that all exogenous controls appear in both structural and instrument parts of the formula.
- Check that the excluded instrument varies within fixed-effect groups.
- Do not condition on post-treatment variables.
- Report full sample size and analysis sample size.
- If \(Z\) is assigned at cluster level, define the cluster for standard errors.

## Step 5: Fit Core Models

Always fit and report:

1. **First stage:** \(D\sim Z+X\)
2. **Reduced form:** \(Y\sim Z+X\)
3. **Naive association:** \(Y\sim D+X\), labeled noncausal or confounded
4. **IV model:** \(Y\sim D+X\) instrumenting \(D\) with \(Z\)

For exactly identified single-instrument designs, verify that IV equals reduced form divided by first stage up to covariate adjustment.

## Step 6: Diagnostics Checklist

### Required

- [ ] first-stage coefficient(s)
- [ ] partial \(R^2\)
- [ ] first-stage F or robust Wald statistic
- [ ] reduced-form effect
- [ ] robust or cluster-robust standard errors as appropriate
- [ ] LATE/CACE interpretation
- [ ] instrument validity argument

### If multiple instruments

- [ ] overidentification test
- [ ] instrument-specific first stages
- [ ] leave-one-out estimates
- [ ] check whether one instrument drives the result

### If clustered/panel data

- [ ] cluster-robust covariance
- [ ] fixed effects justified by design
- [ ] within-cluster/within-FE variation in \(Z\)
- [ ] pre-trend or placebo checks if policy/panel setting

### If weak instruments possible

- [ ] weak-IV warning
- [ ] LIML or GMM comparison if helpful
- [ ] Anderson-Rubin/weak-robust inference where available
- [ ] sensitivity to first-stage strength
- [ ] do not rely solely on \(F>10\)

## Step 7: Falsification Tests

Run these if variables are available.

### Covariate balance by instrument

For each pre-treatment covariate \(X_j\), fit:

\[
X_j = a + bZ + c^\top X_{\text{design}} + e.
\]

Large systematic imbalance can indicate that \(Z\) is not as-if random, unless expected by design and conditioned on.

### Placebo outcome

Fit:

\[
Y_{\text{placebo}} = a + bZ + c^\top X + e.
\]

A significant effect of \(Z\) on an outcome that \(D\) cannot affect is evidence against the exclusion/independence story.

### Pre-trends

For policy/panel instruments, test whether \(Z\) predicts pre-treatment outcome trends.

### Direct-channel assessment

List plausible paths \(Z\to Y\) not through \(D\). For each, say whether the data can test, bound, or only discuss the threat.

## Step 8: Complier Description

For binary \(Z\) and binary \(D\):

1. Estimate complier share:
   \[
   \widehat p_C = \bar D_{Z=1}-\bar D_{Z=0}.
   \]
2. For each pre-treatment covariate \(X\), estimate:
   \[
   \widehat E[X\mid C]
   =
   \frac{\widehat E[XD\mid Z=1]-\widehat E[XD\mid Z=0]}
   {\widehat p_C}.
   \]
3. Compare complier covariate means with overall means.
4. State whether compliers are clinically, economically, or scientifically relevant.

## Step 9: Sensitivity Analysis

### Exclusion violation

If a direct effect \(\delta\) of \(Z\) on \(Y\) is plausible, use

\[
\beta(\delta) = \frac{\rho_Z-\delta}{\pi_Z}
\]

as a simple one-instrument sensitivity calculation. Ask the user for meaningful values of \(\delta\) or use a grid.

### Instrument set sensitivity

With multiple instruments:

- estimate each instrument separately when possible;
- leave one out;
- compare estimates;
- examine overidentification tests.

### Specification sensitivity

Vary pre-treatment covariates, fixed effects, cluster level, and sample restrictions only when each variation has a design justification.

## Step 10: Interpret Results

A correct IV interpretation should include:

```markdown
The IV estimate is [estimate] on the [scale] scale. Under relevance, independence, exclusion, monotonicity, consistency, and no-interference assumptions, this estimates a [LATE/CACE/linear IV estimand] for [population]. The estimate is not automatically an ATE. The first stage was [strength], and the main validity concerns are [concerns].
```

## Suggested Response Pattern

```markdown
I would treat this as an instrumental-variables problem because [Z] is proposed to shift [D] while unmeasured factors may confound [D] and [Y].

The target estimand is [LATE/CACE/linear IV coefficient]. In the binary instrument/binary treatment case, this is the effect among compliers whose treatment status is changed by [Z].

A reasonable primary analysis is [2SLS/Wald/fixed-effect IV/IV-DML], implemented with [package]. I would first fit the first stage and reduced form, then the IV model, and report robust/clustered uncertainty.

This design requires relevance, independence, exclusion, and monotonicity. I would check first-stage strength, partial R², covariate balance by the instrument, placebo outcomes, overidentification if available, and sensitivity to direct effects of the instrument.

If the first stage is weak or exclusion is not credible, I would not present the estimate as a reliable causal effect.
```

## Code Template Index

- Full R `ivreg` example: `../examples/r_ivreg_diagnostics.R`
- Full R `fixest` example: `../examples/r_fixest_iv.R`
- Full Python `linearmodels` example: `../examples/python_linearmodels_iv.py`
- Python IV-DML example: `../examples/python_doubleml_iv.py`
- R complier characterization example: `../examples/r_late_characterization.R`
- Root R template: `../../../scripts/R/ivreg_fixest_template.R`
- Root R IV-DML template: `../../../scripts/R/doubleml_iv_template.R`
- Root Python template: `../../../scripts/python/linearmodels_iv_template.py`
- Root Python IV-DML template: `../../../scripts/python/doubleml_iv_template.py`

## Failure Modes

- Treating a predictive variable as an instrument.
- Interpreting a LATE as an ATE.
- Ignoring weak instruments.
- Reporting only second-stage output.
- Conditioning on post-treatment variables.
- Ignoring differential missingness induced by \(Z\) or \(D\).
- Using individual-level SEs when \(Z\) varies at cluster level.
- Using fixed effects that absorb the instrument.
- Claiming overidentification tests prove validity.
- Using as-treated/per-protocol comparisons in noncompliance RCTs without acknowledging selection.
