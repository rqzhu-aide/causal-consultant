# Literature and Software: Causal Genomics

## Purpose

This map supports subskill 15. Use it when selecting methods for Mendelian randomization, colocalization, fine mapping, TWAS/SMR, drug-target MR, multi-omics mediation, pleiotropy diagnosis, sample-overlap checks, ancestry concerns, and genomic evidence triangulation.

The field moves quickly. Treat this as a methods map, not an exhaustive bibliography. When current software behavior matters, check package documentation before giving production code.

## Anchor Literature

### MR foundations and reporting

- Davey Smith and Ebrahim (2003), "Mendelian randomization: can genetic epidemiology contribute to understanding environmental determinants of disease?," is the classic MR framing paper. Source: https://academic.oup.com/ije/article/32/1/1/642797
- Lawlor, Harbord, Sterne, Timpson, and Davey Smith (2008), "Mendelian randomization: using genes as instruments for making causal inferences in epidemiology," is a core methods review. Source: https://onlinelibrary.wiley.com/doi/10.1002/sim.3034
- Burgess, Thompson, and CRP CHD Genetics Collaboration (2011), "Avoiding bias from weak instruments in Mendelian randomization studies," is a key weak-instrument reference. Source: https://academic.oup.com/ije/article/40/3/755/743230
- Skrivankova et al. (2021), "Strengthening the Reporting of Observational Studies in Epidemiology Using Mendelian Randomization: The STROBE-MR Statement," gives the reporting checklist for MR studies. Source: https://jamanetwork.com/journals/jama/fullarticle/2785494
- STROBE-MR maintains checklist and explanation documents for transparent MR reporting. Source: https://www.strobe-mr.org/

### Two-sample MR software and common estimators

- Hemani et al. (2018), "The MR-Base platform supports systematic causal inference across the human phenome," underlies many `TwoSampleMR`/OpenGWAS workflows. Source: https://elifesciences.org/articles/34408
- Yavorska and Burgess (2017), "MendelianRandomization: an R package for performing Mendelian randomization analyses using summarized data," documents summarized-data MR methods. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC5510723/
- Bowden, Davey Smith, and Burgess (2015), MR-Egger regression, is a core method for directional pleiotropy sensitivity. Source: https://academic.oup.com/ije/article/44/2/512/753473
- Bowden et al. (2016), weighted median estimation, is useful when at least half the weight comes from valid instruments. Source: https://academic.oup.com/ije/article/45/4/1261/2916055
- Hartwig, Davey Smith, and Bowden (2017), weighted mode estimation, is useful under plurality-valid assumptions. Source: https://academic.oup.com/ije/article/46/6/1985/3950594

### Pleiotropy, robust MR, and weak instruments

- Verbanck, Chen, Neale, and Do (2018), MR-PRESSO, detects and corrects some horizontal pleiotropic outliers; it is best treated as one sensitivity tool. Source: https://www.nature.com/articles/s41588-018-0099-7
- Zhao, Wang, Hemani, Bowden, and Small (2020), MR-RAPS, gives robust adjusted profile score inference for many weak instruments and balanced pleiotropy. Source: https://www.statslab.cam.ac.uk/~qz280/publication/mr-raps/
- Morrison, Knoblauch, Marcus, Stephens, and He (2020), CAUSE, models correlated and uncorrelated pleiotropy using genome-wide summary statistics. Source: https://www.nature.com/articles/s41588-020-0631-4
- Qi and Chatterjee (2019), MRMix, uses mixture models for robust MR with many potentially invalid instruments. Source: https://www.nature.com/articles/s41467-019-09432-2
- Foley, Mason, Kirk, and Burgess (2021), MR-Clust, clusters variants with similar causal estimates to reveal heterogeneous mechanisms or invalid clusters. Source: https://academic.oup.com/bioinformatics/article/37/4/531/5904264
- Cinelli, LaPierre, Hill, Sankararaman, Eskin, and collaborators (2022), robust MR with residual population stratification, batch effects, and pleiotropy, is useful for modern genome-wide concerns. Source: https://www.nature.com/articles/s41467-022-28553-9

### Sample overlap, winner's curse, and family-based MR

- Brumpton, Sanderson, Heilbron, Hartwig, Hemani, Davies, and collaborators (2020), within-family MR, shows how dynastic effects, assortative mating, and population stratification can bias unrelated-individual MR and how family designs can help. Source: https://www.nature.com/articles/s41467-020-17117-4
- Davies, Howe, Brumpton, Havdahl, Evans, and Davey Smith (2019), "Within family Mendelian randomization studies," reviews family-based designs. Source: https://academic.oup.com/hmg/article/28/R2/R170/5601927
- Sadreev et al. (2021), "Navigating sample overlap, winner's curse and weak instrument bias in Mendelian randomization studies using the UK Biobank," is useful for modern biobank overlap and winner's curse concerns. Source: https://www.medrxiv.org/content/10.1101/2021.06.28.21259622.full

### Colocalization and fine mapping

- Giambartolomei et al. (2014), "Bayesian test for colocalisation between pairs of genetic association studies using summary statistics," is the classic `coloc` method. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC4022491/
- Wallace (2021), "A more accurate method for colocalisation analysis allowing for multiple causal variants," recommends coloc with SuSiE when multiple causal variants may exist. Source: https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1009440
- Zou, Carbonetto, Wang, and Stephens (2022), "Fine-mapping from summary data with the Sum of Single Effects model," explains SuSiE with summary statistics and LD diagnostics. Source: https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.1010299
- Hukku et al. (2021), "Probabilistic colocalization of genetic variants from complex and molecular traits: promise and limitations," is a practical limitations review. Source: https://pubmed.ncbi.nlm.nih.gov/33308443/
- Foley et al. (2021), HyPrColoc, provides fast multi-trait colocalization. Source: https://www.nature.com/articles/s41467-020-20885-8
- Zhang et al. (2024), SharePro, is a recent multiple-signal colocalization method. Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC11105950/

### TWAS, SMR, and gene prioritization

- Gusev et al. (2016), FUSION/TWAS, integrates gene expression prediction models with GWAS summary statistics. Source: https://www.nature.com/articles/ng.3506
- Zhu et al. (2016), SMR/HEIDI, integrates GWAS and eQTL summary data to prioritize genes and test heterogeneity. Source: https://www.nature.com/articles/ng.3538
- Gusev lab FUSION documentation is the practical software entry point for TWAS. Source: https://gusevlab.org/projects/fusion/
- Wainberg et al. and later interpretation papers caution that TWAS signals are not automatically causal genes and need LD, colocalization, and tissue checks. A useful modern interpretation paper is "On the interpretation of transcriptome-wide association studies." Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC10508613/
- Richardson et al. (2020), transcriptome-wide MR across the human phenome, is useful for tissue-dependent regulatory mechanisms. Source: https://www.nature.com/articles/s41467-019-13921-9
- Zhou et al. (2020), MR-JTI, gives a joint-tissue transcriptome-wide association and MR framework. Source: https://www.nature.com/articles/s41588-020-0706-2

## Method Selection Notes

### Two-sample MR

Use for trait-level exposure-outcome questions with independent, ancestry-matched GWAS. IVW can be primary if instruments are strong and pleiotropy is not dominant. Always report sensitivity methods and limitations.

### Robust MR

Use robust methods to explore failure modes:

- MR-Egger for directional pleiotropy under InSIDE assumptions;
- weighted median/mode for majority/plurality valid assumptions;
- MR-PRESSO/radial MR for outlier patterns;
- MR-RAPS for many weak instruments and balanced pleiotropy;
- CAUSE for correlated pleiotropy;
- MRMix and MR-Clust for invalid-instrument mixtures and heterogeneous mechanisms.

Do not select the most favorable estimator after seeing results without disclosing it.

### Cis-MR and drug-target MR

Use cis instruments for molecular and target-specific questions. Require colocalization/fine mapping and biological plausibility. For proteins, watch assay artifacts, protein-altering variants, and trans-pQTL pleiotropy.

### Colocalization and fine mapping

Use for molecular trait and disease-locus claims. Standard coloc assumes at most one causal variant unless using multiple-signal extensions such as coloc+SuSiE. Results depend on variant coverage, priors, LD, and summary-statistic quality.

### TWAS/SMR

Use as gene-prioritization screens. Follow with colocalization, fine mapping, tissue validation, functional annotation, and replication before causal language.

### Within-family MR

Use when family-level or ancestry confounding is plausible. It is especially important for social, behavioral, educational, fertility, and geography-linked traits.

### Multi-omics mediation

Coordinate with mediation. Genetic evidence can support ordering, but mediation claims still require direct/indirect estimands, tissue context, and sensitivity to pleiotropy and measurement error.

## Software Map

### R

- `TwoSampleMR`: harmonization, OpenGWAS extraction, standard MR estimators, plots, leave-one-out, Steiger checks. Documentation: https://mrcieu.github.io/TwoSampleMR/
- `ieugwasr`: OpenGWAS API access. Documentation: https://mrcieu.github.io/ieugwasr/
- `MendelianRandomization`: summarized-data MR including IVW, MR-Egger, median, robust, penalized, and correlated-variant options. Documentation: https://cran.r-project.org/package=MendelianRandomization
- `MRPRESSO`: pleiotropy residual sum and outlier tests. Source: https://github.com/rondolab/MR-PRESSO
- `mr.raps`: robust adjusted profile score. Documentation: https://cran.r-project.org/package=mr.raps
- `cause`: CAUSE model for correlated and uncorrelated pleiotropy. Source: https://github.com/jean997/cause
- `MRMix`, `MRClust`, `RadialMR`, `MR-TRYX`: robust/outlier/cluster/pleiotropy exploration tools.
- `coloc`: Bayesian colocalization, including SuSiE workflows in current versions. Documentation: https://chr1swallace.r-universe.dev/coloc
- `susieR`: fine mapping with individual or summary statistics. Documentation: https://stephenslab.github.io/susieR/
- `hyprcoloc`: multi-trait colocalization.
- `gwasglue`, `gassocplot`, `LDlinkR`, and `bigsnpr`: data integration, LD, and summary-statistic workflows.

### Command-line and external tools

- `PLINK`/`PLINK2`: clumping, pruning, LD, QC, allele frequency, genotype operations.
- `SMR`: SMR/HEIDI analysis for GWAS plus eQTL/pQTL data.
- `FUSION`: TWAS with precomputed expression weights and GWAS summary statistics.
- `PrediXcan`, `S-PrediXcan`, `S-MultiXcan`: transcriptome prediction and association workflows.
- `FINEMAP`, `CAVIAR`, `eCAVIAR`, and related tools: fine mapping and colocalization support.
- `liftOver`, `bcftools`, `tabix`, `LDSC`, and `munge_sumstats.py`: build conversion, summary-statistic QC, and genetic correlation support.

### Python

- `pandas`, `numpy`, `scipy`, and `statsmodels`: custom MR estimators, QC, and harmonization.
- `pandas-plink`, `hail`, and `limix`: genotype/QTL workflows.
- `tensorqtl` and `qtltools`: QTL mapping when individual-level data are available.

## Diagnostics by Method

### Two-sample MR

- F-statistics and variance explained;
- SNP count and instrument selection threshold;
- LD clumping and ancestry match;
- allele harmonization and palindromic SNP handling;
- sample overlap/winner's curse;
- heterogeneity, outliers, and leave-one-out;
- robust method agreement;
- directionality and bidirectional checks;
- STROBE-MR reporting.

### Cis-MR/drug target

- cis window and target mapping;
- QTL strength;
- pQTL/eQTL tissue context;
- colocalization posterior;
- fine-mapping credible sets;
- target specificity and off-target PheWAS;
- functional/clinical triangulation.

### Colocalization/fine mapping

- variant coverage;
- LD reference match;
- multiple causal signals;
- prior sensitivity;
- credible sets and PIPs;
- allele alignment;
- whether colocalization supports shared signal, not direction.

### TWAS/SMR

- expression model performance;
- tissue relevance;
- LD consistency;
- HEIDI/heterogeneity;
- coloc/fine-map follow-up;
- multiple-testing correction;
- external replication.

### Multi-omics

- batch effects and cell composition;
- biological ordering;
- cross-layer colocalization;
- pleiotropy across layers;
- mediator measurement and tissue match;
- discovery/validation split.

## Red Flags

Do not let the analysis silently become a strong causal claim when:

- instruments are weak;
- sample overlap is unknown;
- ancestry is mismatched;
- LD is not handled;
- harmonization is not checked;
- robust MR methods disagree strongly;
- CAUSE or other correlated-pleiotropy methods suggest shared heritable factors;
- molecular and disease signals do not colocalize;
- TWAS/SMR is the only evidence for a causal gene;
- tissue context is implausible;
- social/behavioral MR lacks family-aware sensitivity;
- discovery and estimation use the same dataset without winner's curse discussion;
- multi-omics hits have no replication or biological validation.

## Reporting Language

Use calibrated language:

- "The MR estimate is consistent with a causal effect under the relevance, independence, and exclusion-restriction assumptions."
- "The coloc result supports a shared association signal at this locus; it does not by itself establish direction or mediation."
- "This TWAS/SMR hit prioritizes the gene for follow-up; causal interpretation requires additional colocalization and functional evidence."
- "Because sample overlap and weak instruments are likely, the estimate may be biased toward the observational association."
- "Within-family evidence would be valuable because dynastic effects and population structure are plausible."

Avoid:

- "Gene X causes disease Y" from TWAS alone.
- "MR proves causality."
- "MR-PRESSO fixed pleiotropy."
- "Colocalized means mediated."
- "European LD reference is fine" without ancestry justification.
