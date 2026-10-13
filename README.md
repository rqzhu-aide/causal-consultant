# Causal Consultant

Local source version **8.0.7** clarifies actual-response delivery, current-record
qualifications, user-context attribution and selective continuation. Scientific
guidance aligns estimates and uncertainty with their target and qualifies
spillover-policy interpretations. Canonical records, save points, permissions,
response shape and budgets are unchanged. Live conversational reliability remains
a separate empirical check.

Start with [SKILL.md](SKILL.md). The consultation follows
**User -> Helper -> selected work or direct answer -> Lead -> User**.
These are responsibilities, not mandatory separate agents. The user can change
focus, request explanation, defer, close or return. Reports are optional artifacts.

## Memory and responsibilities

| Record | Purpose | Writer |
|---|---|---|
| journal.jsonl | Original messages, adopted knowledge, decisions and work history | Utility, from attributed submissions |
| project.yaml | Comprehensive current state and exact history references | Utility after commits |
| case-brief.md | Selected six-section continuation view | Utility using the same selection as compact context |
| index.html | Completed-report navigation | Utility using retained manifests |

Helper retains the original incoming message before saving its consequential
meaning. Simple knowledge or decision saves can handle that message without a
separate interpretation narrative. Mixed messages retain their conditions,
questions and answer timing.

A specialist reads a bounded assignment and necessary sources, then returns one
assessment to the named commit owner. Lead adopts justified changes, retains live
questions and alternatives, and prepares the reply. The actual previous reply
is recorded at the next appropriate resume; native capture remains optional.
Members never edit generated memory by hand.

Mutable facts have short stable identities, with exact versions such as q1@e12.
Scopes, user decisions, reviews and run starts use their entry IDs. Identical
canonical resaves preserve versions. Overview fields bind to source records
instead of repeating authored facts.

The brief contains Purpose, User context, Current understanding, Open questions,
Analytic choices, and Work and continuation. User context has domain expertise,
statistical expertise and communication preferences. Update these only when
clear new information warrants it. Ordinary resume no longer automatically
loads five prior intakes or a second copy of the Markdown brief. Exact and focused
reads retrieve necessary detail. Older live obligations remain visible.

## Consultation behavior

Scientific discovery, attainable questions, defensible alternative routes,
source qualifications and the original causal target remain central.
An execution status or valid record does not certify scientific validity.
No fixed method sequence or mandatory report closes every consultation.

Public responses retain four available sections: To answer your question,
What has been done, Questions for you, and Next steps. The summary is optional,
unnumbered and about only the previous turn. Other sections use flat A/Q/N labels.
Every next-step option contains at most 50 words, including inserted scope terms.
Other whole items normally stay within 50 words; explicitly requested answers may
use 200. Empty sections are omitted.

Target analysis and durable reporting use concrete presented scopes and later
user decisions. Current direction remains separate from acceptance. Frozen
plans, inputs and manifested outputs retain work provenance; optional numerical
presentation checks support source-to-display consistency.

## Use and compatibility

Node.js 18.18+ is required. The memory utility has no runtime package dependencies.
Use a machine-wide or user-wide runtime, not a project-local environment.

```text
node scripts/project.cjs init --project-root <new-case>
node scripts/project.cjs context --project-root <case> --input <case>/scratch/read.json
node scripts/project.cjs submit --project-root <case> --input <case>/scratch/request.json
```

A normal read request is `{"mode":"brief"}`. See
[memory](references/memory.md), [authoring](references/authoring.md),
[record fields](references/memory-records.md) and [examples](references/record-examples.md).
Load [authorizations](references/authorizations.md), [delivery](references/delivery.md)
and [runs](references/runs.md) for the affected operation.

New cases use consultation-journal-v8. The CLI dispatches existing v7 journals
to their retained codec and [v7 contracts](references/v7/memory.md).
No case is silently converted. A v6 project_state.yaml folder is not reused.
v8 output uses compact-v2; v7 retains legacy and compact-v1. Exact retry identifies
the committed entry separately from the current state token.

The deployment boundary remains package.json plus its listed SKILL.md, README.md,
LICENSE, agents/, references/ and scripts/. Architecture, saved evaluations,
tests and development artifacts remain outside the installed skill.
The package remains explicit-use through agents/openai.yaml.

## Verification boundary

Package validation and focused v8 mechanical checks have passed. This patch
adds instruction clarifications; source review and mechanical validity do not
establish scientific accuracy or live conversational reliability. Full
consultation testing remains pending.

The utility provides a local append-only journal, state checks and contained
artifacts, not an operating-system sandbox. Hashes establish byte integrity;
the assistant owns source attribution and scientific interpretation.
