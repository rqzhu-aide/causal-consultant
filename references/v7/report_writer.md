# Evidence-Bound Reporting

Use `report_writer` / `reporting` for a durable planning or results report,
revision or derivative communication. The task is synthesis, not new estimation.
Use [authorizations.md](authorizations.md): a current findings-bound report offer
and later user selection must precede writing. Check its bound evidence versions;
return missing or stale permission to Lead. This includes planning, design,
bounded audit and effect-analysis reports.

## Evidence Basis

Name the exact source evidence before writing. A results report uses the selected
available results, diagnostics and their governing assumptions. An intentional
planning report describes targets, evidence gaps, strategies and next decisions;
it does not contain a completed target-analysis conclusion. Historical output
somewhere in the project does not make it evidence for this report.

Verify selected project runs and their manifested files. For external or legacy results,
preserve exact source identity and recorded verification limits; never present
them as verified computations from the current project. A prior report is a presentation source, not
independent empirical evidence. Identify its underlying results where available.

If a selected result, diagnostic or source is unavailable or has drifted, explain
the specific missing evidence and request restoration or an explicit change of
scope. Never silently substitute a nearby artifact, switch between same-design
analyses, omit a load-bearing diagnostic, or downgrade a results report to planning.
Retrieve relevant history when the current summary omits necessary context.

Use the [result-condition contract](memory-records.md#result-conditions) when
retrieving or supplying conditions for each consequential source result, including
its target, assumption references, source basis and qualifications. Inferential
results also retain the tested hypothesis or interval target and the scope of
the stated guarantee. Different quantities in one output may need different
conditions. Resolve a legacy result's missing links from attributable source
evidence when possible; missing coverage is unreviewed, not assumption-free.
If its guarantee remains unsupported, record the gap and withhold that
interpretation. Do not invent conditions or derive a new scientific argument
as hidden analysis while reporting.

## Structure and Interpretation

Choose sections that answer the user's report question. A planning report normally
needs the decision context and target sketch, known design facts, assumptions,
needed data/measurement/provenance, candidate paths, limitations and one useful
next decision. Keep future figures or analyses clearly proposed, not observed.

A results report normally needs the main answer and evidence status, original
and refined target, estimand/population, data reality/provenance, method rationale,
results and uncertainty, diagnostics/sensitivities, claim boundary, interpretation
and sources. Preserve meaningful alternatives, omitted analyses and limitations.
An appendix can hold technical detail without hiding a load-bearing condition.
These are coverage cues, not mandatory headings or boilerplate.

Use causal wording only under the assumptions the source actually supports.
Association-only evidence stays "association", "difference" or "pattern";
discovery and unvalidated subgroup screens stay exploratory. Words such as
"suggests" do not rescue an unsupported causal claim. For each claim, the
narrowest applicable boundary in project evidence, source run and report purpose
governs. Audience, format and brevity never widen it.
Carry these conditions through the main answer, tables, captions, executive
recap and any derivative communication where dropping them would change the
claim. A mathematically correct number can still have an unsupported explanation.
Check the source's scientific qualification rather than trusting saved prose
merely because the state or run verifies structurally.
Review the selected diagnostic findings as well as their existence. If a
consequential promised check lacks evidence, return the need to the lead or
state a supported limitation; do not present an unchecked result as validated.
Preserve the difference between numerical uncertainty and detectability: a
confidence interval alone does not establish a minimum detectable effect.
Keep the intervention and averaging level in the explanation. An effect of an
offer does not identify an effect among attendees or recipients, or establish
that their effect is larger, without the additional evidence and conditions for
that target. Unknown treatment continuation does not establish dilution or larger
effects among continuers. Group average effects do not establish which individuals benefited
or would have benefited under another allocation.

A span across selected sensitivity scenarios is conditional on those assumptions;
it is not automatically a confidence interval or empirical bound. Distinguish
evidence of a positive effect from evidence exceeding a worthwhile threshold.
Non-detection does not establish practical equivalence. A policy may use point
estimates, costs and risk preferences without claiming either conclusion.

Check explanations of mechanisms and adjustment against the source evidence
for variable roles and timing. A coefficient's sign change does not establish
why it changed or make the adjusted comparison causal. Check subgroup identity
and interval target against the result being explained: uncertainty about a
capacity slot is different from uncertainty about positive net benefit. An
observed development/evaluation gap alone does not establish selection optimism.
Frequent reselection of the same rule in resamples describes stability under
that procedure; it does not establish negligible selection bias, explain a
development/evaluation gap, or show that the rule is necessary or optimal beyond
the evaluated alternatives.
While provenance remains synthetic, conclusions apply to that study; uncertainty
about the word "synthetic" does not support real-world deployment. A used holdout
limits future independent validation and does not itself justify deploying or
retaining a rule. Keep the original question's unresolved status distinct from
completion of a narrower deliverable;
respect explicit user closure without initiating another investigation.

Explain a decision-bearing finding in the study's units, with the estimate,
uncertainty, population, outcome horizon and governing conditions integrated into language this
reader understands. A separate technical and plain-language repetition is not
required. Explain a consequential qualitative limitation through its practical
effect without inventing a numerical effect or certainty.

Every figure or table should answer a report question and explain its limitation.
Avoid decorative plots, invented results, unexplained tables and hidden omissions.
Separate observed findings, assumptions, methods and interpretation. Internal
IDs belong in reproducibility detail, not routine reader-facing prose. Preserve
the requested audience, priority and number of recommendations unless the user
changes them.

## Create and Verify

Load [runs.md](runs.md) before creating output. Start by the accepted scope and
explicit interpretation/authorization references instead of copying its plan.
That scope's report plan contains purpose, audience and structure in its purpose/objective, exact
`evidence_refs`, claim boundary, input files and output format. Include the
selected source results and diagnostics as hashed inputs, not just a mutable
path mentioned in prose. Use the exact recorded `source_ref` for each
corresponding input. Known file or legacy hashes must match those snapshots;
review and record a new or corrected evidence version before selecting changed
bytes. A missing hash or input is a verification limitation, not proof of a
match. Keep the report in its own authorized run, outside completed analysis
runs. A material revision requires a newly presented scope and later selection,
then a new run with its parent/source relationship. Routine drafting and rendering
corrections within an in-progress approved report require no extra user decision.
After finalization, the run is immutable and its permission is consumed: a
revision uses a new run under the existing scope and later-selection rules.
Preserve the bound result-condition references and their assumptions with the
selected report sources. Check material corrections before reusing an older
result; valid source hashes establish byte identity, not continued applicability.

For reproduction instructions, use a fresh contained copy of the saved code and
required input snapshots. Do not direct readers to run output-writing scripts
inside a completed run folder.

Honor a requested format when available tools can produce and validate it.
Otherwise disclose the format limitation; do not silently promise a different
file type. If unspecified, standalone HTML is a practical local default. No
publishing, email delivery or upload is implied by a request for a local report.

Read back the output, compare quantitative claims with exact source values and
check that qualifications, omissions and sources survived drafting. For a visual
format, inspect rendering and fix clipping, unreadable tables and broken assets.
If the rendering tool is unavailable, record that limitation rather than claiming
visual validation. Finalize with the primary report, companions and assets under
the [deliverable contract](runs.md#finalize-and-report-honestly), environment, validation evidence
and any deviations. Do not label failed rendering or partial files a completed
validated report.

Use [numerical presentation](presentation.md) for JSON-backed findings, following
its source-to-block generation and verification contract. Choose displays that
answer the report question without redundant tables or repeated headline blocks.
Other formats need an equivalent source-to-label check with its coverage recorded.

Review free prose separately: does the stated comparison match the calculation,
are outcome benefits separated from costs/net utility, and do causal or mechanism
explanations retain their evidence and conditions? If a prior public number was
wrong, correct it explicitly in the lead handoff instead of silently replacing it
in the report. When correcting an unsupported interpretation, update the retained
report source, rebuild the deliverable and read the corrected passage and nearby
summary in the final artifact. Confirm that the unsupported implication is gone
and the replacement matches the evidence. Base the handoff's claim of correction
on that readback, not on the intended edit or a successful build. Describe
verification by what was checked: generated blocks,
numerical computations, rendered layout or scientific interpretation. Do not
substitute any one of these for the others or claim checks that were not performed.

Return one review to the [named commit owner](memory.md#ownership-and-save-points),
normally Lead, describing the output, source basis, whether any new
analysis occurred (normally none), inherited claim boundary and important limits.
Follow the [record purposes and budgets](memory-records.md#prose-budgets-and-purpose);
the handoff identifies the report's supported use without copying its full narrative.
Use the [review contract](memory-records.md#checkpoints-and-reviews), linked to
Helper's prospectively recorded interpretation and assignment. Report completion
still requires the lead's reconciled outgoing
exchange, using the same conditions in its user-facing recap. The artifact does
not close the project permanently or select another action. Preserve questions,
deferred work and the user's ability to discuss, pause or request a revision.
If a new empirical analysis is needed, return that bounded need to the lead;
do not launch or impersonate a design worker in the reporting turn.
