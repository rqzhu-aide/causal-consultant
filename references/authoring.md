# Authoring meaningful content

This is the v8 interface. For an existing v7 case use [v7 authoring](v7/authoring.md).
Do not combine their request formats.

```text
node <skill-root>/scripts/project.cjs submit --project-root <case> --input <case>/scratch/request.json
```

A submission contains `at`, the latest `state_token`, `op`, and meaningful
content. No event ID, payload wrapper, checkpoint or authored version map is
needed. The utility allocates identities under its lock, appends history, and
regenerates project, brief and index.

## Who submits, and when

| Point | Semantic author | Submission |
|---|---|---|
| Incoming message, before consequential interpretation | Helper | `user_message`: original words and source |
| Before dependent work | Helper | `knowledge`, `decision` or `interpretation`, naming `user_message` |
| End of the selected specialist review | Named review commit owner | One `review` and any adopted changes |
| Reconciliation and closeout | Lead | Adopted `updates`, source bindings or selection changes with the appropriate save; then `reply_prepared` |
| Next resume, before dependent interpretation | Helper | `reply_recorded`, read from the previous actual assistant message |
| Substantial saved work | Selected worker through utility | Managed run operations |

Helper and Lead are responsibilities, not mandatory separate agents. A delegated
worker returns its assessment and proposed updates. The handoff names one commit
owner, normally Lead. If the worker was assigned to save, Lead reuses its entry
reference rather than saving the review again.

## Identities and updates

The header identifies the case; e1, e2, etc. identify entries. Mutable identities
are q1 for a question, f1 evidence, a1 assumption, d1 scientific decision, r1
route, p1 user context and c1 result condition. A scope, review, user decision,
prepared reply or run start uses its entry ID directly.

`updates` contains complete definitions of only the mutable records that changed.
Use `entity: "q1"` for an existing entity. Read its current body first and keep
still-valid sources, qualifications and remainders. This replaces that entity's
definition, not its collection. Do not resubmit the whole project inventory.

Omit `entity` only for a new record. Optional `as: "allocation"` is a
request-local alias: `@allocation` can be used in semantic reference fields in
that request, and the receipt returns its ID as `authoring_refs.allocation`.
An alias may also name an explicitly supplied existing `entity` in that request.
If it returns q3, a later changed definition uses `entity: "q3"`. Reusing an
alias without `entity` in a new submission creates another record, including
when revising an already saved draft. A wording-only reply revision references
existing records and needs no entity updates. Reserved `@entry` names this save,
allowing a decision to select itself without guessing its ID. Prose and external
source locators are not record identities.

Bare `q1` selects its current definition; `q1@e12` selects the definition
saved at e12. `e15/N1` selects an actual labeled item in a recorded reply.
Public A/Q/N labels are local positions, not global identities.

## Small incoming save

If initialization returned `case-example:e0`, retain the actual message first:

```json
{
  "at": "case-example:e0",
  "op": "user_message",
  "text": "I do not know how the sample was selected.",
  "source": "conversation:user-1",
  "complete": true
}
```

After that returns e1, one knowledge save can handle the whole message:

```json
{
  "at": "case-example:e1",
  "op": "knowledge",
  "user_message": "e1",
  "updates": [{
    "as": "selection",
    "kind": "evidence",
    "evidence_kind": "user_statement",
    "source_ref": "e1",
    "summary": "The user does not know how the sample was selected.",
    "limitations": ["The selection mechanism remains unknown."]
  }],
  "next_action": {
    "kind": "lead_only",
    "scope": "Explain which collection records could clarify selection.",
    "reason": "Selection affects interpretation and the population boundary."
  }
}
```

No separate interpretation narrative is needed. Use `interpretation` for mixed,
conditional or ambiguous meaning. Claim whole-message handling only after
accounting for all consequential questions, conditions and steering.
Lead's next `reply_prepared` uses `responds_to: "e2"` and the
[response fields](team_lead.md#closeout).

## Direction and generated views

`next_action` says what happens now. Acceptance can coexist with `lead_only`
or `wait`; permission does not itself select immediate execution.
A specialist direction includes an assignment; protected work also names its
`scope_ref` and `decision`. Work and closeout identify committed handling with
`responds_to`.

Lead owns `selection: {knowledge_refs, work_refs}` for continuation relevance,
initializing or refreshing it when adopting consequential findings as described
in [Lead selection](team_lead.md#select-the-next-useful-contribution).
The utility retains pending messages, live questions, restrictions and unfinished
work independently. No agent writes brief prose.

`overview` contains source bindings, not repeated facts. For example,
`{"causal_target":{"ref":"d1","field":"statement"}}` derives the overview from
the current target decision. Bare bindings follow revisions; exact bindings stay
historical. Revise the canonical record when its meaning changes.

## Receipts and recovery

A journal receipt returns `entry_ref`, the committed operation, and
`state_token`, the current head. Exact retry returns the original entry even
after later history. Read current context before new semantic work.
Do not change `at` to retry a committed request.

Identical definitions keep their version. A pure knowledge no-op creates no
entry or durable retry receipt. If the head later changes, reread before
resubmitting it. A meaningful handling, decision or direction save remains
an event even when entity definitions are unchanged.

Keep exact requests in the case's `scratch/`. After uncertain append, inspect
history before retrying. After committed history but failed exports, use
`recover`; do not repeat the intake or completed work. See [memory](memory.md)
and [runs](runs.md).

v8 uses `compact-v2` by default. v7 retains `legacy` and `compact-v1`.
The output format does not change saved responses or provide host capture.
