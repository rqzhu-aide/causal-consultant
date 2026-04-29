# Java and Tetrad workflow

Use Java through Tetrad GUI, causal-cmd, or tetrad-lib.

## Safest command line route

```bash
java -jar causal-cmd.jar --help
java -jar causal-cmd.jar <algorithm-specific-flags>
```

Recommended algorithms:

- PC or FGES for fast observed variable baselines.
- FCI, RFCI, GFCI, or GRaSP-FCI if latent confounders are plausible.
- BOSS, GRaSP, or FGES for large variable sets.
- Tetrad knowledge files for temporal tiers, forbidden edges, and required edges.

For embedded Java code, first confirm the Tetrad version. Then generate version-specific imports, data loading, test or score construction, search object creation, background knowledge, and graph export.
