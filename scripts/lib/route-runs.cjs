"use strict";

// Explicit assignment navigation only. Runs own execution lifecycle; these
// links do not revise a route's scientific assessment or certify its checks.
function routeRunLinks({ state, events }) {
  const scopes = new Map(), interpretations = new Map(), assignments = new Map();
  const runEvents = new Map();
  for (const event of events) {
    const payload = event.payload || {};
    if (payload.run) runEvents.set(payload.run.run_id, event.event_id);
    if (event.type === "run_started" && payload.run) {
      const run = payload.run;
      let assignment, source, bindings = [];
      if (Object.hasOwn(run, "authorization_binding")) {
        // A missing bound scope is not permission to substitute another
        // assignment. Scope definitions here precede this run's start.
        const binding = run.authorization_binding;
        const scope = scopes.get(binding?.scope_ref);
        if (scope) {
          assignment = scope.assignment;
          source = { scope_ref: scope.scope_id };
          bindings = binding.basis_versions || [];
        }
      } else {
        const interpretation = interpretations.get(run.interpretation_ref);
        if (interpretation?.next_action?.kind === "specialist") {
          assignment = interpretation.next_action.assignment;
          source = { interpretation_ref: interpretation.interpretation_id };
        }
      }
      if (assignment && source) assignments.set(run.run_id, {
        strategy_ids: [...new Set(assignment.strategy_ids || [])], source, bindings
      });
    }
    // Read full journal bodies rather than relying on state projections.
    // Later definitions cannot change the assignment captured at run start.
    for (const scope of payload.changes?.action_scopes || []) scopes.set(scope.scope_id, scope);
    if (payload.interpretation) interpretations.set(payload.interpretation.interpretation_id, payload.interpretation);
  }

  const result = new Map();
  for (const run of state.runs || []) {
    const recorded = assignments.get(run.run_id);
    if (!recorded) continue;
    for (const strategy_id of recorded.strategy_ids) {
      const binding = recorded.bindings.find(value => value.ref === strategy_id);
      const link = { run_ref: run.run_id,
        event_ref: state.history_index[run.run_id]?.event_ref || runEvents.get(run.run_id),
        status: run.status, kind: run.kind, ...recorded.source,
        ...(binding?.event_ref ? { strategy_event_ref: binding.event_ref } : {}),
        retrieval: { mode: "record", records: [{ record_ref: run.run_id }] } };
      if (!result.has(strategy_id)) result.set(strategy_id, []);
      result.get(strategy_id).push(link);
    }
  }
  // No association means only that no explicit prospective assignment was
  // recoverable. Unlinked runs remain visible in the operational inventory.
  return result;
}

module.exports = { routeRunLinks };
