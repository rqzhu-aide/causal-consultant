# Causal Consultant

Start with [SKILL.md](SKILL.md) for invocation and release identity.
The consultation follows **User -> Helper -> selected work -> Lead -> User**.
Helper resumes the case and interprets the incoming message; Lead reconciles
findings, constructs useful questions/options and provides the sole user-facing
response. Explanation and clarification can go directly from Helper to Lead.
These are responsibilities of one assistant, not mandatory extra agents.

A generated case brief and five recent saved intakes provide ordinary memory
reads. Exact older questions, choices, sources and conditions remain retrievable;
live issues do not expire with the window. Source qualifications and partial
answers survive updates. The memory utility saves records and refreshes views;
it cannot certify interpretation or scientific validity.

Lead uses `[Your Questions]` when applicable, followed by `[Status]`,
`[I want to know]` and `[Decide Next Steps]`, saved and rendered from one
submission. Prepared replies remain distinct from observed actual messages.
See [delivery](references/delivery.md) and [presentation](references/presentation.md)
for the utilities and their verification limits.

## What Changes for the User

The lead helps identify the uncertainty that most affects a causal study and
explains how you can help resolve it. Your answer, choice, or instruction informs
one specialist review. The lead returns with findings and a useful next step.
Clear requests for investigation or explanation can proceed directly. Protected
analysis and report production use specific presented scopes and later user
decisions. Routine checks within accepted analysis need no further approval.
A settled finding does not automatically trigger another investigation or report.
You may change focus, defer, pause or end without a report, and reopen completed
work later. The report is a saved artifact, not a permanent end to consultation.

When your message combines questions and instructions, Helper checks which
answers are needed before work can begin; Lead supplies the response. It explains or asks for material
clarification first when needed. Questions that depend on an authorized analysis
are saved before work and answered at closeout, with any unresolved part kept
visible for a later turn. Message length or technical detail alone does not
require another clarification round.

All nine original design families and six scientific supports remain, with a
new custom-identification path. One design worker can combine relevant guides
for a single identifying argument. Requested data preparation belongs to the
data auditor and does not require choosing a causal design first.

Start with [SKILL.md](SKILL.md). The skill is explicit-use, not an implicit
replacement for ordinary statistical discussion. Its metadata retains
`allow_implicit_invocation: false`.

This revision requires an investigated basis before settling an underspecified
causal question. The lead chooses checks by what different answers could change,
including whether an accessible fact could reveal a stronger design. Descriptive
deliverables can be completed while the original causal question remains open;
explicit user narrowing remains supported. Ready-to-execute work proceeds after
acceptance of its concrete scope, without a redundant feasibility review.
Answers keep their qualifications and must inform advice. Each consequential
result can retain direct condition and assumption references; report sources
freeze those records and their versions. Run integrity and the one-specialist
limit remain. New conversation tests cover reply binding, recovery and continuity;
their existence alone is not evidence of a completed live comparison.

## Use the Skill

Use this repository root as the skill root. For a standalone distribution copy
`package.json` itself plus the runtime files it lists; exclude `architecture/`, tests and
Git/development metadata from the consultant's installed instruction package.
Invoke the skill explicitly and select a **new consultation folder**. Do
not install multiple copies under the same name without deliberately choosing
which one is active. No global setup, hooks, accounts, or package downloads are
required for the memory utility. Analysis dependencies depend on the actual
study and are selected separately.

Node.js 18.18 or newer is required. From this directory:

```text
node scripts/validate.cjs
npm test
node scripts/project.cjs help
node scripts/project.cjs capabilities
node scripts/project.cjs init --project-root <new-consultation-folder>
node scripts/project.cjs context --project-root <consultation-folder> --input brief-request.json
node scripts/project.cjs status --project-root <consultation-folder>
node scripts/project.cjs verify --project-root <consultation-folder>
```

Keep active test files directly in `tests/` as `*.test.cjs`; nested fixture and
historical copies are not discovered. Node test options are forwarded, for
example `npm test -- --test-name-pattern="version"`.

`brief-request.json` contains `{"mode":"brief"}`.
[Memory](references/memory.md) is the shared guide to reads, saves and recovery.
[Record details](references/memory-records.md) are consulted by section when needed;
Helper and Lead own their incoming and outgoing submission contracts.
[Action authorizations](references/authorizations.md) documents activation,
presented scopes, later decisions and resumption of protected work.
[Runs](references/runs.md) documents pre-result plans, saved artifacts, and
verification. These are conditional instructions, not a questionnaire for you.

## Auditability and Containment

Each consultation has one authoritative `journal.jsonl`, a rebuildable
`project.yaml` and generated `case-brief.md`. The journal and projection use
JSON serialization, a valid YAML subset. The utility alone writes these memory
files; Helper and Lead submit updates to their underlying records. A review is
saved once, including its full findings and limitations in the journal.

Helper saves consequential incoming interpretation before dependent work. Run
commits preserve execution progress. Lead saves its reconciled understanding and
outgoing response afterward. The utility refreshes the projection and brief from
each committed state, reporting independent export failures. An interrupted
handoff resumes from saved work instead of repeating successful computation.
Local session memory complements this durable record.

The brief preserves selected knowledge and findings plus live controls. Helper
maintains incoming knowledge selection; Lead reconciles it and retained work.
A section never initialized differs from an explicitly empty selection. Older
projects require broad reads and sourced curation of missing sections, without
rewriting historical messages. Focused context/history retrieves exact records;
complete status remains available for broad reassessment. The recent window is
five saved user intakes, not five tool calls or observations. The new unsaved
host message is supplied separately.

Same-ID updates preserve specified attribution and question resolutions;
other optional fields retain their documented replacement semantics. Follow
[memory](references/memory.md) for this contract and required capabilities,
including `case-brief-v1`. Earlier journals stay readable without fabricated
questions, delivery observations or result conditions; incompatible utilities
must not write extended records. New projects activate the action policy during
initialization; existing inactive projects need explicit activation after earlier
active runs are resolved with their original runtime. Permissions are not
retrospective. Historical renderer bytes and hashes remain unchanged.
A skill instruction cannot force every host to use the utility; this package
installs no completion hook and does not claim host-enforced delivery.

Saved outputs live in `runs/<run-id>/`. A run retains its frozen plan, file input
snapshots, code or configuration, outputs, and hashed manifest. A changed result
belongs in a new run. A small audit without saved outputs needs a review record,
not a run directory. Target estimation always needs a planned run.

Managed writes reject path escapes and linked destinations. Short writer locks,
stable event identities, and explicit recovery handle cooperating processes and
interrupted writes. `verify` reports changed files and unfinished work.
By default it also checks original source paths. An explicit read-only
`verify --source-check snapshots` checks a moved or offline archive's recorded
local contents without requiring those original paths. Its result labels the
limited source check; it does not weaken finalization or update old plans.

These guarantees do **not** sandbox arbitrary code or prove that saved code was
executed. Host tool permissions still govern execution. Retain the actual command
and execution evidence when computing results. Hashes detect changes relative to
the recorded history, not a malicious rewrite of that entire history. Local
durability is not an off-device backup. Very large file snapshots and histories
have not been performance-qualified.

If a process crashes while recovering a lock, its `.consultant-recovery.lock`
guard can remain. Automatic recovery intentionally refuses an unverifiable
guard. For offline operator recovery, first stop all memory-utility processes for that project;
check the exact guard is a regular file inside the resolved project folder,
its recorded host is this machine, and its recorded PID is definitely no longer
alive. Only then remove that exact guard, leaving the writer lock and project
history intact, and retry `recover-lock` for the original writer if needed.
If ownership or inactivity cannot be established, leave both locks in place.
This rare recovery path is manual, not an automatic resumption guarantee.

## Existing Legacy Projects

Continue projects using `project_state.yaml` with their original controller, or
start a new consultation folder and carry over explicitly reviewed
source summaries. The memory utility refuses a folder containing `project_state.yaml`.
No automatic conversion, deletion, or import of legacy claims as verified current
results occurs. Legacy evidence keeps its source version and verification label.
The preserved local legacy controller is in a sibling archive directory, not in
this repository. See [SKILL.md](SKILL.md) for legacy compatibility guidance.
Archives are filesystem snapshots; this
repository retains its Git history and remotes. They are not separate remote
backups, and their uncommitted edits are not included in a future commit here.

## Verification Status

This publication includes the skill runtime and deterministic engineering tests.
Developer design and historical smoke traces are retained separately in the
local development workspace and its evidence branch. Passing unit tests is not
evidence that every consulting trajectory or scientific method has been
model-evaluated.

Full behavioral qualification still requires fresh complete interaction and scientific
trajectory comparisons, including full objective-level resource accounting.
Earlier testing used a separate sequential capture protocol with the installed
Codex transport; targeted question-chain observations do not qualify the full
scientific suite. Independent numerical fixtures check reference algebra, not
the consultant's ability to reproduce it. The generic validator uses the existing
user-wide Python 3.14.7 and PyYAML 6.0.3; no installation was needed.
Use shared machine-wide or user-wide runtimes and packages; no project-local
environment is required. No installation or reconfiguration is part of this
revision.
Host hooks are optional future integration, not required runtime.
