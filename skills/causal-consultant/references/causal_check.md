# Route: causal_check

Use this reference to check whether a causal question, design, method, or conclusion is supported.

Do not produce a standalone user-facing answer. Provide internal findings for `team_lead` to synthesize.

## Plan Entry

Read `next_step_plan` before doing substantive work.

Expected entry:

```yaml
next_step_plan:
  - id: causal_check
    request: what the user asked or approved
    task: concrete causal-check assignment
    mode: shallow | deep
```

If no `next_step_plan` entry has `id: causal_check`, do not proceed with causal check work.

Use this entry's `request`, `task`, and `mode` as the assignment. Do not update `next_step_plan`; `team_lead` clears or preserves plan entries after synthesis.

Interpret `mode` as:

- `shallow`: perform a compact causal-claim screen using existing context.
- `deep`: perform a fuller causal critique covering estimand, timing, assumptions, threats, support status, and recommended checks.

Record blocked or completed work in `causal_facts.causal_checked`, `council_chamber.causal_check.current_status`, and relevant causal-fact notes.

## Checklist

Check the following items when relevant:

1. Whether the causal question is explicit.
2. Treatment, exposure, intervention, outcome, population, time zero, and follow-up window.
3. The estimand or target causal contrast.
4. Temporal ordering of treatment, covariates, mediators, and outcomes.
5. Confounding, selection, measurement, missingness, positivity, interference, and censoring threats.
6. Whether the proposed design supports the intended claim.
7. Whether assumptions are stated and plausible.
8. Whether sensitivity, falsification, negative-control, or robustness checks are needed.
9. Whether the final wording should be causal, associational, predictive, or exploratory.

## Return Format

Prepare internal notes under the following sections when useful:

- Supported causal claim.
- Unsupported or overclaimed parts.
- Key assumptions.
- Main threats to validity.
- Recommended checks or design changes.
- Safer wording.

## Special Emphasis

Separate evidence strength from writing confidence. A polished causal sentence is still inappropriate if the design does not support it.

## Method Route Recommendation

When the task requires recommending a causal analysis method route, load `references/method_route_catalog.yaml`.

Use the detailed method catalog to identify candidate method routes that fit the causal question, data structure, timing, estimand, and assumptions. Use catalog IDs exactly as written in `route_index.yaml`. Do not recommend a method route only because the user named it; check whether the current causal formulation supports it.

For analysis planning, execution requests, or method-selection tasks, always record both an overall analysis-readiness judgment and any method-route readiness judgments. Recommend one primary causal `design` route only when the method is at least promising enough to enter `analysis_execution` precheck. Recommend `descriptive_association` only as an explicit non-causal fallback when causal identification is not supportable but association-only analysis is still useful. Strongly consider one `support` route with the selected design; use `statistical-validity` as the default support unless another support is more immediately relevant. Recommend support routes only as analytic tools that the selected design route could use; do not recommend support-only execution.

Keep overall readiness separate from method-route readiness:

- `causal_checked` is the core-review status: `passing`, `limited`, or `blocked`.
- `analysis_readiness` is the main execution-readiness status: `ready`, `limited`, `not_ready`, or `blocked`.
- `recommended_method_routes[].readiness` is method-specific and may use only `precheck_ready` or `limited`.

Use `analysis_readiness: ready` when a causal design recommendation is mature enough for precheck. Use `analysis_readiness: limited` when only a bounded causal method, constrained analysis, or explicit non-causal fallback is mature enough for precheck. Use `analysis_readiness: not_ready` when more causal, data, or domain work is needed before recommending any method. Use `analysis_readiness: blocked` when analysis execution should not proceed.

Do not put `not_ready`, `blocked`, or free-text readiness values in `recommended_method_routes[].readiness`. If no method reaches at least `limited`, leave `recommended_method_routes` empty or record only a non-causal `descriptive_association` fallback when appropriate; explain the reason in `support_status`, `recommended_checks`, and `council_chamber.causal_check.opinions`.

Record method recommendations under `causal_facts.recommended_method_routes`. Keep each item concise:

```yaml
- id: "randomized_assignment"
  category: "design"
  reason: "Randomized assignment is the mature design frame for the requested analysis."
  readiness: "precheck_ready"
  next_step: "Prepare a shallow analysis_execution precheck for the randomized-assignment scope."
```

When recommending support, add it as a separate item:

```yaml
- id: "statistical-validity"
  category: "support"
  reason: "Validity diagnostics, overlap, robustness, and inference should accompany the selected design."
  readiness: "precheck_ready"
  next_step: "Use as the default support lens during analysis_execution precheck unless a more specific support is needed."
```

If analysis is not mature enough for a loadable design recommendation, do not put a null or blocked method into `recommended_method_routes`. Set `analysis_readiness: not_ready` or `analysis_readiness: blocked`, and use `support_status`, `recommended_checks`, and `council_chamber.causal_check.opinions` to explain the main maturity issue and the smallest next information needed.

If the study can support only descriptive or association analysis and the user wants to proceed non-causally, recommend `descriptive_association` with careful fallback wording:

```yaml
- id: "descriptive_association"
  category: "design"
  reason: "Causal identification is not supportable from the current design, but non-causal association summaries can describe observed patterns."
  readiness: "limited"
  next_step: "Run an approved descriptive/association analysis with explicit no-causal-claim wording."
```

When recommending `descriptive_association`, set `analysis_readiness: limited` and set `causal_facts.support_status` to state that causal claims are not supported and only non-causal association analysis is mature. In `council_chamber.causal_check.opinions`, include a boundary opinion explaining why this is an absolute fallback rather than a causal design.

## State Updates

Update `project_state.yaml` fields under `causal_facts` when supported by the user's request:

- `last_updated`: set to the local run time in `HH:MM:SS` format whenever this reference is run.
- `causal_checked`: set to `passing`, `limited`, or `blocked` after checking whether the causal formulation and claim boundary are sufficient for the requested analysis; leave as `not_checked` only if no causal check work occurred.
- `analysis_readiness`: set to `ready`, `limited`, `not_ready`, or `blocked` when the task involves analysis planning, execution, or method selection.
- `causal_question`
- `exposure_or_intervention`
- `outcome`
- `estimand`
- `assumptions`
- `threats`
- `support_status`
- `recommended_checks`
- `recommended_method_routes`

Refresh only `council_chamber.causal_check` for causal opinions. Use `current_status` to summarize claim support or uncertainty.

Write 2-4 items under `opinions`. These are scoped causal-check judgments for the current problem, not durable method catalog entries and not final user-facing prose. When analysis planning or execution was requested, include one opinion about `analysis_readiness` and one about the recommended design/support direction, why no method reaches the limited threshold, or why `descriptive_association` is being offered as a non-causal fallback. Prefer dimensions such as:

- `claim_support`: whether the current claim can be causal, associational, predictive, exploratory, or blocked.
- `identification_or_method_direction`: the design or support direction that appears plausible, or why no loadable design/support recommendation is mature yet.
- `assumption_risks`: assumptions, threats, or missing facts that most affect the claim.
- `next_causal_check`: the next causal clarification, diagnostic, method-route recommendation, or boundary revision.

Keep each opinion short, decision-facing, and grounded in the current `causal_facts`, data/domain state, or clearly stated uncertainty.

When causal check finishes, check the other core review fields before finalizing `opinions`:

- If `data_facts.data_checked` is not `passing` or `limited`, include a strong opinion recommending `data_audit` review of actual data, variable timing, leakage, missingness, support, dependence, and validity before analysis execution. Treat `imagined` data audit as not yet reviewed for execution readiness.
- If `domain_knowledge.domain_checked` is not `passing` or `limited`, include a strong opinion recommending `domain_expert` review of construct meaning, measurement conventions, endpoint interpretation, population/setting, common practice, or domain-specific risks.
- If both are missing, use two short opinions or one combined opinion, whichever is clearer. Do not let peer-review suggestions crowd out a critical causal boundary, blocked claim, or method-readiness judgment.

Use `causal_checked: passing` only when the causal question, exposure/treatment, comparator, outcome, time zero, target population, estimand, main assumptions, and claim boundary are clear enough to support the requested analysis. Use `limited` when some useful causal framing or planning is possible but the causal formulation is incomplete, or when the only mature executable path is `descriptive_association` with non-causal wording. Use `blocked` when the requested causal claim or execution path is unsupported, overclaimed, unidentified, or outside the skill boundary and no acceptable fallback is available.

Use `analysis_readiness: ready` only when at least one recommended loadable causal design has `readiness: precheck_ready`. Use `analysis_readiness: limited` when at least one recommended method has `readiness: limited`, including `descriptive_association` as a non-causal fallback. Use `analysis_readiness: not_ready` when no method reaches the limited threshold but further data, domain, or causal checks could repair the path. Use `analysis_readiness: blocked` when no acceptable causal or non-causal fallback should proceed. If `causal_checked: blocked`, set `analysis_readiness: blocked` unless the only offered path is an explicitly non-causal `descriptive_association` fallback.

Do not update `project_summary` or `next_step_plan`; `team_lead` updates aggregate workflow fields after the route finishes.
