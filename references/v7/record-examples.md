# A complete protected record path

For common writes, use [assisted authoring](authoring.md). The full envelopes
below remain a connected reference for unusual field questions and older tools.
To submit any example through the new interface, replace the three envelope
identities with the actual `at` token, set `op` to `type`, and lift `payload`
fields to the top level. Omit generated IDs for new records, using local aliases
where needed; retain the chosen sources and scientific scope terms.

Use this example when assembling an incoming interpretation, an exact scope offer,
or a findings closeout. It supplements the field contracts in [Helper](helper.md#interpretation-submission),
[Lead](team_lead.md#exchange-submission), and [authorizations](authorizations.md).
For an ordinary first explanation, use the shorter [Lead-only example](memory-records.md#lead-only-first-round-example).

This is synthetic: a user supplies three values and asks for their sample mean.
The calculation is protected descriptive analysis. It establishes no causal
effect. Substitute the actual facts, source hashes, IDs and receipt predecessor
for a real case. Do not fabricate the later acceptance, host observation, or work.

Initialize a fresh example project with `init --project-root <folder> --input init.json`,
where `init.json` is `{"project_id":"project-example","event_id":"event-init"}`.
Its `values.json` file contains exactly `[1,3,5]` followed by one LF newline; the
scope below hashes those bytes. The complete requests below use:

```text
node <skill-root>/scripts/project.cjs record --project-root <folder> --input <request.json>
```

`--input -` reads JSON from standard input. A JSON filename is not a positional
argument; `--file`, `--event`, and `record-event` are not commands or options.
Retain the original request for an uncertain retry. After a fresh success, use
its `last_event_id` for the next write; after replay use `current_last_event_id`
only after reconciling newer state. Do not fix stale-scope errors by substituting
the current event ID or editing saved scope terms.

## Incoming interpretation and committed basis

The user says: "Please summarize the three values in values.json. They are all
observations from this small sample." Save that source, interpretation and target
before constructing the offer. The assignment is nested under `next_action`
only when its `kind` is `specialist`; this proposal turn is `lead_only`.

```json
{
  "event_id":"event-intake","expected_project_id":"project-example","expected_last_event_id":"event-init","type":"reply_interpreted",
  "payload":{
    "protocol":"durable-exchanges-v1",
    "changes":{
      "evidence":[
        {"evidence_id":"user-request","kind":"user_statement","source_ref":"chat:user-1","source_excerpt":"Please summarize the three values in values.json. They are all observations from this small sample.","complete_message":true,"summary":"The user requests a summary of three sample values."},
        {"evidence_id":"values","kind":"file","source_ref":"values.json","summary":"Three supplied numerical observations; no treatment assignment is recorded."}
      ],
      "decisions":[{"decision_id":"target-mean","kind":"target","status":"current","statement":"Summarize the mean of the three supplied values, with no causal conclusion.","basis_refs":["user-request","values"]}]
    },
    "interpretation":{
      "interpretation_id":"interpretation-proposal","turn_id":"turn-proposal","incoming_refs":["user-request"],
      "components":[{"kind":"instruction","meaning":"Summarize the supplied sample.","established":["All three observations belong to the requested sample."],"unresolved":[]}],
      "basis_refs":["user-request","values"],
      "next_action":{"kind":"lead_only","scope":"Offer a sample mean calculation.","reason":"Present concrete terms before computing the requested summary."}
    }
  }
}
```

When an incoming answer also closes a consultant question, use its existing
question ID and retain its basis. A narrow patch needs `status`, the sourced
`reason`, and `resolution: {"answer_refs":["user-answer"],"remaining":[]}` for a
complete answer. Keep `status: "open"` and name remaining uncertainty for a partial
answer. A component answering a displayed question also binds its actual
`exchange_ref`, `question_ref`, and `delivery_ref`. See [question fields](memory-records.md#questions).

## Scope and public offer

Using the intake receipt, save the scope and offer together. `findings_refs` is
required even when it is empty for analysis. The execution plan's target,
population, diagnostics and claim boundary exactly match their public fields.
The option copies its terms from `scope_ref`, avoiding a second authored plan.

```json
{
  "event_id":"event-offer","expected_project_id":"project-example","expected_last_event_id":"event-intake","type":"exchange_prepared",
  "payload":{
    "protocol":"durable-exchanges-v1",
    "changes":{"action_scopes":[{
      "scope_id":"scope-mean","action":"analysis","assignment":{"specialist_id":"design_worker","operation":"execution","design_id":"descriptive_association"},
      "basis_refs":["target-mean","values"],"findings_refs":[],
      "public_scope":{"target":"The observed sample mean.","population":"The three supplied observations.","evidence":"Use values.json.","approach":"Calculate the arithmetic mean without exclusions.","checks":["Check row count and missing values."],"outputs":"Return the mean and data checks.","claim_boundary":"Sample description only; no causal conclusion."},
      "execution_plan":{
        "kind":"analysis","objective":"Summarize the supplied sample.","claim_boundary":"Sample description only; no causal conclusion.",
        "inputs":[{"source_ref":"values.json","path":"values.json","sha256":"ecbb6e77fac90c86db8a9d4adacf2c57d56021fddf9301bfffc3c99f088918cd"}],
        "target":"The observed sample mean.","population":"The three supplied observations.","treatment":"None","comparator":"None","outcome":"Recorded value","timing":"One collection","estimand":"Sample arithmetic mean","design_id":"descriptive_association","estimator":"Arithmetic mean","exclusions":[],"diagnostics":["Check row count and missing values."]
      }
    }]},
    "exchange":{
      "exchange_id":"exchange-proposal","turn_id":"turn-proposal","interpretation_ref":"interpretation-proposal","basis_refs":["target-mean","values"],"completed_work_refs":[],"renderer":"lead-markdown-v11",
      "reconciliation":{"changes":["Established the descriptive target."],"limitations":["No causal comparison is available."],"unresolved":[],"next_direction":"The user chooses whether to calculate this summary."},
      "response":{"questions":[],"next_steps":[{"option_id":"calculate","kind":"action","label":"Calculate the sample mean","actor":"consultant","scope":"Use the terms below.","basis_refs":["target-mean","values"],"scope_ref":"scope-mean"}]}
    }
  }
}
```

Use the rendered draft to present the proposal, preserving its terms. At the
next turn, first save the user's actual acceptance as a source:

```json
{"event_id":"event-accept-source","expected_project_id":"project-example","expected_last_event_id":"event-offer","type":"memory_updated",
 "payload":{"changes":{"evidence":[{"evidence_id":"user-accept","kind":"user_statement","source_ref":"chat:user-2","source_excerpt":"Yes, calculate that sample mean.","complete_message":true,"summary":"The user selects the presented sample calculation."}]}}}
```

Read the previous assistant reply from the conversation and record its actual
items. The following illustrative recording applies only if this is what that
reply conveyed. Use `observe-exchange`, not the low-level `record` command:

```json
{"event_id":"event-delivery","expected_project_id":"project-example","expected_last_event_id":"event-accept-source",
 "delivery_id":"delivery-proposal","exchange_ref":"exchange-proposal","observation":"agent_recorded",
 "source_ref":"chat:assistant-proposal-before-user-2",
 "agent_recording":{"before_incoming_ref":"user-accept","items":[
   {"kind":"option","display_label":"N1","option_id":"calculate","scope_ref":"scope-mean",
    "text":"Calculate the arithmetic mean of all three values in values.json, without exclusions. Check the row count and missing values, then return the mean and checks. This describes the supplied sample only and establishes no causal effect."},
   {"kind":"option","display_label":"N2","text":"Discuss the sample and the intended use before calculating."}
 ]}}
```

Preparation alone does not supply this record. Preserve any other actual items
and qualifications, including differences from the illustrative wording. A host
transcript file is not required. The incoming source remains pending until the
interpretation below consumes it.

If a genuine capture of that same reply later becomes available, first retain it
through `observe-exchange`. With `actual-reply-reconciliation-v1`, a new
agent-recorded request can then add
`"capture_ref":"<committed-capture-id>"` and
`"supersedes_recording_ref":"delivery-proposal"` inside `agent_recording`,
keeping `before_incoming_ref: "user-accept"` and the original `source_ref`.
Read the complete capture and supply all actual items; do not copy these
illustrative scope mappings unless supported. Follow the
[two reconciliation examples](delivery.md#reconcile-records-of-the-same-reply).
Existing valid acceptance below keeps its original references. Repairing a
mistaken recording from conversation alone uses only `supersedes_recording_ref`.
This optional later branch is separate from the example sequence; use its fresh
receipt for subsequent submissions.

## Later acceptance and protected start

Only after the next user actually says "Yes, calculate that sample mean" does
this request apply. It preserves the offered assignment and binds the user's
choice to the observed reply and stable option ID.

```json
{
  "event_id":"event-accept","expected_project_id":"project-example","expected_last_event_id":"event-delivery","type":"reply_interpreted",
  "payload":{
    "protocol":"durable-exchanges-v1",
    "checkpoint":{"checkpoint_id":"checkpoint-mean","status":"ready_for_specialist","primary_uncertainty":"The observed sample mean.","why_it_matters":"The user wants a summary of these values."},
    "interpretation":{
      "interpretation_id":"interpretation-accept","turn_id":"turn-accept","incoming_refs":["user-accept"],"basis_refs":["scope-mean"],"focus_scope_ref":"scope-mean",
      "components":[{"kind":"selection","meaning":"Calculate the presented summary.","established":["The user accepts the displayed scope."],"unresolved":[],"exchange_ref":"exchange-proposal","option_id":"calculate","delivery_ref":"delivery-proposal"}],
      "action_decisions":[{"decision_id":"decision-accept","scope_ref":"scope-mean","disposition":"accept","exchange_ref":"exchange-proposal","option_id":"calculate","delivery_ref":"delivery-proposal","user_refs":["user-accept"]}],
      "next_action":{"kind":"specialist","scope":"Compute the accepted sample mean.","reason":"The user selected the presented scope.","assignment":{"specialist_id":"design_worker","operation":"execution","design_id":"descriptive_association"},"scope_ref":"scope-mean","authorization_ref":"decision-accept"}
    }
  }
}
```

Submit this next body with **`start-run`**, not `record`. It copies the accepted
plan without overrides. Compute from the returned snapshots, then retain the
code, results and checks and finalize using [runs.md](runs.md).

```json
{"event_id":"event-start","expected_project_id":"project-example","expected_last_event_id":"event-accept","run_id":"run-mean","scope_ref":"scope-mean","interpretation_ref":"interpretation-accept","authorization_ref":"decision-accept"}
```

## Findings closeout

This final request assumes the actual saved computation returned mean 3, row
count 3 and no missing values; finalization returned `event-finalize` and its
output is `runs/run-mean/result.json`. Save the worker's review once in this
closeout. Include both the completed run and review in `completed_work_refs`.
`response.findings` carries the result, checks and limitations to the user.
If a review was already committed, cite its receipt instead of resubmitting it.

```json
{
  "event_id":"event-closeout","expected_project_id":"project-example","expected_last_event_id":"event-finalize","type":"exchange_prepared",
  "payload":{
    "protocol":"durable-exchanges-v1",
    "changes":{"evidence":[{"evidence_id":"result-mean","kind":"computed","run_id":"run-mean","source_ref":"runs/run-mean/result.json","summary":"The sample mean is 3 over three observed values.","limitations":["Sample description only; no causal conclusion."]}]},
    "review":{
      "review_id":"review-mean","summary":"The sample mean is 3; this is a descriptive summary.","assignment":{"specialist_id":"design_worker","operation":"execution","design_id":"descriptive_association"},
      "interpretation_ref":"interpretation-accept","question_addressed":"What is the mean of the three supplied values?","selection_basis":{"checkpoint_id":"checkpoint-mean","user_contribution_refs":["user-accept"]},
      "work_performed":["Computed the arithmetic mean from the frozen input and checked row count and missingness."],"findings":["The sample mean is 3; all three values are observed."],"limitations":["No causal effect is identified."],"evidence_refs":["values","result-mean"]
    },
    "exchange":{
      "exchange_id":"exchange-results","turn_id":"turn-accept","interpretation_ref":"interpretation-accept","basis_refs":["result-mean"],"completed_work_refs":["run-mean","review-mean"],"renderer":"lead-markdown-v11",
      "reconciliation":{"changes":["The accepted summary is complete."],"limitations":["The result describes this sample only."],"unresolved":[],"next_direction":"Discuss the result or pause."},
      "response":{"findings":{"work_refs":["run-mean","review-mean"],"summary":"The sample mean is 3.","diagnostics":["All three values are observed."],"limitations":["This summary does not identify a causal effect."]},"questions":[],"next_steps":[]}
    }
  }
}
```

Here `protocol` belongs to the `exchange_prepared` payload. A separately saved
`review_completed` payload has `review` and optional `checkpoint`/`changes`, with
no `protocol`. Its record contract differs from the three exchange event types.
