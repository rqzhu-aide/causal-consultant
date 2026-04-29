---
name: causal-dag-identification
description: Use for DAGs, adjustment sets, target trial framing, variable role classification, and identification before estimation.
---

# Causal Dag Identification

## When to Use

- user has a causal graph
- user asks what to adjust for
- variables need timing/role classification
- need to identify adjustment set or testable implications

## First Questions

- What variables are known causes of treatment?
- What variables are known causes of outcome?
- Which variables are measured before treatment?
- Which variables may be affected by treatment?
- Are there selection/collider variables?
- Are there plausible instruments?

## Target Estimands

- backdoor-adjusted ATE/ATT
- front-door estimand if applicable
- controlled direct effect when interventions on mediators are explicit

## Candidate Methods

- DAG elicitation
- backdoor criterion
- generalized adjustment criterion
- target trial protocol
- negative control reasoning

## Common Packages and Tools

- R dagitty
- Python DoWhy
- R pcalg for graphical criteria where appropriate

## Required Diagnostics

- variable timing table
- adjustment set justification
- unadjusted post-treatment variable list
- unmeasured confounding sensitivity plan

## Red Flags

- adjusting for mediators/colliders
- conditioning on sample selection caused by treatment/outcome
- DAG treated as known when it is speculative
- vague intervention

## Code Templates

- `scripts/python/dowhy_point_treatment_template.py`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Causal Dag Identification Analysis Plan

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
