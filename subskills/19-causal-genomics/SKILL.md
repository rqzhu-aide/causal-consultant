---
name: causal-genomics
description: "Domain-specific primary route bundle for Mendelian randomization, genetic instruments, GWAS/eQTL/pQTL/mQTL, colocalization, fine mapping, TWAS/SMR, polygenic scores as instruments, omics mediation, drug-target MR, pleiotropy, ancestry/population structure, sample overlap, LD, and genomic evidence triangulation."
---

# Causal Genomics

## Role

Use this as a **domain-specific route bundle** for genetic and omics causal questions. It often combines IV logic, colocalization, mediation, negative controls, and domain-specific data constraints.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Route-Fit Check

Given the route handoff, check:

- exposure, outcome, genetic instruments or QTLs, ancestry, LD structure, sample overlap, and population;
- estimand: MR effect, drug-target effect, colocalized effect, mediated omics effect, or triangulated evidence;
- relevance, independence, exclusion/pleiotropy, winner's curse, weak instruments, harmonization, strand issues, and population structure;
- whether colocalization, fine mapping, MR sensitivity, multivariable MR, or mediation handoff is needed;
- whether claims should stay triangulation/supportive rather than decisive causal evidence.

If genetic assumptions or data provenance are weak, return feedback to the main skill and constrain claim strength.

## Package And Code Fit

Candidate tools include R `TwoSampleMR`, `MendelianRandomization`, `coloc`, `ieugwasr`, `MR-PRESSO`, `CAUSE`, and domain-specific pipelines. Confirm version, data access, ancestry, LD reference, and API/privacy constraints before code.

## Pass / Fail Output

If fit passes, produce genomic analysis plan, harmonization/sensitivity checks, package/code path, and reporting handoff. If fit fails, identify whether the issue is instrument strength, pleiotropy, colocalization, ancestry, sample overlap, data access, or interpretation.

## References

- `references/workflow.md`: detailed genomics workflow.
- `references/mr_coloc_notes.md`: MR and colocalization notes.
- `references/literature_and_software.md`: literature and software notes.
