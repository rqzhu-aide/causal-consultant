# Memory Record Reference

Use [memory](memory.md) for the common read/write contract. Read only the sections
needed before the current interpretation, reconciliation or submission; reuse
intact guidance. The complete [interpretation](helper.md#interpretation-submission)
and [exchange](team_lead.md#exchange-submission) contracts belong to Helper and Lead.

| Need | Section |
|---|---|
| Exact lookup, compact output, pagination or older views | [Reading Details](#reading-details) |
| Where a fact belongs; affected-summary reconciliation | [Record Ownership](#record-ownership) |
| Field types and shared record fields | [Conventions](#record-field-conventions); [Study and User Records](#study-and-user-records) |
| Useful short prose or updates to an existing record | [Budgets and Purpose](#prose-budgets-and-purpose); [Narrow Patches](#narrow-patches) |
| Incoming source capture/correction | [Incoming User Sources](#incoming-user-sources) |
| Question meaning, answers or retirement | [Questions](#questions) |
| Supported answer versus actual communication | [Answer Resolution and Communication](#answer-resolution-and-communication) |
| Objective, target or boundary change | [Target and Boundary Updates](#target-and-boundary-updates) |
| Consequential findings and their qualifications | [Result Conditions](#result-conditions) |
| Retained brief contents | [Case Brief Selection](#case-brief-selection) |
| Specialist selection or handoff | [Checkpoints and Reviews](#checkpoints-and-reviews) |
| Historical shapes or a first-round submission | [Compatibility](#compatibility); [Examples](#examples) |

## Reading Details

Use the [short guide](memory.md#reading) for ordinary reads. With
`--output-format compact-v1`, brief/focused context and status return
`format: "memory-compact-v1"`. The flag changes output only, never request
fingerprints, saved schemas or retry identity. Existing callers default to legacy.
Compact reads retain version/format identity without repeating the static
capability manual; use the session's `capabilities` response for that contract.

### Compact bodies and exact lookup

`records` contains one included representation per `(record_ref,event_ref)`.
Cards and indexes use `body_locator` into that response, with a `lookup` request
for later reads. The locator is temporary; retain record IDs/events as identity.
`body_mode: "full"` denotes the authored body, while `brief` denotes selected
fields with omitted detail; `omitted_fields` retains nested paths after merging
projections. Derived status, current notices and source attribution
remain separate from historical body content. Latest saved does not mean
scientifically adequate or applicable. Native text uses a separate `captures`
expansion; agent-authored items remain in the interpreting delivery's
`agent_recording.items`. For reconciled replies, current metadata links the
authoritative capture and item interpretation while historical bodies stay intact.
`brief.unfinished` is the final unfinished-work list;
`brief.operational.unfinished_locator` points to it. Focused open-question
inventories retain statements and remaining requests as brief bodies; selected
questions retain their full detail through the same record-version locator.

Exact lookup uses the existing `context` command:

```json
{"mode":"record","records":[{"record_ref":"evidence-example"},{"record_ref":"condition-effect","event_ref":"event-results"}]}
```

It always returns compact output; an explicit `--output-format legacy` is invalid.
Optional `expected_last_event_id` guards the read against a changed journal.
Each selector has an outcome and a body locator or explicit missing/derived
result. Without an event, retrieve the latest committed definition. With an event,
retrieve that definition only: a mention is not a definition, and an event is
not an implicit as-of selector. Superseded IDs remain directly retrievable.
This mode adds direct qualifications, not unrelated current conversation roots
or a recursively expanded study. Batch related known IDs instead of full-event reads.
Attached result conditions and their assumptions accompany every evidence kind,
including file and literature evidence, under the version rules below. Ordinary
evidence without linked conditions does not automatically need a scientific condition.

Full reviews, interpretations and prepared exchanges come from journal definitions,
not their projection indexes. Nested action decisions retain their defining path.
Run/checkpoint current status is separate from the authored historical record;
derived turns redirect to their contributing interpretation/work/closeout records.
An exchange definition is still a draft, even when an actual delivery exists.

Historical dependency versions require bindings owned by the selected record or
an explicitly selected scope/run. Unversioned historical references remain
explicitly unbound; current assumptions cannot stand in for the original ones.
Several runs may bind different conditions to the same evidence version: retain
each qualification context while sharing its record bodies. Missing qualifications
remain a gap, not evidence of an unconditional result.

Compact write receipts keep committed/replayed state, record IDs/locators,
alias mappings, state token, paths/hashes and real diagnostics. Observation
receipts do not echo the whole actual reply. Preparation retains one rendered
preview. Reuse these identities without another whole-state read.
Compact actual-item references use `status` for lookup and optional `answer_status`
for the recorded answer disposition. The delivery body keeps its original `status`.

### Dependency reads and legacy views

Legacy `context` remains available with optional selectors, e.g.
`{"focus_refs":["strategy-a"],"query":"timing","limit":20}`.
Focus IDs must be current. To find older wording without a known ID, start
with literal `history --query`, then retrieve the definition. Use focused
context when the current brief and exact source leave relevant dependencies
unclear; searching an old option need not reload the current neighborhood twice. Use
`status` directly for broad reassessment when no useful focus exists. Do not
page through everything by default.

Legacy context returns original record shapes, understanding/checkpoint,
source corrections and relevant work, with omissions and retrieval locators.
For pages, use `coverage.next_cursor` as `cursor`, unchanged focus/query, and
`last_event_id` as `expected_last_event_id`. Limit is 1..100, default 20
optional records, not conversation turns. Essential records can exceed it.
On `STALE_CONTEXT`, refresh and reassess. Use context's project/event identities
or status's `project.state_meta` for writes.

`history` retrieves full events using `--record-id`, `--event-id`, `--type` or
`--query`, with `--cursor`/`--limit` and `next_cursor`. `--record-id` matches
references as well as definitions; use exact mode for a known record's body.
The user, study and work views are read-only groupings from one journal state,
not additional files. Relevant legacy work paths remain:

| View | Use |
|---|---|
| `views.work.pending_consultant_questions` | Cross-focus question inventory with retrieval references |
| `views.work.question_memory` | Resolution, original/latest questions, exchanges and delivery/work references; expand relevant bodies |
| `views.work.exchanges` and `interpretations` | Full available records, delivery and unfinished-turn evidence |
| `views.work.actions` | Scopes, decisions, exact offers/basis, eligibility and findings awaiting discussion |

The prepared exchange stores the structured response draft and its renderer
version. It is authoritative for preparation, not for what the user saw.
The compact `project.exchanges` index is not the full reply:
its ordered question and option references support navigation, while journal
history and `views.work.exchanges` preserve the exact response fields. Section
headings and item numbers are derived from those fields by the saved renderer;
they are not independently authored records or stable IDs. Retrieve the relevant
actual reply record and its linked exchange before resolving a later section/item
reference, even when a newer reply reorders the same questions or options.

V9-v11 derive `response_items` for the draft order without saving another layout
record. `[To answer your question]` combines user answers, explanations and one
findings item in that order, retaining their distinct kinds and source paths.
Only user-answer items carry user-question IDs; finding items retain work refs.
The summary has no numbered position. Use those types when interpreting a later
reference, rather than assuming every answer-section item is a user question.
V10 scope answers also retain `scope_ref`; their full terms are derived from the
matching option in that exchange. The answer and short option remain distinct
typed items linked to the same saved scope.

From 7.5.6, an `exchange_delivery` may instead use `observation: "agent_recorded"`
and `capture_protocol: "agent-recorded-reply-v1"`. Its `agent_recording` contains
`before_incoming_ref`, the utility-derived first-intake `before_incoming_event_ref`,
and the ordered actual `items` described in
[reply recording](delivery.md#record-the-previous-reply). This is the agent's
faithful reading of the actual preceding reply, not a regenerated draft or host
capture. It carries no `observed_response_sha256` or native identity proof.
The delivery's existing `response_sha256` only links its prepared exchange.
With `actual-reply-reconciliation-v1`, optional `agent_recording.capture_ref`
links an earlier committed capture and `supersedes_recording_ref` replaces an
earlier interpretation of the same reply. Both references stay within that
exchange; replacement preserves the original following-user anchor and locator.
These links add neither another emission nor user permission. See
[delivery reconciliation](delivery.md#reconcile-records-of-the-same-reply) for
authority, retained-source requirements and capture-optional repair.

Actual items, labels, question/option mappings and findings govern subsequent
interpretation and conversation views. Omitted content stays omitted; saved
scope terms are not appended to the actual record. A `scope_ref` on an actual
option asserts that its complete material terms were conveyed unchanged in
meaning. Without that mapping the old protected scope is not selectable.
The journal keeps draft and actual record distinct; it does not rewrite history.

Action eligibility separates accepted permission from `current_direction` and
`executable_now`; waiting work can retain acceptance. Inspect current scope and
direction under [authorizations](authorizations.md#work-discuss-and-preserve-choices)
before resuming. Findings awaiting discussion need delivery recovery or presentation
of saved findings, never automatic recomputation.

## Record Ownership

The journal is the authoritative container. These existing logical records own
their respective information; generated summaries point back to them.

| Information | Designated home |
|---|---|
| Original user words | Primary evidence `source_excerpt` and original intake event |
| Source-supported study fact | Evidence with source, qualifications and version |
| User preference or restriction | `user_context` linked to user evidence |
| Unestablished premise | `assumptions` with status and basis |
| Target, boundary or scientific choice | Sourced `decisions`; `project_understanding` is the overview |
| Question, supported resolution and remainder | Existing `questions` |
| Intended answer | Prepared exchange; preparation does not establish communication |
| Computed result and its meaning | Manifested output plus evidence; `result_conditions` own claim/target/limits |
| Completed assessment | Historical specialist review; later reassessment remains identifiable |
| Last recorded scientific route assessment | `candidate_routes` with evidence/review links and defining event |
| Execution progress | Run lifecycle, separately derived from scientific adequacy |
| Offered work and acceptance | `action_scopes` and `action_decisions` with source/delivery bindings |
| Actual assistant communication | Retained delivery records and explicit same-reply interpretation links; one derived current view, with the prepared draft separate |

Save new information in its owner, then reconcile only justified consequences
for affected current assumptions, decisions, routes, conditions and overview.
Leave unaffected records untouched. Keep unresolved consequences explicit and
historical assessments dated; do not rewrite bound records merely to shorten them.
Independent conflicting sources retain their own attribution.

Overview linkage reports its last-written event and compatible explicitly sourced
decision candidates as `linked`, `ambiguous` or `unlinked`. This is navigation,
not proof of semantic agreement. A premise-change notice calls for assessing
the consequence; it does not itself invalidate a conclusion or permission.
Helper/Lead reconcile stale operational prose using existing route evidence
links and `last_review_id`. Do not add run/question/basis fields to routes.
Completed diagnostics establish execution, not a passed diagnostic or readiness
to report. Keep partial-answer records under the existing question contract.

## Record Field Conventions

All listed fields are required unless marked optional. The request envelope,
event types and field-specific replacement/retention rules are in
[Record Contract](memory.md#record-contract). Do not treat updates as deep merges.

Lists: `limitations`, `data_requirements`, `unmet_requirements` are strings;
`*_refs`, `evidence_for`/`evidence_against` are IDs. Design/support lists use
catalog IDs, not project IDs. Nonempty `additional_design_ids` needs a primary
`design_id`, is unique and excludes that primary and `custom_identification`.
`supersedes` is one same-kind ID; `last_review_id` is one review ID.
`claim_boundary` and `reopen_or_promote_when` are strings.

## Study and User Records

Read the relevant rows before supplying those records; preserve scientific
qualifications and attribution when using them for interpretation or synthesis.
Helper updates already justified implications before work; Lead reconciles
outgoing conclusions. New source text alone does not update dependent assumptions,
strategies, decisions or result conditions. Preserve unaffected records.

| Collection | Record |
|---|---|
| `project_understanding` | Partial strings: `objective`, `intended_use`, `audience`, `causal_target`, `current_claim_boundary`; legacy `materials` array retained for compatibility. Use file evidence and frozen inputs for the derived inventory. |
| `evidence` | `evidence_id`, `kind`: `user_statement`/`file`/`literature`/`computed`, `source_ref`, `summary`; optional `limitations`, `source_sha256`, `source_excerpt`, `complete_message`, utility-added `source_intake`, `supersedes`, `legacy`, `run_id` |
| `assumptions` | `assumption_id`, `statement`, `status`: `active`/`revised`/`retired`; optional `basis_refs`, `supersedes` |
| `decisions` | `decision_id`, `kind`: `target`/`investigation`/`design`/`execution`/`reporting`/`boundary`, `statement`, `status`: `current`/`superseded`/`withdrawn`; optional `basis_refs`, `user_contribution_refs`, `supersedes` |
| `candidate_routes` | `strategy_id`, `target`, `approach`, `status`, `reason`; optional `design_id`, `additional_design_ids`, `support_ids`, `data_requirements`, `claim_boundary`, `evidence_for`, `evidence_against`, `unmet_requirements`, `reopen_or_promote_when`, `last_review_id` |
| `user_context` | `context_id`, `kind`: `preference`/`constraint`/`communication`/`domain_expertise`/`statistical_expertise`, `statement`, nonempty `basis_refs`, `status`: `current`/`superseded`; optional `supersedes` |
| `action_scopes` | Immutable analysis/report scope revisions; exact fields and activation in [authorizations.md](authorizations.md) |

Strategy status: `possible`, `conditional`, `preferred`,
`unsupported_with_current_evidence`, `not_relevant`. Distinct targets,
populations/data routes keep distinct IDs; routine diagnostics do not.
Live same-ID route updates retain omitted optional fields. Explicit lists replace,
including `[]`; explain a deliberate change of evidence or qualification in
`reason` using its sources. Required fields remain explicit.

Route cards keep the last recorded scientific assessment separate from recorded
execution. Associated runs come only from explicit `assignment.strategy_ids` in
the run's bound scope or applicable interpretation, never similar prose or targets.
Keep multiple runs separate; an unlinked historical run remains in global progress.
Run completion means execution completed, not that checks passed or the route became
supported. For new route writes, keep live execution bookkeeping out of scientific
rationale; update the assessment only when findings justify it. Preserve old prose
and its defining event.

Small non-target inspections use `file` evidence.
New `computed` evidence requires a completed `run_id` and project-relative
manifested output as `source_ref`; load [runs](runs.md) only for artifacts.
Legacy source evidence uses `legacy: {source_project, source_version, verification}`:
`legacy_unverified` or `reviewed_summary`, never newly verified computations.

User context records attributed preferences and tentative communication needs.
Study facts belong in evidence, even when supplied by the user; link them instead
of copying them into another view. Domain and statistical expertise are separate,
revisable observations, not grounds to lower scientific standards.

## Prose Budgets and Purpose

These budgets apply to internal records. Public item budgets, counting rules
and semantic exceptions follow [Lead's response contract](team_lead.md#closeout).
`response_diagnostics` reports overlength or authored extra list structure on a
fresh receipt. These diagnostics are advisory: they neither truncate content nor
invalidate or change saved records, and do not require an exact retry.
Historical replies retain their original contract.

**Write for a later use, then apply the budget.** Preserve what a later turn
needs to choose work, interpret a finding, honor a restriction or revise a
conclusion. Keep consequential variable/group names, decision constants and
uncertainty. A broadly true topic summary is not enough.

| Field | What a later turn must recover | Budget |
|---|---|---:|
| `evidence.summary` | The source-supported fact or finding, with the timing, mechanism, population or qualification that changes its use. Attribute reported claims. | 80 words |
| `decisions.statement` | The actual choice, operative terms, decisive reason and material condition for revisiting it. Recommendation is not acceptance. | 80 words |
| `assumptions.statement` | The premise, where it applies and which interpretation relies on it. State consequential uncertainty; active does not mean established. | 60 words |
| Checkpoint narrative | The exact remaining question, what its answer changes and an attainable way to resolve it. Do not re-ask answered or unavailable information. | 60 words total |
| `review.summary` | The question resolved or narrowed, supported conclusion and use-changing limit. Name the actual result or failed check. | 150 words |
| Exchange reconciliation narrative | What changed in prior understanding or direction, what remains unresolved and the consequent next direction. Link acceptance, pause and deferral records. | 120 words total |
| Project-understanding narrative | Original objective, current causal target, intended use and supported claim boundary. Keep the immediate blocker in the checkpoint. | 300 words total |

Evidence states what a source reports or an analysis found; assumptions state
what interpretation relies on; decisions state a selected course and why. Use
several record types only when each has a distinct function. Link exact scope
terms, result conditions and source captures instead of retelling them. Retain
the decisive qualification beside a consequential claim, even when detail is linked.

| Broadly true but unhelpful | Useful later |
|---|---|
| "The study was randomized." | "The protocol describes random assignment among eligible households; excluded households were not part of the draw." |
| "The dictionary describes covariates." | "The dictionary records `followup_measure` after intervention; it cannot be treated as a baseline measurement." |
| "More operational information is needed." | "The budget is approved, but unit cost remains unknown, so feasible scale is unresolved. Check the procurement record for cost." |
| "The evaluation was successful." | "External validation estimates prediction error at one hospital; it does not establish calibration at other sites." |

These illustrate content selection, not sentence templates or findings to copy.
Keep summaries intelligible without the immediate exchange; avoid unexplained
"this," "as above," or generic "important limitations." Do not invent an action
implication for evidence. Exact estimates and guarantees belong in linked conditions.

Budgets are prospective drafting guidance, not targets to fill or validity
limits. Count whitespace-delimited words in only the designated prose:

- Checkpoint: `primary_uncertainty`, `why_it_matters`, and strings in
  `ways_user_can_help` and `consultant_led_options_if_unknown`, for both
  `payload.checkpoint` and `changes.consultation`.
- Reconciliation: strings in `changes`, `limitations`, `unresolved`, and
  `next_direction`, each counted once.
- Project understanding: `objective`, `intended_use`, `audience`, `causal_target`
  and `current_claim_boundary`, including initialization and partial updates.
- Other entries: only the named string. Exclude IDs, hashes, locator/reference
  arrays, checkpoint status/assignment metadata and understanding `materials`.

Fresh successful writes may return advisory `writing_warnings` entries with
`path`, `rule`, `words` and `budget`; aggregates identify their counting rule. They check only
new or explicitly changed prose, not unchanged submitted or inherited text.
An understanding narrative change checks its resulting combined narrative.
Exact retries omit warnings. Warnings are not journal events, errors or requests
to resubmit: a successful receipt remains committed. Apply feedback to subsequent
authoring, never automatically resave or emit a shortened substitute.

Do not truncate, split records to evade a budget, or create a detail file for
every summary. Retain necessary qualifications even over budget, without another
justification record. Raw captures, scope terms, code, numerical tables, full
reports and result conditions have no new cap. Never rewrite an old bound record
solely for brevity: even a cosmetic update can stale its accepted scope.

## Narrow Patches

With `concise-authoring-v1`, use these authoring-only forms in the usual
`changes` arrays for a committed record:

| Collection | Form and allowed fields |
|---|---|
| `questions` | `{question_id, patch: {status?, reason?, resolution?, basis_refs?}}` |
| `evidence` | `{evidence_id, patch: {summary?, limitations?}}` |

The utility clones the current record, replaces supplied fields and validates
the full result. Arrays replace, not union. A supplied `resolution` replaces
the whole object, with explicit `answer_refs` and `remaining`; nothing implies
answered status or an empty remainder. Existing source, origin and correction
rules still apply. For a supported partial answer:

```json
{"question_id":"question-capacity","patch":{"status":"open","reason":"Capacity is documented; future intake composition remains unknown.","basis_refs":["original-request","constraints-note"],"resolution":{"answer_refs":["constraints-note"],"remaining":["The future intake composition remains unknown."]}}}
```

Include all needed prior basis references when replacing that array. User-origin
questions cannot use consultant-question resolution. Withdrawal needs a newly
added question-basis reference to distinct quoted withdrawal evidence; that
evidence may already be committed or be captured normally in this event.

Unknown IDs, empty patches, duplicate same-ID entries, mixed full/patch fields,
unsupported fields and invalid nulls fail. Source identity/hash/excerpt/capture,
question identity/origin, scopes, acceptance and result conditions are not
patchable. Use their ordinary full form or immutable replacement and the sourced
correction path where required. For example, replacing a quoted answer's source
or attribution requires the full source record and appropriate correction, not
an evidence patch. Ordinary full-form file-source replacement remains supported:
old excerpt/legacy attribution is dropped when the source changes, while retained
limitations remain. Full submissions otherwise keep their existing omission rules.

The journal saves fully expanded records, not patches. Expansion occurs after
exact-retry and expected-head checks. Retry the identical original request after
uncertain commitment; an equivalent expanded request with the same event ID still
conflicts. From 7.5.5, a fresh update that leaves an existing evidence record's
entire expanded retained content identical preserves that record's version. The
journal event still advances, with the original request fingerprint retained.
This applies to evidence patches and full evidence updates, not new source IDs,
semantic similarity or other record types. Avoid resubmitting unchanged records;
any real change still advances its version. Historical events replay unchanged.

## Incoming User Sources

Helper uses this for capture and [interpretation](helper.md#resume-and-interpret);
Lead for attribution repair. Resolve consequential meaning before dependent work.

On a primary `user_statement` source, optional boolean `complete_message`
requires string `source_excerpt`. Use true for the full actual capture, false for
known incompleteness. Presence of either value identifies a primary incoming
source; ordinary fact excerpts omit it. Keep honest `source_ref` attribution.
The marker does not independently prove host origin, completeness or meaning.
Attached documents remain separate evidence. Do not mark a summary as full text.

Fresh primary sources receive the utility's `source_intake: "primary-message-v1"`
marker. Source-only saves remain visible as pending intakes until interpreted;
they suspend protected starts and continuation while their direction is unresolved.
Older unmarked records are not retrospectively treated as pending messages.
If binding fails, explicitly save the unchanged source through `memory_updated`
and then interpret that source, preserving its original meaning and grouping.

Keep `summary` a concise attributed account of what the source says or supports,
including consequential qualifications and uncertainty. Preserve exact wording
in `source_excerpt`; do not copy a long message into its summary or interpretation
components. Summaries should carry the meaning needed for later decisions, with
detail governed by that need rather than a fixed length.

One intake uses the ordered marked source IDs in `interpretation.incoming_refs`.
A contiguous captured batch is one intake. Reinterpretations reuse the same IDs
and order; partial overlaps/reordering of established marked groups are rejected.
New input gets new IDs even with identical text; old material belongs in basis
references. Legacy unmarked history has provisional grouping/completeness, not
five verified full messages. Missing/incomplete captures retain their position.

A primary source is a whole intake, not one fact. A new correction creates a new
intake; retain the old raw message and update only affected answers/conclusions.
Correcting "20 seats" in "20 seats; no pooling; keep replies brief" must not
supersede the entire message or discard pooling and preference. Optional fact
excerpts can carry independent qualification/supersession; omit `complete_message`
and retain exact attribution. If a new excerpt backs an answer, include it alongside
the primary source in `incoming_refs`. Grouping uses only marked primary sources.
Do not atomize every sentence or add unsupported component-level source fields.

A repair to a misquoted old message is different: use a sourced `correction`
against that old ID, explicitly restating `complete_message` when source/text
changes (`MESSAGE_COVERAGE_REQUIRED`). Preserve the historical representation;
the repair alone creates no intake. Do not use this mechanism for a new account.

Outgoing exchanges attach through `interpretation_ref`; `reconciles` can account
for older work without merging its turn. Observation IDs and identical hashes
alone do not establish that two captures are the same actual message. Preserve a
stable actual-message source locator when available and any uncertain emission
order; a late capture does not become a new conversation turn.

An action decision, user correction or user-supplied answer/withdrawal requires
the relevant exact words, including conditions such as "before we decide."
Bind actual questions/options through the interpretation; a summary or pause
request cannot establish acceptance. Repair missing excerpts from the conversation
when available. Excerpts are optional for other evidence and do not verify meaning
or origin. These live rules are advertised as `source-attributed-memory-v1`.

## Questions

Helper reads this before interpreting an affected answer or correction; Lead
uses it before changing question disposition. Preserve supported parts and exact
unanswered remainders; permission to act is not factual answer evidence.

| Collection | Record |
|---|---|
| `questions` | `question_id`, `statement`, `status`: `open`/`answered`/`retired`; `reason` required when closed, optional otherwise; optional `origin`: `user`/`consultant`, `basis_refs`, `resolution` as below; user-origin questions require nonempty `basis_refs` including a user-statement source |

Use `origin: "user"` for questions the user asks you to answer, and `consultant`
for information you want from the user or another source. Omitted origin in old
records stays unspecified; do not infer fictional user questions from them.
User-origin questions stay `open` while their answer remains unresolved, unless
explicitly withdrawn by the user. Record the supported resolution or withdrawal
and its source in `reason` and
`basis_refs`; use `retired` for withdrawal. A pending answer remains open even
when work completes or its source proves unavailable. Clear user-directed scope
closure can explicitly withdraw it without pretending an answer was established.

### Answer Resolution and Communication

These records describe different facts:

| Concept | Owner and meaning |
|---|---|
| Prepared answer | Exchange `response.user_questions`: the intended answer and its disposition |
| Supported resolution | Question `status`, `reason` and basis: whether its issue is resolved, still open or explicitly withdrawn |
| Actual answer | Delivery's mapped `kind: "answer"` item: actual wording, `question_ref` and optional `status: "answered"`, `"pending"` or `"withdrawn"` |

New ordinary mapped actual answers supply `status` judged from the actual wording,
not copied from the draft or current question. Existing items without it remain
readable but do not establish this disposition; `kind: "answer"` alone is
insufficient. An assistant's withdrawal acknowledgement cannot replace the user's
existing sourced withdrawal contract.

A supported resolved question can still have outstanding communication. The
existing unfinished views retain reconciliation notices when a prepared complete
answer lacks a mapped actual answer or the actual item explicitly remains pending.
An absent mapping may hide an unmapped explanation; do not infer failure from it.
Unavailable or historical evidence stays uncertain rather than creating a blanket
new backlog. Notices retain the question and direct prepared/actual record links.
A later applicable actual complete answer can satisfy the obligation; recapturing
an older reply cannot override it.

For an unchanged question, an omitted repeat does not undo an earlier explicit
complete answer. A renewed user question or actual reopening creates a new need;
reinterpreting the same incoming source does not. Retirement ends that obligation.
Earlier settled gaps stay settled; an obsolete answer cannot clear a gap for a
later question definition or renewed request.
When the saved question statement, resolution reason or basis changes, or a
correction targets it, an older answer's current applicability is unconfirmed.
The view retains both definition references and the actual answer for review.
This does not infer a change of meaning or require a repeat: reconcile the revision
before relying on that answer, and communicate a materially changed answer when
relevant. Use the existing correction contract for substantive answer revisions.

Reconcile the notice in the ordinary turn. If the actual answer was correct but
its recording was inaccurate, append a same-message recording correction under
[delivery reconciliation](delivery.md#reconcile-records-of-the-same-reply), preserving
the original history; host capture remains optional. Do not repeat an already
correct answer solely to repair its recording. If the actual reply omitted a
relevant answer or was misleading, provide a new visible answer or correction
under [delivery corrections](delivery.md#repairing-a-recording-or-correcting-a-sent-reply),
then record that new reply normally. If the supported scientific resolution
changed, revise the affected question and knowledge records and communicate the
consequential change. The utility does not automatically reopen the question.
The notice alone grants no permission and blocks no unrelated work. This adds no
supported-part/remainder schema or second answer ledger for user-origin questions;
that redesign remains deferred.

### Consultant Question Resolution

For reconciled consultant questions, `resolution` has `answer_refs` (evidence or
specialist-review IDs supporting the current answer) and `remaining` (strings
stating the exact unanswered parts). `basis_refs` may also explain why the question
was asked; `answer_refs` specifically attributes its answer and preserves source
qualifications. User-origin questions do not use `resolution`; they keep the
preceding answer/withdrawal contract without invented factual evidence records.

- `open` with resolution needs a nonempty remainder. A partial answer can add
  support while preserving the same question ID, original statement and remainder.
- `answered` after reconciliation needs nonempty answer references and an empty
  remainder. It means answered at the stated evidence level, not independently
  verified. A tentative recollection can answer a recollection question, not
  establish what occurred. Assumptions cannot substitute for factual evidence.
- `retired` may keep a remainder. Record why asking stops and retain the unknown's
  consequences in relevant decisions/limitations. A decline, scope change or
  desire to finish does not establish the missing fact.
- Live updates carry an omitted resolution. Explicit updates can narrow, clear
  or reopen the remainder; it is not append-only provenance. Replacing existing
  answer attribution needs a sourced correction or explicit evidence supersession,
  preserving history.
  Removing an unanswered part needs additional answer support or a sourced
  correction. Reusing the old partial answer after an instruction to finish is
  insufficient.
- New user answer references must match the current interpretation's incoming
  sources, unless an explicitly sourced correction establishes the update.
  Reconcile a context-dependent reply in a question-specific interpretation
  component with its observed exchange/delivery. A standalone fact can instead
  connect the question to its incoming source and answer references without a
  fictional delivery, using an `information` or `correction` component. A choice
  clarification can cite its observed selection when the question's basis links
  that original exchange. A specialist review can supply computational resolution.
  Earlier support already in `answer_refs` remains retained.
  To repair an old omitted answer from historical evidence, use a sourced
  `correction` identifying the question; do not relabel old evidence as newly
  received or invent delivery links. A fact explaining why the question matters
  can remain in `basis_refs` without becoming an answer to it.
  An answered update cannot coexist with a linked component's unresolved part
  of that same question unless subsequent findings or an explicit correction
  resolve it. Do not close one compound question from one answered part.
  After a complete user-account answer, retain independent-verification limits
  in source/claim qualifications, not that answer component's `unresolved`.
  If the question requires verification, keep its remainder open.

For protected answer replacement, a `correction` names the affected question in
`corrects_refs`, gives the source-supported reason and saves the new source with
the revised answer. It cannot contain an interpretation. Follow Helper's
[save order and interruption recovery](helper.md#save-and-hand-off), reusing the
new incoming source ID for interpretation. Ordinary additive partial answers
use one interpreted submission. See the [scoped example](#scoped-answer-correction-example).

Keep `statement` for the original issue and clarified public wording in exchanges.
A materially different question gets a new ID linked through existing basis
references. For ambiguous investigation choices without an action scope, retain
one clarification question with the original exchange in its basis. Reuse it
through clarification turns; do not fabricate an option selection.

## Target and Boundary Updates

Read before changing objective, target or claim meaning, including during incoming
interpretation; do not wait until an outdated scope has already been selected.

When changing `objective` or `causal_target`, identify the relevant current sourced
target decision. A changed `current_claim_boundary` may cite a current target or
boundary decision. Use `interpretation.basis_refs`, `exchange.basis_refs`,
`payload.corrects_refs`, or the IDs updated in `changes.decisions`. Source linkage
may traverse existing evidence, assumptions, decisions and reviews. Update that
decision for a substantive meaning change; a cosmetic summary rewording may cite
its unchanged version.
Record source-linked decisions and affected summary fields together rather than
only appending evidence. Helper applies known implications before work; Lead
checks consistency after findings. If implications remain unresolved, record that
restriction rather than inventing a target or silently narrowing the original
objective. Initialization and historical replay remain separate. Current protected
work binds relevant target/boundary decision sources under [authorizations](authorizations.md);
the utility checks links and versions, not semantic equivalence or contradiction.

## Result Conditions

Read before contributing, reusing or reporting a consequential finding. Keep the
scientific duty in the selected role; these fields preserve its supported account.

| Collection | Record |
|---|---|
| `result_conditions` | `condition_id`, `evidence_ref`, `result_locator`, `claim`, `target`, `assumption_refs`, `basis_refs`, `limitations`; optional `inference`, `supersedes` |

Result conditions identify a separately reportable quantity or claim within
evidence. `result_locator`, `claim` and `target` are nonempty text; references
are ID arrays and limitations are strings. Optional `inference` has `kind`:
`test`/`interval`/`estimate`, `target`, `guarantee`; a test also requires
`hypothesis`. Record the actual scope of an exact, approximate or conditional
guarantee. Use separate records when quantities have different conditions.
An empty `assumption_refs` is an explicit assessment, never inferred from a
missing record. Old unlinked results need review of their saved limitations;
do not label them unconditional or invent past links. Preparation output needs
no artificial inferential target. Reports freeze condition and assumption
versions through [runs.md](runs.md).

After reassessing a changed premise, update the existing condition ID with its
reviewed basis. For example, resubmit `condition-effect` with the unchanged
`evidence_ref`, `result_locator`, `claim`, `target`, `inference`, `assumption_refs`
and `limitations`, adding `evidence-dictionary` to `basis_refs`. Do this only after
reviewing the dictionary's effect on that claim. The new saved condition records
that reassessment; unrelated conditions and frozen historical warnings are unchanged.

## Case Brief Selection

Helper uses this when retaining incoming knowledge; Lead when curating knowledge
and reviewed work. Removing a selection cannot change the underlying fact.

| Collection | Record |
|---|---|
| `case_brief` | Optional selection object: `knowledge_refs` (evidence IDs), `work_refs` (review/run IDs); per-field replacement with omitted fields retained |

`changes.case_brief` contains one or both of `knowledge_refs` and `work_refs`.
Each list contains distinct IDs in display order and replaces that supplied list;
an omitted field retains its value. Existing and same-event records are valid,
including a review bundled with closeout. Unknown/wrong-kind IDs, extra fields,
`null` and an empty object are invalid. Never supplied means uninitialized;
`[]` means intentionally empty. Do not initialize an omitted field implicitly.

Helper adds consequential incoming knowledge while preserving relevant selection.
Lead retains supported findings and reconciles superseded or out-of-scope items.
Choose records because they support the current objective, unresolved decision or
still-applicable qualification, not because they appeared in the latest turn.
Replace an accumulated all-history selection with the relevant retained set when
closing work; older records remain retrievable. Update attributed understanding
at the same reconciliation when a material fact changes, such as a requested file
arriving. Selection alone cannot repair a stale objective or materials statement.
Use existing interpretation/reconciliation to explain consequential changes.
Removing a reference affects inclusion only; it cannot delete evidence, resolve
questions, retire assumptions or change permission. Correct facts through the
ordinary source-linked correction rules. A selected superseded/conflicting source
stays visibly qualified until selection is reconciled; do not treat it as current
uncontested knowledge or silently replace its historical source.
When recorded answer support changes, the brief pairs retained earlier user
accounts with the question's current resolution. This qualifies that answer's
use of the source while preserving the original message and its other information.

Current user context, objective/target/boundary, active assumptions, operative
decisions, unresolved issues, candidate-route conditions, pending scopes/work
and unfinished communication remain automatic brief content. Conditions on a
selected result remain attached. A retired question's unknown still restricts
relevant claims; completed execution alone supplies no scientific finding.
Cards display selected fields without paraphrasing or truncating their text.
Explicitly selected current work/evidence or unfinished work selects its Lead
discussion; dependency expansion alone does not revive all older discussions.
Show a selected completed discussion once, without repeating its review summary;
otherwise use the saved review summary. Limitations and remaining uncertainty
stay visible. Pending reviews show their findings unless a selected Lead
discussion supplies the displayed account; their full findings remain retrievable
by record ID. That display choice does not establish delivery or complete pending
work. Work logs and detailed completed findings are retrieved by record ID. Put each
scientific qualification in its appropriate limitation/condition field, not only
in a procedural narrative. Conditions governing open questions, pending work or
unconsumed scopes retain their exact claims and inference guarantees, including
for old questions and paused accepted actions. Other conditions show their target,
assumptions and limitations, with precise claim/inference retrieval before use.
A `not_relevant` route retains its disposition, reason,
reopening condition and evidence references; its evidence is expanded only when
another selected record, live route or control depends on it. Unsupported routes
retain their prerequisites. Answered questions retain their resolution without
repeating old requests; open questions retain their last saved request.
Unselected evidence/work remains available through context/history. Maintain
underlying records and references, never paraphrase the previous brief again.
Showing a summary does not establish discussion or completion, and hiding a
completed narrative changes neither pending-work controls nor report eligibility.
For example, before answering whether a completed result supports a new population,
retrieve its exact target, claim and inference guarantee, then explain the scope
and transport limits. A navigation summary or retrieval link alone is insufficient.
Aim for about 1,000 to 1,500 words in a newly authored case of moderate complexity;
retain necessary live conditions beyond that target. Legacy prose stays exact.

## Checkpoints and Reviews

The selected specialist and named commit owner need this contract before supplying
a handoff. Helper uses the checkpoint/assignment fields when selecting work.
The handoff can carry already-loaded requirements; no default full reference read.
Use the [prose purposes and budgets](#prose-budgets-and-purpose): the summary
states the conclusion and use-changing limit, findings hold substantive results,
and work performed records what was actually done. Link detailed outputs instead
of repeating the whole case in each field. Result conditions retain exact guarantees.

| Collection | Record |
|---|---|
| `consultation` | Current/next checkpoint or `null` |

Checkpoint requires `checkpoint_id`, `status`, `primary_uncertainty`,
`why_it_matters`. Status is `assessing`, `awaiting_user`,
`ready_for_specialist` or `specialist_complete`, a resumption hint not permission.
Optional string arrays: `ways_user_can_help`,
`consultant_led_options_if_unknown`. Optional ID arrays:
`strategy_ids_it_could_change`, `user_contribution_refs`,
`related_unresolved_question_refs`. Optional `selected_assignment`.

Review requires `review_id`, `summary`, `assignment`,
`question_addressed`, `selection_basis`, `work_performed`, `findings`.

- Assignment: `specialist_id`, `operation`. Data audit uses `review`/`prepare`;
  domain `review`; causal check `readiness`/`design_elicitation`; discovery
  `discovery`; design worker `feasibility`/`execution`; report writer
  `reporting`. Design worker also needs `design_id`. Optional
  `additional_design_ids` (design worker only), `support_ids`, `strategy_ids`.
- Selection basis: `checkpoint_id`, nonempty `user_contribution_refs` pointing
  to user-statement evidence. This explains selection, not scientific validity.
- `work_performed`/`findings`: nonempty string arrays. Optional string arrays:
  `limitations`, `noise_or_invalid_information`, `remaining_uncertainty`;
  optional string `suggested_next_uncertainty`; optional ID arrays
  `evidence_refs`, `route_changes`, `assumptions_added_or_revised`.
- `interpretation_ref`: the committed specialist interpretation for this review.
  Required after this project starts using the exchange protocol. Copy its
  selected assignment exactly; a lead-only interpretation cannot authorize a
  specialist review, and one interpretation completes at most one review.
  Record additional guidance consulted within unchanged scope in `work_performed`,
  naming the actual guide/file; do not amend the assignment or frozen plan IDs.

For a direct investigation request, save its interpretation, checkpoint and user
evidence before dependent specialist work. Protected analysis/reporting requires
the current presented scope and later acceptance under the action contract;
ordinary selection rationale cannot substitute for them.
Historical pre-protocol reviews may contain retrospective combined selection;
do not rewrite them or use that older convention for new work.
`payload.checkpoint` is the selection checkpoint; put a
new question's checkpoint in `changes.consultation`, not the completed review's
selection basis. `consultation: null` clears the checkpoint, not open questions.
Helper updates affected uncertainty before work. At closeout, Lead retains,
updates or clears the checkpoint to match the exact remaining issue and proposed
direction. A completed assignment or answered question does not itself resolve
the wider checkpoint; proposed direction does not establish user selection.

Use the existing checkpoint's `primary_uncertainty` and `why_it_matters` to
record what the selected check could change and its attainable source. The
review records the actual finding and its effect on the strategy, including a
justified unchanged recommendation. Do not create artificial comparison records
when one check is clearly useful.

When useful, the specialist proposes answerable wording, consequence and source
in `remaining_uncertainty` or `suggested_next_uncertainty`. Save material
unresolved proposals as consultant-origin questions with `statement`, `reason`,
`basis_refs`. The same handoff addresses assigned user-question IDs with the
findings that answer them or the specific reason each remains unresolved.
The lead owns priority/wording and checkpoint `related_unresolved_question_refs`.

## Compatibility

Historical events replay their original replacement semantics and renderer bytes.
An older question without `resolution` has unstructured answer state, not a known
empty remainder. Reconcile touched records from attributable history or retain
the gap; do not bulk-migrate or manufacture past answers. Unmarked old incoming
sources remain provisional as described in [Incoming User Sources](#incoming-user-sources).

Current policy exchanges use `lead-markdown-v11` (reader 7.5.5) with
`section-item-labels-v1`, `visible-scope-answers-v1`, `four-section-responses-v1`,
`conversational-responses-v1` and `compact-proposals-v1`; v1 through v10 remain available
for exact historical replay and receipts. Do not relabel old exchanges or normalize
their saved response to record delivery. Existing history acquires no retrospective
approval. Use [authorizations](authorizations.md#activate-the-current-policy) for
activation/legacy review reconciliation and [delivery](delivery.md) for historical
hash-only observations and actual capture recovery. Compatibility details do not
waive the current utility capabilities required by [memory](memory.md).
Agent-recorded replies additionally require the 7.5.6 recording capability;
earlier capture records retain their own attribution and matching semantics.
Reader 7.5.9 additionally preserves mapped actual-answer `status` and derived
communication reconciliation notices. Older items without disposition retain
their attribution gap; historical records are not rewritten.
Reader 7.5.10 distinguishes compact `answer_status` from lookup status and keeps
earlier communication qualified by its question definition.

## Examples

Consult when assembling a first Lead-only submission and no adequate example is
already available. Use actual case facts and current receipt identities.

### Scoped Answer Correction Example

`user-initial` captures "20 seats; no pooling; keep replies brief." The answered
`question-capacity` cites it; pooling and preference have separate current records.
The next message is "Correction: seventeen seats, not twenty."

1. Submit `correction` with `corrects_refs: ["question-capacity"]` and the
   correction reason. In `changes`, add `user-correction` with that full quote,
   honest source/summary and `complete_message: true`. Update the same question,
   retaining its original statement/basis, with `status: "answered"`, the sourced
   reason and `resolution: {"answer_refs":["user-correction"],"remaining":[]}`.
2. Using the receipt, submit its interpretation with
   `incoming_refs: ["user-correction"]`, a `correction` component and affected
   question in `basis_refs`; a direct Lead closeout can bundle this step.

Retain `user-initial` unchanged, without whole-message supersession. Pooling and
preference still cite it. Update any capacity-dependent conclusion before work.

### Lead-Only First Round Example

After a new `init` returns event-init with the action policy active, one submission can save the attributed request,
answer the user's prerequisite question and ask for a missing study fact.
This is an authoring example, not evidence about a real study:

```json
{
  "event_id": "event-intake", "expected_project_id": "project-study",
  "expected_last_event_id": "event-init", "type": "exchange_prepared",
  "payload": {
    "protocol": "durable-exchanges-v1",
    "changes": {
      "case_brief": {"knowledge_refs":["user-request"],"work_refs":[]},
      "evidence": [{"evidence_id":"user-request","kind":"user_statement","source_ref":"chat:1","source_excerpt":"What does an offer effect mean? Please explain that before we decide which comparison to analyze.","complete_message":true,"summary":"The user asks what an offer effect means before deciding which program comparison to analyze."}],
      "questions": [
        {"question_id":"question-offer-effect","origin":"user","statement":"What does an offer effect mean?","status":"answered","reason":"Explained the distinction between being offered a place and attending; the study-specific assignment remains unknown.","basis_refs":["user-request"]},
        {"question_id":"question-offers","origin":"consultant","statement":"How were program offers assigned?","status":"open","reason":"Assignment determines what comparison can support.","basis_refs":["user-request"]}
      ]
    },
    "interpretation": {
      "interpretation_id":"interpretation-intake","turn_id":"turn-intake","incoming_refs":["user-request"],
      "components":[{"kind":"question","user_question_ref":"question-offer-effect","answer_timing":"before_work","meaning":"Explain the offer effect before choosing a comparison.","established":["The user needs the target distinction before deciding."],"unresolved":["Assignment procedure is unknown."]}],
      "basis_refs":["user-request"],
      "next_action":{"kind":"lead_only","scope":"Explain the offer effect and ask about allocation.","reason":"The explanation precedes the user's choice of comparison."}
    },
    "exchange": {
      "exchange_id":"exchange-intake","turn_id":"turn-intake","interpretation_ref":"interpretation-intake",
      "basis_refs":["user-request"],"completed_work_refs":[],"renderer":"lead-markdown-v11",
      "reconciliation":{"changes":["Explained the offer-effect target before selecting work."],"limitations":["Allocation has not been described."],"unresolved":["How program offers were assigned."],"next_direction":"Obtain the study procedure."},
      "response":{
        "user_questions":[{"question_ref":"question-offer-effect","text":"What does an offer effect mean?","answer":"It compares outcomes under being offered a program place versus not being offered one. People may choose whether to attend, so this is a different question from the effect of attending. Which comparison we can support depends on how the offers were assigned.","status":"answered","basis_refs":[]}],
        "questions":[{"question_ref":"question-offers","text":"How was it decided who received an offer?","needed":"A description of the decision or the allocation protocol would help."}],
        "next_steps":[]
      }
    }
  }
}
```
