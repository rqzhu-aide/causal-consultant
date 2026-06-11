# Council Chamber Contract

Use this shared contract whenever a routed subskill reports back to main.
Subskill-specific files should not restate this schema.

## Purpose

`council_chamber` is the live recommendation layer. It tells main what the
subskill thinks main should consider now. It is not the full evidence store:
durable details belong in the subskill's owner/result section.

## Entry Shape

Every routed subskill must create or update exactly one current council entry
for the routed action:

```yaml
- id: <agent_called>.<action_id>
  agent: <agent_called>
  action_id: <action_id>
  finding: null
  recommendation: null
  options: []
  blockers: []
  status: current
```

Use `id` as the stable key. If an entry with the same `id` exists, update it. If
no matching entry exists, create it. Do not create duplicate current entries for
the same routed action.

For numbered method/task specialists, `agent` is the numbered specialist id, not
`method_task`. Example:

```yaml
id: 00-randomized-trials-and-ab-tests.rct_fit_feedback
agent: 00-randomized-trials-and-ab-tests
action_id: rct_fit_feedback
```

## Option Shape

Council options use the lean action shape:

```yaml
- id: null
  agent_called: null
  mode: feedback_only
  action_goal: null
  refs: []
```

Use `agent_called` to name the routed reviewer, sidecar, report writer, or
numbered specialist when the option requires routed work. Use `action_goal` to
state what that next move would clarify, unlock, repair, produce, or rule out.
Use `refs` for owner-section pointers, artifact ids, file paths, or result
references. If an option is only a user-facing lead choice, main keeps it as a
pending/menu action until it selects a concrete routed or execution step.

## Option Policy

Use three or four bounded options when multiple responsible next moves exist. Use
one option only for a hard blocker, a clean closeout, or one clearly defensible
path. Keep `options` empty only for no-action findings, pure blockers, or
resolved closeout.

Options are recommendations for main. A subskill must not execute an option,
call another subskill, write `pending_actions`, or speak to the user.

## Boundary

The chamber may summarize durable evidence, but should not duplicate every
detail. Put reusable evidence, diagnostics, artifacts, report assets, and
technical summaries in the owner/result section; put the live recommendation in
`council_chamber`.
