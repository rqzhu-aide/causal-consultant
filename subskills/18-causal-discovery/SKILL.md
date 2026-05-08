---
name: causal-discovery
description: "Discovery and exploration module for learning or comparing causal graph hypotheses from data using constraint-based, score-based, functional, time-series, or hybrid discovery methods with Python, R, or Java/Tetrad workflows, validation guardrails, and handoff to DAG auditing before causal claims."
---

# Causal Discovery

## Role

Use this as a **discovery and exploration module**. It proposes or compares graph hypotheses; it does not by itself validate causal claims. Any discovered graph that supports an effect claim must return to `04-dag-builder` and the main skill gate before claim strength is increased.

## Fit Check

Given the handoff, check:

- data type: cross-sectional, longitudinal, time series, mixed, interventional, experimental, or multi-domain;
- assumptions: causal sufficiency, faithfulness, acyclicity, stationarity, non-Gaussianity, functional form, measurement quality, and sample size;
- background knowledge, forbidden/required edges, temporal ordering, and known interventions;
- whether the task is hypothesis generation, graph comparison, variable screening, or downstream adjustment support;
- whether validation, stability checks, and sensitivity to algorithm assumptions are possible.

If assumptions are weak, keep output exploratory and route graph claims back to the main skill and DAG Builder.

## Package And Code Fit

Candidate tools include R `pcalg`, `bnlearn`, Python `causal-learn`, `lingam`, `tigramite`, and Java/Tetrad workflows. Confirm package support for the graph type, data type, background knowledge, and output interpretation.

## Pass / Fail Output

If fit passes, produce discovery plan, algorithm choice, stability checks, code path, graph hypotheses, and DAG handoff. If fit fails, report why discovery is not appropriate or should remain exploratory.

## References

- `references/workflow.md`: detailed discovery workflow.
- `references/discovery_readme.md`: tool orientation.
- `references/discovery_references.md`: literature notes.
- `examples/`: R, Python, and Tetrad templates.
