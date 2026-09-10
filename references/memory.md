# Project Memory

Use `<skill-root>/scripts/project.cjs`. `journal.jsonl` is authoritative;
`project.yaml` is a rebuildable JSON-form YAML projection. Never hand-edit either.

```text
node <skill-root>/scripts/project.cjs <command> --project-root <folder>
```

Check `node <skill-root>/scripts/project.cjs capabilities` once for a loaded helper;
it needs no project root. This skill requires `durable-exchanges-v1` and
`user-question-routing-v1`; check capabilities rather than version alone because
earlier 7.0.5 candidates lack question-aware routing and `lead-markdown-v3`.
Do not write these records with an older helper. Existing v7 histories
remain readable without adding fictional past exchanges; v6 is not converted.

Commands: `init`, `status`, `context`, `history`, `record`. Record requires
`--input <json-file|->`; context accepts it. Init leaves existing v7 intact,
refuses v6. Reads never mutate. Reuse receipt identities; no reread merely for IDs.

## Reading

`context` takes optional `--input`, e.g.
`{"focus_refs":["strategy-a"],"query":"timing","limit":20}`.
Focus IDs must be current. Literal case-insensitive query hits need focused
retrieval for dependencies. Use `status` for broad reassessment/no useful focus;
paging everything repeats roots and can cost more.

Context returns original shapes, understanding/checkpoint, support/opposition,
corrections/dependents and incomplete work, with selection reasons, omissions,
counts and history locators. Same-ID changes expose neighbors without invalidation.
Check omissions and `orphan_run_paths`; missing links/exhausted pages do not
prove sufficiency. Summaries are not full reviews.

For pages, use `coverage.next_cursor` as `cursor`, unchanged focus/query, and
`last_event_id` as `expected_last_event_id`. Limit 1..100, default 20; essential
records can exceed it intact. On `STALE_CONTEXT` restart. Write IDs: context's
`project_id`/`last_event_id`, or status's `project.state_meta`.

`history` returns full events via `--record-id`, `--event-id`, `--type` or `--query`,
with `--cursor`/`--limit` and `next_cursor`. Use it for earlier answers/full reviews,
not a default whole-journal read. New user, study and work views group relevant
records from the same journal version. They are read-only views, not separate
files to edit. The work view supplies actual exchange/interpretation bodies
missing from compact projection indexes, observed delivery and unfinished turns.
Open user-origin questions are also retained as context roots so a later turn
can find deferred answers after the immediate focus changes.
Check its coverage before interpreting a reply dependent on a past question.

## Record Contract

Request: `event_id`, `expected_project_id`, `expected_last_event_id`,
`type`, `payload`. Internal IDs match `[a-z][a-z0-9_-]{0,79}`.
Use a new event ID and reuse that exact request on an uncertain retry.

| Type | Payload |
|---|---|
| `checkpoint` | `checkpoint`, optional `changes` |
| `memory_updated` | `changes` |
| `review_completed` | `review`, optional `checkpoint`, `changes` |
| `correction` | `corrects_refs` (committed IDs), `reason`, `changes` |
| `reply_interpreted` | `protocol`, `interpretation`; optional `changes`, `checkpoint`, prior `delivery` |
| `exchange_prepared` | `protocol`, `exchange`; optional `changes`, `checkpoint`, `review`, lead-only `interpretation`, prior `delivery` |
| `exchange_delivery` | `protocol`, `delivery` |

For the three exchange types, `protocol` is exactly `durable-exchanges-v1`.
These record boundaries follow [team_lead.md](team_lead.md). A lead-only round
can combine interpretation and closeout; a specialist turn first records its
interpretation, then can combine the completed review and lead closeout.

Combine related changes. Collections upsert by ID; **same-ID records replace
completely**, so retain optional fields, references and qualifiers. Omission
leaves other records unchanged; empty arrays do not delete. Only understanding
merges partial fields. References identify existing/same-event records; paths,
URLs and `chat:turn-2` are source locators, not IDs.

### Changes

All listed record fields are required unless marked optional.

| Collection | Record |
|---|---|
| `project_understanding` | Partial strings: `objective`, `intended_use`, `audience`, `causal_target`, `current_claim_boundary`; `materials` source-locator array |
| `questions` | `question_id`, `statement`, `status`: `open`/`answered`/`retired`; `reason` required when closed, optional otherwise; optional `origin`: `user`/`consultant`, `basis_refs`; user-origin questions require nonempty `basis_refs` including a user-statement source |
| `evidence` | `evidence_id`, `kind`: `user_statement`/`file`/`literature`/`computed`, `source_ref`, `summary`; optional `limitations`, `source_sha256`, `source_excerpt`, `supersedes`, `legacy`, `run_id` |
| `assumptions` | `assumption_id`, `statement`, `status`: `active`/`revised`/`retired`; optional `basis_refs`, `supersedes` |
| `decisions` | `decision_id`, `kind`: `target`/`investigation`/`design`/`execution`/`reporting`/`boundary`, `statement`, `status`: `current`/`superseded`/`withdrawn`; optional `basis_refs`, `user_contribution_refs`, `supersedes` |
| `candidate_routes` | `strategy_id`, `target`, `approach`, `status`, `reason`; optional `design_id`, `additional_design_ids`, `support_ids`, `data_requirements`, `claim_boundary`, `evidence_for`, `evidence_against`, `unmet_requirements`, `reopen_or_promote_when`, `last_review_id` |
| `user_context` | `context_id`, `kind`: `preference`/`constraint`/`communication`/`domain_expertise`/`statistical_expertise`, `statement`, nonempty `basis_refs`, `status`: `current`/`superseded`; optional `supersedes` |
| `result_conditions` | `condition_id`, `evidence_ref`, `result_locator`, `claim`, `target`, `assumption_refs`, `basis_refs`, `limitations`; optional `inference`, `supersedes` |
| `consultation` | Current/next checkpoint or `null` |

Strategy status: `possible`, `conditional`, `preferred`,
`unsupported_with_current_evidence`, `not_relevant`. Distinct targets,
populations/data routes keep distinct IDs; routine diagnostics do not.

Lists: `limitations`, `data_requirements`, `unmet_requirements` are strings;
`*_refs`, `evidence_for`/`evidence_against` are IDs. Design/support lists use
catalog IDs, not project IDs. Nonempty `additional_design_ids` needs a primary
`design_id`, is unique and excludes that primary and `custom_identification`.
`supersedes` is one same-kind ID; `last_review_id` is one review ID.
`claim_boundary` and `reopen_or_promote_when` are strings.

Attribute qualified user accounts; `source_excerpt` optionally preserves exact
wording, not verification. Small non-target inspections use `file` evidence.
New `computed` evidence requires a completed `run_id` and project-relative
manifested output as `source_ref`; load [runs](runs.md) only for artifacts.
Legacy source evidence uses `legacy: {source_project, source_version, verification}`:
`legacy_unverified` or `reviewed_summary`, never new v7 computations.

User context records attributed preferences and tentative communication needs.
Study facts belong in evidence, even when supplied by the user; link them instead
of copying them into another view. Domain and statistical expertise are separate,
revisable observations, not grounds to lower scientific standards.

Use `origin: "user"` for questions the user asks you to answer, and `consultant`
for information you want from the user or another source. Omitted origin in old
records stays unspecified; do not infer fictional user questions from them.
User-origin questions stay `open` until answered or explicitly withdrawn by the
user. Record the resolution or withdrawal and its source in `reason` and
`basis_refs`; use `retired` for withdrawal. A pending answer remains open even
when work completes or its source proves unavailable. Clear user-directed scope
closure can explicitly withdraw it without pretending an answer was established.

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

### Checkpoint and Review

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

For a direct request, save its interpretation, selection checkpoint and user
evidence before dependent specialist work, without another user approval.
Historical pre-protocol reviews may contain retrospective combined selection;
do not rewrite them or use that older convention for new work.
`payload.checkpoint` is the selection checkpoint; put a
new question's checkpoint in `changes.consultation`, not the completed review's
selection basis. `consultation: null` clears the checkpoint, not open questions.

Use the existing checkpoint's `primary_uncertainty` and `why_it_matters` to
record what the selected check could change and its attainable source. The
review records the actual finding and its effect on the strategy, including a
justified unchanged recommendation. Do not create artificial comparison records
when one check is clearly useful.

## Interpretation and Closeout Records

All fields below are required unless marked optional. Use fresh project-local
identities for each incoming turn, interpretation, exchange and observation.
These are records of the exchange, not private internal reasoning.

### Interpretation

`interpretation_id`, `turn_id`, nonempty `incoming_refs` (user-statement IDs),
`components`, `basis_refs`, `next_action`.

Each component has `kind` and `meaning` strings, plus `established` and
`unresolved` string arrays.
Kinds: `question`, `answer`, `selection`, `correction`, `information`, `instruction`,
`clarification`, `delegation`, `unknown`. A mixed reply can have several components.
`question` means a question asked by the user, including a request for explanation.
It requires `user_question_ref` naming an `origin: "user"` question and
`answer_timing`: `before_work`, `after_work` or `clarify_first`. Save its source
and question record in `changes` before any dependent work. These are dependencies
for the current action, not promises that a calculation can settle every question.
Use `before_work` for an answer needed before action, `clarify_first` when the
question needs material clarification, and `after_work` for an answer to deliver
with the authorized work's closeout. An independent answerable question can be
retained for that closeout without making it a work prerequisite.

Optional `exchange_ref`, `question_ref`, `option_id`, `delivery_ref` bind a reply
to its actual preceding exchange. Here `question_ref` means an answer to an
earlier consultant question, not the user's new question; a `question` component
uses `user_question_ref` without these prior-delivery bindings. A selection requires its stable option ID;
question/option bindings require matching exchange and delivery references.
The displayed option number selects the corresponding entry in that exchange's
ordered list. A clear new instruction needs no preceding exchange.

`next_action` has `kind`: `lead_only` or `specialist`, `scope`, `reason`.
Specialist work also requires `assignment` in the existing assignment shape;
lead-only work has no assignment. Basis references and the expected predecessor
bind the decision to current evidence. Optional `clarification_needed` is a
nonempty reason why the current instruction needs clarification. Any such reason,
or a question component with `before_work` or `clarify_first`, requires
`kind: "lead_only"` and no specialist assignment. An `after_work` question can
remain pending in a lead-only turn if another part blocks work. The helper checks
the recorded dependencies, not whether the router understood the user correctly.
Reassess changed premises before choosing
work; a selected action does not confirm its scientific assumptions. If the new
route differs from a selected option's recorded assignment, or selects specialist
work when that option had no specialist assignment, supply `adjustment_reason`
explaining the current instruction or evidence that supports the change. A plain
discussion or information-sharing selection cannot silently become specialist
work; documenting an adjustment is not scientific approval or new user direction.

### Exchange

`exchange_id`, `turn_id`, `interpretation_ref`, `basis_refs`,
`completed_work_refs`, `reconciliation`, `response`, `renderer: "lead-markdown-v3"`.
Use v3 for new exchanges; it renders `[Your Questions]` when present, then
`[Status]`, `[I want to know]` and `[Decide Next Steps]`. The helper retains
v1 and v2 for exact replay and receipts of earlier exchanges. Do not relabel an
old exchange or normalize its saved response when recording delivery.
The interpretation and turn must match. Work references identify reviews or
terminal runs; account for every recorded completed, failed or abandoned item
of a turn being closed. An in-progress run is not completed work.

Optional `reconciles` lists other interpretation IDs whose unfinished work this
closeout explicitly accounts for. Explain their disposition in reconciliation;
new user direction must not erase them. Optional `supersedes` links a revised
exchange of this same turn. Revise by appending, never overwriting an old reply.

`reconciliation`: `changes`, `limitations`, `unresolved` string arrays and a
`next_direction` string. The lead owns this account, including unchanged findings
and unresolved impacts; the helper cannot certify its scientific completeness.

`response`: `status` string, `questions` array, `next_steps` array, optional
`user_questions` array. An empty
questions array requires `questions_none`; empty next steps requires
`next_steps_none`. Supply the actual short text for those empty sections instead
of manufacturing another question or investigation.

- User question (`user_questions`, v3): `question_ref`, `text`, `answer`,
  `status`: `answered`/`pending`/`withdrawn`, `basis_refs`. The question
  must have `origin: "user"`; these statuses respectively match its effective
  `answered`/`open`/`retired` record after this submission's changes. `answer`
  supplies the actual answer, the reason and remaining need when pending, or
  acknowledgment of withdrawal. Cite saved evidence and conditions for empirical
  answers; the array may be empty for a conceptual explanation with no specific
  stored evidential basis. Include every user question
  in the current interpretation, even when pending, and relevant carried questions.
  Do not repeat unrelated old questions merely to fill the section.
- Consultant question (`questions`): `question_ref`, `text`, `why`, `needed`
  (what information helps resolve it). Use consultant-origin or legacy questions,
  never a user-origin question. This array renders under `[I want to know]`;
  all its text is retained for binding the next reply.
- Next step: exchange-local `option_id`, `kind`: `action`/`discussion`, `label`,
  `actor`, `scope`, `basis_refs`. Optional `assignment` applies only to an
  `action` with `actor: "consultant"` and records intended specialist work.
  Displayed order is array order; keep `label` on one line. A discussion invitation
  is not execution. The renderer indents subordinate multiline text so it cannot
  appear as an additional numbered option.

The preparation receipt returns `exchange_id`, `renderer`, `rendered_response`
and `response_sha256` along with commit identity. Present **rendered_response
unchanged**. It comes from the same payload that was committed. If the wording
needs correction, prepare a new exchange with a supersession link. A receipt
means saved and prepared, not emitted, delivered, read or understood.

### Delivery Observation

`delivery_id`, `exchange_ref`, `observation`: `assistant_emission` or
`host_confirmed`, `source_ref`, `response_sha256`; optional `observed_at`.
The hash must match the prepared response. Record only an actual visible message
or host observation with its source, never a preparation receipt as proof of
delivery. Host-confirmed delivery requires host evidence. A prior observation
can be batched with the next interpretation/lead-only closeout to avoid an extra
write. The helper checks matching records, not the truth of your observation.

If a bare "yes" or number depends on an unobserved prepared exchange, inspect
the actual previous message or clarify. An explicit new instruction can still
proceed. Legacy history without outgoing records remains a coverage limit.

### Lead-Only First Round Example

After `init` returns event-init, one submission can save the attributed request,
answer the user's prerequisite question and ask for a missing study fact.
This is an authoring example, not evidence about a real study:

```json
{
  "event_id": "event-intake", "expected_project_id": "project-study",
  "expected_last_event_id": "event-init", "type": "exchange_prepared",
  "payload": {
    "protocol": "durable-exchanges-v1",
    "changes": {
      "evidence": [{"evidence_id":"user-request","kind":"user_statement","source_ref":"chat:1","summary":"The user asks what an offer effect means before deciding which program comparison to analyze."}],
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
      "basis_refs":["user-request"],"completed_work_refs":[],"renderer":"lead-markdown-v3",
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

## Shared Question Handoff

When useful, the specialist proposes answerable wording, consequence and source
in `remaining_uncertainty` or `suggested_next_uncertainty`. Save material
unresolved proposals as consultant-origin questions with `statement`, `reason`,
`basis_refs`. The same handoff addresses assigned user-question IDs with the
findings that answer them or the specific reason each remains unresolved.
The lead owns priority/wording and checkpoint `related_unresolved_question_refs`.

On focus change and before concluding, retain unanswered user-origin questions
until an answer or explicit user withdrawal; they are not consultant requests
that can be retired merely because a source is unavailable. For consultant questions,
account for relevant open questions:
ask; defer while open with reason and return condition; or close with resolution
and provenance/reason, including unavailable or declined. Do not accidentally
bury user-resolvable issues as limitations; provisional limitations are honest.
Retirement does not establish an assumption.
Preserve the distinction between unasked, explicitly unknown, unavailable and
assumed in the question's reason and linked evidence/assumptions. An absent
field is not an unavailable record. Authorization for an analysis is a decision,
not an answer to its scientific questions. Complete an intermediate deliverable
without closing the original causal question; if the user narrows or ends that
inquiry, record the scope decision and remaining limits rather than claiming
the missing facts were established.
Use loaded state or expand to status/history when focused context cannot cover
relevant older open questions.

Preserve answer source/qualifiers; update strategies or explain no change.
Corrections require inspecting affected conclusions and recording known
implications together, preserving unaffected facts/history.

## Recovery

Commit before calling work saved; distinguish performed from committed work on
failure. On `STALE_WRITE` read/reconcile, never blindly change the predecessor.
On `PROJECT_LOCKED` retry; do not delete locks. `recover-lock --token` requires
a verifiably dead same-host owner; report unverifiable recovery needs.

`projection_written: false` still committed. Status reconstructs; `recover`
rewrites only the projection. `recover --repair-tail` preserves then removes
uncommitted trailing bytes, not interior corruption. Never repeat a specialist
to recreate a snapshot.

A run's finalization does not close its conversation. Inspect unfinished turns
and saved findings, complete lead reconciliation and prepare the next response
without repeating the analysis. New direction can explicitly reconcile older
unfinished work. A prepared exchange with uncertain delivery remains uncertain
until actual message evidence resolves it. Retry the same request on an uncertain
save; its receipt renders that committed exchange even after later events.
Use `current_last_event_id` from such a replay when present for subsequent writes,
after reconciling the newer state. An older receipt's `last_event_id` still names
its own commit.
