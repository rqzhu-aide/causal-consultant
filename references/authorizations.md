# Action Scopes and User Decisions

Use this contract for protected analysis and durable reporting inside the
persistent consultation loop. The user can ask questions, change focus, defer,
pause or end at any time. There is no project-wide sequence to complete and no
per-file approval requirement. Read [memory.md](memory.md) for event envelopes,
attributed user evidence and exact retries.

## Activate the Current Policy

Check for `consultation-loop-v1` alongside the exchange/question capabilities.
New `init` creates a project with this policy active. Inspect
`state_meta.consultation_policy` before activation; do not reactivate it. For an
existing inactive v7 project, use `record` with type `consultation_policy_activated`
and payload `{"policy":"consultation-loop-v1","reconciliation":"..."}`.
Explain how existing evidence and unfinished obligations will be used before
starting new work under this skill.

Old events retain their original meaning and hashes. Existing results can be
reviewed as historical evidence, but old requests acquire no retrospective
permission. An in-progress legacy run blocks activation: resolve it with its
original runtime, or use a separate current project with explicitly reviewed
source summaries. Do not silently grandfather the run or invent old approval.
Historical review projections lack dependency bindings. Before using one for
current findings or a report scope, record a new review grounded in the underlying
sources and assumptions; `LEGACY_REVIEW_RECONCILIATION` identifies this need.
Reading and reconciling existing evidence does not require inventing a new user
approval or repeating an already completed computation.

## Which Work Is Protected

| Work | Boundary |
|---|---|
| Inspection, elicitation, readiness and feasibility | May read sources, audit structure and assess an identifying argument under a clear bounded request; return findings or a proposed scope |
| Requested data preparation | May construct the requested table under frozen, source-grounded rules; no target outcome contrast or hidden estimation |
| Candidate discovery | May answer a bounded structural/graph question with candidate-only outputs and diagnostics; no effect or policy result |
| Analysis execution | Requires accepted scope before target computation, including raw exposure-outcome contrasts, adjusted/subgroup effects, outcome-based selection for those targets, treatment-rule learning and policy-value estimation |
| Durable report production | Requires a concrete report option tied to discussed findings and a later selection before creating the report artifact |

Operation is determined by what the computation does, not its filename, worker
label or a claim that it is preliminary. Descriptive target comparisons are still
analysis. Input distributions, key checks, missingness and exposure-only support
are permitted audit diagnostics. Routine checks already included in accepted
analysis need no additional decision. An optional new target, population,
outcome, policy or materially different approach needs a revised proposal.
Optional run-plan `operations` can make nonprotected work explicit: audit uses
`source_inspection`, `data_quality` or `preparation`; discovery uses
`graph_exploration`. These declarations do not prove what executed code did.

Design-only and nonidentification projects discuss actual design/audit findings.
They can offer a report of those findings without fabricating effect estimation.
Analytical notes and diagnostic displays can accompany accepted analysis; do not
package its final report under an analysis/audit name to bypass the report choice.

## Present a Concrete Scope

Save each immutable scope in `changes.action_scopes`:

- `scope_id`: a fresh project identity for this revision.
- `action`: `analysis` or `report`; `assignment`: the corresponding existing
  design-worker execution or report-writer assignment.
- `public_scope`: nonempty `target`, `population`, `evidence`, `approach`,
  `outputs`, `claim_boundary`, and a `checks` array. State the substantive terms
  in language the user can understand, including the consequential assumptions
  and planned checks. Internal method names alone are not an explanation.
- `execution_plan`: the proposed [run plan](runs.md), without transient
  interpretation/authorization fields or helper-added frozen-run fields. Its
  action and claim boundary must match the public scope. For analysis, target,
  population and diagnostics also match the corresponding public terms.
  Hash each existing file input before presenting the proposal and include its
  `sha256`. This binds the user's choice to those bytes; a file change while
  awaiting the answer must not silently become the approved data version.
- `basis_versions`: `{ref,event_ref}` pairs naming already committed current
  versions of relevant evidence, assumptions, decisions or work. Include the
  conditions that can change whether this scope remains applicable. Include
  source evidence, underlying completed runs, governing current result conditions,
  their assumptions and source basis. New relevant conditions, updated versions
  and assumption-status changes require reconciliation; do not omit dependencies
  to keep an authorization artificially current. A new qualified scope can cite
  a retired assumption as historical negative evidence, without adopting it.
- `findings_refs`: completed work or computed-evidence IDs; required nonempty
  for report scopes and also included in `basis_versions`.
- Optional `supersedes`: the earlier scope ID being replaced.

An action option in a `lead-markdown-v4` exchange includes its `scope_ref`, the
exact `public_scope` as `proposal`, the exact `execution_plan`, and matching
`assignment`. The helper renders the proposed terms. Do not put material scope
only in private state and show the user a vague "proceed" option.

A report option must refer to findings presented in `response.findings` in the
same reply, or already presented in an observed earlier reply. Findings contain
`work_refs`, `summary`, `diagnostics` and `limitations`. Describe actual checks
and their consequences, not just filenames or "analysis completed". Explain
useful further work when it could matter; do not manufacture improvements.

## Interpret the Later User Decision

Record actual proposal delivery through memory's attributed delivery observation.
Preparation is not delivery. If a short answer depends on an uncertain menu,
inspect the actual previous assistant message or clarify before binding it.

The subsequent interpretation records `action_decisions` with `decision_id`,
`scope_ref`, `disposition` (`accept`, `defer`, `decline`, `withdraw`),
`exchange_ref`, `option_id`, `delivery_ref` and `user_refs`. Attribute the decision
to actual later user input and the presented option. A free-form `decisions`
record, confidence about assumptions, source attachment or initial report desire
cannot grant this permission. When selecting protected work, bind
`next_action.scope_ref` and `next_action.authorization_ref` to that scope and
acceptance. Optional `focus_scope_ref` records current focus without withdrawing
other scopes; `null` clears focus. Record acceptance only when the whole-message
interpretation permits selecting the matching protected work.

Interpret the whole reply first. "Yes, but use the other population" changes the
scope; propose a revision instead of executing the old or expanded analysis.
"Yes, but explain what this comparison means before we decide" is lead-only
under the question-dependency rules. A clear independent question can accompany
authorized work and be answered at closeout. An `adjustment_reason` explains a
route change; it cannot supply missing or stale protected authorization.

## Work, Discuss and Preserve Choices

An analysis/report plan carries `scope_ref` and `authorization_ref`. Start the
run before computation or report output. The helper freezes its
`authorization_binding` with `policy`, scope, authorization and basis versions;
do not hand-author that binding. New or resumed protected output must remain
inside the accepted scope. A changed relevant basis, superseded scope or withdrawn
decision requires reconciliation before further work. Unrelated preferences or
work on another scope do not invalidate all permission.
Permission and current direction are distinct: a pause, prerequisite question or
focus change suspends output on the earlier action. Start and continuation require
the latest interpretation to select that same scope and authorization. Explicit
resumption can reuse its still-current acceptance; it does not invent new consent.
Preparing the lead's closing exchange ends protected output for that turn.
Further output requires a later interpretation selecting the same current scope;
retrying an identical already-saved file remains idempotent.

One acceptance starts one run. Continue an interrupted current run using its
original binding; an idempotent retry of that start is not a new action. A new
run after terminal failure or abandonment needs a later selection, even when its
scope is unchanged. An ordinary command retry stays within the current in-progress
run and preserves earlier files with new output paths; it does not need another
approval. Do not reuse a consumed decision to start a separate action.

On completion, return findings and limitations to the lead in the same reply.
The lead discusses them and presents useful directions, which can include a
report option. Only a later user selection permits writing that report. Selecting
an extension permits that bounded action only; its findings return to discussion
again. A completed report does not silently retire unrelated questions, execute
deferred work or make the project permanently terminal.

Pause/end instructions stop new work while preserving evidence, open questions,
offers and decisions. On resumption, recover the relevant scope and current basis;
do not manufacture consent or start deferred work without current direction.
Completed work with an interrupted closeout requires discussion recovery, not
recomputation. A later consent never legitimizes an earlier unauthorized output.

The helper validates recorded identities, versions, order and scope compatibility.
The lead still judges meaning and scientific adequacy. Ordinary skill use cannot
prove actual delivery or prevent arbitrary host tools bypassing these helpers;
do not describe this as a host-enforced execution sandbox.
