# Quick Start for Agents

Use this file when you need the shortest possible operating procedure.

## Minimal Workflow

1. Identify what the user wants next: learn, get design help, audit data, plan analysis, draft code, interpret results, or write a report.
2. Restate the likely causal question or learning goal in the user's domain language.
3. Clarify only the treatment/intervention, comparator, outcome, time zero, follow-up, target population, and data structure details needed for the next step.
4. Keep the main skill and four backend foundation subskills active concurrently: the main skill speaks with the user and tracks goal/alignment, `01-domain-helper` tracks domain context and terminology, `02-data-inspector` tracks actual or expected data structure, `03-design-planner` tracks study design, and `04-dag-builder` tracks causal logic.
5. In the `02-data-inspector` YAML entry, set `data_existence_status` as existing, partially existing, conceptual, or unknown; then add the companion data-basis label.
6. If data do not exist yet, create a study or data-collection blueprint while keeping the data track labeled as conceptual.
7. Use `03-design-planner` to shortlist 1 to 3 plausible high-level design routes and state the key conditions for each.
8. Use `04-dag-builder` to check the causal logic, identification, adjustment implications, and method-selection implications for the shortlisted route, checked against `02` data facts and `03` design feasibility.
9. Route to one or more candidate method subskills once the rough design is known.
10. If a subskill rejects a route, record why and return to the route shortlist.
11. Build an analysis plan, diagnostics, sensitivity analyses, and code only after the route, estimand, and data suitability are clear enough.
12. Report estimates with assumptions, diagnostics, limitations, and appropriately cautious causal language.

## Minimal Clarifying Questions

Ask these if the user gives only a dataset and says "do causal inference":

1. What do you want to do next: learn, choose a design, audit the data, draft code, interpret results, or write a report?
2. What is the treatment or intervention, and what is the comparator?
3. What outcome do you want to affect, and when is it measured?
4. What is the unit of analysis and the target population?
5. Was treatment randomized, assigned by a policy/cutoff/instrument, or chosen observationally?
6. What do rows represent, and are there repeated observations, censoring, missingness, clustering, or spillovers?
7. What variables were measured before treatment that may affect both treatment and outcome?

## Minimal Output

For any proposed route or analysis, produce:

```markdown
Current mode:
Causal question or learning goal:
Existing data and data structure:
Data existence status for 02:
Data basis for 02:
Foundation components:
Domain context:
Main skill/user-facing summary:
Route shortlist:
Activated subskills:
Provisional estimand:
Key route assumptions in plain language:
Data suitability concerns:
Diagnostics or checks needed:
Next step:
Known limitations:
```

## Escalation Rule

If the user supplies enough information to make progress, do not stall with more questions. Continue with provisional assumptions and clearly label them.
