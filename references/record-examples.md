# Connected v8 record examples

These are hypothetical authoring examples, not executed records or evidence of
user consent. They illustrate [memory records](memory-records.md) and
[authoring](authoring.md). Existing cases use [v7 examples](v7/record-examples.md).
For real work use actual words, sources, IDs and the current receipt's token.

Requests below go to `submit --project-root <case> --input <request.json>`.
The utility supplies entry IDs, timestamps and integrity metadata. A saved
request is retained unchanged for an uncertain retry. The examples assume a
fresh case named `case-example`, no unrelated intervening saves, and head `e0`.
The displayed eN values describe the resulting sequence, not IDs to submit.

## 1. Original input and a sourced information request

Helper first preserves the user source. This becomes e1:

```json
{
  "at": "case-example:e0",
  "op": "user_message",
  "text": "I want to study whether the rollout improved scores across all sites. Readiness might have been measured before rollout, but I need help finding out. Please keep explanations brief.",
  "source": "conversation:user-1",
  "complete": true
}
```

At e2, a knowledge save handles the whole message, retains the target, question
and communication preference, and chooses explanation/elicitation. In this fresh
case the receipt maps `target` to d1, `readiness` to q1 and `brevity` to p1. No
separate interpretation is needed merely to restate this straightforward request.

```json
{
  "at": "case-example:e1",
  "op": "knowledge",
  "user_message": "e1",
  "updates": [
    {
      "as": "target",
      "kind": "scientific_decision",
      "decision_kind": "target",
      "statement": "Assess whether the rollout improved scores across all sites.",
      "status": "current",
      "basis_refs": ["e1"]
    },
    {
      "as": "readiness",
      "kind": "question",
      "statement": "When was readiness recorded, and how was it defined?",
      "origin": "consultant",
      "status": "open",
      "basis_refs": ["e1"]
    },
    {
      "as": "brevity",
      "kind": "user_context",
      "context_kind": "communication",
      "statement": "The user asks for brief explanations.",
      "status": "current",
      "basis_refs": ["e1"]
    }
  ],
  "overview": {
    "objective": {"ref": "@target"},
    "causal_target": {"ref": "@target"}
  },
  "selection": {"knowledge_refs": ["@target"], "work_refs": []},
  "next_action": {
    "kind": "lead_only",
    "question_refs": ["@readiness"],
    "reason": "Identify readiness timing and definition before assessing its role in the study."
  }
}
```

Lead prepares e3. The response has no redundant work summary and no invented
work offer. The renderer supplies A1/Q1 and the populated public headings.

```json
{
  "at": "case-example:e2",
  "op": "reply_prepared",
  "responds_to": "e2",
  "response": {
    "explanations": [{
      "text": "Readiness measured before rollout could help explain how sites were selected. Its definition determines what it can tell us about differences between sites.",
      "basis_refs": ["q1"]
    }],
    "questions": [{
      "question_ref": "q1",
      "text": "When was readiness recorded, and how was it defined?"
    }],
    "next_steps": []
  }
}
```

Preparation is not proof that these words were sent. Lead presents the saved
structured content. The actual record below is valid only if that is what the
assistant actually said.

## 2. Partial answer, actual reply and useful continuation

The next user message becomes e4 before any previous-reply recording:

```json
{
  "at": "case-example:e3",
  "op": "user_message",
  "text": "Readiness was recorded in 2021, before rollout. I do not know its definition. There may be a coding guide in our archive.",
  "source": "conversation:user-2",
  "complete": true
}
```

Helper reads the actual preceding reply and saves its faithful items as e5.
Recording order differs from conversation order: `before_user: "e4"` preserves
which reply the user answered. Do not reconstruct it from e3 if the actual reply
is unavailable or different. If it included "limited power" or an option title,
those words belong in the item's text even if a shorter paraphrase seems adequate.

```json
{
  "at": "case-example:e4",
  "op": "reply_recorded",
  "prepared": "e3",
  "before_user": "e4",
  "source": {"kind": "assistant_recorded", "locator": "conversation:assistant-1"},
  "items": [
    {
      "kind": "explanation",
      "label": "A1",
      "text": "Readiness measured before rollout could help explain how sites were selected. Its definition determines what it can tell us about differences between sites."
    },
    {
      "kind": "question",
      "label": "Q1",
      "text": "When was readiness recorded, and how was it defined?",
      "question_ref": "q1"
    }
  ]
}
```

The e6 handling save preserves the supported timing and the exact remainder.
It also records the stated limitation and possible next source. It does not
repeat the timing question or treat lack of knowledge as an answer to definition.

```json
{
  "at": "case-example:e5",
  "op": "knowledge",
  "user_message": "e4",
  "updates": [{
    "entity": "q1",
    "kind": "question",
    "statement": "When was readiness recorded, and how was it defined?",
    "origin": "consultant",
    "status": "open",
    "reason": "The user reports 2021 timing before rollout, does not know the definition, and identifies a possible coding guide.",
    "basis_refs": ["e1", "e4"],
    "resolution": {
      "answer_refs": ["e4"],
      "remaining": ["The definition of readiness is still unknown."]
    }
  }],
  "next_action": {
    "kind": "lead_only",
    "question_refs": ["q1"],
    "reason": "Ask whether the existing coding guide is available; retain the definition as unknown if it is not."
  }
}
```

Current q1 now means `q1@e6`; `q1@e2` remains retrievable. An unrelated later topic
does not erase this supported portion or remainder. An identical resave of q1
does not create a new q1 version. User-origin questions retain their separate
status/reason/answer-evidence contract; this `resolution` shape is not used for
them.

If the coding guide later arrives, update any current "guide not yet provided"
fact with its source. Adopt what the guide establishes and the justified q1
remainder together; do not infer timing or definition merely from its arrival.
The user's earlier lack of knowledge stays in the original message history.
Scientific consequences needing assessment return through the specialist and
Lead, rather than becoming automatic changes to every assumption or route.

## 3. Accepted scope, but explanation first

This is a separate later situation, not a continuation with missing computed
results fabricated between e6 and e20. Assume the retained history establishes:

| Entry | Established content |
|---|---|
| e20 | Immutable report scope with reviewed findings, their conditions and complete material terms |
| e21 | Prepared report offer, N1 referencing e20, with the governing findings discussed |
| e22 | Complete user message: "Yes to N1, but explain the assumptions before writing the report." |
| e23 | Faithful actual recording, anchored before e22, including the governing findings with their work references and N1 mapped to e20 |

Helper saves e24. The new user question receives q2 if q1 is still the only
previous question. The decision retains acceptance while selecting explanation.

```json
{
  "at": "case-example:e23",
  "op": "decision",
  "user_message": "e22",
  "actual_reply": "e23",
  "item": "N1",
  "scope": "e20",
  "choice": "accept",
  "updates": [{
    "as": "explain_assumptions",
    "kind": "question",
    "origin": "user",
    "statement": "Explain the report's assumptions before writing it.",
    "status": "open",
    "basis_refs": ["e22"]
  }],
  "next_action": {
    "kind": "lead_only",
    "scope": "e20",
    "decision": "@entry",
    "question_refs": ["@explain_assumptions"],
    "question_timing": [{"question_ref": "@explain_assumptions", "timing": "before_work"}],
    "reason": "Explain the assumptions before executing the accepted report scope."
  }
}
```

The utility resolves `@entry` to e24. No report starts, and no extra approval is
created merely to restate acceptance. A later request to proceed can cite this
still-applicable decision and select the appropriate specialist direction.
Changed material terms require reconciliation under [authorizations](authorizations.md).

## 4. Bounded review and explicit adoption

Suppose a later complete incoming message at e30 asks which source could resolve
readiness's definition, and the prior actual reply has been recorded at e31.
At e32 Helper selects one bounded assessment with
`assignment: {"specialist_id":"domain_expert","operation":"review"}`. Its
direction and source links establish the assignment before the review occurs.

The specialist returns its assigned assessment. The named commit owner saves one
review with `responds_to: "e32"`, `summary`, `assignment`, `question_addressed`,
nonempty `work_performed` and `findings` arrays, source references and limitations.
A suggested question in that review is still a suggestion. Adopt it through a
typed `updates` question only if it is useful. Lead then prepares one reply
attributed to e32, citing the review and retaining its scientific qualifications.

This flow needs no artifact run if no artifact-producing work occurred. It also
needs no second review from Lead or a separate authored project summary.

For a review returning completed analysis run e40, the review request includes
this fragment alongside its assignment and findings:

```json
{"op": "review", "work_refs": ["e40"], "evidence_refs": ["f7"]}
```

`work_refs` identifies assessed work; `selection.work_refs` selects continuation
content. Supporting inputs use `evidence_refs`.
For a later report run e50 that uses e40's results, the report review names e50
in `work_refs`. Using the analysis as input does not assert another assessment
of e40. These references supplement `responds_to`; they do not replace the
prospectively selected handling or create a run for the no-output review above.
If review e42 explicitly names e40 in `work_refs`, Lead's findings may cite e42
without repeating e40. A source citation alone does not establish this link.
A report governed by that review uses `findings_refs: ["e42"]`; its detailed
evidence stays in `basis_refs` and `execution.evidence_refs`.

Suppose e42 also adopts computed evidence f8 with its result conditions, and
source f7 remains relevant. The next closeout e43 includes this fragment in its
existing `reply_prepared` request:

```json
{
  "selection": {"knowledge_refs": ["f7", "f8"], "work_refs": ["e42"]},
  "next_action": {"kind": "wait", "reason": "Completed work is returned to the user."},
  "response": {
    "findings": {
      "summary": "Adopter estimate: +4 score points (95% interval 3 to 5).",
      "diagnostics": ["Pretrend check found no clear difference."],
      "limitations": ["Requires parallel trends; generalization beyond adopters is unsupported."],
      "work_refs": ["e42"]
    }
  }
}
```

This selects f8 with its linked conditions and the review of e40; it needs no
separate selection save or authored brief. Here f7 and f8 are the relevant
knowledge selection; a real replacement retains any other still-useful refs.
Omitted lists retain prior selection. Here `wait` replaces obsolete execution;
retain another selected action or newer user steering instead when applicable.
The complete findings item, including Checks and Limits, stays below 50 words.

## 5. Recording repair versus correcting what the user saw

For that closeout, suppose the actual response nevertheless changed the title
and added a diagnostic qualification. It also partially answers existing user
question q3, "Does this establish benefit for all sites?" q3 remains open because
benefit beyond adopters is unresolved:

```markdown
[To answer your question]

[A1] Adopter result: +4 score points (95% interval 3 to 5).

Checks: Pretrend check found no clear difference, with limited power.

Limits: Requires parallel trends; generalization beyond adopters is unsupported.

[A2] The supported result concerns adopters. Benefit beyond adopters remains unresolved.
```

After retaining the next user message as e44, Helper records that actual wording
as e45, not the shorter draft. `work_refs` supplies interpretation separately:

```json
{
  "at": "case-example:e44",
  "op": "reply_recorded",
  "prepared": "e43",
  "before_user": "e44",
  "source": {"kind": "assistant_recorded", "locator": "conversation:assistant-before-e44"},
  "items": [{
    "kind": "findings",
    "label": "A1",
    "text": "Adopter result: +4 score points (95% interval 3 to 5).\n\nChecks: Pretrend check found no clear difference, with limited power.\n\nLimits: Requires parallel trends; generalization beyond adopters is unsupported.",
    "work_refs": ["e42"]
  }, {
    "kind": "answer",
    "label": "A2",
    "text": "The supported result concerns adopters. Benefit beyond adopters remains unresolved.",
    "question_ref": "q3",
    "answer_status": "pending",
    "work_refs": ["e42"]
  }]
}
```

The q3 link identifies the question addressed; pending retains its unresolved part.

Any substantive unsectioned text would also be retained as `other`. Recording
neither repairs a scientific error nor permits adding unseen draft terms.

For the earlier report offer, if e23 accurately records it and a later genuine
capture confirms it, keep both observations with explicit same-reply links.
An assistant mapping of that capture can cite `capture_ref` and, when replacing an earlier mapping,
`supersedes_recording_ref`. Preserve the original following-user anchor and real
content. Stronger evidence of unchanged terms does not invalidate e24 acceptance.

If the actual reply omitted a material condition, the hidden draft cannot supply
it. Preserve the original decision and reconcile the affected terms before work.
If the assistant actually stated a wrong result, recording the original correctly
does not correct the user's understanding: issue a new visible correction and
adopt the necessary sourced knowledge changes. Do not rewrite the sent message.

A confirmed actual answer also remains in history when a later reply drafts the
answer again. The newer draft's delivery is separate: it neither erases that
earlier communication nor becomes confirmed by it. If the new answer changes a
qualification or corrects the result, reconcile its applicability and update
the question's supported disposition and sources as needed; its correction
still requires actual delivery. No second answer ledger is needed.

## 6. Completed work and failed export

In a separate failure scenario, suppose work starts at e40, completes at e41 with
retained artifacts/manifest, and closeout is prepared at e42. The generated
project may still show e41 if its e42 export failed. That does not undo e42 or
justify rerunning e40.

Read current context or recover generated exports from the journal. If the e42
receipt was lost, retry its exact original request. Keep the original `at` for
that retry; use a fresh current token for genuinely new content. A no-op receipt
is not a committed event and does not promise a historical replay after the head
changes. A missing immutable plan, capture or output needs its original bytes;
replaying the journal cannot manufacture them.

The final actual reply may remain unrecorded until another turn. Preserve
completed work and communication uncertainty separately, and return control
without inventing another user message or requiring a report as the conclusion.

## 7. Concise scope option

Use concise public `scope.terms` before saving a proposal. The option's own
`label` and `scope` add little prose because the renderer inserts all seven
material term fields. Execution settings stay in the existing execution fields.
For example, the following complete option stays below 50 visible words:

```markdown
[N1] Analyze adopters

Proceed.

Score effect averaged equally over 2025 and 2026. 60 adopting sites. Requires baseline readiness, parallel trends, stable measurement, no anticipation or spillovers. Readiness-stratified DiD with site-clustered intervals. Evidence: panel.csv, rollout record, dictionary. Checks: pretrends; overlap; trend sensitivity. Output: estimates and intervals.

Full saved scope
```

The final line shows only the link label. In an actual response, the renderer
links it to the saved scope inside the consultation's case folder; that generated
file is not part of this skill's distribution.

This example proposes only the adopters' effect. A broader target needs its own
visible conditions. Count the rendered option, not just its authored `scope`
sentence. An explicitly requested scope answer can carry the full terms within
200 words; the referring option still has a 50-word maximum. Preserve complete
terms and actual sent wording even when an earlier reply exceeded its budget.
