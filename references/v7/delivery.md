# Recording the actual reply

Save scientific state and the response draft under [Lead closeout](team_lead.md#closeout)
before replying. Follow the four-section, flat-label and length contract in the
actual reply. The draft records intended content; it is not evidence of what was
said. Record the actual preceding reply at the next turn. A host hook or exported
transcript is not required for this ordinary path.

The memory utility appends prepared exchanges and actual-reply observations to
the case's `journal.jsonl`; it retains captured bytes under
`exchanges/<exchange>/observations/<delivery>.txt`. Generated views select one
current actual reply without replacing its earlier records. Helper owns reading
and interpreting that reply; Lead owns any correction the user needs to hear.

## Record the Previous Reply

With `agent-recorded-reply-v1`, first retain the new user message as its ordinary
primary source. Then read the complete previous assistant reply in the actual
conversation and write its ordered items through `observe-exchange`. Preserve
meaning, conditions, qualifications and visible labels; no byte-for-byte copy or
match to the draft is required. The journal stores this record directly.

```json
{"at":"<fresh-state-token>","op":"observe-exchange",
 "exchange_ref":"<previous-prepared-exchange>","observation":"agent_recorded",
 "source_ref":"conversation:<previous-assistant-message-locator>",
 "agent_recording":{"before_incoming_ref":"<retained-new-user-source>",
   "items":[{"kind":"question","display_label":"Q1",
     "text":"<the complete question actually asked, including any conditions>",
     "question_ref":"<matching-saved-question>"}]}}
```

`items` records the whole reply, not just its selectable option. Each item has
`kind` (`answer`, `explanation`, `findings`, `summary`, `question` or `option`) and
`text`. Optional `display_label` preserves the label actually used, without
brackets, or null for unnumbered content. Optional `basis_refs` supplies existing
context. Map an answer/question with `question_ref`, a next step with `option_id`,
and findings with `work_refs` only when the actual content supports that link.
Preserve unmapped content as text. Do not create missing items from the draft.
For a mapped actual answer, supply its `status` under
[Answer Resolution and Communication](memory-records.md#answer-resolution-and-communication),
judged from that actual reply. Recording does not change the question's resolution.

An option may carry its existing `scope_ref` only if the actual reply conveyed
all material terms of that same saved scope, including any conditions stated
elsewhere in the reply. Preserve those conditions in the record. Omit that link
when the terms changed, were omitted or remain uncertain; recording still
succeeds, but that item cannot authorize the old scope. This mapping is the
agent's semantic assessment, not a utility certification of equivalence.

`before_incoming_ref` identifies the retained user message immediately following
the reply being recorded. The utility adds `before_incoming_event_ref` from that
source's first retained journal event, so later summary edits do not move it.
Reuse an adequate current actual-reply view and receipt, including when a later
user message returns to the same offer. Reconcile an inaccurate reconstruction or an
additional capture under [the same-reply rule](#reconcile-records-of-the-same-reply).
Use an available conversation locator, or a clearly attributed description of
the actual reply. Keep that locator distinct for each reply and reuse it for the
same reply; do not invent a native message ID or ordinal. Recording time
does not establish emission order. The new record is marked `agent_recorded`,
never `host_confirmed`, and does not claim captured host bytes.

After recording, interpret the complete new user message against these actual
items and save the usual stable references. Formatting or wording differences
alone need no renewed user approval. Materially changed or missing terms need
reconciliation before dependent work. Retain the incoming source through any
recording failure, and reuse it when resuming.
Use the same ordinary turn to reconcile any answer-communication notice through
[Helper](helper.md#resume-and-interpret); the actual record is not a completion certificate.

If the previous reply is unavailable or only a summary remains, do not reconstruct
it from the prepared draft. Recover the original conversation when possible;
otherwise retain the gap and clarify only consequential ambiguity. The last reply
can remain unrecorded until another turn. Internal scientific state is already saved.

## Reconcile Records of the Same Reply

With `actual-reply-reconciliation-v1`, optional links inside `agent_recording`
connect the existing records instead of treating them as competing messages:

| Field | Meaning |
|---|---|
| `capture_ref` | Earlier committed captured delivery whose complete actual text was read to produce these items. |
| `supersedes_recording_ref` | Current committed agent recording of this same actual reply being corrected or replaced. |

Both links stay within the same exchange. A replacement keeps the original
`source_ref` locator and `before_incoming_ref` relation to the following retained
user message, including its first-retained-event anchor. These are attributed
same-reply links, not proof of native identity. Sharing an exchange, matching text
or appending a record later does not establish message identity or emission order.
Preserve available native identity and order. New writes must replace the current
recording; already-superseded targets are rejected. Historical conflicting
branches or incomparable messages remain explicit.

For a genuine available capture, the retained full text is authoritative for
what was said. Ordered `items` interpret that text, including conditions outside
an option; they cannot add terms from the draft. Capture verification checks
retained bytes, not whether an arbitrary supplied file originated from the host.
Do not call an agent-written reconstruction a capture. Missing or changed retained
bytes remain an evidence gap, not permission to fall back silently to the draft.

For a capture that differs from the draft, read it and append its actual-item
interpretation. The observation remains byte-level `different`; a reviewed
unchanged scope can nevertheless remain usable. For example:

```json
{"at":"<fresh-state-token>","op":"observe-exchange",
 "exchange_ref":"<same-prepared-exchange>","observation":"agent_recorded",
 "source_ref":"conversation:<actual-assistant-message-locator>",
 "agent_recording":{"before_incoming_ref":"<following-retained-user-source>",
   "capture_ref":"<committed-captured-delivery>",
   "items":[{"kind":"explanation","text":"<actual content and qualifications>"}]}}
```

If a reconstruction already exists when its genuine capture arrives, name both
records in a new interpretation, preserving the original locator and anchor:

```json
{"at":"<fresh-state-token>","op":"observe-exchange",
 "exchange_ref":"<same-prepared-exchange>","observation":"agent_recorded",
 "source_ref":"<original-recording-source_ref>",
 "agent_recording":{"before_incoming_ref":"<original-following-user-source>",
   "capture_ref":"<committed-captured-delivery>",
   "supersedes_recording_ref":"<earlier-agent-recording>",
   "items":[{"kind":"explanation","text":"<actual content and qualifications>"}]}}
```

Retain every actual item, not only the illustrative explanation.
When no capture is available, repair a mistaken reconstruction by rereading the
actual conversation and using `supersedes_recording_ref` alone. A correction of
capture-backed items retains their `capture_ref`; reconstruction cannot override
contrary captured content or silently discard that source.

Current readers and dependent bindings follow the reconciled reply, including
through earlier delivery references. Historical retrieval returns the original
records. An evidence upgrade does not move the message in conversation, reopen an
unchanged answered question, or rewrite the original user decision and run binding.
If the actual content still supports the same selected option and complete scope,
existing valid acceptance remains sufficient. Changed or missing terms must be
resolved under [the existing scope rules](authorizations.md#interpret-the-later-user-decision).

## Repairing a Recording or Correcting a Sent Reply

Helper distinguishes an inaccurate recording from a genuinely misleading sent
reply. Repair the former from the actual source and update affected internal
interpretation; a visible correction is needed only if the recording error also
affected something communicated or done. Preserve the user's original words.

An actual reply can be scientifically wrong even when it matches the draft.
Preserve it as the record of what the user saw, not evidence that its claim is
true. Lead explicitly corrects the consequential
claim and explains its effect on the next decision through the existing answer,
explanation or findings fields. Update only implicated knowledge and conditions;
preserve original artifacts and assess whether they remain usable. New scientific
investigation follows the existing bounded specialist route, not an automatic
second review. Do not automatically repeat computation.

A user's response to misleading terms does not accept the hidden draft or a
corrected proposal. Retain that intent, present materially corrected work terms,
and obtain the existing required later selection before dependent protected work.
Independent discussion, redirection and cancellation remain available. A visible
correction is a new reply, not a replacement recording of the old message;
preparing it does not prove communication. Use existing reconciliation and
question-communication records where applicable, without inventing a question or
new correction queue. Next-turn recording is not an automatic error detector.

## Optional Native Capture

The routes below retain mechanically obtained actual-message text when available.
They provide different evidence from an agent-written record. An adequate native
record can be reused without adding an agent record of the same reply. If its
actual items need interpretation or it supplements an existing reconstruction,
use [same-reply reconciliation](#reconcile-records-of-the-same-reply). Captures
are optional during both ordinary recording and recovery; do not search for
exports as a routine prerequisite.

## Claude Code transcript capture

When `claude-transcript-capture-v1` is available, use the deployed host's
persisted main-session JSONL. On the tested Claude Code host these files are
under `~/.claude/projects/<project>/<session-id>.jsonl`. Locate this session and
the actual assistant record's `uuid`; do not select by matching prepared text.
The reader requires the exact session and message identities and one complete
text block. It rejects subagent, tool, duplicate and ambiguous records. An
unavailable or differently structured host transcript remains unobserved.

```json
{"at":"<fresh-state-token>","op":"observe-exchange",
 "exchange_ref":"<prepared-exchange>","observation":"assistant_emission",
 "claude_capture":{"transcript_path":"<actual-host-transcript.jsonl>",
   "session_id":"<actual-session-id>","message_uuid":"<actual-message-uuid>"}}
```

Submit with `scripts/project.cjs submit`. Code extracts the actual text without
normalizing it, retains the selected host record, and binds its identity and
hash. It also retains a hash-checked order manifest of main-session message IDs
through the selected message, with record hashes and the original transcript hash.
The derived `capture_message.order_path` contains those ordered assistant UUIDs.
Only compatible native prefixes establish relative order; truncated or conflicting
prefixes retain uncertainty. Neither record contains other message bodies.
The transcript must be the host's real export; the reader cannot
authenticate an arbitrary caller-created file. Record `host_confirmed` only
when independent host evidence establishes that attribution. This path was
checked against Claude's real persisted message and independent stream output;
other host formats require their own verified adapter.

## Other actual-message exports

For this optional export route, Helper uses it at incoming resume when the actual previous assistant message is
available; the main assistant may also capture it earlier. Explicit same-reply
reconciliation can strengthen the existing record without another user approval.
The prepared `response_path` is convenient for delivery, but cannot
serve as evidence that delivery happened.

Retain the complete actual assistant message as UTF-8 text, including any added
introduction or closing recap. Use the host's actual message/capture when available,
even if it differs from the prepared reply. Obtain the text mechanically from
the actual host export; do not label agent-written text as a mechanical export. Use
the agent-recorded path above for a faithful recording from visible conversation. The utility
checks supplied bytes, not where the caller obtained them; matching prepared text
is not independent evidence of delivery. Never fill a missing capture with the
prepared file, an edited transcript, or a model summary. If the actual text is
unavailable, retain unobserved delivery and recover
the relevant context before binding an ambiguous selection. A bare "yes" or number
depending on that missing message needs its actual wording or clarification.
Clear new investigation or explanation requests remain interpretable; a protected
action cannot use a missing historical offer as permission.

```text
node scripts/project.cjs observe-exchange --project-root <case> --input observation.json
```

```json
{
  "event_id": "event-observe-1",
  "expected_project_id": "project-study",
  "expected_last_event_id": "event-closeout-1",
  "exchange_ref": "exchange-1",
  "delivery_id": "delivery-1",
  "message_path": "actual-assistant-message.txt",
  "source_ref": "host-capture:assistant-message-1",
  "observation": "assistant_emission"
}
```

Relative `message_path` values are relative to the case; absolute source paths
are read-only. Use current project/event identities. `observation` may be
`host_confirmed` only with actual host evidence; a file alone does not establish
that attribution. Matching text alone proves neither transport origin nor consent.
Optional `observed_at` records a source timestamp or locator.

Preserve a stable actual-message source locator when the host provides one,
including on repeated observations of that same message. Equal text or hashes
do not establish identity, and an observation timestamp alone does not prove
actual emission order. Retain uncertainty when that source evidence is missing.
When the export supplies identity and order, include optional `capture_message`:
`{"conversation_ref":"<host-session>","message_ref":"<host-message>","ordinal":7}`.
The positive ordinal is the message's position in that conversation, never its
capture time. A manually supplied identity/order remains attributed evidence;
the Claude adapter derives these fields and their order-manifest hash itself.
Do not author the adapter's `order_path` or `order_sha256` manually.
Repeated capture of an older message does not make it the latest emission.
Conflicting captures of one message or unavailable order among multiple messages
remain unresolved rather than being settled by journal append order.

The memory utility freezes the actual bytes under
`exchanges/<exchange>/observations/<delivery>.txt` and commits an
`exchange_delivery` event. Its `response_sha256` identifies the prepared message;
`observed_response_sha256` identifies the captured message. `source_ref` becomes
the retained file and `capture_source_ref` preserves the supplied attribution.
The receipt reports `correspondence: exact`, `line_endings_equivalent`, `wrapped`
or `different`. Exact
comparison keeps all bytes; it does not normalize wording or internal whitespace.
LF/CRLF equivalence is narrowly declared as `response_equivalence: "lf-crlf-v1"`;
both original hashes and captured bytes remain intact. Changed spaces, blank lines,
lone carriage returns or wording do not qualify.

For a wrapper, the memory utility can locate one exact, complete prepared reply inside
the capture. Surrounding whitespace alone recovers automatically. If surrounding
prose was added, inspect the complete actual message and include optional
`wrapper_review` in the same observation request, explaining why that prose does
not change the questions, options, findings or qualifications. For example:
`"wrapper_review": "The introduction only identifies the saved consultation; it adds no instructions or changes to the proposal."`
Do not supply this for contradictory instructions, another menu or an unclear
presentation. An edited, truncated or duplicated body cannot be recovered this way.

The memory utility derives `response_span` byte boundaries and verifies that the retained
span hashes to the prepared reply. It preserves the full capture and its different
hash. This proves an intact body; the wrapper review remains the assistant's attributed
interpretation, not a machine check of meaning. A `wrapped` observation can bind
the later reply and recover saved findings without another approval or computation.
The work view can still list it in `discrepancy_refs` because the full bytes differ;
its recovered delivery status distinguishes that from an unresolved discrepancy.

A `different` result is a successfully retained observation, not confirmation
that the prepared offer was delivered. Read the full capture and record its
actual-item interpretation under [same-reply reconciliation](#reconcile-records-of-the-same-reply)
before using its options or findings. A semantic paraphrase stays byte-level
`different`; missing terms stay missing. Reconcile substantive differences through
Lead; do not enlarge work or treat a missing match as proof of a permission breach.
Independent questions and clear new directions remain interpretable. If an already
saved discrepancy qualifies for wrapper recovery, append a new observation with
its review using the retained actual capture; never overwrite the old observation.

New `record` submissions containing a native/export delivery, including batched deliveries,
require the retained actual message, its `observed_response_sha256` and
`capture_source_ref`. Their source bytes are checked before commit. A copied
prepared hash without captured text is rejected. Prefer `observe-exchange`, which
computes the hashes and retains the source automatically.
The native/export paths reject generated `response.md` files and filesystem aliases to them as
capture sources. An arbitrary separately copied file still requires honest source
attribution; matching bytes cannot authenticate where it came from.

Retry an uncertain capture with its exact original event/request identity. The
committed capture is reused without rereading a now-missing external source.
`verify` checks retained captured bytes and recovered spans as well as run
artifacts. Missing or changed captures are evidence gaps; never repair them with
prepared text.

Native/export captures additionally use `capture_protocol: "captured-delivery-v2"` and
require `message-bound-delivery-v2` (7.5.3 or later). New interpretations receive
the same prospective binding version. Earlier captured records require
`captured-delivery-v1`; recovered spans require `intact-reply-recovery-v1`.
Historical hash-only receipts still replay and retry unchanged. They remain
attributed observations, not independently checked captures.
