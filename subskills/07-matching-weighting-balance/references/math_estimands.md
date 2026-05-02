# Mathematical Foundations: Matching, Weighting, and Balance

## 1. Setup

Let \(i=1,\dots,n\) index units. Let \(A_i\in\{0,1\}\) be a point treatment, \(X_i\) a vector of pre-treatment covariates, and \(Y_i\) an observed outcome. Potential outcomes are \(Y_i(1)\) and \(Y_i(0)\). The observed outcome satisfies

\[
Y_i = A_iY_i(1) + (1-A_i)Y_i(0).
\]

For a total effect, adjustment variables should not be affected by treatment.

## 2. Identification

The standard matching/weighting identification assumptions are:

### Consistency

\[
Y_i = Y_i(a) \quad \text{if } A_i=a.
\]

### Conditional exchangeability

\[
\{Y_i(1),Y_i(0)\} \perp A_i \mid X_i.
\]

### Positivity

\[
0 < P(A_i=1\mid X_i=x) < 1
\]

for covariate values \(x\) in the target population.

### SUTVA / no interference

The potential outcome of unit \(i\) depends only on its own treatment unless the estimand explicitly models interference.

Under these assumptions,

\[
E\{Y(a)\}=E\{E(Y\mid A=a,X)\}.
\]

## 3. Propensity Score

The propensity score is

\[
e(X)=P(A=1\mid X).
\]

It is a balancing score:

\[
A \perp X \mid e(X).
\]

If treatment assignment is conditionally exchangeable given \(X\), it is also conditionally exchangeable given the true propensity score:

\[
\{Y(1),Y(0)\}\perp A\mid e(X).
\]

Practical warning: the estimated propensity score \(\hat e(X)\) is only useful if it leads to balance of measured covariates and adequate overlap.

## 4. Estimands

### ATE

\[
\tau_{ATE}=E\{Y(1)-Y(0)\}.
\]

ATE targets the full eligible population. It is unstable when many units have \(e(X)\approx 0\) or \(e(X)\approx 1\).

### ATT

\[
\tau_{ATT}=E\{Y(1)-Y(0)\mid A=1\}.
\]

ATT targets the treated population. It is natural when the treated group is the population of scientific interest.

### ATC

\[
\tau_{ATC}=E\{Y(1)-Y(0)\mid A=0\}.
\]

ATC targets the untreated/control population.

### ATO / overlap estimand

\[
\tau_{ATO}=\frac{E[e(X)\{1-e(X)\}\{Y(1)-Y(0)\}]}{E[e(X)\{1-e(X)\}]}.
\]

ATO targets the overlap or clinical equipoise population.

### General weighted estimand

Let \(h(X)\ge 0\) be a tilting function. Define

\[
\tau_h=\frac{E[h(X)\{Y(1)-Y(0)\}]}{E[h(X)]}.
\]

The corresponding weights for potential outcome means are

\[
w_i^1=\frac{h(X_i)}{e(X_i)},
\qquad
w_i^0=\frac{h(X_i)}{1-e(X_i)}.
\]

Then

\[
E_h\{Y(1)\}=\frac{E[A w^1Y]}{E[A w^1]},
\qquad
E_h\{Y(0)\}=\frac{E[(1-A) w^0Y]}{E[(1-A) w^0]}.
\]

## 5. Common Weights

| Target | \(h(X)\) | Treated weight | Control weight |
|---|---:|---:|---:|
| ATE | \(1\) | \(1/e\) | \(1/(1-e)\) |
| ATT | \(e\) | \(1\) | \(e/(1-e)\) |
| ATC | \(1-e\) | \((1-e)/e\) | \(1\) |
| ATO | \(e(1-e)\) | \(1-e\) | \(e\) |
| Matching weights | \(\min(e,1-e)\) | \(\min(e,1-e)/e\) | \(\min(e,1-e)/(1-e)\) |

For ATE, unstabilized IPW weights are

\[
w_i=\frac{A_i}{e_i}+\frac{1-A_i}{1-e_i}.
\]

Stabilized ATE weights are

\[
w_i=A_i\frac{P(A=1)}{e_i}+(1-A_i)\frac{P(A=0)}{1-e_i}.
\]

## 6. Weighted Estimators

The normalized or Hájek weighted estimator is

\[
\widehat\tau_w
=
\frac{\sum_i A_iw_iY_i}{\sum_i A_iw_i}
-
\frac{\sum_i(1-A_i)w_iY_i}{\sum_i(1-A_i)w_i}.
\]

The unnormalized or Horvitz-Thompson-style ATE estimator is

\[
\widehat\tau_{HT}
=\frac{1}{n}\sum_i \left\{\frac{A_iY_i}{\hat e_i}-\frac{(1-A_i)Y_i}{1-\hat e_i}\right\}.
\]

The normalized version is often more stable in finite samples.

## 7. Standardized Mean Difference

For a continuous covariate \(X_j\), an unweighted SMD is often

\[
SMD_j
=\frac{\bar X_{j,1}-\bar X_{j,0}}{s_j},
\]

where \(s_j\) is a chosen standardization factor such as the pooled standard deviation, treated-group standard deviation for ATT, or full-sample standard deviation.

Weighted means are

\[
\bar X_{j,a}^{w}
=\frac{\sum_i 1(A_i=a)w_iX_{ij}}{\sum_i 1(A_i=a)w_i}.
\]

Weighted SMD:

\[
SMD_j^w
=\frac{\bar X_{j,1}^{w}-\bar X_{j,0}^{w}}{s_j}.
\]

The standardization denominator should usually remain fixed before and after adjustment so that balance improvements are comparable.

For binary covariates, many software tools report raw differences in proportions or standardized differences. Be clear which is used.

## 8. Variance Ratio

For continuous covariates,

\[
VR_j=\frac{s_{j,1}^2}{s_{j,0}^2}
\]

or its weighted analog. Values near 1 indicate similar dispersion. Mean balance alone can hide distributional imbalance.

## 9. Effective Sample Size

For a set of weights in group \(g\),

\[
ESS_g=\frac{(\sum_{i:A_i=g}w_i)^2}{\sum_{i:A_i=g}w_i^2}.
\]

If weights are uniform, ESS equals the nominal sample size. If a few weights dominate, ESS can be far smaller.

## 10. Matching Estimators

A simple 1:1 ATT nearest-neighbor matching estimator is

\[
\widehat\tau_{ATT}^{match}
=\frac{1}{n_T}\sum_{i:A_i=1}\left(Y_i - Y_{m(i)}\right),
\]

where \(m(i)\) is the matched control for treated unit \(i\).

For matching with replacement, a control may be used multiple times, and outcome analysis should respect matching weights/reuse.

For \(1:k\) matching,

\[
\widehat\tau_{ATT}^{match}
=\frac{1}{n_T}\sum_{i:A_i=1}\left(Y_i - \frac{1}{k_i}\sum_{j\in\mathcal M(i)}Y_j\right).
\]

If calipers drop treated units, replace \(n_T\) by the number of matched treated units and state the restricted estimand.

## 11. Calipers and Common Support

A caliper restricts matches to satisfy

\[
d(i,j) \le c,
\]

where \(d(i,j)\) may be absolute difference in propensity score, logit propensity score, Mahalanobis distance, or another distance.

A common starting point is

\[
c = 0.2 \times SD\{\operatorname{logit}(\hat e(X))\}.
\]

This is a heuristic from simulation studies, not a universal requirement. Always report how many units are discarded and whether balance improves.

## 12. Entropy Balancing

Entropy balancing chooses weights, often for controls in an ATT analysis, to minimize a divergence from base weights subject to balance constraints:

\[
\min_{w_i} \sum_{i:A_i=0} w_i\log(w_i/q_i)
\]

subject to

\[
\sum_{i:A_i=0}w_i f_k(X_i)=\bar f_{k,T}
\]

for selected moments \(f_k(X)\), and usually \(\sum w_i=1\). It can exactly balance specified moments if feasible, but exact balance on measured moments does not address unmeasured confounding.

## 13. CBPS

Covariate balancing propensity score methods estimate propensity scores while imposing balance conditions. The goal is not merely to predict treatment, but to estimate a score that yields covariate balance after weighting.

## 14. Interpretation Guardrail

A successful matching/weighting analysis supports this kind of statement:

> Under consistency, no interference, conditional exchangeability given measured pre-treatment covariates, and positivity in the retained target population, the adjusted contrast estimates [estimand].

It does not support:

> Balance was achieved, so the estimate is definitely causal.

Balance is necessary but not sufficient.
