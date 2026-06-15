# Route: data_audit

Use this reference to inspect whether an analysis request has well-defined and valid data inputs.

Do not produce a standalone user-facing answer. Provide internal findings for `team_lead` to synthesize.

## Plan Entry

Read `next_step_plan` before doing substantive work.

Expected entry:

```yaml
next_step_plan:
  - id: data_audit
    request: what the user asked or approved
    task: concrete data-audit assignment
    mode: shallow | deep
```

If no `next_step_plan` entry has `id: data_audit`, do not proceed with data audit work.

Use this entry's `request`, `task`, and `mode` as the assignment. Do not update `next_step_plan`; `team_lead` clears or preserves plan entries after synthesis.

Interpret `mode` as:

- `shallow`: audit data structure, timing, leakage, dependencies, missingness, support, and validity from the user's stated facts, available metadata, and any inspectable files.
- `deep`: perform the shallow audit, then run exploratory analysis for causal preparation when actual data are available, such as descriptive summaries, associations, correlations, exposure/outcome support checks, missingness patterns, simple propensity-score or treatment-model diagnostics, and other preparation diagnostics requested by the task.

Record blocked or completed work in `data_facts.data_checked`, `council_chamber.data_audit.current_status`, and relevant data-fact notes.

## Checklist

Check the following items when relevant:

1. Unit of observation.
2. Outcome definition and outcome timing.
3. Treatment, exposure, intervention, or decision variable definition and timing.
4. Covariate timing relative to the outcome, treatment, exposure, or decision point.
5. Inclusion and exclusion criteria.
6. Missingness mechanism and missingness handling.
7. Dependencies, including repeated measures, clustering, household/site/provider dependence, matched sets, longitudinal panels, or network/spillover structure.
8. Support and positivity, including exposure/treatment counts, outcome counts/events, subgroup counts, and sparse or unsupported strata.
9. Leakage risks, including post-outcome variables, post-treatment variables, duplicate subjects across splits, and preprocessing performed before splitting.
10. Train/validation/test split or cross-validation scheme.
11. Whether the requested analysis is supportable from the described data.

In `deep` mode, when data are available and it is safe to run analysis, also consider:

- exposure/outcome summaries and cross-tabs
- missingness tables and missingness-by-exposure/outcome summaries
- basic correlations or associations among candidate variables
- crude exposure-outcome associations clearly labeled as non-causal
- propensity-score or treatment-model exploratory diagnostics when an observational treatment/exposure is present
- balance, overlap, extreme-propensity, and effective-sample-size summaries when relevant
- event/censoring/support summaries for survival or longitudinal tasks

## Return Format

Prepare concise internal notes when useful on critical issues, non-critical
warnings, required questions, recommended next steps, and exploratory results or
artifact paths if analysis ran.

## Special Emphasis

For biomedical, survival, longitudinal, reinforcement-learning, personalized-medicine, or causal tasks, pay particular attention to time ordering. Variables measured after treatment assignment, after the decision point, or after the outcome should not be treated as baseline predictors unless the target estimand justifies it.

## State Updates

Update `project_state.yaml` fields under `data_facts` when supported by the user's request:

Keep `data_facts` compact. Use it as live decision memory, not a full data
dictionary. In `variables`, record only key variable groups, causal roles,
timing-critical fields, and blockers. Do not list every column or write long
per-variable notes. If a full variable inventory, missingness table, support
table, or profiling detail is useful, create or reference an audit artifact and
summarize only the decision-relevant points in YAML.

- `last_updated`: set to the local run time in `HH:MM:SS` format whenever this reference is run.
- `data_checked`: set to `passing`, `limited`, `imagined`, or `blocked` after checking whether the data facts are sufficient for the requested analysis; leave as `not_checked` only if no data audit work occurred.
- `data_sources`
- `audit_scope`
- `unit_of_observation`
- `variables`
- `structure_notes`
- `timing_notes`
- `dependency_notes`
- `leakage_risks`
- `missingness_notes`
- `support_notes`
- `validity_questions`
- `exploratory_runs`
- `artifact_refs`

## Council Chamber Write Contract

Refresh only `council_chamber.data_audit`.

Set:

- `last_updated`: local update time in `HH:MM:SS` format.
- `current_status`: one short sentence on what the data audit could verify.
- `opinions`: 1-3 compact opinion entries.

Keep opinions short, decision-facing, grounded in `data_facts` or current
uncertainty, and free of schema labels. Focus on data support, blockers, useful
reshaping, analysis options, or needed review.

When data audit finishes, be aware of the other core reviewers before finalizing
`opinions`. Recommend another member only when that review would be immediately
useful for the next decision and the current state gives that member something
concrete to inspect, clarify, or decide. Recommend other members such as
`domain_expert` or `causal_check` when they would help immediately. If the
missing ingredient is user-provided material, name that material need plainly.
Do not let team-review suggestions crowd out urgent data blockers.

Use `data_checked: passing` only when the available data description or inspected data supports the requested analysis inputs well enough to proceed: source, unit, exposure/treatment, outcome, timing, key variables, and major leakage/missingness blockers are resolved or explicitly bounded. Use `limited` when some useful planning or bounded review is possible but important data facts are missing. Use `imagined` only when no actual data or verified data description is available and the audit records a hypothetical structure for planning; never treat `imagined` as analysis-ready. Use `blocked` when data structure, timing, leakage, missingness, or unavailable files prevent valid analysis execution.

## Analysis Outputs

`data_audit` is the only route where shallow mode may create a durable artifact, and only when actual data or inspectable files exist and a useful audit output is created.

Use artifacts for exhaustive data detail: full column inventories, profiling
tables, missingness tables, support diagnostics, reshape notes, and generated
audit reports. `data_facts` should hold only the compact interpretation and
artifact references.

When any script, notebook, table, figure, or exploratory analysis output is actually created:

1. Save the output under one meaningful project subfolder directly under `output/`, such as `output/data_audit_readiness` or `output/missingness_overlap_audit`. Do not use route-specific nested folders or timestamp-only folder names.
2. Record a compact run item in `data_facts.exploratory_runs` with the run time, mode, input sources, diagnostics performed, result summary, and output paths.
3. Record the output paths in `data_facts.artifact_refs`.
4. Append one `artifact_records` entry with `route: data_audit`, `location`, `created_at`, and a short `summary` of work, findings, limitations, or suggested additional work.

Do not create `artifact_records` entries for purely verbal audits that did not create a new output location.

Do not update `project_summary` or `next_step_plan`; `team_lead` updates aggregate workflow fields after the route finishes.
