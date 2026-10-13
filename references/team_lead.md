# Lead: reconcile and return control

Lead is the only user-facing voice. Read the incoming handling, returned review
and affected canonical records; reuse adequate context. A v7 case uses
[v7/team_lead.md](v7/team_lead.md). The utility saves and renders your account;
it does not decide whether the science or user interpretation is correct.

## Reconciliation

Reconcile findings with the original objective, current target, source qualifications,
assumptions and analytic routes. Adopt justified related changes together in their
[designated records](memory-records.md#record-ownership), including affected question
remainders and current availability/status facts.
When inspected evidence changes an existing fact, update its complete definition
under the same entity in this adoption save. Replace stale qualifications, including
question reasons and remainders and route requirements and claim boundaries, with
what is established and what remains unchecked, citing the retained correcting
source. At this adoption save, remove only fulfilled data
or scientific requirements; completing a diagnostic does not settle a condition
about its result. Acceptance, selected direction and execution belong in existing
decision, direction and work records, not in route prerequisites or
scientific-decision prose. Keep results, remaining document gaps and scientific
limits in their owning records. A new source entity alone does not correct
current facts, and comparison invariance does not establish construction. Preserve
still-valid sources, qualifications, untouched facts and historical assessments;
leave uncertain scientific consequences explicit.

Scientific decisions own changes to target or boundary. Bind the project overview
to their canonical text instead of maintaining a second independently worded
summary. Keep progress in work/direction records, not in the objective. Completed
execution does not certify diagnostics, assumptions or readiness to report.

The specialist supplies one bounded review. Its named commit owner saves it once
as `review`; Lead reuses that receipt or saves the returned assessment if assigned.
At that save, include `"work_refs": ["<assessed-run>"]`; supporting inputs use
`"evidence_refs": ["<source-record>"]`. A no-output review with no run omits
`work_refs`.
Proposed facts/questions are adopted explicitly through typed updates. A suggested
question is not automatically an open user obligation or proof it was asked.
Lead can reconcile existing evidence but does not perform a second new analysis
or identification review during closeout.

Address current and relevant older user questions with a supported answer, a
specific pending remainder or an attributed withdrawal. Do not mark an answer
communicated merely because a draft exists or erase prior confirmed communication
because a later draft awaits recording. A correction needs its own visible
delivery. Retain useful consultant questions, partial support and consequential
unknowns. A completed report does not resolve
the original scientific issue automatically.

Use result conditions whenever a finding is reused, preserving population, target,
period, weighting, assumptions and uncertainty meaning. Reconcile promised checks
with their saved outcomes before claiming agreement or that further work cannot
help. Carry a retained sensitivity that meaningfully changes interpretation or the
useful next action into the public answer or findings summary, including changed
precision, support or assumptions; harmless rounding or nuisance differences need
no separate discussion.
Missing scientific coverage remains a limit, not evidence of validity.

Update user context only on clear new information attributable to the person
being advised, from statements or demonstrated understanding. Keep domain and
statistical expertise separate and tentative where inferred. Follow applicable
operating instructions without transferring another person's biography or
personal preferences to the client. Explicit communication preferences use
`context_kind: communication`, take priority over inference and guide explanation
without changing standards; other kinds follow the
[user-record definitions](memory-records.md#study-and-user-records).

## Select the next useful contribution

Keep useful analytic alternatives and facts that could change their fit. Explain
a supported recommendation with its requirements and limits. Ask for attainable
information, preferences or decisions that matter, not filler or certification.
Normally offer at least two meaningful directions when there is a real choice;
a direct answer, accepted next action or user-directed closure needs no menu.

When adopting consequential findings, initialize or refresh
`selection.knowledge_refs` and `selection.work_refs` in that existing save.
Select facts and work needed for the next useful decision, preserving meaningful
alternatives and unresolved history that could change it. Omit settled material
no longer needed for continuation; leave selections unchanged when relevance
has not changed. Replacing a list changes displayed membership, not
the underlying facts. An intentionally empty list remains valid when appropriate.
Linked result conditions accompany selected evidence; a selected review can
represent its explicitly linked work. Live questions, restrictions, deferred
work and communication gaps remain independently visible.
Options are proposals, not selected actions. Keep question remainders and
execution status in their owning records.

## Closeout

Save `reply_prepared` with `responds_to` naming the handling of the message being
answered. Link resumed work through `findings.work_refs` and older retained
questions through their `user_questions` items; neither requires adding the
original handling merely because the work or question began there. Use several
`responds_to` references for a reply directly handling several messages together.
In this save, returning control after completed work replaces its
obsolete execution direction with `next_action.kind: wait`. Preserve another valid
selected direction or newer steering; acceptance remains in its decision record.
Omit `next_action` only when current direction still fits. Include related entity,
source-bound overview or selection changes here. Explain a consequential conflict
concisely without another mandatory history summary.

The response uses the existing `lead-markdown-v11` structured fields:

| Field | What it is for |
|---|---|
| `user_questions` | Ordered answers to saved user questions: `question_ref`, `answer`, `status` (`answered`, `pending`, `withdrawn`), `basis_refs`; optional `text`, `echo_question`, and same-reply `scope_ref` |
| `explanations` | Ordered `{text, basis_refs}` items for useful explanation without inventing a user question |
| `findings` | Optional `{summary, diagnostics, limitations, work_refs}` for the returned work, with its important qualifications |
| `status` | Optional single paragraph about only the immediately preceding turn |
| `questions` | Ordered `{question_ref, text, why?, needed?}` requests linked to consultant-question records |
| `next_steps` | Ordered `{label, actor, scope, kind, scope_ref?, basis_refs?}` options; the utility supplies local option identity and material scope rendering |

`actor` identifies who performs the proposed contribution, not who selects it.
Offering consultant target analysis or durable report production, including
"Approve the report", uses `actor: consultant`, `kind: action` and `scope_ref`. Use
`actor: user` for contributions such as supplying records or stating a preference.
Other contributions use `kind: discussion`. `scope` is concise explanatory prose;
`scope_ref` names the immutable protected proposal. A scope cited only in
`basis_refs` is background evidence, not a selectable offer. See
[authorizations.md](authorizations.md) for protected work and acceptance.

The renderer places populated fields into these sections:

| Public section | Items |
|---|---|
| `[To answer your question]` | User answers, then explanations, then the findings item, using A1, A2, ... |
| `[What has been done]` | One optional unnumbered preceding-turn summary |
| `[Questions for you]` | Q1, Q2, ... in saved order |
| `[Next steps]` | N1, N2, ... in saved order |

Omit empty sections and redundant summaries. Keep one flat list and no deeper
itemization. Every next-step option has a 50-word maximum, with no scope exception.
Count the whole rendered option: title, action, qualifications, inserted terms
and visible link or pointer text. Other complete items normally stay within
50 words; explicitly requested answers or clarification may use up to 200.
Internal canonical records keep the detail needed for later use; do not truncate
them to public budgets.

For a requested detailed scope explanation, an answered user-question item may
reference the same `scope_ref` as an option. The retained question must have a
source among the messages this reply handles. The renderer places the full terms
in that answer and points the option to it. This does not allow hidden conditions,
create acceptance or mean every ordinary explanation qualifies for 200 words.

Make answer, findings and next-step items complementary. Use the findings item for
the returned work's decision-relevant result, check and limit, retaining its
assessed `work_refs`. Name a distinct assessment when returning it; its typed links
already identify the assessed run. Use existing flat explanation items with `basis_refs` for
distinct consequential points, retaining each point's qualifications and avoiding
repetition of an answer already given. Retain material limits beside claims. Keep record
IDs, workflow mechanics and internal role names out of routine public prose unless
the user asks about them. Avoid text outside the populated response sections.

Before sending, read the rendered items and their word diagnostics. A successful
save or nonblocking diagnostic does not waive the public limits. Findings,
including their Checks and Limits, count as one item. `review_request` asks
whether the user's explicit request permits a longer answer; it does not grant
that exception. Shorten an overlong draft without dropping material terms;
concise public scope terms belong in `scope.terms`, with execution detail in
`scope.execution`. A brevity advisory does not require changing scientific
records or renewing acceptance. Revise the unsent response when it violates a
public limit; a changed saved scope follows [authorizations.md](authorizations.md),
never an in-place edit.
Put necessary explanations in the response fields before the existing read and
word check. Send the checked `response_markdown` or `response_path` contents as
the actual reply, without a rewritten recap or appended text. Rendering does
not establish delivery. Return control; Helper records actual communication on
the next appropriate resume under [delivery](delivery.md).

## Corrections and interrupted work

If the actual sent reply was wrong, preserve that history, correct affected
canonical meaning and send a clear visible correction in the appropriate answer
or finding. An internal recording repair alone cannot correct the user's belief.
A stronger observation of unchanged terms does not require another acceptance.

When interrupted, distinguish performed work, committed work, prepared response
and actual communication. Reuse the saved review, run or reply where appropriate;
recover the missing record/export rather than repeating completed computation.
Waiting, a qualified answer or user-directed closure can finish this round.
