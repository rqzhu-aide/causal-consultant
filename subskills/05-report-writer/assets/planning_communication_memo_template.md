# Planning / Communication Memo Template

Use this flexible template when no analyzable data are available yet, when data are expected later, or when the user mainly wants wording, slide bullets, email text, caveats, executive language, or a short planning memo.

The memo should be short by default, usually one to two pages. It can include requested drafting material in an appendix, but it should not pretend to be a data-backed report. If no data have been inspected or analyzed, do not include new estimates, diagnostics, sample descriptions, or result-like claims.

## Template Instructions

Write the memo as a concise technical planning or communication document, not as a checklist. Use numbered sections, but adapt section titles, order, and length to the user's situation. Use coherent paragraphs to explain the request, current knowledge, candidate causal structure, likely design, future analysis path, and risks. Use bullets or tables only when they make the memo easier to scan.

The section spine is flexible, but the memo must cover the required elements listed below somewhere in the document.

## Flexible Memo Spine

Use this spine as a starting point. Merge, split, rename, or reorder sections when the project needs it.

```markdown
# [Project-Specific Memo Title]

Date: [YYYY-MM-DD]

## 1. Request And Current Context

[Summarize the user's request and the practical decision, audience, or deliverable. Describe the background knowledge gathered from the conversation. Clearly distinguish what the user stated from what is inferred, and note whether no analyzable data have been provided or the request is communication-only.]

## 2. Working Causal Structure Or Design

[Describe the candidate causal question and, when applicable, the anticipated DAG or design logic. Name the likely treatment or exposure, outcome, comparator, population, timing, and major threats such as selection, confounding, simultaneity, post-treatment adjustment, missing timing, poor support, or unclear measurement.]

[Use "candidate", "anticipated", or "working" language unless a design has already been validated elsewhere.]

## 3. First-Pass Analysis Options Once Data Exist

[Explain which analysis routes would be plausible once data are collected or organized. Package suggestions should be tied to likely routes or method subskills, not listed generically. If the route is unclear, say package choices are provisional and name the design questions that must be answered first.]

[A compact table can be useful here when several routes are plausible.]

## 4. Conclusion And Potential Pitfalls

[State what can be said now, what cannot be claimed yet, the most important pitfalls, and one practical next step. Keep claim strength calibrated to the fact that data are absent, unavailable, or not yet analyzed.]

## Appendix: Requested Drafting Material

[Include only if the user requested communication material such as slide bullets, email text, board language, caveats, an executive paragraph, or a short script.]
```

## Required Coverage

Every planning or communication memo must cover these elements somewhere in the memo:

| Required element | What must be covered |
|---|---|
| Date and request | Date, user request, current task, intended audience or decision when known. |
| Current knowledge | Background facts gathered from the conversation, separated from assumptions or inferences. |
| Data status | Whether data are absent, unavailable, not organized, not inspected, or irrelevant because the request is communication-only. |
| Working causal structure or design | Candidate treatment/exposure, outcome, comparator, population, timing, DAG/design logic, and major assumptions when applicable. |
| Future analysis path | Route-aware first-pass methods or packages that could be used once data exist, plus minimum data needed if useful. |
| Limits and pitfalls | What cannot be claimed, what could break the design, and what the user should watch for. |
| Practical next step | One concrete next step, such as collecting a field, clarifying assignment, drafting a slide, or waiting for data. |
| Requested drafting material | Slide bullets, email text, caveats, or executive wording only when the user asked for them. |

## Route-Aware Package Guidance

Suggest packages only when they match the likely route or method subskills the main skill would plausibly activate.

| Candidate route | R options | Python options | Typical use |
|---|---|---|---|
| Randomized experiment or A/B test | `estimatr`, `broom`, `DeclareDesign` | `pandas`, `scipy`, `statsmodels` | Randomization checks, difference in means/proportions, confidence intervals, regression adjustment. |
| Regression / adjustment / weighting / doubly robust | `MatchIt`, `WeightIt`, `cobalt`, `grf`, `DoubleML` | `statsmodels`, `sklearn`, `DoubleML`, `econml`, `dowhy` | First-pass adjustment, balance/overlap, nuisance models, DR estimation, sensitivity framing. |
| DiD / event study | `fixest`, `did`, `broom` | `statsmodels`, `linearmodels`, `plotnine` or `matplotlib` | Panel setup, fixed effects, event-study plots, pre-trend checks. |
| Instrumental variables | `AER`, `ivreg`, `fixest` | `linearmodels`, `statsmodels` | First stage, reduced form, IV estimate, weak-instrument diagnostics where available. |
| Regression discontinuity | `rdrobust`, `rddensity` | `statsmodels`, route-specific RD utilities if available | Running-variable checks, bandwidth analysis, local models, density/balance checks. |
| Synthetic control / time series | `Synth`, `tidysynth`, `gsynth` | `statsmodels`, suitable synthetic-control packages if available | Pre-period fit, placebo checks, donor weights, time-series diagnostics. |
| Survival / competing risks | `survival`, `cmprsk`, `riskRegression` | `lifelines`, `scikit-survival` when available | Time-to-event setup, censoring summaries, survival or competing-risk analysis. |
| Causal discovery | `bnlearn`, `pcalg` | `networkx`, `pgmpy`, `causal-learn`, `dowhy.gcm` when appropriate and available | Graph learning, graph plotting, stability summaries, exploratory graph diagnostics. |

If the route is unclear, include a short provisional package note instead of a package list:

> Package choices are provisional because the design route is not selected yet. The next step is to clarify assignment, timing, comparator, outcome, and whether the future data support effect estimation, discovery, or only descriptive analysis.

## Optional Appendix Patterns

Use an appendix only when the user requested a draft or communication artifact.

```markdown
## Appendix: Slide Language

[Short slide-ready bullets with careful claim language.]

## Appendix: Email Draft

[Concise email text for the requested audience.]

## Appendix: Board Or Executive Caveat

[Short caveat language that separates promising evidence, unsupported causal claims, and the next validation step.]
```
