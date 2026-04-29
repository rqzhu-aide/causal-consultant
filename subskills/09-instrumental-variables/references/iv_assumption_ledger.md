# IV Assumption Ledger

Use this file when preparing the user-facing assumptions section for an IV analysis.

## Relevance

**Statement.** The proposed instrument \(Z\) changes the treatment or exposure \(D\), possibly conditional on covariates \(X\).

**Formal version.**

\[
\operatorname{Cov}(Z,D\mid X)\neq 0.
\]

**Evidence to report.**

- first-stage coefficient(s);
- partial \(R^2\);
- first-stage F or robust Wald statistic;
- first-stage plot;
- treatment rate by instrument if \(Z,D\) are binary.

**Failure sign.**

- near-zero first stage;
- instrument has no variation after fixed effects;
- first-stage effect is caused by coding/logging error.

## Independence / As-if Random Assignment

**Statement.** \(Z\) is independent of unmeasured causes of \(Y\), possibly conditional on \(X\).

**Formal version.**

\[
Z \perp (Y(0),Y(1),D(0),D(1))\mid X.
\]

**Evidence to report.**

- institutional or randomization mechanism;
- covariate balance by \(Z\);
- placebo outcomes;
- pre-trend checks;
- clear timing: \(Z\) occurs before \(D\) and \(Y\).

**Failure sign.**

- \(Z\) is chosen by subjects based on prognosis;
- \(Z\) varies with latent severity, preferences, wealth, site quality, provider behavior, or geography in ways not controlled by \(X\).

## Exclusion Restriction

**Statement.** \(Z\) affects \(Y\) only through \(D\).

**Formal version.**

\[
Y(d,z)=Y(d).
\]

**Evidence to report.**

- substantive mechanism;
- direct-channel audit;
- placebo outcome tests;
- sensitivity analysis for direct effect \(\delta\).

**Failure sign.**

- \(Z\) changes access, information, prices, quality, behavior, or downstream care independently of \(D\).

## Monotonicity

**Statement.** The instrument does not push some units toward treatment and others away from treatment.

**Formal version.**

\[
D(1)\ge D(0)
\]

for all units, or the reverse after recoding.

**Evidence to report.**

- design reason no defiers should exist;
- treatment rates move in expected direction in all major subgroups;
- no evidence of opposite-sign first stages.

**Failure sign.**

- incentives could plausibly increase treatment for some units and decrease it for others;
- first-stage direction differs across important subgroups.

## Consistency and Interference

**Statement.** Observed outcomes correspond to the potential outcomes under the observed treatment/instrument, and one unit's \(Z,D\) do not affect another unit's \(Y\) unless modeled.

**Evidence to report.**

- clear treatment definition;
- clear treatment timing;
- no spillover path or network exposure;
- cluster/network design if spillovers exist.

## Modeling and Inference Assumptions

These are separate from identification.

- linear structural equation or weighted-average interpretation;
- correct covariance estimator: heteroskedastic, cluster, HAC, or randomization-based;
- sufficient instrument strength for conventional inference or use of weak-robust inference;
- correct sample inclusion and missingness handling.
