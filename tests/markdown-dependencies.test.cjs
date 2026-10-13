"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const d = require("../scripts/lib/deliverables.cjs");

function checkReport(t, content, present = {}, assets = []) {
  const base = path.resolve(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-markdown-deps-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), base);
    assert.ok(path.basename(root).startsWith("cc-markdown-deps-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const files = { "outputs/report.md": content, ...present };
  for (const [file, bytes] of Object.entries(files)) {
    const target = path.join(root, "runs/report", file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, bytes);
  }
  const manifest = { files: Object.keys(files).map(file => ({ path: file })), output_paths: ["outputs/report.md"], code_paths: [] };
  return d.check(root, "runs/report", { primary: "outputs/report.md", assets }, manifest);
}

const footnotes = [
  "Claim[^first][^second]. Later[^third].",
  "",
  "[^first]: The sample excludes follow-up losses.",
  "    Continued account with [Source](source.md).",
  "",
  "    ![Figure](figure.png)",
  "",
  "[^second]: Sensitivity remains uncertain.",
  "[^third]: destination"
].join("\n");

test("footnote prose and adjacent markers preserve dependencies inside their bodies", () => {
  const expected = [{ href: "source.md", required: false }, { href: "figure.png", required: true }];
  assert.deepEqual(d.references(footnotes, ".md"), expected);
  assert.deepEqual(d.references(footnotes.replace(/\n/g, "\r\n"), ".markdown"), expected);
});

test("full, collapsed and shortcut caret images retain their definitions", () => {
  for (const use of ["![Display][^asset]", "![^asset][]", "![^asset]"]) {
    assert.deepEqual(d.references(use + "\n\n[^asset]: hidden.png\n", ".md"), [{ href: "hidden.png", required: true }], use);
  }
});

test("explicit and collapsed caret links remain ordinary dependencies", () => {
  for (const use of ["[Display][^source]", "[^source][]"]) {
    assert.deepEqual(d.references(use + "\n\n[^source]: source.md\n", ".md"), [{ href: "source.md", required: false }], use);
  }
  assert.deepEqual(d.references("[^display][source]\n\n[source]: source.md\n", ".md"), [
    { href: "source.md", required: false }, { href: "source.md", required: false }
  ]);
});

test("footnote reports check the real body link and declared image", t => {
  const result = checkReport(t, footnotes, { "outputs/source.md": "Source", "outputs/figure.png": "image" }, ["outputs/figure.png"]);
  assert.equal(result.ok, true);
  assert.equal(result.checked_local_references, 2);
  assert.deepEqual(result.issues, []);
  assert.match(result.coverage, /Standalone\/adjacent non-image caret markers follow the report footnote convention/);
});

test("a missing image in a footnote body still fails dependency checking", t => {
  const result = checkReport(t, "Claim[^note].\n\n[^note]: Explanation with ![Figure](missing.png).\n");
  assert.equal(result.ok, false);
  assert.equal(result.checked_local_references, 1);
  assert.deepEqual(result.issues.map(({ reference, required, code }) => ({ reference, required, code })), [
    { reference: "missing.png", required: true, code: "ENOENT" }
  ]);
});

test("present caret images must be declared assets in every reference form", t => {
  for (const use of ["![Display][^asset]", "![^asset][]", "![^asset]"]) {
    const result = checkReport(t, use + "\n\n[^asset]: hidden.png\n", { "outputs/hidden.png": "image" });
    assert.equal(result.ok, false, use);
    assert.equal(result.checked_local_references, 1, use);
    assert.deepEqual(result.issues.map(({ reference, required, code }) => ({ reference, required, code })), [
      { reference: "hidden.png", required: true, code: "MISSING_DELIVERABLE_ASSET" }
    ], use);
  }
});

test("missing explicit and collapsed caret links still fail", t => {
  for (const use of ["[Display][^source]", "[^source][]"]) {
    const result = checkReport(t, use + "\n\n[^source]: missing.md\n");
    assert.equal(result.ok, false, use);
    assert.equal(result.checked_local_references, 1, use);
    assert.deepEqual(result.issues.map(({ reference, required, code }) => ({ reference, required, code })), [
      { reference: "missing.md", required: false, code: "ENOENT" }
    ], use);
  }
});

test("caret image references retain unsafe and malformed destination checks", t => {
  for (const [destination, code] of [["file:///outside.png", "UNSAFE_PATH"], ["../../../../outside.png", "UNSAFE_PATH"], ["%ZZ.png", "INVALID_DELIVERABLE"]]) {
    const result = checkReport(t, "![Display][^asset]\n\n[^asset]: " + destination + "\n");
    assert.equal(result.ok, false, destination);
    assert.equal(result.checked_local_references, 1, destination);
    assert.deepEqual(result.issues.map(({ reference, required, code }) => ({ reference, required, code })), [
      { reference: destination, required: true, code }
    ], destination);
  }
});
