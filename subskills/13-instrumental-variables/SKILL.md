---
name: instrumental-variables
description: "Primary route subskill for instrumental-variable designs, encouragement designs, imperfect compliance, fuzzy RD handoff, LATE/CACE estimation, first-stage diagnostics, weak-instrument checks, exclusion/independence/monotonicity audits, falsification checks, R/Python code, and route-fit feedback."
---

# Instrumental Variables

## Role

Use this as a **primary route subskill** when the route relies on an instrument or encouragement. The instrument claim is the design argument; do not accept a variable as an instrument just because it is labeled that way.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "13-instrumental-variables"`
- `role: "primary_route"` or `support_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: instrument, encouragement, noncompliance, fuzzy RD, genetic instrument, or LATE/CACE target
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: instrument, treatment, outcome, timing, covariates, unit, complier population, clusters/fixed effects, and artifacts
- `outputs_created`: IV plan, first-stage table, 2SLS script, weak-IV diagnostics, falsification/sensitivity memo, or report-ready artifact
- `diagnostics_reviewed`: first stage, weak instruments, overidentification, balance/falsification, exclusion threats, monotonicity, clustering, and finite-sample concerns
- `limitations`: weak instrument, exclusion risk, local complier estimand, monotonicity, sample overlap, or package limitations
- `feedback_for_main_skill`: whether IV assumptions and LATE/CACE language are supportable
- `requests_for_main_skill`: ask user to justify exclusion, define complier target, choose ITT versus CACE, activate randomized/RD/genomics support, or accept weaker claim language
- `readiness`: production readiness after this review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when the instrument route itself is invalid
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `activate_method_subskill`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to IV scripts, first-stage diagnostics, sensitivity outputs, or tables

## Route-Fit Check

Given the route handoff, check:

- instrument, treatment, outcome, unit, timing, comparator, population, and complier target;
- relevance/first stage, exclusion restriction, independence/as-if-randomness, monotonicity, and no direct effect;
- weak instruments, many instruments, overidentification, finite-sample concerns, clustering, and fixed effects;
- whether randomized encouragement, noncompliance, fuzzy RD, Mendelian randomization, or IV-DML needs another module;
- whether falsification or negative-control checks are available.

If the instrument is weak or assumptions are implausible, return feedback to the main skill and keep claims constrained.

## Package And Code Fit

Candidate tools include R `ivreg`, `fixest`, `ivmodel`, `AER`, Python `linearmodels`, and `DoubleML` for supported IV-DML variants. Confirm diagnostics and uncertainty for the planned estimand before using a package.

Before `production_gate.status` is ready, consider these analysis paths:

- two-stage least squares for continuous outcomes/treatments when LATE/CACE is the target;
- randomized encouragement/noncompliance CACE handoff from `05-randomized-experiments`;
- fuzzy RD local IV handoff from `12-regression-discontinuity`;
- IV with fixed effects or clustering when design and data require it;
- IV-DML only when the IV route is valid and nuisance flexibility is actually needed.

Simple sample scripts to provide or adapt:

- `examples/python_linearmodels_iv.py`
- `examples/python_doubleml_iv.py`
- `examples/r_fixest_iv.R`
- `examples/r_ivreg_diagnostics.R`
- top-level `scripts/python/linearmodels_iv_template.py`
- top-level `scripts/R/ivreg_fixest_template.R`

Post-fit diagnostics must cover:

- first-stage coefficient, partial F/statistics, and weak-instrument concern;
- reduced form and direction consistency;
- balance/falsification checks for instrument-as-if-randomness when possible;
- exclusion-restriction threats and direct-effect pathways from DAG/domain notes;
- monotonicity/plausible defier discussion;
- overidentification tests only when multiple instruments exist and interpreted cautiously;
- sensitivity to covariates, fixed effects, clustering, sample restrictions, and instrument definitions.

## Pass / Fail Output

If fit passes, produce IV estimand, diagnostic plan, code path, weak-instrument/sensitivity cautions, and reporting handoff. If fit fails, identify the failed IV condition and recommended route revision or fallback.

Main-skill feedback should include:

- whether the IV route is supportable, fragile, or blocked;
- the actual estimand, usually LATE/CACE for compliers, not an unconditional ATE;
- which IV diagnostics and assumption checks constrain interpretation;
- the next user question, if any, such as whether the user can defend exclusion or prefers ITT/descriptive reporting;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- instrument, treatment, outcome, complier/local population, and whether the estimand is LATE/CACE or another local IV effect;
- first-stage, reduced-form, 2SLS/Wald estimate, weak-IV diagnostics, and uncertainty method;
- exclusion, independence/as-if-randomness, monotonicity, overidentification, and falsification checks;
- sensitivity or caveat notes for weak instruments, pleiotropy/exclusion concerns, or limited generalizability;
- wording that clearly says "for compliers/local effect" when that is the supported estimand.

Recommend `return_to_foundation` when the instrument is not relevant, instrument timing follows treatment/outcome, exclusion is plainly implausible for the domain, independence/as-if-randomness fails with no defensible adjustment, monotonicity is impossible for the target, or the desired estimand is not a complier/local effect and no route revision has been agreed.

Stay in production with a weaker claim when the instrument is relevant but assumptions are debatable, first stage is modest, falsification checks are mixed, overidentification is concerning, or LATE/CACE generalizability is limited. Then recommend sensitivity checks, narrower complier language, or cautious causal language.

Recommend production-gate readiness only when the IV estimand, first-stage/reduced-form results, weak-IV and falsification diagnostics, assumption caveats, uncertainty method, limitations, and handoff artifacts are recorded.

## References

- `references/workflow.md`: detailed IV workflow.
- `references/iv_assumption_ledger.md`: assumption ledger.
- `references/iv_bibliography.md`: literature notes.
- `examples/`: reusable R/Python templates.
