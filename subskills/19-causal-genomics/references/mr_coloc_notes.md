# MR and Colocalization Notes

## Mendelian Randomization Core Assumptions

1. Relevance: genetic variants are associated with the exposure.
2. Independence: genetic variants are independent of confounders of the exposure-outcome relation.
3. Exclusion restriction: variants affect the outcome only through the exposure.

## Genomics-Specific Threats

- horizontal pleiotropy;
- correlated pleiotropy or shared heritable factors;
- linkage disequilibrium with another causal variant;
- population stratification and ancestry mismatch;
- dynastic effects and assortative mating;
- weak instruments;
- winner's curse;
- sample overlap;
- allele harmonization errors;
- palindromic variants and strand ambiguity;
- tissue or cell-type mismatch;
- QTL batch effects and cell-composition artifacts;
- case-control ascertainment and scale interpretation.

## Core MR Diagnostics

- instrument strength and F-statistics;
- LD clumping or correlated-variant handling;
- harmonization and allele-frequency checks;
- heterogeneity statistics;
- single-SNP and leave-one-out plots;
- MR-Egger intercept where appropriate;
- MR-PRESSO, radial MR, or outlier checks where appropriate;
- weighted median/mode, MR-RAPS, CAUSE, MRMix, or MR-Clust sensitivity where appropriate;
- Steiger directionality or bidirectional MR;
- ancestry, sample overlap, and winner's curse audit;
- STROBE-MR reporting checklist.

## Colocalization Checklist

Use colocalization or fine mapping when interpreting molecular exposures, gene expression, protein abundance, methylation, splicing, or TWAS/SMR hits.

Check:

- same locus and same genome build;
- aligned alleles and comparable variant coverage;
- suitable LD reference;
- multiple causal signals handled when plausible;
- posterior probability for shared causal signal;
- credible sets and posterior inclusion probabilities;
- prior sensitivity;
- tissue/cell-type relevance;
- whether colocalization supports shared signal but not direction by itself.

## Interpretation Rule

MR estimates are not automatically causal. Colocalization is not automatically mediation. TWAS/SMR hits are not automatically causal genes. Strong interpretation depends on instrument validity, LD, pleiotropy, population structure, measurement quality, sample architecture, tissue relevance, and triangulation with biological or experimental evidence.
