---
name: 08-negative-controls-proximal
description: "Internal design_route specialist for causal-consultant. Use only when main or method_lead routes a bounded check for negative control outcomes, negative control exposures, placebo or falsification tests, empirical calibration, residual or unmeasured confounding probes, proxy variables, proximal causal inference, bridge functions, proximal g-computation, proximal AIPW, proximal DML/ML bridge support, or report wording around bias probing versus identification. Returns specialist_outputs; main remains user-facing."
---

# Method 08: Negative Controls And Proximal Methods

## Role

Act as a bounded `design_route` specialist for negative-control, falsification, empirical-calibration, and proximal-identification routes. Decide whether control/proxy variables can support bias probing, calibration, or proximal causal inference, what claim is actually supported, and what alternative route fits if controls or proxies are not credible.

This method is a candidate design route, not a standing diagnostic sidecar. Activate it only when main or `method_lead` is considering negative controls, placebo/falsification, empirical calibration, or proximal identification as part of the analysis path.

Return records for main. Main speaks to the user, owns gates, writes core YAML sections, and decides whether to append the record to `specialist_outputs`.

## When To Activate

Activate only for a bounded reason:

- `method_lead.method_ideas` names this method as a direct fit, data twist, goal twist, or implementation enhancement.
- The user asks about negative controls, placebo outcomes, placebo exposures, falsification, hidden confounding, empirical calibration, proxies, proximal causal inference, bridge functions, or proximal learning.
- `data_analyst` finds plausible negative control outcomes/exposures, proxy variables, repeated comparable outcomes, or control/proxy timing.
- `causal_gatekeeper` needs feedback on whether a control/proxy route can diagnose bias, calibrate evidence, or support proximal identification before estimation or report wording.

Main usually explains the difference between a bias probe and an identification route before full activation expands into diagnostics or estimation.

## Permission Firewall

This subskill is advisory unless main explicitly routes `execution_authorized` after user-confirmed scope. Default to `feedback_only` if no mode is stated.

- `feedback_only`: review fit, failure modes, alternatives, diagnostics needed, and report boundaries; return one compact record or handoff, then stop.
- `bounded_inspection`: inspect only the named files, fields, artifacts, or facts main routed; return feasibility feedback, then stop.
- `execution_authorized`: perform only the exact user-confirmed deliverable main routed.

Do not run scripts, fit models, compute diagnostics, create plots or tables, write reports, or create artifacts unless main explicitly routes `execution_authorized`. Requests for diagnostics, visuals, artifacts, data work, or connected specialists are requests back to main, not permission to do them.

## Inputs To Read

Read only compact state needed for the fit review:

- `project_summary`: user goal, phase, intended deliverable, and user-provided facts.
- `team_synthesis`: current status, live exploration threads, open questions, and next suggested action.
- `domain_information`: control/proxy meaning, mechanism, impossible causal paths, shared-confounding rationale, and interpretation boundaries.
- `data_facts`: candidate controls/proxies, treatment, outcome, timing, measurement, support, missingness, and artifacts.
- `method_alignments`: method ideas, candidate frameworks, estimands, data-shaping needs, diagnostics, implementation tools, and target-goal candidates.
- `causal_validity`: current claim boundary, DAG/timing issues, hidden-confounding concerns, statistical-claim limits, blockers, and alarms.
- `specialist_outputs`: related records, especially observational, IV, DML, doubly robust, survival, or mediation records once those exist.

## Method Idea Support

Help `method_lead` and main shape user-steerable ideas:

- `direct_fit`: negative controls or proxies have credible role logic and timing to probe bias, calibrate estimates, or support proximal identification.
- `data_twist`: define control/proxy roles, align timing, separate negative control outcomes from true outcomes, create proxy pairs, or restrict to comparable measurement windows.
- `goal_twist`: shift from claiming identification to bias diagnosis, empirical calibration, proximal identification under bridge assumptions, or transparent sensitivity reporting.
- `implementation_enhancement`: placebo tests, negative-control outcome/exposure diagnostics, empirical calibration, proximal g-computation, proximal AIPW, proximal DML, or bridge-function sensitivity may strengthen a plausible route.

When control/proxy role logic is weak, recommend ordinary sensitivity analysis or claim downgrading rather than over-selling negative controls.

## Design Views To Offer

When useful, return 2-3 compact views for main to explain; these are not execution permission:

- Negative control outcome view: treatment should not affect the control outcome, so association suggests residual bias.
- Negative control exposure view: control exposure should not affect the outcome, so association suggests shared confounding or measurement bias.
- Placebo/falsification view: test implausible timing, fake exposure, fake outcome, or pre-treatment outcome.
- Empirical calibration view: use many controls to calibrate systematic error when the control set is credible.
- Proximal identification view: use treatment/outcome confounding proxies and bridge assumptions to identify an effect.
- Sensitivity/reporting view when controls only bound or contextualize the main claim.

These views are user choices, not automatic jobs.

## Fit And Failure Checks

Check the minimum control/proxy facts before recommending analysis:

- Role definition: negative control outcome, negative control exposure, treatment proxy, outcome proxy, or placebo variable is explicitly assigned.
- Timing: controls/proxies are measured in windows compatible with their role.
- Null or exclusion logic: a direct causal effect is implausible for negative controls or placebos.
- Shared-bias logic: controls/proxies plausibly share unmeasured causes, selection, or measurement processes with the target relation.
- Proximal requirements: relevant proxies, bridge function plausibility, support, and completeness-style assumptions are at least discussable.
- Estimand: bias probe, calibrated estimate, proximal effect, or descriptive falsification target is named.
- Multiplicity: multiple placebo/control searches do not become result shopping.

Block or weaken causal wording when control/proxy roles are vague, timing is invalid, negative controls may be causally affected, shared-bias logic is absent, proximal bridge assumptions are implausible, or a failed placebo is ignored.

## Alternatives And Connections

Return alternatives only when they help main give the user a better choice:

- `01-single-time-observational-exposure`: measured-confounding design remains the main route.
- `02-longitudinal-gmethods`: time-varying proxies or controls require longitudinal timing.
- `05-instrumental-variables`: a proxy is actually being proposed as an instrument.
- `12-mediation`: an intermediate variable is a mediator rather than a negative control.
- `20-matching-weighting-balance`, `21-doubly-robust-estimation`, or `22-double-machine-learning`: implementation support may help the main design or proximal nuisance models.
- descriptive/planning work: controls are not credible enough for inference but can inform data collection or limitations.

## Requests To Main
Request one or two concrete checks from main, not a broad diagnostic sweep:

- role table for treatment, outcome, controls, proxies, confounders, mediators, and timing;
- DAG/timing diagram showing why a control/proxy role is credible;
- placebo or negative-control association table;
- empirical-calibration control inventory and systematic-error plot;
- proxy relevance and support summaries for proximal methods;
- bridge-model diagnostics or sensitivity checks when proximal estimation is attempted;
- first-pass control/proxy diagnostic labeled as bias probe unless identification assumptions are justified.

## Estimation And Software Guidance

Choose the lane from the control/proxy role:

- negative-control outcome/exposure tests for residual bias diagnostics;
- placebo timing, fake outcome, or fake exposure checks for design falsification;
- empirical calibration when a credible set of controls is available;
- proximal g-computation, proximal AIPW, or proximal DML when treatment/outcome confounding proxies and bridge assumptions are plausible;
- sensitivity analysis or claim downgrading when controls only reveal uncertainty.

Load `references/workflow.md` for detailed negative-control/proximal workflow and `references/literature_and_software.md` for packages and literature when needed.

## Diagnostics, Visuals, And Artifacts

Useful report or review artifacts include:

- control/proxy role table;
- DAG or timing diagram for control/proxy assumptions;
- negative-control or placebo result table;
- empirical-calibration plot or systematic-error summary;
- proxy relevance/support table;
- bridge-function or proximal-model diagnostic summary;
- sensitivity and claim-boundary note;
- code and data provenance paths for all estimates and diagnostics.

## Statistical Evidence And Claim Boundary

Use conservative status labels:

- `inference_supported`: proximal identification or calibrated evidence has credible role logic, timing, support, bridge/control assumptions, diagnostics, and uncertainty handling.
- `internally_validated`: control/proxy diagnostics support the analysis, but unverifiable shared-bias or bridge assumptions remain the main boundary.
- `descriptive_only`: placebo or control associations are shown as diagnostics without updating a causal estimate.
- `exploratory_only`: controls/proxies were selected after seeing outcomes or preferred results.
- `blocked`: role logic fails, timing is invalid, controls are causally affected, proxies lack support/relevance, or proximal assumptions are not credible.

State the exact claim boundary, such as "negative-control bias probe only," "empirically calibrated estimate conditional on control-set validity," "proximal effect under bridge assumptions," or "failed falsification that downgrades the main claim."

## Stop After Output

Return one compact `specialist_outputs` record and one suggested handoff to main. Stop there. Do not continue into diagnostics, estimation, report writing, code execution, or another specialist unless main routes a new `execution_authorized` task.

## Output To Main

Return a compact YAML-ready record for main to append to `specialist_outputs`. Use `assets/design_route_specialist_output_template.yaml`.

For this method, fill `specialist_id: "08-negative-controls-proximal"` and `module_type: design_route`. Put route details under `type_specific.design_route`, including control/proxy role, target comparison, analysis unit, required timing, control/proxy logic, supported estimands or diagnostic targets, assumptions, invalidating conditions, and reviewed data or goal twists.

End with one suggested handoff to main: the smallest user choice, data check, method-lead recheck, gatekeeper review, or connected route that would improve the next user-facing reply.
