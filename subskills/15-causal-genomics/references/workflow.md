# Workflow: Causal Genomics

## Goal

Use for Mendelian randomization, colocalization, fine mapping, omics mediation, genetic instruments, pleiotropy, and multi-omics causal questions.

## Intake Checklist

- [ ] What are exposure and outcome GWAS/omics datasets?
- [ ] Are instruments strong and independent?
- [ ] Is sample overlap present?
- [ ] Is population ancestry matched?
- [ ] Could horizontal pleiotropy affect outcome?
- [ ] Is colocalization needed before MR interpretation?

## Estimand Checklist

- MR causal effect
- local colocalized effect
- mediated genetic effect
- direct/indirect omics effect

The agent should state which estimand is being targeted and what estimands are not being targeted.

## Analysis Planning

1. Describe the data structure and timing.
2. Define the target estimand and scale.
3. Choose a primary method from the candidate methods.
4. List required assumptions and diagnostics.
5. State what would invalidate or weaken the analysis.
6. Specify software and code templates.
7. Plan sensitivity analyses.

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

## Diagnostics

- F-statistics/weak instruments
- LD clumping
- heterogeneity
- pleiotropy tests
- leave-one-out
- funnel/scatter plots
- colocalization posterior
- ancestry/sample overlap

## Common Packages

- R TwoSampleMR
- R MendelianRandomization
- R coloc
- R ieugwasr
- R MR-PRESSO
- R CAUSE

## Failure Modes

- horizontal pleiotropy
- weak instruments
- LD not handled
- population stratification
- winner's curse
- no colocalization for molecular trait claims
- reverse causality

## Suggested Response Pattern

```markdown
I would treat this as a [causal-genomics] problem because [design reason].

The target estimand appears to be [estimand], defined as [definition].

A reasonable primary analysis is [method], implemented with [package], because [justification].

This requires [assumptions]. I would check [diagnostics].

If [main diagnostic] fails, I would [fallback plan].
```
