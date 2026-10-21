# Helper: incoming meaning and selected work

Helper is the main assistant's incoming responsibility, not an extra required
agent. Read [memory.md](memory.md) for access and recovery and the relevant
[memory record](memory-records.md) fields when writing them. For a v7 case use
[v7/helper.md](v7/helper.md) instead.

## Resume and interpret

1. Read the shared brief unless sufficient current context is already loaded.
   Retrieve exact older questions, sources or scope terms when the new message
   depends on them. Older live obligations do not expire with topic changes.
2. Save the complete available incoming words as `user_message`, with their
   source and completeness. Retain them even if later interpretation or reply
   recording fails. Do not turn a paraphrase into an original message.
3. Before interpreting an answer or choice that depends on the preceding reply,
   read and record its actual visible items through [delivery](delivery.md), or
   reuse an adequate existing actual record. Native capture is optional; it is
   not required for assistant recording. Original intake, cancellation and
   independent discussion need not wait for unrelated delivery repair.
4. Handle the whole message. Save a `decision` for a clear work disposition,
   `knowledge` for sourced changes, or `interpretation` for additional consequential
   meaning. Each handling save names `user_message`. It may include adopted
   `updates`, relevance `selection` and a changed `next_action`.
5. Hand off one clearly selected bounded task, or pass directly to Lead for
   explanation, clarification or a useful stopping point.

Handle information and selection separately: a clarified target or supplied
record is not acceptance of an offered scope. Retain a clear acceptance together
with its conditions, corrections and questions. The handling link means the whole
message was considered, not every question answered; record consequential meaning
without restating it in several prose fields.

## Preserve meaning and dependencies

Interpret A/Q/N references against the actual reply and item, preserving observed
order and labels. If "the first one" has several consequential referents, keep
those alternatives and clarify. A failed save is not evidence that the user meant
something else. Do not recast a selection as information to get past an error.

Record explicit user questions, including explanation requests without question
marks, with their source. Preserve consultant-question support and exact remaining
parts. Apply an answer or availability limit only to the parts it supports;
preserve the other parts' existing support, status and unresolved remainders.
Distinguish lack of knowledge, unavailable records, refusal and deferral; avoid
asking the same unavailable question again.

Use `next_action.question_timing` where timing matters: `before_work`, `after_work`
or `clarify_first`, either for the action or for named question refs. Explanation
needed to choose or perform work precedes it. A work-dependent answer can accompany
clearly requested work and remains due at Lead closeout. Work can proceed beside
an unresolved question only when its scope and interpretation are independent.
Do not invent substitute work or split a coupled protected analysis silently.

Apply clear corrections and already justified consequences before dependent work.
Adopt related changes to current evidence, question remainders, assumptions,
decisions or routes together in the handling save when their consequences are
already justified. Keep historical source statements as history; update a
current availability or status assertion when new information changes it.
Preserve independent conflicting sources and uncertain scientific consequences;
these may call for one bounded assessment, not a request for the user to certify
an assumption. New evidence alone does not reconcile every affected conclusion.

Keep permission separate from direction. The user can accept a scope while asking
for explanation first. Preserve the acceptance and record discussion as the next
action, including a request such as "Run it, but one thing first" when its next
question can be answered before execution. A resolved blocker can allow
still-current accepted work to resume when the user's direction is clear;
it does not require a ritual new yes. Changed
material terms use the [scope contract](authorizations.md).

## Select useful work

Choose by the next decision and attainable evidence. Consider what additional
information could distinguish plausible analytic routes, including consequential
study-process facts the user may not volunteer. State why the question matters
without suggesting a preferred answer. Reuse adequate existing assessment.

When the user does not know, consider a specific attainable source or bounded
consultant-led contribution that could resolve a consequential remainder.
Before saying a supplied record is missing or requesting it again, inspect
available attachment references and their accessible files. Receipt does not
establish contents; unknown contents do not establish absence. Record only the
availability limit established by an attributable source, preserving the
distinction between lack of knowledge, unavailability, refusal and deferral.
Request a specific record only when its contents could change the advice. If
no worthwhile attainable check remains, or the user chooses closure, give the
supported qualified answer without turning an unresolved remainder into a
resolved fact or claiming that an unchecked source does not exist.

## Save and hand off

Commit the handling record and justified incoming updates before dependent
specialist work. For `next_action.kind: specialist`, identify the selected
assignment and purpose. `lead_only`, `wait` and `close` retain other directions.
Keep the current question's remainder in its question record; point to it rather
than recreating a checkpoint backlog.

Give the specialist the handling entry as `responds_to`, the bounded assignment,
necessary exact evidence/conditions, applicable scope and decision, and the named
review commit owner. It reads only needed role/method guidance and missing source
detail. Do not preload every guide or launch a second specialist from a handoff.

Normally Lead saves the returned review once and adopts justified changes. If the
specialist was assigned to commit it for a durable handoff, pass its receipt to
Lead. Work lifecycle is recorded as it happens, independently of review commitment.
The utility refreshes project and brief; neither role rewrites those files.
