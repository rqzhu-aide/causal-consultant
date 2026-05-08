# Design Router

Use this reference when the main skill needs to shortlist causal routes or compose method subskills. The source of truth remains the main `SKILL.md`, the four foundation evaluator records, and the lean `project.yaml`.

## Routing Principles

1. Start from the user's decision, estimand, deliverable, data status, and claim strength.
2. Use `03-design-planner` to propose route hypotheses and `04-dag-builder` to audit causal logic.
3. Use `02-data-technician` as the Data Technician to check whether the route is observable or constructible and which method families are technically feasible.
4. Treat method subskills as a role-based stack, not a flat package menu.
5. Prefer the strongest supported design route over the most sophisticated estimator.
6. Before substantial method execution, use Data Technician method-fit suggestions to distinguish data-compatible, fragile, and blocked method families.
7. If no route can support the intended causal claim, recommend descriptive, predictive, sensitivity, data-collection, fallback, or user-directed options.

## Role-Based Composition

Compose subskills in this order:

1. **Primary route/design family**: one of `05`, `06`, `10`, `11`, `12`, `13`, `14`, `16`, `17`, `19`, or `21`.
2. **Optional estimation/diagnostic support**: `07` for matching/weighting/balance; `08` for AIPW/TMLE/DML/orthogonal ML.
3. **Optional target/outcome/decision module**: `09` for HTE/CATE/policy; `15` for survival/competing risks.
4. **Optional discovery module**: `18` for graph discovery, usually exploratory until audited by `04`.
5. **Reporting layer**: `20` for plans, results, limitations, and reproducibility.

## Primary Route Triggers

| Situation | Primary route | Common companion modules |
|---|---|---|
| Randomized assignment, A/B test, randomized rollout, trial | `05-randomized-experiments` | `13` for noncompliance, `15` for survival, `17` for spillovers, `09` for CATE |
| One main observational treatment time with measured confounders | `06-point-treatment-observational` | `07`, `08`, `09`, `15`, `16` |
| Time-varying treatment/confounding or dynamic regimes | `10-longitudinal-gmethods` | `08`, `09`, `15` |
| Panel/policy adoption with pre/post periods | `11-did-event-study` | `09`, `14`, `20` |
| Cutoff or threshold assignment | `12-regression-discontinuity` | `13` for fuzzy RD, `09` for heterogeneity |
| Instrument or encouragement design | `13-instrumental-variables` | `05`, `12`, `08`, `19`, `21` |
| One/few treated aggregate units or intervention time series | `14-synthetic-control-time-series` | `11`, `20` |
| Mechanism, direct/indirect effect, pathway | `16-mediation` | primary treatment route, `15`, `19` |
| Spillovers, peer effects, networks, contamination | `17-interference-spillovers` | primary treatment route, `09`, `15` |
| Genetic/omics causal evidence | `19-causal-genomics` | `13`, `16`, `21` |
| Negative controls, proxy variables, proximal causal inference | `21-negative-controls-proximal` | `04`, `06`, `08`, `20` |

## Support And Modifier Triggers

- Activate `07-matching-weighting-balance` when the selected route needs propensity scores, matching, weighting, overlap diagnostics, or balance reporting.
- Activate `08-doubly-robust-ml` when the selected route needs AIPW, TMLE, DML, cross-fitting, or flexible nuisance models after identification is plausible.
- Activate `09-heterogeneous-effects-policy` when the user asks for subgroup effects, CATE, individualized treatment rules, prioritization, uplift, or policy value.
- Activate `15-survival-competing-risks` when the outcome is time-to-event, censoring or competing risks matter, or the target is risk/RMST/survival probability.
- Activate `18-causal-discovery` for learning or comparing graph hypotheses. Keep claims exploratory until `04-dag-builder` and the main gate support them.
- Activate `20-reporting-interpretation` when the user needs plans, methods, results, limitations, claim calibration, or reproducibility.

## Route Status Labels

For each route hypothesis, use:

- `feasible`: data, design, and causal logic can support the selected route after any nonblocking deferrals.
- `promising`: route may work, but key checks are pending.
- `fragile`: route may proceed only with major caveats or sensitivity checks.
- `blocked`: route cannot support the intended claim without changes.
- `fallback`: weaker or safer route if the primary route fails.
- `user-directed`: user chooses to proceed despite incomplete support.

## Routing Output

Keep output compact:

```yaml
route_id: null
route_label: null
role_stack:
  primary_route: null
  support_modules: []
  target_modules: []
  discovery_modules: []
  reporting_modules: []
status: "feasible | promising | fragile | blocked | fallback | user-directed | unknown"
estimand: null
claim_strength: null
required_data_checks: []
required_dag_checks: []
package_fit_questions: []
recommended_next_action: null
failure_or_fallback_reason: null
```

Detailed route comparison belongs in `artifacts/` or `analyses/`; `project.yaml` should keep only active route hypotheses, selected route, limitations, and handoff summaries.
