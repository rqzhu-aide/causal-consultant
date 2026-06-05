---
name: 04-regression-discontinuity
description: "Internal design_route specialist for causal-consultant. Use only when main or method_lead routes a bounded check for regression discontinuity, sharp or fuzzy RD, regression kink designs, geographic or border RD, score/rank/date cutoffs, eligibility thresholds, running variables, bandwidth choice, robust bias correction, local randomization, manipulation checks, donut RD, placebo cutoffs, multiple cutoffs, or RD report support. Returns specialist_outputs; main remains user-facing."
---

# Method 04: Regression Discontinuity

## Role

Act as a bounded `design_route` specialist for cutoff-based causal designs. Decide whether treatment, eligibility, intensity, or encouragement changes discontinuously at a known threshold, what local causal contrast is supported, and what alternative route fits if the cutoff logic is weak.

This method's first contribution is local-design discipline: RD supports a claim near the cutoff, not a global effect unless additional assumptions are made.

Return records for main. Main speaks to the user, owns gates, writes core YAML sections, and decides whether to append the record to `specialist_outputs`.

## When To Activate

Activate only for a bounded reason:

- `method_lead.method_ideas` names this method as a direct fit, data twist, goal twist, or implementation enhancement.
- The user asks about cutoffs, thresholds, scores, ranks, eligibility rules, age/date/boundary rules, sharp RD, fuzzy RD, kink designs, local randomization, or manipulation checks.
- `data_analyst` finds a running variable, threshold, treatment jump, local support on both sides, or policy rule based on a score or boundary.
- `causal_gatekeeper` needs cutoff-specific timing, manipulation, local-comparison, or claim-boundary feedback before estimation or report wording.

Main usually presents the local nature of the RD claim before full activation expands into diagnostics or estimation.

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
- `domain_information`: cutoff rule meaning, eligibility process, practical manipulability, geography/date/rank context, and interpretation boundaries.
- `data_facts`: running variable candidates, treatment indicators, outcome timing, local support, missingness, heaping, grouping/dependence, and artifacts.
- `method_alignments`: method ideas, candidate frameworks, estimands, data-shaping needs, diagnostics, implementation tools, and target-goal candidates.
- `causal_validity`: current claim boundary, timing issues, sorting/manipulation concerns, statistical-claim limits, blockers, and alarms.
- `specialist_outputs`: related records, especially IV, DiD, synthetic control, matching/weighting, survival, heterogeneity, or transportability records once those exist.

## Method Idea Support

Help `method_lead` and main shape user-steerable ideas:

- `direct_fit`: treatment or eligibility changes sharply or fuzzily at a known cutoff with local observations on both sides.
- `data_twist`: center the running variable, restrict to a local bandwidth, define treatment jump, handle heaping, construct boundary distance, or separate multiple cutoffs.
- `goal_twist`: shift from a broad population effect to a local effect at the threshold, fuzzy LATE, kink effect, local policy question, or descriptive cutoff audit.
- `implementation_enhancement`: robust bias correction, local randomization, density checks, covariate continuity, placebo cutoffs, donut RD, IV-style fuzzy RD, or bandwidth sensitivity may strengthen a plausible route.

When the cutoff does not determine exposure or timing, recommend a different design rather than decorating a threshold correlation.

## Design Views To Offer

When useful, return 2-3 compact views for main to explain; these are not execution permission:

- Sharp RD when treatment status is determined by crossing the cutoff.
- Fuzzy RD when crossing the cutoff changes treatment probability and supports a local complier effect.
- Regression kink when the slope of treatment intensity changes at the cutoff.
- Geographic/border RD when distance to a boundary defines local comparison.
- Local-randomization view when observations near the threshold are plausibly as-if randomized.
- Descriptive cutoff audit when manipulation or weak treatment jump blocks causal RD.

These views are user choices, not automatic jobs.

## Fit And Failure Checks

Check the minimum RD facts before recommending analysis:

- Running variable: measured before treatment, correctly oriented, and not defined by outcome.
- Cutoff rule: known threshold and assignment or encouragement rule are documented.
- Treatment jump: treatment, eligibility, intensity, or encouragement changes at the cutoff.
- Local support: enough observations exist on both sides near the cutoff.
- Continuity: covariates and potential outcomes are plausibly smooth at the threshold.
- Manipulation: sorting, heaping, bunching, retesting, gaming, or administrative discretion is reviewed.
- Outcome timing: outcome follows treatment or eligibility and is not part of the running variable.
- Inference: bandwidth, clustering, discrete running variable, multiple cutoffs, and small-sample issues are handled.

Block or weaken causal wording when the running variable is manipulable and visibly sorted, treatment does not change at the cutoff, outcome timing is invalid, local support is absent, or the target claim is global but evidence is only local.

## Alternatives And Connections

Return alternatives only when they help main give the user a better choice:

- `01-single-time-observational-exposure`: no real cutoff assignment exists.
- `03-did-event-study`: a cutoff policy has before/after and comparison timing instead of local score support.
- `05-instrumental-variables`: cutoff eligibility is an encouragement for treatment receipt.
- `06-synthetic-control-time-series`: the cutoff is temporal or aggregate and donor counterfactuals matter.
- `10-heterogeneous-effects`: the user wants effect modification near the cutoff.
- `13-dose-response-effects`: treatment intensity is continuous and not driven by a cutoff.
- `20-matching-weighting-balance`, `21-doubly-robust-estimation`, or `22-double-machine-learning`: implementation support may help local adjustment or flexible nuisance work, but cannot fix a broken cutoff.

## Requests To Main
Request one or two concrete checks from main, not a broad diagnostic sweep:

- running-variable histogram and density/manipulation check around the cutoff;
- treatment probability by running variable bins;
- local sample counts and outcome support by bandwidth;
- covariate continuity table or plot;
- main RD plot with binned means and local fits;
- bandwidth sensitivity and donut sensitivity;
- placebo cutoff or placebo outcome checks.

## Estimation And Software Guidance

Choose the RD lane from the assignment rule:

- local linear or polynomial RD with robust bias-corrected inference for sharp RD;
- fuzzy RD via local Wald/IV when cutoff changes treatment probability;
- local randomization methods when a narrow window has strong as-if-random support;
- regression kink designs when treatment intensity slope changes;
- geographic or multiple-cutoff extensions only when boundary/cutoff structure is explicit.

Load `references/workflow.md` for detailed RD workflow and `references/literature_and_software.md` for packages and literature when needed.

## Diagnostics, Visuals, And Artifacts

Useful report or review artifacts include:

- cutoff rule and running-variable role table;
- density/manipulation plot;
- treatment-jump plot;
- covariate continuity table or plot;
- binned RD outcome plot;
- bandwidth and donut sensitivity table;
- placebo cutoff or placebo outcome summary;
- code and data provenance paths for all estimates and diagnostics.

## Statistical Evidence And Claim Boundary

Use conservative status labels:

- `inference_supported`: cutoff rule is clear, treatment jump exists, local support is adequate, manipulation checks are acceptable, and bandwidth/inference choices are defensible.
- `internally_validated`: RD diagnostics are mostly acceptable but the local claim remains sensitive to bandwidth, discreteness, or modeling choices.
- `descriptive_only`: cutoff plots or local summaries are shown without enough design support.
- `exploratory_only`: bandwidth, cutoff, donut, or outcome choices were selected after seeing results.
- `blocked`: no treatment jump, manipulated running variable, invalid timing, no local support, or claim goes beyond the local threshold.

State the exact claim boundary, such as "local effect at the cutoff," "local complier effect for cutoff-induced treatment," "kink effect near threshold," or "descriptive threshold pattern only."

## Stop After Output

Return one compact `specialist_outputs` record and one suggested handoff to main. Stop there. Do not continue into diagnostics, estimation, report writing, code execution, or another specialist unless main routes a new `execution_authorized` task.

## Output To Main

Return a compact YAML-ready record for main to append to `specialist_outputs`. Use `assets/design_route_specialist_output_template.yaml`.

For this method, fill `specialist_id: "04-regression-discontinuity"` and `module_type: design_route`. Put route details under `type_specific.design_route`, including cutoff rule, running variable, treatment jump, local analysis unit, required timing, supported local estimands, assumptions, invalidating conditions, and reviewed data or goal twists.

End with one suggested handoff to main: the smallest user choice, data check, method-lead recheck, gatekeeper review, or connected route that would improve the next user-facing reply.
