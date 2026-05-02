# Workflow: Regression Discontinuity

## Purpose

Use this workflow when treatment, eligibility, dose, or policy assignment changes at a known cutoff of a running variable. The workflow should verify the cutoff design, estimate a local effect, and diagnose manipulation, continuity, and bandwidth sensitivity.

## Stage 1: Assignment Rule

Define:

- running variable;
- cutoff;
- treatment side;
- treatment or eligibility variable;
- outcome;
- timing of running variable, treatment, and outcome;
- whether assignment is sharp, fuzzy, kink, or local randomization;
- local population near the cutoff.

If the cutoff or running variable is unclear, stop before estimation.

## Stage 2: Estimand

Choose:

- sharp RD local ATE at the cutoff;
- fuzzy RD LATE for cutoff compliers;
- regression kink effect;
- local randomization ATE within a chosen window.

State that RD is local. The result does not automatically generalize away from the cutoff.

## Stage 3: Feasibility and Assumptions

Assess:

- continuity of potential outcomes at the cutoff;
- no precise manipulation or sorting;
- local support on both sides of the cutoff;
- covariate continuity and placebo outcomes;
- treatment jump or first stage for fuzzy RD;
- whether mass points, heaping, missingness, or selection threaten the design.

## Stage 4: Method Selection

Use local polynomial RD with robust bias-corrected inference when:

- the design is sharp or fuzzy;
- there is adequate support near the cutoff;
- the running variable is reasonably continuous or mass points are handled.

Use fuzzy RD when:

- treatment probability jumps but not deterministically;
- cutoff eligibility can be interpreted like a local instrument.

Use local randomization when:

- a narrow window near the cutoff plausibly behaves like random assignment;
- the user wants randomization-inference style checks.

Use donut RD when:

- units exactly at or very near the cutoff may be manipulated or heaped;
- the exclusion window is justified before inspecting favorable results.

Avoid global polynomial models as the primary causal estimator.

## Stage 5: Diagnostics and Sensitivity

Report:

- RD plot;
- local sample size and support on both sides;
- density/manipulation test;
- covariate continuity;
- placebo outcomes or placebo cutoffs when meaningful;
- bandwidth sensitivity;
- donut sensitivity if justified;
- first-stage jump for fuzzy RD;
- mass-point/discrete-score checks.

## Stage 6: Interpretation and Fallback

Interpret the result as local to units near the cutoff. If diagnostics fail:

- consider donut RD only if manipulation/heaping is localized;
- narrow to a local-randomization window if plausible;
- treat the result as descriptive if manipulation or covariate jumps are severe;
- route to IV for fuzzy first-stage concerns;
- route to missingness/measurement/selection if running-variable measurement is compromised;
- recommend prospective design or another quasi-experiment.

## Suggested Response Pattern

```markdown
I would treat this as an RD problem because treatment changes at [cutoff] of [running variable].

The target estimand is [sharp local effect/fuzzy local complier effect], which applies to units near the cutoff.

My primary route would be [local polynomial RD/fuzzy RD/local randomization] using [software]. I would not rely on a global polynomial.

Before interpreting this causally, I would check [density/manipulation], [covariate continuity], [RD plot], and [bandwidth sensitivity].

If [main RD validity concern] fails, I would [fallback plan].
```

## Code Template Index

Root templates:

- `scripts/R/rdrobust_template.R`
- `scripts/python/rdrobust_template.py`

Adapt variable names, cutoff, treatment side, fuzzy treatment variable, bandwidth options, cluster/mass-point handling, and sensitivity checks before returning code.

## Literature and Software Map

For key papers, textbooks, and software notes, read `literature_and_software.md` in this folder.
