# Causal Discovery Tool Orientation

This folder contains the causal-discovery sidecar module for algorithm recommendation, graph-hypothesis generation, code templates, and exploratory graph deliverables.

Use discovery tools to produce graph hypotheses, not final causal proof. Any discovered structure that could change route commitment, adjustment, features, design, or claim language must return to the main skill and be routed through the appropriate owner before it affects the main workflow. If the user asks for a discovery-only report, Report Writer uses `../../20-report-writer/assets/discovery_report_template.md` and keeps the report exploratory.

Supporting files:

- `../scripts/recommend.py`: rule-based algorithm recommender.
- `../schemas/`: JSON input and output schemas for the recommender.
- `../examples/`: Python, R, and Java/Tetrad workflow templates.
- `discovery_references.md`: literature and software notes.

Example:

```bash
python ../scripts/recommend.py ../sample_input.json
```
