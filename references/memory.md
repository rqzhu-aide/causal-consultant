# Project Memory

Use this shared operating guide with [Helper](helper.md) for incoming work and
[Lead](team_lead.md) for closeout. Reuse intact guidance and handoffs; load the
relevant [record section](#record-lookup) before a decision or write needs it.

## Authority and Entry

`journal.jsonl` is authoritative. `project.yaml` is its rebuildable JSON-form
YAML projection; `case-brief.md` is a generated reading view. The memory utility
alone writes them. Never hand-edit them or maintain an independent case summary.
Follow [SKILL.md](../SKILL.md) for the project folder. A missing brief does not
justify creating another project; legacy `project_state.yaml` is not converted.

```text
node <skill-root>/scripts/project.cjs <command> --project-root <folder>
```

Check `capabilities` once for a loaded utility; it needs no project root. Require
`durable-exchanges-v1`, `user-question-routing-v1`, `consultation-loop-v1`,
`reply-reconciliation-v1` and `case-brief-v1` before writing their records.
Utility support differs from this project's activation: inspect brief context's
`consultation_policy` (`policy`, `event_ref`, or `null` when inactive). Use
[authorizations](authorizations.md#activate-the-current-policy) for activation
and protected work. Never fabricate past exchanges or approval to update history.

Commands are `init`, `status`, `context`, `history`, `record` and recovery below.
`record` requires `--input <json-file|->`; `context` accepts it. Init preserves an
existing supported project and refuses legacy project folders. Reads never mutate.

## Reading

Normally request `context --input <json-file|->` with `{"mode":"brief"}`;
optionally supply `expected_last_event_id`. Do not mix it with focused selectors.
Use returned `project_id`, `last_event_id` and sequence; reuse current receipts.

The `brief` envelope contains:

- `markdown`: selected qualified knowledge/work and live controls, generated
  from journal records. It is navigation, not proof of scientific completeness
  or permission. Expand governing sources/conditions before relying on claims.
- `recent_intakes`: five saved intakes and their response evidence. The current
  unsaved host message is separate; saving it occupies one position. Extra
  interpretations, reply revisions and late observations create no new intake.
- `unfinished`: pending work and communication, including older issues. Finalized
  execution, reviewed findings, prepared closeout and observed reply are distinct.
- `coverage.case`/`coverage.conversation`: uninitialized knowledge/work selections,
  capture/grouping gaps and expansion needs. For each uninitialized selection,
  use broad `status` and necessary history, then curate actual records. Intentionally
  empty differs from uninitialized; never invent old captures or missing answers.
- `file_current`: whether the export matches this current rendering. Missing,
  edited or stale files still return current in-memory content; reads do not repair.

Recent reads verify available actual-capture bytes. The Markdown describes
journal observations only; verify relevant older captures before binding a reply.
Preparation is not delivery, and preserved assumptions are not established facts.
Older open questions and result conditions do not expire with the recent window.

For exact older wording, use `history --query` or a known `--record-id`/`--event-id`
first. Expand missing dependencies with focused `context`; use `status` when broad
reassessment is needed. Do not retrieve the same neighborhood merely to locate
an option. Complete reviews are in history, not just projection indexes. See
[Reading Details](memory-records.md#reading-details) for selectors, pagination and
view paths. On `STALE_CONTEXT`, refresh and reassess. Missing links or exhausted
pages do not establish scientific sufficiency.

## Ownership and Save Points

| Role | Supplies to the utility | Save point |
|---|---|---|
| Helper | Incoming sources, interpretation, corrections, partial answers and selected work | `reply_interpreted` before dependent work; direct Lead-only interpretation may be bundled with closeout |
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
and unchanged user-statement source locators/hashes. A changed source cannot
inherit the old quotation/hash. Explicit removal or replacement of retained
attribution needs a sourced `correction` naming the record and reason. Other
same-ID fields replace completely: preserve needed optional fields. Omission
leaves other records unchanged; empty collection arrays do not delete records.
Understanding merges partial fields. Historical events replay their original
replacement semantics. Brief selections have their own list-replacement rules.

## Record Lookup

Read applicable sections before first use or when missing from current context,
not automatically on every write. A question or correction can affect routing,
so consult its contract before selecting work, not only at submission time.

| Need | Shared reference |
|---|---|
| Field types, evidence, assumptions, routes, user context | [Conventions](memory-records.md#record-field-conventions) and [study/user records](memory-records.md#study-and-user-records) |
| Capture or correct user text | [Incoming user sources](memory-records.md#incoming-user-sources) |
| Add, answer, defer or retire a question | [Questions](memory-records.md#questions) |
| Change objective, target or claim boundary | [Target updates](memory-records.md#target-and-boundary-updates) |
| Supply or rely on a consequential finding | [Result conditions](memory-records.md#result-conditions) |
| Curate retained knowledge or work | [Brief selection](memory-records.md#case-brief-selection) |
| Select or prepare a specialist handoff | [Checkpoints and reviews](memory-records.md#checkpoints-and-reviews) |
| Encounter historical/unstructured records; need an authoring example | [Compatibility](memory-records.md#compatibility); [example](memory-records.md#lead-only-first-round-example) |

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
