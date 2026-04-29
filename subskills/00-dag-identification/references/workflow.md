# Workflow: Causal Dag Identification

## Goal

Use for DAGs, adjustment sets, target trial framing, variable role classification, and identification before estimation.

## Intake Checklist

- [ ] What variables are known causes of treatment?
- [ ] What variables are known causes of outcome?
- [ ] Which variables are measured before treatment?
- [ ] Which variables may be affected by treatment?
- [ ] Are there selection/collider variables?
- [ ] Are there plausible instruments?

## Estimand Checklist

- backdoor-adjusted ATE/ATT
- front-door estimand if applicable
- controlled direct effect when interventions on mediators are explicit

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

- DAG elicitation
- backdoor criterion
- generalized adjustment criterion
- target trial protocol
- negative control reasoning

## Diagnostics

- variable timing table
- adjustment set justification
- unadjusted post-treatment variable list
- unmeasured confounding sensitivity plan

## Common Packages

- R dagitty
- Python DoWhy
- R pcalg for graphical criteria where appropriate

## Failure Modes

- adjusting for mediators/colliders
- conditioning on sample selection caused by treatment/outcome
- DAG treated as known when it is speculative
- vague intervention

## Suggested Response Pattern

```markdown
I would treat this as a [causal-dag-identification] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
