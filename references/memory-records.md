# Memory Record Reference

Use [memory](memory.md) for the common read/write contract. Read only the sections
needed before the current interpretation, reconciliation or submission; reuse
intact guidance. The complete [interpretation](helper.md#interpretation-submission)
and [exchange](team_lead.md#exchange-submission) contracts belong to Helper and Lead.

| Need | Section |
|---|---|
| Focused reads, pagination or older views | [Reading Details](#reading-details) |
| Field types and shared record fields | [Conventions](#record-field-conventions); [Study and User Records](#study-and-user-records) |
| Incoming source capture/correction | [Incoming User Sources](#incoming-user-sources) |
| Question meaning, answers or retirement | [Questions](#questions) |
| Objective, target or boundary change | [Target and Boundary Updates](#target-and-boundary-updates) |
| Consequential findings and their qualifications | [Result Conditions](#result-conditions) |
| Retained brief contents | [Case Brief Selection](#case-brief-selection) |
| Specialist selection or handoff | [Checkpoints and Reviews](#checkpoints-and-reviews) |
| Historical shapes or a first-round submission | [Compatibility](#compatibility); [Examples](#examples) |

## Reading Details

Brief context's envelope includes `format: "case-brief-v1"`; use the
[short guide](memory.md#reading) for its ordinary reading contract.

Legacy `context` remains available with optional selectors, e.g.
`{"focus_refs":["strategy-a"],"query":"timing","limit":20}`.
Focus IDs must be current. To find exact older wording without a known ID, start
with literal `history --query`, then retrieve the matching event. Use focused
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
`--query`, with `--cursor`/`--limit` and `next_cursor`. Use it for exact older
sources and complete review findings; projection review indexes omit details.
The user, study and work views are read-only groupings from one journal state,
not additional files. Relevant legacy work paths remain:

| View | Use |
|---|---|
| `views.work.pending_consultant_questions` | Cross-focus question inventory with retrieval references |
| `views.work.question_memory` | Resolution, original/latest questions, exchanges and delivery/work references; expand relevant bodies |
| `views.work.exchanges` and `interpretations` | Full available records, delivery and unfinished-turn evidence |
| `views.work.actions` | Scopes, decisions, exact offers/basis, eligibility and findings awaiting discussion |

Action eligibility separates accepted permission from `current_direction` and
`executable_now`; waiting work can retain acceptance. Inspect current scope and
direction under [authorizations](authorizations.md#work-discuss-and-preserve-choices)
before resuming. Findings awaiting discussion need delivery recovery or presentation
of saved findings, never automatic recomputation.

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

| Collection | Record |
|---|---|
| `project_understanding` | Partial strings: `objective`, `intended_use`, `audience`, `causal_target`, `current_claim_boundary`; `materials` source-locator array |
| `evidence` | `evidence_id`, `kind`: `user_statement`/`file`/`literature`/`computed`, `source_ref`, `summary`; optional `limitations`, `source_sha256`, `source_excerpt`, `complete_message`, `supersedes`, `legacy`, `run_id` |
| `assumptions` | `assumption_id`, `statement`, `status`: `active`/`revised`/`retired`; optional `basis_refs`, `supersedes` |
| `decisions` | `decision_id`, `kind`: `target`/`investigation`/`design`/`execution`/`reporting`/`boundary`, `statement`, `status`: `current`/`superseded`/`withdrawn`; optional `basis_refs`, `user_contribution_refs`, `supersedes` |
| `candidate_routes` | `strategy_id`, `target`, `approach`, `status`, `reason`; optional `design_id`, `additional_design_ids`, `support_ids`, `data_requirements`, `claim_boundary`, `evidence_for`, `evidence_against`, `unmet_requirements`, `reopen_or_promote_when`, `last_review_id` |
| `user_context` | `context_id`, `kind`: `preference`/`constraint`/`communication`/`domain_expertise`/`statistical_expertise`, `statement`, nonempty `basis_refs`, `status`: `current`/`superseded`; optional `supersedes` |
| `action_scopes` | Immutable analysis/report scope revisions; exact fields and activation in [authorizations.md](authorizations.md) |

Strategy status: `possible`, `conditional`, `preferred`,
`unsupported_with_current_evidence`, `not_relevant`. Distinct targets,
populations/data routes keep distinct IDs; routine diagnostics do not.

Small non-target inspections use `file` evidence.
New `computed` evidence requires a completed `run_id` and project-relative
manifested output as `source_ref`; load [runs](runs.md) only for artifacts.
Legacy source evidence uses `legacy: {source_project, source_version, verification}`:
`legacy_unverified` or `reviewed_summary`, never newly verified computations.

User context records attributed preferences and tentative communication needs.
Study facts belong in evidence, even when supplied by the user; link them instead
of copying them into another view. Domain and statistical expertise are separate,
revisable observations, not grounds to lower scientific standards.

## Incoming User Sources

Helper reads this before capturing or correcting incoming evidence; Lead uses it
when repairing attribution. Source meaning must be settled before dependent work.

On a primary `user_statement` source, optional boolean `complete_message`
requires string `source_excerpt`. Use true for the full actual capture, false for
known incompleteness. Presence of either value identifies a primary incoming
source; ordinary fact excerpts omit it. Keep honest `source_ref` attribution.
The marker does not independently prove host origin, completeness or meaning.
Attached documents remain separate evidence. Do not mark a summary as full text.

Keep `summary` a concise attributed account of what the source says or supports,
including consequential qualifications and uncertainty. Preserve exact wording
in `source_excerpt`; do not copy a long message into its summary or interpretation
components. Summaries should carry the meaning needed for later decisions, with
detail governed by that need rather than a fixed length.

If a sourced correction changes a marked record's source or text under the same
ID, explicitly restate `complete_message`; omission fails with
`MESSAGE_COVERAGE_REQUIRED`. Reassess coverage instead of inheriting a stale claim.

One intake uses the ordered marked source IDs in `interpretation.incoming_refs`.
A contiguous captured batch is one intake. Reinterpretations reuse the same IDs
and order; partial overlaps/reordering of established marked groups are rejected.
New user input gets new IDs even when its text is identical; old material belongs
in basis/context references. Later corrections cannot rewrite the historical
incoming representation. Legacy unmarked history remains a provisional view
with explicit grouping/completeness uncertainty, not five verified full messages.
Missing or incomplete captures retain their known position.

Outgoing exchanges attach through `interpretation_ref`; `reconciles` can account
for older work without merging its turn. Observation IDs and identical hashes
alone do not establish that two captures are the same actual message. Preserve a
stable actual-message source locator when available and any uncertain emission
order; a late capture does not become a new conversation turn.

Attribute qualified user accounts. For new user input backing an action decision,
user correction, or user-provided question resolution/withdrawal, retain the
relevant exact words in `source_excerpt`, including qualifications such as
"before we decide." Link the actual question or offered option through the
existing interpretation. Do not replace attribution with a summary or infer a
new acceptance from a digest/pause request. Excerpts remain optional for other
evidence and do not independently verify meaning or message origin.
The memory utility advertises these live-write rules as `source-attributed-memory-v1`.
Repair a missing internal excerpt from the available conversation; ask the user
only when their meaning or the source itself is unavailable or unclear.

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
User-origin questions stay `open` until answered or explicitly withdrawn by the
user. Record the resolution or withdrawal and its source in `reason` and
`basis_refs`; use `retired` for withdrawal. A pending answer remains open even
when work completes or its source proves unavailable. Clear user-directed scope
closure can explicitly withdraw it without pretending an answer was established.

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
  verified. Assumptions cannot substitute for factual answer evidence.
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
only appending evidence. Initialization and historical replay remain separate.
New protected offers bind a relevant current target decision, so changing it
exposes affected scopes; the memory utility checks references, not semantic equivalence.

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
Use existing interpretation/reconciliation to explain consequential changes.
Removing a reference affects inclusion only; it cannot delete evidence, resolve
questions, retire assumptions or change permission. Correct facts through the
ordinary source-linked correction rules. A selected superseded/conflicting source
stays visibly qualified until selection is reconciled; do not treat it as current
uncontested knowledge or silently replace its historical source.

Current user context, objective/target/boundary, active assumptions, operative
decisions, unresolved issues, candidate-route conditions, pending scopes/work
and unfinished communication remain automatic brief content. Conditions on a
selected result remain attached. A retired question's unknown still restricts
relevant claims; completed execution alone supplies no scientific finding.
Unselected evidence/work remains available through context/history. Maintain
underlying records and references, never paraphrase the previous brief again.

## Checkpoints and Reviews

The selected specialist and named commit owner need this contract before supplying
a handoff. Helper uses the checkpoint/assignment fields when selecting work.
The handoff can carry already-loaded requirements; no default full reference read.

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
At closeout, Lead retains, updates or clears this checkpoint according to the
remaining uncertainty and outgoing direction. An answered question alone does
not imply that the wider checkpoint is resolved.

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

Current policy exchanges use `lead-markdown-v4`; v1, v2 and v3 remain available
for exact historical replay and receipts. Do not relabel old exchanges or normalize
their saved response to record delivery. Existing history acquires no retrospective
approval. Use [authorizations](authorizations.md#activate-the-current-policy) for
activation/legacy review reconciliation and [delivery](delivery.md) for historical
hash-only observations and actual capture recovery. Compatibility details do not
waive the current utility capabilities required by [memory](memory.md).

## Examples

Consult when assembling a first Lead-only submission and no adequate example is
already available. Use actual case facts and current receipt identities.

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
      "basis_refs":["user-request"],"completed_work_refs":[],"renderer":"lead-markdown-v4",
      "reconciliation":{"changes":["Explained the offer-effect target before selecting work."],"limitations":["Allocation has not been described."],"unresolved":["How program offers were assigned."],"next_direction":"Obtain the study procedure."},
      "response":{
        "user_questions":[{"question_ref":"question-offer-effect","text":"What does an offer effect mean?","answer":"It compares outcomes under being offered a program place versus not being offered one. People may choose whether to attend, so this is a different question from the effect of attending. Which comparison we can support depends on how the offers were assigned.","status":"answered","basis_refs":[]}],
        "status":"The target distinction is clear; the assignment procedure is still needed to choose a defensible comparison.",
        "questions":[{"question_ref":"question-offers","text":"How was it decided who received an offer?","why":"The selection procedure determines which comparisons could be credible.","needed":"A description of the decision or a protocol describing it."}],
        "next_steps":[],"next_steps_none":"You can describe the procedure or share its record."
      }
    }
  }
}
```
