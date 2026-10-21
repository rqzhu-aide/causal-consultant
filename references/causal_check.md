# Causal Readiness and Design Elicitation

Use `causal_check` with operation `design_elicitation` or `readiness`. Review
what the study can support, not how persuasively a causal sentence can be written.
A user's preferred estimator is a question to investigate, not validity evidence.

For an initially underspecified causal request, assess the consequential study
process before endorsing a final strategy or an exhausted-evidence fallback.
This is substantive work, not a required checklist of status fields. Reuse
established facts and earlier adequate assessments; ask or inspect only gaps
that could change the target, design or advice. Explicit descriptive work can
proceed within its own claim boundary while the causal question remains open,
subject to [authorizations.md](authorizations.md) for protected computation.

## Design Elicitation

Interpret available user accounts, protocols, allocation rules, eligibility
records, rollout decisions and collection logs when they can resolve the main
uncertainty. Establish who could receive treatment, who decided, on what
information, at what time, and why some units received a different exposure.
Separate assignment, actual receipt, exposure measurement and outcome observation.
Ask what changed in recruitment, recording, eligibility or follow-up around the
intervention. Distinguish actual practice from the written protocol.

Produce a coherent, source-labelled account of the assignment and collection
process, including contradictions and gaps. Explain which designs that account
supports or undermines. When one missing fact remains decisive, identify it
precisely and say how the user or a document could resolve it. Ordinary asking
for that fact is lead work, not a reason to invoke an empty specialist review.

When planning future collection, connect the proposed comparison to a usable
provisional recommendation about what to collect, for whom and when, using
known resource, workload, access and participant-burden limits. Explain the
collection or allocation tradeoff that matters for the user's current planning
goal, including when narrower coverage or richer measurement in fewer units
would better serve the question. Revisit an unanswered constraint when an
attainable answer could change the next useful recommendation; otherwise state
the condition and how it will be checked. Retain proportionate permission and
confidentiality conditions for the activities proposed. If a measurement can
reveal serious harm needing action, identify who can respond and make an
attainable response arrangement a condition before using it. A provisional
plan or useful pause need not wait for every condition to be resolved. A
narrower endpoint the user has chosen need not complete the broader study
design.

## Readiness

Check the question, population, exposure, comparator, outcome, time zero,
follow-up and estimand together for each proposed route, including conditional
fallbacks.
Distinguish the intended population from the units with observed outcomes.
Missingness, censoring, exclusions, weighting, and changes to exposure or
follow-up can change identification requirements and sometimes the target.
An observed-case contrast is not automatically an effect for the original
population or a common selected subgroup. If an event makes the outcome
undefined rather than merely unobserved, such as death before a symptom score,
distinguish a descriptive observed-case comparison from a causal effect for a
shared subgroup or a new outcome that includes the event. State the target and
assumptions of any causal alternative; few or similar event rates do not
establish a common causal comparison population. Explain which comparison
supports the stated target and what remains assumed; otherwise state the limit
or propose an explicit alternative. Preserving planned or assigned exposure
after deviations may define a plan/assignment-policy contrast under the relevant
comparison assumptions. It does not randomize allocation or automatically
identify actual-delivery, actual-receipt or no-exposure effects, or attenuation
toward the null.
In particular:

- order covariates, treatment, mediators, outcomes, selection and censoring by
  the actual study process and measurement/reference windows; when entry or
  follow-up changes, reassess variable roles rather than treating everything
  recorded before the new time zero as pre-exposure. A recall or aggregate
  measure spanning exposure is not automatically pretreatment; preserve its
  timing uncertainty and the conditions for any proposed use;
- identify the assignment or exposure process and the comparison it supports;
- assess confounding, measurement, missingness, support, leakage, interference,
  clustering, selection and transport assumptions where they affect the target;
  match inference to assignment and dependence, keeping the recommendation
  conditional when these remain unknown;
- distinguish the quantity an observed source or proposed diagnostic measures
  from the outcome, mechanism or assumption it is meant to assess. Explain the
  link. Before attributing a consequential pattern, consider plausible competing
  causes and what attainable evidence could distinguish them. Selection, coverage
  or a ratio's composition can change the measure without a corresponding change
  in the target outcome. Preserve what events and temporal resolution a
  reconstruction can identify and any unverified measurement, coverage or
  interpretation conditions; evidence about one mechanism, population or period
  does not establish the unsupported remainder;
- identify diagnostics, sensitivity, falsification or negative controls that
  could materially weaken or qualify the conclusion.

For design or support selection, load [method-catalog.md](method-catalog.md).
Do not load all design playbooks. The catalog identifies a scientific frame;
its presence does not establish that required data or assumptions are satisfied.
Routine empty audit/domain status fields are not blockers. Inspect the evidence
actually needed for this review, and do not treat imagined data as available.

Discovery output remains candidate structure. Establish variable roles,
adjustment validity and identification independently from timing, assignment,
domain knowledge and defensible assumptions. A fitted graph is not an adjustment
certificate. Diagnostic success cannot prove untestable identification assumptions.

Use [Helper's reconciled account](helper.md#resume-and-interpret) without
mistaking understood meaning for established science. Assess the affected
mechanism, cohort, target and plausible alternative accounts against their
sources. Return justified changes and unresolved implications together; preserve
unaffected conclusions and historical reviews. Changed source meaning does not
itself imply altered artifact bytes.

## Strategies and the Next Discriminator

Compare plausible accounts against the original causal question, not only the
currently preferred analysis. For a leading check, identify what different
answers would enable or rule out and a source capable of distinguishing them.
An important but difficult gap remains a limit on the claim; prioritize a
feasible investigation of it rather than replacing it with easier diagnostics.

For example, a spending/outcome snapshot may reflect funding received before
the studied cohort's exposure, or spending recorded after its outcome. Inspect
the period/cohort definitions to distinguish these accounts. If timing aligns,
investigate how funding differed and whether a relevant allocation record exists.
A rule is a lead to assess, not an identification certificate. If timing or
assignment cannot be recovered, distinguish an established access/knowledge limit
from a source that has simply not been examined. No fixed question order follows
from this example.

Maintain project-specific candidates using the
[study-record contract](memory-records.md#study-and-user-records). Recommend a default
only when evidence can rank a responsible route for the current target; keep a
route's endorsement or exclusion conditional while unresolved study facts could
materially change it.
Consider alternatives suggested by a consequential limitation or opportunity in
the current route, even when a viable default exists. Relevant changes may concern
model assumptions or structure, data construction or linkage, method, population,
comparator, follow-up, estimand or interpretation, including an explicitly
non-causal fallback. These are reasoning dimensions, not a checklist. Return
alternatives that could materially improve the answer or its usefulness, with
what they preserve or change. Lead selects the public choices under its
[selective option guidance](team_lead.md#select-the-next-useful-contribution).
An information route requests existing material that could resolve the uncertainty.
For an existing-data consultation, it does not require repeated experiments or
new observations. Recommendations for future collection follow Design Elicitation
above and remain proposals, not claims that collection is available or approved.
Do not invent unsupported science to populate the menu; preserve the limits of
available evidence.

For each material change, record its supporting/opposing evidence, unmet
requirements, claim boundary, reason, and what could reopen or promote it.
Keep unsupported and historical strategies discoverable. Two strategies sharing
a design remain distinct if their populations, targets or required data differ.
Routine estimator or uncertainty variants belong inside one strategy.

An alternative target does not replace the user's current target. ATT, overlap,
complier, cutoff-local and future-data targets may be valuable, but their changed
interpretation must be visible and adopted before execution. Never rank or create
strategies from the significance, direction or desirability of target results.
Result-driven recoding, exclusions or target switching do not repair a design.

If evidence cannot rank the routes, say so and name the smallest fact or user
decision that would discriminate them. Recommend an actionable next investigation,
with its required material, rather than another generic causal review. A missing
assignment log cannot be supplied by invoking a different specialist. If no
attainable review would change advice, give the supported conditional or limited
recommendation and return to the lead for discussion. Residual assumptions need not be repeatedly sent back
to the user as factual questions. Return proposed dispositions for the
[lead to reconcile](team_lead.md#closeout); use the [question contract](memory-records.md#questions)
when updating a saved answer or unresolved remainder.

## Claim and Work Boundary

Use the [record purposes and budgets](memory-records.md#prose-budgets-and-purpose):
summarize the decisive conclusion and limit; link the detailed identifying account.

Make the assessment's basis inspectable: connect consequential facts and their
sources, unresolved conditions, the live routes they support or undermine, and
the reason for the recommended next action or stopping. Unknowns need not all
be resolved. An open, attainable check that could materially improve the answer
prevents calling the evidence exhausted; a bounded result or explicit user
closure can still be complete. Preserve which question was actually settled.

State whether the evidence supports a causal claim under named assumptions,
a narrower qualified causal claim, association-only analysis, or planning only.
An explicit descriptive fallback can be useful but is never a causal design or
a silent substitute for requested estimation. Unresolved identification conditions
must be named as conditions on the claim or concrete checks needed before it,
not buried in a generic limitations list.

This review may inspect inputs, existing results and input/design-feasibility
diagnostics. Do not compute a new target outcome contrast, fitted target result,
subgroup effect or exposure-outcome association. Calling it a diagnostic does
not change that boundary. Existing results can be discussed without recomputation
or extension. Policy learning/value and outcome-based subgroup selection are
also protected analysis. A new estimate needs a presented analysis scope and
later acceptance before one design worker executes it in a later turn.

Return one meaningful review with evidence, assumptions and strategy changes
to the [named commit owner](memory.md#ownership-and-save-points), normally Lead.
Use the [review contract](memory-records.md#checkpoints-and-reviews), linking it
to the prospectively recorded handling and assignment. An option
selection authorizes bounded work; it does not confirm the identifying
conditions. Preserve partial answers and uncertain accounts in the evidence
and keep unanswered factual questions open.

Link consequential supported claims to their target, assumptions, source basis
and limits through the [result-condition contract](memory-records.md#result-conditions).
Do not merely place a condition
in a general limitations paragraph where it can detach from the claim. Existing
unlinked results are unreviewed for these conditions, not assumption-free.
Return the decisive uncertainty and practical next direction to the lead. Do not
start another specialist or perform final report production inside this review.
The lead reconciles the handoff and records which questions it actually asks in
the outgoing exchange. Readiness is a finding, not execution permission or an
automatic report transition. A design-only or nonidentification finding can be
discussed and support its own later report offer without invented effect results.
