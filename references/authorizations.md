# Work scopes and user decisions

This is the v8 contract. Existing v7 cases use
[v7 authorizations](v7/authorizations.md). New v8 cases need no policy-activation
save. The user may ask questions, redirect, defer or end. Acceptance, direction,
execution and communication remain separate facts.

## Which work is protected

| Work | Requirement |
|---|---|
| Inspection, elicitation, readiness and feasibility | Clear bounded request and recorded direction |
| Requested preparation | Source-grounded transformations; no hidden target comparison |
| Bounded graph discovery | Candidate structure and diagnostics; no effect or policy result |
| Target analysis | Concrete presented scope and later acceptance |
| Durable report | Findings-bound offer and later selection |

Target computation includes raw exposure-outcome contrasts, adjusted/subgroup
effects, outcome-based target selection, treatment-rule learning and policy-value
estimation. Calling it preliminary or descriptive does not change that boundary.
Input distributions, keys, missingness and exposure-only support are audit
diagnostics. Routine checks within accepted analysis need no further decision.

Design or nonidentification findings can support a report without inventing
an effect estimate. Analysis may return notes and diagnostics; production of
its durable report still uses the report choice.

## Present a concrete scope

The specialist may propose terms; Lead owns what is offered. Adopt justified
changes to governing scientific records before freezing the scope, either in
an earlier save or in that scope submission's `updates`. The utility freezes
the resulting definitions. Keep those governing definitions unchanged in the
later reply that offers the scope.

| Field | Meaning |
|---|---|
| `action` | analysis or report |
| `terms` | target, population, evidence, approach, checks array, outputs, claim_boundary |
| `assignment` | Design-worker execution or report-writer assignment |
| `execution` | Inputs and execution-only details from [runs](runs.md); shared terms are derived |
| `basis_refs` | Relevant source-linked current target, evidence, assumptions and governing records |
| `findings_refs` | Governing completed run, review or computed evidence IDs actually discussed; required for reports |
| `supersedes`, optional | Earlier scope being replaced |

For reports, match each governing ID to the actual answer/findings item's
`work_refs`, including earlier replies. Keep detailed source evidence in
`basis_refs` and report `execution.evidence_refs`. Repair incomplete mappings
from that message's actual words; do not attach earlier findings to a later
item to pass the check. Source ancestry alone does not establish discussion.

The utility freezes exact basis versions and hashes available inputs. It expands
dependencies including conditions, assumptions and source records. It does not
choose scientific relevance or certify identification. Bind dependencies that
could change applicability. Keep current governing records bound; use original
messages for request provenance. Before freezing a scope, distinguish a question
that supplies only prompt or communication history from an answer, remainder or
source qualification that governs the work. Retain the former in the journal
without adding it to a governing record's `basis_refs`; cite the original message
and actual scientific support instead. Preserve the latter in its owning record
and keep its substantive dependencies bound rather than dropping them to avoid
staleness.
Identical canonical updates keep their versions; material changes need reconciled
terms rather than silent rebinding.
Precise actual-item sources keep their item locator and bind to the containing
reply entry; the utility supplies these bindings from `basis_refs`.

Offer the scope through the [protected next-step shape](team_lead.md#closeout),
including when the label asks the user to approve it. The renderer inserts its
terms and full-scope link; do not copy another execution plan into the response.
Saving or rendering does not authorize work.

Every next-step option is at most 50 words after rendering, including the title,
action, inserted terms and visible link text. The former 100-word scope-option
exception does not apply. Write `terms` concisely before saving the scope; put
execution detail in `execution` without removing material selection conditions.
Avoid restating in the option's own prose what the renderer will insert.
For explicitly requested clarification, an answered `user_questions` item may
link the same `scope_ref` and display terms once under its 200-word allowance;
the option points there and still stays within 50 words. Do not invent a user
question to obtain that allowance. If complete terms cannot fit either applicable
placement, offer discussion without a selectable scope. Do not hide material
conditions only behind a link or truncate them automatically.

## Record the later choice

Helper retains the complete later message and records the previous actual reply
if needed. One `decision` names:

- `user_message`: original source entry or entries.
- `scope`: immutable scope entry.
- `actual_reply` and `item`: recorded reply and its actual option label, such as N1.
- `choice`: accept, defer, decline or withdraw.
- `reason`: consequential meaning and conditions.

A simple decision can handle the whole message. Save additional questions,
facts or restrictions with it when needed. Keep availability and unanswered
remainders in their question/source records when the scientific assumption is
unchanged; revise assumptions and result conditions when their meaning changes.
For immediate protected work, `next_action` names kind specialist, assignment,
scope_ref and `decision: "@entry"`. This requires neither guessing an ID nor a
second save.

Acceptance needs the complete original input and an unambiguous actual option
mapping the full scope. The assistant makes that semantic mapping from what the
user saw. A draft or matching hash cannot replace it. Missing or changed terms
cannot authorize the old scope. Explicit withdrawal of existing acceptance
remains recordable even if earlier delivery needs repair.

For "Yes, but explain the assumptions first", preserve clear acceptance, save the
question and choose Lead-only work now. A result-dependent question can use
after_work and be answered at closeout. Do not turn every question into a new
approval round.

## Starting, continuing and changing focus

Start through [runs](runs.md), using the scope, decision and committed handling
selected by current direction. One acceptance starts one run; resume that run
rather than starting it twice. Late saves for older messages do not replace
newer steering.

When focus changes, retain earlier acceptance and unfinished work. Record
whether the new direction defers it, withdraws permission or asks for independent
explanation. Returning later can use a still-valid decision after checking its
scope, basis, input bytes and current direction.

A report acceptance can record a local formatting adjustment:
`presentation_adjustment: {formats: ["html"], user_message: "<same-source>"}`.
Supported formats are markdown, html, pdf, docx and text. This changes no target,
evidence, conclusions or publication destination. Substantive changes need new
terms.

## Deferred held-out input

The existing narrow exception permits one specifically identified unavailable
analysis input with `deferred_release: true` and no offered hash. State its
identity and role publicly. Available inputs are hashed normally. The utility
hashes and snapshots released bytes before computation. This does not authorize
replacement of available inputs or use of a different dataset.

## Actual-message repair

Later capture can confirm the offer or expose a recording mistake. Genuine
captured text determines wording; the assistant still owns meaning and item
links. Confirming the same terms preserves the original decision. Discovering
missing material terms requires correction of the affected interpretation, not
retrospective permission. Never rewrite the original user decision. A wrong
actual scientific statement also needs visible correction. See [delivery](delivery.md).
