"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), os = require("node:os"), path = require("node:path");
const store = require("../scripts/lib/store.cjs"), runs = require("../scripts/lib/runs.cjs");
const d = require("../scripts/lib/deliverables.cjs"), { canonical, sha256 } = require("../scripts/lib/files.cjs");
const f = require("./fixtures/consultation-loop.cjs");

function setup(t) {
  const base = fs.realpathSync.native(os.tmpdir()), root = fs.mkdtempSync(path.join(base, "cc-deliverables-"));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync.native(root)), base); assert.ok(path.basename(root).startsWith("cc-deliverables-")); fs.rmSync(root, { recursive: true, force: true }); });
  store.init(root, { project_id: "project-deliverables", event_id: "event-init" });
  f.record(root, "memory_updated", { changes: { evidence: [f.statement("source", "Describe the supplied study design.")] } }, "event-source");
  const plan = f.authorizePlan(root, { kind: "report", objective: "Describe source limitations", claim_boundary: "Source account only", inputs: [], purpose: "Planning", evidence_refs: ["source"], format: "Markdown and HTML" });
  runs.start(root, { ...f.ids(root, "event-start"), run_id: "run-report", plan });
  return root;
}
function write(root, file, content) {
  const { event_id, ...ids } = f.ids(root, "unused");
  runs.write(root, { ...ids, run_id: "run-report", path: file, content });
}
function finish(root, deliverable = { primary: "outputs/report.md", companions: ["outputs/report.html"] }, extra = {}) {
  return { ...f.ids(root, "event-finish"), run_id: "run-report", code_paths: [], output_paths: ["outputs/report.md", "outputs/report.html"], diagnostic_paths: [], environment: { authoring: "fixture" }, deviations: [], deliverable, ...extra };
}
const file = (root, name) => path.join(root, "runs/run-report", name);

test("new report finalization rejects missing primary and missing Markdown image without committing", t => {
  const root = setup(t);
  write(root, "outputs/report.md", "![Capacity](capacity_curve.png)\n");
  write(root, "outputs/report.html", '<img src="data:image/png;base64,YQ==">');
  const before = fs.readFileSync(path.join(root, "journal.jsonl"));
  const absent = finish(root); delete absent.deliverable;
  assert.throws(() => runs.finalize(root, absent), { code: "INVALID_INPUT" });
  assert.throws(() => runs.finalize(root, finish(root)), error => error.code === "INVALID_DELIVERABLE" && error.details.issues[0].document === "outputs/report.md");
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), before);
  assert.equal(fs.existsSync(file(root, "manifest.json")), false);
  write(root, "outputs/capacity_curve.png", "image bytes");
  runs.finalize(root, finish(root, { primary: "outputs/report.md", companions: ["outputs/report.html"], assets: ["outputs/capacity_curve.png"] }));
  assert.equal(runs.verify(root).ok, true);
});

test("declared formats and literal asset closure survive relocation; source links remain project navigation", t => {
  const root = setup(t);
  fs.writeFileSync(path.join(root, "source-note.md"), "Provenance");
  write(root, "outputs/report.md", '![Figure][plot]\n[plot]: <figure one.png>\n[Source](../../source-note.md)\n[Web](https://example.org/paper)\n`![example](absent.png)`\n');
  write(root, "outputs/report.html", '<link rel="stylesheet" href="style.css"><img src="figure%20one.png?v=1#image"><a href="#results">Results</a>');
  write(root, "outputs/figure one.png", "image bytes");
  write(root, "outputs/style.css", 'body{background-image:url("figure%20one.png")}');
  write(root, "code/build.cjs", "// reproduction");
  const primary = { primary: "outputs/report.html", companions: ["outputs/report.md"], assets: ["outputs/figure one.png", "outputs/style.css"], reproduction_entrypoint: "code/build.cjs" };
  // This deliberately broken source link is navigation, but must resolve in the project.
  assert.throws(() => runs.finalize(root, finish(root, primary, { code_paths: ["code/build.cjs"] })), { code: "INVALID_DELIVERABLE" });
  fs.copyFileSync(path.join(root, "source-note.md"), path.join(root, "runs/source-note.md"));
  runs.finalize(root, finish(root, primary, { code_paths: ["code/build.cjs"] }));
  const manifest = JSON.parse(fs.readFileSync(file(root, "manifest.json")));
  assert.equal(manifest.manifest_version, 2);
  const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(index, /outputs\/report.html">Open report/);
  assert.match(index, /code\/build.cjs/);
  const copied = path.join(root, "relocated"); fs.mkdirSync(copied);
  for (const name of [primary.primary, ...primary.companions, ...primary.assets]) {
    const dest = path.join(copied, "bundle", name); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(file(root, name), dest);
  }
  const relocated = d.check(copied, "bundle", primary, manifest);
  assert.equal(relocated.issues.filter(issue => issue.required).length, 0);
  assert.equal(relocated.issues.length, 1); // Project provenance was not copied into the bundle.
});

test("assets must be declared even when present and unsafe references cannot escape", t => {
  const root = setup(t);
  write(root, "outputs/report.md", "![image](hidden.png)"); write(root, "outputs/report.html", "<p>Report</p>"); write(root, "outputs/hidden.png", "image");
  assert.throws(() => runs.finalize(root, finish(root)), error => error.details.issues[0].code === "MISSING_DELIVERABLE_ASSET");
  const manifest = { files: runs.inventory(root, "runs/run-report"), output_paths: ["outputs/report.md", "outputs/report.html"], code_paths: [] };
  assert.throws(() => d.descriptor({ primary: "outputs/report.md", assets: ["../other.png"] }, manifest), { code: "INVALID_DELIVERABLE" });
  assert.throws(() => d.descriptor({ primary: "outputs/report.md", companions: ["outputs/report.md"] }, manifest), { code: "INVALID_DELIVERABLE" });
  assert.throws(() => d.descriptor({ primary: "outputs/report.md", reproduction_entrypoint: "outputs/report.html" }, manifest), { code: "INVALID_DELIVERABLE" });
});

test("dependency checks ignore commented CSS and require explicitly accepted format companions", t => {
  assert.deepEqual(d.references('<style>/* background:url(missing.png) */</style><!-- url(missing2.png) --><p>url(example.png)</p>', ".html"), []);
  assert.deepEqual(d.references('/* @import "missing.css"; */', ".css"), []);
  assert.deepEqual(d.references('<style>body{background:url(real.png)}</style>', ".html"), [{ href: "real.png", required: true }]);
  const root = setup(t); write(root, "outputs/report.md", "Report");
  const manifest = { files: runs.inventory(root, "runs/run-report"), output_paths: ["outputs/report.md"], code_paths: [] };
  const result = d.check(root, "runs/run-report", { primary: "outputs/report.md" }, manifest, ["markdown", "html"]);
  assert.equal(result.ok, false); assert.deepEqual(result.issues.map(issue => issue.code), ["MISSING_REQUESTED_FORMAT"]);
});

test("legacy in-progress plan completes without new metadata and remains visibly undesignated", t => {
  const root = setup(t);
  // Construct the authentic pre-capability fixture shape in this disposable project.
  const planPath = file(root, "plan.yaml"), plan = JSON.parse(fs.readFileSync(planPath)); delete plan.report_contract;
  const bytes = JSON.stringify(plan, null, 2) + "\n"; fs.writeFileSync(planPath, bytes);
  const journalPath = path.join(root, "journal.jsonl");
  const events = fs.readFileSync(journalPath, "utf8").trim().split("\n").map(JSON.parse);
  const last = events.at(-1); last.payload.run.plan_sha256 = sha256(bytes); delete last.sha256; last.sha256 = sha256(canonical(last));
  fs.writeFileSync(journalPath, events.map(canonical).join("\n") + "\n"); store.recover(root);
  write(root, "outputs/report.md", "Historical report"); write(root, "outputs/report.html", "Historical report");
  const request = finish(root); delete request.deliverable; runs.finalize(root, request);
  assert.equal(JSON.parse(fs.readFileSync(file(root, "manifest.json"))).manifest_version, 1);
  assert.equal(runs.verify(root).ok, true);
  assert.match(fs.readFileSync(path.join(root, "index.html"), "utf8"), /Primary not designated/);
});

test("index export failure preserves the commit, retry and recovery do not repeat work", t => {
  const root = setup(t);
  write(root, "outputs/report.md", "Report"); write(root, "outputs/report.html", "Report");
  const request = finish(root);
  const receipt = runs.finalize(root, request, { hooks: { beforeIndex() { throw Error("index unavailable"); } } });
  assert.equal(receipt.committed, true);
  assert.equal(receipt.index_written, false);
  assert.equal(receipt.index_error, "index unavailable");
  const journal = fs.readFileSync(path.join(root, "journal.jsonl"));
  assert.equal(runs.finalize(root, request).replayed, true);
  store.recover(root);
  assert.deepEqual(fs.readFileSync(path.join(root, "journal.jsonl")), journal);
  assert.match(fs.readFileSync(path.join(root, "index.html"), "utf8"), /Open report/);
});

test("index preserves an unrelated existing page and non-report parents link to their records", t => {
  const root = setup(t);
  fs.writeFileSync(path.join(root, "index.html"), "My existing page");
  const recovery = store.recover(root);
  assert.equal(recovery.index_written, false);
  assert.match(recovery.index_error, /another author/);
  assert.equal(fs.readFileSync(path.join(root, "index.html"), "utf8"), "My existing page");
  write(root, "outputs/report.md", "Report"); write(root, "outputs/report.html", "Report");
  runs.finalize(root, finish(root));
  const loaded = store.readJournal(root);
  loaded.state.runs[0].parent_run_id = "run-analysis";
  loaded.state.runs.push({ run_id: "run-analysis", kind: "analysis", status: "completed", manifest_ref: "runs/run-analysis/manifest.json" });
  assert.match(d.indexHtml(loaded), /Parent run: <a href="runs\/run-analysis\/manifest.json">/);
});
