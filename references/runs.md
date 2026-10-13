# Saved work and artifacts

Use this v8 contract for substantial saved work. Existing v7 cases use
[v7 runs](v7/runs.md). A source review with no artifact needs no empty run.
The selected specialist owns scientific execution; the utility owns frozen
plans, input snapshots, managed file writes and lifecycle records.

## Read before work, save as it happens

| When | Worker reads | Worker submits |
|---|---|---|
| Before start | Bounded assignment, committed handling, exact scientific basis, accepted scope/decision for protected work | start-run |
| During work | Frozen plan and snapshots; current direction before further dependent output | write-run-file or actual computation inside the run |
| At completion | Actual files, checks, deviations and output qualification | finalize-run |
| Failed or abandoned | Performed work and actual failure/stop reason | fail-run or abandon-run |
| Handoff | Committed run and manifested outputs | One review to its named commit owner, normally Lead |

An assistant may run the selected worker locally or delegate it. A delegation
names the run-file/lifecycle owner and the review commit owner. Do not have two
workers write the same run. No worker edits project.yaml, case-brief.md or the
journal by hand. Lead adopts returned scientific updates and closes the user
round; finalizing a run alone does not do that.

## Start from the selected direction

```json
{
  "at": "<current-token>",
  "op": "start-run",
  "responds_to": "<committed-handling>",
  "scope": "<accepted-scope>",
  "decision": "<acceptance-entry>"
}
```

Protected analysis/report work derives its plan from that scope. Do not supply
a second plan. Current direction must select the same scope, decision and
assignment. A changed focus can defer valid acceptance; resumption needs current
direction, not invented fresh permission. A start receipt gives the run's eN
identity, run path, frozen plan and snapshot locations. One decision starts one
run; resume it rather than repeat start.

Audit, preparation and discovery supply `plan` instead of scope and decision,
with the same committed `responds_to`. The selected assignment still applies.
Optional `parent_run_id` links a revision to its earlier run.

## Plan content

Every plan has kind, objective, claim_boundary and inputs. Each input has
source_ref and path, with a known sha256 when reusing an audited version.
The utility freezes source paths, hashes and snapshot paths. Use those snapshots
for computation. Keep original sources read-only.

| Kind | Additional content |
|---|---|
| audit | question, diagnostics; transformations for preparation |
| discovery | variables, method, diagnostics |
| analysis | target, population, treatment, comparator, outcome, timing, estimand, design_id, estimator, exclusions, diagnostics |
| report | purpose, evidence_refs, format |

In a protected scope's `execution`, supply only execution-specific fields:
analysis uses inputs, treatment, comparator, outcome, timing, estimand, design_id,
exclusions and relevant optional design fields; report uses inputs,
evidence_refs and format. The utility derives objective and claim_boundary from
terms, plus analysis target/population/estimator/diagnostics or report purpose.
This avoids maintaining the same scope terms twice.

Custom or combined analyses retain additional_design_ids and identification_basis
with argument, assumptions and source_refs. Preserve the selected primary and
additional design identities. Supporting guide reads belong in work_performed
and do not silently change the frozen assignment.

Optional operations clarify nonprotected work: audit can name source_inspection,
data_quality or preparation; discovery can name graph_exploration. Preparation
declares transformations and diagnostics. These labels do not prove what code
did or authorize target estimation. See [authorizations](authorizations.md).

Report evidence_refs name evidence entities, not review entries. The report plan
freezes their exact content, conditions, assumptions and computational provenance.
Historical external results remain source evidence with verification limits.
Unavailable conditions are unreviewed, not assumption-free.

## Save actual work

Use the returned contained run directory. Conventionally keep code/configuration
in code/, outputs in outputs/, and checks/logs in diagnostics/. Actual analysis
tools may write their outputs there; keep execution evidence, not only intended
code. Record seeds, folds, settings and relevant runtime versions. Do not write
inside a completed run.

```json
{
  "at": "<current-token>",
  "op": "write-run-file",
  "run": "<start-entry>",
  "path": "code/analysis.py",
  "content": "<actual code>"
}
```

This file operation does not append a journal entry. It requires a current token.
The same existing bytes are reusable; changed content gets a new filename.
Plans, frozen inputs and manifests remain manager-owned.

Source or permission changes stop further work that depends on them. Retain valid
completed checks and explain the affected claim rather than deleting outputs or
silently repairing data. An unsettled scientific interpretation does not itself
make executed work a failed computation.

## Finalize and report honestly

```json
{
  "at": "<current-token>",
  "op": "finalize-run",
  "run": "<start-entry>",
  "code_paths": ["code/analysis.py"],
  "output_paths": ["outputs/results.json"],
  "diagnostic_paths": ["diagnostics/checks.json"],
  "environment": {"runtime": "<actual version>", "execution": "<actual command/log>"},
  "deviations": []
}
```

Paths are relative to the run. Computational work retains code or executable
configuration; planned diagnostics retain evidence. Each deviation has description,
reason and timing (pre_result or post_result). A failed tool call is not a
scientific infeasibility result. Use fail-run with the actual reason; abandon-run
records a deliberate stop. Neither permits overwriting completed work.

A report also supplies `deliverable: {primary, companions?, assets?, reproduction_entrypoint?}`.
Primary and companion paths are declared outputs; assets are retained bundle
files; a reproduction entrypoint is declared code. Paths are run-relative.
The utility checks local links/dependencies and requested output formats.
The writer remains responsible for source-to-claim readback, numerical accuracy,
qualifications and appropriate rendering review. State checks actually performed;
a successful manifest does not certify scientific or visual quality.

Finalization appends a completion entry and freezes manifest.json with inputs,
files/hashes, environment, deviations and claim boundary. The run keeps its
start-entry identity. Adopted evidence/result-condition updates may accompany
this save; otherwise Lead adopts them with the review. Computed evidence names
the run and a manifested output or diagnostic path. Preserve qualifications
through [result conditions](memory-records.md#result-conditions).

Analysis findings return to discussion. A durable report requires its separate
findings-bound offer and later choice. Reports remain revisable artifacts;
completion does not permanently close the consultation.

## Recovery and verification

Exact retries recover a committed start/completion without recomputing work.
A start retry reads its frozen plan instead of reopening original inputs. Missing
or changed artifacts produce a specific receipt recovery error; the committed
entry remains intact. Do not invent a replacement snapshot.

An uncommitted run folder or manifest after interruption is preserved for
inspection, not silently adopted as a completed run. Keep it separate from
committed work and resolve that artifact state before retrying its operation.
Journal export recovery does not declare orphan work completed.

When verification is authorized, `verify --project-root <case>` checks retained
plans, manifested files, source consistency, captures and unfinished/orphan work.
`--source-check snapshots` omits the original-source availability comparison;
it does not claim that moved originals were checked. Structural verification
does not establish identification, correct execution or scientific validity.
Respect the user's restrictions on tests and tools.
