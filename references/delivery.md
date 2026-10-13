# Prepared replies and actual communication

A prepared reply is a draft. The actual prior reply is what the user could act
on. Retain both, with one resolved current account of actual communication.
Existing v7 cases use [v7 delivery](v7/delivery.md).

## Who records what, and when

| Point | Owner | Record or action |
|---|---|---|
| Before response | Lead | Saves reply_prepared; utility renders draft |
| Public output | Lead/main assistant | Sends actual response through host |
| Next resume before dependent interpretation | Helper | Reads previous visible reply and saves actual ordered items |
| Optional capture | Host supplies bytes; utility retains them | reply_recorded with provenance |
| Recording mismatch | Helper | Reconciles account, preserving history |
| Wrong actual scientific statement | Lead | Corrects visibly and revises affected knowledge |

No hook, transcript search or capture step is mandatory. Reuse an adequate actual
record. Independent explanation, cancellation and failure handling need not
wait for unrelated delivery repair.

## Record the previous reply

Retain the new user message first to anchor the previous actual reply. Read the
actual message for complete item wording, titles, qualifications, Checks/Limits
and referenced scope links, preserving their order and labels. Save supported
question dispositions and discussed-work/scope mappings beside those words using
the fields below. Preserve malformed or overlong output as sent, including
substantive unsectioned text; public drafting budgets do not truncate its record.
The draft may suggest references to inspect, but cannot supply unseen words,
conditions or links. Do not paraphrase or invent missing content.

```json
{
  "at": "<current-token>",
  "op": "reply_recorded",
  "prepared": "<prepared-entry>",
  "before_user": "<new-user-entry>",
  "source": {
    "kind": "assistant_recorded",
    "locator": "conversation:<actual-previous-reply>"
  },
  "items": [{
    "kind": "answer",
    "label": "A1",
    "text": "<complete actual partial answer>",
    "question_ref": "<saved-user-question>",
    "answer_status": "pending"
  }, {
    "kind": "question",
    "label": "Q1",
    "text": "<complete actual question>",
    "question_ref": "<saved-consultant-question>"
  }]
}
```

`prepared` is optional when no draft exists. The source locator and following
user anchor identify the same actual message even when it is recorded later.
Use that known anchor, for example `conversation:assistant-before-e44`, rather
than a guessed reply ordinal.

Item kinds: answer, explanation, findings, summary, question, option and other.
Use `other` for substantive unsectioned text; keep actual labels. For an answer
to a saved user question, supply its supported `question_ref` and `answer_status`:
answered, pending or withdrawn. Keep a partial answer pending and its canonical
question open with the remainder. Add `work_refs` for findings actually discussed;
map `scope_ref` under the terms rule below. If a mapping is uncertain, retain the
actual words and specific gap. Resolved knowledge does not prove
that its answer was communicated. A later draft awaiting recording also does
not erase an earlier actual answer; a changed answer or correction remains
unconfirmed until its own actual communication is established.

Map a scope only when the actual option, together with an explicitly referenced
answer in that reply, contains all material terms. Do not map incomplete or
changed terms to the planned scope. If actual wording is unavailable, keep
consequential uncertainty in the incoming handling; do not invent `reply_recorded`
items from drafts, completed work or compaction summaries. Present missing terms
only when needed for a dependent choice. Independent discussion need not wait.

## Optional host capture

The assistant-recorded path works without host capture.

| Route | Caller provides | Utility retains |
|---|---|---|
| Claude Code adapter | source.claude_capture with absolute transcript_path, session_id and message_uuid | Host record and ordering evidence |
| Generic host export | source.message_path to actual UTF-8 export and source.locator | Attributed exported bytes and hash |
| No accessible export | Actual previous reply visible in conversation | Assistant recording, without a native claim |

Use `source.kind: "host_capture"`. The utility retains bytes at
content-addressed files under `captures/`, plus adapter evidence when available, and rejects known
draft-export paths. A hash proves intact bytes, not that an arbitrary file came
from the host. Identify provenance accurately.

Mapped text must occur in captured text. A capture can initially have no item
map; it establishes wording but cannot select permission or question meanings.
The assistant supplies that interpretation in a linked recording.

## Reconcile records of the same reply

`capture_ref` associates an item map with earlier capture;
`supersedes_recording_ref` corrects the current recording. Keep the original
message identity, following-user anchor and draft association. These links
repair the account of one reply, not a later reply.

The shared resolver provides one current view without deleting history. Genuine
capture controls wording; assistant-attributed items control its interpretation.
A discrepancy remains unresolved until faithfully mapped. Later save time alone
does not resolve conflicting actual-message evidence.

Assistant-only reconstruction can be corrected from the actual conversation;
capture remains optional. Confirming unchanged terms preserves original
acceptance and work binding. Omitted conditions cannot acquire retrospective
permission.

## When actual output was wrong

Recording repair and scientific correction are different actions. Lead corrects
a consequential wrong actual statement in the normal response sections and
adopts affected evidence, assumptions, question, route and scope changes.
The erroneous reply remains communication history, not scientific truth.

Use `correction` with `corrects_refs`, `reason` and adopted `updates` when
explicit correction attribution is useful. Do not rewrite messages, original
decisions, source bytes or finalized work.

An export failure after append does not erase knowledge. Recover generated
files rather than repeating the save. A host output failure does not establish
delivery; use the same actual-message rule at the next resume.
