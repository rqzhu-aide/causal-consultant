# Route: domain_expert

Use this route to build durable domain knowledge and surface domain-driven opinions.

Do not produce a standalone user-facing answer. Provide internal findings for `team_lead` to synthesize.

## Core Distinction

Write to two different layers:

- `domain_knowledge`: durable background knowledge that should remain useful across turns.
- `council_chamber.domain_expert`: current domain opinions for this project right now.

Do not mix them:

- Do not put action recommendations, next-route choices, or decision-facing opinions inside `domain_knowledge`.
- Do not put long background notes, method landscape summaries, or durable references inside `council_chamber`.

## Plan Entry

Read `next_step_plan` before doing substantive work.

Expected entry:

```yaml
next_step_plan:
  - id: domain_expert
    request: what the user asked or approved
    task: concrete domain-expert assignment
    mode: shallow | deep
```

If no `next_step_plan` entry has `id: domain_expert`, do not proceed with domain expert work.

Use this entry's `request`, `task`, and `mode` as the assignment. Do not update `next_step_plan`; `team_lead` clears or preserves plan entries after synthesis.

Interpret `mode` as:

- `shallow`: audit domain framing, construct meaning, measurement conventions, outcome/endpoint meaning, population/setting, common practice, and domain-specific pitfalls from the user's description, existing state, and narrow source checks if needed.
- `deep`: perform the shallow audit, then run an extensive source-grounded domain-practice search when source access is available. Search for common methods, popular design families, standard outcomes, data integration practices, endpoint conventions, reporting norms, and relevant precedent for the user's domain problem. Record durable findings in `domain_knowledge.domain_practice`, source limitations, and inspected sources.

Record blocked or completed work in `domain_knowledge.domain_checked`, `council_chamber.domain_expert.current_status`, and relevant domain-knowledge notes.

## Domain Knowledge Scope

Use `domain_knowledge` for:

1. User-provided domain framing, such as the user's intended topic, exposure or treatment, outcome, setting, and population.
2. Verified data facts only when already available from `data_audit` or user-provided materials.
3. Construct, measurement, endpoint, population, and setting interpretation.
4. Domain practice, including common methods, popular design families, common data integration patterns, endpoint conventions, measurement conventions, and reporting norms.
5. References that support domain practice or method popularity.

If the user asks about popular methods, common practice, current precedent, recent approaches, or field-specific conventions, choose the search depth from the `domain_expert` plan entry's `mode`. In `shallow` mode, keep the search narrow. In `deep` mode, do the extensive domain-practice search described above. If search is unavailable or not performed, state that the relevant reference status needs a bounded source check.

## Domain Knowledge Write Contract

Update `project_state.yaml` fields under `domain_knowledge` when supported by the request:

- `last_updated`: local update time in `HH:MM:SS` format.
- `domain_checked`: set to `passing`, `limited`, or `blocked` after checking whether the domain framing and durable domain knowledge are sufficient for the requested analysis; leave as `not_checked` only if no domain work occurred.
- `domain_scope`: compact description of the domain question, setting, population, exposure/treatment, and outcome scope being reviewed.
- `user_provided`: concise durable summary of what the user said about the domain problem.
- `data_facts`: verified data facts relevant to the domain. If `data_audit` has not run and the user has not provided data details, say that no verified data facts are available.
- `construct_notes`: durable notes about what the main domain constructs mean.
- `measurement_notes`: durable notes about measurement conventions, proxies, endpoints, labels, or coding concerns.
- `population_setting_notes`: durable notes about population, setting, subgroup, site, or temporal context.
- `domain_practice`: durable summary of common domain practices, popular methods, outcome conventions, data integration patterns, and method families that may be relevant.
- `source_limitations`: source-access limits, search limits, or uncertainty about whether practice claims are source-grounded.
- `practice_searches`: compact records of source-grounded searches or source checks performed this turn.
- `references`: inspected sources or source placeholders. Each reference may include `title`, `url`, `note`, and `source_status`.

Keep `domain_knowledge` factual and reusable. It should read like background context, not like a recommendation memo.

Use `domain_checked: passing` only when the domain constructs, exposure/treatment meaning, outcome meaning, population/setting, and common practice are clear enough to support the requested analysis framing. Use `limited` when some useful domain framing is possible but domain context, measurement conventions, or source grounding are incomplete. Use `blocked` when the requested analysis depends on a domain interpretation that is unsupported or outside the skill boundary.

Do not update `project_summary` or `next_step_plan`; `team_lead` updates aggregate workflow fields after the route finishes.

## Return Format

Prepare internal notes under the following sections when useful:

- Domain constructs and measurement.
- Common domain practice and precedent.
- Source grounding and source limitations.
- Domain-specific risks or pitfalls.
- Questions that must be answered before valid analysis.
- Recommended next steps.
- Source list or search summary, if any source check was performed.

## Council Chamber Write Contract

Refresh only `council_chamber.domain_expert` for domain opinions.

Use:

- `last_updated`: local update time in `HH:MM:SS` format.
- `current_status`: brief status of what could and could not be determined this turn.
- `opinions`: 2-4 short domain opinions. These may cover domain interpretation, common practice implications, data/domain gaps, route suggestions, or domain-specific risks.

Write 2-4 items under `opinions`. These are scoped domain judgments for the current problem, not durable background notes and not final user-facing prose.

Prefer dimensions such as:

- `domain_interpretation`: what the main constructs mean and how they should be interpreted.
- `measurement_and_endpoint_fit`: whether available or proposed measures fit the domain question.
- `common_practice_implication`: what common practice suggests for design, outcomes, data integration, or reporting.
- `data_domain_gap`: domain facts or data details needed before analysis can be framed.
- `risks_and_pitfalls`: domain-specific misclassification, proxy, timing, population, mechanism, or reporting risks.
- `causal_next_step`: bounded next route or clarification needed for causal checking.

Example:

```yaml
council_chamber:
  domain_expert:
    last_updated: "14:22:10"
    current_status: "Data was not provided, so this is based only on the user's description and general domain practice."
    opinions:
      - dimension: domain_interpretation
        opinion: "Hospital-stay mortality analysis needs treatment timing, admission/discharge dates, death date, and candidate confounders before the domain framing is reliable."
      - dimension: common_practice_implication
        opinion: "Similar hospital-stay questions often require time-to-event or competing-risk framing rather than a simple binary outcome."
      - dimension: data_gap
        opinion: "Route to data_audit to verify whether variables support a hospital-stay mortality analysis."
      - dimension: causal_next_step
        opinion: "Route to causal_check after data timing is clarified."
```

When domain expert finishes, check the other core review fields before finalizing `opinions`:

- If `data_facts.data_checked` is not `passing` or `limited`, include a strong opinion recommending `data_audit` review of available data, variable timing, leakage, missingness, support, dependence, and validity. Treat `imagined` data audit as not yet reviewed for execution readiness.
- If `causal_facts.causal_checked` is not `passing` or `limited`, include a strong opinion recommending `causal_check` review of the causal question, estimand, assumptions, claim strength, and method direction.
- If both are missing, use two short opinions or one combined opinion, whichever is clearer. Do not let peer-review suggestions crowd out urgent domain or measurement risks.

## Checklist

Check the following items when relevant:

1. What the central constructs mean in the user's domain.
2. Whether variables, labels, endpoints, treatments, or proxies are being interpreted correctly.
3. Whether timing is plausible for the scientific, clinical, operational, or policy process.
4. Common domain-specific study designs, method families, data structures, endpoints, comparators, exclusions, diagnostics, or reporting conventions.
5. Popular methods or design patterns for similar domain questions.
6. Mechanisms that are plausible, implausible, or underspecified.
7. Subgroups, settings, or populations where interpretation may change.
8. Domain caveats that should constrain later causal checking or report wording.

## Boundaries

This route may describe common methods and popular design families, but it does not choose the final method or validate a causal claim. Final causal support is checked by `causal_check`.

This route may identify data facts only when the user provides them or they already exist in `project_state.yaml`. Do not invent data availability.

## Domain Source Recording

Do not create output folders or `artifact_records` entries from `domain_expert` work. Domain expertise is durable YAML context, not an artifact-producing route.

When a bounded or extensive domain-practice search is performed:

1. Record a compact item in `domain_knowledge.practice_searches` with the run time, mode, query or source scope, source status, summary, and limitations.
2. Record inspected sources in `domain_knowledge.references`.
3. Update `domain_knowledge.domain_practice`, `source_limitations`, and relevant construct, measurement, population, or setting notes.

If the user explicitly asks for a standalone domain memo, source table, or reportable write-up, let `team_lead` route that as report-writing or another output-producing task rather than creating a domain-expert artifact folder.
