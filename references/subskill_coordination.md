# Subskill Coordination

Use this backstage reference when method/task subskills may help. Candidate subskills are recall hints until `method_lead` triages them.

## Module Types

Method/task subskills are bounded specialist modules. They are not independent consultants, do not speak to the user, do not own gates, and do not maintain permanent YAML sections.

- `design_route`: asks what causal comparison is valid, such as randomized assignment, observational exposure, longitudinal regimes, DiD, RD, IV, synthetic control, interference, or negative-control/proximal designs. Design-route subskill numbers start at `07`.
- `target_goal`: asks what target or decision the user wants, such as heterogeneous/subgroup/strata effects, single-point treatment rules, mediation, dose-response effects, transportability/generalizability, or dynamic treatment policies. Target-goal subskill numbers start at `20`.
- `implementation_support`: asks how to estimate, diagnose, or implement a chosen design and target, such as matching, weighting, doubly robust estimation, DML, survival/competing-risk analysis, nuisance models, or flexible learners. Implementation-support subskill numbers start at `30`.

Keep heterogeneity, point rules, and dynamic policies distinct:

- heterogeneity asks "for whom is the effect different?";
- point rules ask "who should receive treatment now?";
- dynamic policies ask "what strategy should adapt over time?"

## Advisory Lookup

When specialist method support is useful, use candidate subskills as recall hints, not as a routing command. In `project_exploration`, the lead consultant may notice candidates directly from the conversation and YAML, but should not make durable method choices without `method_lead` triage.

In `causal_specification`, optionally run:

```bash
python scripts/recommend_subskills.py --project <project-state.yaml> --phase <current_phase> --signals "<interpreted signal>" --top-n 5
```

Build `--signals` from interpreted project evidence, not from raw keyword collection. Include the user goal, design/data structure, treatment or exposure, outcome, timing, population, main blockers, and candidate framework ideas. Preserve important uncertainty in plain language, such as "unclear timing" or "possible panel structure." Use `--phase` when the current phase is known or when the project file might be stale.

The helper returns advisory specialist candidates and marks whether each is available. Scored recommendations exclude the core reviewers and report writer by default because those roles already run through the main workflow. Use `--include-team-modules` only when debugging or intentionally checking the full catalog. The helper cannot activate a subskill, choose claim strength, validate identification, inspect data, or overrule reviewer blockers.

## Method Lead Triage

The lead consultant should read `method_lead`'s triaged recommendation, not the raw lookup list. Pass candidates to `method_lead` after `method_lead` reads `domain_expert`, `data_analyst.method_support`, `team_synthesis`, `analysis_state`, and relevant project state.

Record only triaged results:

- plausible candidates in `method_lead.tools_and_methods.candidate_method_subskills`;
- actual selections in `method_lead.tools_and_methods.selected_method_subskills`;
- tempting but invalid, unavailable, or not-yet-supported options in `method_lead.tools_and_methods.blocked_or_not_used_options`;
- user-facing plausible recommendations in `analysis_state.recommended_method_job_subskills`;
- actual activations in `analysis_state.activated_method_job_subskills` and `subskill_records`.

Expose only the decision-relevant user-facing result, usually one to three meaningful options plus the next information need.

## Data Evidence Handoff

`data_analyst.method_support` is data evidence for `method_lead`, not final method choice.

Use these classifications when helpful:

- `directly_supported`: required variables, timing, unit structure, and support are visible or already inspected.
- `constructible_with_processing`: feasible after a concrete preprocessing, linkage, feature construction, reshaping, or restriction step.
- `proxy_only`: the data contain imperfect proxies, not the requested construct.
- `needs_inspection`: support cannot be judged until a bounded check is run.
- `unsupported`: required data elements are absent or not constructible from current information.
- `contradicted`: inspected data conflict with the candidate's required timing, unit, variable role, or support logic.

If data evidence changes constructability, timing, support, or feasibility, route a bounded `method_lead` follow-up before selecting or activating a method/task subskill.

## Activation Records

Create a durable `subskill_records` entry only when a specialist subskill is activated or produces durable feedback. Use `assets/method_job_subskill_record_template.yaml` for method/task subskills, and validate standalone records with `scripts/validate_subskill_record.py` when useful.

Do not create permanent YAML sections for method/task subskills. Their durable outputs should live in compact records, artifacts, code, tables, figures, or report modules.

## Subskill Pool

Artifact folder: `subskills/`

- `01-domain-expert`
- `02-data-analyst`
- `03-method-lead`
- `05-report-writer`
- `06-causal-discovery`
- `07-randomized-assignment-and-experiments`
- `08-single-time-observational-exposure`
- `09-longitudinal-gmethods`
- `10-did-event-study`
- `11-regression-discontinuity`
- `12-instrumental-variables`
- `13-synthetic-control-time-series`
- `14-interference-spillovers`
- `15-negative-controls-proximal`
- `20-heterogeneous-effects`
- `21-point-treatment-rules`
- `22-mediation`
- `23-dose-response-effects`
- `24-transportability-generalizability`
- `25-dynamic-treatment-policies`
- `30-matching-weighting-balance`
- `31-doubly-robust-estimation`
- `32-double-machine-learning`
- `33-survival-competing-risks`
