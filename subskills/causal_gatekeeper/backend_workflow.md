# Causal Gatekeeper Backend Workflow

This file governs a routed `causal_gatekeeper` call. Use `SKILL.md` for validity
reasoning and this file for the live-state write contract.

## Loading Order

On invocation, use local `SKILL.md`, this backend file,
`../../references/council_chamber_contract.md`, the compact routed payload,
`state_file_path`, and `refs`. Do not load main's full backend, the full
conversation, unrelated subskills, unrelated artifacts, or hidden lead reasoning.

## Routed Payload

```yaml
action_id: null
agent_called: causal_gatekeeper
mode: feedback_only
action_goal: null
state_file_path: outputs/project_state.yaml
refs: []
```

`action_goal` carries the task intent. Internal reasoning lanes below are
guidance only; they are not payload fields or live YAML fields.

## Mode Contract

- `feedback_only`: reason from live YAML and routed summaries.
- `bounded_inspection`: inspect only named claims, DAG sketches, notes,
  artifacts, diagnostics, figures, tables, reports, or method-task results in
  `refs`.

`causal_gatekeeper` does not use `execution_authorized`.

## Read Contract

Read `state_file_path`. Shallow-read the full durable state. Deep-read only
validity-relevant material when it affects claim support, time order, causal
roles, adjustment, selection/censoring, interference, data support, statistical
claim strength, supported alternatives, claim-strengthening ideas, or report
wording.

## Write Contract

Write only:

- `causal_gatekeeper.status`
- `causal_gatekeeper.items`
- `causal_gatekeeper.blockers`
- `causal_gatekeeper.supported_alternatives`
- `causal_gatekeeper.claim_strengthening_ideas`
- one current `council_chamber` entry

Use `causal_gatekeeper.items` for reusable validity evidence. Each item should
include a compact `kind`, such as `claim_boundary`, `causal_structure`,
`timing_role_constraint`, `adjustment_processing_risk`, `statistical_claim`,
`report_relevance`, or `validity_question`. Add optional `severity`,
`source_status`, `core_relevance`, and `refs` when useful.

Use `supported_alternatives` for claims or analysis framings current evidence
can support. Use `claim_strengthening_ideas` for broad but bounded data, design,
estimand, diagnostic, or domain-specific upgrades that might support a stronger
claim later.

After writing validity evidence, follow
`../../references/council_chamber_contract.md`: create or update one current
entry keyed by `id: causal_gatekeeper.<action_id>`, then stop.

## Reasoning Lanes

| Lane | Question Answered | Required Output Emphasis | Forbidden Drift | Stop Condition |
| --- | --- | --- | --- | --- |
| claim feasibility screen | Can the intended causal sentence be supported, weakened, repaired, or blocked? | Claim boundary, blockers, supported alternatives, required next checks, and report wording limits. | Do not infer validity from statistical significance or upgrade claims. | Stop after validity evidence and options for repair, review, planning, or stop. |
| DAG/timing/role review | Are time order, causal roles, DAG logic, adjustment, mediators, colliders, selection, censoring, and interference coherent? | Structure and timing-role items, adjustment risks, blockers, and core relevance for data/method/report. | Do not default to "control for more variables" as a fix. | Stop after coherent boundary, repair idea, or blocker. |
| statistical claim review | Does the planned or finished statistical evidence support the claimed conclusion? | Statistical-claim items, limitations, artifact refs, report wording cautions, and owner-review options. | Do not edit reports or rerun analysis. | Stop after support, qualification, repair, or refusal recommendation. |
| alternative claims review | What causal, qualified-causal, descriptive, diagnostic, or planning claims are currently supportable? | `supported_alternatives` with wording boundary, evidence hooks, limits, and required next check. | Do not treat alternatives as approval for stronger claims. | Stop after alternatives and main-facing options. |
| claim-strengthening ideas | What broad twists could plausibly support a stronger causal conclusion later? | `claim_strengthening_ideas` with current support level, required evidence/check, risks, and likely reviewer. | Do not present future ideas as current validity approval. | Stop after ideas and bounded next-step options. |

## Boundaries

`causal_gatekeeper` does not choose final methods, run analysis, inspect beyond
routed scope, write reports, or activate other subskills. It owns claim validity
memory and live validity recommendations only.
