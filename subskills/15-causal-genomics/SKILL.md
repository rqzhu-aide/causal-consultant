---
name: causal-genomics
description: Use for Mendelian randomization, colocalization, fine mapping, omics mediation, genetic instruments, pleiotropy, and multi-omics causal questions.
---

# Causal Genomics

## When to Use

- Mendelian randomization
- GWAS/eQTL/pQTL
- colocalization
- omics mediation
- genetic instrument
- pleiotropy

## First Questions

- What are exposure and outcome GWAS/omics datasets?
- Are instruments strong and independent?
- Is sample overlap present?
- Is population ancestry matched?
- Could horizontal pleiotropy affect outcome?
- Is colocalization needed before MR interpretation?

## Target Estimands

- MR causal effect
- local colocalized effect
- mediated genetic effect
- direct/indirect omics effect

## Candidate Methods

- two-sample MR
- one-sample MR
- multivariable MR
- MR-Egger
- weighted median/mode
- MR-PRESSO
- colocalization
- fine mapping
- Steiger directionality

## Common Packages and Tools

- R TwoSampleMR
- R MendelianRandomization
- R coloc
- R ieugwasr
- R MR-PRESSO
- R CAUSE

## Required Diagnostics

- F-statistics/weak instruments
- LD clumping
- heterogeneity
- pleiotropy tests
- leave-one-out
- funnel/scatter plots
- colocalization posterior
- ancestry/sample overlap

## Red Flags

- horizontal pleiotropy
- weak instruments
- LD not handled
- population stratification
- winner's curse
- no colocalization for molecular trait claims
- reverse causality

## Code Templates

- No dedicated script yet; use the workflow and package recipes.

## Operating Instructions

1. Confirm the estimand and target population before recommending a method.
2. Confirm that variables used for adjustment or modeling have valid timing for this design.
3. State identification assumptions separately from model assumptions.
4. Propose a primary analysis and at least one diagnostic or sensitivity analysis.
5. If diagnostics fail, recommend redesign, a different estimand, or a weaker/descriptive interpretation.
6. When returning code, adapt variable names and include comments showing where the user must supply data-specific details.

## Output Template

```markdown
### Causal Genomics Analysis Plan

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
