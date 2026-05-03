---
name: causal-genomics
description: Use for Mendelian randomization, genetic instruments, GWAS/eQTL/pQTL/mQTL, colocalization, fine mapping, TWAS/SMR, polygenic scores used as instruments, omics mediation, drug-target MR, multi-omics causal questions, pleiotropy, ancestry/population structure, sample overlap, winner's curse, LD, and genomic evidence triangulation.
---

# Causal Genomics

## Core Behavior

When this subskill is invoked, focus on whether genetic or omics evidence can support a specific causal interpretation, not just whether a genetic association is statistically significant. Causal genomics often borrows instrumental-variable logic, but genetic instruments add special failure modes: linkage disequilibrium, horizontal pleiotropy, ancestry, sample overlap, winner's curse, weak instruments, dynastic effects, tissue specificity, and whether molecular and disease signals actually colocalize.

Always do these six things:

1. **Define the causal question and biological layer.** Identify exposure, outcome, trait type, tissue, ancestry, age/life-course window, disease state, molecular layer, and whether the user wants etiology, drug-target evidence, biomarker prioritization, mediation, or gene prioritization.
2. **Separate genetic association, colocalization, and causality.** GWAS association, TWAS/SMR signal, eQTL overlap, MR estimate, and colocalization posterior answer different questions. Do not let one stand in for all the others.
3. **Audit instruments and LD.** Check instrument strength, independence, clumping/LD reference, palindromic alleles, allele harmonization, effect scales, genome build, and whether variants are cis, trans, or genome-wide.
4. **Treat pleiotropy as expected.** Plan heterogeneity, directional pleiotropy, correlated pleiotropy, outlier, cluster, multivariable, and colocalization checks. Robust methods diagnose assumptions; they do not make invalid instruments valid automatically.
5. **Check population and sample architecture.** Record ancestry, sex, age, relatedness, case-control ascertainment, sample overlap, winner's curse, batch effects, tissue source, cell composition, and whether within-family or family-aware evidence is needed.
6. **Triangulate evidence.** Strong claims usually require consistency across MR, colocalization/fine mapping, sensitivity methods, tissue biology, functional annotation, perturbation evidence, and external replication.

## User-Facing Style

Be precise and anti-hype. Users may ask "does gene X cause disease Y?" when the available evidence only says "variants near gene X are associated with both expression and disease." Translate terms when useful:

- MR: "uses genetic variants as instruments for an exposure";
- cis-MR: "uses nearby variants as instruments for a molecular trait, often gene expression or protein abundance";
- colocalization: "asks whether two association signals in a locus are likely driven by the same causal variant";
- fine mapping: "assigns posterior probabilities to candidate causal variants within a locus";
- horizontal pleiotropy: "a variant affects the outcome through a route other than the exposure";
- correlated pleiotropy: "the traits share heritable causes that can mimic causality";
- TWAS/SMR: "gene-prioritization screens, not automatic proof that expression causally changes disease."

A helpful early response is often:

> This is a causal-genomics question because you want to use genetic or omics associations to infer a causal pathway. Before recommending MR, TWAS, SMR, or colocalization, I would clarify the exposure/outcome datasets, ancestry, tissue, instrument type, LD reference, sample overlap, and whether the target claim is a trait-level causal effect, a drug-target effect, or gene prioritization.

## Activation and Route-Out

Use this subskill when the user says or implies:

- Mendelian randomization, MR, two-sample MR, one-sample MR, cis-MR, trans-MR, multivariable MR, bidirectional MR, drug-target MR, pQTL, eQTL, mQTL, sQTL, caQTL, meQTL, GWAS, PheWAS, TWAS, SMR, HEIDI, PrediXcan, S-PrediXcan, FUSION, colocalization, coloc, SuSiE, fine mapping, credible set, PIP, eCAVIAR, HyPrColoc, CAUSE, MR-RAPS, MR-PRESSO, MR-Egger, weighted median, weighted mode, MRMix, MR-Clust, polygenic score as instrument, LD clumping, ancestry mismatch, sample overlap, winner's curse, horizontal pleiotropy, genetic liability, gene prioritization, omics mediation, multi-omics, or genetic instrument.

Do **not** use this as the only workflow when:

- the genetics are merely covariates or risk predictors and no causal genomic claim is being made: route to the primary analysis or prediction workflow;
- the user asks a generic IV question without genetic instruments: coordinate with `subskills/13-instrumental-variables/`;
- the target is direct/indirect omics mediation using measured mediators rather than genetic instruments: coordinate with `subskills/16-mediation/`;
- missing omics values, batch effects, assay error, misclassification, sample selection, or tissue/cell composition dominate: coordinate with `subskills/02-data-inspector/`;
- survival, competing risks, or time-to-event disease progression is central: coordinate with `subskills/15-survival-competing-risks/`;
- network biology, infectious transmission, or family/social spillovers are central: coordinate with `subskills/17-interference-spillovers/`;
- the user wants to infer a gene regulatory network structure from omics data: coordinate with `subskills/18-causal-discovery/`;
- the user is designing a new genetic/omics study: coordinate with `subskills/03-design-planner/`.

If this route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist. If the user insists on a weak genomic causal claim, label it as gene prioritization, triangulation evidence, or exploratory association rather than proof of causality.

## Causal Genomics Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `main_skill`, `data_inspector_02`, `dag_builder_04`, `design_planner_03`, or `analysis_routing`.

```yaml
subskill_analyses:
  - subskill_id: "19-causal-genomics"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "MR triage | two-sample MR | one-sample MR | cis-MR | multivariable MR | colocalization | fine mapping | TWAS/SMR | drug-target MR | omics mediation | gene prioritization | interpret result | code | unknown"
    datasets:
      exposure_dataset: null
      outcome_dataset: null
      molecular_qtl_dataset: null
      gwas_source_or_consortium: null
      ancestry: null
      sample_size_exposure: null
      sample_size_outcome: null
      case_control_counts: null
      sample_overlap_known_or_possible: null
      genome_build: null
      allele_frequency_available: null
      ld_reference: null
      tissue_or_cell_type: null
      assay_platform_or_batch_info: null
    target:
      exposure: null
      outcome: null
      biological_layer: "trait | gene expression | protein | metabolite | methylation | splicing | chromatin | microbiome | imaging | polygenic score | unknown"
      target_population_or_ancestry: null
      target_tissue_or_context: null
      drug_target_or_perturbation: null
      causal_question: null
    instruments:
      instrument_type: "genome-wide | cis | trans | pQTL | eQTL | mQTL | sQTL | polygenic score | candidate variants | unknown"
      variant_selection_threshold: null
      clumping_or_pruning_rule: null
      number_of_instruments: null
      instrument_strength_summary: null
      palindromic_or_ambiguous_variants: []
      harmonization_notes: null
      weak_or_missing_instruments: null
    estimand:
      label: "MR causal effect | local cis effect | drug-target effect | colocalized molecular effect | mediated genetic effect | multivariable direct effect | bidirectional effect | gene-prioritization evidence | unknown"
      exposure_scale: null
      outcome_scale: null
      target_population: null
      interpretation: null
    assumptions_needed:
      relevance: null
      independence_from_confounders: null
      exclusion_restriction_no_horizontal_pleiotropy: null
      no_or_handled_correlated_pleiotropy: null
      valid_ld_reference_and_harmonization: null
      ancestry_match_or_population_structure_handled: null
      no_problematic_sample_overlap_or_winners_curse: null
      colocalization_if_molecular_claim: null
      tissue_context_relevant: null
      no_reverse_causation_or_directionality_supported: null
    diagnostics_or_checks:
      f_statistics_or_strength: null
      ld_clumping_or_correlated_variant_plan: null
      harmonization_and_palindromic_check: null
      heterogeneity_q_or_leave_one_out: null
      pleiotropy_tests: []
      robust_methods: []
      steiger_or_bidirectional_check: null
      colocalization_or_fine_mapping: null
      ancestry_and_population_structure: null
      sample_overlap_and_winners_curse: null
      sensitivity_to_ld_reference: null
      replication_or_external_validation: null
      biological_triangulation: []
    estimation_plan:
      method_family: "two-sample MR | one-sample MR | cis-MR | multivariable MR | robust MR | colocalization | fine mapping | TWAS/SMR | drug-target MR | within-family MR | multi-omics mediation | unknown"
      primary_method: null
      fallback_or_comparator: null
      software_backend: "R | Python | command-line | custom | either | unknown"
      inference_strategy: null
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(G\): genetic variant, allele score, or instrument set;
- \(X\): exposure, modifiable trait, molecular trait, gene expression, protein abundance, metabolite, or liability;
- \(Y\): outcome or disease trait;
- \(U\): confounders of \(X\) and \(Y\);
- \(Z\): set of instruments;
- \(LD\): linkage disequilibrium among variants.

If the user uses different notation or variable names, adapt responses to the user's notation.

### MR as instrumental-variable logic

MR usually relies on three core assumptions:

1. relevance: \(G\) is associated with \(X\);
2. independence: \(G\) is independent of confounders of \(X\) and \(Y\);
3. exclusion restriction: \(G\) affects \(Y\) only through \(X\).

Genetic randomization can reduce ordinary confounding and reverse causation, but it does not remove pleiotropy, LD confounding, population structure, dynastic effects, assortative mating, sample overlap, or measurement error.

### Two-sample MR

Two-sample MR uses variant-exposure associations from one GWAS and variant-outcome associations from another. It is powerful and scalable, but sensitive to weak instruments, winner's curse, sample overlap, ancestry mismatch, LD reference mismatch, and harmonization errors.

### One-sample and within-family MR

One-sample MR uses individual-level data and can model covariates, nonlinearities, interactions, and measured confounding more directly, but weak-instrument bias tends toward the observational association. Within-family MR can reduce bias from population stratification, dynastic effects, and assortative mating, usually with lower power.

### Cis-MR, drug-target MR, and molecular QTLs

Cis instruments near a gene or protein-coding locus can be useful for drug-target and molecular mechanism questions. They usually need colocalization because an eQTL/pQTL and disease GWAS signal in the same region may be driven by different causal variants in LD.

### Colocalization and fine mapping

Colocalization asks whether two traits likely share the same causal variant at a locus. Fine mapping assigns posterior inclusion probabilities and credible sets to candidate causal variants. Colocalization is evidence about shared signal, not proof that changing the molecular trait will change disease; it should be combined with MR, biology, and functional evidence.

### TWAS, SMR, and gene prioritization

TWAS, PrediXcan, FUSION, and SMR integrate GWAS with expression prediction or eQTL summary data. They are powerful gene-prioritization tools, but they can be driven by LD, pleiotropy, tissue mismatch, model misspecification, or multiple causal variants. Report them as prioritization unless causal assumptions and colocalization support are strong.

### Multivariable MR and mediation

Multivariable MR estimates direct effects conditional on other exposures, such as lipid fractions, correlated risk factors, or multiple omics traits. It requires strong instruments for each exposure and can become unstable with correlated exposures. Omics mediation needs mediation-specific assumptions in addition to genetic-IV assumptions.

## Identification Assumptions

State these separately from model assumptions.

### Relevance and strength

Genetic instruments must be robustly associated with the exposure. Check F-statistics or equivalent strength summaries, variance explained, and whether cis instruments are too weak for the intended claim.

### Independence and population structure

Instrument-outcome associations can be confounded by ancestry, geographic structure, assortative mating, dynastic effects, batch effects, cryptic relatedness, or cohort artifacts. Match ancestry, use appropriate PCs/mixed models, and consider within-family evidence when social or behavioral traits are involved.

### Exclusion restriction and pleiotropy

Horizontal pleiotropy is common. Use heterogeneity, MR-Egger, weighted median/mode, MR-PRESSO, MR-RAPS, CAUSE, MRMix, MR-Clust, multivariable MR, cis-only designs, and biological annotation as sensitivity tools. No single diagnostic proves the exclusion restriction.

### LD and colocalization

Variants in LD can create false molecular causal stories. For molecular exposure claims, require colocalization or fine-mapping evidence unless the user explicitly wants an exploratory screen.

### Sample overlap and winner's curse

Sample overlap can move weak-instrument bias toward the observational association. Winner's curse inflates discovery SNP-exposure estimates. Use non-overlapping samples, split-sample/pseudo-replication, correction methods, or cautious interpretation when overlap is unavoidable.

### Tissue, cell type, and context

Expression or protein QTLs are context-specific. The relevant tissue, developmental stage, disease state, stimulation condition, and cell composition should be biologically plausible for the exposure-outcome pathway.

### Directionality

MR directionality is not automatic. Use bidirectional MR, Steiger filtering where appropriate, time/biology, and sensitivity to measurement error, but avoid overclaiming direction from one statistical check.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Trait-level exposure and disease outcome, independent GWAS | Two-sample MR with IVW primary and robust sensitivity methods | strength, harmonization, LD, pleiotropy, overlap, ancestry |
| Single strong instrument | Wald ratio with careful weak-instrument and pleiotropy caveats | instrument strength, known biology, PhenoScanner/PheWAS |
| Many genome-wide instruments | IVW plus MR-Egger, weighted median/mode, MR-PRESSO, MR-RAPS, CAUSE/MRMix as needed | heterogeneity, outliers, correlated pleiotropy |
| Molecular exposure near disease locus | Cis-MR plus colocalization/fine mapping | coloc/SuSiE, LD reference, tissue relevance |
| Drug-target question | Cis-pQTL/eQTL MR, colocalization, phenome-wide safety scan, triangulation | target specificity, on-target/off-target variants |
| Multiple correlated exposures | Multivariable MR or network/mediation-aware analysis | conditional strength, collinearity, valid instruments |
| Bidirectional causal question | Bidirectional MR and Steiger-type checks | instrument strength both directions, measurement error |
| TWAS/SMR/gene prioritization | Treat as prioritization; add colocalization/fine mapping and biology | tissue model, LD, multiple signals, HEIDI/coloc |
| Multi-omics mediation | Coordinate with mediation; use cis instruments, colocalization, joint models where possible | mediator ordering, pleiotropy, multiple testing |
| Population/social/behavioral traits | Consider within-family MR or strong ancestry/family caveats | dynastic effects, assortative mating, population stratification |
| One-sample biobank MR | 2SLS or individual-level IV; split sample if possible | weak instruments, covariates, relatedness |
| Cross-ancestry analysis | Ancestry-specific MR and sensitivity to LD/reference | portability, allele frequencies, heterogeneity |

In normal responses, recommend one primary method and a small set of diagnostics/sensitivity methods. Avoid listing every MR method unless the user asks for a software survey.

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `TwoSampleMR`: common two-sample MR workflow, harmonization, OpenGWAS integration, IVW, MR-Egger, weighted median/mode, MR-RAPS wrapper, leave-one-out, plots, Steiger directionality.
- `ieugwasr` and OpenGWAS: GWAS lookup and extraction. Confirm data provenance, ancestry, sample overlap, and build.
- `MendelianRandomization`: summarized-data MR with IVW, MR-Egger, median methods, robust/penalized options, correlated variants.
- `MRPRESSO`: pleiotropy residual sum and outlier tests; best treated as outlier/sensitivity evidence.
- `mr.raps`: robust adjusted profile score for many weak instruments and balanced pleiotropy.
- `CAUSE`: genome-wide summary-data method that models correlated and uncorrelated pleiotropy.
- `MRMix`, `MR-Clust`, `RadialMR`, and `MR-TRYX`: mixture, clustering, radial outlier, and pleiotropy-exploration workflows.
- `coloc`: Bayesian colocalization; current versions support SuSiE-style multiple-signal workflows.
- `susieR`, `FINEMAP`, `CAVIAR/eCAVIAR`, `HyPrColoc`, `SharePro`, and related tools: fine mapping and multi-trait colocalization.
- `SMR`: SMR/HEIDI gene prioritization from GWAS and QTL summary data.
- `FUSION`, `PrediXcan`, `S-PrediXcan`, `S-MultiXcan`, `FOCUS`, and `UTMOST`: TWAS and transcriptome-mediated gene prioritization.

### Python and command-line

Python support is useful for custom harmonization, QC, and data engineering; R and command-line tools dominate many applied genomics workflows.

- `pandas`, `numpy`, `scipy`, `statsmodels`, `pandas-plink`, `hail`, and `plink2`: summary statistic QC, LD, clumping, harmonization, and custom MR estimators.
- `limix`, `tensorqtl`, `qtltools`, and `hail`: QTL mapping or preprocessing when individual-level omics/genotype data are available.
- `PLINK/PLINK2`, `bcftools`, `tabix`, `liftOver`, and `LDSC`: genotype/summary-statistic QC, LD, build harmonization, and genetic correlation support.

When the user proposes another package, check whether it handles allele harmonization, LD/correlated variants, sample overlap, ancestry, weak instruments, pleiotropy, colocalization, multiple testing, and reporting.

## Data Preprocessing Rules

1. Preserve original summary statistics, allele columns, effect allele, non-effect allele, beta, SE, p-value, EAF, sample size, case/control counts, genome build, rsID, chromosome, position, and imputation quality.
2. Harmonize genome build and alleles before analysis. Flag palindromic SNPs, strand ambiguity, allele-frequency mismatches, duplicated variants, and rsID/position conflicts.
3. Match or justify ancestry and LD reference. Do not use a European LD reference for non-European GWAS without explicit caveats.
4. Record sample overlap, consortium membership, UK Biobank/biobank reuse, relatedness, and whether exposure/outcome estimates are from the same participants.
5. Use appropriate LD clumping/pruning or correlated-variant methods. Record clumping thresholds and reference panel.
6. For molecular QTLs, keep tissue, cell type, stimulation state, assay, batch, cis/trans definition, and QTL discovery sample size.
7. For colocalization, use the same locus, aligned variants, allele frequencies, sample sizes, LD if required, priors, and credible sets; include all relevant variants when possible.
8. For TWAS/SMR, record expression weights, training tissue, model performance, LD reference, and multiple-testing correction.
9. For multi-omics, predefine the biological ordering and whether layers are exposures, mediators, outcomes, or annotations.
10. Preserve all filtering decisions because instrument selection is part of the estimand and bias profile.

## Required Diagnostics

### MR diagnostics

- instrument strength and variance explained;
- SNP harmonization and palindromic allele checks;
- LD clumping or correlated-variant handling;
- heterogeneity statistics and single-SNP estimates;
- leave-one-out and influential-variant checks;
- MR-Egger intercept or directional pleiotropy check where suitable;
- MR-PRESSO/radial/outlier checks where suitable;
- robust estimator agreement or disagreement;
- Steiger or bidirectional evidence for directionality;
- sample overlap and winner's curse audit;
- ancestry/population-structure audit;
- reporting against STROBE-MR.

### Molecular and gene-prioritization diagnostics

- colocalization posterior probabilities or credible-set sharing;
- fine-mapping credible sets and PIPs;
- sensitivity to LD reference and priors;
- tissue/cell-type relevance;
- QTL instrument strength and cis/trans status;
- HEIDI or heterogeneity checks for SMR-style analyses;
- TWAS model performance and LD consistency;
- multiple-testing control;
- external replication or functional evidence.

### Multi-omics and mediation diagnostics

- mediator ordering and tissue context;
- multiple mediator correlation;
- batch/cell-composition/technical covariate audit;
- colocalization at each linked molecular step;
- pleiotropy across omics layers;
- replication across QTL resources or tissues;
- coordination with mediation diagnostics.

## Failure Modes and Guardrails

Escalate warnings when:

- MR is interpreted causally without instrument strength, pleiotropy, LD, ancestry, and harmonization checks;
- genome-wide significant variants are weak or few but the claim is strong;
- palindromic or strand-ambiguous variants are silently retained;
- LD clumping uses a mismatched ancestry reference;
- exposure and outcome samples overlap and instruments are weak;
- UK Biobank or another biobank contributes to both exposure and outcome in hidden ways;
- horizontal or correlated pleiotropy is likely but ignored;
- MR-Egger, MR-PRESSO, or weighted median results are treated as proof rather than sensitivity evidence;
- a TWAS/SMR hit is called a causal gene without colocalization/fine mapping;
- colocalization is claimed with incomplete variant coverage or multiple signals ignored;
- cis-pQTL/eQTL instruments are not tissue or cell-type relevant;
- population stratification, dynastic effects, or assortative mating may explain social/behavioral trait results;
- multi-omics mediation is reported without mediator timing, tissue context, or multiple-testing control;
- a null MR result is interpreted as no effect despite weak instruments or low power.

## Step-by-Step Operating Procedure

1. Restate the genomic causal question in biological and statistical language.
2. Identify exposure, outcome, molecular layer, tissue/context, ancestry, and target population.
3. Determine whether the task is MR, cis-MR, colocalization, fine mapping, TWAS/SMR, multivariable MR, drug-target MR, or exploratory gene prioritization.
4. Audit data sources, sample overlap, build, allele harmonization, LD reference, and instrument selection.
5. Define the estimand and effect scale.
6. Choose a primary method and a compact sensitivity set.
7. Plan diagnostics for strength, LD, pleiotropy, colocalization, ancestry, directionality, and replication.
8. If molecular causality is claimed, require colocalization/fine mapping and tissue relevance.
9. If diagnostics fail, narrow the claim to prioritization, use a different estimand, seek better instruments, add within-family or replication evidence, or report no causal conclusion.
10. Record assumptions, diagnostics, limitations, and open questions in the project specification.

## Output Template

```markdown
### Causal Genomics Analysis

#### 1. Question and datasets
- Exposure:
- Outcome:
- Biological layer:
- Tissue/cell type:
- GWAS/QTL sources:
- Ancestry and sample sizes:
- Sample overlap:

#### 2. Estimand
- Target estimand:
- Exposure scale:
- Outcome scale:
- Target population:
- Interpretation:

#### 3. Instruments and harmonization
- Instrument type:
- Selection threshold:
- LD/clumping rule:
- Strength:
- Allele/build harmonization:
- Ambiguous variants:

#### 4. Assumptions
- Relevance:
- Independence/population structure:
- Exclusion restriction/pleiotropy:
- LD and colocalization:
- Sample overlap/winner's curse:
- Tissue/context relevance:
- Directionality:

#### 5. Method recommendation
- Primary method:
- Sensitivity/comparator methods:
- Software/backend:
- Inference strategy:

#### 6. Diagnostics
- Strength and LD:
- Heterogeneity/outliers:
- Pleiotropy:
- Directionality:
- Colocalization/fine mapping:
- Ancestry/sample overlap:
- Replication/triangulation:

#### 7. Interpretation
- Causal claim supported:
- What remains gene prioritization or exploratory:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/04-dag-builder/`: use for genetic DAGs, pleiotropy paths, collider/selection concerns, and variable roles.
- `subskills/08-doubly-robust-ml/`: coordinate when individual-level genomic/omics analysis uses flexible nuisance modeling.
- `subskills/13-instrumental-variables/`: use for generic IV logic, weak-instrument thinking, LATE/CACE analogies, and non-genetic instruments.
- `subskills/15-survival-competing-risks/`: use when genomic exposure affects time-to-event outcomes.
- `subskills/16-mediation/`: use for omics mediation, molecular pathways, and direct/indirect effects.
- `subskills/18-causal-discovery/`: use for learned gene regulatory networks or causal graph discovery from omics.
- `subskills/02-data-inspector/`: use for batch effects, measurement error, missing omics, selection, and ancestry transportability.
- `subskills/20-reporting-interpretation/`: use STROBE-MR and final causal-claim calibration.
- `subskills/03-design-planner/`: use when designing new GWAS/QTL/MR/omics studies.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For MR and colocalization notes, read `references/mr_coloc_notes.md`. For the literature and software map, read `references/literature_and_software.md`.
