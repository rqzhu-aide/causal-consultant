"""Template: fitted-Q style prototype for logged sequential decisions.

This is implementation support only. It does not replace longitudinal causal
identification, known logging propensities, support checks, or off-policy
evaluation diagnostics.
"""

import numpy as np
from sklearn.ensemble import RandomForestRegressor

# episodes: list of trajectories ordered by time.
# Each transition should contain state, action, reward, next_state, done.

gamma = 1.0
model = RandomForestRegressor(n_estimators=300, min_samples_leaf=20, random_state=123)

states = np.vstack([step["state"] for ep in episodes for step in ep])
actions = np.array([step["action"] for ep in episodes for step in ep]).reshape(-1, 1)
rewards = np.array([step["reward"] for ep in episodes for step in ep])
next_states = np.vstack([step["next_state"] for ep in episodes for step in ep])
done = np.array([step["done"] for ep in episodes for step in ep])

X = np.hstack([states, actions])
y = rewards.copy()

for _ in range(5):
    model.fit(X, y)
    # Replace action_grid with feasible actions for each next state.
    q_next = []
    for a in action_grid:
        Xa = np.hstack([next_states, np.full((next_states.shape[0], 1), a)])
        q_next.append(model.predict(Xa))
    y = rewards + gamma * (1 - done) * np.max(np.vstack(q_next), axis=0)

model.fit(X, y)

# Evaluate candidate policy with held-out/off-policy methods before reporting.
