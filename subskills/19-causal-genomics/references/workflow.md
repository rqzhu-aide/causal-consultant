# Workflow: Causal Genomics

## Goal

Use this workflow when the user wants to use genetic or omics data for causal inference, gene prioritization, drug-target evidence, or pathway triangulation. This includes Mendelian randomization, cis-MR, trans-MR, colocalization, fine mapping, TWAS, SMR, polygenic instruments, multi-omics mediation, and pleiotropy diagnostics.

The goal is not to turn every genetic association into a causal claim. The workflow should separate association, instrument validity, shared causal signal, biological context, and triangulated causal evidence.

## Intake Checklist

- [ ] What is the exposure: trait, risk factor, gene expression, protein, metabolite, methylation, splicing, chromatin, microbiome, or polygenic liability?
- [ ] What is the outcome, scale, case/control definition, and target population?
- [ ] What datasets are being used for exposure, outcome, and molecular QTLs?
- [ ] What ancestry, tissue, cell type, age, sex, disease state, and assay context apply?
- [ ] Is the target claim trait-level causality, drug-target evidence, gene prioritization, mediation, or exploratory screening?
- [ ] Are instruments genome-wide, cis, trans, candidate variants, or polygenic scores?
- [ ] Are instrument strength, LD, allele harmonization, and genome build known?
- [ ] Is sample overlap possible?
- [ ] Is winner's curse likely because the same data discovered and estimated instruments?
- [ ] Could horizontal or correlated pleiotropy explain the finding?
- [ ] Is colocalization or fine mapping required before interpreting a molecular exposure?
- [ ] Is within-family or ancestry-specific evidence needed?

## Estimand Checklist

The agent should state which estimand is being targeted and which estimands are not being targeted.

Common targets:

- two-sample MR causal effect;
- one-sample MR/2SLS effect;
- local cis-MR molecular effect;
- drug-target effect;
- multivariable MR direct effect;
- bidirectional causal evidence;
- colocalized molecular effect;
- TWAS/SMR gene-prioritization evidence;
- mediated genetic effect;
- multi-omics pathway evidence;
- within-family MR effect;
- exploratory association or triangulation evidence.

### Choosing among estimands

Use two-sample MR when independent, ancestry-matched exposure and outcome GWAS are available and instruments are strong.

Use cis-MR plus colocalization for gene expression, protein, methylation, or metabolite exposures near a locus.

Use multivariable MR when the question is a direct effect conditional on related exposures.

Use TWAS/SMR as gene prioritization unless colocalization, instrument validity, and biology support stronger language.

Use within-family MR when population structure, dynastic effects, or assortative mating are plausible threats, especially for social, behavioral, education, fertility, and anthropometric traits.

Use exploratory triangulation when instruments are weak, tissue is uncertain, or colocalization is missing.

## Route Coordination

| Parent or adjacent route | Genomics implication |
|---|---|
| Generic IV | MR inherits relevance, independence, and exclusion restrictions plus genomics-specific threats |
| Mediation | omics pathways need direct/indirect estimands plus genetic colocalization and pleiotropy checks |
| Missingness/measurement/selection | batch effects, tissue selection, ancestry, case ascertainment, and assay error may dominate |
| Survival | MR outcome scale may be liability, log odds, risk, hazard, or survival endpoint; interpret carefully |
| Causal discovery | learned gene networks are not automatically causal pathways without perturbation/IV evidence |
| Reporting | use STROBE-MR for MR and explicit triangulation language for gene prioritization |

## Analysis Planning

1. Restate the biological causal question and distinguish causal effect from gene prioritization.
2. Inventory exposure, outcome, QTL, LD reference, ancestry, tissue, and sample overlap.
3. Choose the method family: MR, cis-MR, multivariable MR, colocalization, fine mapping, TWAS/SMR, or triangulation.
4. Define instruments and the target estimand before looking at outcome associations.
5. Harmonize alleles, genome builds, effect scales, and LD reference.
6. Plan diagnostics for strength, LD, pleiotropy, directionality, overlap, ancestry, and colocalization.
7. Choose a primary method and small sensitivity set.
8. Decide what would downgrade the claim to exploratory.
9. Record assumptions, diagnostics, and limitations.

## Candidate Methods

### Two-sample MR

Use when exposure and outcome GWAS summary statistics are available. IVW is often the primary estimator when instruments are strong and approximately valid. Pair with robust and pleiotropy-aware sensitivity methods.

### One-sample MR and individual-level IV

Use when individual-level genotype, exposure, outcome, and covariates are available. Use 2SLS or other IV estimators, account for relatedness and ancestry, and watch weak-instrument bias.

### Cis-MR and drug-target MR

Use cis-eQTL, cis-pQTL, or other local instruments for molecular traits and drug-target questions. Require colocalization/fine mapping and tissue relevance before strong causal interpretation.

### Multivariable MR

Use when exposures are correlated, such as lipid traits, inflammatory markers, multiple proteins, or omics layers. Check conditional instrument strength and collinearity.

### Robust MR

Use MR-Egger, weighted median, weighted mode, MR-PRESSO, MR-RAPS, radial MR, MRMix, CAUSE, MR-Clust, and related tools to assess robustness to pleiotropy, outliers, weak instruments, and heterogeneous mechanisms. Interpret disagreements as information, not a nuisance.

### Colocalization and fine mapping

Use coloc, coloc+SuSiE, HyPrColoc, eCAVIAR, FINEMAP, susieR, or related methods when molecular and disease traits share a locus. Check multiple causal signals and LD reference quality.

### TWAS, PrediXcan, FUSION, SMR, and HEIDI

Use for gene prioritization and transcriptome/regulome-wide screens. Add colocalization or fine mapping before causal gene claims. Treat HEIDI and TWAS fine mapping as diagnostics, not final proof.

### Within-family MR

Use when ancestry, dynastic effects, assortative mating, or family-level confounding are likely. Expect lower power and smaller instrument strength but stronger protection against some biases.

### Multi-omics mediation and pathway triangulation

Use when the user asks about pathways across genotype, molecular traits, biomarkers, and disease. Coordinate with mediation. Require biological ordering, tissue context, colocalization, and multiple-testing control.

## Domain-Specific Guidance

### Drug targets and therapeutic inference

- Prefer cis-pQTL or cis-eQTL instruments at or near the drug target.
- Check whether instruments mimic target inhibition, activation, or lifelong altered expression.
- Run phenome-wide scans for likely on-target and off-target effects.
- Colocalize target molecular trait and disease outcome.
- Compare with randomized trial evidence, pharmacology, animal/functional assays, and safety biology.

### Expression, protein, methylation, and metabolites

- Expression and methylation are tissue- and context-specific.
- Protein QTLs may reflect assay binding artifacts or protein-altering variants rather than abundance.
- Metabolite QTLs can be pleiotropic through upstream enzymes or pathways.
- Cell composition and batch effects can look like biology.

### Social, behavioral, and psychiatric traits

- Population structure, dynastic effects, assortative mating, and geographic confounding are often serious.
- Within-family evidence or triangulation is especially valuable.
- Interpret genetic liability scales carefully.
- Be cautious with education, income, behavior, fertility, and neighborhood-linked outcomes.

### Cross-ancestry and underrepresented populations

- LD, allele frequency, variant tagging, and effect sizes can differ by ancestry.
- Analyze ancestry-specific GWAS when possible.
- Do not assume European instruments transfer cleanly.
- Report portability limits and avoid hiding ancestry behind "adjusted for PCs."

### Multi-omics and high-dimensional screens

- Predefine filtering and multiple-testing correction.
- Separate discovery from validation.
- Replicate across independent QTL resources, tissues, or assays.
- Treat selected omics hits as candidates unless supported by colocalization and biology.

## Diagnostics

### Required before causal interpretation

- instrument strength;
- allele and genome-build harmonization;
- LD clumping or correlated-variant plan;
- ancestry and LD-reference match;
- sample overlap and winner's curse audit;
- heterogeneity and leave-one-out;
- pleiotropy sensitivity;
- directionality or bidirectional evidence;
- colocalization/fine mapping for molecular claims;
- tissue/cell-type relevance;
- replication or triangulation.

### Method-specific

For two-sample MR:

- F-statistics or variance explained;
- IVW, weighted median/mode, MR-Egger, and robust estimator comparison;
- Cochran Q and heterogeneity;
- MR-Egger intercept where suitable;
- MR-PRESSO/radial/outlier checks when suitable;
- Steiger directionality where suitable.

For cis-MR and drug targets:

- cis window and instrument selection;
- colocalization posterior;
- fine-mapping credible sets;
- target specificity;
- pQTL/eQTL tissue context;
- phenome-wide safety scan.

For TWAS/SMR:

- expression model performance;
- tissue relevance;
- LD consistency;
- HEIDI or heterogeneity checks;
- coloc/fine-mapping follow-up;
- multiple-testing correction.

For within-family MR:

- family structure and sibling/trio sample size;
- within-family instrument strength;
- family fixed-effect specification;
- comparison with unrelated-individual estimates.

## Failure Modes

- Genetic association is interpreted as causation.
- TWAS/SMR hit is interpreted as a causal gene without colocalization.
- Colocalization is claimed when multiple causal variants are ignored.
- LD reference does not match ancestry.
- Palindromic variants are mishandled.
- Sample overlap and weak instruments are ignored.
- Winner's curse inflates exposure associations.
- Horizontal pleiotropy is dismissed after one robust method.
- Correlated pleiotropy creates false-positive MR.
- Population stratification, dynastic effects, or assortative mating bias social/behavioral MR.
- pQTL signal reflects assay artifact or protein-altering epitope effect.
- Tissue/cell type is biologically irrelevant.
- A null result is overinterpreted despite low power.

## Suggested Response Pattern

```markdown
I would treat this as a causal-genomics problem because the user wants to use [genetic/QTL/omics evidence] to evaluate whether [exposure] affects [outcome].

The target claim appears to be [MR causal effect / drug-target effect / colocalized molecular effect / gene prioritization]. That is different from [association/TWAS hit/colocalization-only result].

A reasonable primary analysis is [method], using [software], because [data structure]. This requires [instrument validity, ancestry, LD, sample overlap, pleiotropy, colocalization assumptions].

I would check [diagnostics]. If [colocalization/pleiotropy/strength/overlap] fails, I would downgrade the claim to [exploratory gene prioritization / no causal conclusion / need better QTL data].
```

## Output Template

```markdown
### Causal Genomics Analysis Plan

#### 1. Question and evidence
- Exposure:
- Outcome:
- Biological layer:
- Tissue/context:
- Datasets:
- Target claim:

#### 2. Estimand
- Target estimand:
- Estimands not targeted:
- Exposure scale:
- Outcome scale:
- Target ancestry/population:

#### 3. Instruments and data QC
- Instrument source:
- Selection threshold:
- Strength:
- LD/clumping:
- Harmonization:
- Sample overlap:
- Ancestry/LD reference:

#### 4. Assumptions
- Relevance:
- Independence:
- Exclusion restriction:
- Pleiotropy:
- Colocalization/fine mapping:
- Tissue relevance:
- Directionality:

#### 5. Estimation plan
- Primary method:
- Sensitivity methods:
- Software:
- Inference:

#### 6. Diagnostics
- Strength/LD:
- Heterogeneity:
- Pleiotropy/outliers:
- Directionality:
- Colocalization:
- Replication/triangulation:

#### 7. Interpretation
- What can be claimed causally:
- What remains prioritization:
- Fatal flaws or limitations:
- Next step:
```

## Reference Files

- `mr_coloc_notes.md`: compact MR/colocalization assumptions and diagnostics.
- `literature_and_software.md`: literature map, software map, and method-selection notes.
