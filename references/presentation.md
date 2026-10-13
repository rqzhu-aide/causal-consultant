# Numerical presentation

Use the dependency-free presentation utility to present selected estimates from existing JSON results without copying point estimates or interval endpoints into a second hand-written record. Scientific methods remain open: select the appropriate result, label, units, population, comparison and uncertainty method from the completed analysis. This utility verifies source-to-presentation consistency; it does not establish identification, unbiased estimation or correct interpretation.

```text
node scripts/present.cjs render --input presentation.json
node scripts/present.cjs verify --input presentation.json --artifact actual-report.html
```

Both commands return JSON to stdout and write no files. They do not start work or grant permission. Use them within the current approved work and save the specification, generated fragments and verification result through the existing [run workflow](runs.md), including `write-run-file` for manager-owned output. Creating a final report still requires its own current accepted scope. A generated numerical fragment is not a completed report.

The input specification names sources with their actual SHA256 values and selects numbers by JSON Pointer. Relative source paths are resolved against the specification's directory; with `--input -`, they are relative to the current working directory. Prefer contained run snapshots or finalized result files. Hashes must come from those bytes or their verified manifest, not a model guess.

```json
{
  "format": "html",
  "sources": [
    {
      "source_id": "analysis",
      "path": "inputs/0001.json",
      "sha256": "REPLACE_WITH_THE_ACTUAL_64_CHARACTER_SOURCE_SHA256"
    }
  ],
  "quantities": [
    {
      "quantity_id": "effect",
      "label": "Mean outcome difference",
      "units": "days",
      "population": "The study recruitment frame",
      "comparison": "Intervention versus usual care at the specified follow-up",
      "source_id": "analysis",
      "value": "/effect/estimate",
      "interval": {
        "lower": "/effect/interval/lower",
        "upper": "/effect/interval/upper",
        "level": 0.95,
        "method": "stratified percentile bootstrap"
      },
      "digits": 2,
      "sign": true
    }
  ],
  "blocks": [
    {"block_id": "estimates", "kind": "table", "quantity_ids": ["effect"]}
  ]
}
```

Use `format: "markdown"` for Markdown tables and headline blocks. Omit `interval` when no interval is available; do not invent one. A quantity requires label, units, population and comparison, all visible in the generated output. For an absolute level, describe it as a level instead of inventing a comparator. `digits` defaults to 2 and accepts 0 through 12. Estimates and endpoints must resolve to finite JSON numbers; numeric strings, absent locators and reversed intervals are rejected. Pointer keys containing `/` or `~` use `~1` or `~0`. The utility does not require a symmetric interval or require the estimate to lie inside it.

Choose `kind: "headlines"` for a short finding instead of a table when that serves the reader. Include both only when they answer distinct presentation needs. Reduce repeated selections and surrounding prose before expanding a table; retain its scientific metadata and intact verification block.

Keep one substantive numerical account in the appropriate output. The review names the finding and its use-changing limit; Lead explains its implication under the [record purposes and budgets](memory-records.md#prose-budgets-and-purpose). Link detailed diagnostics and exact result conditions instead of copying the full table into every layer. Numerical tables and inferential conditions have no new prose cap; conditions that change a displayed claim remain beside it.

The response contains resolved `quantities` with their source paths, hashes and locators, plus `blocks` and the joined `fragment`. Keep each generated block intact, including its `cc-presentation` comment markers. Compose narrative and layout around those blocks; revise the specification and regenerate when a label, precision or selection needs correction. Tables have one consistent set of columns, and data cells are escaped. Do not paste a supplied estimate or interval elsewhere and describe that separate text as verified.

`verify` regenerates the blocks from hash-checked source bytes and compares each complete labeled block against the actual artifact. A shifted header, incorrect interval, changed comparison or duplicated/missing block fails even when all the correct numbers occur elsewhere. CRLF and LF line endings are treated equivalently. The returned result states its coverage: generated blocks only. Surrounding prose, additional numbers, CSS, visual layout and scientific claims still require appropriate review. For another output format, use a suitable rendering/verification method and record what it actually checked; do not claim this utility verified an unsupported artifact.

Review the selected locators and metadata against the scientific question. Two valid numbers from different estimands are not made comparable by putting them in the same table. An outcome effect, a policy value after cost, and a contrast against no treatment must remain distinct. Numeric consistency checks do not prove that the model's causal explanation is correct.
