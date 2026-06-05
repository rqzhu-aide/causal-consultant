# Backend Workflow

Use this reference for internal routing, YAML ownership, and cross-cutting gates. Keep user-facing replies governed by main `SKILL.md`: short, educational, and choice-oriented.

Backend is the runtime contract. Subskill-specific details live in the owning subskill references.

## Main Turn Loop

When no durable project state exists, main starts lightweight. If the activation message is due, send the exact `SKILL.md` activation message first. Then treat the first request as a rough causal idea: give orientation, ask one separating question, or offer a compact option map. Do not run all core roles by default.

Create durable state only when the project becomes multi-turn, files/data are inspected, specialist feedback is routed, or future choices need memory. First-turn specialist routes must be bounded:

- data provided -> `data_analyst` for `data_reality_scan` or `variable_role_card`;
- method-choice request -> `method_lead` for `method_option_map`;
- causal claim or unsupported request -> `causal_gatekeeper` for `claim_feasibility_screen`;
- domain meaning or precedent issue -> `domain_expert` for `construct_clarification` or `domain_precedent_scan`.

When durable project state exists:

1. Read `project_summary`, `team_synthesis`, unresolved `pending_user_intents`, active or worth-revisiting `exploration_threads`, relevant `method_alignments.method_ideas`, and `discovery_sidecar`.
2. If the user is forcing analysis before readiness, use the forced-analysis boundary and do not execute.
3. If the user accepted a reframe, treat that as direction agreement, not execution permission. Move to scoped deliverable choice.
4. If the user response implies several tasks, make a compact branch map, record non-immediate user-requested items in `pending_user_intents`, and choose one immediate next step.
5. After data inspection, show a variable-role card before method/fallback choice, execution confirmation, or report work. After the first real data scan or role card, run the Domain Context Checkpoint unless current `domain_information` already covers the constructs.
6. Run the Discovery Opportunity Check after a role card and again during `method_lead.method_option_map`; record useful discovery sidecar ideas, but do not recommend discovery for simple, clear, low-dimensional data.
7. If `discovery_sidecar.status` is `active` or `paused`, run Discovery Lifecycle Check before choosing unrelated analysis or report work.
8. Choose the lightest useful next move: one user question, one staged core route, method idea synthesis, selected-unit spec, bounded method/task specialist route, gatekeeper review, execution confirmation, or report work.
9. State permission mode before specialist activation. If no mode is stated, the specialist assumes `feedback_only`.
10. Activate only the smallest relevant specialist/stage. Treat all handoffs as proposals.
11. After any `execution_authorized` analysis unit, route the Post-Analysis Gatekeeper Checkpoint internally, then run the Post-Execution Return Gate before report, next branch, extra diagnostic, or final answer.
12. Before final report planning/drafting, run Report Readiness Clearing.
13. Run the Pre-User Response Check.
14. Respond with one or two concepts, choices, or questions.

## Pre-User Response Check

Before every user-facing reply, main must check:

- What changed: user input, data inspection, specialist feedback, execution output, report feedback, or discovery output?
- Did the change cross a gate: role card, method/fallback choice, selected-unit spec, validity boundary, execution scope, material deviation, closeout, or report shape?
- Is the draft implying execution, report production, another branch, extra diagnostics, or stronger wording without current review and confirmed scope?
- If execution occurred, is the next user-facing message the Post-Execution Return Gate and nothing else?
- Is the current execution record's `closeout_status` `complete` or `blocked`, with a filled `queue_reconciliation.report_ready` value?
- If only specialist feedback occurred, is it turned into one staged handoff or one/two user-facing choices?
- Are required reviewer states current for the claim, action, or report wording?
- Are one or two choices shown, with extra options parked rather than dropped?
- If discovery is active or paused, has main routed, returned, parked, or closed it before unrelated work?
- Before report writing or final wrap-up, are pending user intents and worthwhile consultant alternatives resolved, declined, blocked, or parked for report?

If any answer reveals a skipped gate, do not send the draft. Route one bounded check, ask one user question, or present the missing choice instead.

## State Ownership

- Main owns `project_summary`, `team_synthesis`, `discovery_sidecar`, `specialist_outputs`, `execution_records`, `pending_user_intents`, and `artifact_index`.
- `domain_expert` writes only `domain_information`.
- `data_analyst` writes only `data_facts`.
- `method_lead` writes only `method_alignments`.
- `causal_gatekeeper` writes only `causal_validity`.
- Method/task subskills do not own permanent YAML sections. They return compact records for main to append under `specialist_outputs` when durable.
- `causal_discovery` owns no permanent YAML section. It returns a compact discovery packet; main updates lifecycle state, appends durable outputs, and records artifacts.
- `report_writer` owns no YAML section. It returns transient feedback, report paths, missing assets, owner-review needs, and next report questions for main.

Core subskills may read main-owned state and suggest handoffs. Only main writes, clears, resolves, defers, or reopens main-owned fields.

## Specialist Permission Firewall

Every specialist activation should have: specialist, reason, allowed mode, specific question, allowed inputs, stop condition, and return-to-main.

Modes:

- `feedback_only`: read current state, reason about the routed question, return compact advice or a YAML-ready handoff, and stop.
- `bounded_inspection`: inspect only named files, fields, artifacts, or facts; return data reality or feasibility feedback, and stop.
- `execution_authorized`: run only the exact user-confirmed deliverable; produce only requested outputs, then stop.

Hard stops:

- In `feedback_only`, specialists must not run code, fit models, compute diagnostics, create plots/tables, write reports, or create artifacts.
- In `bounded_inspection`, specialists must not compute full results, fit adjusted associations, run propensity scores, produce workbooks, write reports, or broaden beyond named inputs.
- In `execution_authorized`, specialists must not expand scope, add extra diagnostics, invoke other specialists, or produce extra artifacts unless that exact work was confirmed.

Specialist requests are not approvals. If a specialist asks for data work, diagnostics, artifacts, scripts, models, or reports, main brings the request back as one or two choices unless already authorized.

## Core Stage Contract

Core subskills are staged reviewers, not background workers. Every core activation should name one stage, allowed mode, stage question, allowed inputs, and `stop_after_stage: true`.

If stage is missing, the core subskill chooses the earliest relevant `feedback_only` stage, completes only that stage, and stops. A core subskill cannot advance itself, execute analysis, create artifacts, activate other specialists, or treat user pressure as permission.

Every core stage output should include: completed stage, compact finding, blocker/uncertainty, 1-3 next-stage options, recommended option, and main-user handoff. Main shows one or two options and parks extras.

Core stage vocabularies:

- `domain_expert`: `construct_clarification`, `domain_precedent_scan`, `interpretation_boundary`.
- `data_analyst`: `data_reality_scan`, `variable_role_card`, `processing_possibilities`, `analysis_spec_support`.
- `method_lead`: `method_option_map`, `selected_path_refinement`, `analysis_spec_draft`, `specialist_routing_recommendation`.
- `causal_gatekeeper`: `claim_feasibility_screen`, `dag_timing_role_review`, `statistical_claim_review`.

## Domain Context Checkpoint

After the first real `data_analyst` data scan or variable-role card in a project with data, route one bounded `domain_expert` checkpoint unless current `domain_information` already covers construct meaning and relevant precedent.

Use `feedback_only` by default. Choose `construct_clarification` when variable meaning, proxies, or population/setting are unclear; choose `domain_precedent_scan` when dataset name, codebook hints, endpoint conventions, or common study designs could change method options or interpretation.

The checkpoint should look for domain-laden variable names, dataset or codebook clues, construct proxies, common endpoints, common comparators, exact-dataset or analogous-study precedent, domain technique cues, interpretation boundaries, and route clues for `method_lead`. Include technique cues only when field conventions could affect method choice, diagnostics, report assets, or interpretation. Keep it to a compact handoff: usually three to six notes plus one next domain question if needed.

If the data are generic or the domain cannot be inferred, record that the domain context is unclear and preserve the smallest useful domain question. Do not run a broad literature review unless main separately routes a bounded source inspection.

## Pending And Parked Work

Use `team_synthesis.exploration_threads` for consultant-suggested directions that could change the causal question, method choice, data processing, validity boundary, workload, or report interpretation.

Use `method_alignments.method_ideas` as the durable pool for catalog-aware method options, data twists, goal twists, implementation enhancements, diagnostic/sensitivity ideas, bounded discovery sidecars, and blocked-but-relevant alternatives. When `method_lead` returns an idea pool, record the full screened pool before main presents a subset to the user. Ideas should have a concrete hook: domain precedent, data shape, user goal, catalog fit, diagnostic need, validity risk, or report-asset need.

Use `pending_user_intents` only for user-requested work that should not be forgotten but is not immediate execution permission: analyses, diagnostics, sensitivities, report items, or follow-up tasks. Status values: `pending`, `ready_to_offer`, `active_next`, `user_declined`, `resolved`, `blocked`, `parked_for_report`.

When a user response implies multiple tasks, record non-immediate user-requested items in `pending_user_intents`. Store consultant suggestions in `exploration_threads` or `method_ideas`. Move one item to the immediate next step only when main is about to scope it for the user.

Semantic parking rule: whenever main or a specialist mentions possible work that is not the immediate selected unit, classify it before moving on. This applies to any possible analysis, diagnostic, sensitivity, branch, model, data check, report component, method twist, or design alternative, regardless of wording. User-requested non-immediate work goes to `pending_user_intents`; consultant-suggested work goes to `method_ideas` or `exploration_threads`. If an item is no longer useful, mark it `blocked`, `superseded`, or `user_declined` with a short reason rather than leaving it implicit.

Method-idea presentation uses staged selection:

- Main presents only a paced subset, usually 1-2 method/fallback paths plus at most 1 innovation or twist. In simple cases, main may present only the recommended path and a short note that no extra twist changes the next decision.
- Mark presented ideas as `shown`; keep unshown consultant ideas as `unshown` rather than deleting them.
- If the user clearly chooses one concrete idea, mark it `selected_next` and scope it as the next work unit.
- If the user clearly chooses multiple concrete ideas, mark one as `selected_next`; move additional user-selected ideas into `pending_user_intents` and mark their method ideas as `user_selected_pending`.
- If the user gives broad approval such as "sounds good," "okay," or "do what you think," treat it as direction agreement, not selection of every shown idea. Ask or scope the recommended immediate unit before execution.
- If the user declines, blocks, or replaces an idea, update `presentation_status` and `resolution`.

Before final report writing, all user-requested pending work and consultant alternatives with `activation_readiness: worth_discussing` or `ready_for_subskill` must be resolved, declined, blocked, or explicitly parked for report. `deferred` or `blocked` ideas do not block reporting unless they affect interpretation; if they do, include a short "not run / parked alternative" note.

## Discovery Opportunity Check

Use this check before discovery is active. Main runs it after `data_analyst.variable_role_card` and while synthesizing `method_lead.method_option_map`.

Recommend or record a bounded `causal_discovery` sidecar idea only when graph exploration could help the next decision: many candidate variables or proxies, unclear confounder/mediator/collider roles, competing DAG stories, lagged/time-series/panel/network/system structure, multi-environment structure, existing graph artifacts, or explicit user interest.

Do not recommend discovery when the role card is simple: one exposure, one outcome, clear comparison and timing, few covariates, clear adjustment story, and no graph uncertainty. If discovery is tempting but unsupported or unsafe, record it as `blocked`, `deferred`, or `superseded` with a short reason instead of offering it.

Positive discovery opportunities should usually be stored in `method_alignments.method_ideas` as `idea_type: discovery_sidecar`; broader unstructured prompts may go in `team_synthesis.exploration_threads`. Main may show at most one discovery option in the paced method/fallback menu.

## Discovery Lifecycle And Reintegration

Use `causal_discovery` only as an optional exploratory sidecar. If `discovery_sidecar.status` is `active` or `paused`, main must handle it before unrelated analysis, report, or final wrap-up by doing one bounded move: route the next discovery step, return to `return_to_phase`, ask whether to park or close it, or close it with a reason.

After any discovery packet, main must classify the implication before moving on:

- `exploratory_only`: record or append only if durable, then return to `return_to_phase` or close the sidecar.
- `reviewer_needed`: route one implication through `data_analyst`, `domain_expert`, `method_lead`, or `causal_gatekeeper`.
- `user_choice_needed`: present one bounded discovery-related choice.
- `parked_for_report`: keep it exploratory and note why it is not changing the main workflow.
- `sidecar_closed`: close with a short reason and return to the main phase.

Discovery never updates adjustment, DAG/timing logic, method choice, framework, gates, or claim wording directly. If it suggests a change to any of those, route through `method_lead` and/or `causal_gatekeeper` before main changes the workflow.

## Role And Method Clearance

Major stages should end in a user-visible choice unless the next step is only small data-reality inspection. Agreement at one stage advances to the next stage; it does not authorize later stages.

Clear these visible consulting gates before execution authorization:

- Variable-role card before method/fallback choice, execution confirmation, or report work.
- Bounded domain context checkpoint after the first real data/role-card inspection when construct meaning, dataset precedent, endpoint conventions, or interpretation boundaries are not already covered.
- Discovery Opportunity Check after the role card and during method option mapping; offer discovery only when data or DAG complexity makes graph exploration useful for the next decision.
- `method_lead` method/fallback choice before scripts, models, adjusted associations, tables, workbooks, or reports; expect a screened pool that attempts 2-3 design-route or fallback ideas plus 1-2 proactive twists or contributions, but only retains ideas with a concrete hook.
- Multi-task responses split into branch map plus one immediate next step; non-immediate user requests go to `pending_user_intents`.
- `causal_gatekeeper` before causal estimation, claim upgrades, load-bearing DAG/timing/adjustment decisions, discovery-driven workflow changes, or model-based output that may be mistaken for causal evidence.
- Causal Structure Sketch Gate: before causal, qualified-causal, adjusted/model-based, or reportable work from a causal question, route `causal_gatekeeper` for `dag_timing_role_review` and require `causal_validity.dag_and_timing.causal_structure_sketch.status` to be recorded. Default required cases are reportable causal wording, adjustment, matching, weighting, stratification, timing uncertainty, post-treatment/collider/mediator/selection concerns, or a causal question downgraded to non-causal fallback.

For model-based non-causal work, use labels such as "non-causal adjusted association panel." Do not quietly relabel an unready causal request as descriptive and then run models.

If `causal_structure_sketch.status` is `missing` or `blocked`, execution cannot proceed under causal, qualified-causal, adjusted/model-based, or reportable causal framing. Main should ask whether to pause for timing/role/provenance information, proceed only under weakened or non-causal wording, or omit the sketch with an explicitly terse and qualified deliverable.

If a checkpoint is not ready, main asks one user question or routes one bounded specialist check. Do not start a cascade.

## Execution Authorization Packet

Use the current `execution_records` item as the Execution Authorization Packet: the single source of permission for what may be executed next. It is not a backlog; queued user requests remain in `pending_user_intents`, and consultant ideas remain in `exploration_threads` or `method_ideas`.

Create or summarize the packet only after role/method clearance is complete and the selected work unit has been shown to the user. The packet must cite the role card and method/fallback choice it depends on.

Execution may start only when the packet has:

- `record_status: confirmed`;
- confirmed scope and claim boundary;
- causal-structure sketch status when the work is causal, qualified-causal, adjusted/model-based from a causal question, or reportable from causal/timing/adjustment logic;
- selected-unit spec: exposure, outcome, comparison, covariates, sample/design, model or method, diagnostics, and wording boundary;
- intended tool lanes and fallback policy;
- allowed outputs and table placement, including what is explicitly not allowed;
- report asset plan for model-based, diagnostic, or reportable work: required figures or tables, citation/source needs, narrative interpretation cues, and any intentional omission reasons;
- dependency/deviation status cleared or explicitly approved.

Allowed outputs should normally be one source script/notebook, one `analysis_note_*.md` or technical note, compact tables embedded in that note, required diagnostic/result figures named in the report asset plan, and only large or user-requested external artifacts. Unless the packet explicitly authorizes report work, reports, polished memos, final HTML reports, workbooks, extra diagnostics, and unplanned compact CSVs are forbidden outputs.

Specialists, scripts, and report work may only do what the packet allows.

During execution, the current record should remain `closeout_status: incomplete` until Post-Execution Return Gate And Queue Reconciliation is complete. If execution cannot produce a valid return gate because source paths, analysis note, dependency/deviation status, or queue reconciliation cannot be established, set `closeout_status: blocked` and offer repair or stop choices.

## Implementation Drift Control

Execution is bound to the confirmed Execution Authorization Packet. Pause and ask for revised confirmation before continuing if a material element changes or a required packet field was missing.

Material deviations include unavailable packages/functions; replacement estimator, approximation, or custom implementation; changed model family, estimand, target population, exposure, outcome, covariates, sample, weights, clusters, survey handling, diagnostics, variance method, validation, report asset plan, output plan, branch set, report section, final HTML structure, or claim wording.

Before installing packages, switching tools, using hand-rolled implementations, dropping diagnostics, omitting required report figures/citations, or changing the HTML report tooling or structure, offer one or two choices: install/use intended tool, approve a limited fallback, generate missing assets, or stop with a planning note.

A missing package plus custom or alternate implementation is never "no deviation." It must be recorded as fallback/accepted/unresolved dependency status and approved/accepted/unresolved deviation status.

Actual outputs must stay within `allowed_outputs`. Unplanned compact CSVs, workbooks, report-like Markdown/HTML, extra diagnostics, or unapproved final HTML reports are material deviations unless explicitly approved.

## Post-Analysis Gatekeeper Checkpoint

After any `execution_authorized` analysis unit, route `causal_gatekeeper` before main interprets results, offers report writing, returns to another branch, or sends the closeout. This applies to causal, qualified-causal, non-causal adjusted association, descriptive, and model-based fallback work.

Use `feedback_only` by default. For causal or qualified-causal work, route `statistical_claim_review` and add `dag_timing_role_review` if timing, adjustment, exclusion, or sample definition changed during execution. For non-causal or descriptive/model-based fallback work, route `statistical_claim_review` focused on preventing causal over-interpretation and checking whether uncertainty, p-values, model labels, and limitations match the evidence.

The gatekeeper should return a compact post-analysis status for the return gate: claim boundary, blocker or alarm if any, whether interpretation must be weakened, whether actual execution matched the inline causal-structure sketch when relevant, and the smallest acceptable next action. A stop-level issue means the return gate may offer revision, weakened wording, or stopping; it must not offer final report writing until the issue is resolved or explicitly parked with non-misleading wording.

## Post-Execution Return Gate And Queue Reconciliation

After every `execution_authorized` unit, main stops and sends a compact Return Gate before doing anything else. The Return Gate is the user-facing shape that moves main out of execution mode and back into consulting mode.

The Return Gate must use this shape:

- `[OK Confirmed] Ran:` completed unit, source script/notebook path, and analysis note path.
- `[! Boundary] Status:` claim boundary plus dependency, deviation, packet-match, and gatekeeper issues only as needed.
- `[+ Method Options] Next:` one remaining user intent, consultant idea, repair choice, stopping option, or final HTML report option.

Before sending the Return Gate, update the current `execution_records` item. The durable record still needs completed unit and confirmed scope; claim boundary; source path; analysis note path; external artifacts and reasons; embedded-table status; report assets produced or missing; dependency/deviation status; packet match; causal-structure sketch match when relevant; post-analysis gatekeeper status when analysis was run; and queue reconciliation.

Closeout is incomplete unless the current execution record has `closeout_status: complete` or `blocked`. Use `complete` only when the durable fields needed to truthfully fill the three Return Gate lines are recorded: source path, analysis note path, dependency/deviation status, packet match, post-analysis gatekeeper status when needed, queue reconciliation, and one next user-facing choice.

`queue_reconciliation` must include `remaining_user_intents`, `remaining_consultant_ideas`, `next_item_to_offer`, `report_ready`, and `reconciliation_note`. If active `pending_user_intents` remain, set `report_ready: false`. If worthwhile consultant ideas remain unoffered or unresolved, set `report_ready: false` unless the user explicitly parks them for report. If `discovery_sidecar.status` is `active` or `paused`, include it as remaining consultant work and set `report_ready: false` unless the user explicitly parks discovery for report.

If `report_ready: false`, the next choice should surface one remaining item: try it, park it for report, mark it unnecessary, or block it with a reason. Report writing, stop/final wrap-up, or another branch cannot be the default next step until reconciliation is resolved.

The Return Gate is blocked if code supported results but source code path is missing, or if no `analysis_note_*.md` or equivalent technical note records the executed unit. Set `closeout_status: blocked`; the `[! Boundary] Status` line names the missing fact, and `[+ Method Options] Next` offers repair or stopping with a technical note before report work.

## Report Readiness Clearing

Before activating `report_writer` for a final or substantive report:

- `pending_user_intents` has no `pending`, `ready_to_offer`, or `active_next` items.
- Worthwhile consultant alternatives in `exploration_threads` and relevant `method_ideas` have been offered and resolved, declined, blocked, or explicitly parked for report. For `method_ideas`, this applies by default to unresolved ideas with `activation_readiness: worth_discussing` or `ready_for_subskill`; `deferred` or `blocked` ideas block only if they affect interpretation.
- `discovery_sidecar.status` is inactive, closed, blocked, or explicitly parked for report; active or paused discovery with unresolved `next_action`, reviewer requests, or unreviewed implications blocks report work.
- Parked user intents or consultant ideas that affect interpretation have short report notes.
- Execution records are complete and internally consistent when analysis was run, with `closeout_status: complete` and `queue_reconciliation.report_ready: true`.
- Post-analysis `causal_gatekeeper` review is current and consistent with the execution record and analysis note when analysis was run.
- If the report relies on causal, timing, adjustment, matching, weighting, stratification, or causal-question fallback logic, `causal_validity.dag_and_timing.causal_structure_sketch.status` is `ready`, `not_required`, or explicitly `omitted_by_user` with qualified report wording. `missing` or `blocked` blocks polished report drafting until resolved or the user accepts a terse technical note.
- Required report assets for model-based, diagnostic, or reportable work are present or explicitly resolved: main result visual/table, key diagnostic visual/table, citation/source notes, and narrative cues. If missing, main offers a bounded report-asset generation or source-refresh step before final drafting unless the user explicitly accepts a terse technical note.

If unresolved work remains, main asks whether to try one remaining item, mark it unnecessary, block it with a reason, or park it for report. Do not route final report drafting until this choice is recorded.

Detailed report planning, stage evidence ledger, owner review, final HTML QA, and report-ready failure conditions live in `subskills/report_writer/references/report_workflow.md`.

## Specialist, Sidecar, And Report Routing Pointers

Activate core specialists by the stage vocabularies above and the concrete checkpoint sections in this file. Use method/task specialists only after `method_lead` has produced a candidate idea or the user has chosen a bounded route; append records to `specialist_outputs` only when durable.

Use `causal_discovery` only as the optional exploratory sidecar described in Discovery Opportunity and Lifecycle. Detailed intake, diagnostics, reviewer routing, and report support live in `subskills/causal_discovery/references/workflow.md`.

Activate `report_writer` only for explicit report planning, final HTML drafting, revision, owner review, or final HTML QA after Report Readiness Clearing. Detailed report workflow lives in `subskills/report_writer/references/report_workflow.md`.

## Standard Handoff Handling

When a specialist returns feedback:

1. Check whether it changes the next user-facing move.
2. If it only informs the immediate reply, do not over-record it.
3. If it affects future routing or interpretation, record the owned YAML section or append a compact specialist output.
4. If it asks another role for information, route only the smallest necessary follow-up.
5. If `specialist_outputs.requests` asks for follow-up, route only the one or two requests that matter now; preserve the rest in `exploration_threads`, `open_questions`, or the specialist record.
6. If a discovery packet asks for reviewer follow-up, route only the implication that matters for the next user-facing decision; leave or park the rest.
7. If feedback creates a user choice, explain the choice and ask before expanding work.
