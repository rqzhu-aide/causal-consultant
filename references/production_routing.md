# Production Routing

Use this reference only when the main skill needs to choose method/job subskills or production reviewers after the foundation gate is ready. It is not a method textbook. Each method/job subskill owns its own detailed assumptions, diagnostics, software notes, and failure modes. Causal Discovery is an any-phase sidecar; use the main `SKILL.md` discovery-sidecar rule when graph discovery, graph comparison, variable screening, or discovery-only deliverables are requested.

## Routing Rule

Prefer the strongest supported design route over the most sophisticated estimator. The main skill chooses a small reviewer set that could change the next action, records it in `analysis.production_loop.selected_reviewers`, and summarizes the result before speaking to the user.

Do not load all method/job subskills to compare options. Use this routing map and the current project state to shortlist, then load only the selected primary route and any necessary support modules.

Method/job subskills do not open gates and do not own permanent blank YAML sections. When activated, they append or update one compact `subskill_analyses` record.

## Production Communication Contract

Use one canonical handback location for each production reviewer type:

- Activated method/job subskills write one compact `subskill_analyses` record. Discovery sidecar records are optional and should not duplicate full feedback in `analysis.production_loop.reviewer_summaries`.
- Data Technician and Report Writer in production-reviewer mode write compact entries in `analysis.production_loop.reviewer_summaries`, because they do not own activated method/job chunks.
- Report Writer also updates its unique `analysis.report_writer_20` section when selected.
- The main skill owns `analysis.production_loop`, `production_gate`, `analysis.discovery_sidecar`, `analysis.recommended_diagnostics`, `analysis.recommended_method_job_subskills`, `analysis.activated_method_job_subskills`, and user-facing synthesis. Production reviewers recommend changes; the main skill applies them.

## Method/Job Subskill Editing Standard

Each method/job subskill should answer five production questions.

1. **Activated YAML record:** say exactly what this subskill writes into its `subskill_analyses` chunk: `subskill_id`, `role`, `status`, `activation_reason`, `selected_route_id`, `inputs_reviewed`, `outputs_created`, `diagnostics_reviewed`, `limitations`, `feedback_for_main_skill`, `requests_for_main_skill`, `readiness`, `blocking_signal`, `recommended_next_action`, and `artifact_paths`.
2. **Production work before the gate:** say what packages, models, code templates, and post-fit diagnostics it should consider before `production_gate.status` can become `ready`.
3. **Feedback to the main skill:** say what compact next-state summary belongs in `feedback_for_main_skill`, what user question or preference may be needed next, and which main-owned YAML fields the reviewer recommends changing.
4. **Report Writer handoff notes:** say what method-specific estimand, result, diagnostic, artifact, limitation, and claim-language details Report Writer needs. Keep this as a checklist, not prose examples.
5. **Gate/readiness decision rules:** say when to recommend `return_to_foundation`, when to stay in production with a weaker claim, and when materials are ready for production-gate handoff.

Subskills should keep detailed scripts, plots, diagnostics, tables, and memos in `analyses/` or `artifacts/`; YAML records should stay compact. Full report-writing examples belong in `subskills/20-report-writer/references/examples.md`, not in method/job subskills.

## Common Production Reviewers

| Situation | Primary reviewer | Common companions |
|---|---|---|
| Randomized assignment, A/B test, randomized rollout, trial | `05-randomized-experiments` | `13-instrumental-variables` for noncompliance, `15-survival-competing-risks`, `17-interference-spillovers`, `09-heterogeneous-effects-policy` |
| One main observational treatment time with measured pre-treatment confounders | `06-point-treatment-observational` | `07-matching-weighting-balance`, `08-doubly-robust-ml`, `09-heterogeneous-effects-policy`, `15-survival-competing-risks`, `16-mediation` |
| Matching, weighting, balance, overlap, propensity scores | `07-matching-weighting-balance` | `06-point-treatment-observational`, `08-doubly-robust-ml`, `09-heterogeneous-effects-policy`, `15-survival-competing-risks` |
| AIPW, TMLE, DML, flexible nuisance models, orthogonal ML | `08-doubly-robust-ml` | `06-point-treatment-observational`, `07-matching-weighting-balance`, `09-heterogeneous-effects-policy` |
| Heterogeneous effects, CATE/GATE, treatment rules, policy value | `09-heterogeneous-effects-policy` | primary route module, `08-doubly-robust-ml` |
| Time-varying treatment or dynamic regimes | `10-longitudinal-gmethods` | `08-doubly-robust-ml`, `09-heterogeneous-effects-policy`, `15-survival-competing-risks` |
| Panel or policy adoption with pre/post periods | `11-did-event-study` | `09-heterogeneous-effects-policy`, `14-synthetic-control-time-series` |
| Cutoff or threshold assignment | `12-regression-discontinuity` | `13-instrumental-variables` for fuzzy RD, `09-heterogeneous-effects-policy` |
| Instrument or encouragement design | `13-instrumental-variables` | `05-randomized-experiments`, `12-regression-discontinuity`, `08-doubly-robust-ml`, `19-causal-genomics`, `21-negative-controls-proximal` |
| One/few treated aggregate units or intervention time series | `14-synthetic-control-time-series` | `11-did-event-study` |
| Time-to-event outcomes, censoring, competing risks | `15-survival-competing-risks` | primary route module |
| Direct, indirect, pathway, or mechanism effects | `16-mediation` | primary route module, `15-survival-competing-risks`, `19-causal-genomics` |
| Interference, spillovers, networks, contamination | `17-interference-spillovers` | primary route module, `09-heterogeneous-effects-policy`, `15-survival-competing-risks` |
| Genetic or omics causal evidence | `19-causal-genomics` | `13-instrumental-variables`, `16-mediation`, `21-negative-controls-proximal` |
| Negative controls, proxy variables, proximal causal inference | `21-negative-controls-proximal` | `04-dag-builder`, `06-point-treatment-observational`, `08-doubly-robust-ml` |

Select `02-data-technician` during production when data construction, timing, preprocessing, diagnostics feasibility, package feasibility, or reproducibility artifacts could change the next action. Data Technician's production handback belongs in `analysis.production_loop.reviewer_summaries`, with `foundation_readiness_effect` set to `unchanged`, `narrowed`, `recheck_needed`, or `unknown`; do not treat a passed production check as foundation-gate readiness.

Select `20-report-writer` during production when reportability, claim language, figure/table choice, audience framing, diagnostic presentation, or presentation structure could change the next action. Activate it for full handoff only after `production_gate.status: ready`.

Method/job subskills own method-specific reporting handoff notes. Report Writer owns prose, diagnostic-review formatting, the final report structure template, presentation consulting, and final handoff checks. When both are selected in production, the main skill should ask the method/job subskill for method-specific materials first, then ask Report Writer to assess reportability and presentation.

## Causal Discovery Sidecar

`18-causal-discovery` is a sidecar, not a production reviewer or normal effect-estimation route. Activate it only through `analysis.discovery_sidecar`, not `analysis.production_loop.selected_reviewers`, when graph hypotheses, graph comparison, variable screening, discovery diagnostics, or a discovery deliverable could change the next action or produce useful exploratory material.

Discovery output should remain inert unless the main skill routes it through an existing owner. Use `02-data-technician` for feature, constructability, leakage, missingness, or preprocessing implications; `03-design-planner` for route, comparator, estimand, design, or fallback implications; `04-dag-builder` for graph, timing, variable-role, adjustment, identification, or causal-logic implications; and `20-report-writer` for report-only appendix, framing, or exploratory-language implications. Discovery-only deliverables may be materials-ready with exploratory wording, but that does not imply production-gate readiness for an effect claim.

## Review Purposes

Use `analysis.production_loop.review_purpose` to keep the request narrow:

Keep `analysis.production_loop.review_purpose` as `null` until production review is actually active. Once a production reviewer or method/job subskill is selected, use one concrete value from this list; do not write a placeholder value.

- `method_selection`: compare candidate method/job reviewers.
- `implementation_plan`: define estimand, inputs, code path, diagnostics, and fallback.
- `first_pass`: support or inspect initial execution.
- `diagnostics`: check assumptions, balance, overlap, pre-trends, falsification, censoring, sensitivity, robustness, or reproducibility.
- `sensitivity`: decide which sensitivity analyses matter for claim strength.
- `route_fit`: decide whether the method still matches the route.
- `package_fit`: decide whether available software can implement the intended analysis without changing the question.
- `material_polish`: check tables, plots, estimates, captions, and limitations.
- `presentation_review`: check audience framing and claim language.
- `production_gate_readiness`: decide whether Report Writer handoff is supported.
- `foundation_recheck`: decide whether production found a flaw that must return to foundation review. Production reviewers signal this through `blocking_signal.requires_previous_phase_recheck`; the main skill owns the canonical `analysis.production_loop.foundation_recheck` record.

## Production Handback

A method/job subskill handback should be compact:

```yaml
subskill_id: null
role: "one value from assets/workflow_enums.yaml > method_job_roles"
status: "one value from assets/workflow_enums.yaml > method_job_statuses"
activation_reason: null
selected_route_id: null
inputs_reviewed: []
outputs_created: []
diagnostics_reviewed: []
limitations: []
feedback_for_main_skill: []
requests_for_main_skill: []
readiness: "one value from assets/workflow_enums.yaml > production_loop_readiness"
blocking_signal:
  blocks_current_phase: false
  requires_previous_phase_recheck: false
  target_phase: null
  severity: "one value from assets/workflow_enums.yaml > blocking_signal_severity"
  reason: null
  affected_sections: []
recommended_next_action: "one value from assets/workflow_enums.yaml > main_actions"
artifact_paths: []
```

Data Technician and Report Writer production-reviewer summaries should be compact:

```yaml
reviewer_id: "02-data-technician | 20-report-writer"
phase_context: "production"
review_purpose: "one value from assets/workflow_enums.yaml > production_review_purpose"
production_readiness: "one value from assets/workflow_enums.yaml > production_loop_readiness"
foundation_readiness_effect: "one value from assets/workflow_enums.yaml > foundation_readiness_effect"
summary: null
blocking_signal:
  blocks_current_phase: false
  requires_previous_phase_recheck: false
  target_phase: null
  severity: "one value from assets/workflow_enums.yaml > blocking_signal_severity"
  reason: null
  affected_sections: []
recommended_next_action: "one value from assets/workflow_enums.yaml > main_actions"
artifact_paths: []
```

If a production reviewer finds a fatal foundation problem, recommend `return_to_foundation`; the main skill decides whether to revert the phase and which foundation evaluators to refresh.
