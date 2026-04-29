# Workflow: Heterogeneous Effects Policy

## Goal

Use for CATE, HTE, subgroup effects, uplift modeling, treatment rules, and policy learning.

## Intake Checklist

- [ ] Are subgroups pre-specified or exploratory?
- [ ] What covariates can define effect modification?
- [ ] What is the outcome utility/value scale?
- [ ] Is there a treatment budget or constraint?
- [ ] Is validation data available?

## Estimand Checklist

- CATE
- GATE
- policy value
- value difference
- uplift
- treatment rule performance

The agent should state which estimand is being targeted and what estimands are not being targeted.

## Analysis Planning

1. Describe the data structure and timing.
2. Define the target estimand and scale.
3. Choose a primary method from the candidate methods.
4. List required assumptions and diagnostics.
5. State what would invalidate or weaken the analysis.
6. Specify software and code templates.
7. Plan sensitivity analyses.

## Candidate Methods

- causal forests
- T/S/X/R/DR learners
- orthogonal forests
- uplift trees
- policy trees
- Qini/TOC curves

## Diagnostics

- CATE distribution
- calibration
- best linear projection
- GATE table
- policy value with uncertainty
- honest validation
- TOC/Qini curves

## Common Packages

- R grf
- R policytree
- Python EconML
- Python CausalML

## Failure Modes

- post hoc subgroup fishing
- individual CATEs treated as precise
- policy trained/evaluated on same data without honesty
- effect modifiers measured after treatment

## Suggested Response Pattern

```markdown
I would treat this as a [heterogeneous-effects-policy] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
