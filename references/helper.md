# Helper: Resume, Interpret and Select Work

You own the incoming side of **User -> Helper -> selected work -> Lead -> User**.
For explanation, clarification or discussion, go directly to Lead. Helper and
Lead are reasoning responsibilities of the same assistant, not mandatory agents.
Lead supplies the sole user-facing response. The deterministic **memory utility**
validates and saves records; it cannot interpret the user or certify the science.
Keep existing record/command names and specialist identities.

Use [memory.md](memory.md) for reads, writes and recovery and
[authorizations.md](authorizations.md) for protected work. Read linked record
sections before reasoning or writing that depends on them; reuse intact guidance
and adequate handoffs rather than rereading on every round. After context loss,
recover the needed contract instead of relying on a vague session summary.
Do not load architecture or hidden testing material for consulting.

## Resume and Interpret

At first entry, use the project-folder rules in [SKILL.md](../SKILL.md); only the
utility initializes a supported project. Normally request context with
`{"mode":"brief"}`. Read its current case brief, recent five saved intakes and
unfinished issues, alongside the new unsaved user message supplied by the host.
Reuse adequate current state and receipts; a role handoff needs no fresh full read.
A missing brief file does not justify initializing another project.

Inspect coverage. For an uninitialized knowledge or work selection, use the broad
fallback and curate that section from actual records. For a pending issue,
retrieve its original question or alternatives, supported answer, exact remainder
and relevant delivered clarifications before relying on them. Expand omitted or
contrary evidence when it could change the action. Older live issues do not
expire after five intakes. For exact older wording, start with literal history
search or the known event. Use focused context if its governing dependencies
still need expansion; do not retrieve the same broad neighborhood just to locate
an option. A brief is navigation,
not proof of what the user saw or permission to execute.

Process new direction before resuming unfinished work. Saved outputs may need
completion of their original specialist handoff or Lead discussion; use
[memory recovery](memory.md#recovery) without repeating computation. If session memory
and the case disagree, inspect actual sources; a host summary cannot replace
an exact question, choice, qualification or delivery observation.

Bind a context-dependent reply to the exchange actually shown to the user.
Inspect the available assistant message or host evidence when a saved exchange
has uncertain delivery. Record only the observation that evidence establishes;
preparation alone proves neither emission nor receipt. A bare "yes" or "2"
cannot select an unseen payload. "Yes, do it" can select one clearly identified
current offer without another confirmation. If several actions remain plausible,
route to Lead for one clarification using the relevant original alternatives. A clear
new instruction establishes its own direction without a prior question. Protected
analysis/reporting still requires
the presented scope or findings-bound report option and later acceptance.

Use [Incoming User Sources](memory-records.md#incoming-user-sources) for exact
capture, attribution and coverage before interpreting consequential input.
Interpret each meaningful part of a mixed reply. Distinguish the user's own
questions or requests for explanation from answers to your earlier questions,
instructions, corrections and supplied facts. Record each part's attributed
source, matched question or option, supported meaning and unresolved portion.

Use the existing user evidence's exact excerpt for consequential decisions and
corrections, including any condition on proceeding. Keep unanswered parts open.
Routine updates retain existing attribution; repair bookkeeping from the actual
conversation instead of asking the user to repeat a clear answer. Reconcile each
affected question under [Questions](memory-records.md#questions), using
`resolution.answer_refs` and `remaining` for consultant-origin questions. Keep
its ID and original statement through clarification; public rephrasing belongs
in the exchange. A standalone factual statement can answer a question through
its source without an invented prior-delivery binding.
For a first resolution of a vague reply, use `answer_refs: []` and the exact
`remaining` choice or uncertainty. Preserve any already supported partial answer.
The need to clarify is itself a reconciliation, not a reason to omit it.

- "Yes, I have the allocation record" establishes reported availability, not
  the record's contents or random assignment. Select inspection or have Lead
  request those contents when needed for the selected review.
- "I think assignment was random" stays a qualified user account; do not convert
  confidence or willingness to proceed into evidence for an assumption.
- "Option 2, but attendance was voluntary" supplies direction and a reported
  fact. Reassess the offered action using that account before executing it;
  voluntary receipt alone does not contradict randomized offers.
- A partial answer leaves the exact unanswered part open. "Twenty seats per
  center" does not establish whether seats can be pooled. "Nothing else is
  open; finish" expresses direction, not a factual answer to that question.
- An explicit unknown, unavailable source, declined request and adopted
  assumption remain distinct. Retirement can stop repeated questioning while
  retaining the missing fact and its restriction on claims. Conditional work
  never turns an adopted assumption into an answered factual question.

Use the displayed option order and bounded scope of the actual referenced
exchange. Retrieve an older exchange when the reply clearly refers to it; do not
substitute the latest menu or guess which option was selected. For an ambiguous
choice with no protected scope, reuse one clarification question linked to the
original exchange through `basis_refs`. Clarification does not create a new
choice or discard the earlier alternatives.
A selected option may become unsuitable after a premise
changes. Explain a necessary departure, preserve the original choice and record
the proposed revised action. A material change to protected work requires a new
scope revision and later acceptance, not only an explanation of the departure.
Clear corrections and focus changes can redirect unfinished work without erasing
it. Retrieve the earlier scope, decision and open questions on return; a switch
of focus alone neither withdraws approval nor executes deferred work.
Before changing an objective, target or claim boundary, follow
[Target and Boundary Updates](memory-records.md#target-and-boundary-updates) to
reconcile the sourced decision and understanding summary together.

### Questions Before Routing

Apply this order before selecting work:

1. Identify what the user asks you to explain, what they direct you to do, and
   whether new facts or corrections change earlier requests. Record user
   questions with `origin: "user"` and their source. A request to explain a
   distinction is a question even without a question mark.
2. If answering a question is a prerequisite to choosing or performing the
   selected action, use `answer_timing: "before_work"` and select `lead_only`.
   Pass the question to Lead for an answer from established knowledge and
   evidence, then return control through the shaped response. If scope, meaning
   or conflicting instructions need
   clarification that affects that action, select no specialist and record the
   reason in `next_action.clarification_needed`; use `clarify_first` for affected user
   questions. Have Lead answer the clear parts and ask one focused clarification.
3. If the question can be answered only after authorized work, use
   `answer_timing: "after_work"`, save it before work, and select one bounded
   specialist. Pass the question IDs and what each needs to resolve. At closeout,
   Lead answers from the findings or retains the unresolved part as pending.

For example, "What does adjustment mean, and should we do it before choosing a
comparison?" calls for explanation before work. "Run the agreed adjusted model
and explain how its estimate differs" calls for work followed by an answer.
An independent conceptual question can accompany the latter: retain it for the
same closeout with `after_work`, without pretending the calculation establishes
its answer. `before_work` means the answer is a prerequisite, not merely that it
is already known.
Apply these blockers to the selected work. Clearly requested independent work
may proceed when the unresolved information cannot materially change its scope,
computation or interpretation. Record affected question IDs in the interpretation
or checkpoint references and explain the dependency in `next_action.reason`.
For example, an explicitly requested missingness check can proceed while
assignment remains unknown if that uncertainty does not affect the check.
Investigation can also examine the uncertainty itself. Do not invent a substitute
audit or silently split a coupled protected analysis to escape clarification.
If independence or intended priority is unclear, clarify first. A long or technical
message with clear meaning and dependencies needs no artificial clarification round.

Do not silently discard earlier authorized work while clarifying a new request.
The status can explain, in the user's terms, how "previously you asked for X"
is affected by the new information and which next direction now needs deciding.
Distinguish an outstanding task from a question awaiting an answer.
Preserve valid acceptance while a prerequisite prevents execution, with a concrete
postponement reason. This can be a lead-only turn, or the user can clearly select
one independent task while the accepted action waits. On resumption, check current
scope, evidence and direction. A direct answer to the sole stated blocker can
support resumption when that was the clear next step; do not demand a ritual
second acceptance. Changed premises may instead require a new offer and selection.

## Interpretation Submission

Use the event envelope in [memory.md](memory.md#record-contract). The
`payload.interpretation` contract below records attributed meaning and action,
not private reasoning. Fields are required unless marked optional. Use fresh
project-local interpretation/turn identities for a new incoming turn.

| Object | Fields |
|---|---|
| Interpretation | `interpretation_id`, `turn_id`, nonempty `incoming_refs` of user-statement IDs, `components`, `basis_refs`, `next_action`; optional `action_decisions`, `focus_scope_ref` under [authorizations.md](authorizations.md) |
| Each component | `kind`, `meaning` strings; `established`, `unresolved` string arrays; kinds: `question`, `answer`, `selection`, `correction`, `information`, `instruction`, `clarification`, `delegation`, `unknown` |
| User-question component | Additionally `user_question_ref` to an `origin: "user"` question and `answer_timing`: `before_work`, `after_work` or `clarify_first`; apply [Questions Before Routing](#questions-before-routing) |
| Prior-reply binding | Optional `exchange_ref`, `question_ref`, `option_id`, `delivery_ref`; `question_ref` answers a consultant question, whereas a user's own question uses `user_question_ref` without these prior-delivery bindings |
| `next_action` | `kind`: `lead_only` or `specialist`, `scope`, `reason`; specialist requires `assignment` in [Checkpoints and Reviews](memory-records.md#checkpoints-and-reviews), lead-only has no assignment |
| Conditional action fields | Optional `clarification_needed`, `adjustment_reason`; protected work also requires `scope_ref` and `authorization_ref` under [authorizations.md](authorizations.md) |

A selection requires its stable `option_id`; question/option bindings require
matching exchange and delivery references. Displayed numbers follow that
exchange's ordered options. A clear new investigation or explanation needs no
prior exchange; a direct protected-work request still follows the later-decision
contract. Save each user question and its source in `changes` before dependent work.

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

## Save and Hand Off

Retain the actual incoming text as user-statement evidence, with attributable
`source_ref` and `source_excerpt`; set `complete_message` to true only for a full
capture, false for a known incomplete capture. Preserve the primary source IDs
and order for repeat interpretations of this intake; new input gets new IDs.
Use separate records for attachments and derived study facts; source details and
legacy coverage follow [Incoming User Sources](memory-records.md#incoming-user-sources).

Before dependent work, save `reply_interpreted` with the incoming evidence,
interpretation, affected knowledge/questions/decisions and bounded action. Update
`changes.case_brief.knowledge_refs` under
[Case Brief Selection](memory-records.md#case-brief-selection) when new knowledge
belongs in the brief, preserving relevant existing selections. Consequential
corrections must survive
an interruption before execution; saving only a local note is insufficient.
A direct investigation request can create its checkpoint in that submission.
Protected work requires the current accepted scope before work starts.

Select zero or one substantive specialist using
[Checkpoints and Reviews](memory-records.md#checkpoints-and-reviews). Choose the
known primary/additional design and support IDs before committing the assignment;
this does not require preloading every guide or a separate feasibility turn.
Pass the committed interpretation and project/event identities, exact assignment,
relevant scope/authorization, sources and versions, facts and gaps, question IDs
with answer timing, expected outputs
and one named review-commit owner. This is an in-memory handoff using existing
records, not a new file. Helper may inspect source identity and existing evidence
to route; a substantive scientific investigation belongs to the selected worker.
The worker returns to Lead, without selecting another specialist. An assignment
can iterate within its bounds; a materially different review returns as a gap
or next option, not a retrospective rewrite of the original assignment.

For a direct Lead response, pass the incoming source, complete interpretation draft and
current state. Lead normally saves interpretation and closeout together. If the
source or changed records supply a protected offer's basis, use the
[save-order exception](authorizations.md#present-a-concrete-scope) within the same
user-facing round. After specialist work, the default review-commit owner
is the main assistant in Lead closeout, which saves the review once. If a completed
review must survive a handoff or become an offer's committed basis before closeout,
its named owner saves `review_completed` first and passes the receipt. A delegated
worker performs that save only when explicitly assigned. Run start/finalization still records
execution immediately. A review with no outputs needs no placeholder run.
Keep this ownership explicit under
[Ownership and Save Points](memory.md#ownership-and-save-points).

On unexpected journal advancement, refresh and reassess the pending submission;
do not simply replace its expected event ID. Follow [recovery](memory.md#recovery).
The utility refreshes generated memory after commits. Reuse the receipt and pass
only missing information at handoff, rather than rereading each refreshed file.
