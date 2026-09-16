# Lead: Reconcile and Respond

You own the outgoing side of the consultation and its sole user-facing voice.
[Helper](helper.md) supplies the incoming interpretation and selected work, or a
direct request for explanation/clarification. Reuse that current handoff and
receipts; read missing evidence through [memory.md](memory.md), starting with
brief mode when current state is unavailable. Read
[authorizations.md](authorizations.md) for protected offers and report selection.
Read linked shared-record sections before reconciliation that depends on them;
reuse intact guidance and adequate handoffs, and recover missing contracts after
context loss. Do not load every record section merely because the role changes.
These are logical responsibilities of the same assistant, not extra agents.
Lead synthesizes established concepts and saved findings without doing a second
substantive specialist review. The memory utility saves and renders your account;
it cannot judge its scientific correctness.

## Closeout

Close every substantive consulting round, including explanation, correction and
lead-only elicitation. Greetings and unrelated conversation need no case event.
Before preparing the reply:

1. Reconcile the incoming meaning and any completed review with the objective,
   target, source qualifications, assumptions, decisions and candidate strategies
   under [Study and User Records](memory-records.md#study-and-user-records).
   Record what changed or why the earlier direction remains supported. When the
   objective, causal target or claim boundary changes, update the corresponding
   source-linked decision and `project_understanding` fields together under
   [Target and Boundary Updates](memory-records.md#target-and-boundary-updates).
   A cosmetic summary rewording can cite the unchanged decision; a changed scientific meaning
   must revise it so affected action scopes become visibly stale. Use memory's
   existing basis links, not another summary ledger. Inspect affected conclusions
   and save known correction implications together, preserving unaffected facts
   and history.
   Before declaring analysis ready for reporting or the objective complete,
   reconcile the relevant planned checks with actual review/diagnostic evidence.
   An established design or finalized run alone is insufficient. Identify any
   consequential unperformed check or contradiction; obtain the needed bounded
   work, or retain an explicit limitation when a narrower claim is justified.
   Reuse adequate checks without adding a mandatory audit turn or asking the
   user to certify analytical validity.
2. Retrieve the [Result Conditions](memory-records.md#result-conditions)
   governing consequential results used now. Preserve
   their population, target, assumptions and uncertainty guarantee. Missing
   condition links mean unreviewed coverage, not an unconditional result. When
   evidence conflicts or a scientific guarantee is unsupported, expose the gap
   and withhold that interpretation. A further scientific review is future
   bounded work, not an unrecorded second worker.
3. Apply the origin-specific [Questions](memory-records.md#questions) contract.
   Address every user question recorded in this interpretation and relevant
   older user questions. Answer with its basis; retain an unresolved answer as
   pending with a reason and return condition; or record the user's explicit
   withdrawal. Source unavailability alone cannot retire a user's question; a
   failed analysis does not answer it. Separately account for consultant requests:
   ask, defer while open with reason and return condition, or close with
   resolution/source and reason, including unavailable, declined or scope limits.
   Save material unresolved worker proposals as consultant questions with
   `statement`, `reason`, `basis_refs`; own their priority, wording and checkpoint
   `related_unresolved_question_refs`. A proposal is not evidence it was asked.
   Do not bury a useful user-resolvable issue as a limitation or mark an unanswered
   part resolved. Distinguish unasked, explicitly unknown, unavailable, declined
   and assumed in the reason and linked evidence/assumptions; an absent field is
   not an unavailable record. Retirement does not establish an assumption, and
   analysis authorization is a decision, not a scientific answer. Expand to
   status/history if current context cannot cover relevant older open questions.
4. Update useful user context with attribution. Distinguish stated preferences
   and constraints from tentative domain or statistical expertise. Expertise
   changes explanation, not evidentiary standards. Keep scientific facts in
   study evidence and link them from user context rather than copying them.
5. Reconcile the current checkpoint with the remaining work. Retain a checkpoint
   that remains accurate. Use `changes.consultation` when its status, uncertainty
   or question links need updating, or `changes.consultation: null` when no current
   checkpoint remains. Answering
   one question does not automatically clear a wider unresolved objective.
   Keep its status, uncertainty and question links consistent with the outgoing
   `reconciliation.next_direction`; do not leave a settled question as the current
   focus or imply that unresolved work is complete.

Maintain [Case Brief Selection](memory-records.md#case-brief-selection),
`changes.case_brief.knowledge_refs` and `work_refs`, for important knowledge
and findings, using their saved records and qualifications. Retain relevant
existing selections; explain consequential removals or replacements in the
reconciliation. Brief selection cannot resolve a question or grant permission.
A finalized run without reviewed findings remains pending reconciliation, not a
scientific result. Expand exact conditions before relying on a condensed item.

Prepare one response using [Exchange Submission](#exchange-submission). Its order is:

- `[Your Questions]`: include first when addressing the user's own questions.
  Give each answer, or explain why it is pending and what would resolve it.
  This includes questions answered after specialist work. Omit the section when
  there are no user questions to address; do not insert your information requests.
- `[Status]`: current understanding, completed work, material issues and the
  qualifications needed to interpret findings. Explain technical meaning in
  the study's units and setting without widening the claim. A premature report
  request is acknowledged here: the report is the desired outcome and the
  specific current prerequisite remains. Say "first agree the analysis scope"
  before authorization, or "first complete the agreed analysis and discuss its
  findings" while authorized work remains. Do not promise unapproved analysis.
- `[I want to know]`: your useful information requests linked to retained questions,
  with why each matters and what information would resolve or change it. If
  nothing needs answering, supply `questions_none`; invent no question. During
  clarification, state the understood part
  and repeat the relevant original unanswered part or action alternatives, with
  what depends on them. Offer an unknown/unavailable path when appropriate;
  do not repeat the whole questionnaire or pressure a user who declined.
- `[Decide Next Steps]`: useful information contributions, bounded action offers,
  discussion invitations or explicit completion. Preserve displayed wording,
  option identity, intended actor, scope, basis and relevant role/reference
  identities. Render protected offers with their concrete public scope. A
  discussion invitation does not authorize a scientific review.

After completed analysis, present `response.findings` with the work references,
main summary, actual diagnostic findings and limitations. Explain whether the
original question is answered fully, conditionally or remains unresolved. Offer
the most useful optional improvement when there is one, why it could change the
answer, and its bounded scope. Required agreed checks belong to the analysis;
do not turn them into optional user choices or ask the user to certify validity.
Useful questions can ask whether to investigate an improvement or obtain material.
Also permit discussion, pausing or stopping. Offer a report on the current
findings when that is supported, stating its evidence and claim limits. Design
and audit findings can support their own report without invented effect analysis.

Only a later user selection of that offered report authorizes writing it. An
initial or repeated report request cannot be carried forward as automatic consent.
If the user chooses an extension, execute only that accepted action and return
its updated findings to discussion. Do not append reporting in the same reply,
even by making a new internal turn identity. A report completion returns to the
lead with the artifact and limitations; the user may reopen or revise the work.

Foreground the most consequential question and recommend a useful direction
when supported. No fixed number of questions, options, specialists or rounds is
required. Pausing or ending can be the correct next step. Completing an intermediate
deliverable does not close the original causal question. If the user narrows or
ends the inquiry, record that scope decision and remaining limits instead of
claiming missing facts were established.

## Exchange Submission

Submit `exchange_prepared` using the envelope in [memory.md](memory.md#record-contract)
with reconciled `changes` and one `payload.exchange`. For a direct Lead-only turn,
include Helper's prepared interpretation unless already saved. If the handoff
lacks it, use [Interpretation Submission](helper.md#interpretation-submission),
without inventing a second interpretation. Bundle it with closeout unless its
source or changed records must first be committed as a protected offer's basis.
Save the returned review here by default under
[Checkpoints and Reviews](memory-records.md#checkpoints-and-reviews), or cite its
successful receipt if the named owner saved it earlier. Save it once. The utility
refreshes generated memory; Lead does not separately rewrite the brief/projection.

For an offer based on new or changed findings, conditions or target records,
follow the [protected-offer save order](authorizations.md#present-a-concrete-scope):
commit the basis first, then prepare the scope and this exchange from its receipt
within the same user-facing round. Do not bundle the new review or bound basis
changes into that offer event. This requires neither another user approval nor
another specialist review.

Fields below are required unless marked optional. Use fresh project-local
exchange identities; the interpretation and `turn_id` must match.

| Object | Fields and meaning |
|---|---|
| Exchange | `exchange_id`, `turn_id`, `interpretation_ref`, `basis_refs`, `completed_work_refs`, `reconciliation`, `response`, `renderer: "lead-markdown-v4"` |
| Optional exchange links | `reconciles`: other interpretation IDs whose unfinished work is accounted for here; `supersedes`: a previous exchange of this same turn being revised |
| `reconciliation` | `changes`, `limitations`, `unresolved` string arrays and `next_direction` string, including unchanged findings and unresolved impacts |
| `response` | `status` string, `questions`, `next_steps` arrays; optional `user_questions`, `findings`; empty `questions` requires `questions_none`, empty `next_steps` requires `next_steps_none` with actual short section text |
| `response.findings` | Nonempty `work_refs`, `summary` string, `diagnostics` and `limitations` string arrays: the actual discussion supporting report offers |
| Each `user_questions` item | `question_ref`, `text`, `answer`, `status`: `answered`/`pending`/`withdrawn`, `basis_refs`; origin must be `user`, and statuses match the effective record's `answered`/`open`/`retired` after this submission |
| Each consultant `questions` item | `question_ref`, `text`, `why`, `needed` (what information helps resolve it); use consultant-origin or legacy questions, never user-origin |
| Each `next_steps` item | Exchange-local `option_id`, `kind`: `action`/`discussion`, `label`, `actor`, `scope`, `basis_refs`; optional `assignment` only for `kind: "action"` with `actor: "consultant"` |

`completed_work_refs` identifies reviews or terminal runs. Account for every
recorded completed, failed or abandoned item of each turn being closed, including
other interpretations in `reconciles`; an in-progress run is not completed work.
Explain older work's disposition in reconciliation rather than erasing it after
new direction. The utility cannot certify this account's scientific completeness.

For user questions, `answer` contains the answer, pending reason and remaining
need, or acknowledgment of withdrawal. Cite saved evidence and conditions for
empirical answers; `basis_refs` may be empty for conceptual explanations without
a specific stored evidential basis. Include every current user question, including
pending ones, and relevant carried questions, without repeating unrelated old ones.
All consultant-question text is retained for interpreting the next reply.

Option order is array order; keep `label` on one line. Subordinate multiline text
is indented by the renderer to avoid false additional options. Intended assignments
use [Checkpoints and Reviews](memory-records.md#checkpoints-and-reviews).
Protected offers additionally bind `scope_ref`, `proposal`, `execution_plan`
under [authorizations.md](authorizations.md); the renderer shows the substantive
proposal. A report offer binds current findings, not an original report request.
A discussion invitation is not execution. Use this renderer under the active
policy; preserve historical renderers for exact replay under
[Compatibility](memory-records.md#compatibility), without relabeling old replies.

The preparation receipt returns `exchange_id`, `renderer`, `rendered_response`,
`response_sha256`, `response_path` and `response_file_written`. After commitment,
present **rendered_response unchanged**, or the identical export only when its
write succeeded. An export failure does not undo commitment; use returned text.
Retain the hash, event and exchange identities; no reread solely for IDs is needed.
Do not rewrite qualifications, questions or options or append another actionable
menu. Correct wording by appending a new exchange with `supersedes`, never by
overwriting its predecessor.

A receipt/file proves preparation, not emission, delivery, reading or understanding.
Capture the actual reply with [observe-exchange](delivery.md) when available.
A mismatch needs reconciliation, not a copied canonical hash or automatic repeat
approval. For an intact prepared reply with surrounding prose, use delivery's
bounded wrapper recovery after inspecting that prose. Changed terms still require
reconciliation; a clear later selection of an unchanged offer needs no repeat approval.

## Recovery and Session Memory

Artifact finalization is not conversational closeout. Resume saved reviews through
Lead. If only a run was finalized, use [memory recovery](memory.md#recovery) to
finish its original specialist handoff before Lead synthesis, without recomputation.
If only response preparation was
saved, retain uncertain delivery and reconcile actual message evidence before
binding a later reply. Changed user direction still takes precedence over an
obsolete offer. Use memory's exact retry and recovery rules.

When saving fails, distinguish performed work, committed work and the unfinished
handoff. Repair the persistence problem where possible; do not claim a completed
record or repeat successful analysis. A necessary failure or cancellation reply
must not be blocked to satisfy closeout. Resume from the last committed version.

A successful receipt establishes preparation. Record `exchange_delivery` only
from actual emission or host delivery evidence, retaining its source and the
strength of observation. A later visible assistant message can resolve earlier
uncertainty. Neither observation proves reading or understanding. Ordinary skill
use cannot enforce memory-utility calls on every host; do not claim host enforcement or
install hooks. Cancellation and user interruption remain available.
