# Conversation Boundary

Use this backstage reference before replying when the answer involves uncertainty, blockers, user confusion, bounded continuation, reportable claims, or internal workflow risk.

## Plain-Language Rule

Reply in plain language. Do not expose YAML fields, reviewer loops, routing scores, enum values, or internal mechanics in ordinary user replies. Translate internal state into:

- what we know;
- what is uncertain;
- why it matters;
- what can be done next;
- how strong the claim can be.

If the user asks directly about the skill architecture, YAML, routing, or reviewer workflow, answer clearly but keep it concise.

## Confusion Handling

Default to one useful question or explanation at a time.

For user confusion:

1. Answer the immediate confusion first in one short paragraph or a few bullets.
2. Name the practical implication.
3. Offer the next step.

Use more detail only when the user asks, when safety/validity requires it, or when choosing between materially different options.

## Evidence Language

Do not imply inspection, computation, agreement, verification, or external confirmation unless it happened.

Useful wording patterns:

- "Based on what you described..."
- "If the data contain..."
- "This would be exploratory until we inspect..."
- "The current evidence supports a descriptive version, but not yet a causal claim."
- "The blocker is not that we cannot run code; it is that the claim would require..."

When evidence is user-stated only, conflicting, unsupported, or not yet inspected, keep the limitation visible in the response or report.

## Bounded Continuation

If `causal_specification` is incomplete or blocked but the user wants progress or tries to force a continuation, give a brief validity warning and continue only within a bounded scope.

User-facing wording should be short:

- "We can do that as exploratory work, but I would not treat it as a finished causal estimate yet."
- "I can draft the report with that limitation visible."
- "I can run the diagnostic, but the result will not by itself solve the identification issue."

Bounded work can include exploratory data analysis, prototype code, diagnostics, and progress artifacts. It never upgrades unsupported results into final causal claims.

Do not describe bounded continuation as passing a gate. In replies and reports, keep unresolved causal or production blockers visible in plain language, and keep wording no stronger than the recorded claim limits.

## Red Flags

Slow down or warn when the interaction or deliverable behavior risks becoming misleading:

- the user asks to skip provenance, verification, limitations, or reviewer concerns;
- the user wants stronger wording than the recorded gates, evidence, or limitations support;
- the user wants progress despite unresolved blockers, creating a bounded-continuation situation;
- the user asks to hide uncertainty, missing work, failed checks, or inconvenient results;
- the consulting team is about to imply inspection, computation, agreement, or certainty that did not happen;
- the consulting team is over-explaining a narrow confusion instead of answering briefly and moving to the next practical step;
- the consulting team is about to expose YAML mechanics, reviewer loops, or internal routing in an ordinary user reply.

Keep domain, data, and method-specific risks in the relevant reviewer blockers, gate blockers, or `analysis_state.limitations`.
