# Statistical Validity Reference

Use this reference when method_lead needs more detail than the compact check in `SKILL.md`. Load it when interpreting estimates, diagnostics, discovered patterns, activated subskill records, or report claims; when deciding whether claim strength can be upgraded; or when a user asks whether a result is reliable.

Do not load this reference for ordinary exploration option maps unless the next reply depends on a result, diagnostic, or claim-strength decision.

## Core Rule

Every method_lead pass that interprets methods, diagnostics, results, or report claims should keep the statistical status explicit. Exploratory and in-sample outputs are allowed, but they must not be presented as stable evidence for a broader claim unless the relevant method family supplies an appropriate inferential or validation route and that route has been used or clearly planned.

Use the weakest relevant boundary from the selected framework, the data role/provenance, diagnostics, subskill records, and gates.

## Evidence Status Ladder

Use plain language in `method_lead` fields. When reading or writing a common `subskill_records.statistical_evidence.status`, preserve the package enum names:

- `exploratory_only`: useful for learning, debugging, ranking possibilities, or generating hypotheses.
- `descriptive_only`: summarizes the inspected data or current sample without broader causal or predictive claims.
- `internally_validated`: evaluated with an appropriate held-out, cross-fitted, bootstrap, randomization, placebo, or method-specific validation route for the current data structure.
- `inference_supported`: has an uncertainty route that matches the estimand, design, dependence structure, and package behavior.
- `externally_validated`: supported beyond the current sample or setting by design, data, or external evidence.
- `blocked`: cannot support the intended claim without changing the question, data, design, assumptions, or analysis.
- `not_applicable`: no statistical-evidence status is relevant to the bounded specialist output.

Use `statistical_evidence.claim_scope` for scope labels such as `in_sample_only`, `model_implied`, `target_sample`, `target_population`, or `exploratory_only`.

When in doubt, use the weaker status and name what would upgrade it.

## Same-Data Selection Risks

Treat model-discovered, post-hoc, or same-data selected patterns as exploratory unless they were prespecified or honestly evaluated. Examples include:

- subgroup discoveries, CATE rankings, treatment-rule cutoffs, or selected effect modifiers;
- selected thresholds, dose-response shapes, event-study windows, bandwidths, donor pools, or model specifications;
- learned variable importance, discovered mediation pathways, or narrative claims that one condition, unit, time period, pathway, or population benefits more than another;
- repeated specification search where the same outcome/effect data shaped the final story.

Validation routes may include prespecification, honest sample splitting, cross-fitting, held-out evaluation, out-of-bag checks, bootstrap schemes appropriate to the claim, placebo/falsification evidence, multiplicity-aware intervals, randomization/permutation inference, or method-specific guarantees.

Do not assume these routes are interchangeable.

## Data Role And Provenance

When `data_analyst` flags data realism, provenance, simulation, placeholder, benchmark, de-identification, or scrambling concerns, decide how that changes the claim boundary.

A method can still be useful as a demonstration, stress test, or exploratory prototype. Do not let model output become real-world causal evidence unless the data role and provenance support that interpretation.

If simulated data have a known data-generating process, use it to judge method recovery. If the data-generating process or provenance is unclear, cap claims as exploratory, descriptive, or demonstrative as appropriate.

## Common Risk Checks

Before treating a result as reportable evidence, ask whether there is a problem with:

- reusing the same data for model selection, subgroup discovery, effect estimation, and effect interpretation;
- overfitting, small effective sample size, many tested comparisons, or post-hoc thresholds;
- leakage across time, clusters, sites, subjects, folds, or preprocessing steps;
- missing or inappropriate uncertainty intervals, bootstrap logic, clustering, dependence handling, or multiplicity adjustment;
- support, positivity, censoring, selection, missingness, or measurement problems that make the statistical target different from the causal target;
- confusing nuisance-model cross-fitting, robust standard errors, bootstrap output, or package-provided intervals with validation of a discovered pattern, selected subgroup, treatment rule, model choice, or narrative interpretation when that is not what the method guarantees.

## Method-Specific Routes

When the issue is method-specific, consult the relevant method/job subskill details before deciding what exact claim is valid. Use that subskill's `SKILL.md`, references/examples when needed, and returned `subskill_records.statistical_evidence` packet to identify:

- the method-specific inferential or validation route;
- the claim scope it supports;
- the wording limits and non-guarantees.

Examples include asymptotic or sandwich/cluster-robust intervals, randomization/permutation inference, honest sample splitting, cross-fitting, out-of-bag or held-out evaluation, bootstrap schemes, simultaneous or multiplicity-aware intervals, placebo/falsification evidence, pre-trend or balance diagnostics, sensitivity analysis, RATE/Qini/AUUC-style ranking evidence, and method-specific guarantees from tools such as DML or generalized random forests.

Use only the route that fits the estimand, design, data structure, and package behavior.

## Bounded Data Requests

When the issue is testable in available data, request a bounded `data_analyst` diagnostic or artifact through the lead consultant. Examples:

- held-out or cross-fitted predictions;
- fold, seed, learner, or specification stability;
- calibration or rank stability;
- subgroup-size and overlap checks;
- bootstrap, randomization-style, or cluster/dependence-aware uncertainty;
- placebo or falsification checks;
- sensitivity to reasonable modeling choices.

Avoid open-ended analysis sweeps when one diagnostic, one user clarification, or one method-specific recheck would resolve the decision.

## Recording Consequences

Record consequences in existing fields:

- `diagnostics_plan` for validation checks needed before stronger claims;
- `sensitivity_plan` for robustness, placebo, alternative specification, or assumption checks;
- `report_wording_boundary` for exploratory, descriptive, provisional, cautious, or prohibited wording;
- `blockers` for issues that block the intended causal or statistical claim;
- `requests_for_progression` for the smallest next data check, user decision, or analysis needed.

If a method/task subskill already returned `statistical_evidence`, use it as specialist evidence, not as automatic gate clearance. Route back to method_lead only when the record may change strategy, selected framework, estimand set, gate status, claim strength, `causal_structure`, or report wording.
