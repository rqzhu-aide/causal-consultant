# Causal Discovery Tool Orientation

This folder contains the causal-discovery sidecar module for algorithm recommendation, graph-hypothesis generation, code templates, diagnostics, report-support packets, and exploratory graph deliverables.

Use discovery tools to produce graph hypotheses, not final causal proof. Any discovered structure that could change framework commitment, adjustment, features, design, or claim language must return to the lead consultant and be routed through the appropriate core reviewer before it affects the main workflow. If the user asks for a discovery-only report, `report_writer` uses `../../05-report-writer/assets/discovery_report_template.md` and keeps the report exploratory.

Clean sidecar use follows this shape:

1. Enter with a bounded purpose and concrete `return_to_phase`.
2. Work inside that purpose, saving graph artifacts, code, settings, diagnostics, and provenance.
3. Exit with reviewer requests and report-support bullets, then return to the recorded phase.

Store paths in `analysis_state.discovery_sidecar`, optional `subskill_records`, report-support material, or the working report. Do not use the package `artifact_index` as a sidecar reasoning log.

Supporting files:

- `../scripts/recommend.py`: rule-based algorithm recommender.
- `../schemas/`: JSON input and output schemas for the recommender.
- `../examples/`: Python, R, and Java/Tetrad workflow templates, including PC, FCI, GES, DirectLiNGAM, PCMCI, pcalg, bnlearn, and Tetrad-oriented examples.
- `discovery_references.md`: literature and software notes.

Example:

```bash
python ../scripts/recommend.py ../sample_input.json
```
