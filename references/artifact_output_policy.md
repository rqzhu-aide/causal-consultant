# Artifact Output Policy

Load this reference only when a route created or reviewed durable output,
`artifact_records` need updating, or report/analysis/discovery output status
must be set.

## Output Locations

For any created artifact, analysis output, or report output, use one meaningful
location directly under `output/`, such as `output/data_audit_readiness` or
`output/randomized_cate_execution`. Do not use route-specific nested folders or
timestamp-only locations.

Use this shared `artifact_records` shape:

```yaml
artifact_records:
  - route: data_audit | causal_discovery | analysis_execution | report_writer
    location: "output/meaningful_name"
    created_at: "HH:MM:SS"
    summary: "Brief summary of the work, findings, limits, or suggested additional work."
```

Route-specific fields may be included when useful, such as `design` and
`support` for `analysis_execution`.

## Aggregate Output Flags

When `analysis_execution` creates any analysis result, table, figure, model
output, diagnostic output, written result note, or artifact intended as
analysis output, set:

```yaml
project_summary:
  analysis_output: exist
```

Record the output location in `artifact_records`; do not list every file.

When `analysis_execution` only prepares scope/readiness feedback, do not accept
or create `artifact_records`. Scope feedback lives in
`council_chamber.analysis_execution.<design_id>`.

When `report_writer` creates or revises an HTML report or bounded report-scoped
output, set:

```yaml
project_summary:
  report_output: exist
```

Keep the durable summary in `report_assembly.draft_notes`, the format in
`report_assembly.current_format`, and any output location in `artifact_records`.

Data-audit artifacts may be recorded in `artifact_records` when actual data or
files exist and a useful audit output was created. Causal-discovery sidecar
artifacts may be recorded only when bounded discovery work creates an output.
Neither should set `project_summary.analysis_output: exist` unless the artifact
is intended as analysis output for reporting. `domain_expert` should record
source checks and domain practice in `domain_knowledge`, not create output
folders or `artifact_records` entries.

When `causal_discovery` creates graph objects, edge tables, local-neighborhood
tables, stability tables, plots, source files, manifests, or technical notes,
set `discovery_sidecar_output: exist` and record the output in
`artifact_records`.

```yaml
project_summary:
  discovery_sidecar_output: exist
```

If no analysis output exists, keep `project_summary.analysis_output: non_exist`.
If no discovery sidecar output exists, keep
`project_summary.discovery_sidecar_output: non_exist`.
