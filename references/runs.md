# Contained work with durable files

Read this only when saving audit artifacts, running analysis or discovery, or
writing a durable report. A no-output inspection can record file evidence and
its limitations without a run. The memory utility protects managed paths and records
provenance and recorded action permissions; it is not a process sandbox or a
scientific readiness judge. Read [authorizations.md](authorizations.md) before
protected analysis/report work, including activation for an existing project.

## Start before target computation

Use `start-run` with a new run ID, the current project/event identities, and a
plan. Keep the user's target and claim boundary explicit. The memory utility snapshots
local file inputs, records their original identities and hashes, freezes the
plan, and commits the start before returning the run path. Compute from the
returned input snapshots, not a moving external source.

For the durable exchange protocol, include the committed specialist
`interpretation_ref` in the plan. It must identify an open turn and the selected
operation: analysis belongs to design-worker execution, discovery to discovery,
reporting to report writer, and transformation to data-audit preparation. Analysis
guide identities must match the recorded assignment. A lead-only interpretation
cannot start specialist artifact work. Under `consultation-loop-v1`, analysis
and report plans also require `scope_ref` and `authorization_ref` matching the
current accepted scope. The memory utility freezes `authorization_binding`; do not supply
it yourself or change the proposed substantive terms at execution. A fresh
internal interpretation ID cannot bypass acceptance or the one-review limit.
Old in-progress runs must be resolved with their original runtime before policy
activation; new work cannot borrow retrospective approval from those runs.

All plans contain `kind`, `objective`, `claim_boundary`, and `inputs`. Each
input has `source_ref` and a local file `path`. Protected analysis/report proposals
require the file's expected `sha256` before presentation; it remains optional for
unprotected investigations. Relative input paths are relative to the selected project root;
absolute external inputs are read-only. Their contents are copied into the run.

| Kind | Additional fields |
|---|---|
| `audit` | `question`, `diagnostics` |
| `analysis` | `target`, `population`, `treatment`, `comparator`, `outcome`, `timing`, `estimand`, `design_id`, `estimator`, `exclusions`, `diagnostics` |
| `discovery` | `variables`, `method`, `diagnostics` |
| `report` | `purpose`, `evidence_refs`, `format` |

A requested durable report uses `kind: "report"` with the report-writer
assignment, even when its calculations were requested at the same time.
An HTML file included in an analysis run does not receive the report evidence
bindings below and cannot stand in for that report run. Do not create a report
artifact before its later user selection and merely finalize it afterward.
Analysis completion first returns findings and limitations to the lead; the
report is a separately selected action on those discussed findings.

An analysis may add
`additional_design_ids`: distinct standard design IDs, excluding its primary
`design_id` and `custom_identification`. Custom or composed analysis requires
`identification_basis: {argument, assumptions, source_refs}`: nonempty text,
a nonempty string array and a nonempty source-locator array respectively.
The worker checks these guides against the assignment for this execution.
These frozen identities select the design; additional guidance consulted within
unchanged scope belongs in the review's `work_performed`, not new plan IDs.

Requested preparation is an `audit` plan with nonempty `transformations` and
`diagnostics` string arrays. Freeze join, eligibility and timing rules before
producing the derived table. Use a preparation-only claim boundary, with no
causal design or artificial effect estimand. Finalization needs saved executable
code/configuration, a derived output, diagnostics and environment/execution
evidence. An ordinary audit without `transformations` is unchanged.

Diagnostics, exclusions, variables, and evidence references are lists. Other
scientific fields are text. A report cites known evidence IDs; its plan freezes
their recorded source identities, including completed-run manifest identities
when applicable. Give each corresponding input the evidence's exact
`source_ref`. For file or legacy evidence with a recorded hash, every report
input with that reference must match it. To use changed bytes, first review and
record new or corrected evidence; do not pair an old finding with a new file
version. An absent hash or corresponding input remains a recorded evidence
limitation, not newly verified source bytes. Report prose must not turn legacy
or external findings into verified new computations. A descriptive analysis uses
`descriptive_association` and does not claim causal identification.

Each new report binding also freezes current linked result conditions and their
assumption contents and event identities. `condition_coverage: "linked"` means
the records exist, not that they are scientifically correct; `unreviewed` means
there are no linked condition records. Review old limitations before using an
unlinked result. Do not infer unconditional validity or recompute automatically.
Later assumption or condition corrections do not rewrite a frozen report plan.
If they materially change its interpretation, record the impact and make an
appropriately scoped revised report. A hash check alone cannot make an old claim
scientifically current.

Start input example:

```json
{
  "event_id": "event-audit-start",
  "expected_project_id": "project-study",
  "expected_last_event_id": "event-checkpoint",
  "run_id": "run-audit-1",
  "plan": {
    "kind": "audit",
    "interpretation_ref": "interpretation-audit",
    "objective": "Inspect panel coverage and timing",
    "claim_boundary": "Data structure only; no effect estimate",
    "inputs": [{"source_ref": "data/panel.csv", "path": "data/panel.csv"}],
    "question": "Does each district have usable pre-policy observations?",
    "diagnostics": ["Check identifier uniqueness and observation coverage"]
  }
}
```

## Work inside the run

Save code, configuration, diagnostics, and outputs beneath the returned
`runs/<run_id>/` path. `write-run-file` accepts the current project/event
identities, `run_id`, a run-relative `path`, and text `content`. Frozen plans,
input snapshots, and manifests are not editable through this memory utility. Do not
send an `event_id` for a managed file write. Existing identical bytes are a safe
retry; changed content requires a new filename, preserving the earlier file.
Do not overwrite a completed run. Put revisions in a new run, normally with
`parent_run_id` pointing to the earlier run.

Before resuming protected output, check that its accepted scope and relevant
basis still apply and the latest interpretation selects that scope/authorization.
A pause or question-driven redirection suspends output while preserving applicable
acceptance for explicit resumption. Changed evidence, withdrawn permission or a superseded scope
requires reconciliation before more output or finalization. Routine code and
diagnostic work inside the accepted scope does not require another user choice.
Pause or cancellation preserves unfinished work; use its terminal status honestly
when abandoning rather than hiding files or automatically starting a revision.
A routine command retry remains within an in-progress current run; use new file
paths to preserve earlier outputs. Terminal failure/abandonment ends that action,
so a new run needs later selection instead of silently reusing consumed permission.

The host's execution tools must keep generated files inside the run and avoid
modifying source inputs. Saving code beside an output does not prove that the
code produced it. Preserve actual commands, execution output, runtime versions,
and failures as evidence when computing; do not describe an unexecuted script
as reproduced analysis.

Give rerun instructions that use the saved code and input snapshots in a fresh
contained run or output directory. If the code writes relative to its own
directory, copy it and its required inputs into that fresh directory first.
Preserve the completed run; a command that tries to recreate its existing
outputs is not a usable rerun instruction. A rerun saved as a new computation
needs its own plan and run.

## Finalize and report honestly

`finalize-run` takes the current event/project identities, `run_id`,
`code_paths`, `output_paths`, `diagnostic_paths`, an `environment` object, and
`deviations`. These paths are relative to the run. Include executable code or
configuration for computations, the reported outputs, and required diagnostics.
Each deviation states `description`, `reason`, and `timing` as `pre_result` or
`post_result`. Never disguise a post-result choice as a prespecified decision.

Finalization verifies the frozen plan and snapshots, checks source drift,
inventories the run, writes the immutable manifest, and commits completion.
Missing files or drift are errors, not reasons to silently replace the plan.
Use `fail-run` or `abandon-run` with a reason when work cannot or should not
finish. A started run remains visibly incomplete until a terminal event commits.

Use the [evidence contract](memory-records.md#study-and-user-records) to record
a saved new computation with `kind: "computed"`, its
completed `run_id`, and `source_ref: "runs/<run_id>/<manifested-output>"`.
The reference must identify a manifested output or diagnostic with matching
content.

Before synthesis or reporting, use the [result-condition contract](memory-records.md#result-conditions)
to record consequential quantities in `changes.result_conditions` with their target,
assumption references and inferential scope where applicable. An estimate, sharp-null test and interval
can have different conditions even when they share one output file. The selected
specialist owns scientific validity; the lead preserves those distinctions in
its closeout. Prepare the [review contract](memory-records.md#checkpoints-and-reviews)
for the named commit owner. Finalizing the run alone does not complete that handoff,
authorize a report or choose the next action. Preserve the user's current and deferred
questions after reporting as well as after analysis.

`verify` is read-only. It reports missing or altered content, unexpected files,
linked paths, incomplete runs, orphan directories, and a stale projection. It
does not fix content or infer completion from files. The default
`verify --source-check originals` also checks original external source paths.
For an offline or relocated archive, explicitly use
`verify --source-check snapshots`: it checks the journal, frozen plans, input
snapshots, manifested artifacts and bound evidence, but not the original
external paths. The response labels this choice in `source_check`; snapshot
verification does not establish that original sources are still available or
unchanged. Keep existing plans and hashes intact when moving an archive.
Finalization still checks original sources; this read-only option cannot bypass
completion checks.

A committed event followed by a failed projection or brief export is still committed.
Use [memory recovery](memory.md#recovery) to refresh derived files without
repeating computation. If files exist
without the intended commit, inspect the orphan attempt and start with a new
run ID; do not adopt arbitrary existing files as a completed run.
