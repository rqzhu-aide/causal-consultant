# Design Execution Contract

Use this reference from design routes only. Support routes do not load this file.

The selected design route owns the combined design/support work for `analysis_execution`. Support routes provide analytic guidance inside the selected design scope. The design route is responsible for any final `artifact_records` write, but only during approved deep execution.

## Plan Lookup

Each design route must use its own design id, usually the filename stem such as
`randomized_assignment`, `single_time_observational`, or
`difference_in_differences`.

Find the matching `next_step_plan` entry:

```yaml
- id: analysis_execution
  design: selected_design
  support: optional_support
  task: shared task
  mode: shallow | deep
  analysis_precheck: false | true
```

Use that entry's `task`, `mode`, `analysis_precheck`, and optional `support`.
If no matching `analysis_execution` entry exists, do not proceed with
design-route work.

Rules:

- Missing `analysis_precheck` means `false`.
- `analysis_precheck: false` means `mode: shallow` and preview only.
- `analysis_precheck: true` means `mode: deep` and approved execution only.
- Execute only when the active `analysis_execution` entry has
  `analysis_precheck: true` and `mode: deep`.

## Shallow Preview

When `analysis_precheck` is `false`, do not run analysis, create output folders, append `artifact_records`, or set `project_summary.analysis_output: exist`. Prepare compact readiness notes covering:

- design fit and blockers
- support-route role, if any
- data contract and required inputs
- estimand or target contrast
- required diagnostics
- planned outputs that would be created only after approval
- execution boundary and limitations

## Deep Execution

When `analysis_precheck` is `true`, run only the approved task. Keep the support route inside the design scope. Do not broaden the estimand, data, model, output, or claim beyond the approved entry.

## Artifact Records Write

Append `artifact_records` only after approved deep execution creates an output location. Do not append `artifact_records` for shallow precheck, readiness review, planning notes, or verbal-only work.

When deep execution creates output, append exactly one compact entry:

```yaml
artifact_records:
  - route: analysis_execution
    location: "output/analysis_name"
    created_at: "HH:MM:SS"
    design: selected_design
    support: optional_support_or_null
    summary: "Short summary of the work and findings, including limitations or suggested additional work."
```

The `location` value should be one meaningful subfolder directly under `output/`, not a route-specific nested path and not a timestamp-only folder. Use a short stable slug such as `output/randomized_cate_execution` or another name tied to the approved work. Keep time in `created_at` when useful. Do not list individual files in `artifact_records`; put detailed files, notes, diagnostics, and manifests inside that location if needed.

Do not update `project_summary` or `next_step_plan`; `team_lead` updates aggregate state after route work.
