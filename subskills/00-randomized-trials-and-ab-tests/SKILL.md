---
name: 00-randomized-trials-and-ab-tests
description: "Internal design_route specialist for causal-consultant. Use only when main or method_lead routes a bounded check for randomized trials, A/B tests, experiments, encouragement or lottery assignment, cluster or blocked randomization, ITT/CACE framing, assignment integrity, attrition, compliance, randomization inference, CUPED/ANCOVA precision, or experiment report support. Returns specialist_outputs; main remains user-facing."
---

# Method 00: Randomized Trials And A/B Tests

## Role

Act as a bounded `design_route` specialist for randomized assignment. Decide whether the current data and user goal can honestly use an experiment or A/B-test design, what estimand the randomization supports, what checks are still needed, and what alternatives fit if the data are not truly randomized.

This method is restrictive by design. Its first contribution is fit discipline: verify assignment before treating a comparison as experimental.

Return records for main. Main speaks to the user, owns gates, writes core YAML sections, and decides whether to append the record to `specialist_outputs`.

## When To Activate

Activate only for a bounded reason:

- `method_lead.method_ideas` names this method as a direct fit, data twist, goal twist, or implementation enhancement.
- The user asks about a trial, A/B test, randomized assignment, experiment, lottery, holdout, encouragement, variant, or arm.
- `data_analyst` finds assignment logs, arms, allocation probabilities, randomization unit, or experiment metadata.
- `causal_gatekeeper` needs experiment-specific claim discipline before estimation, report wording, or a causal claim upgrade.

Main usually presents the method idea to the user first. Full activation is appropriate when the user chooses this direction, the next check is small and bounded, or validity/report wording depends on experiment-specific feedback.

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
- `domain_information`: intervention meaning, unit meaning, ethical/practical constraints, usual endpoints, and interpretation boundaries.
- `data_facts`: sources, row and analysis unit, candidate variables, timing map, claim-data consistency, missingness, support, grouping/dependence, processing paths, and artifacts.
- `method_alignments`: method ideas, candidate frameworks, estimands, data-shaping needs, diagnostics, and implementation tools.
- `causal_validity`: current claim boundary, DAG/timing issues, statistical-claim limits, blockers, and alarms.
- `specialist_outputs`: related method records, especially IV, interference, heterogeneity, transportability, DML, matching/weighting, or survival records once those exist.

## Method Idea Support

Help `method_lead` and main shape these user-steerable ideas:

- `direct_fit`: assignment is plausibly randomized and can support an ITT-style comparison.
- `data_twist`: data may need reshaping to assignment unit, eligible population, original arm, cluster, block, time-zero, or prespecified outcome window.
- `goal_twist`: user wants treatment receipt, subgroup effects, targeting, transport, survival, or policy claims, while the experiment mainly supports assignment effects unless another module is added.
- `implementation_enhancement`: randomization inference, cluster-aware uncertainty, ANCOVA/CUPED, multiplicity handling, IV/CACE, DML, or heterogeneity tools may strengthen a valid experiment route.

When the data do not fit this method, suggest a nearby route rather than forcing an experiment label.

## Design Views To Offer

When useful, return 2-3 compact views for main to explain; these are not execution permission:

- Clean ITT/randomized comparison when assignment is verified, time zero is clear, and the analysis set preserves the randomized contrast.
- Noncompliance or encouragement/CACE route when assignment is randomized but treatment receipt is not.
- Precision or diagnostic enhancement when CUPED/ANCOVA, blocking, randomization inference, SRM, attrition, compliance, or cluster-aware checks would change trust in the result.
- Descriptive or design-audit fallback when randomization cannot be verified but the data can still clarify feasibility.

These views are user choices, not automatic jobs.

## Fit And Failure Checks

Check the minimum experiment facts before recommending analysis:

- Assignment mechanism: complete, Bernoulli, blocked, stratified, clustered, paired, factorial, encouragement, lottery, rollout, or unknown.
- Assignment unit and analysis unit: whether they match or require cluster, pair, block, repeated-measure, or aggregation handling.
- Eligibility and time zero: who entered, when assignment happened, when exposure could occur, and when follow-up begins.
- Arms and probabilities: treatment/control/variant definitions, allocation probabilities, holdouts, and sample-ratio integrity.
- Estimand: ITT by assignment, CACE/LATE for noncompliance, cluster-level effect, subgroup effect, triggered-user contrast, or descriptive/adapted target.
- Analysis set: whether exclusions, triggered filters, missing outcomes, attrition, or per-protocol restrictions happen after assignment.
- Compliance and exposure: uptake, crossover, contamination, noncompliance, encouragement receipt, and treatment exposure.
- Outcome and follow-up: outcome timing, missingness, censoring, measurement, and primary versus exploratory outcomes.
- Operational integrity: assignment log, SRM, peeking, multiple variants, guardrails, novelty effects, and logging errors.

Block or weaken causal wording when randomization cannot be verified, timing is unclear, post-assignment selection drives the result, missing outcomes differ by arm, interference is material, treatment receipt is analyzed as if randomized, or the analysis ignores the assignment unit.

## Alternatives If It Does Not Fit

Return an alternative only when it helps main give the user a better choice:

- `01-single-time-observational-exposure`: assigned groups are actually self-selected or observational.
- `05-instrumental-variables`: assignment encourages treatment receipt but treatment itself is not fully compliant.
- `07-interference-spillovers`: treatment of one unit can affect another unit.
- `10-heterogeneous-effects`: the experiment is valid but the user wants subgroup/CATE learning.
- `11-point-treatment-rules`: the user wants targeting or a one-time decision rule from experimental data.
- `14-transportability-generalizability`: the user wants a target-population claim beyond the randomized sample.
- `21-doubly-robust-estimation` or `22-double-machine-learning`: the experiment is valid and flexible nuisance, precision, or heterogeneity support is useful.
- descriptive/planning work: no valid experiment route exists yet, but the data can still summarize associations or design requirements.

## Requests To Main
Ask for one or two concrete checks, not an open-ended diagnostic sweep:

- assignment counts, allocation probabilities, and sample-ratio mismatch check;
- experiment-flow table from eligible to assigned to analyzed units;
- baseline balance using pre-assignment variables only;
- missing outcome, attrition, compliance, crossover, and exposure by assigned arm;
- cluster/block/paired structure, cluster counts, cluster sizes, and ICC when relevant;
- original-arm ITT estimate with uncertainty matched to the randomization unit;
- multiplicity inventory for many outcomes, variants, subgroups, or windows;
- CUPED/ANCOVA feasibility when pre-period outcomes or strong baseline covariates exist.

## Estimation And Software Guidance

Prefer transparent estimators when randomization is intact:

- difference in means or regression with robust standard errors for simple individual randomization;
- block/strata/paired analyses that respect the assignment scheme;
- cluster-level analysis or cluster-robust inference for cluster assignment or dependence;
- randomization or permutation inference when the assignment mechanism is known and sample size is small or constrained;
- ANCOVA, Lin-style adjustment, or CUPED when covariates are pre-treatment and the estimand remains ITT;
- IV/CACE/LATE support when assignment affects receipt but receipt is not fully compliant.

Load `references/workflow.md` for detailed experiment workflow and `references/literature_and_software.md` for packages and literature when needed.

## Diagnostics, Visuals, And Artifacts

Useful report or review artifacts include:

- assignment and analysis-set flow table;
- assignment-count and SRM table or plot;
- baseline balance table;
- missingness/attrition/compliance table by arm;
- cluster/block/unit-of-analysis summary;
- primary ITT result table;
- randomization-inference or permutation-test output when used;
- multiplicity or exploratory-outcome inventory;
- code and data provenance paths for all estimates and diagnostics.

## Statistical Evidence And Claim Boundary

Use conservative status labels:

- `inference_supported`: randomization is verified, analysis set preserves the estimand, uncertainty matches assignment/dependence, and multiplicity or sequential issues are addressed or irrelevant.
- `internally_validated`: randomization is intact but the claim relies on secondary, subgroup, adjusted, ML-assisted, or internally validated evidence.
- `descriptive_only`: arm summaries, balance, compliance, attrition, or process evidence without a causal effect estimate.
- `exploratory_only`: unplanned subgroup, triggered, outcome-window, guardrail, ML-selected, or multiplicity-affected findings.
- `blocked`: assignment cannot be verified, SRM/logging failure threatens randomization, post-assignment selection drives the result, missing outcomes are severe and unaddressed, or the randomization unit is ignored.

State the exact claim boundary, such as "ITT for randomized eligible units," "CACE under IV assumptions," "triggered-subset descriptive contrast," or "exploratory subgroup pattern only."

## Stop After Output

Return one compact `specialist_outputs` record and one suggested handoff to main. Stop there. Do not continue into diagnostics, estimation, report writing, code execution, or another specialist unless main routes a new `execution_authorized` task.

## Output To Main

Return a compact YAML-ready record for main to append to `specialist_outputs`. Use `assets/design_route_specialist_output_template.yaml`.

For this method, fill `specialist_id: "00-randomized-trials-and-ab-tests"` and `module_type: design_route`. Put experiment-specific route details under `type_specific.design_route`, including assignment mechanism, assignment unit, analysis unit, time zero or assignment index, supported estimands, and invalidating conditions.

End with one suggested handoff to main: the smallest user question, data check, method-lead recheck, gatekeeper review, or alternative route that would improve the next user-facing reply. Main owns whether that handoff becomes `team_synthesis.next_suggested_action`, `open_questions`, or `exploration_threads`.
