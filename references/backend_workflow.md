# Backend Workflow

Use this reference for internal routing, YAML ownership, and cross-cutting gates. Keep user-facing replies governed by main `SKILL.md`: short, educational, and choice-oriented.

Backend is the runtime contract for main's internal routing, YAML ownership, and cross-cutting gates. Subskill-specific detail lives in the owning subskill references.

## Main Turn Loop

When no durable project state exists, main starts lightweight. If the activation message is due, send the exact `SKILL.md` activation message first. Then treat the first request as a rough causal idea: give orientation, ask one separating question, or offer a compact option map. Do not run all core roles by default.

Create durable state only when the project becomes multi-turn, files/data are inspected, specialist feedback is routed, or future choices need memory. First-turn specialist routes must be bounded: data -> `data_analyst`; method choice -> `method_lead`; causal claim/unsupported request -> `causal_gatekeeper`; domain meaning/precedent -> `domain_expert`.

When durable project state exists:

1. Read `project_summary`, `team_synthesis`, unresolved `pending_user_intents`, active or worth-revisiting `exploration_threads`, relevant `method_alignments.method_ideas`, and `discovery_sidecar`.
2. If the user is forcing analysis before readiness, use the forced-analysis boundary and do not execute.
3. If the user accepted a reframe, treat that as direction agreement, not execution permission. Move to scoped deliverable choice.
4. If the user response implies several tasks, make a compact branch map, record non-immediate user-requested items in `pending_user_intents`, and choose one immediate next step. If the request includes analysis plus a final report, treat the report as a durable report intent in `pending_user_intents` and `report_assembly`, not part of the analysis execution unit.
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

Before every user-facing reply, main checks these invariants:

- No implied execution, report production, extra branch, diagnostics, or stronger claim without current review and confirmed scope.
- If execution occurred, the next user-facing message is the Post-Execution Return Gate and nothing else.
- Specialist feedback becomes one staged handoff or one/two choices, with extras parked.
- Active or paused discovery is routed, returned, parked, or closed before unrelated work.
- Before report writing or final wrap-up, pending user intents and worthwhile consultant alternatives are resolved, declined, blocked, or explicitly parked for report.

If any answer reveals a skipped gate, do not send the draft. Route one bounded check, ask one user question, or present the missing choice instead.

## State Ownership

- Main owns `project_summary`, `team_synthesis`, `discovery_sidecar`, `specialist_outputs`, `execution_records`, `pending_user_intents`, `report_assembly`, and `artifact_index`.
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

Specialists may only do what the routed mode and inputs allow. Specialist requests are not approvals: if a specialist asks for data work, diagnostics, artifacts, scripts, models, or reports, main brings the request back as one or two choices unless already authorized.

## Staged Choice Menus

After any staged specialist round, main ends the user-facing synthesis with either one explicit `[? Question]` or a small menu. Use `[+ Method Options]` when choices are analytical routes, method/fallback paths, sensitivities, data-driven method paths, or discovery-as-method-sidecar ideas. Use `[+ Next Steps]` when choices are workflow, repair, report, stop, dependency, source/codebook, report-asset, domain-clarification, or other non-method actions.

Ordinary staged turns usually show 1-2 options; show 3 only when a pending user request or worthwhile consultant idea would otherwise disappear. Displayed choices never authorize execution. Main still promotes only one selected item into the immediate next step and keeps the rest in the proper durable pool.

## Core Stage Contract

Core subskills are staged reviewers, not background workers. Every core activation should name one stage, allowed mode, stage question, allowed inputs, and `stop_after_stage: true`.

If stage is missing, the core subskill chooses the earliest relevant `feedback_only` stage, completes only that stage, and stops. Core subskills use their own documented stage-output shape; main shows one or two options and parks extras.

Core stage vocabularies: `domain_expert` has `construct_clarification`, `domain_precedent_scan`, `interpretation_boundary`; `data_analyst` has `data_reality_scan`, `variable_role_card`, `processing_possibilities`, `analysis_spec_support`; `method_lead` has `method_option_map`, `selected_path_refinement`, `analysis_spec_draft`, `specialist_routing_recommendation`; `causal_gatekeeper` has `claim_feasibility_screen`, `dag_timing_role_review`, `statistical_claim_review`.

## Domain Context Checkpoint

After the first real `data_analyst` data scan or variable-role card in a project with data, route one bounded `domain_expert` checkpoint unless current `domain_information` already covers construct meaning and relevant precedent.

Use `feedback_only` by default. Route `construct_clarification` for variable meaning/proxy/setting uncertainty, or `domain_precedent_scan` when dataset clues, endpoint conventions, study designs, technique cues, or interpretation boundaries could change method options or reporting. Detailed domain behavior lives in `subskills/domain_expert/SKILL.md`; do not run a broad literature review unless main separately routes a bounded source inspection.

## Pending And Parked Work

Use `team_synthesis.exploration_threads` for consultant-suggested directions that could change the causal question, method choice, data processing, validity boundary, workload, or report interpretation.

Use `method_alignments.method_ideas` as the durable pool for catalog-aware method options, data twists, goal twists, implementation enhancements, diagnostic/sensitivity ideas, bounded discovery sidecars, and blocked-but-relevant alternatives. When `method_lead` returns an idea pool, record the full screened pool before main presents a subset to the user. Ideas should have concrete support: domain precedent, data shape, user goal, catalog fit, diagnostic need, validity risk, or report-asset need.

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

Use this check after `data_analyst.variable_role_card` and while synthesizing `method_lead.method_option_map`. Record a bounded discovery sidecar idea only when graph exploration could help the next decision, such as high-dimensional, role-ambiguous, lagged/time-series, system/network, graph-artifact, competing-DAG, or user-requested discovery settings.

Do not recommend discovery for simple, clear, low-dimensional role cards with no meaningful graph uncertainty. Store positive opportunities in `method_alignments.method_ideas` as `idea_type: discovery_sidecar` when possible; broader prompts may go in `team_synthesis.exploration_threads`. Main may show at most one discovery option in the paced method/fallback menu.

## Discovery Lifecycle And Reintegration

Use `causal_discovery` only as an optional exploratory sidecar. If `discovery_sidecar.status` is `active` or `paused`, main must handle it before unrelated analysis, report, or final wrap-up: route one bounded step, return to `return_to_phase`, ask whether to park or close it, or close it with a reason.

Discovery never updates adjustment, DAG/timing logic, method choice, framework, gates, or claim wording directly. After a discovery packet, classify it as exploratory-only, reviewer-needed, user-choice-needed, parked-for-report, or closed. Route any main-workflow implication through `method_lead` and/or `causal_gatekeeper`. Detailed sidecar workflow lives in `subskills/causal_discovery/references/workflow.md`.

## Role And Method Clearance

Major stages should end in a user-visible choice unless the next step is only small data-reality inspection. Agreement at one stage advances to the next stage; it does not authorize later stages.

Clear these visible consulting gates before execution authorization:

- Variable-role card before method/fallback choice, execution confirmation, or report work.
- Bounded domain context checkpoint after the first real data/role-card inspection when construct meaning, dataset precedent, endpoint conventions, or interpretation boundaries are not already covered.
- Discovery Opportunity Check after the role card and during method option mapping; offer discovery only when data or DAG complexity makes graph exploration useful for the next decision.
- `method_lead` method/fallback choice before scripts, models, adjusted associations, tables, workbooks, or reports; expect a screened pool that attempts 2-3 design-route or fallback ideas plus 1-2 proactive twists or contributions, but only retains ideas with concrete support.
- Multi-task responses split into branch map plus one immediate next step; non-immediate user requests go to `pending_user_intents`.
- Analysis-plus-report requests split into one scoped analysis unit plus a durable final-report intent. Main keeps `report_assembly` current as analyses finish and only routes report writer when the report assembly is ready.
- `causal_gatekeeper` before causal estimation, claim upgrades, load-bearing DAG/timing/adjustment decisions, discovery-driven workflow changes, or model-based output that may be mistaken for causal evidence.
- Causal Structure Sketch Gate: before causal, qualified-causal, adjusted/model-based, or reportable work from a causal question, route `causal_gatekeeper` for `dag_timing_role_review` and require `causal_validity.dag_and_timing.causal_structure_sketch.status` to be recorded. Default required cases are reportable causal wording, adjustment, matching, weighting, stratification, timing uncertainty, post-treatment/collider/mediator/selection concerns, or a causal question downgraded to non-causal fallback.

For model-based non-causal work, use labels such as "non-causal adjusted association panel." Do not quietly relabel an unready causal request as descriptive and then run models.

If `causal_structure_sketch.status` is `missing` or `blocked`, execution cannot proceed under causal, qualified-causal, adjusted/model-based, or reportable causal framing. Main should ask whether to pause for timing/role/provenance information, proceed only under weakened or non-causal wording, or omit the sketch with an explicitly terse and qualified deliverable.

If a checkpoint is not ready, main asks one user question or routes one bounded specialist check. Do not start a cascade.

## Execution Authorization Packet

Use the current `execution_records` item as the Execution Authorization Packet: the single source of permission for what may be executed next. It is not a backlog; queued user requests remain in `pending_user_intents`, and consultant ideas remain in `exploration_threads` or `method_ideas`.

Create or summarize the packet only after role/method clearance is complete and the selected work unit has been shown to the user. The packet must cite the role card and method/fallback choice it depends on.

Each execution packet must name one analysis unit folder: `outputs/analyses/NNN_unit_id/`. That folder contains the unit source, technical note, figures, tables, data or large reproducibility outputs, and `manifest.json`. Final reports live separately under `outputs/reports/`.

Execution may start only when the packet has:

- `record_status: confirmed`;
- confirmed scope and claim boundary;
- causal-structure sketch status when the work is causal, qualified-causal, adjusted/model-based from a causal question, or reportable from causal/timing/adjustment logic;
- selected-unit spec: exposure, outcome, comparison, covariates, sample/design, model or method, diagnostics, and wording boundary;
- intended tool lanes and fallback policy;
- `analysis_dir`, `manifest_path`, and planned `unit_artifacts`;
- allowed outputs and table placement, including what is explicitly not allowed;
- report asset plan for model-based, diagnostic, or reportable work: required figures or tables, citation/source needs, narrative interpretation cues, and any intentional omission reasons;
- dependency/deviation status cleared or explicitly approved.

Allowed outputs should normally be one source script/notebook in the unit `source/` folder, one `analysis_note_*.md` or technical note in the unit folder, compact tables embedded in that note, required diagnostic/result figures under unit `figures/`, larger tables under unit `tables/` or `data/`, `manifest.json`, and only large or user-requested external artifacts. Unless the packet explicitly authorizes report work, reports, polished memos, final HTML reports, workbooks, extra diagnostics, and unplanned compact CSVs are forbidden outputs.

Specialists, scripts, and report work may only do what the packet allows.

During execution, the current record should remain `closeout_status: incomplete` until Post-Execution Return Gate And Queue Reconciliation is complete. If execution cannot produce a valid return gate because the analysis folder, manifest, source paths, analysis note, dependency/deviation status, or queue reconciliation cannot be established, set `closeout_status: blocked` and offer repair or stop choices.

## Implementation Drift Control

Execution is bound to the confirmed Execution Authorization Packet. Pause for user approval before continuing if a required packet field is missing or if packages, estimators, variables, sample, diagnostics, variance, report assets, analysis folder layout, outputs, HTML structure, or claim wording depart from the packet.

Offer one or two choices: use/install the intended tool, approve a limited fallback, generate missing assets, or stop with a planning note. A missing package plus custom or alternate implementation is never "no deviation"; record dependency and material-deviation status.

## Post-Analysis Gatekeeper Checkpoint

After any `execution_authorized` analysis unit, route `causal_gatekeeper` before main interprets results, offers report writing, returns to another branch, or sends the closeout. This applies to causal, qualified-causal, non-causal adjusted association, descriptive, and model-based fallback work.

Use `feedback_only` by default. For causal or qualified-causal work, route `statistical_claim_review` and add `dag_timing_role_review` if timing, adjustment, exclusion, or sample definition changed during execution. For non-causal or descriptive/model-based fallback work, route `statistical_claim_review` focused on preventing causal over-interpretation and checking whether uncertainty, p-values, model labels, and limitations match the evidence.

The gatekeeper should return a compact post-analysis status for the return gate: claim boundary, blocker or alarm if any, whether interpretation must be weakened, whether actual execution matched the inline causal-structure sketch when relevant, and the smallest acceptable next action. A stop-level issue means the return gate may offer revision, weakened wording, or stopping; it must not offer final report writing until the issue is resolved or explicitly parked with non-misleading wording.

## Post-Execution Return Gate And Queue Reconciliation

After every `execution_authorized` unit, main stops and sends the Return Gate before report, another branch, extra diagnostics, or final wrap-up:

- `[OK Confirmed] Ran:` completed unit, analysis folder, source script/notebook path, analysis note path, and manifest path.
- `[! Boundary] Status:` claim boundary plus dependency, deviation, packet-match, and gatekeeper issues only as needed.
- `[+ Method Options]` or `[+ Next Steps]` choices: usually 2-3 choices, with one recommended. Use `[+ Method Options]` for analytical branches, method ideas, sensitivities, or discovery sidecars; use `[+ Next Steps]` for repair, stopping, report assets, dependency choices, or final HTML report options.
- `[? Question]` an explicit user decision prompt that asks which option to take next.

Before sending it, update the current `execution_records` item with the facts needed to truthfully fill those lines: completed unit, analysis folder, manifest path, claim boundary, source path, analysis note path, unit artifacts, dependency/deviation status, packet match, gatekeeper status when needed, and queue reconciliation. Set `closeout_status: complete` only when those facts are present; use `blocked` if the analysis folder, manifest, source path, analysis note, or reconciliation cannot be established.

After closeout, update `report_assembly` when a report was requested or report writing is likely: append the completed `unit_id` to `included_execution_units`, summarize report-relevant artifacts and required mentions, refresh `pending_before_report`, and keep `status` below `ready_for_writer` until all report-readiness clearing conditions pass.

`queue_reconciliation` includes `remaining_user_intents`, `remaining_consultant_ideas`, `next_choices_to_offer`, `recommended_choice`, `report_ready`, and `reconciliation_note`. Set `report_ready: false` whenever active pending user work, unresolved worthwhile consultant ideas, or active/paused discovery remain unless the user explicitly parks them for report.

The `Next choices` menu should reflect current queues and specialist outputs:

- If active `pending_user_intents` exist, include at least one user-requested item.
- If unresolved worthwhile `method_ideas` or `exploration_threads` exist, include at least one consultant idea unless it is blocked, deferred, superseded, or explicitly parked.
- If `report_ready: true`, final HTML report may be one option.
- If a repair is required, include repair and usually recommend it.
- Do not pad with generic methods; if only one substantive path remains, include a genuine stop, park-for-report, repair, or final-report choice as the second option.
- The user may see multiple choices, but only one selected choice becomes the next immediate execution packet. If the user selects multiple concrete choices, promote one and record the others in `pending_user_intents`.

## Report Readiness Clearing

Before activating `report_writer` for a final or substantive report:

- `pending_user_intents` has no `pending`, `ready_to_offer`, or `active_next` items.
- Worthwhile consultant alternatives in `exploration_threads` and relevant `method_ideas` have been offered and resolved, declined, blocked, or explicitly parked for report.
- `discovery_sidecar.status` is inactive, closed, blocked, or explicitly parked for report.
- Execution records are complete and internally consistent when analysis was run, with `closeout_status: complete` and `queue_reconciliation.report_ready: true`.
- `report_assembly.status` is `ready_for_writer` and its `included_execution_units`, `pending_before_report`, `parked_for_report`, `required_mentions`, `html_outline`, and `required_assets` match the current project state.
- Each included execution unit has a valid `analysis_dir`, `manifest_path`, source script/notebook path, analysis note path, and required unit artifacts.
- Post-analysis `causal_gatekeeper` review is current when analysis was run, and causal-structure sketch status is resolved when causal/timing/adjustment logic matters.
- Required report assets for model-based, diagnostic, or reportable work are present or explicitly resolved.

If unresolved work remains, main asks whether to try remaining items, mark them unnecessary, block them with reasons, or park them for report. Do not route final report drafting until these choices are recorded.

Detailed report planning, stage evidence ledger, owner review, final HTML QA, source/citation checks, parked-work notes, and report-ready failure conditions live in `subskills/report_writer/references/report_workflow.md`.

## Specialist, Sidecar, And Report Routing Pointers

Activate core specialists by the stage vocabularies above and the concrete checkpoint sections in this file. Use method/task specialists only after `method_lead` has produced a candidate idea or the user has chosen a bounded route.

Use `causal_discovery` only as the optional exploratory sidecar described in Discovery Opportunity and Lifecycle. Detailed intake, diagnostics, reviewer routing, and report support live in `subskills/causal_discovery/references/workflow.md`.

Activate `report_writer` only for explicit report planning, final HTML drafting, revision, owner review, or final HTML QA after Report Readiness Clearing. Final HTML reports should be assembled from completed execution units listed in `report_assembly` and written under `outputs/reports/`. Detailed report workflow lives in `subskills/report_writer/references/report_workflow.md`.

## Standard Handoff Handling

When a specialist returns feedback, check whether it changes the next user-facing move. Do not over-record immediate-only feedback. If it affects future routing or interpretation, record the owned YAML section or append a compact specialist output. If specialist or discovery feedback asks for follow-up, route only the one or two requests that matter now and preserve the rest in `exploration_threads`, `open_questions`, or the specialist record. If feedback creates a user choice, explain the choice and ask before expanding work.
