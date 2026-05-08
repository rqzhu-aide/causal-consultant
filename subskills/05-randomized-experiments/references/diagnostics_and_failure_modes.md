# Diagnostics and Failure Modes for Randomized Experiments

## Mandatory Diagnostic Table

| Diagnostic | Why it matters | Route if it fails |
|---|---|---|
| Allocation counts and planned probabilities | Detects assignment/logging/filtering problems | Investigate SRM; do not finalize if unexplained |
| Unit randomized vs unit analyzed | Prevents wrong standard errors and pseudo-replication | Aggregate or cluster-robust/repeated-measure analysis |
| Duplicated or multiply assigned units | Detects bucketing and data errors | Fix data or redefine analysis population |
| Baseline covariate balance | Audits implementation and chance imbalance | Investigate if extreme; adjust only for pre-treatment variables |
| Missing outcome rate by arm | Differential attrition threatens interpretation | Activate `02-data-technician`; sensitivity/bounds/IPW/imputation |
| Post-randomization exclusions | Can change estimand and induce selection bias | Report all exclusions; analyze ITT if possible |
| Compliance/exposure table | Assignment may not equal treatment received | ITT primary; activate `13-instrumental-variables` for CACE/LATE |
| Cluster sizes and number of clusters | Determines valid inference | Cluster-level or cluster-robust inference |
| Metric distribution | Heavy tails/zeros affect precision and robustness | Transform, winsorize by pre-specified rule, bootstrap, robust analysis |
| Multiplicity inventory | Prevents selective inference | Pre-specify primary outcome/contrast or adjust/label exploratory |
| Interference screen | SUTVA may fail | Activate `17-interference-spillovers`; exposure mapping |

## Sample-Ratio Mismatch

For an online A/B test, compute an SRM test whenever assignment probabilities are known. Investigate:

- assignment service or bucketing error;
- missing exposure logs;
- filtering that differs by arm;
- bots/fraud filtering;
- country/platform/device filters applied post-assignment;
- duplicate users or inconsistent IDs;
- experiment ramp-up or changed allocation probabilities;
- concurrent experiments and namespace conflicts.

Do not treat an unexplained SRM as a harmless p-value artifact. It may mean the data do not represent the randomized population.

## Baseline Balance

Report pre-treatment covariate balance by arm. For continuous covariates, use mean differences and standardized mean differences. For categorical covariates, use counts/proportions by arm.

Do not adjust for variables measured after treatment in the primary total-effect analysis.

## Missingness and Attrition

Compute:

\[
\Delta_R=\widehat P(R=1\mid Z=1)-\widehat P(R=1\mid Z=0),
\]

where \(R=1\) means the outcome is observed.

If missingness differs by arm, report:

- number randomized by arm;
- number analyzed by arm;
- reasons for missingness if known;
- whether missingness occurred before or after treatment exposure;
- sensitivity analysis.

## Noncompliance and Crossover

Create an assignment-by-receipt table:

| Assigned | Received control | Received treatment | Missing receipt |
|---|---:|---:|---:|
| Control |  |  |  |
| Treatment |  |  |  |

Interpretation rules:

- ITT estimates assignment effect.
- Per-protocol estimates compare adherers and may be confounded.
- As-treated estimates compare actual receipt and may be confounded.
- CACE/LATE needs IV assumptions and routes to `13-instrumental-variables`.

## Cluster Randomization

Red flags:

- treatment assigned by cluster but SEs treat individuals as independent;
- fewer than about 30-50 clusters with no small-sample correction or randomization inference;
- highly unequal cluster sizes with unclear cluster-weighted vs individual-weighted estimand;
- cluster-level treatment with individual-level post-treatment selection.

## Online A/B Specific Failure Modes

- analyzing sessions/events as independent when users/accounts were randomized;
- using only triggered/exposed users without clarifying estimand;
- changing primary metrics after seeing the data;
- ignoring ramp-up periods or allocation changes;
- repeated peeking without sequential design;
- denominator leakage in ratio metrics;
- winsorization chosen after inspecting treatment effects;
- concurrent experiments causing interference;
- novelty or learning effects when follow-up is too short;
- guardrail metrics ignored despite evidence of harm.

## Clinical RCT Specific Failure Modes

- per-protocol/as-treated reported as if randomized;
- intercurrent events not linked to an estimand strategy;
- death handled as ordinary missingness when it is part of the clinical endpoint structure;
- rescue medication or treatment switching ignored;
- multiple endpoints interpreted without a multiplicity plan;
- CONSORT-style flow missing;
- safety/adverse events not separated from efficacy estimands.

## Diagnostic Output Template

```markdown
### Randomization and Data Integrity Diagnostics

- Observed allocation counts:
- Planned allocation probabilities:
- SRM statistic and p-value:
- Unit randomized:
- Unit analyzed:
- Duplicate/multiple-assignment issues:
- Baseline balance summary:
- Missing outcome rate by arm:
- Post-randomization exclusions by arm:
- Compliance/exposure table:
- Cluster size summary:
- Metric distribution concerns:
- Multiplicity concerns:
- Interference concerns:
- Overall diagnostic assessment: pass / caution / fail
```
