# Action Scopes and User Decisions

Use this contract for protected analysis and durable reporting inside the
persistent consultation loop. The user can ask questions, change focus, defer,
pause or end at any time. There is no project-wide sequence to complete and no
per-file approval requirement. Read [memory.md](memory.md) for event envelopes
and exact retries. Use [incoming-source fields](memory-records.md#incoming-user-sources)
when attributing user permission and [target updates](memory-records.md#target-and-boundary-updates)
before changing a proposal's target or boundary.

Use [submit authoring](authoring.md) for scope content, selected sources and
state binding; do not author mechanical version maps.

## Activate the Current Policy

Check for `consultation-loop-v1` and `reply-reconciliation-v1` alongside the
exchange/question capabilities.
New `init` creates a project with this policy active. Inspect brief context's
`consultation_policy` (or status's `project.state_meta.consultation_policy`)
before activation; do not reactivate it. For an
existing supported journal project with an inactive policy, use `record` with type `consultation_policy_activated`
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

Before saving or offering a new scope, the memory utility checks the execution plan with
the same structural and source-resolution rules used at run start. Supply the plan's required fields,
including `objective` for every run and an `exclusions` array for analysis; do not
invent defaults to make it pass. A rejected proposal has not been saved or offered,
so repair its structure or source references before presenting it to the user.
Report `evidence_refs` identify evidence records, not review IDs; file inputs
identify the actual files and their bound hashes. Checks at proposal time grant
no execution permission, and run start rechecks current sources and authorization.
Historical replay and exact retries do not require the old external files to
remain available. A fresh offer does. Changed substantive terms require a new
scope and later user selection. Requested local formats may instead use the
acceptance adjustment below.

Save each immutable scope in `changes.action_scopes`:

- `scope_id`: a fresh project identity for this revision.
- `action`: `analysis` or `report`; `assignment`: the corresponding existing
  design-worker execution or report-writer assignment.
- `public_scope`: nonempty `target`, `population`, `evidence`, `approach`,
  `outputs`, `claim_boundary`, and a `checks` array. State the substantive terms
  in language the user can understand, including the consequential assumptions
  and planned checks. Internal method names alone are not an explanation.
- `execution_plan`: the proposed [run plan](runs.md), without transient
  interpretation/authorization fields or utility-added frozen-run fields. Its
  action and claim boundary must match the public scope. For analysis, target,
  population and diagnostics also match the corresponding public terms.
  `submit` hashes available file inputs when their `sha256` is omitted; explicit
  hashes remain checked. This binds the user's choice to those bytes; a file change while
  awaiting the answer must not silently become the approved data version.
  The sole input exception is [one unreleased held-out input](#deferred-held-out-input).
- `basis_refs`: IDs of relevant committed evidence, assumptions, decisions or
  work for this fresh scope. The utility unions these with `findings_refs` and
  plan `evidence_refs`, expands current dependencies and saves their committed
  `{ref,event_ref}` pairs as `basis_versions`. The assistant selects scientific
  relevance; the utility does not invent a target. Include the
  relevant current source-linked target decision. Expansion includes the sources
  named by governing target/boundary decision `basis_refs` and `user_contribution_refs`.
  When an objective or claim changes, revise the affected target/boundary decision
  together with its understanding summary; a summary-only edit cannot expose stale
  scope terms. Do not bind unrelated targets merely to satisfy the structural check.
  Include conditions that can change whether this scope remains applicable:
  source evidence and governing findings; expansion includes underlying completed
  runs, current result conditions, their assumptions and source basis. New relevant conditions, updated versions
  and assumption-status changes require reconciliation; do not omit dependencies
  to keep an authorization artificially current. A new qualified scope can cite
  a retired assumption as historical negative evidence, without adopting it.
  Older scopes missing required source bindings remain historical records;
  reconcile with a revised scope and later selection before new protected output.
- `findings_refs`: completed work or computed-evidence IDs; required nonempty
  for report scopes and also included in `basis_versions`.
- Optional `supersedes`: the earlier scope ID being replaced.

Use exactly one of `basis_refs` or the compatible full `basis_versions` form,
for example `"basis_versions":[{"ref":"target-offer","event_ref":"event-target"},
{"ref":"allocation-record","event_ref":"event-source"}]` when those are the
complete required bindings. Explicit version lists must already include the
complete closure; the utility never repairs them. Expansion never rebinds an
existing scope, accepts superseded roots, or uses new/changed basis records in
the same event. Save those first. `basis_refs` is authoring-only and is stripped
from the saved scope. No manual dependency/version script is needed.

If an outgoing offer needs new or changed review findings, result conditions or
target/boundary records, commit that basis before preparing the scope and exchange.
The named review owner saves `review_completed` once with its basis changes;
use `memory_updated` or a sourced `correction` for changes without a review.
For a direct Lead-only turn whose incoming source or interpretation supplies the
basis, save `reply_interpreted` with that source and the affected records first.
Then use the committed receipt and current versions in `exchange_prepared`,
without resubmitting the review or changing its bound basis again in that event.
Both saves belong to the same user-facing round. This exception to bundled
closeout adds no user approval or extra round; execution still requires the later
acceptance of the presented scope. Reuse an adequate existing receipt when the
basis is already committed.

For an action option in a new `lead-markdown-v11` exchange, supply its ordinary
display fields and `scope_ref`. With `concise-authoring-v1`, omit `proposal`,
`execution_plan` and `assignment`; the utility copies missing values from that
immutable scope. The scope may be committed or saved with this exchange if its
basis was already committed. Explicit supplied values must match the scope,
including the full-form compatibility input. The same shorthand remains supported
for v5-v10; historical rendering is unchanged.
For an analysis scope saved with the corresponding terms, an option can use:

```json
{"option_id":"offer-effect","kind":"action","label":"Estimate the one-year offer effect","actor":"consultant","scope":"Compare one-year scores between randomized offer groups.","basis_refs":["allocation-record","scores-source"],"scope_ref":"scope-offer-effect-002"}
```

The canonical saved option contains all copied terms. Ordinarily, `[Next steps]`
uses `[N1] <label>` and retains all seven public fields in a scope paragraph:
target, population and claim boundary together, followed by approach, evidence,
checks and outputs. Authored paragraph breaks remain intact; use flat paragraphs
without nested lists or authored item prefixes. It omits
the consultant actor label and a second execution-plan dump. Include the intervention/comparison/outcome,
consequential timing or exclusions, method, decision constants and holdout
commitments in these fields where applicable. Keep checks concise and specific;
the saved plan's diagnostics still equal them. A linked technical specification
does not excuse omitting a term that changes the user's choice.

Apply [Lead's whole-item budgets](team_lead.md#closeout) to the expanded public
terms. The essential-scope allowance needs no separate request for clarification.
Keep technical detail that does not change the choice in the saved plan.

For explicitly requested detailed scope clarification, add the option's `scope_ref` to its
answered `user_questions` item in the same exchange. The renderer appends
all seven saved terms and the scope link to that answer, then replaces the
option's repeated terms with a pointer to that answer's section and item.
Use one answer per scope. Its user-origin question must belong to an interpretation
being closed, with a nonempty quoted user source shared by the question's
`basis_refs` and that interpretation's `incoming_refs`. Read the original request
to judge whether detail was requested; those links alone cannot establish intent.
Do not duplicate the terms or author another proposal in the answer.

Count the appended terms within the requested answer's allowance; its pointer
option keeps the ordinary item budget. Showing terms grants no permission:
the full exchange must be observed before a later selection
authorizes work. Draft concise complete terms before binding the scope. If they
cannot fit the applicable limit, offer a discussion direction without `scope_ref`.
Do not shorten immutable terms or rely on a hidden link, another exchange or an
unsourced explanation. The v10 path retains its historical length contract.

### Author a Public Scope

Draft the seven fields as parts of one short offer, each serving a distinct
purpose. Put the target in `target`, the eligible data in `population`, the
assignment and source basis in `evidence`, and the decision procedure in
`approach`. Use `claim_boundary` for the conditions that limit interpretation.
Do not repeat these facts in the option's action sentence or introduction.
`checks` name the specific tests and their consequential interpretation, without
retelling the motivation for every test. Omit terminal punctuation on these
items because the renderer joins them with semicolons. Preserve their content in the matching
plan diagnostics; technical estimator detail can stay in the full plan.

For a documented randomized-offer study, state the actual offer contrast and outcome horizon, eligibility, assignment evidence, chosen estimator, exclusions, uncertainty method and meaningful diagnostics. Explain any outcome-dependent selection or reuse of evaluation data. Use the actual study terms; never shorten an already bound scope in place.

For example, one item in the public display can read:

> [Next steps]
>
> [N1] Estimate the offer effect
>
> Compare randomized offer groups.
>
> One-year score effect of an offer. All randomized applicants. Offer effect
> in this cohort only. Mean difference with a 95% randomization interval.
> Evidence: Allocation records and scores. Checks: Allocation integrity; missing
> outcomes. Output: Estimate and interval.

The utility adds the actual saved scope link. This illustrates one protected
option's terms; [Lead](team_lead.md#closeout) develops the accompanying alternatives
from the actual study, including requests for existing material where useful.

### Export and Present

The receipt automatically exports the exact immutable scope as canonical JSON
at `scopes/<scope_id>/scope.json` and links it below its option. The utility adds
an absolute `scope_file` display locator to the saved option so the link works
in chat and the exported response; omit it when authoring. It is a derived
location, not another plan. Historical replay retains the original link even
if the project is later moved; its historical receipt then remains readable but
returns `response_file_written: false` for re-emission. Prepare a new exchange
at the current location to expose the same scope, preserving existing permission
and direction according to the rules below. `response_file_written: true`
confirms this export as well as the draft response file. Present only links to
available files. If export fails after commitment, retry the
same original exchange request after resolving the file problem; retain that
submission because the utility adds its display locator to the saved event. Do not resubmit a new
scope, rewrite the saved terms or request the same approval to repair an export.
These files are derived from the journal and are never a second editable plan.
Require [memory's current capabilities](memory.md#authority-and-entry).
Historical renderers retain their original bytes and validation.

A report option must refer to findings presented in `response.findings` in the
same reply, or already presented in an observed earlier reply. Findings contain
`work_refs`, `summary`, `diagnostics` and `limitations`. Describe actual checks
and their consequences, not just filenames or "analysis completed". Explain
useful further work when it could matter; do not manufacture improvements.
V9 displays these findings under `[To answer your question]`, retaining their
typed work references. Moving their heading does not remove the requirement to
discuss actual findings and material limits before a report can be selected.
The actual reply record must retain those findings and work references; a
findings item present only in the draft does not establish that discussion.

## Deferred Held-Out Input

When the rule and evaluation procedure are already fixed but one held-out file
has not been released, offer the evaluation as a concrete analysis scope before
the file arrives. Name the expected file path and `source_ref` in its input, set
`"deferred_release": true`, and omit only that input's `sha256`. The file must
be absent when the scope is offered. All available inputs still need hashes.
Keep the frozen rule, target, estimator, utility, comparators, checks and claim
boundary visible in the public scope, with the saved commitment in its basis.
This exception allows one deferred analysis input, not report inputs or an
unspecified future analysis.

The user must later clearly select this offered scope. An instruction such as
"Here is the evaluation file; run the saved plan once" can do so when it refers
to that unchanged offer. At run start, the utility resolves the exact offered
path, hashes and snapshots the released bytes before any target computation.
If the release changes a substantive term or fails the planned integrity checks,
stop and reconcile the scope; do not use the deferred input to alter the plan
after seeing outcomes. Do not ask for another selection solely to record the
new file hash.

## Interpret the Later User Decision

Record the actual preceding proposal through [reply recording](delivery.md#record-the-previous-reply).
An agent-written record from the visible conversation is sufficient; native
capture is optional. Only actual mapped options with their unchanged complete
scope terms can support acceptance. A draft-only option cannot be selected.
Preparation is not delivery. If a short answer depends on an uncertain menu,
inspect the actual previous assistant message or clarify before binding it.
An intact reply recovered under [delivery.md](delivery.md) retains the offered
scope and later-choice requirements; added introductory prose alone does not
require another user acceptance. Changed scope or conflicting instructions do.

[Same-reply reconciliation](delivery.md#reconcile-records-of-the-same-reply)
can strengthen or correct that evidence without rewriting the original decision
or frozen run binding. Earlier delivery references resolve to current actual
items. The same supported option and complete scope retain valid acceptance;
an omitted condition cannot be restored from the draft. Preserve a user's reply
to misleading terms as intent, not acceptance of hidden or corrected terms.

The subsequent interpretation records `action_decisions` with `decision_id`,
`scope_ref`, `disposition` (`accept`, `defer`, `decline`, `withdraw`),
`exchange_ref`, `option_id`, `delivery_ref` and `user_refs`. Attribute the decision
to actual later user input and the presented option. A free-form `decisions`
record, confidence about assumptions, source attachment or initial report desire
cannot grant this permission. When selecting protected work, bind
`next_action.scope_ref` and `next_action.authorization_ref` to that scope and
acceptance. Optional `focus_scope_ref` records current focus without withdrawing
other scopes; `null` clears focus. Record acceptance only when the whole message
clearly accepts that still-current offered scope. Acceptance can remain unused
while execution waits for a prerequisite or the user selects independent work.
The referenced user evidence needs its relevant exact `source_excerpt`, including
conditions, rather than only an acceptance summary. Preserve the existing decision
when recovering the same unfinished action; do not invent another acceptance.

Withdrawal of an existing acceptance uses that action's exact scope, option and
offer references. It does not require proving the original offer's delivery again:
a later capture discrepancy must not prevent honoring a stop. If any submission
fails before saving, retain the unchanged user source through `memory_updated`
and then interpret it. Newly retained, uninterpreted primary messages suspend
protected starts and continuation until their direction is reconciled.

For "yes, write that report, and include HTML," add
`"presentation_adjustment":{"formats":["markdown","html"],"user_ref":"user-request-id"}`
to that acceptance. `user_ref` must name one of its incoming `user_refs`, whose
exact excerpt preserves the request and any condition. List the effective local
formats from `markdown`, `html`, `pdf`, `docx`, `text`; retain wanted originals.
Start with the ordinary scope/interpretation/authorization references. The helper
derives `plan.format` (for example, `markdown, html`) and freezes the adjustment
and source version in `authorization_binding`. The original offer stays unchanged.
Every other plan term remains exact, including evidence, purpose and claim boundary.
This permits local companions, not new scientific content, audience or publication.
The consultant interprets the request and its conditions; the helper checks its
attribution. Do not seek another approval solely for these requested formats.
This adjustment applies at acceptance/start, not after a report is finalized.

Apply [Helper's incoming procedure](helper.md#resume-and-interpret) before
binding permission. "Yes, but use the other population" changes scope and needs
a revised offer. "Explain this comparison before we decide" accepts nothing.
"I approve it, but first explain the allocation record" can retain valid
acceptance while selecting `lead_only`, with `adjustment_reason` and no assignment
or run. If the scope is stale, retain the preference and propose revised terms
instead of recording acceptance. A factual correction preserves historical approval,
but cannot make its changed scope current or authorize an allegedly unaffected
protected subtask within that stale scope.

If the user approves A but clearly requests independent audit B while A waits,
record A's acceptance and select B alone with the adjustment explained. Validate
B's direction and any required authorization separately. Do not infer B, accept
two new protected scopes or execute two specialists in one turn. Helper's
dependency rules determine whether work is independent and when questions are answered.
A sourced work-dependent question can select that bounded investigation using
[Helper's question linkage](helper.md#questions-before-routing), without adding
a duplicate instruction. Hypothetical or unrelated questions grant no new work;
the model judges meaning while code checks attribution and recorded linkage.
An `adjustment_reason` cannot supply missing or stale authorization, materially
expand the scope or justify treating an unknown as a favorable premise.

## Work, Discuss and Preserve Choices

Start analysis/report work by `scope_ref`, explicit `interpretation_ref` and
`authorization_ref` under [runs.md](runs.md#start-before-target-computation),
without copying the saved plan. Start before computation or report output. The memory utility freezes its
`authorization_binding` with `policy`, scope, authorization and basis versions;
do not hand-author that binding. New or resumed protected output must remain
inside the accepted scope. A changed relevant basis, superseded scope or withdrawn
decision requires reconciliation before further work. Unrelated preferences or
work on another scope do not invalidate all permission.
Permission and current direction are distinct: a pause, prerequisite question or
focus change suspends output on the earlier action. Start and continuation require
the latest interpretation to select that same scope and authorization. Explicit or
clearly contextual resumption can reuse its still-current acceptance: unused for
a new run, or already bound to the interrupted current run.
Answering the sole stated blocker can support resumption when that was the clear
next step, without another ritual "yes". A focus change or ambiguous direction
does not automatically resume waiting work. If the answer changes a version-bound
premise, reconcile it and present revised terms for later acceptance; do not weaken
version checks because the action label is unchanged.
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

The memory utility validates recorded identities, versions, order and scope compatibility.
`FINDINGS_NOT_DISCUSSED` reports the missing exact findings IDs and whether prior
discussion is absent, unobserved or stale. `STALE_SCOPE` identifies the blocking
reference and dependency path. Use these diagnostics to reconcile the affected
source or scope; do not weaken the finding, capture or version requirement.
The lead still judges meaning and scientific adequacy. Ordinary skill use cannot
prove actual delivery or prevent arbitrary host tools bypassing the memory utility;
do not describe this as a host-enforced execution sandbox.
