# Memory: reading, saving and ownership

These instructions apply to `consultation-journal-v8`. An existing v7 case uses
[v7/memory.md](v7/memory.md) and its linked contracts. Do not convert the case or
mix write formats. New cases use `scripts/project.cjs init --project-root <case>`.

## What each file is for

| File | Contents | Physical writer |
|---|---|---|
| `journal.jsonl` | Original sources, consequential meaning, changed knowledge, decisions and work history | Memory utility |
| `project.yaml` | Comprehensive current definitions, workflow state and historical-body references | Utility after each committed change |
| `case-brief.md` | Shared six-section continuation view, including older live obligations | Utility from that same committed state |
| `index.html` | Existing completed-report and artifact navigation | Utility |

The project and brief are generated views. Members contribute through the journal,
not by editing either export. Original files, captures, snapshots and outputs remain
evidence in their own right. A current export can contain an unreconciled scientific
assessment; successful recording does not certify its truth.

## Reading

Use one ordinary read, then expand what the next action needs:

```text
node <skill-root>/scripts/project.cjs context --project-root <case> --input request.json
```

| Need | Request or command |
|---|---|
| Resume | `{"mode":"brief"}` |
| Known current or exact record | `{"mode":"record","records":["q1","f2@e12","e19"]}` |
| Relevant records and their dependencies | `{"focus_refs":["q1","e19"]}` |
| Broad reassessment | `status --project-root <case>` |
| Unknown identity or original history | `history --project-root <case> --query <literal-text>`; then exact lookup |

The brief has Purpose, User context, Current understanding, Open questions,
Analytic choices, and Work and continuation. User context has domain expertise,
statistical expertise and communication preferences. The compact response and
Markdown export use the same selection. Normally read one, not both.

No fixed transcript window accompanies every new-format brief. Read the actual
previous reply when a user answer refers to it; use exact lookup for original
words, omitted scope terms or older details. Reuse sufficient sources already
available in context. A short brief reference does not authorize a consequential
claim or action whose necessary conditions have not been read.

IDs are local: `e12` is an immutable entry, `q1` a continuing question, and
`q1@e12` its definition at e12. A mention of q1 does not define that version.
Public Q1/N1 labels identify positions within one actual reply, never global
records. Exact lookup preserves the requested version rather than silently
returning today's replacement.

## Ownership and save points

| When | Role reads | Role submits |
|---|---|---|
| Incoming turn | Helper: brief, complete new message, relevant actual preceding reply | Original `user_message` first; then a sourced `knowledge`, `decision` or `interpretation` handling the whole message |
| Before selected work | Specialist: bounded assignment, source handling, necessary exact evidence and permission | Managed work start if producing artifacts; no empty run for a no-output review |
| Work progresses or ends | Executing specialist: frozen plan/inputs and current applicable direction | Managed files and lifecycle; completed artifacts before finalization |
| Assessment returns | Named review commit owner, normally Lead: specialist's actual return | One `review`; proposed changes are adopted explicitly, not assumed true |
| Closeout | Lead: handling, returned work and affected canonical records | Adopted updates, useful selection/direction changes and `reply_prepared` |
| Next appropriate resume | Helper: previous actual assistant reply | `reply_recorded` before interpreting a choice that depends on it; optional capture only when available |
| Every successful commit | Utility: journal state | Current project, brief and index; deterministic references and statuses |

A direct answer bypasses specialist work. A simple decision or sourced knowledge
update can finish handling without a separate interpretation narrative. Preserve
mixed intentions, answer timing and ambiguity where they change the next action.
Helper's justified incoming changes do not wait for another approval by Lead.

Only changed entities need submission. `updates` replaces each supplied small
entity definition; omitted entities stay unchanged. Identical resaves preserve
versions. Brief selection changes visibility, not facts, question status or
permission. Live obligations remain visible independently of optional selection.

## Record contract

Use [authoring.md](authoring.md) for content-oriented `submit` requests and
[memory-records.md](memory-records.md) for the relevant record fields. The utility
assigns IDs, binds exact versions and supplies mechanical metadata. Do not author
hashes or another saved project summary to satisfy the interface.

A request uses the latest `state_token` as `at`. Save the exact request for an
uncertain retry. Related adopted knowledge changes can accompany one primary
entry atomically. The journal assigns one eN identity to that primary record;
multiple immutable scopes or replies use separate entries. No extra turn ID is
needed to record the same message/handling relationship.

## Recovery

On an uncertain result, inspect the receipt/history or retry the exact original
request. A committed retry returns its original identity even after later saves.
Its `entry_ref` identifies the original save; its token identifies the current
head. Read current context before new semantic work.
Changing `at` makes a new request, not an exact retry.

On `STALE_WRITE`, read current context, reconsider affected meaning and submit
new content only when justified. A no-op receipt means no entry was committed;
if the head later changes, refresh before submitting again.

A successful journal commit remains valid if a project, brief, index or response
export fails. `recover --project-root <case>` rebuilds generated files. It does
not repeat intake, acceptance or computation. `recover --repair-tail` preserves
uncommitted trailing bytes before rebuilding the committed journal boundary.
A missing artifact or actual message remains a specific gap, not invented data.

Keep request files under the case's `scratch/` when files are convenient. No
per-turn archive, parallel summary, profile reassessment or extra approval cycle
is required. Use existing record identities and focused retrieval.
