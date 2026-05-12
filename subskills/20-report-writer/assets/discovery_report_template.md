# Causal Discovery Report Template

Use this template when the user's requested deliverable is a causal-discovery-only report. This report is for graph hypotheses, variable screening, causal-path exploration, and discovery diagnostics. It is not an effect-estimation report and must keep claim strength exploratory unless a separate main-workflow review validates stronger interpretation.

# [Discovery Report Title]

## Executive Summary

- **Discovery goal:** [Graph exploration, graph comparison, variable screening, discovery diagnostics, or discovery-only report.]
- **Bottom line:** [Most useful graph hypothesis or uncertainty pattern.]
- **Claim strength:** exploratory.
- **Main artifact:** [Graph, CPDAG, PAG, edge list, stability table, or screening result.]
- **Main caution:** [Most important limitation, such as latent confounding, weak orientation stability, sample size, timing uncertainty, or preprocessing risk.]

## 1. Discovery Question And Scope

State what the user asked the discovery workflow to learn. Distinguish the workflow path from graph paths:

- **Workflow path:** why the project used the causal-discovery sidecar instead of an effect-estimation route.
- **Causal graph path:** any directed or partially directed chain in the discovered graph, such as `X -> M -> Y`.

Say explicitly whether the report is only exploratory or whether any finding is being sent to Data Technician, Design Planner, DAG Builder, or Report Writer for separate review.

## 2. Data And Variable Inventory

Summarize the data used for discovery:

- row unit, time structure, and whether observations are IID, clustered, panel, longitudinal, time series, mixed, or text-derived;
- sample size, variable count, variable types, missingness, and measurement concerns;
- variables included, excluded, or grouped before discovery;
- known interventions, temporal tiers, required edges, forbidden edges, and other background knowledge;
- preprocessing choices and any leakage, collider, selection, or post-treatment risks.

Do not invent sample sizes, descriptive statistics, missingness rates, or preprocessing facts. Use placeholders when evidence is unavailable.

## 3. Discovery Target And Method

Describe the graph object and algorithm family:

- target object: DAG, CPDAG, PAG, ancestral graph, edge list, variable screen, or graph comparison;
- method family: PC/stable-PC, FCI/RFCI/GFCI, GES/FGES, LiNGAM, additive-noise methods, PCMCI/Granger/time-series workflow, Tetrad workflow, or other;
- key assumptions: causal sufficiency or latent confounding allowance, acyclicity, faithfulness, stationarity, non-Gaussianity, functional form, selection mechanism, and temporal ordering;
- tuning choices, tests, scores, seeds, software packages, and code paths when available.

## 4. Candidate Graph Findings

Report discovered graph material with cautious language:

- likely or stable candidate edges;
- uncertain or weakly oriented edges;
- equivalence-class ambiguity, such as CPDAG/PAG marks;
- edges that conflict with temporal order or background knowledge;
- graph plots, edge lists, and stability artifacts.

Use phrases such as "suggests a graph hypothesis," "is compatible with," or "raises a candidate edge." Do not use "proves" or "establishes causality."

## 5. Candidate Causal Paths

Summarize important graph paths only when supported by the discovered artifact:

- candidate upstream drivers of an outcome;
- possible mediating chains, such as `A -> B -> C`;
- alternative paths that remain ambiguous because of equivalence classes or weak orientation;
- paths that require domain review before they influence adjustment, route choice, or claim language.

If no reliable path can be stated, say that the graph does not support stable path interpretation.

## 6. Confounders, Mediators, Colliders, And Adjustment Warnings

List variable-role hypotheses cautiously:

- possible confounders for important relationships;
- possible mediators or mechanisms;
- possible colliders or selection variables that should not be controlled for without DAG review;
- variables that may be downstream of treatment or constructed from outcomes.

Discovery output can suggest adjustment questions, but it cannot choose the final adjustment set. Any adjustment implication must go through DAG Builder or the relevant main-workflow owner.

## 7. Diagnostics And Stability

Summarize checks that limit interpretation:

| Check | Status | Evidence | Interpretation impact |
|---|---|---|---|
| Edge stability | [pass/concern/fail/not run/not applicable] | [artifact or note] | [impact] |
| Orientation stability | [status] | [artifact or note] | [impact] |
| Tuning/test/score sensitivity | [status] | [artifact or note] | [impact] |
| Background-knowledge consistency | [status] | [artifact or note] | [impact] |
| Hidden-confounding risk | [status] | [artifact or note] | [impact] |
| Temporal or non-IID assumptions | [status] | [artifact or note] | [impact] |
| Preprocessing risk | [status] | [artifact or note] | [impact] |

If diagnostics were not run, state that the report is a preliminary discovery memo.

## 8. Interpretation

Explain what the discovery result is useful for:

- forming graph hypotheses;
- prioritizing domain review;
- narrowing variables for later DAG work;
- identifying candidate pathways for future effect estimation;
- documenting uncertainty or graph non-uniqueness.

Also state what should not be inferred: no effect size, no validated intervention effect, no final adjustment set, and no upgraded causal claim unless a separate validated route supports it.

## 9. Recommended Next Effect-Estimation Questions

When useful, propose candidate next questions without running them automatically:

- candidate treatment or exposure;
- candidate comparator;
- candidate outcome;
- candidate population, unit, and time horizon;
- suggested owner review before estimation, such as Data Technician, Design Planner, or DAG Builder;
- data or design information needed before effect estimation.

Frame these as follow-up options, not as completed causal answers.

## 10. Limitations And Reproducibility

Summarize:

- hidden variables, selection, measurement error, and temporal-order uncertainty;
- sample-size, high-dimensional conditioning, missingness, or non-IID limits;
- faithfulness, Markov, functional-form, stationarity, or causal-sufficiency assumptions;
- software package, seed, tuning, and preprocessing reproducibility notes;
- artifact index for code, graph plots, edge lists, stability tables, and report files.

| Artifact | Path | Purpose |
|---|---|---|
| [name] | [relative path] | [why it matters] |
