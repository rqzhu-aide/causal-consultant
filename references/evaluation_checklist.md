# Evaluation Checklist

Use this file only when auditing, revising, or preparing a version update for `causal-consultant`. Do not load it during ordinary causal consultation.

## Static Contract Checks

- Main remains the only user-facing voice.
- Activation message has one canonical definition in `SKILL.md`, appears exactly once, matches `manifest.json` version, and no reference file defines an alternate welcome, version, or "loaded" banner.
- `references/backend_workflow.md` stays a concise runtime contract, ideally under 30 KB or 375 lines, and does not duplicate detailed report-writer, causal-discovery, method-output-template, or artifact-index schemas.
- Backend uses the four-part execution-control lifecycle: Role And Method Clearance, Execution Authorization Packet, Implementation Drift Control, and Post-Execution Return Gate.
- Main has a Pre-User Response Check that catches skipped gates, implied execution/report work, stale reviewer state, missing closeout, and overlong option lists before replying.
- Main owns `project_summary`, `team_synthesis`, `discovery_sidecar`, `specialist_outputs`, `execution_records`, `pending_user_intents`, and `artifact_index`.
- `pending_user_intents` stores user-requested work only; consultant ideas stay in `exploration_threads` or `method_alignments.method_ideas`.
- `method_alignments.method_ideas` is the durable pool for catalog-backed method and twist ideas; main records the full pool before presenting a subset.
- Method/fallback gates include 1-3 design-route or fallback ideas plus 1-2 innovative data/goal/implementation/diagnostic ideas when possible.
- First real data scan or variable-role card triggers one bounded domain context checkpoint unless current `domain_information` already covers construct meaning and precedent.
- `execution_records` controls only the current authorized execution unit and closeout; it is not a backlog.
- `execution_records` is the single immediate execution permission source; selected-unit spec, intended tools, fallback policy, allowed/forbidden outputs, and permission status live in that packet before execution.
- Model-based, diagnostic, or reportable execution packets include a report asset plan: required visuals/tables, citation/source needs, narrative cues, and omission reasons.
- Causal, qualified-causal, adjusted/model-based, or reportable work from a causal question routes `causal_gatekeeper` for `dag_timing_role_review` and records `causal_validity.dag_and_timing.causal_structure_sketch.status`.
- The inline causal-structure sketch is stored in `causal_validity`, not as a required separate artifact. External graph artifacts remain optional for complex graphs, discovery outputs, or user-requested visuals.
- Executed units require `closeout_status: complete` or `blocked`, plus a user-facing Return Gate with `Ran`, `Status`, and `Next`.
- `queue_reconciliation.report_ready` is present in the closeout and is `false` whenever active pending user work or unresolved worthwhile consultant ideas remain.
- Variable-role card and method/fallback choice remain visible consulting gates; they are not collapsed into `execution_records`.
- `domain_expert`, `data_analyst`, `method_lead`, and `causal_gatekeeper` each write only their owned YAML section.
- Core subskills have bounded activation guidance and return compact handoffs to main.
- Method/task subskills are internal/routed specialists, not direct user-facing skills.
- Method/task subskills return `specialist_outputs` using the correct template.
- `assets/method_subskill_catalog.yaml` matches the method/task subskill folders and keeps sidecars separate from numbered method categories.
- `causal_discovery` is unnumbered, optional, exploratory, main-routed, and cannot change gates, framework, adjustment, or claim wording directly.
- Discovery Opportunity Check is considered after the variable-role card and during `method_lead.method_option_map`; useful opportunities are recorded as consultant ideas, while simple clear data does not trigger discovery by default.
- Active or paused `discovery_sidecar` state is checked at the start of durable turns, in post-execution queue reconciliation, and before final report work.
- Discovery packets require reintegration: exploratory-only, reviewer-needed, user-choice-needed, parked-for-report, or sidecar-closed.
- Report writer owns no YAML section and returns transient feedback to main.
- Report-writer details live in `subskills/report_writer/references/report_workflow.md`; causal-discovery details live in `subskills/causal_discovery/references/workflow.md`.

## Communication Checks

- Specialist handoffs are proposals; main decides what to show, record, defer, or route next.
- `specialist_outputs.requests` are inspected without creating cascades; main routes only the one or two follow-ups that matter now.
- Data facts can cue method opportunities, but `method_lead` selects and compares method paths.
- Data facts can cue discovery opportunities, but `method_lead` or main decides whether to offer a bounded discovery sidecar.
- Domain precedent can inform method alignment, but `method_lead` selects and compares method paths.
- `method_lead` uses a screened idea pool: proactive ideas need a concrete domain, data, user-goal, catalog, diagnostic, validity, or report-asset hook.
- Simple role cards may produce fewer method ideas with a recorded reason; the skill should not pad the pool with generic advanced methods.
- If a user selects multiple method ideas, main promotes one to the next work unit and records the rest as `pending_user_intents`; unchosen consultant ideas remain in `method_ideas` until resolved, declined, blocked, superseded, or parked for report.
- Broad approval such as "sounds good" or "do what you think" is direction agreement, not selection of every shown idea.
- Any mentioned non-immediate work item is semantically classified before main continues: user-requested work in `pending_user_intents`, consultant-suggested work in `method_ideas` or `exploration_threads`, or explicitly blocked/superseded/declined.
- `causal_gatekeeper` reviews claim-strength changes before estimation, causal wording, report claims, or load-bearing DAG/timing/adjustment decisions.
- `causal_gatekeeper` produces or requests an inline causal-structure sketch when causal/timing/adjustment logic is load-bearing; `missing` or `blocked` pauses execution or polished report work unless the user explicitly accepts weakened/terse wording.
- `causal_gatekeeper` reviews any executed analysis before main interprets results, offers report writing, returns to another branch, or sends closeout.
- Report writer uses recorded evidence and artifact paths; missing or stale assets are routed back to the owner.
- Final report writing is blocked until pending user intents and worthwhile consultant alternatives are resolved, declined, blocked, or explicitly parked for report.
- Discovery packets route implications through core reviewers before they affect causal specification, adjustment, or reports.
- Active/paused discovery cannot be skipped for unrelated analysis, report, or final wrap-up.

## Scenario Dry Reviews

- Vague "analyze X on Y": main asks or offers a small option map before analysis.
- Premature modeling request: main explains why the causal target is not ready and offers one useful next check.
- Observational high-covariate data: method_lead can surface observational design plus matching, doubly robust, or DML support without automatic execution.
- Complex role card with many variables, unclear roles, lagged/system structure, or graph artifacts: main records or offers a bounded discovery sidecar as one optional twist.
- Simple role card with clear timing, few covariates, and no graph uncertainty: discovery is not offered by default.
- First real dataset or role card: domain_expert gets one bounded context pass, or main records why existing domain notes already cover it.
- Event-time outcome: data_analyst can flag survival support; method_lead can surface `23-survival-competing-risks`.
- Subgroup or personalized request: method_lead can surface target-goal choices such as heterogeneity or point treatment rules.
- Unsupported causal claim: causal_gatekeeper blocks or downgrades the claim and main offers one acceptable reframe.
- Executed non-causal/model-based fallback: causal_gatekeeper checks statistical wording and prevents causal over-interpretation before closeout.
- Executed causal or qualified-causal model: causal_gatekeeper checks post-analysis claim boundary before report readiness.
- Causal analysis request with adjustment: gatekeeper records a `ready` inline causal-structure sketch before execution, and the report includes it.
- Cross-sectional exposure/outcome fallback: sketch shows timing concern and report uses it to explain association-only wording.
- Missing timing: sketch status is `missing` or `blocked`; main asks whether to pause for timing/provenance or proceed only with weakened wording.
- Pure descriptive summary not originating from a causal question: sketch may be `not_required`.
- Report request: report writer stays silent, creates a final HTML report, requests owner review, checks required figures/citations/narrative cues, and asks for bounded asset generation when needed.
- Propensity/matching/weighting report: required overlap and balance visuals are present or explicitly blocked/omitted; a polished report cannot proceed from numeric tables alone.
- Citation-sensitive report: named methods, software, dataset docs, and domain precedents have inspected sources or a clear internal-note limitation.
- Report request with pending tasks or worthwhile alternatives: main asks whether to try, park, decline, or block one remaining item before report writer drafts.
- Post-execution Return Gate with remaining work: `Next` surfaces one remaining user intent or consultant idea before report/stop choices.
- Long execution finishes: the next user-facing reply uses `Ran`, `Status`, and `Next` before report, wrap-up, or another branch.
- Method output with many requests: main routes only one or two and keeps the user-facing turn light.
- Causal discovery requested or suggested: main offers it as an optional exploratory sidecar, records artifacts, and routes implications through reviewers.
- Active discovery with `next_action`: main routes it, returns to phase, parks it, or closes it before unrelated work.
- Discovery packet with adjustment, DAG, timing, method, or claim implication: main routes to method_lead and/or causal_gatekeeper before workflow changes.
- Report request with active/paused discovery: report writer blocks unless discovery is closed, blocked, inactive, or explicitly parked for report.

## Scorecard Rubric

Rate each changed component 0, 1, or 2:

- Role clarity: the component says what positive contribution it makes.
- Activation trigger: the component says when it should be used and avoids default background passes.
- Input sufficiency: the component reads enough state to do its job, but not the whole project by default.
- Output usability: the component returns a patch, handoff, record, path, or question main can use.
- Interaction pacing: the change preserves one or two user-facing concepts, choices, or questions.
- Risk control: causal or statistical claim changes route through `causal_gatekeeper`.
- Report/artifact support: durable outputs have owners, paths, and QA expectations when relevant.
- Workload restraint: the change avoids broad sweeps, cascades, or automatic expansion.

If any score is 0, revise before versioning. If several scores are 1, decide whether the issue is harmless polish or a real drift risk.
