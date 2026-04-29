---
name: causal-mediation
description: Use for direct effects, indirect effects, mechanisms, mediators, path-specific effects, and controlled direct effects.
---

# Causal Mediation

## When to Use

- user asks how or why treatment works
- mediator/pathway
- direct/indirect effect
- mechanism
- decomposition

## First Questions

- Is the target total effect, direct effect, indirect effect, or controlled direct effect?
- Is mediator measured after treatment and before outcome?
- Are mediator-outcome confounders measured?
- Could treatment affect mediator-outcome confounders?
- Are natural-effect assumptions plausible?

## Target Estimands

- total effect
- natural direct effect
- natural indirect effect
- controlled direct effect
- interventional direct/indirect effect

## Candidate Methods

- parametric mediation
- g-computation
- natural effect models
- interventional effects
- sequential g-estimation

## Common Packages and Tools

- R mediation
- R medflex
- R CMAverse
- R regmedint

## Required Diagnostics

- temporal DAG
- mediator timing
- mediator-outcome confounding assessment
- sensitivity to sequential ignorability
- interaction checks

## Red Flags

- mediator measured before treatment
- post-treatment confounder ignored
- natural effects presented without cross-world assumptions
- adjusting for mediator when user wanted total effect

## Code Templates

- `scripts/R/mediation_template.R`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Causal Mediation Analysis Plan

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
