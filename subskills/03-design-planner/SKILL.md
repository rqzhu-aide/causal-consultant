---
name: design-planner
description: Use as the concurrent backend study-design component in a causal project. Track the actual or planned design, assignment or exposure process, time zero, target and analysis populations, measurement plan, feasible and ideal designs, and how actual or hypothetical variables fit the design. Use whether data already exist, partially exist, or are conceptual; support future data collection, retrospective design critique, method routing, and educational design planning.
---

# Design Planner

## Core Behavior

When this subskill is invoked, maintain the backend study-design record for the causal project. This is the higher-level design layer that narrows feasible study and data-creation routes before the DAG builder audits identification and adjustment. This is not only for users with no data. If real data exist, use this component to reconstruct and critique the study design implied by those data. If no real data exist, use it to plan the design and data structure that would make future causal analysis possible.

The main skill usually speaks with the user. This component updates the `03-design-planner` YAML entry and feeds concise design implications to the main skill, the domain helper, the data inspector, the DAG builder, and method subskills.

Always do these six things:

1. **Clarify the design target.** Record the decision or scientific question, intervention, comparator, outcome, target population, time zero, follow-up, and intended causal claim.
2. **Describe the actual or planned design.** Track whether the project is an experiment, observational cohort, registry, panel/policy study, RD, IV/encouragement, synthetic control/time series, survival follow-up, mediation design, interference-aware design, or another structure.
3. **Map variables into the design.** Record how actual or hypothetical variables fit the design: assignment/exposure record, treatment received, eligibility, baseline covariates, IDs, time variables, outcomes, censoring/attrition, clusters, networks, mediators, instruments, and pre-period measures.
4. **Compare feasible and ideal designs.** Identify what the strongest design would require, what the current or planned design can support, and what design gaps affect causal claims.
5. **Plan future diagnostics and data collection.** Track which design choices enable later checks such as balance, overlap, pre-trends, compliance, manipulation, placebo, censoring, attrition, interference, and sensitivity checks.
6. **Feed method routing without replacing causal logic.** Design feasibility helps choose methods, but the final route should also agree with `04-dag-builder` causal logic and `02-data-inspector` data facts.

## Coordination Role

- Use the main skill state for the user's goal, desired deliverable, audience, constraints, and explanation depth.
- Use `01-domain-helper` for domain-specific feasibility constraints, measurement norms, access/privacy constraints, and common design structures.
- Use `02-data-inspector` to check whether required design variables actually exist or, if data are conceptual, what the expected schema must include.
- Use `04-dag-builder` to ensure the design supports the intended causal structure, assumptions, estimand, and adjustment or non-adjustment route.
- Feed design implications back to the main skill in practical language: what the design can support, what it cannot support yet, and what would strengthen it.

## Activation and Route-Out

Treat this subskill as a foundation component for every substantive causal project. Intensify its role when:

- the user has no dataset yet;
- the user is planning an experiment, intervention, policy rollout, observational study, registry, survey, cohort, or data collection process;
- the user asks what variables, timing, sample structure, or measurement plan would make future causal analysis possible;
- the user already has data but the design, assignment mechanism, time zero, target population, or feasible causal claim is unclear;
- the user wants to learn how designs support different causal methods.

If the user already has data and wants analysis, do not disappear. Use this component for retrospective design critique and variable-to-design mapping, then coordinate with the appropriate method subskill.

## Project Specification Entry

When a project specification is being maintained, append or update this compact entry under `subskill_analyses`. Use `assets/design_planner_entry.yaml` as the reusable template. Fill only fields that are known or decision-relevant.

```yaml
subskill_analyses:
  - subskill_id: "03-design-planner"
    status: "candidate | selected | fallback | support-route"
    fit_to_user_need: null
    design_context:
      data_existence_status_from_02: "existing | partially existing | conceptual | unknown"
      domain_context_from_01: null
      design_use: "prospective planning | retrospective design audit | educational planning | method-routing support | unknown"
      actual_or_planned: "actual | planned | hypothetical | unknown"
    planned_or_actual_estimand:
      label: null
      target_population: null
      scale: null
      interpretation: null
    candidate_designs: []
    preferred_design: null
    fallback_designs: []
    variable_to_design_map:
      eligibility_variables: []
      assignment_or_exposure_variables: []
      treatment_received_variables: []
      baseline_covariates: []
      time_zero_variables: []
      follow_up_variables: []
      outcome_variables: []
      censoring_or_attrition_variables: []
      cluster_or_group_variables: []
      network_or_spillover_variables: []
      mediator_variables: []
      instrument_or_encouragement_variables: []
      pre_period_variables: []
      missing_or_needed_variables: []
    measurement_plan: []
    timing_plan:
      time_zero: null
      baseline_window: null
      follow_up_window: null
      measurement_schedule: null
    feasibility_constraints: []
    design_gaps: []
    future_diagnostics_enabled: []
    fatal_flaws_or_major_limitations: []
    open_questions: []
```

## Design Route Planning

Use the simplest defensible design that fits the user's constraints.

| Feasible feature | Candidate route | Plan now |
|---|---|---|
| Treatment, offer, encouragement, timing, or rollout can be randomized | randomized experiment; possibly IV for noncompliance | assignment record, probabilities, randomization unit, treatment received, primary outcomes, attrition tracking |
| Randomization is not feasible but treated and comparator units can be followed from a clear time zero | observational cohort | eligibility, treatment/comparator definitions, baseline covariates, follow-up outcomes, overlap support |
| Treatment or policy adoption varies across units over time | DiD/event study | unit IDs, adoption dates, repeated pre-period outcomes, control units, no-anticipation evidence |
| Treatment assignment uses a cutoff | RD; fuzzy RD if uptake is imperfect | running variable, cutoff, treatment uptake, outcomes near cutoff, manipulation checks |
| A credible encouragement or natural experiment may shift treatment | IV | instrument source, treatment received, first-stage data, exclusion-restriction argument |
| One or few aggregate units are treated | synthetic control/time series | long pre-period outcomes, donor pool, covariates, intervention date, donor contamination checks |
| Outcome is time-to-event | survival plus primary design | time zero, event dates, censoring dates, competing events, follow-up plan |
| Mechanism is central | mediation plus primary design | treatment before mediator, mediator before outcome, mediator-outcome confounders, repeated mediator/outcome timing when needed |
| Spillovers are plausible or intentional | interference/spillovers plus primary design | network/cluster links, exposure mapping, treatment coverage, cluster/network outcomes |

## Operating Procedure

1. Restate the design-relevant version of the user's goal.
2. Determine whether the design record is based on actual data, partial evidence, or conceptual planning.
3. Define the target comparison, time zero, follow-up, target population, and analysis population.
4. Record the actual or planned assignment/exposure mechanism.
5. Map actual or hypothetical variables into the design.
6. Compare ideal, feasible, and fallback designs.
7. Identify design gaps that would weaken or block causal interpretation.
8. Record which future diagnostics the design enables or fails to enable.
9. Coordinate with `04-dag-builder` for assumptions and method-selection implications.
10. Coordinate with `02-data-inspector` for whether required variables exist or must be collected.
11. Give the main skill a compact user-facing summary and any targeted questions that would change the design route.

## Output Template

```markdown
### Causal Design Plan

#### 1. Goal and causal target
- Decision or scientific question:
- Intervention:
- Comparator:
- Outcome(s):
- Target population:
- Planned or actual estimand:

#### 2. Design status
- Data basis:
- Actual or planned design:
- Assignment/exposure mechanism:
- Time zero:
- Follow-up:
- Analysis population:

#### 3. Variable-to-design map
- Eligibility:
- Assignment or exposure:
- Treatment received:
- Baseline covariates:
- Outcomes:
- Censoring/attrition:
- Clusters/repeated measures/network:
- Missing or needed variables:

#### 4. Candidate routes
- Preferred route:
- Fallback routes:
- Main design strengths:
- Main design gaps:

#### 5. Future diagnostics and next actions
- Diagnostics enabled:
- Diagnostics not yet possible:
- Data to collect or inspect next:
- Open questions:
```
