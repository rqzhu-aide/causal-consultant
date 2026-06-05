# Causal Discovery Workflow
## Permission Note

This reference does not authorize execution. Treat diagnostics, artifacts, plots, tables, code, or report material as requests back to main unless main explicitly routed `execution_authorized` after user-confirmed scope.

Use this reference when main routes a bounded discovery sidecar. Keep the sidecar exploratory, artifact-based, and reviewer-routed.

## Lifecycle

1. Enter with a bounded purpose: graph exploration, graph comparison, local variable-neighborhood screening, discovery diagnostics, time-series graph exploration, or discovery-only deliverable.
2. Confirm the return path: `project_exploration`, `causal_specification`, or `report_production`.
3. Precheck data and assumptions before algorithms: variable set, timing tiers, hidden-confounding tolerance, missingness, data type, non-IID structure, preprocessing, and background knowledge.
4. Produce only the scoped artifact or plan: graph object, edge list, local neighborhood, stability table, diagnostics memo, or report-support packet.
5. Return a compact packet to main with a recommended reintegration status. Main closes, pauses, parks, returns, or routes implications.

Set `affects_main_framework: true` only when reviewer review is needed before the main workflow continues. Discovery does not update gates, adjustment sets, selected frameworks, or claim wording directly.

## Reintegration Gate

Every discovery packet should help main choose one reintegration status:

- `exploratory_only`: findings are useful context but do not need workflow changes.
- `reviewer_needed`: a specific implication needs `data_analyst`, `domain_expert`, `method_lead`, or `causal_gatekeeper`.
- `user_choice_needed`: the user should choose whether to continue discovery, run diagnostics, park it, or return to the main phase.
- `parked_for_report`: keep the material exploratory and report it as not changing the main workflow.
- `sidecar_closed`: close the sidecar and return to `return_to_phase`.

If a packet suggests adjustment, timing, DAG, variable-role, method, framework, or claim-wording changes, recommend reviewer routing rather than direct adoption. If there is no actionable implication, recommend return or closure.

## When Discovery Is Worth Recommending

Recommend discovery as an optional sidecar when it can answer a specific exploratory question:

- Which graph hypotheses are plausible enough to discuss?
- Which variables are in the local neighborhood of exposure or outcome?
- Are competing DAG stories visible in the data under documented assumptions?
- Does a time-series or lagged structure suggest candidate directional patterns?
- Do existing graph artifacts have enough diagnostics to be reportable?
- Does the user explicitly want a discovery-only exploratory report?

Do not recommend discovery only because a dataset exists. It is most useful when the graph is underspecified, variable structure is high-dimensional, temporal/system structure matters, or the user wants graph exploration rather than effect estimation.

Main normally considers these triggers in the Discovery Opportunity Check after a variable-role card and during `method_lead.method_option_map`; the sidecar does not self-activate.

## Intake Checks

Before fitting or interpreting discovery algorithms, record or request:

- graph target: DAG, CPDAG, PAG, local neighborhood, edge ranking, stability table, or discovery-only report;
- variable set and exclusion rules;
- temporal tiers, known interventions, impossible directions, required edges, and forbidden edges;
- hidden-confounding tolerance and whether PAG/FCI-style output is needed;
- data structure: IID, clustered, panel, longitudinal, time series, network, multi-environment, mixed, or text-derived;
- missingness, scaling, discreteness, sample size, variable count, and preprocessing risks;
- whether the user needs a unique graph or can accept an equivalence class.

If these are missing and material, return one user question or one reviewer request instead of running algorithms.

## Algorithm-Family Selection

Use packages as tools for hypotheses, not authorities.

| Situation | Candidate families | Typical outputs | Key caution |
|---|---|---|---|
| IID data, causal sufficiency plausible | PC, stable-PC, GES/score search | CPDAG or DAG candidate | Equivalence and test/score sensitivity |
| Latent confounding plausible | FCI, RFCI, GFCI | PAG | Edge marks are uncertainty, not unique directions |
| Non-Gaussian linear assumptions plausible | LiNGAM, DirectLiNGAM | DAG candidate | Functional assumptions are strong |
| Time series or lagged systems | PCMCI, PCMCI+, VAR-LiNGAM, Granger-style screens | lagged graph or links | Stationarity, lag choice, contemporaneous ambiguity |
| Many variables | local discovery, screening, stability selection | local neighborhood or ranked edges | false confidence from variable selection |
| Existing graph artifact | diagnostic review and comparison | QA memo | do not upgrade claims without core review |

Optimization and neural DAG learners may be useful as screening or benchmark tools, but require explicit tuning, regularization, and stability cautions.

## Diagnostics

For substantive discovery artifacts, include the diagnostics that match the method:

- sensitivity to alpha, CI test, score, seed, tuning, lag choice, preprocessing, and variable set;
- bootstrap or subsample edge and orientation stability;
- consistency with temporal tiers and required/forbidden edges;
- whether the graph is DAG, CPDAG, PAG, lagged graph, edge ranking, or local screen;
- latent-confounding, selection, non-IID, missingness, and measurement-error limits;
- domain plausibility and data-pipeline checks to route to core reviewers.

If diagnostics are not done, label the packet `candidate_only` or `diagnostics_needed`.

## Report Support

When discovery produces user-visible or durable material, return report support:

- suggested section title, usually "Exploratory Causal Discovery";
- purpose and graph target;
- data and variable set used;
- method family, assumptions, and background knowledge;
- graph artifact paths, edge/stability tables, and code paths;
- main candidate structures or negative findings;
- diagnostics completed and still missing;
- reviewer-routing status;
- limitations and exploratory wording.

Use a visible report section when discovery was requested by the user, activated early to shape the project, or materially informed causal specification. Use an appendix for minor diagnostics or background material.

## Reviewer Routing

Discovery artifacts can inform the team, but they do not change gates, frameworks, adjustment sets, estimands, or causal claim strength directly. Route implications back through main:

- `data_analyst`: variable construction, preprocessing, leakage, missingness, non-IID structure, and artifact provenance.
- `domain_expert`: construct meaning, mechanism plausibility, forbidden or required edges, and temporal plausibility.
- `method_lead`: method options, graph hypotheses, adjustment ideas, estimand implications, and framework comparisons.
- `causal_gatekeeper`: claim feasibility, timing logic, adjustment, statistical interpretation, and report wording.
- `report_writer`: discovery report module or discovery-only report after packets and artifacts are recorded.

## Closure

End the packet with one of these next actions:

- `ask_user`;
- `refresh_data_analyst`;
- `refresh_domain_expert`;
- `refresh_method_lead`;
- `refresh_causal_gatekeeper`;
- `refresh_report_writer`;
- `run_diagnostics`;
- `return_to_project_exploration`;
- `return_to_causal_specification`;
- `return_to_report_production`;
- `close_sidecar`;
- `pause_sidecar`.

If the graph is unstable, broad, or assumption-heavy, recommend closing or pausing as exploratory rather than forcing more work.

When closing or pausing, include the return phase and one short reason so main can resume the main causal route without re-opening the sidecar by accident.
