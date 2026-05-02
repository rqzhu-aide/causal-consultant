---
name: user-need-understander
description: Use at the beginning of a causal consulting interaction to understand the user's real goal, decision context, audience, data availability, domain assumptions, desired causal claim, tolerance for uncertainty, and next-step needs before inspecting data, building a DAG, planning a study, or choosing a model.
version: 0.1.0
---

# User Need Understander

## Core Behavior

When this subskill is invoked, focus on understanding what the user actually needs, not on picking a causal method. The output should clarify the user's decision, scientific question, available evidence, desired deliverable, constraints, and what must be true for a causal analysis to be useful.

Always do these six things:

1. **Identify the user's objective.** Determine whether they want to estimate an effect, choose a method, inspect data, design a study, interpret results, write a report, debug code, or learn concepts.
2. **Translate the domain question into causal components.** Clarify intervention or exposure, comparator, outcome, target population, time horizon, unit of analysis, and decision context.
3. **Classify data availability.** Determine whether the user has data, partial data, planned data, only a paper/result, or only a conceptual question.
4. **Infer likely next subskills.** Usually route to `02-user-data-inspector` if data exist, `03-dag-builder` if assumptions/adjustment are unclear, or `04-design-planner` if no data exist.
5. **Make provisional assumptions explicit.** Use domain context to form a lightweight working interpretation, then mark what needs confirmation.
6. **Avoid premature method selection.** Do not recommend a model until the user need, data situation, target estimand, and basic structure are understood.

## Activation and Route-Out

Use this subskill when:

- the user starts a new causal project;
- the request is broad, underspecified, or mixes goals;
- the user asks "what should I do?", "what method should I use?", "can causal inference answer this?", "I have data, can you help?", or "I want to design a study";
- the task needs triage before data inspection, DAG building, or model selection.

Route after this step:

- data exist or files are provided: activate `subskills/02-user-data-inspector/`;
- variables/adjustment/assumptions are unclear: activate `subskills/03-dag-builder/`;
- no data exist and the user wants to plan: activate `subskills/04-design-planner/`;
- the user has a narrow method request with clear design: route to the relevant design/model subskill;
- the user asks for interpretation/reporting of completed analysis: route to `subskills/20-reporting-interpretation/`.

## User Need Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list.

```yaml
subskill_analyses:
  - subskill_id: "01-user-need-understander"
    status: "selected | completed | fallback"
    user_goal:
      task_type: "estimate effect | choose method | inspect data | design study | interpret results | write report | debug code | learn concept | unknown"
      domain_question: null
      decision_context: null
      audience: null
      deliverable: null
    causal_components:
      treatment_or_exposure: null
      comparator: null
      outcome: null
      target_population: null
      unit_of_analysis: null
      time_horizon: null
      desired_estimand: null
    data_situation:
      data_available: "yes | partial | planned | no | unknown"
      data_location_or_format: null
      existing_results_or_paper: null
      constraints: []
    provisional_assumptions:
      likely_design_type: null
      likely_data_structure: null
      likely_identification_challenges: []
      assumptions_to_verify: []
    next_steps:
      recommended_subskills: []
      questions_for_user: []
```

## Operating Procedure

1. Restate the user's request in one or two precise sentences.
2. Extract the causal components if possible.
3. Decide whether the immediate next job is understanding, data inspection, DAG building, design planning, method routing, or reporting.
4. Make reasonable provisional assumptions from domain context.
5. Ask only targeted questions that block the next step; otherwise proceed to the next subskill.
6. Record the working interpretation and next route.

## Output Template

```markdown
### User Need Summary

- User goal:
- Domain question:
- Treatment/exposure:
- Comparator:
- Outcome:
- Target population:
- Data situation:
- Likely design/data structure:
- Key assumptions to verify:
- Recommended next subskill:
- Blocking questions:
```

## Reference Files

For the detailed workflow, read `references/workflow.md`.
