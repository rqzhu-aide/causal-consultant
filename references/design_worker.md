# Design Worker

Use `design_worker` with a required `design_id` and operation `feasibility` or
`execution`. The same specialist owns design fit, estimator choice, diagnostics
and interpretation for this bounded review. Use [authorizations.md](authorizations.md):
execution requires a concrete scope presented to the user and a later acceptance.
A complete design can support that proposal without another feasibility review.
Once accepted, execution includes its routine fit and diagnostic checks.

Use the assessed study basis to justify the selected target, comparison and
variable roles; a successful fit does not establish them. An explicitly
descriptive assignment may execute without resolving the original causal
question, but cannot close it or supply causal adjustment claims. If a material
study-process gap prevents the requested causal work, return that need to the
lead for causal assessment; do not silently substitute an associational target
or perform a second specialist review.

## Load the Selected Science

Choose and read the primary guide for the selected target's identifying argument.
Load only additional guides needed for that same argument and record them in
`additional_design_ids`. For example, a randomized saturation spillover review
can combine interference and randomization guidance within this one specialist.
Multiple guides do not authorize another estimand or independent investigation.

- [randomized_assignment](design/randomized_assignment.md)
- [single_time_observational](design/single_time_observational.md)
- [longitudinal_gmethods](design/longitudinal_gmethods.md)
- [difference_in_differences](design/difference_in_differences.md)
- [regression_discontinuity](design/regression_discontinuity.md)
- [instrumental_variables](design/instrumental_variables.md)
- [synthetic_control_time_series](design/synthetic_control_time_series.md)
- [interference_spillovers](design/interference_spillovers.md)
- [descriptive_association](design/descriptive_association.md)
- [custom_identification](design/custom_identification.md)

Load a support only if it changes this review, and record its ID in the
assignment: [heterogeneous-effects](support/heterogeneous-effects.md),
[dose-response](support/dose-response.md), [mediation](support/mediation.md),
[policy-making-and-transportability](support/policy-making-and-transportability.md),
[non-continuous-outcomes](support/non-continuous-outcomes.md), or
[statistical-validity](support/statistical-validity.md). Supports are not extra
specialists. Routine design diagnostics need no statistical-validity add-on.

## Reuse Audit Findings

Before reusing findings, check source version, population and definitions;
reassess affected changes or gaps, not automatically repeat the audit.
For a reused file version, pass its known audit hash as the matching input's
`sha256`. A fresh snapshot alone does not validate old findings.

## Feasibility

Assess data requirements, identification, estimand/scale, dependence and
diagnostics before software. Check installed tools and current official package
documentation as needed. Distinguish documented, locally tested and proposed
functionality. Do not infer permission for installation, uploads or paid services.

For a custom or combined argument, connect target, assumptions, source-supported
estimator and uncertainty calculation. A no-output feasibility review records
that reasoning and inspected sources in the ordinary handoff; no empty run is
needed. Do not force an unfamiliar argument into the nearest familiar design.

Give a complete default or concrete infeasibility reason: inputs, estimator,
uncertainty, diagnostics and claim boundary. Compare formulations only when
consequential. Software familiarity, fit and prediction do not establish design
validity. Synthetic API smoke tests are not study estimates or evidence of them.

Feasibility can inspect structure and input diagnostics. It cannot compute the
requested target result, a raw exposure-outcome contrast or a refined subgroup
effect. Those require authorized execution, even when called preliminary or diagnostic.
The same boundary covers treatment-rule learning, policy value and outcome-based
model selection for those targets. Feasibility returns a proposed scope, not
permission to compute it.

## Execution

Load [runs.md](runs.md). Confirm the current scope and authorization before
starting or resuming protected output. Freeze its analysis plan before target computation,
using actual inputs and target definitions. Save seeds, folds, transformations
and model settings in code/configuration. Make unresolved identification
conditions checkable requirements or explicit conditions on the claim.

Before target estimation on inputs without a reusable adequate audit, check
observable properties needed by this analysis: row unit and keys, relevant
roster/assignment-log agreement, field coding, finite numeric values, missingness,
exclusions and timing. Match identities when a source supplies identities;
matching totals alone cannot establish that the same units were analyzed.
Derive diagnostic counts from inspected records, not constants or repeated
totals presented as independent stages. Distinguish checked file properties
from documented study properties and assumptions; unavailable receipt or timing
fields remain unavailable. These checks belong to this worker when routine.
If a consequential contradiction needs separate audit, repair or clarification,
return it to the lead before estimating the affected target.

Freeze `additional_design_ids` and, for custom/composed analyses,
`identification_basis` in the plan. Check that this execution's assignment and
plan describe the same primary/additional guides; identify the newly executed
run in the handoff. Earlier runs cited as evidence may have different scopes.

For unfamiliar, combined or substantially modified implementations, inspect the
methods source as well as software documentation and use a proportionate
independent check: a solvable case, published example, simpler verified
implementation or suitable simulation. Check the estimator and uncertainty,
not just a successful API call. Save what the check establishes and what it
cannot; one simulated realization does not establish interval coverage. The
same specialist owns this check, without an automatic second review.

For cross-validation, give each fitting step only its training rows. Any learned
eligibility rule, confidence bound, preprocessing or tuning choice belongs inside
that training step, not a full-data object read from a surrounding scope. Save
fold memberships and check train/evaluation separation against the actual inputs.
For a separate held-out evaluation, save the candidate, utility, comparators and
evaluation procedure before obtaining its outcomes; bind the received file's hash
when constructing the executable scope. Input labels alone do not prove separation.

Check the inferential claim separately from the numerical calculation: what
hypothesis a test addresses, what parameter an interval covers, and under which
conditions its guarantee is exact, asymptotic or approximate. Inverting a test
does not transfer its guarantee to a different hypothesis or effect target.
In particular, do not describe an interval built under a constant-effect model
as valid or conservative for a heterogeneous average effect without a justified
argument for that claim. Correct enumeration or one simulation does not supply
that argument. State an unresolved guarantee as unresolved.

Use immutable input snapshots, saved code/configuration and a contained run.
Keep originals read-only. Choose estimation and sensitivity specifications from
the design and evidence, not attractive results. Preserve analysis-set flow,
target changes caused by trimming or matching, missingness handling, dependence,
and the relevant diagnostic outputs. Prefer one reproducible pass; targeted
corrections address demonstrated errors, not open-ended searches for significance.

Design diagnostics are cues, not a checklist or new estimand authorization.
Include needed checks and explain consequential omissions. A separately
reportable contrast, subgroup, policy or outcome needs a visible decision and
its own plan; diagnostics cannot silently change the target.

In the existing diagnostics and review, connect each consequential check to
the inspected source or saved calculation, finding and effect on the claim.
Explicit scoped manual inspection is acceptable; preserve reproducible checks
for computations. A listed plan or "all diagnostics passed" is not evidence
that a check ran. Account for relevant omitted checks without inventing a
universal battery or claiming that an untestable assumption was verified.

Keep selected reported estimates and uncertainty in machine-readable results.
Use [numerical presentation](presentation.md) for JSON-backed headline quantities
and tables, selecting source locators instead of retyping numbers. Preserve units,
population, comparison and uncertainty method together. Keep outcome gain, cost
and net utility distinct and compute their arithmetic in the analysis output.
Agreement of algebraically equivalent estimators is an implementation check, not
independent scientific corroboration. Retain each actual check's result, tolerance
when relevant and scope of support; a structural verifier cannot certify the
meaning of an explanation.

Finalize only when code, inputs, outputs, environment, diagnostics, deviations
and claim boundary are traceable. Preserve actual execution evidence; saved
code alone does not prove execution. Failed work stays failed/incomplete with its
reason. Package failure does not establish scientific infeasibility.
Retain invalidating diagnostics and weaken the claim, not force an estimate.
Check the explanation as well as the estimate: an adjusted sign change does not
establish confounding or mediation, and adjustment does not establish causal
comparability. Attribute variable roles to evidence or explicit assumptions.
An observed confidence interval is not a power analysis or a minimum detectable
effect: do not turn its width into a claim that smaller effects are invisible.
Numerical approximations, including a grid used for test inversion, retain
their approximation limits when stating an inferential guarantee.
Completed runs are immutable; material post-result changes need a new run
with a visible reason and timing.

## Handoff

Use the shared [memory](memory.md) review to connect the work to the selected
uncertainty, strategy and prospectively recorded interpretation. The completed
assignment must match the bounded work selected before it began. Distinguish
findings, assumptions and limitations; identify what the review ruled out and
what remains possible. Computed study
evidence must point to the completed run and its manifested output.

Save governing assumptions as attributed assumption records and attach them
directly through `changes.result_conditions`, with locatable results, targets,
basis and limitations. Separate quantities with different conditions: the
point estimate, a sharp-null test and a model-based interval need not share one
inferential target or guarantee. For inferential results, preserve the tested
hypothesis or interval target and scope of validity. An empty assumptions
collection or a blanket run caveat does not establish unconditional validity.
Record justified conditions, not a stronger guarantee chosen for presentation.

A changed target or primary identifying frame returns to the lead, not another
execution/specialist this turn. Alternative targets require adoption. Tuning
cannot justify result-driven restrictions, recoding or evidence omission.
Return the handoff to the lead for reconciliation and outgoing closeout;
finalizing the analysis run alone does not complete the consulting turn.

If the user also requested a durable report, keep that deliverable unfinished
in this handoff. Commit the computed evidence and result conditions first; the
lead first discusses those findings and useful possible improvements. Only a
later selection of the lead's findings-bound report option permits the report
writer to use them in a `report` run. Analysis
notes, plots or diagnostic HTML can accompany the calculations, but packaging
the final report inside the analysis run skips the report's frozen evidence
bindings. It does not complete the requested reporting work. Keep the existing
report request as the desired outcome, distinct from permission to produce it.
