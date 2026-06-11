# Report Plan

Use this as a private modular report plan. It is not a released report.

## Report Purpose

- User goal:
- Intended audience:
- Deliverable type:
- Claim boundary:
- Report status: planned / drafting / needs_assets / owner_review / ready / blocked

## Report Assembly State

Mirror `report_assembly` here before final HTML drafting. Empirical final reports should combine completed report-relevant actions rather than use only the latest analysis note. Planning HTML reports may have no included actions, but must clearly state that no data analysis or empirical estimates are included.

| Field | Planned content | Status |
|---|---|---|
| Report type | final_html / planning_html | pending / ready / missing |
| Template path | `subskills/report_writer/assets/final_report_template.html` / `subskills/report_writer/assets/planning_report_template.html` | pending / ready / mismatch |
| Included actions |  | pending / ready / missing |
| Pending before report |  | none / pending / parked / blocked |
| Parked or not-run items to disclose |  | none / ready / missing |
| Required mentions |  | pending / ready / missing |
| HTML outline |  | pending / ready / missing |
| Required assets across included actions |  | pending / ready / missing |
| Final HTML path | `outputs/reports/final_report_*.html` | pending / ready / missing |

## Front Summary

| Field | Planned content | Evidence basis | Status |
|---|---|---|---|
| Report type |  |  | planned |
| Evidence status |  |  | planned |
| Main answer |  |  | planned |
| Claim boundary |  |  | planned |
| Main limitation |  |  | planned |
| Next decision |  |  | planned |

## Key Callouts

| Callout | Purpose | Owner | Status |
|---|---|---|---|
| Key takeaways | Put the main message near the front | main / report_writer | planned |
| What not to claim | Protect against overinterpretation | causal_gatekeeper / report_writer | planned |
| Assumptions needing care | Make qualified assumptions visible | method_lead / causal_gatekeeper | planned |
| Unresolved diagnostics | Show what still affects trust | data_analyst / method_task / causal_gatekeeper | planned |
| Next action | Make the follow-up decision obvious | main / report_writer | planned |

## Stage Evidence Ledger

Use this table to preserve the staged consultation record. Do not let the final report become only a results note.

| Stage | Decision or finding | Evidence basis or source | Owner/reviewer | Status | Report placement |
|---|---|---|---|---|---|
| Causal framing |  |  | main / method_lead | completed / qualified / missing / stale / blocked | front summary / main text / appendix / omitted |
| Variable role card |  |  | data_analyst | completed / qualified / missing / stale / blocked | main text / appendix |
| Method/fallback choice |  |  | method_lead | completed / qualified / missing / stale / blocked | main text |
| Selected work-unit spec |  |  | method_lead / data_analyst | completed / qualified / missing / stale / blocked | main text / appendix |
| Validity boundary |  |  | causal_gatekeeper | completed / qualified / missing / stale / blocked | front summary / main text |
| Causal structure sketch |  |  | causal_gatekeeper | not_required / ready / missing / blocked / omitted_by_user | main text / appendix / omitted |
| Execution confirmation |  |  | main | completed / qualified / missing / stale / blocked | appendix / reproducibility |
| Execution record |  |  | main | completed / qualified / missing / stale / blocked | reproducibility |
| Analysis unit folder and manifest |  |  | main / data_analyst | completed / qualified / missing / stale / blocked | reproducibility |
| Dependency/package decisions |  |  | main / data_analyst / method_task | completed / qualified / missing / stale / blocked | reproducibility |
| Material deviations |  |  | main / owner reviewer | completed / qualified / missing / stale / blocked | main text / reproducibility |
| Pending actions |  |  | main | resolved / declined / blocked / parked_for_report / missing | main text / appendix / omitted |
| Consultant alternatives |  |  | main / method_lead | resolved / declined / blocked / parked_for_report / missing | main text / appendix / omitted |
| Results and diagnostics |  |  | data_analyst / method_task | completed / qualified / missing / stale / blocked | main text / appendix |
| Interpretation and next steps |  |  | main / domain_expert / method_lead | completed / qualified / missing / stale / blocked | main text |

## Core Components Included By Default

| Component | Evidence basis | Owner | Status | Notes |
|---|---|---|---|---|
| Main answer and evidence status |  | main / report_writer | planned |  |
| Original and refined causal question |  | main / method_lead | planned |  |
| Data reality and provenance |  | data_analyst | planned |  |
| Causal framework, estimand, and assumptions |  | method_lead / causal_gatekeeper | planned |  |
| Results, figures, and tables |  | data_analyst / method_task | planned |  |
| Diagnostics, sensitivity, and robustness |  | data_analyst / method_task / causal_gatekeeper | planned |  |
| Interpretation, limitations, and next steps |  | main / domain_expert / method_lead | planned |  |
| Reproducibility and artifact paths |  | data_analyst / report_writer | planned |  |

## Dependency And Deviation Decisions

| Item | Planned or confirmed choice | User permission status | Report note needed |
|---|---|---|---|
| Execution record status | cleared / install_approved / fallback_approved / accepted_after_execution / blocked / unresolved | approved / accepted after execution / pending / not needed | yes / no |
| Missing package/tool | none / install requested / fallback approved / accepted after execution / blocked / unresolved | approved / accepted after execution / pending / not needed | yes / no |
| Estimator or diagnostic substitution | none / approved before execution / accepted after execution / blocked / unresolved | approved / accepted after execution / pending / not needed | yes / no |
| Survey/design approximation | none / approved before execution / accepted after execution / blocked / unresolved | approved / accepted after execution / pending / not needed | yes / no |
| Other material deviation | none / approved before execution / accepted after execution / blocked / unresolved | approved / accepted after execution / pending / not needed | yes / no |

If fallback, substitution, approximation, dropped diagnostics, or changed outputs occurred, material deviation status cannot be `none`.

## Optional Components To Offer

Offer three or four meaningful next actions through main when multiple useful moves exist.
The plan may track several candidates, but feedback to main should surface only the top three or four choices for the next user turn.

| Optional component | Why it may help | Needed asset or owner | Status | User choice |
|---|---|---|---|---|
| Expanded DAG, timing diagram, or role table |  | causal_gatekeeper / method_lead / report_writer | candidate | pending |
| Exploratory causal discovery module |  | causal_discovery / method_lead / causal_gatekeeper | candidate | pending |
| Main result visual or table |  | data_analyst / method_task | candidate | pending |
| Diagnostic visual or table |  | data_analyst / method_task | candidate | pending |
| Sensitivity or robustness section |  | method_lead / method_task | candidate | pending |
| Method module appendix |  | method_task | candidate | pending |
| Code and reproducibility appendix |  | data_analyst / report_writer | candidate | pending |
| Executive summary |  | main / report_writer | candidate | pending |

## Report Asset Plan

Use this table before drafting any substantive model-based, diagnostic, exploratory, or causal report. Required data-dependent visuals must come from authorized analysis or report-asset work.

| Asset need | Required? | Owner or route | Status | Path or omission reason | Report placement |
|---|---|---|---|---|---|
| Main result visual or table | yes / no | data_analyst / method_task / report_writer | ready / missing / blocked / omitted |  | main text |
| Key diagnostic visual or table | yes / no | data_analyst / method_task | ready / missing / blocked / omitted |  | main text / appendix |
| Method-sensitive figure | yes / no | method_task / analysis code | ready / missing / blocked / omitted |  | main text / appendix |
| Inline causal-structure sketch | yes / no | causal_gatekeeper | not_required / ready / missing / blocked / omitted_by_user |  | main text / appendix / omitted |
| Expanded DAG, timing, or role artifact | yes / no | method_lead / causal_gatekeeper / report_writer | ready / missing / blocked / omitted |  | main text / appendix |
| Estimand or model formula cue | yes / no | method_lead / method_task / report_writer | ready / missing / blocked / omitted |  | main text / appendix |
| Citation/source notes | yes / no | domain_expert / method_task / report_writer | ready / missing / blocked / omitted |  | references |
| Narrative cues | yes / no | report_writer / owner reviewers | ready / missing / blocked / omitted |  | all major evidence sections |

## Manuscript Argument Plan

Use this before drafting the final HTML. Each major section should advance the causal argument rather than list artifacts.

Use this table as the paragraph plan for the report. A polished report should explain why each section matters, what causal reasoning is being used, what evidence supports it, and what remains limited.

| Section | Section thesis | Reasoning needed | Required equation or target | Required citations/source notes | Display item | Alternative or pitfall note | Limitation to state | Status |
|---|---|---|---|---|---|---|---|---|
| Main answer |  |  | yes / no / omitted |  |  |  |  | ready / missing / terse_by_user_request |
| Causal estimand and mathematical target |  |  | yes / no / omitted |  |  |  |  | ready / missing / terse_by_user_request |
| Data reality and provenance |  |  | yes / no / omitted |  |  |  |  | ready / missing / terse_by_user_request |
| Method rationale, alternatives, and pitfalls |  |  | yes / no / omitted |  |  |  |  | ready / missing / terse_by_user_request |
| Causal structure and assumptions |  |  | yes / no / omitted |  |  |  |  | ready / missing / terse_by_user_request |
| Results and evidence |  |  | yes / no / omitted |  |  |  |  | ready / missing / terse_by_user_request |
| Diagnostics and sensitivity |  |  | yes / no / omitted |  |  |  |  | ready / missing / terse_by_user_request |
| Interpretation and next decisions |  |  | yes / no / omitted |  |  |  |  | ready / missing / terse_by_user_request |
| Planning-only report note |  |  | yes / no / omitted |  |  |  |  | ready / missing / not_applicable |

## Planned Display Items

| Display item | Type | Evidence role | Question answered | Source/path | Headline | Interpretation | Limitation | Placement | Status |
|---|---|---|---|---|---|---|---|---|---|
| Main result table or figure | figure / table | main result |  |  |  |  |  | main text | planned |
| Key diagnostic table or figure | figure / table | trust/robustness |  |  |  |  |  | main text / appendix | candidate |
| Inline causal-structure sketch | inline sketch | claim boundary |  | causal_gatekeeper.causal_structure_sketch |  |  |  | main text / appendix | not_required / ready / missing / blocked / omitted_by_user |
| Expanded DAG/timing/role artifact | figure / table | causal structure |  |  |  |  |  | main text / appendix | candidate |
| Discovery graph or stability artifact | figure / table | exploratory |  |  |  |  |  | appendix | candidate |

## Table And Artifact Placement

| Table or artifact | Placement | Reason | External path if separate |
|---|---|---|---|
| Key estimate table | embedded main text / embedded appendix / external | compact / large / reproducibility / user requested |  |
| Propensity or diagnostic summary | embedded main text / embedded appendix / external | compact / large / reproducibility / user requested |  |
| Balance or role-card table | embedded main text / embedded appendix / external | compact / large / reproducibility / user requested |  |
| Bootstrap draws or per-unit outputs | external / omitted | large / reproducibility / not needed |  |

## Citation Ledger

List only sources that are inspected, user-provided, or explicitly routed for bounded source review. Do not invent citations.

| Claim, method, software, dataset fact, or domain statement | Source or artifact inspected | Citation status | Report placement |
|---|---|---|---|
|  |  | ready / missing / not_needed / user_supplied / blocked | main text / appendix / references |

## Narrative Section Checks

Every major evidence section should have prose, not only tables.

| Section | Setup | Reasoning | Display interpretation | Limitation or "what not to prove" | Status |
|---|---|---|---|---|---|
| Main answer |  |  |  |  | ready / missing / terse_by_user_request |
| Data reality |  |  |  |  | ready / missing / terse_by_user_request |
| Method and assumptions |  |  |  |  | ready / missing / terse_by_user_request |
| Results |  |  |  |  | ready / missing / terse_by_user_request |
| Diagnostics and sensitivity |  |  |  |  | ready / missing / terse_by_user_request |
| Interpretation and next steps |  |  |  |  | ready / missing / terse_by_user_request |

## Reproducibility And Report QA

| QA item | Required when | Status | Notes |
|---|---|---|---|
| Source script or notebook path | code supports results, diagnostics, tables, or figures | pending / ready / missing / not applicable | Use the actual `.py`, `.R`, `.ipynb`, `.do`, `.sas`, or other executable path. |
| Analysis unit folder and manifest | any executed analysis included in report | pending / ready / missing / not applicable | Use `outputs/analyses/NNN_unit_id/manifest.json`. |
| Final HTML report path | any final report | pending / ready / missing | Use `outputs/reports/final_report_*.html`. |
| Report asset plan | substantive analysis report | pending / ready / missing / not applicable | Required visuals/tables, citations, and narrative cues resolved. |
| Causal structure sketch | causal/timing/adjustment logic is load-bearing | not_required / ready / missing / blocked / omitted_by_user | Must come from causal_gatekeeper; missing/blocked blocks polished causal or adjusted reports. |
| Citation ledger | named methods, software, data docs, or domain precedent used | pending / ready / missing / not applicable |  |
| Narrative section checks | substantive final report | pending / ready / missing / terse_by_user_request | Major evidence sections cannot be table-only. |
| HTML report QA | final HTML report produced | pending / passed / needs revision / not applicable | Check duplicate title, wrapper/container, tables, links, source script/artifact links, and visible claim boundary. |
| External artifact index | external artifacts exist | pending / ready / missing / not applicable |  |
| Owner review | substantive claims or evidence | pending / ready / missing |  |

## Missing Or Stale Assets

| Asset | Needed for | Owner to refresh | Status | Notes |
|---|---|---|---|---|
|  |  |  | missing / stale / blocked |  |

## Owner Review

| Reviewer | Sections or assets to check | Status | Notes |
|---|---|---|---|
| data_analyst | data facts, provenance, tables, figures, diagnostics, code paths | pending |  |
| method_lead | estimand, method framing, assumptions, statistical evidence | pending |  |
| domain_expert | construct meaning, interpretation, wording, external validity | pending |  |
| method/task subskills | their own modules, diagnostics, and limits | pending |  |
| causal_discovery | discovery module, graph artifacts, diagnostics, and exploratory wording | pending |  |

## Next User Question

[One question main should ask before drafting or expanding optional report work.]

## Final HTML Delivery

[Record the final `outputs/reports/final_report_*.html` path, HTML QA status, included actions, and the one user-facing delivery sentence main should use.]
