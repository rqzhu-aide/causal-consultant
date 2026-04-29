# Workflow: Causal Mediation

## Goal

Use for direct effects, indirect effects, mechanisms, mediators, path-specific effects, and controlled direct effects.

## Intake Checklist

- [ ] Is the target total effect, direct effect, indirect effect, or controlled direct effect?
- [ ] Is mediator measured after treatment and before outcome?
- [ ] Are mediator-outcome confounders measured?
- [ ] Could treatment affect mediator-outcome confounders?
- [ ] Are natural-effect assumptions plausible?

## Estimand Checklist

- total effect
- natural direct effect
- natural indirect effect
- controlled direct effect
- interventional direct/indirect effect

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

- parametric mediation
- g-computation
- natural effect models
- interventional effects
- sequential g-estimation

## Diagnostics

- temporal DAG
- mediator timing
- mediator-outcome confounding assessment
- sensitivity to sequential ignorability
- interaction checks

## Common Packages

- R mediation
- R medflex
- R CMAverse
- R regmedint

## Failure Modes

- mediator measured before treatment
- post-treatment confounder ignored
- natural effects presented without cross-world assumptions
- adjusting for mediator when user wanted total effect

## Suggested Response Pattern

```markdown
I would treat this as a [causal-mediation] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
