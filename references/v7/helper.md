# Helper: Resume, Interpret and Select Work

You own the incoming side of **User -> Helper -> selected work -> Lead -> User**.
For explanation, clarification or discussion, go directly to Lead. Helper and
Lead are reasoning responsibilities of the same assistant, not mandatory agents.
Lead supplies the sole user-facing response. The deterministic **memory utility**
validates and saves records; it cannot interpret the user or certify the science.
Keep existing record/command names and specialist identities.

Use [submit authoring](authoring.md); the contracts below describe the expanded records.

Use [memory.md](memory.md) for reads, writes and recovery and
[authorizations.md](authorizations.md) for protected work. Read linked record
sections before reasoning or writing that depends on them; reuse intact guidance
and adequate handoffs rather than rereading on every round. After context loss,
recover the needed contract instead of relying on a vague session summary.
Do not load architecture for consulting.
Keep interpretation focused on consequential message components and their effect
on direction, without retelling the source capture. Use the
[prose purposes](memory-records.md#prose-budgets-and-purpose) and
[narrow patches](memory-records.md#narrow-patches) for existing questions and
evidence. Reuse receipt identities; shorthand does not need a whole-status read.

## Resume and Interpret

1. **Recover relevant context.** At first entry follow the project-folder rules
   in [SKILL.md](../../SKILL.md); only the utility initializes projects. Normally read
   `context --output-format compact-v1` with `{"mode":"brief"}`: current brief, five recent saved intakes,
   unfinished issues and coverage, alongside the actual new host message. Reuse
   adequate state/receipts; a handoff needs no full reread. For uninitialized
   selections, use broad context and curate actual records. A missing brief
   does not justify another project. For an affected older issue, retrieve its
   original question/options, supported answer, exact remainder and relevant
   delivered clarifications. Use exact record mode for known IDs, or literal history search, expanding
   missing dependencies only as needed. Live issues do not expire after five
   intakes. Resolve disagreement with session summaries from actual sources.
   A completed finding in the brief is navigation: retrieve relevant exact
   result conditions before using its claim or inference guarantee in a new answer.
   Follow [answer-communication notices](memory-records.md#answer-resolution-and-communication)
   to the original question and actual reply before reconciling an affected answer.
2. **Record the prior reply, then interpret the whole message.** Retain the new
   user message under [Incoming User Sources](memory-records.md#incoming-user-sources).
   Reuse the adequate current view of the previous actual reply. Otherwise use an already
   available genuine capture or read it from conversation under
   [reply recording](delivery.md#record-the-previous-reply). If a capture needs
   interpretation or an earlier reconstruction needs repair, apply
   [same-reply reconciliation](delivery.md#reconcile-records-of-the-same-reply)
   in this internal step. Preserve actual items and qualifications; do not fill
   omissions from the draft. Then apply the incoming-source contract
   to capture and attribute meaningful questions, answers, facts, corrections,
   preferences and instructions. Interpret "yes, but use the other cohort" as a
   whole. Bind context-dependent choices to the exchange actually shown, its
   section, ordered items and actual reply record. Agent recording is sufficient;
   a native export is optional. Recover the actual message if its content is uncertain.
   Distinguish a recording error from an erroneous sent claim under
   [delivery corrections](delivery.md#repairing-a-recording-or-correcting-a-sent-reply).
   Preserve the user's intent against the visible terms; send consequential
   misleading statements to Lead for correction before dependent work.
   Current answer, question and next-step items use `[A1]`, `[Q1]` and `[N1]`
   respectively, increasing within their sections; the work summary is unnumbered.
   Historical replies keep their original labels. Labels identify display positions,
   not stable record IDs, and can refer to different items in later replies.
   Use the wording and context to distinguish
   an answer to a question from a next-step choice; use distinctive option titles
   and section-qualified references, and clarify a bare number when
   several section items remain plausible rather than automatically selecting an option.
   `question_ref` binds a request under `[Questions for you]`; `option_id` binds
   a choice under `[Next steps]`. Under `[To answer your question]`, use the saved
   item's type and source path: user answers, explanations and findings have
   different references even though they share a heading. Cite the original
   user-question ID, explanation basis or finding's work references in interpretation
   `basis_refs`, describe the affected item in `meaning`, and use the exchange and
   actual reply record references when relying on that reply. Do not put a user-question
   ID or finding reference in a component's `question_ref`. If the user
   asks a new question, record it as a user-question component in its own right.
   A draft does not establish what was said. A bare "yes" cannot select an unseen payload;
   it can select one unambiguous current offer. Several plausible actions require
   clarification using those original alternatives. A clear new instruction needs
   no fictional prior question; protected work still follows [authorizations](authorizations.md).
3. **Compare consequential information.** Before calling two accounts conflicting,
   check the relevant construct/event, population/site, time/version and intended
   versus actual procedure. Use these distinctions when needed, not as a routine
   questionnaire. Neither the latest statement nor a file automatically wins.
4. **Update affected understanding.** Apply the table below. Preserve unaffected
   knowledge and qualifiers; update affected questions, assumptions, strategies,
   decisions, result conditions and understanding under
   [record ownership](memory-records.md#record-ownership). Use [Questions](memory-records.md#questions)
   and [Target and Boundary Updates](memory-records.md#target-and-boundary-updates).
   If implications need investigation, mark the affected conclusion unsettled
   without inventing a replacement design. Keeping the new quotation alone is
   insufficient. Repair clear bookkeeping gaps from the conversation instead of
   asking the user to repeat themselves. When a file arrives, a decision changes
   or a result is superseded, update the affected current summary and curated
   knowledge selection. Do not leave an earlier "not received" or obsolete rule
   as a current fact beside its replacement; retain the source history.
5. **Choose by dependency and direction.** Apply [Questions Before Routing](#questions-before-routing).
   Identify the unresolved fact whose plausible answers could change the next
   action's usefulness, scope or interpretation, and which accessible source
   could distinguish them. Resolve a decision-defining input before offering the
   dependent final choice. Process new direction before unfinished work; a focus
   switch neither cancels approval nor executes deferred work. On return, recover its scope, decision and
   unresolved questions. Use [recovery](memory.md#recovery) for saved outputs or
   interrupted saves without repeating computation.
6. **Save and hand off.** Follow [Save and Hand Off](#save-and-hand-off). Commit
   consequential updates before work relies on them; direct Lead-only responses
   can ordinarily bundle interpretation and closeout.

| Relationship to prior information | Treatment |
|---|---|
| Explicit correction | Update only the corrected fact as the current attributed user account; do not seek the same confirmation again |
| Unacknowledged consequential conflict | Retain both sources and the exact discrepancy; resolve through clarification or a directed check before work that requires its resolution |
| Different construct, site or time | Retain both scoped facts when compatible; do not fabricate a conflict |
| Tentative or secondhand account | Preserve attribution and uncertainty; confidence is not verification |
| Partial answer | Keep the original question ID, supported part and exact remainder |
| Hypothetical | Explore the conditional question without changing actual study facts |
| Changed objective or preference | Record the direction and reassess feasibility and affected scope |

For example, voluntary attendance can coexist with randomized offers. "My earlier
account was wrong; offers were never randomized" withdraws that user-supplied
premise. "It wasn't really random" may need clarification of the mechanism.
"What if it was not random?" changes none of the actual facts. A clear withdrawal
with an unclear replacement removes the former certainty now; clarify only the
replacement. An independent conflicting protocol remains evidence to reconcile.

An allocation record's availability does not establish its contents. A tentative
recollection can answer "what do you recall?" while leaving "what happened?"
unresolved. Unknown, unavailable, declined and assumed remain distinct; stopping
inquiry preserves the scientific restriction. Explicitly scoped conditional work
may examine uncertainty without treating either disputed account as established.

For example, unknown implementation costs can block a deployment recommendation
while leaving effect estimation useful. Obtain an accessible cost
record before offering to finalize that recommendation. Independently useful effect estimation
can be proposed with its limited purpose and requires its own accepted scope.
When the user is already bringing a record that could change the requested
decision, explain what it will settle and wait before drafting a detailed offer,
unless an interim result has a separate use for the user. Do not create a
provisional action merely to fill the current reply. A separately requested
effect comparison can still proceed under its own scope while costs are pending.
If the user answers only another part of the request, retain the exact remainder
and pending work; silence changes neither the missing fact nor permission.

### Questions Before Routing

Record user questions with `origin: "user"` and their source, including requests
for explanation without a question mark. Then distinguish:

- **Meaning or intended action unclear:** if consequential for selected work,
  choose `lead_only`, state `next_action.clarification_needed` and use
  `clarify_first` for affected user questions. Lead answers clear parts and asks
  one focused clarification, retaining original alternatives and partial support.
- **Meaning clear, implications established:** apply the update and explain its
  effect through Lead; no empty specialist review or repeated confirmation.
- **Meaning clear, scientific consequence unresolved:** retain the account and
  limits. Select one clearly directed bounded investigation when appropriate;
  do not ask the user to certify an untestable identifying assumption.
- **Independent work clearly requested:** proceed only if the unresolved issue
  cannot materially change that task's scope, computation or interpretation.
  Explain this dependency in `next_action.reason` with affected question refs.
  Do not invent substitute work or silently split a coupled protected analysis.
  Unclear independence or priority requires clarification.

Use `before_work` and `lead_only` when answering is prerequisite to choosing or
doing the action. Use `after_work` for work-dependent answers, saved before work
and passed to Lead for an answer or exact remaining gap. An independent conceptual
question can accompany authorized work with `after_work`; already knowing its
answer does not require an extra turn or imply that computation proves it.

Clarification is itself reconciliation. For a first vague answer use
`answer_refs: []` and the exact `remaining`; retain prior partial support.
Reuse the question and original alternatives through repeated clarification.
"Twenty seats" does not answer pooling, and "finish" is direction, not an answer.

Keep accepted work pending with a concrete reason when a prerequisite blocks it.
Answering its sole blocker can resume still-current acceptance when direction is
clear, without another ritual yes. Changed premises can stale that scope, which
cannot authorize an allegedly unaffected protected subtask. Preserve historical
approval, revise the affected scope and obtain later selection as required by
[authorizations](authorizations.md#interpret-the-later-user-decision). An independent
audit needs its own valid direction. Explain any departure from the earlier request.

A work-dependent user question can provide that direction without a duplicate
instruction: keep it open and user-origin, cite the current incoming quoted user
source, use `after_work`, and link its ID through interpretation `basis_refs` or
the current checkpoint's `related_unresolved_question_refs`. If that checkpoint
names `selected_assignment`, it must match the selected work. Explain why the
bounded investigation answers the request while accepted work waits. The helper
checks those links; you judge actual intent and relevance. A hypothetical or
unrelated question supplies no permission for a new investigation. Protected
analysis or reporting still requires its own accepted scope.

## Interpretation Submission

Prefer `submit` with `op: "reply_interpreted"`, top-level `changes` and
`interpretation` under [authoring.md](authoring.md). The
[memory envelope](memory.md#record-contract) and `payload.interpretation` apply
only to low-level `record`.

The table describes expanded records of attributed meaning and action, not
private reasoning. Fields are required unless marked optional. New incoming
turns need fresh project-local interpretation/turn identities; `submit` supplies
them when omitted.

Fresh submissions also receive utility-owned
`delivery_binding: "message-bound-delivery-v2"`. Do not remove this marker to
bypass current binding checks; historical interpretations retain their old contract.

| Object | Fields |
|---|---|
| Interpretation | `interpretation_id`, `turn_id`, nonempty `incoming_refs` of user-statement IDs, `components`, `basis_refs`, `next_action`; optional `action_decisions`, `focus_scope_ref` under [authorizations.md](authorizations.md) |
| Each component | `kind`, `meaning` strings; `established`, `unresolved` string arrays; kinds: `question`, `answer`, `selection`, `correction`, `information`, `instruction`, `clarification`, `delegation`, `unknown` |
| User-question component | Additionally `user_question_ref` to an `origin: "user"` question and `answer_timing`: `before_work`, `after_work` or `clarify_first`; apply [Questions Before Routing](#questions-before-routing) |
| Prior-reply binding | Optional `exchange_ref`, `question_ref`, `option_id`, `delivery_ref`; `question_ref` answers a consultant question, whereas a user's own question uses `user_question_ref` without these prior-delivery bindings |
| `next_action` | `kind`: `lead_only` or `specialist`, `scope`, `reason`; specialist requires `assignment` in [Checkpoints and Reviews](memory-records.md#checkpoints-and-reviews), lead-only has no assignment |
| Conditional action fields | Optional `clarification_needed`, `adjustment_reason`; protected work also requires `scope_ref` and `authorization_ref` under [authorizations.md](authorizations.md) |

Selections require stable `option_id` and matching exchange/delivery references.
Apply [Resume and Interpret, step 2](#resume-and-interpret) to section/item
bindings, using derived `response_items` and the original exchange when layouts
differ. Display numbers are not record identities. Save user questions and
sources before dependent work; protected requests follow
[authorizations](authorizations.md#interpret-the-later-user-decision).

Basis references and the expected predecessor bind the interpretation to current
evidence. Under the dependency rules above, nonempty `clarification_needed`, or a
user-question component with `before_work`/`clarify_first`, requires `lead_only`
with no assignment. An `after_work` question may remain pending in a lead-only
turn blocked elsewhere. The utility checks recorded dependencies, not whether
you understood them correctly; choosing work does not establish its assumptions.

Supply `adjustment_reason` when departing from an offered assignment, including
selecting a specialist when that option had no assignment, retaining an accepted
assignment in a lead-only turn, or following a clear direction for different
independent work. Explain the supporting instruction/evidence or postponement.
A discussion or information-sharing choice cannot silently become specialist
work, and an adjustment grants neither scientific approval nor new direction.
Keep accepted work pending without starting its run; each task retains its own
scope and direction requirements. Preserve acceptance, deferral, withdrawal and
focus through `action_decisions`/`focus_scope_ref`, not free-form decisions,
checkpoint status or a new readiness flag.
An accepted report's explicitly requested local formats use the small
`presentation_adjustment` in [the acceptance record](authorizations.md#interpret-the-later-user-decision);
they do not require another user turn. Preserve conditional approval.

## Save and Hand Off

Before dependent work, save `reply_interpreted` with the incoming evidence,
interpretation, affected knowledge/questions/decisions and bounded action. Update
`changes.case_brief.knowledge_refs` under
[Case Brief Selection](memory-records.md#case-brief-selection) when new knowledge
belongs in the brief, preserving relevant selections. A direct investigation can
create its checkpoint here. Protected work requires current accepted scope.

Replacing protected answer attribution can require a sourced `correction` under
[Questions](memory-records.md#questions). That event cannot contain an interpretation:
save the new source and targeted correction first, then interpret the same source
as the immediate next semantic submission, separately or in direct Lead closeout.
This is two internal commits in one round and one intake. Reuse the receipt.
New marked user sources appear in recent intakes and unfinished work even before
interpretation. If interrupted, retrieve that pending source and recover only
the missing interpretation. Historical sources without the new intake marker
still require their receipt or source IDs and, if necessary, the relevant event gap.
This is not a history scan every turn. Understand new direction first, recover the
missing older interpretation, then commit the current intake. If current input
was already interpreted, restore it after recovery by reinterpreting its original
ordered source IDs; neither intake is duplicated. Saved order is not arrival order.
Keep recovered unperformed work pending or superseded, never performed or approved.
Lead can include the recovered interpretation in current closeout's `reconciles`. Use
[recovery](memory.md#recovery) for uncertain writes.

If prior-delivery binding rejects a submission, preserve the unchanged incoming
source with an explicit `memory_updated` submission, then resolve the binding and
interpret that same source. A failed transaction does not save part of its payload.
Do not retag a selection as information or discard a stop request to get a write
accepted. Pending primary sources block new or continuing protected work until
their direction is interpreted. Withdrawal of existing permission can reference
that accepted action without proving its old offer's delivery again.

Select zero or one substantive specialist using
[Checkpoints and Reviews](memory-records.md#checkpoints-and-reviews). Choose the
known primary/additional design and support IDs before committing the assignment;
no need to preload every guide or add a feasibility turn. Pass the committed
interpretation, project/event IDs, exact assignment, scope/authorization, source
versions, facts/gaps, question IDs/timing, outputs and named review-commit owner.
This uses existing records, not another file. Helper inspects existing evidence
to route; substantive investigation belongs to the worker, who returns to Lead.
Work can iterate within bounds; a different review becomes a gap/option, never a
second specialist or retrospective assignment rewrite.

For direct Lead response, pass the source, complete interpretation draft and state;
normally Lead saves interpretation with closeout. Commit new protected-offer basis
first under the [save-order exception](authorizations.md#present-a-concrete-scope).
After work, the main assistant in Lead closeout normally saves the review once.
For a durable handoff or offer basis, its named owner saves `review_completed`
first and passes the receipt; a delegated worker does so only when assigned.
Run lifecycle records execution immediately; no-output reviews need no run. Follow
[Ownership and Save Points](memory.md#ownership-and-save-points).

On unexpected journal advancement, refresh and reassess the pending submission;
do not simply replace its expected event ID. Follow [recovery](memory.md#recovery).
The utility refreshes generated memory after commits. Reuse the receipt and pass
only missing information at handoff, rather than rereading each refreshed file.
