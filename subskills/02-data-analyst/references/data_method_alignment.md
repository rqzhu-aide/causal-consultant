# Data Method Alignment

Use this deeper reference when data evidence must be connected to causal claims, method feasibility, specialist subskill support, or reportable interpretation. Do not load it for ordinary early `project_exploration` intake unless the safe next reply depends on a bounded data-to-method check.

## Data Evidence Triage

Treat candidate frameworks, method/job subskills, and `method_lead` requests as questions to test against the data, not decisions to accept. Read `domain_expert` first when construct meaning, coding rules, invalid values, preprocessing norms, domain-specific tools, or interpretation constraints could affect the data evidence.

For each relevant candidate or request, classify the data support compactly:

- `directly_supported`: required variables, timing, unit structure, and support are visible or already inspected.
- `constructible_with_processing`: feasible after a concrete preprocessing, linkage, feature construction, reshaping, or restriction step.
- `proxy_only`: the data contain imperfect proxies, not the requested construct.
- `needs_inspection`: support cannot be judged until a bounded check is run.
- `unsupported`: required data elements are absent or not constructible from current information.
- `contradicted`: inspected data conflict with the candidate's required timing, unit, variable role, or support logic.

Use existing `method_support` fields for this handoff:

- `data_compatible_frameworks`: candidate frameworks or subskills with support classification and the key data reason.
- `processing_pipeline_suggestions`: concrete steps needed to make data usable for a plausible framework or subskill.
- `learner_plugin_handoffs`: where flexible learners could replace or augment simple model components inside a causal framework, plus diagnostic cautions.
- `diagnostic_artifact_suggestions`: one or two bounded artifacts that would settle a data question, such as support plots, missingness tables, timing checks, or unit summaries.
- `feasibility_notes`: constraints, contradictions, privacy limits, sparse support, or unknowns that `method_lead` must consider.

Keep the boundary clear. `data_analyst` may say that the data shape supports checking a DiD/event-study design, or that RD is unsupported because no running variable or cutoff exists. `data_analyst` should not say that DiD is causally valid, that RD assumptions hold, or that a final framework is selected. That judgment belongs to `method_lead`.

Prefer a small, decision-useful handoff: the few data facts that change framework fit, one or two bounded checks, and the smallest processing plan that would make progress. Re-triage when new data, domain guidance, or inspection results change constructability, timing, support, or feasibility.

When an activated method/job subskill leaves a `subskill_records` entry with routine data, implementation, or diagnostic requests, treat it as a bounded data-work request. Build or check the requested analysis-dataset shape, preprocessing step, diagnostic artifact, code path, table, or figure when authorized and useful. If execution contradicts the causal strategy, changes data feasibility, or the record has `method_lead_recheck.required: true`, request a bounded `method_lead` recheck instead of resolving causal validity yourself.

## Analysis Alignment

Use `analysis_alignment` to connect data facts to the current analysis claim. This is the field that prevents the team from forgetting earlier requirements once data arrive.

Update it when any of these change:

- inspected or described data sources;
- user goal, intended claim, framework, estimand, or report target;
- `method_lead.validity_requirements`, `method_lead.causal_structure`, diagnostics plan, or wording boundary;
- `causal_gate.unresolved_required_information` or `production_gate.unresolved_required_materials`;
- prior warnings, user constraints, newly discovered data simplifications, or data role/provenance concerns that affect interpretation.

Use the fields this way:

- `aligned_to`: the current user goal, framework, estimands, intended claims, and report or analysis target being checked.
- `checked_against`: the requirements, causal-structure items, gate needs, prior warnings, user constraints, or data role/provenance concerns used as the checklist.
- `requirement_checks`: one compact row per load-bearing requirement. Say the requirement, source, what it is required for, data support, evidence pointer, related variables, gap type, claim impact, and possible resolution.
- `data_simplifications_affecting_claims`: claim-relevant derived analysis constructs, transformations, or reductions that need interpretation notes, such as longitudinal summaries, collapsed exposure histories, dose grouping, outcome-window choices, aggregation, sample restrictions, or feature reductions.
- `unsupported_or_overstated_claims`: statements the current data cannot support at the requested strength, including statements that treat simulated, placeholder, scrambled, or provenance-unclear data as real-world evidence.
- `data_supported_claim_ceiling`: strongest claim strength the data evidence can support before `method_lead` and gates apply stricter causal limits; lower it when data role or provenance limits interpretation.
- `alignment_summary`: one or two sentences for `method_lead`, `report_writer`, and the lead consultant.
- `requests_for_resolution`: the smallest data, design, user, or method check that would resolve the main alignment gap.

Treat ad hoc data treatments as allowed analysis construction choices unless they conflict with the intended claim. Do not flag a collapse, grouping, imputation, dimension reduction, window definition, restriction, or proxy construction as a flaw solely because it simplifies the data. Instead, record what was constructed, the input data and rule/window used, what causal or descriptive claim the constructed variable can support, what stronger or different claim it no longer supports, and what diagnostic, sensitivity, provenance, or user confirmation would make the construction more defensible.

For `requirement_checks.data_support`, use the same support logic as `method_support`: `directly_supported`, `constructible_with_processing`, `proxy_only`, `needs_inspection`, `unsupported`, `contradicted`, or `not_applicable`.

Do not decide causal validity here. State what the data support against the need. `method_lead` decides how that changes framework choice, method selection, identification gaps, diagnostics, and claim wording.

## Method-Fit Feedback

You may suggest data-compatible framework families or diagnostics for `method_lead` review, such as regression adjustment, matching/weighting, doubly robust estimation, DML, DiD, RD, IV, synthetic control, survival analysis, mediation, interference, or descriptive fallback. Phrase these as data-fit suggestions, not final method decisions.

Machine learning tools can be useful for prediction, nuisance models, heterogeneity, or flexible adjustment, but they do not solve identification by themselves. Flag when advanced methods are feasible computationally but the data do not support the causal framework.

When a candidate method or sidecar subskill seems data-compatible, explain why in data terms: unit structure, timing, exposure/outcome constructability, repeated measures, clustering, support, sample size, feature richness, censoring, or available diagnostics. Update `variable_roster.data_status` only for the compact variable-level state; put richer evidence in `method_support` or artifacts. When it seems incompatible, give the smallest data fact or artifact that would change that judgment.

Use statistical learning tools only as causal-support tools. Before suggesting or running one, name the causal-consulting purpose: construct validation, missingness/selection diagnosis, support/overlap assessment, high-dimensional pre-treatment feature reduction, nuisance-function feasibility, exploratory heterogeneity, sensitivity/diagnostic support, or report artifact generation. Do not turn `data_analyst` into a general supervised-learning specialist.

When flexible learners may help a causal method subskill, return a compact learner-plugin handoff rather than a generic model recommendation. State which simple model the learner might replace or augment, which role it would play, why the data can support it, and what extra diagnostics or caution it creates. Examples include replacing a linear outcome regression with random forests/boosting/GAMs inside adjustment or AIPW, replacing logistic propensity regression with regularized or tree-based propensity models for weighting/matching diagnostics, using Super Learner in TMLE, using DML-compatible learners for nuisance functions, or using `grf`/causal forests when heterogeneity or CATE estimation is part of the selected framework.

When a method/job subskill is plausible, also suggest a compact processing pipeline for that subskill when useful:

- input data shape needed;
- variable construction or feature-engineering steps;
- timing restrictions and leakage checks;
- missingness, selection, support, or overlap diagnostics;
- simple baseline model and optional flexible learner replacement;
- artifact paths that should be created for reviewer or report use.

If a method/job specialist would help, frame the request as a bounded support need, such as "ask `method_lead` whether this support pattern justifies activating `30`" or "use `32` only if DML-style nuisance modeling is part of the selected framework." Do not ask for broad rerouting when one specific diagnostic or design fact would be enough for the next user interaction.
