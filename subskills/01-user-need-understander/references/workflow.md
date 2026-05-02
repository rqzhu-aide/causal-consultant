# Workflow: User Need Understanding

## Goal

Use this workflow at the start of a causal consulting task. The goal is to understand the user's real need and route to the right next step without prematurely choosing a model.

## Intake Checklist

- [ ] What does the user want to accomplish?
- [ ] Is the task estimation, method choice, data inspection, study design, interpretation, reporting, code, or learning?
- [ ] What decision or scientific question motivates the request?
- [ ] What are the treatment/exposure, comparator, outcome, target population, and time horizon?
- [ ] Does the user have data now?
- [ ] If data exist, what format and structure do they appear to have?
- [ ] If no data exist, what future design choices are still available?
- [ ] What deliverable does the user need?
- [ ] What assumptions or details block the next step?

## Route Logic

| User situation | Next route |
|---|---|
| Has data or files | `02-user-data-inspector` |
| Unsure what variables mean or what to adjust for | `03-dag-builder` |
| No data yet and wants to plan | `04-design-planner` |
| Clear randomized experiment | `05-randomized-experiments` |
| Clear observational point treatment | `06-point-treatment-observational` |
| Wants matching/weights | `07-matching-weighting-balance` |
| Wants AIPW/TMLE/DML | `08-doubly-robust-ml` |
| Wants heterogeneity or treatment policy | `09-heterogeneous-effects-policy` |
| Has time-varying treatment/confounding | `10-longitudinal-gmethods` |
| Has panel policy timing | `11-did-event-study` |
| Has cutoff assignment | `12-regression-discontinuity` |
| Has instrument/encouragement | `13-instrumental-variables` |
| Has aggregate treated unit/time series | `14-synthetic-control-time-series` |
| Has time-to-event outcome | `15-survival-competing-risks` |
| Wants mechanisms/pathways | `16-mediation` |
| Has spillovers/interference | `17-interference-spillovers` |
| Wants graph discovery | `18-causal-discovery` |
| Has genomics/omics causal question | `19-causal-genomics` |
| Needs final write-up/interpretation | `20-reporting-interpretation` |

## Suggested Response Pattern

```markdown
I understand the goal as [goal]. The causal question seems to be whether [treatment/exposure] changes [outcome] compared with [comparator] in [population] over [time].

For now I am assuming [unit/data structure/design], but I need to verify [assumptions].

The next best step is [subskill] because [reason].
```
