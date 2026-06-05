# Report Plan

Use this as a private modular report plan. It is not a released report.

## Report Purpose

- User goal:
- Intended audience:
- Deliverable type:
- Claim boundary:
- Report status: planned / drafting / needs_assets / owner_review / ready / blocked

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
| Unresolved diagnostics | Show what still affects trust | data_analyst / method_subskill / causal_gatekeeper | planned |
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
| Dependency/package decisions |  |  | main / data_analyst / method_subskill | completed / qualified / missing / stale / blocked | reproducibility |
| Material deviations |  |  | main / owner reviewer | completed / qualified / missing / stale / blocked | main text / reproducibility |
| Pending user intents |  |  | main | resolved / declined / blocked / parked_for_report / missing | main text / appendix / omitted |
| Consultant alternatives |  |  | main / method_lead | resolved / declined / blocked / parked_for_report / missing | main text / appendix / omitted |
| Results and diagnostics |  |  | data_analyst / method_subskill | completed / qualified / missing / stale / blocked | main text / appendix |
| Interpretation and next steps |  |  | main / domain_expert / method_lead | completed / qualified / missing / stale / blocked | main text |

## Core Components Included By Default

| Component | Evidence basis | Owner | Status | Notes |
|---|---|---|---|---|
| Main answer and evidence status |  | main / report_writer | planned |  |
| Original and refined causal question |  | main / method_lead | planned |  |
| Data reality and provenance |  | data_analyst | planned |  |
| Causal framework, estimand, and assumptions |  | method_lead / causal_gatekeeper | planned |  |
| Results, figures, and tables |  | data_analyst / method_subskill | planned |  |
| Diagnostics, sensitivity, and robustness |  | data_analyst / method_subskill / causal_gatekeeper | planned |  |
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

Offer one or two at a time through main.
The plan may track several candidates, but feedback to main should surface only one or two choices for the next user turn.

| Optional component | Why it may help | Needed asset or owner | Status | User choice |
|---|---|---|---|---|
| Expanded DAG, timing diagram, or role table |  | causal_gatekeeper / method_lead / report_writer | candidate | pending |
| Exploratory causal discovery module |  | causal_discovery / method_lead / causal_gatekeeper | candidate | pending |
| Main result visual or table |  | data_analyst / method_subskill | candidate | pending |
| Diagnostic visual or table |  | data_analyst / method_subskill | candidate | pending |
| Sensitivity or robustness section |  | method_lead / method_subskill | candidate | pending |
| Method module appendix |  | method_subskill | candidate | pending |
| Code and reproducibility appendix |  | data_analyst / report_writer | candidate | pending |
| Executive summary |  | main / report_writer | candidate | pending |

## Report Asset Plan

Use this table before drafting any substantive model-based, diagnostic, exploratory, or causal report. Required data-dependent visuals must come from authorized analysis or report-asset work.

| Asset need | Required? | Owner or route | Status | Path or omission reason | Report placement |
|---|---|---|---|---|---|
| Main result visual or table | yes / no | data_analyst / method_subskill / report_writer | ready / missing / blocked / omitted |  | main text |
| Key diagnostic visual or table | yes / no | data_analyst / method_subskill | ready / missing / blocked / omitted |  | main text / appendix |
| Method-sensitive figure | yes / no | method_subskill / analysis code | ready / missing / blocked / omitted |  | main text / appendix |
| Inline causal-structure sketch | yes / no | causal_gatekeeper | not_required / ready / missing / blocked / omitted_by_user |  | main text / appendix / omitted |
| Expanded DAG, timing, or role artifact | yes / no | method_lead / causal_gatekeeper / report_writer | ready / missing / blocked / omitted |  | main text / appendix |
| Citation/source notes | yes / no | domain_expert / method_subskill / report_writer | ready / missing / blocked / omitted |  | references |
| Narrative cues | yes / no | report_writer / owner reviewers | ready / missing / blocked / omitted |  | all major evidence sections |

## Planned Visuals And Tables

| Asset | Role in report | Source/path | Owner | Status | Caption or description needed |
|---|---|---|---|---|---|
| Main result table or figure | main evidence |  | data_analyst / method_subskill | planned | yes |
| Key diagnostic table or figure | trust/robustness |  | data_analyst / method_subskill | candidate | yes |
| Inline causal-structure sketch | claim boundary | causal_validity.dag_and_timing.causal_structure_sketch | causal_gatekeeper | not_required / ready / missing / blocked / omitted_by_user | yes |
| Expanded DAG/timing/role artifact | complex graph or user-requested visual |  | method_lead / causal_gatekeeper / report_writer | candidate | yes |
| Discovery graph or stability artifact | exploratory appendix |  | causal_discovery | candidate | yes |

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

| Section | Why included | Reader takeaway | Limitation or "what not to prove" | Status |
|---|---|---|---|---|
| Main answer |  |  |  | ready / missing / terse_by_user_request |
| Data reality |  |  |  | ready / missing / terse_by_user_request |
| Method and assumptions |  |  |  | ready / missing / terse_by_user_request |
| Results |  |  |  | ready / missing / terse_by_user_request |
| Diagnostics and sensitivity |  |  |  | ready / missing / terse_by_user_request |
| Interpretation and next steps |  |  |  | ready / missing / terse_by_user_request |

## Reproducibility And Report QA

| QA item | Required when | Status | Notes |
|---|---|---|---|
| Source script or notebook path | code supports results, diagnostics, tables, or figures | pending / ready / missing / not applicable | Use the actual `.py`, `.R`, `.ipynb`, `.do`, `.sas`, or other executable path. |
| Final HTML report path | any final report | pending / ready / missing | Use `final_report_*.html`. |
| Report asset plan | substantive analysis report | pending / ready / missing / not applicable | Required visuals/tables, citations, and narrative cues resolved. |
| Causal structure sketch | causal/timing/adjustment logic is load-bearing | not_required / ready / missing / blocked / omitted_by_user | Must come from causal_validity; missing/blocked blocks polished causal or adjusted reports. |
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

[Record the final `final_report_*.html` path, HTML QA status, and the one user-facing delivery sentence main should use.]
