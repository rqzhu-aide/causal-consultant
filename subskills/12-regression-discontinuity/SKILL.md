---
name: regression-discontinuity
description: Use for sharp, fuzzy, kink, or local-randomization regression discontinuity designs where treatment, eligibility, dose, or policy assignment changes at a known cutoff of a running variable, including RD plots, bandwidth choice, robust bias-corrected inference, manipulation checks, and local effect interpretation.
---

# Regression Discontinuity

## Core Behavior

When this subskill is invoked, focus on whether a cutoff-based assignment rule can identify a local causal effect near the threshold. RD is a local design: it compares units just below and just above the cutoff, not the whole population.

Always do these six things:

1. **Verify the assignment rule.** Identify the running variable, cutoff, treatment or eligibility rule, side of treatment, and whether the design is sharp, fuzzy, kink, or local-randomization.
2. **Define the local estimand.** State that the target is a local effect at the cutoff, or a fuzzy RD LATE for cutoff compliers, not a population ATE.
3. **Audit manipulation and sorting.** Check whether units can precisely manipulate the running variable and whether density or heaping near the cutoff is concerning.
4. **Check continuity at the cutoff.** Inspect pre-treatment covariates, placebo outcomes, and outcome trends around the threshold.
5. **Use local methods.** Prefer local polynomial RD with robust bias-corrected inference and bandwidth sensitivity over global polynomial specifications.
6. **Report sensitivity and scope.** Show RD plots, bandwidth sensitivity, donut checks when justified, covariate continuity, and the population represented by units near the cutoff.

## User-Facing Style

Be concrete and local. A helpful early response is:

> This sounds like a regression discontinuity design because treatment changes at a cutoff. Before modeling, I would confirm the running variable, the exact cutoff, whether treatment jumps sharply or only becomes more likely, and whether units could manipulate their score around the threshold.

Translate assumptions:

- continuity: "people just below and just above the cutoff would have had similar outcomes without the treatment";
- no precise manipulation: "people cannot sort to one side of the cutoff in a way that creates incomparable groups";
- local estimand: "the result applies to units near the cutoff";
- fuzzy RD: "the cutoff changes treatment probability, so the estimate is for people whose treatment status is changed by cutoff eligibility."

## Activation and Route-Out

Use this subskill when the user says or implies:

- cutoff, threshold, eligibility score, running variable, assignment score, age cutoff, test-score cutoff, income threshold, distance threshold, policy rule, sharp RD, fuzzy RD, regression kink, local randomization near cutoff, `rdrobust`, `rddensity`, `rdplot`, `rdlocrand`, bandwidth, or McCrary/density test.

Do **not** use this as the only workflow when:

- assignment is randomized rather than threshold-based: route to `subskills/05-randomized-experiments/`;
- treatment only changes over calendar time without a running-variable cutoff: route to `subskills/11-did-event-study/` or `14-synthetic-control-time-series`;
- the cutoff is an encouragement/instrument with broader IV concerns: coordinate with `subskills/13-instrumental-variables/`;
- outcome is time-to-event and local RD is only the assignment design: coordinate with `subskills/15-survival-competing-risks/`;
- spillovers around the cutoff are central: coordinate with `subskills/17-interference-spillovers/`;
- missingness, measurement, heaping, or selection in the running variable dominates: coordinate with `subskills/02-data-inspector/`.

If the RD route is rejected, update the `subskill_analyses` entry as `rejected`, `fallback`, or `exploratory/user-forced`, record the failed condition, and return to the main skill's route shortlist.

## RD Project Specification Entry

When a project specification is being maintained, append or update this compact entry under the top-level `subskill_analyses` list. Fill only fields that are known or decision-relevant. Do not duplicate global fields already captured under `main_skill`, `data_inspector_02`, `dag_builder_04`, `design_planner_03`, or `analysis_routing`.

```yaml
subskill_analyses:
  - subskill_id: "12-regression-discontinuity"
    status: "candidate | selected | rejected | fallback | exploratory/user-forced"
    fit_to_user_need: null
    user_task: "design triage | RD plot | estimate local effect | fuzzy RD | manipulation audit | code | interpret result | unknown"
    assignment_rule:
      running_variable: null
      cutoff: null
      treatment_side: "above | below | unknown"
      treatment_or_eligibility_variable: null
      design_type: "sharp | fuzzy | kink | local-randomization | unknown"
      rule_known_before_outcome: null
    estimand:
      label: "sharp RD local ATE at cutoff | fuzzy RD LATE at cutoff | regression kink effect | local randomization ATE | unknown"
      local_population: null
      outcome_scale: null
      interpretation: null
    assumptions_needed:
      continuity_of_potential_outcomes: null
      no_precise_manipulation_or_sorting: null
      local_overlap_near_cutoff: null
      exclusion_or_monotonicity_for_fuzzy_rd: null
      no_interference_near_cutoff: null
      correct_cutoff_and_running_variable: null
    diagnostics_or_checks:
      rd_plot: null
      density_or_manipulation_test: null
      covariate_continuity: []
      placebo_outcomes_or_cutoffs: []
      bandwidth_sensitivity: null
      donut_sensitivity: null
      discrete_running_variable_check: null
      first_stage_for_fuzzy_rd: null
    estimation_plan:
      primary_method: "local polynomial RBC | fuzzy RD | local randomization | kink RD | unknown"
      polynomial_order: null
      bandwidth_selector: null
      kernel: null
      covariates_for_precision: []
      cluster_or_mass_point_handling: null
      software_backend: "R | Python | Stata | unknown"
    fatal_flaws_or_major_limitations: []
    limitations: []
    open_questions: []
```

## Core Theory and Formal Definitions

Default notation in this subskill:

- \(X\): running variable or score;
- \(c\): cutoff;
- \(D\): treatment or eligibility;
- \(Y\): outcome;
- \(Y(1),Y(0)\): potential outcomes.

If the user uses different notation or variable names, adapt responses to the user's notation.

### Sharp RD

In a sharp RD, treatment is determined by the cutoff, for example \(D=1(X \ge c)\). The local estimand is

\[
\tau_{SRD} =
\lim_{x \downarrow c} E[Y \mid X=x]
-
\lim_{x \uparrow c} E[Y \mid X=x].
\]

This targets the treatment effect at the cutoff under continuity of potential outcomes.

### Fuzzy RD

In a fuzzy RD, treatment probability jumps at the cutoff but treatment is not deterministic. The estimand is a local Wald ratio:

\[
\tau_{FRD} =
\frac{
\lim_{x \downarrow c} E[Y \mid X=x] - \lim_{x \uparrow c} E[Y \mid X=x]
}{
\lim_{x \downarrow c} E[D \mid X=x] - \lim_{x \uparrow c} E[D \mid X=x]
}.
\]

Interpret this as a LATE for cutoff compliers under IV-like assumptions near the cutoff.

## Method Recommendation Rules

### Design-to-method table

| Situation | Default recommendation | Required checks |
|---|---|---|
| Sharp deterministic treatment jump | Local polynomial RD with robust bias-corrected inference | RD plot, density, covariates, bandwidth sensitivity |
| Fuzzy cutoff with imperfect uptake | Fuzzy RD using local Wald/2SLS via `rdrobust` | first stage, weak jump, IV-like interpretation |
| Running variable has many repeated values or coarse bins | RD with mass-point/discrete-score checks | support near cutoff, sensitivity, local randomization if plausible |
| Manipulation or heaping near cutoff | Diagnose before estimating; consider donut RD or route to selection/measurement | density, heaping, institutional rule |
| Very narrow window resembles randomized assignment | Local randomization RD | covariate balance, window sensitivity, randomization inference |
| Slope change rather than level jump | Regression kink design | smooth density, kink in treatment rule, derivative interpretation |
| Few observations near cutoff | RD may be underpowered or unsupported | bandwidth, sample size, descriptive fallback |

## Language Backend Policy

Do not install packages silently. If packages are missing, show install commands and ask for approval.

### R preferred stack

- `rdrobust`: local polynomial RD, robust bias-corrected inference, optimal bandwidths, RD plots, sharp/fuzzy RD, covariates, clusters, and mass-point options.
- `rddensity`: density/manipulation testing and plots around the cutoff.
- `rdlocrand`: local randomization inference and window selection near the cutoff.

### Python

- `rdrobust`: Python implementation for local polynomial RD and plots.
- Use `pandas`, `numpy`, `statsmodels`, and plotting libraries for data audits, but prefer `rdrobust` for final local polynomial inference when possible.

## Data Preprocessing Rules

1. Preserve the raw running variable and the exact cutoff.
2. Do not recode or bin the running variable before primary RD estimation unless using a transparent binned plot.
3. Verify treatment side and cutoff coding.
4. Check whether the assignment rule changed over time or across sites.
5. Define the analysis sample before looking for favorable bandwidths.
6. Mark covariates as pre-treatment; use them for precision or diagnostics, not to rescue a failed RD design.
7. Keep clusters, sites, cohorts, and time variables for robust inference or sensitivity.
8. Check mass points, heaping, missing running values, and deterministic exclusions near the cutoff.
9. For fuzzy RD, keep both eligibility/assignment and actual treatment variables.
10. Do not use global polynomial fits as the primary causal estimator.

## Required Diagnostics

- RD plot with appropriate binning and local fits;
- density/manipulation test around cutoff;
- covariate continuity or balance near cutoff;
- placebo outcome and placebo cutoff checks when meaningful;
- bandwidth sensitivity around the selected bandwidth;
- donut sensitivity when manipulation or heaping at the exact cutoff is plausible;
- local sample size and support on each side of cutoff;
- first-stage jump for fuzzy RD;
- cluster/mass-point/discrete running-variable checks when relevant.

## Failure Modes and Guardrails

Escalate warnings when:

- the running variable or cutoff is wrong or chosen after seeing outcomes;
- units can precisely manipulate the running variable;
- there is a discontinuity in pre-treatment covariates or placebo outcomes;
- treatment does not actually jump at the cutoff in fuzzy RD;
- only global polynomial results are provided;
- bandwidth sensitivity changes conclusions dramatically;
- the local cutoff effect is interpreted as a full-population ATE;
- the running variable is discrete with too few support points near the cutoff;
- sample selection or missingness changes at the cutoff;
- spillovers occur across the cutoff.

## Step-by-Step Operating Procedure

1. Restate the cutoff-based causal question.
2. Confirm running variable, cutoff, treatment side, treatment variable, outcome, and target local population.
3. Classify the design as sharp, fuzzy, kink, or local randomization.
4. Draw or request an RD plot and inspect support near the cutoff.
5. Check manipulation/density, covariate continuity, and placebo outcomes/cutoffs where possible.
6. Choose local polynomial/RBC, fuzzy RD, local randomization, or kink RD.
7. Plan bandwidth, kernel, polynomial order, covariates, cluster/mass-point handling, and sensitivity checks.
8. If fuzzy RD, report first stage and LATE/complier interpretation.
9. If diagnostics fail, consider donut RD, narrower/local-randomization window, different estimand, or descriptive analysis.
10. Record assumptions, diagnostics, limitations, and open questions in the project specification.

## Output Template

```markdown
### Regression Discontinuity Analysis

#### 1. Design setup
- Running variable:
- Cutoff:
- Treatment side:
- Sharp/fuzzy/kink/local-randomization:
- Outcome:
- Local population:

#### 2. Estimand
- Target estimand:
- Scale:
- Fuzzy RD first stage, if applicable:
- Local interpretation:

#### 3. Assumptions
- Continuity:
- No precise manipulation:
- Covariate continuity:
- Fuzzy RD exclusion/monotonicity, if applicable:
- No interference:

#### 4. Method recommendation
- Primary method:
- Bandwidth/kernel/order:
- Software/backend:
- Fallback/comparator:

#### 5. Diagnostics
- RD plot:
- Density/manipulation:
- Covariate continuity:
- Placebo checks:
- Bandwidth sensitivity:
- Donut sensitivity:

#### 6. Interpretation
- Estimate and uncertainty:
- Locality caveat:
- Fatal flaws or major limitations:
- Recommended next step:
```

## Related Subskills

- `subskills/13-instrumental-variables/`: use for fuzzy RD IV interpretation and weak first-stage concerns.
- `subskills/15-survival-competing-risks/`: use for time-to-event outcomes.
- `subskills/02-data-inspector/`: use for manipulation, missing running variables, heaping, or selection near cutoff.
- `subskills/17-interference-spillovers/`: use when units across the cutoff affect each other.
- `subskills/20-reporting-interpretation/`: use for final report and limitations.

## Reference Files

For the detailed workflow, read `references/workflow.md`. For the literature and software map, read `references/literature_and_software.md`.
