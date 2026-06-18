# Route: data_audit

Use this route to audit whether the project has well-defined, valid data inputs
for causal framing, analysis planning, or execution. Do not produce a standalone
user-facing answer; provide internal findings for `team_lead` to synthesize.

## Plan Entry

Read `next_step_plan` before route work.

Expected entry:

```yaml
next_step_plan:
  - id: data_audit
```

If no `next_step_plan` entry has `id: data_audit`, do not proceed with data
audit work.

Use the current user message, live state, and any inspectable files as the
assignment. Do not update `next_step_plan` or `project_summary`; `team_lead`
handles aggregate cleanup after synthesis.

## Causal Data Audit Scope

Audit data facts that could change the causal target, analysis route, claim
boundary, or execution feasibility:

- data source existence, inspectability, grain, and unit of observation;
- exposure/treatment/intervention definition, timing, and support;
- outcome definition, outcome timing, censoring, and event/support counts;
- baseline covariates, post-treatment variables, mediators, colliders, and
  variables measured after the outcome;
- inclusion/exclusion criteria, selection, attrition, missingness, and missing
  data patterns that could change the estimand;
- repeated measures, clustering, household/site/provider dependence, panels,
  matched sets, or network/spillover structure;
- leakage risks from post-outcome variables, post-treatment variables,
  preprocessing before splitting, duplicate subjects, or outcome-informed
  feature construction;
- support/positivity problems, sparse strata, unsupported subgroups, or extreme
  treatment/exposure imbalance.

When actual data are available and fuller inspection is useful, summarize only
decision-relevant findings in YAML and put full inventories, missingness tables,
support diagnostics, profiling output, or reshape notes in audit artifacts.

## Data Facts Updates

Write durable data context only to `data_facts`. Keep it compact and
causal-analysis oriented; it is live decision memory, not a data dictionary.

Update supported fields:

- `last_updated`: local update time in `HH:MM:SS` format.
- `data_checked`: `passing`, `limited`, `imagined`, or `blocked`; leave
  `not_checked` only if no data audit work occurred.
- `data_sources`: data files, tables, or user-provided descriptions reviewed.
- `audit_scope`: compact description of what was checked.
- `unit_of_observation`: analysis grain and any mismatch with assignment,
  exposure, or outcome grain.
- `variables`: key variable groups, causal roles, timing-critical fields, and
  blockers only.
- `structure_notes`, `timing_notes`, `dependency_notes`, `leakage_risks`,
  `missingness_notes`, `support_notes`, `validity_questions`: compact bullets
  that affect claim support or analysis routing.
- `exploratory_runs`, `artifact_refs`: only when actual audit output was
  created.

Use `data_checked: passing` only when source, unit, exposure/treatment, outcome,
timing, key variables, and major leakage/missingness/support blockers are
resolved or explicitly bounded for the requested analysis. Use `limited` when
some useful planning or bounded review is possible but important data facts are
missing. Use `imagined` only when no actual data or verified data description is
available and the route records a hypothetical structure for planning; never
treat `imagined` as analysis-ready. Use `blocked` when data structure, timing,
leakage, missingness, support, or unavailable files prevent valid execution.

## Council Chamber Updates

Refresh only `council_chamber.data_audit`.

Set:

- `last_updated`: local update time in `HH:MM:SS` format.
- `current_status`: one short sentence on what the audit could verify.
- `summary`: compact synthesis of data support, blockers, or usable facts.
- `questions_for_user`: 0-3 questions or choices that would improve the next
  decision.
- `feedback_to_route`: 0-3 route-facing suggestions, such as useful domain,
  causal, discovery, or analysis follow-up.

Keep chamber feedback short, decision-facing, grounded in `data_facts` or
current uncertainty, and free of schema labels. Use it for data support,
blockers, reshaping needs, timing concerns, leakage risks, support limitations,
or immediately useful member follow-up. Recommend another member, such as
`domain_expert` or `causal_check`, only when the current state gives that member
something concrete to inspect, clarify, or decide. If the missing ingredient is
user-provided material, name that material need plainly.

## Audit Outputs

`data_audit` may create a durable audit artifact only when actual data or
inspectable files exist and a useful audit output is created.

Use artifacts for exhaustive detail: full column inventories, profiling tables,
missingness tables, support diagnostics, reshape notes, scripts, notebooks, or
generated audit reports. `data_facts` should hold only compact interpretation
and artifact references.

When any script, notebook, table, figure, or exploratory audit output is
created:

1. Save the output under one meaningful project subfolder directly under
   `output/`, such as `output/data_audit_readiness` or
   `output/missingness_overlap_audit`.
2. Record a compact run item in `data_facts.exploratory_runs` with the run time,
   work scope, input sources, diagnostics performed, result summary, and output
   paths.
3. Record output paths in `data_facts.artifact_refs`.
4. Append one `artifact_records` entry with `route: data_audit`, `location`,
   `created_at`, and a short summary.

Do not create `artifact_records` entries for verbal audits that did not create a
new output location.

## Boundaries

This route audits data readiness and may run bounded profiling or audit code
when inspectable data exist. It does not choose the final causal method,
validate a causal claim, or execute the approved causal analysis.

Do not let generic profiling crowd out causal-data risks: unit, timing, leakage,
support, missingness, dependencies, and variable roles are the priority.
