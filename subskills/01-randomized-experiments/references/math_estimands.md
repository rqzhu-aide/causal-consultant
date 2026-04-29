# Mathematical Notes for Randomized Experiments

## 1. Potential Outcomes

For a two-arm experiment, each unit \(i\) has potential outcomes \(Y_i(1)\) and \(Y_i(0)\). Let \(Z_i\in\{0,1\}\) be randomized assignment.

Consistency:

\[
Y_i = Z_iY_i(1)+(1-Z_i)Y_i(0).
\]

Randomization:

\[
Z_i \perp \{Y_i(1),Y_i(0),X_i\}
\]

or, under blocked randomization,

\[
Z_i \perp \{Y_i(1),Y_i(0),X_i\}\mid B_i.
\]

The causal identification is design-based; no outcome regression model is needed for identification.

## 2. ATE and ITT

If assignment is the intervention, the intention-to-treat estimand is

\[
\tau_{ITT}=E\{Y(1)-Y(0)\}.
\]

The difference-in-means estimator is

\[
\hat\tau = \frac{1}{n_1}\sum_{i:Z_i=1}Y_i - \frac{1}{n_0}\sum_{i:Z_i=0}Y_i.
\]

Under independent sampling and simple randomization, a common large-sample variance estimator is

\[
\widehat{Var}(\hat\tau)=\frac{s_1^2}{n_1}+\frac{s_0^2}{n_0}.
\]

For finite-population randomization inference, the exact variance depends on the finite-population variances of potential outcomes and their unobserved covariance. In practice, design-based conservative estimators are common.

## 3. Regression Form of Difference in Means

The OLS model

\[
Y_i=\alpha+\tau Z_i+\varepsilon_i
\]

returns \(\hat\tau=\bar Y_1-\bar Y_0\) in a two-arm experiment with an intercept. Robust standard errors are often preferable to homoskedastic standard errors.

## 4. Regression Adjustment

Use only pre-treatment covariates. A robust adjustment is

\[
Y_i = \alpha + \tau Z_i + \beta^T(X_i-\bar X) + \gamma^T Z_i(X_i-\bar X)+\varepsilon_i.
\]

The treatment coefficient targets the randomized assignment effect while allowing treatment-covariate interactions. The adjustment is for precision, not confounding control.

## 5. Binary Outcomes

Let \(p_z=P(Y=1\mid Z=z)\). Common contrasts:

Risk difference:

\[
RD=p_1-p_0.
\]

Risk ratio:

\[
RR=p_1/p_0.
\]

Odds ratio:

\[
OR=\frac{p_1/(1-p_1)}{p_0/(1-p_0)}.
\]

For causal interpretation, specify the scale. A statistically significant odds ratio may correspond to a small absolute risk change.

## 6. Relative Lift

For continuous/product metrics,

\[
\text{lift}=\frac{\mu_1-\mu_0}{\mu_0},
\qquad \mu_z=E(Y\mid Z=z).
\]

Report both absolute and relative effects.

## 7. CUPED

Given a pre-period metric \(X\), define

\[
Y_i^*=Y_i-\theta(X_i-\bar X),\qquad \theta=\frac{Cov(Y,X)}{Var(X)}.
\]

Then estimate \(E(Y^*\mid Z=1)-E(Y^*\mid Z=0)\). If \(X\) is pre-randomization, the transformed outcome preserves unbiasedness for the same treatment contrast and can reduce variance.

## 8. Ratio Metrics

For user-level numerator \(M_i\) and denominator \(N_i\), the arm-level ratio is

\[
R_z=\frac{\sum_{i:Z_i=z}M_i}{\sum_{i:Z_i=z}N_i}.
\]

The contrast is \(R_1-R_0\) or \(R_1/R_0-1\). Avoid treating event-level rows as independent. A delta-method variance can be based on the influence-like quantity

\[
G_i=M_i-R_zN_i
\]

within each arm.

## 9. Sample-Ratio Mismatch

With expected probabilities \(p_k\), observed counts \(n_k\), and total \(N\):

\[
\chi^2=\sum_{k=1}^K\frac{(n_k-Np_k)^2}{Np_k}.
\]

Compare to \(\chi^2_{K-1}\). SRM is not an effect estimate; it is a data-quality diagnostic.

## 10. Cluster Randomization

If cluster \(c\) has size \(n_c\), define cluster mean \(\bar Y_c(z)\).

Cluster-weighted effect:

\[
\tau_C=\frac{1}{C}\sum_c \{\bar Y_c(1)-\bar Y_c(0)\}.
\]

Individual-weighted effect:

\[
\tau_I=\frac{1}{\sum_c n_c}\sum_c n_c\{\bar Y_c(1)-\bar Y_c(0)\}.
\]

The analysis must respect cluster assignment. Individual-level rows are not independent when treatment is assigned by cluster.

## 11. Noncompliance

With treatment received \(D\), the ITT effect on treatment receipt is

\[
\pi=E(D\mid Z=1)-E(D\mid Z=0).
\]

If \(\pi\ne 0\), the Wald CACE estimator is

\[
\hat\tau_{CACE}=\frac{\hat\tau_{ITT,Y}}{\hat\pi}.
\]

This targets compliers under IV/LATE assumptions, not necessarily the ATE.

## 12. Randomization Inference

Under a sharp null hypothesis, such as \(Y_i(1)=Y_i(0)\) for all \(i\), potential outcomes are fully known. A randomization p-value is computed by comparing the observed test statistic to its distribution under all or many assignments allowed by the randomization design.

This is especially useful for small samples, unusual randomization schemes, and transparent design-based hypothesis testing.
