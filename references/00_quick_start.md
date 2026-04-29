# Quick Start for Agents

Use this file when you need the shortest possible operating procedure.

## Minimal Workflow

1. Ask: What is the treatment/intervention, comparator, outcome, time zero, follow-up, target population, and causal estimand?
2. Identify the data design: randomized, observational point treatment, longitudinal, panel/policy, RD, IV, time series, survival, mediation, interference, discovery, genomics, or mixed.
3. State the candidate identification strategy.
4. Route to one or more subskills.
5. Build an analysis plan with diagnostics and sensitivity analyses before code.
6. Report estimates with assumptions and limitations.

## Minimal Clarifying Questions

Ask these if the user gives only a dataset and says “do causal inference”:

1. What is the treatment or intervention, and what is the comparator?
2. What outcome do you want to affect, and when is it measured?
3. What is the unit of analysis and the target population?
4. Was treatment randomized, assigned by a policy/cutoff/instrument, or chosen observationally?
5. What variables were measured before treatment that may affect both treatment and outcome?
6. Are there repeated observations, censoring, missingness, clustering, or spillovers?
7. Do you want an average effect, effect among treated, subgroup/individualized effects, a dynamic regime, or another estimand?

## Minimal Output

For any proposed analysis, produce:

```markdown
Causal question:
Estimand:
Design:
Primary method:
Identification assumptions:
Diagnostics:
Sensitivity analyses:
Recommended packages/code:
Known limitations:
```

## Escalation Rule

If the user supplies enough information to make progress, do not stall with more questions. Continue with provisional assumptions and clearly label them.
