---
name: prospective-design-planning
description: Use when the user has no data yet or wants to design a future study, experiment, quasi-experiment, or data collection plan for causal analysis.
version: 0.1.0
---

# Prospective Design Planning

## Core Behavior

When this subskill is invoked, focus on helping the user design data collection or assignment before analysis code exists.

1. **Clarify the future decision or causal question.** Identify the intervention, comparison, outcome, timing, target population, and practical constraints.
2. **Compare feasible design routes.** Consider randomized experiments, encouragement designs, observational cohorts, panel/DiD, RD, synthetic control, survival follow-up, mediation, interference-aware designs, or descriptive fallback plans.
3. **Specify the data to collect.** Define units, rows, IDs, assignment or exposure records, baseline covariates, outcomes, follow-up, missingness/attrition tracking, clustering, and interference/network information when relevant.
4. **Plan for future diagnostics.** Recommend design features that will later allow balance checks, overlap checks, pre-trend checks, compliance checks, manipulation checks, placebo checks, censoring checks, or other route-specific diagnostics.

Do not recommend packages as the main output unless the user asks for simulation, mock data, power calculations, or study-design code.

## Activation and Route-Out

Use this subskill when:

- the user has no dataset yet;
- the user is planning an experiment, intervention, policy rollout, observational study, registry, survey, cohort, or data collection process;
- the user asks what variables, timing, sample structure, or measurement plan would make future causal analysis possible;
- the user wants to compare feasible causal designs before committing to data collection.

If the user already has data and wants analysis, use this subskill only for retrospective design critique or future-study recommendations, then route back to the appropriate analysis subskill.

## Project Specification Entry

When a project specification is being maintained, append or update this compact entry under `subskill_analyses`. Fill only fields that are known or decision-relevant.

```yaml
subskill_analyses:
  - subskill_id: "18-prospective-design-planning"
    status: "candidate | selected | fallback"
    fit_to_user_need: null
    planned_estimand:
      label: null
      target_population: null
      scale: null
      interpretation: null
    candidate_designs: []
    preferred_design: null
    fallback_designs: []
    minimum_data_to_collect: []
    measurement_plan: []
    timing_plan:
      time_zero: null
      baseline_window: null
      follow_up_window: null
      measurement_schedule: null
    feasibility_constraints: []
    future_diagnostics_enabled: []
    fatal_flaws_or_major_limitations: []
    open_questions: []
    subskill_specific_details:
      randomization_feasible: null
      assignment_unit: null
      analysis_unit: null
      expected_sample_size: null
      clustering_or_interference_expected: null
      missingness_or_attrition_risks: null
      prospective_data_schema: null
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
| Spillovers are plausible or intentional | interference/spillovers plus primary design | network/cluster links, exposure mapping, treatment coverage, cluster/network outcomes |

## Output Template

```markdown
### Prospective causal design plan

#### 1. Goal and causal target
- Decision or scientific question:
- Intervention:
- Comparator:
- Outcome(s):
- Target population:
- Planned estimand:

#### 2. Candidate design routes
- Route 1:
  - What it would require:
  - What data it would need:
  - Main strengths:
  - Main risks:
- Route 2:
  - What it would require:
  - What data it would need:
  - Main strengths:
  - Main risks:

#### 3. Recommended data collection plan
- Units and rows:
- Assignment or exposure records:
- Baseline covariates:
- Outcome measurement:
- Follow-up and censoring:
- Clustering, repeated measures, or interference:
- Missingness/attrition tracking:

#### 4. Future diagnostics to enable
- Randomization/compliance checks:
- Balance/overlap checks:
- Pre-trend/placebo checks:
- Censoring/missingness checks:
- Route-specific checks:

#### 5. Limitations and open decisions
- Feasibility constraints:
- Causal claims unavailable without additional data:
- Open questions:
```
