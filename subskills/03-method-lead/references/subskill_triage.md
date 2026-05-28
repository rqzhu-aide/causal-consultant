# Subskill Triage Reference

Use this reference when raw method/job subskill candidates are broad, when activation is being considered, or when a candidate may change causal strategy, selected framework, estimand set, `causal_structure`, claim strength, gate status, or report wording.

Do not load this reference for ordinary exploration when a short option map is enough.

## Core Rule

Treat script- or lead-suggested subskills as recall hints, not decisions. `method_lead` is the causal-method decision point. Do not copy a raw candidate list into `method_lead` just because terms matched.

Triage candidates after reading `domain_expert`, `data_analyst.analysis_alignment`, `data_analyst.method_support`, `team_synthesis`, `analysis_state`, relevant `subskill_records`, user goal, current phase, and the existing causal question/framework fields.

## Field Use

- `candidate_method_subskills`: plausible, triaged candidates that may help the current framework choice, target goal, diagnostics, or implementation. Include the role each candidate would play and the fact that would make it useful.
- `selected_method_subskills`: candidates ready to activate, rely on, or use as durable specialist support because they fit the current causal question, estimand, design/data structure, and next practical step.
- `blocked_or_not_used_options`: candidates that matched keywords or were tempting but fail causal, domain, data, timing, support, estimand, or phase logic. State the reason briefly.

## Candidate Roles

- `design_route`: asks what identification structure the project has, such as randomized assignment, observational adjustment, longitudinal g-methods, DiD, RD, IV, synthetic control/time series, interference, or negative-control/proximal support. Usually keep at most one primary design route active unless the project is truly multi-design.
- `target_goal`: asks what the user wants to estimate or learn, such as heterogeneity, treatment rules, mediation, dose-response, transportability, or dynamic policies. Multiple target goals may be preserved, but mark primary versus secondary/exploratory.
- `implementation_support`: asks what estimation, modeling, diagnostic, or outcome-scale machinery could support a chosen design/target, such as matching/weighting, doubly robust estimation, DML, or survival support. These should usually layer onto a selected framework rather than drive the framework choice.

## Triage Output

Classify important candidates as `direct`, `adapted`, `exploratory`, `watchlist`, `blocked`, or `not_applicable`.

Prefer a small, decision-useful set: one primary design-route candidate when possible, the active target goal(s), and only the implementation-support modules that would change the next step.

If the raw candidate list is broad, return only the decision-relevant summary to the lead consultant: primary route or target, why it fits, what facts could change it, which support modules are optional, which tempting options are blocked, and the smallest next information need.

The lead consultant may coordinate lookup and user communication, but should not overrule this triage based on raw candidate scores. If `domain_expert` or `data_analyst` records new facts that change construct meaning, timing, support, variable construction, feasibility, or `analysis_alignment`, re-triage before selecting or activating a method/job subskill.
