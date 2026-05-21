# Reproducible Analysis Report Template

Use this template when analyzable data exist, the analysis is run in code, and the recorded workflow state supports a reportable causal or non-causal claim. The default deliverable is a source report plus rendered HTML:

```text
artifacts/
  [descriptive-name].ipynb   # or .qmd / .Rmd
  [descriptive-name].html
  figures/
  tables/
```

Use `exploratory_analysis_report_template.md` instead when the specification is still being learned, diagnostics are missing, or the user wants only a first-pass/progress artifact.

Before writing, confirm:

```yaml
causal_gate.status: ready | complete
production_gate.status: ready | complete
production_gate.reportable_evidence: true
production_gate.claim_strength_for_report: supported_causal | cautious_causal | associational | descriptive | exploratory
```

The claim can still be cautious, associational, descriptive, or exploratory. The lane means the materials are reportable, not that the strongest causal wording is allowed.

## Flexible Report Spine

```markdown
# [Project-Specific Title]

## 1. Summary And Claim Status

[Briefly state the user question, data used, selected framework, main result if available, claim strength, and the most important limitation.]

## 2. Question, Data, And Design

[Explain treatment/exposure, comparator, outcome, population, timing, estimand, data sources inspected, and design logic.]

## 3. Data Readiness And Analysis Specification

[Describe row unit, missingness, support/overlap, timing/leakage, variable construction, exclusions, packages, estimand, model/design specification, and planned diagnostics.]

## 4. Results And Diagnostics

[Present sourced results, intervals, figures, model outputs, diagnostics, sensitivity checks, and how they change interpretation.]

## 5. Interpretation And Next Step

[State what can be claimed, what cannot be claimed, action-recommendation limits, external-validity cautions, and the most useful next step.]

## 6. Reproducibility Appendix

[Record source report path, rendered HTML path, code paths, seeds, package versions, saved figures/tables, and rerun notes.]
```

## Required Coverage

Cover data provenance, causal question/design, data readiness, analysis specification, results, diagnostics/sensitivity, interpretation/limits, reproducibility, and the workflow gate state.

## Route-Aware Package Guidance

Use packages that match the route or specialist subskill actually used. Do not load broad causal libraries just to make a report look causal.

| Candidate route | R package examples | Python package examples |
|---|---|---|
| Randomized experiment | `estimatr`, `broom`, `DeclareDesign` | `pandas`, `scipy`, `statsmodels` |
| Regression / weighting / doubly robust | `MatchIt`, `WeightIt`, `cobalt`, `grf`, `DoubleML` | `statsmodels`, `sklearn`, `DoubleML`, `econml`, `dowhy` |
| DiD / event study | `fixest`, `did`, `DRDID` | `statsmodels`, `linearmodels` |
| IV | `AER`, `ivreg`, `fixest` | `linearmodels`, `statsmodels` |
| RD | `rdrobust`, `rddensity` | `statsmodels` plus project-specific RD utilities |
| Synthetic control / time series | `Synth`, `tidysynth`, `gsynth` | `statsmodels` plus suitable synthetic-control packages |
| Survival / competing risks | `survival`, `cmprsk`, `riskRegression` | `lifelines`, `scikit-survival` |
| Causal discovery | `bnlearn`, `pcalg` | `networkx`, `pgmpy`, `causal-learn`, `dowhy.gcm` |

## Output Rules

- Results, diagnostics, plots, and tables must come from executed code, verified artifacts, or explicitly labeled user-provided outputs.
- Do not hand-write numeric results into prose unless their source is visible in the source report or linked artifacts.
- If a result is missing, unavailable, or not run, say so and explain how that limits the claim.
- Keep sensitive raw rows, direct identifiers, secrets, and small-cell details out of the rendered report unless explicitly approved and necessary.
