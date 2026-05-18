---
name: causal-genomics
description: "Domain-specific primary route bundle for Mendelian randomization, genetic instruments, GWAS/eQTL/pQTL/mQTL, colocalization, fine mapping, TWAS/SMR, polygenic scores as instruments, omics mediation, drug-target MR, pleiotropy, ancestry/population structure, sample overlap, LD, and genomic evidence triangulation."
---

# Causal Genomics

## Role

Use this as a **domain-specific route bundle** for genetic and omics causal questions. It often combines IV logic, colocalization, mediation, negative controls, and domain-specific data constraints.

## Interaction Boundary

This subskill may audit fit and prepare a plan, code skeleton, diagnostics, or reporting handoff, but it should not run substantial analysis, present first-pass estimates as final, or produce a final report on its own. Execution must return through the main skill's interaction checkpoints: user-confirmed plan, first-pass result review, diagnostics/sensitivity decision, and final-report approval or explicit deferral. If activated directly, summarize the proposed next step and ask one focused confirmation question before running models or writing final results.

## Production Kernel Contract

When selected during production, act as a transition-kernel expert for this route or support role. Read `project.yaml`, `analysis.production_loop`, relevant artifacts, and any existing `subskill_analyses` record for this subskill. Append or update only this subskill's compact activated record using `assets/method_job_subskill_record_template.yaml`; do not create a permanent blank YAML section. Report what changes the next state: fit, diagnostics, artifacts, blocking signals and recommended next action. If a fatal data/design/DAG problem appears, recommend `return_to_foundation`; the main skill decides the gate transition.

Write this subskill's `subskill_analyses` record with:

- `subskill_id: "19-causal-genomics"`
- `role: "primary_route"` or `support_module`
- `status`: `plan proposed`, `first pass supported`, `diagnostics reviewed`, `materials ready`, `blocked`, or `deferred`
- `activation_reason`: MR, genetic instrument, QTL, colocalization, omics mediation, drug-target MR, or genomic triangulation need
- `selected_route_id`: the route from `routes.current_route_id` or the main handoff
- `inputs_reviewed`: exposure GWAS/QTL, outcome GWAS, instruments, ancestry, LD reference, harmonization, sample overlap, variant annotation, and artifacts
- `outputs_created`: MR/colocalization plan, harmonized data path, first-pass MR table, sensitivity diagnostics, colocalization output, or report-ready artifact
- `diagnostics_reviewed`: instrument strength, harmonization, strand/allele issues, LD clumping, pleiotropy, heterogeneity, colocalization, ancestry, and sample overlap
- `limitations`: weak instruments, horizontal pleiotropy, non-colocalization, ancestry mismatch, winner's curse, sample overlap, or data-access/API limits
- `feedback_for_main_skill`: whether genomic evidence supports a causal claim, triangulation, or only exploratory evidence
- `requests_for_main_skill`: ask user to confirm exposure/outcome datasets, ancestry, LD reference, biological target, colocalization requirement, or acceptable triangulation language
- `readiness`: production readiness after genomics review
- `blocking_signal`: set `requires_previous_phase_recheck: true` only when genomic design assumptions invalidate the selected route
- `recommended_next_action`: one value from `assets/workflow_enums.yaml > main_actions`; usually `ask_user`, `confirm_analysis_plan`, `run_first_pass`, `run_diagnostics`, `activate_method_subskill`, `proceed_with_caveat`, `mark_production_ready`, or `return_to_foundation`
- `artifact_paths`: paths to harmonized datasets, MR scripts, sensitivity outputs, colocalization plots, or memos

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

Before `production_gate.status` is ready, consider these analysis paths:

- two-sample MR with IVW, weighted median/mode, MR-Egger, and sensitivity checks when instruments are adequate;
- drug-target or cis-MR with stricter colocalization and biology review;
- colocalization or fine-mapping before strong locus-specific causal language;
- multivariable MR when correlated exposures or pleiotropic pathways are central;
- mediation or proximal/negative-control handoff when omics pathway or pleiotropy is the main issue;
- triangulation summary when MR assumptions are too fragile for a single primary estimate.

Simple sample scripts to provide or adapt:

- a project-specific R `TwoSampleMR`/`MendelianRandomization` harmonization script saved under `artifacts/`;
- a project-specific `coloc` script saved under `artifacts/`;
- top-level `scripts/python/linearmodels_iv_template.py` only as generic IV orientation, not a genomics substitute.

Post-fit diagnostics must cover:

- F-statistics or equivalent instrument strength checks;
- harmonization, allele frequency, palindromic/ambiguous SNP handling, strand alignment, and LD clumping;
- heterogeneity, horizontal pleiotropy, MR-Egger intercept, MR-PRESSO or related outlier checks when appropriate;
- leave-one-out and single-SNP sensitivity;
- ancestry and population-structure match between exposure/outcome samples;
- sample overlap/winner's curse risk;
- colocalization/fine-mapping support for locus-specific or drug-target claims.

## Pass / Fail Output

If fit passes, produce genomic analysis plan, harmonization/sensitivity checks, package/code path, and reporting handoff. If fit fails, identify whether the issue is instrument strength, pleiotropy, colocalization, ancestry, sample overlap, data access, or interpretation.

Main-skill feedback should include:

- whether genomic evidence is causal-supporting, triangulating, exploratory, or blocked;
- which estimand or evidence type is supported, such as MR effect, drug-target evidence, colocalized locus evidence, or mediated omics signal;
- which sensitivity and colocalization diagnostics constrain interpretation;
- the next user question, if any, such as choosing ancestry-matched datasets or accepting triangulation rather than definitive causal language;
- this subskill's `subskill_analyses` chunk, artifact paths, and recommendations for main-owned updates to `analysis.recommended_diagnostics` and `production_gate.diagnostics_status`. Do not duplicate this method/job record in `analysis.production_loop.reviewer_summaries`.

Report Writer handoff notes should include:

- exposure, outcome, GWAS/source data, ancestry, instrument selection, harmonization rules, and estimand;
- MR/colocalization/fine-mapping/TWAS/SMR estimates as relevant, with uncertainty and artifact paths;
- instrument strength, LD, allele harmonization, heterogeneity, pleiotropy, outlier, leave-one-out, sample-overlap, ancestry, and colocalization diagnostics;
- biological interpretation limits, including tissue specificity, locus specificity, pleiotropy, and triangulation status;
- wording that avoids overclaiming causal genes or mechanisms when evidence is only instrumental, colocalization-limited, or exploratory.

When the Report Writer uses the gate-ready or exploratory data-backed templates, contribute:

- **Summary / Claim Status:** whether genomic evidence is causal-supporting, triangulating, exploratory, or blocked, and the safest biological claim language.
- **Question, Data, And Design:** exposure, outcome, GWAS/QTL sources, ancestry, LD reference, instrument selection, harmonization, estimand, and biological target.
- **Data Readiness And Analysis Specification:** data provenance, clumping/harmonization rules, MR/colocalization/fine-mapping/TWAS/SMR method, sensitivity plan, and package/API path.
- **Results And Diagnostics:** MR or omics estimates, uncertainty, instrument strength, allele/strand checks, heterogeneity, pleiotropy, outlier, leave-one-out, ancestry/sample-overlap, and colocalization diagnostics.
- **Interpretation And Next Step:** tissue/locus specificity, pleiotropy, non-colocalization, ancestry mismatch, sample overlap, triangulation limits, or need for follow-up biology review.
- **Reproducibility Appendix:** harmonized data paths, instrument lists, clumping parameters, LD reference, package/API versions, seeds if used, and saved diagnostic/report artifacts.

Recommend `return_to_foundation` when instruments are not relevant, exposure/outcome datasets cannot be harmonized, ancestry/LD mismatch invalidates the design, colocalization fails for a required locus-specific claim, pleiotropy undermines exclusion, or the user's requested claim requires a different genomic design.

Stay in production with a weaker claim when instruments are modest, pleiotropy is possible, colocalization is incomplete, ancestry match is imperfect, sample overlap is uncertain, or evidence should be presented as triangulation. Then recommend sensitivity checks and cautious biological interpretation.

Recommend production-gate readiness only when data provenance, harmonization, instrument diagnostics, pleiotropy/heterogeneity checks, colocalization or deferral rationale, limitations, and handoff artifacts are recorded.

## References

- `references/workflow.md`: detailed genomics workflow.
- `references/mr_coloc_notes.md`: MR and colocalization notes.
- `references/literature_and_software.md`: literature and software notes.
