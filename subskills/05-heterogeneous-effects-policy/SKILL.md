---
name: heterogeneous-effects-policy
description: Use for CATE, HTE, subgroup effects, uplift modeling, treatment rules, and policy learning.
---

# Heterogeneous Effects Policy

## When to Use

- user asks who benefits
- personalized medicine
- uplift modeling
- subgroup effects
- optimal treatment rule

## First Questions

- Are subgroups pre-specified or exploratory?
- What covariates can define effect modification?
- What is the outcome utility/value scale?
- Is there a treatment budget or constraint?
- Is validation data available?

## Target Estimands

- CATE
- GATE
- policy value
- value difference
- uplift
- treatment rule performance

## Candidate Methods

- causal forests
- T/S/X/R/DR learners
- orthogonal forests
- uplift trees
- policy trees
- Qini/TOC curves

## Common Packages and Tools

- R grf
- R policytree
- Python EconML
- Python CausalML

## Required Diagnostics

- CATE distribution
- calibration
- best linear projection
- GATE table
- policy value with uncertainty
- honest validation
- TOC/Qini curves

## Red Flags

- post hoc subgroup fishing
- individual CATEs treated as precise
- policy trained/evaluated on same data without honesty
- effect modifiers measured after treatment

## Code Templates

- `scripts/R/grf_causal_forest_template.R`
- `scripts/python/econml_cate_template.py`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Heterogeneous Effects Policy Analysis Plan

- Causal question:
- Estimand:
- Data/design requirements:
- Primary method:
- Alternative method:
- Identification assumptions:
- Diagnostics:
- Sensitivity analyses:
- Packages/code templates:
- Interpretation cautions:
```

For more detail, read `references/workflow.md` in this subskill folder.
