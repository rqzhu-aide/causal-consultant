# Estimands

An estimand is the target causal quantity. The agent should make the estimand explicit before choosing an estimator.

## Potential Outcomes Notation

Let `A` be treatment, `Y` be outcome, and `X` be pre-treatment covariates.

For binary treatment:

```math
Y(1), Y(0)
```

are the potential outcomes under treatment and control.

For a treatment regime `g`:

```math
Y^g
```

is the potential outcome under regime `g`.

## Common Point-Treatment Estimands

### Average Treatment Effect

```math
ATE = E[Y(1) - Y(0)]
```

Interpretation: average effect in the target population.

### Average Treatment Effect on the Treated

```math
ATT = E[Y(1) - Y(0) \mid A=1]
```

Interpretation: average effect among units that actually received treatment.

### Average Treatment Effect on Controls

```math
ATC = E[Y(1) - Y(0) \mid A=0]
```

Interpretation: average effect if controls had instead been treated.

### Conditional Average Treatment Effect

```math
CATE(x) = E[Y(1) - Y(0) \mid X=x]
```

Interpretation: effect for units with covariates `x`.

### Group Average Treatment Effect

```math
GATE(g) = E[Y(1) - Y(0) \mid G=g]
```

Interpretation: effect in a pre-specified subgroup.

## Alternative Effect Scales

For binary outcomes:

```math
RD = P(Y(1)=1) - P(Y(0)=1)
RR = P(Y(1)=1) / P(Y(0)=1)
OR = \frac{P(Y(1)=1)/(1-P(Y(1)=1))}{P(Y(0)=1)/(1-P(Y(0)=1))}
```

Prefer risk difference or risk ratio when the scientific question is about absolute or relative risk. Avoid interpreting noncollapsible odds ratios or hazard ratios as simple causal risk ratios.

For continuous outcomes:

```math
MD = E[Y(1)] - E[Y(0)]
```

For count outcomes:

- rate difference;
- rate ratio;
- mean count difference.

For survival outcomes:

```math
\Delta_S(t) = S_1(t) - S_0(t)
```

```math
\Delta_{RMST}(\tau) = \int_0^\tau \{S_1(t) - S_0(t)\}\,dt
```

For competing risks:

```math
\Delta_{CIF,k}(t) = F_{1k}(t) - F_{0k}(t)
```

where `F_{ak}(t)` is the cumulative incidence of event type `k` under treatment `a`.

## Instrumental Variable Estimands

With a valid binary instrument `Z`, treatment `A`, and outcome `Y`, the local average treatment effect is:

```math
LATE = E[Y(1)-Y(0) \mid A(1) > A(0)]
```

Interpretation: average effect among compliers whose treatment status is changed by the instrument.

Do not interpret LATE as ATE unless additional assumptions justify it.

## Longitudinal and Dynamic Regime Estimands

For a static treatment regime `a_0, a_1, ..., a_T`:

```math
E[Y^{a_0,a_1,\ldots,a_T}]
```

For a dynamic regime `g`, where treatment depends on evolving history:

```math
\psi(g) = E[Y^g]
```

For a modified treatment policy `d`, especially useful for continuous or multivariate treatments:

```math
\psi(d) = E[Y^{d(A,W)}]
```

## Mediation Estimands

Let `M(a)` be mediator value under treatment `a`.

Natural direct effect:

```math
NDE = E[Y(1, M(0)) - Y(0, M(0))]
```

Natural indirect effect:

```math
NIE = E[Y(1, M(1)) - Y(1, M(0))]
```

Controlled direct effect at mediator value `m`:

```math
CDE(m) = E[Y(1,m) - Y(0,m)]
```

Mediation estimands need stronger cross-world or interventional assumptions. The skill should ask whether these assumptions are plausible.

## Policy Learning Estimands

For a treatment rule `d(X)`:

```math
V(d) = E[Y(d(X))]
```

If lower outcomes are better, define value accordingly. Always specify whether the policy assigns treatment to all, none, or a constrained fraction.

## Estimand Selection Questions

Ask:

1. Is the scientific goal average population impact, effect among treated, effect among controls, or subgroup/personalized effects?
2. Is the outcome scale clinically meaningful as a mean difference, risk difference, risk ratio, survival contrast, RMST contrast, or another measure?
3. Is treatment binary, multivalued, continuous, or time-varying?
4. Is the mechanism/pathway of interest, or the total effect?
5. Is there a policy decision threshold or resource constraint?

## Estimand Output Template

```markdown
## Estimand

Target estimand:
Formal definition:
Target population:
Treatment regime:
Comparator regime:
Outcome scale:
Follow-up time:
Why this estimand matches the scientific question:
What this estimand does not answer:
```
