---
name: point-treatment-observational
description: Use for observational studies with one primary treatment/exposure time and measured pre-treatment confounders.
---

# Point Treatment Observational

## When to Use

- binary/categorical/continuous treatment measured once
- observational cohort
- registry/EHR/claims point treatment
- cross-sectional exposure with temporal caution

## First Questions

- What defines eligibility and time zero?
- Which confounders were measured before treatment?
- Is the treatment binary, multivalued, or continuous?
- What target population is desired: ATE, ATT, ATC, overlap?
- Are there contraindications or deterministic treatment rules?

## Target Estimands

- ATE
- ATT
- ATC
- ATO
- CATE
- dose-response

## Candidate Methods

- regression adjustment
- g-computation
- matching
- IPW
- overlap weighting
- AIPW
- TMLE
- DML

## Common Packages and Tools

- R MatchIt/WeightIt/cobalt
- R tmle/tmle3/SuperLearner
- Python DoWhy/DoubleML/statsmodels

## Required Diagnostics

- baseline table
- overlap plot
- balance diagnostics
- weight diagnostics
- sensitivity to covariate set
- negative controls where possible

## Red Flags

- confounders measured after treatment
- time zero not aligned
- poor overlap
- unmeasured confounding
- outcome measured before treatment

## Code Templates

- `scripts/R/matchit_weightit_cobalt_template.R`
- `scripts/python/dowhy_point_treatment_template.py`
- `scripts/python/doubleml_irm_template.py`

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Point Treatment Observational Analysis Plan

- Causal question:
- Estimand:
- Data/design requirements:
- Primary method:
- Alternative method:
- Identification assumptions:
- Diagnostics:
- Sensitivity analyses:
- Packages/code templates:
- Interpretation cautions:
```

For more detail, read `references/workflow.md` in this subskill folder.
