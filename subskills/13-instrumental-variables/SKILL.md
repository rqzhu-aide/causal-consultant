---
name: instrumental-variables
description: "Primary route subskill for instrumental-variable designs, encouragement designs, imperfect compliance, fuzzy RD handoff, LATE/CACE estimation, first-stage diagnostics, weak-instrument checks, exclusion/independence/monotonicity audits, falsification checks, R/Python code, and route-fit feedback."
---

# Instrumental Variables

## Role

Use this as a **primary route subskill** when the route relies on an instrument or encouragement. The instrument claim is the design argument; do not accept a variable as an instrument just because it is labeled that way.

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

## Pass / Fail Output

If fit passes, produce IV estimand, diagnostic plan, code path, weak-instrument/sensitivity cautions, and reporting handoff. If fit fails, identify the failed IV condition and recommended route revision or fallback.

## References

- `references/workflow.md`: detailed IV workflow.
- `references/iv_assumption_ledger.md`: assumption ledger.
- `references/iv_bibliography.md`: literature notes.
- `examples/`: reusable R/Python templates.
