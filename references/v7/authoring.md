# Submit content with mechanical fields supplied

Use `submit` for ordinary writes when the utility advertises
`assisted-authoring-v1`. Existing low-level commands remain compatible.

```text
node <skill-root>/scripts/project.cjs submit --project-root <case> --output-format compact-v1 --input request.json
```

A request has `at`, the `state_token` returned by `init`, a fresh write or
`context`, and `op`, an existing record type or run command. Remaining fields
are that operation's content. For record types, omit the `payload` wrapper.
The helper supplies event IDs, missing new-record IDs, protocol, current
renderer, and an exchange's turn from its explicitly selected interpretation.
It hashes selected scope input files if their `sha256` is omitted and expands
`basis_refs` to versions. For prepared exchanges, it copies saved scope terms
through `scope_ref`; it never adds draft terms to an actual reply record.
It does not choose relevant evidence, assignments, consent, methods or answers.
Use [Lead's response contract](team_lead.md#closeout) for field purposes, flat
item structure and whole-item budgets. The renderer supplies headings and labels.
`explanations: [{text, basis_refs}]` records useful explanations without inventing
questions or work. Preserve material qualifications and full internal records.

For requested detailed scope clarification, an answered `user_questions` item
may use the same `scope_ref` as an option in this exchange. The renderer shows
the saved terms once in that answer and points the short option to it. Follow
[the source and delivery requirements](authorizations.md#present-a-concrete-scope).

For a new record, optional `as: "name"` gives it a local alias. Use `@name` in
record-reference fields within the same request, including `evidence_for`,
`strategy_ids` and `supersedes`. The receipt's `authoring_refs.name` is its saved
ID for later requests. Prose, external source locators such as `source_ref`,
catalog choices and opaque metadata such as `environment` stay unchanged. Use an
existing record ID when updating it; patches cannot create anonymous records.
No need to invent new event, turn, interpretation, exchange or run IDs.

## One ordinary incoming turn

First read `context --output-format compact-v1` with `{"mode":"brief"}`.
Its envelope contains `state_token`; `.brief` points into shared `.records`.
Reuse included bodies and follow exact lookup pointers for missing detail.
The output flag never belongs inside a submitted request and does not change
retry identity. See [memory](memory.md#reading) for capability/legacy support.

This synthetic request illustrates a user saying, "I do not know how the sample
was selected." For real work use the actual complete message and its source.
Replace `project-example:event-init` with the returned token. This Lead-only
explanation saves intake and closeout together; `submit` supplies their links.
Save intake before dependent work, and retain the prerequisite saves for a
protected offer. A question to the user also needs its saved question record
and reference.

```json
{
  "at":"project-example:event-init", "op":"exchange_prepared",
  "changes":{"evidence":[{
    "as":"incoming", "kind":"user_statement", "source_ref":"chat:user-1",
    "source_excerpt":"I do not know how the sample was selected.",
    "complete_message":true, "summary":"The user cannot yet explain sample selection."
  }]},
  "interpretation":{
    "as":"intake", "incoming_refs":["@incoming"], "basis_refs":["@incoming"],
    "components":[{"kind":"information", "meaning":"Selection remains unknown.",
      "established":[], "unresolved":["Sample selection process"]}],
    "next_action":{"kind":"lead_only", "scope":"Clarify the available collection records.",
      "reason":"Collection information could change the scientific target and interpretation."}
  },
  "exchange":{
    "as":"reply", "basis_refs":["@incoming"], "completed_work_refs":[],
    "reconciliation":{"changes":[], "limitations":["Selection is unknown."],
      "unresolved":["Collection process"], "next_direction":"Identify available collection records."},
    "response":{"explanations":[{"text":"We can describe the observed sample. Generalizing it requires knowing how observations entered it.","basis_refs":["@incoming"]}],
      "questions":[], "next_steps":[]}
  }
}
```

Use the rendered draft to compose the reply. At the next resume, retain the
incoming user source, read the previous assistant reply in conversation and
record its actual items through [reply recording](delivery.md#record-the-previous-reply).
Use `op: "observe-exchange"`, `observation: "agent_recorded"`, the previous
`exchange_ref` and a fresh token. The helper supplies the record ID. Record the
actual reply before binding a dependent user response to its items. If it is
unavailable, follow the [delivery fallback](delivery.md#record-the-previous-reply),
retaining the gap and clarifying only consequential ambiguity. Independent
interpretation and necessary failure or cancellation replies need not wait for
recording. Never fill missing content from the draft or label an agent-written
record as a native capture.

With `actual-reply-reconciliation-v1`, an `agent_recording` may link an existing
`capture_ref` and/or `supersedes_recording_ref` under
[delivery reconciliation](delivery.md#reconcile-records-of-the-same-reply).
Supply the committed delivery IDs, complete actual items and original
following-user anchor; a replacement also keeps the same `source_ref` locator.
These links repair the record of the same reply, not what was actually said.

## Selected work and corrections

For a scope, supply its scientific terms once, the relevant `basis_refs` and
`findings_refs`; the public option uses `scope_ref`. After a real selection has
been interpreted and recorded, start the corresponding run with:

```json
{"at":"<fresh-token>","op":"start-run","scope_ref":"<selected-scope>",
 "interpretation_ref":"<selection-interpretation>","authorization_ref":"<accepted-decision>"}
```

The receipt supplies `run_id`, `run_path` and frozen input locations. Use
`write-run-file` and `finalize-run` through the same interface with the explicit
run ID and required file/environment fields from [runs](runs.md). File writes
do not advance the journal token. A drafting correction uses a new output
filename in the in-progress run. Completed runs remain immutable; a later
report revision uses the existing new-run and authorization rules.

For an existing consultant question, select its ID and supply a narrow `patch`.
Retain a partial answer as `status: "open"`, with sourced `resolution.answer_refs`
and the unresolved `remaining` items. Interpret a new user answer in the same
submission when it changes that question. User-origin questions follow the
[existing question contract](memory-records.md#questions), not these resolution
fields. Semantic record fields and the
complete protected example are conditional references in
[memory-records](memory-records.md) and [record-examples](record-examples.md).

## Retry and diagnostics

Retain the exact original input for journaled operations. Retrying it produces the same operation ID
and returns its original committed result, even after later history or source
deletion. Run-start retries recover input locations from the retained,
hash-verified frozen plan without reading original inputs. If that plan is
missing or changed, the receipt still confirms the commit and run identity,
with `receipt_recovery_error` and no `inputs`; restore the original artifact
before using those details. Finalization retries return the committed manifest
reference and hash, without asserting that its file is still intact.
An exact retry of an older alias expansion returns its historical record
unchanged; it does not repair old source attribution.

Keep request files under this project's `scratch/`; recover examples through
`help <command>`, this guide or the project's saved records, not shared Temp.
`help submit` includes an evidence-summary/limitations patch that preserves its
source fields. Prepared output is a drafting aid; the next-turn actual record
establishes what was said.
Do not edit `at` to retry. On `replayed: true`, read current context
before new work; that receipt's token describes the original operation.
A genuinely new stale operation is rejected. Inspect the changed dependency,
reconsider its meaning and then author a new request from fresh context.
Missing findings diagnostics identify the exact references and whether their
discussion is absent, unobserved or stale. Never add an unrelated reference
merely to satisfy a check.

`write-run-file` is a nonjournal file operation: it requires current state even
on retry and confirms an existing file only when its bytes match. After an
uncertain file write with intervening history, read context and check that file
before continuing. Keep changed content in a new filename; do not overwrite it.
