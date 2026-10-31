# Project Memory

Use this shared operating guide with [Helper](helper.md) for incoming work and
[Lead](team_lead.md) for closeout. Reuse intact guidance and handoffs; load the
relevant [record section](#record-lookup) before a decision or write needs it.

Use [submit authoring](authoring.md) for ordinary writes and exact-retry rules.
The low-level `record` envelope below remains compatible.

## Authority and Entry

`journal.jsonl` is authoritative. `project.yaml` is its rebuildable JSON-form
YAML projection; `case-brief.md` is a generated reading view. The memory utility
alone writes them. Never hand-edit them or maintain an independent case summary.
Follow [SKILL.md](../../SKILL.md) for the project folder. A missing brief does not
justify creating another project; legacy `project_state.yaml` is not converted.

```text
node <skill-root>/scripts/project.cjs <command> --project-root <folder>
```

Check `capabilities` once for a loaded utility; it needs no project root. Require
`durable-exchanges-v1`, `user-question-routing-v1`, `consultation-loop-v1`,
`reply-reconciliation-v1` and `case-brief-v1` before writing their records.
New four-section replies require `lead-markdown-v11` in the utility's advertised
`renderers`, `section-item-labels-v1` (7.5.5 or later),
`visible-scope-answers-v1` (7.5.4 or later),
`four-section-responses-v1` (7.5.3 or later),
`conversational-responses-v1` (introduced in 7.0.13) and `compact-proposals-v1`
(introduced in 7.0.11). Historical v1-v10 remain supported.
The current authoring forms require `concise-authoring-v1` (7.0.12 or later).
The preferred `submit` path additionally requires `assisted-authoring-v1`.
This is an input capability, not a new historical journal-reader requirement.
New message identity/order binding and pending source recovery require
`message-bound-delivery-v2` and `pending-intake-v1` (7.5.3 or later). These apply
prospectively; historical journals and exact retries keep their original semantics.
Ordinary next-turn reply recording requires `agent-recorded-reply-v1` (7.5.6 or later).
The optional `capture_ref` and `supersedes_recording_ref` links require
`actual-reply-reconciliation-v1` (7.5.12 or later); existing reply records remain valid.
Compact output and exact lookup require `compact-memory-views-v1` and
`exact-record-read-v1` (7.5.7 or later); they do not change saved record schemas.
Deferred held-out analysis inputs require `deferred-release-v1` (7.2.0 or later).
Utility support differs from this project's activation: inspect brief context's
`consultation_policy` (`policy`, `event_ref`, or `null` when inactive). Use
[authorizations](authorizations.md#activate-the-current-policy) for activation
and protected work. Never fabricate past exchanges or approval to update history.

Commands are `init`, `status`, `context`, `history`, `record` and recovery below.
`record` requires `--input <json-file|->`; `context` accepts it. Init preserves an
existing supported project and refuses legacy project folders. Reads never mutate.
Pass JSON with `--input`, not as a positional filename or `--file`/`--event`.
The command is `record`, not `record-event`. CLI errors list the rejected argument
and the command's valid options. For complete connected requests, use the
[protected record path](record-examples.md) when first assembling an offer or closeout.

## Reading

Normally request `context --output-format compact-v1 --input <json-file|->`
with `{"mode":"brief"}` and optional `expected_last_event_id`. Reuse current
receipts and already included bodies; do not mix brief and focused selectors.

The envelope contains identities/state token and one `records` entry per included
record version. `brief.cards` and `recent_intakes` point into those entries with
`body_locator`; `body_mode: "brief"` marks selected fields with omitted detail.
The brief also retains `unfinished`, `operational`, selection/conversation
`coverage`, and `file_current`. It contains no duplicate Markdown body;
`case-brief.md` remains the standalone readable export. Read
[the format contract](memory-records.md#reading-details) only when needed.

| Need | Read |
|---|---|
| Ordinary resume | Compact brief: qualified selected knowledge, live controls, five recent saved intakes and older unfinished issues |
| Missing detail or a known older record | `context` with `{"mode":"record","records":[{"record_ref":"known-id"}]}`; add `event_ref` for its exact defining version; batch related IDs |
| Dependencies remain unclear | Focused `context --output-format compact-v1` with `focus_refs` and optional query |
| Broad reassessment | `status --output-format compact-v1` |
| Unknown ID or complete event history | Literal `history --query`, then exact record lookup or `history --event-id` |

The new unsaved host message is separate from the five saved intakes. Saving its
primary source occupies one position; interpretation and late reply observations
complete that intake without adding another. Older live issues do not expire.
For uninitialized selections use broad status and relevant sources, then curate
actual records. Intentionally empty differs from uninitialized.

Actual item interpretations live in their delivery body. Native captured text is
a separate `captures` expansion with its existing verification/identity limits.
Use the canonical current reply and its links under
[delivery reconciliation](delivery.md#reconcile-records-of-the-same-reply);
historical bodies remain unchanged.
Recover relevant older actual replies before interpreting dependent choices;
a draft cannot establish what was said. Keep claim qualifications, unresolved
premises and attribution visible. Expand omitted conditions before relying on
their claims; do not fetch again when adequate full records are already included.

Operational progress comes from runs; file evidence/snapshots do not establish
inspection, present availability or scientific validity. Reconcile affected
current summaries under [record ownership](memory-records.md#record-ownership),
preserving historical assessments. A newer source or completed run does not
automatically settle a scientific issue. On `STALE_CONTEXT`, refresh and reassess.
Missing links or exhausted pages do not establish sufficiency.

Legacy output remains available by omitting the output flag or using `legacy`.
Use it for an older consumer, not as a second copy of an adequate compact read.

## Ownership and Save Points

| Role | Supplies to the utility | Save point |
|---|---|---|
| Helper | Incoming sources, actual-reply recording, interpretation, corrections, partial answers and selected work | Retain incoming source before prior-reply reconciliation; `reply_interpreted` before dependent work; direct Lead-only interpretation may be bundled with closeout |
| Specialist | Performed work, findings, conditions and limits from the bounded handoff | Run lifecycle immediately; review returned to its named commit owner |
| Lead | Reconciled understanding, retained knowledge/work, questions/options and response | `exchange_prepared`, normally including the returned review once, or citing its prior receipt |
| Memory utility | Validates submitted records against current journal | Appends journal, independently refreshes projection/brief and prepared-response export |

Only the utility manages plans, snapshots, manifests and retained exchanges/captures.
Specialists may write permitted code/outputs in active runs; originals and finalized
artifacts remain unchanged. Roles do not edit installed instructions. A named owner
may save `review_completed` before closeout for a durable handoff or a protected
offer's committed basis under [scope save order](authorizations.md#present-a-concrete-scope);
Lead then reuses its receipt. No-output reviews need no placeholder run.

When actual outgoing text becomes available, usually at Helper resume, use
[delivery](delivery.md) to record its observation. That is not a new user intake.

## Record Contract

Request fields: `event_id`, `expected_project_id`, `expected_last_event_id`,
`type`, `payload`. IDs match `[a-z][a-z0-9_-]{0,79}`. Use a new event ID for a new
submission and the exact same request on uncertain retry. Paths, URLs and chat
locators are sources, not record IDs; references name existing or same-event records.

| Type | Payload |
|---|---|
| `checkpoint` | `checkpoint`, optional `changes` |
| `memory_updated` | `changes` |
| `review_completed` | `review`, optional `checkpoint`, `changes` |
| `correction` | `corrects_refs` (committed IDs), `reason`, `changes` |
| `reply_interpreted` | `protocol`, `interpretation`; optional `changes`, `checkpoint`, prior `delivery` |
| `exchange_prepared` | `protocol`, `exchange`; optional `changes`, `checkpoint`, `review`, Lead-only `interpretation`, prior `delivery` |
| `exchange_delivery` | `protocol`, `delivery` |
| `consultation_policy_activated` | `policy: "consultation-loop-v1"`, `reconciliation` |

For the three exchange types, `protocol` is exactly `durable-exchanges-v1`.
Use [Helper's interpretation contract](helper.md#interpretation-submission) and
[Lead's exchange contract](team_lead.md#exchange-submission). Combine related
changes; do not add an event solely for a role transition.

Collections upsert by ID. New writes retain omitted evidence excerpts/limitations;
question, assumption, decision and user-context basis links; question resolutions;
unchanged user-source locators/hashes; and route optional fields. Changed sources
cannot inherit old quotations/hashes. Replacing retained attribution needs a
sourced `correction` naming the record and reason; route explicit fields replace
deliberately. Other same-ID fields replace: preserve needed optional values.
Omitted records stay unchanged; empty collection arrays delete none. Understanding
merges partial fields; brief selections have separate list-replacement rules.
Historical replay retains original semantics. See [source treatment](memory-records.md#incoming-user-sources)
and Helper's [correction save order](helper.md#save-and-hand-off).

Prefer [narrow patches](memory-records.md#narrow-patches) for committed question
disposition/resolution and evidence summary/limitations. Use saved scopes by
reference in [offers](authorizations.md#present-a-concrete-scope) and protected
[run starts](runs.md#start-before-target-computation); select fresh-scope
`basis_refs` instead of scripting version closure. The utility expands these
inputs inside the transaction and journals the existing full canonical records.
Keep the original request for exact retry. A fresh success can include advisory
`writing_warnings`; follow their [contract](memory-records.md#prose-budgets-and-purpose)
without a corrective write or retry loop. Do not shorten old bound prose in place.
V9 receipts can also include `response_diagnostics` for complete rendered items:
over 50 visible words or authored extra list structure. These are advisory and
separate from internal record budgets. Check whether a longer answer was explicitly
requested; otherwise revise an unemitted exchange through ordinary closeout.

## Record Lookup

Read applicable sections before first use or when missing from current context,
not automatically on every write. A question or correction can affect routing,
so consult its contract before selecting work, not only at submission time.

| Need | Shared reference |
|---|---|
| Field types, evidence, assumptions, routes, user context | [Conventions](memory-records.md#record-field-conventions) and [study/user records](memory-records.md#study-and-user-records) |
| Concise new prose or changes to existing records | [Budgets](memory-records.md#prose-budgets-and-purpose) and [patches](memory-records.md#narrow-patches) |
| Capture or correct user text | [Incoming user sources](memory-records.md#incoming-user-sources) |
| Add, answer, defer or retire a question | [Questions](memory-records.md#questions) |
| Change objective, target or claim boundary | [Target updates](memory-records.md#target-and-boundary-updates) |
| Supply or rely on a consequential finding | [Result conditions](memory-records.md#result-conditions) |
| Curate retained knowledge or work | [Brief selection](memory-records.md#case-brief-selection) |
| Select or prepare a specialist handoff | [Checkpoints and reviews](memory-records.md#checkpoints-and-reviews) |
| Encounter historical/unstructured records; need an authoring example | [Compatibility](memory-records.md#compatibility); [example](memory-records.md#lead-only-first-round-example) |
| Assemble a protected offer, later acceptance or findings closeout | [Complete record path](record-examples.md) |

## Recovery

Commit before calling work saved. Distinguish performed work from committed work
and unfinished communication. On `STALE_WRITE`, refresh/reconcile rather than
blindly replacing the predecessor. On `PROJECT_LOCKED`, retry; never delete locks.
`recover-lock --token` requires a verifiably dead same-host owner; report unverifiable
recovery needs.

A committed journal event survives export failure. Receipts independently report
`projection_written`, `brief_written`/`brief_path`, and when applicable
`response_file_written`; `projection_error`/`brief_error` explain failures.
Read the committed view. `recover` refreshes projection/brief without another
semantic event; prepared text uses its existing export/retry mechanism.
`recover --repair-tail` preserves then removes uncommitted trailing bytes only.
Never repeat specialist work to recreate a derived file.

Process new user direction first. A finalized run lacking a review resumes its
original bounded specialist handoff from saved outputs under its original
interpretation, without recomputation or a new assignment. Saving established
findings is reconciliation; a missing substantive review uses this response's
one specialist. If different work is selected, keep that review pending instead
of doing both. Lead saves the review once or cites its receipt; newer closeout
can use `reconciles` for the original interpretation and `completed_work_refs`
for its run/review. Do not invent findings from files. Additional evidence or
different work becomes an explicit gap/question/option. A saved review goes to Lead.

Prepared replies retain uncertain delivery until actual evidence resolves it.
Before calling an uncertain save failed, inspect its event or retry the exact
request. Old-event replay returns the original receipt/response while refreshing
derived memory from latest state, without another event/intake. Its `last_event_id`
names the original commit; use `current_last_event_id` for subsequent writes only
after reconciling that newer state. Necessary failure or cancellation replies
must not be blocked by an incomplete closeout.
