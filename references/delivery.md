# Capturing an actual reply

Use this at the next incoming turn when the actual previous assistant message is
available. It strengthens the existing exchange record without another user
approval. The prepared `response_path` is convenient for delivery, but cannot
serve as evidence that delivery happened.

Retain the complete actual assistant message as UTF-8 text, including any added
introduction or closing recap. Prefer an existing host capture. If transcribing
from visible session context, preserve the actual text and attribute that source
honestly. Do not substitute the prepared file, an edited transcript, or a model
summary. If the actual text is unavailable, retain unobserved delivery and recover
the relevant context before binding an ambiguous selection.

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
that attribution. Optional `observed_at` records a source timestamp or locator.

The helper freezes the actual bytes under
`exchanges/<exchange>/observations/<delivery>.txt` and commits an
`exchange_delivery` event. Its `response_sha256` identifies the prepared message;
`observed_response_sha256` identifies the captured message. `source_ref` becomes
the retained file and `capture_source_ref` preserves the supplied attribution.
The receipt reports `correspondence: exact`, `wrapped` or `different`. Exact
comparison keeps all bytes; it does not normalize wording or internal whitespace.

For a wrapper, the helper can locate one exact, complete prepared reply inside
the capture. Surrounding whitespace alone recovers automatically. If surrounding
prose was added, inspect the complete actual message and include optional
`wrapper_review` in the same observation request, explaining why that prose does
not change the questions, options, findings or qualifications. For example:
`"wrapper_review": "The introduction only identifies the saved consultation; it adds no instructions or changes to the proposal."`
Do not supply this for contradictory instructions, another menu or an unclear
presentation. An edited, truncated or duplicated body cannot be recovered this way.

The helper derives `response_span` byte boundaries and verifies that the retained
span hashes to the prepared reply. It preserves the full capture and its different
hash. This proves an intact body; the wrapper review remains the lead's attributed
interpretation, not a machine check of meaning. A `wrapped` observation can bind
the later reply and recover saved findings without another approval or computation.
The work view can still list it in `discrepancy_refs` because the full bytes differ;
its recovered delivery status distinguishes that from an unresolved discrepancy.

A `different` result is a successfully retained observation, not confirmation
that the prepared offer was delivered. Its record remains visible in the work
view, and it cannot bind an option or establish findings discussion. Inspect the
actual scope and the user's reply. Reconcile substantive differences through the
lead; do not enlarge work or treat a missing match as proof of a permission breach.
Independent questions and clear new directions remain interpretable. If an already
saved discrepancy qualifies for wrapper recovery, append a new observation with
its review using the retained actual capture; never overwrite the old observation.

New `record` submissions containing a delivery, including batched deliveries,
require the retained actual message, its `observed_response_sha256` and
`capture_source_ref`. Their source bytes are checked before commit. A copied
prepared hash without captured text is rejected. Prefer `observe-exchange`, which
computes the hashes and retains the source automatically.

Retry an uncertain capture with its exact original event/request identity. The
committed capture is reused without rereading a now-missing external source.
`verify` checks retained captured bytes and recovered spans as well as run
artifacts. Missing or changed captures are evidence gaps; never repair them with
prepared text.

Old readers without `captured-delivery-v1` cannot read these extended observation
records. Use a reader advertising this capability for new captured records;
recovered spans additionally require `intact-reply-recovery-v1`.
Historical hash-only receipts still replay and retry unchanged. They remain
attributed observations, not independently checked captures.
