# Causal Discovery Report Template

Use this flexible template when the user's requested deliverable is a causal-discovery-only report, or as a module source when causal discovery is part of a broader analysis workflow. Discovery material is for graph hypotheses, variable screening, causal-path exploration, graph comparison, and discovery diagnostics. It is not effect-estimation evidence and must keep claim strength exploratory unless a separate main-workflow review validates stronger interpretation.

When discovery is the deliverable, this can become a standalone report. When discovery was activated inside a broader project, do not create a separate report by default. Fold the relevant sections into the main report as a modular discovery section, preserving the discovery-specific logic while letting Report Writer integrate it with the main causal specification, data, methods, limitations, and artifact index.

## Output Format

Choose the report format from the evidence source:

- If discovery is conceptual, based on user-described graph output, or based on existing artifacts that were not rerun, a short `.md` discovery report is acceptable.
- If discovery algorithms are run on data, the default deliverable is a reproducible source report plus rendered HTML:

```text
artifacts/
  [descriptive-name].ipynb   # or .qmd / .Rmd, depending on the analysis language
  [descriptive-name].html
  graphs/
  tables/
```

The source file is the reproducible discovery artifact. The `.html` is the reading and sharing artifact. Graph plots, edge lists, stability tables, tuning summaries, and other discovery outputs should be saved separately when useful and indexed in the report.

## Template Instructions

Write the discovery report as a technical report, not as a checklist. Use the numbered sections below, but adapt section titles, order, and length when the project needs it. Use coherent paragraphs to explain the discovery goal, data, graph target, method, graph findings, diagnostics, interpretation, and limits. Use bullets or tables only when they make graph evidence easier to inspect.

All graph findings, diagnostics, plots, edge lists, sample descriptions, and package/tuning details must come from executed code, verified artifacts, user-provided outputs, or clearly labeled placeholders. Do not invent sample sizes, stability values, graph edges, missingness rates, preprocessing facts, or diagnostics.

For integration into a main report, condense the template into these module elements: discovery purpose, data/variables, graph target and method, candidate findings, diagnostics, reviewer interpretation, limitations, and artifact paths. The main report may combine or rename sections, but these elements should remain traceable.

# [Discovery Report Title]

## Executive Summary

[Summarize the discovery goal, bottom line, claim strength, main graph artifact, and main caution in a short paragraph. Keep the claim explicitly exploratory. If useful, add a compact summary table or bullets.]

Suggested summary fields when helpful:

| Field | Summary |
|---|---|
| Discovery goal | [Graph exploration, graph comparison, variable screening, discovery diagnostics, or discovery-only report.] |
| Bottom line | [Most useful graph hypothesis or uncertainty pattern.] |
| Claim strength | Exploratory. |
| Main artifact | [Graph, CPDAG, PAG, edge list, stability table, or screening result.] |
| Main caution | [Latent confounding, weak orientation stability, sample size, timing uncertainty, preprocessing risk, or other key limit.] |

## 1. Discovery Question And Scope

[State what the user asked the discovery workflow to learn. Explain why this report is discovery-only rather than an effect-estimation report. Distinguish the workflow path from graph paths: the workflow path explains why causal discovery was used; a causal graph path is a directed or partially directed chain in the discovered graph, such as `X -> M -> Y`.]

[Say whether the report stays exploratory or whether any finding is being routed to `data_analyst`, `method_lead`, `domain_expert`, or `report_writer` for separate review. Do not let a discovered graph directly update an adjustment set, route, gate, or claim strength.]

## 2. Data And Variable Inventory

[Summarize the data used for discovery: row unit, time structure, whether observations are IID, clustered, panel, longitudinal, time series, mixed, or text-derived, and which data files or artifacts were inspected.]

[Describe sample size, variable count, variable types, missingness, measurement concerns, variables included, variables excluded or grouped, known interventions, temporal tiers, required edges, forbidden edges, and other background knowledge when those facts are available.]

[Describe preprocessing choices and any leakage, collider, selection, or post-treatment risks. If a fact is unavailable, say so rather than filling it in.]

## 3. Discovery Target And Method

[Describe the graph object and algorithm family. Name the target object, such as DAG, CPDAG, PAG, ancestral graph, edge list, variable screen, or graph comparison. Name the method family, such as PC/stable-PC, FCI/RFCI/GFCI, GES/FGES, LiNGAM, additive-noise methods, PCMCI/Granger/time-series workflow, Tetrad workflow, or another selected approach.]

[Explain the key assumptions in prose: causal sufficiency or latent-confounding allowance, acyclicity, faithfulness, stationarity, non-Gaussianity, functional form, selection mechanism, and temporal ordering. Record tuning choices, tests, scores, seeds, software packages, and code paths when available.]

## 4. Candidate Graph Findings

[Report discovered graph material with cautious language. Describe stable candidate edges, uncertain or weakly oriented edges, equivalence-class ambiguity such as CPDAG/PAG marks, edges that conflict with temporal order or background knowledge, and the graph plots, edge lists, or stability artifacts that support these statements.]

Use phrases such as "suggests a graph hypothesis," "is compatible with," or "raises a candidate edge." Do not use "proves" or "establishes causality."

## 5. Candidate Causal Paths

[Summarize important graph paths only when supported by the discovered artifact. Discuss candidate upstream drivers of an outcome, possible mediating chains such as `A -> B -> C`, alternative paths that remain ambiguous because of equivalence classes or weak orientation, and paths that require domain review before they influence adjustment, route choice, or claim language.]

If no reliable path can be stated, say that the graph does not support stable path interpretation.

## 6. Confounders, Mediators, Colliders, And Adjustment Warnings

[List variable-role hypotheses cautiously. Explain possible confounders for important relationships, possible mediators or mechanisms, possible colliders or selection variables that should not be controlled for without DAG review, and variables that may be downstream of treatment or constructed from outcomes.]

Discovery output can suggest adjustment questions, but it cannot choose the final adjustment set. Any adjustment implication must go through `method_lead` or the relevant main-workflow owner.

## 7. Diagnostics And Stability

[Summarize checks that limit interpretation. Use a compact table when diagnostics exist. If diagnostics were not run, state that the report is a preliminary discovery memo.]

| Check | Status | Evidence | Interpretation impact |
|---|---|---|---|
| Edge stability | [pass/concern/fail/not run/not applicable] | [artifact or note] | [impact] |
| Orientation stability | [status] | [artifact or note] | [impact] |
| Tuning/test/score sensitivity | [status] | [artifact or note] | [impact] |
| Background-knowledge consistency | [status] | [artifact or note] | [impact] |
| Hidden-confounding risk | [status] | [artifact or note] | [impact] |
| Temporal or non-IID assumptions | [status] | [artifact or note] | [impact] |
| Preprocessing risk | [status] | [artifact or note] | [impact] |

## 8. Interpretation

[Explain what the discovery result is useful for: forming graph hypotheses, prioritizing domain review, narrowing variables for later DAG work, identifying candidate pathways for future effect estimation, or documenting uncertainty and graph non-uniqueness.]

[State what should not be inferred: no effect size, no validated intervention effect, no final adjustment set, and no upgraded causal claim unless a separate validated route supports it.]

## 9. Recommended Next Effect-Estimation Questions

[When useful, propose candidate next questions without running them automatically. Name candidate treatment or exposure, comparator, outcome, population, unit, and time horizon. Name suggested owner review before estimation, such as `domain_expert`, `data_analyst`, or `method_lead`, and list data or design information needed before effect estimation.]

Frame these as follow-up options, not as completed causal answers.

## 10. Limitations And Reproducibility

[Summarize hidden variables, selection, measurement error, temporal-order uncertainty, sample-size limits, high-dimensional conditioning, missingness, non-IID structure, faithfulness, Markov, functional-form, stationarity, causal-sufficiency assumptions, software packages, seeds, tuning, preprocessing, and artifact paths.]

If algorithms were run, include enough information to rerun or audit the discovery workflow. If the report is based on user-provided graph output or existing artifacts, state that provenance clearly.

| Artifact | Path | Purpose |
|---|---|---|
| [source report or memo] | [relative path] | [reproducible source or Markdown report] |
| [rendered HTML, if data-backed] | [relative path] | [shareable report] |
| [graph plot] | [relative path] | [graph visualization] |
| [edge list] | [relative path] | [edge-level output] |
| [stability table] | [relative path] | [diagnostic evidence] |

## Required Coverage

Every causal discovery report must cover these elements somewhere in the report:

| Required element | What must be covered |
|---|---|
| Discovery scope | Discovery goal, whether the report is discovery-only, and whether findings feed later owner review. |
| Data and variables | Data provenance, row unit, time structure, variables included/excluded, background knowledge, and preprocessing choices. |
| Graph target and method | Graph object, algorithm family, assumptions, packages, tuning, seeds, and code paths when available. |
| Graph findings | Candidate edges, uncertain orientations, equivalence-class ambiguity, conflicts with background knowledge, and artifact support. |
| Candidate paths | Candidate graph paths or an explicit statement that stable paths are unavailable. |
| Variable-role warnings | Possible confounders, mediators, colliders, downstream variables, and adjustment warnings. |
| Diagnostics | Stability, sensitivity, background consistency, hidden-confounding, temporal/non-IID, and preprocessing checks. |
| Interpretation limits | What the graph can suggest and what it cannot prove. |
| Reproducibility | Source report or memo, rendered HTML when data-backed, graph artifacts, edge lists, stability tables, software, seeds, and tuning notes. |

## Optional Coverage Ledger

Include a compact coverage ledger when the report is substantial, diagnostics are fragile, or the user needs an auditable artifact trail.

| Required element | Covered where | Source |
|---|---|---|
| Discovery scope | Section [x] | [conversation / sidecar state] |
| Data and variables | Section [x] | [data files / `data_analyst` / user-provided output] |
| Graph target and method | Section [x] | [executed code / discovery artifact] |
| Graph findings | Section [x] | [graph plot / edge list / stability table] |
| Diagnostics | Section [x] | [executed code / artifact / not run] |
| Interpretation limits | Section [x] | [diagnostics / assumptions / report text] |
| Reproducibility | Section [x] | [source path / HTML path / artifact index] |
