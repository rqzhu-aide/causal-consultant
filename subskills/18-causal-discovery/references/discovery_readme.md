# Causal Discovery Tool Orientation

This folder contains the causal-discovery support module for algorithm recommendation, graph-hypothesis generation, code templates, and DAG Builder handoff.

Use discovery tools to produce graph hypotheses, not final causal proof. Any discovered structure that changes route commitment, adjustment, or claim language must return to the main skill and `04-dag-builder`.

Supporting files:

- `../scripts/recommend.py`: rule-based algorithm recommender.
- `../schemas/`: JSON input and output schemas for the recommender.
- `../examples/`: Python, R, and Java/Tetrad workflow templates.
- `discovery_references.md`: literature and software notes.

Example:

```bash
python ../scripts/recommend.py ../sample_input.json
```
