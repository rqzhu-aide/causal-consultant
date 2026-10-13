"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { sha256 } = require("../scripts/lib/files.cjs");
const { render, verify } = require("../scripts/lib/presentation.cjs");

function fixture(t, format = "html") {
  const parent = fs.realpathSync.native(os.tmpdir());
  const root = fs.mkdtempSync(path.join(parent, "cc-presentation-"));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync.native(root)), parent);
    assert.ok(path.basename(root).startsWith("cc-presentation-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const bytes = JSON.stringify({ utility: { rule: 1.7539 }, bootstrap: { rule: [1.5235, 1.9837] },
    gain: 0.7792, gain_ci: [0.5956, 0.9607], "a/b": { "~value": -0.001 } });
  fs.writeFileSync(path.join(root, "results.json"), bytes);
  const spec = { format, sources: [{ source_id: "validation", path: "results.json", sha256: sha256(bytes) }],
    quantities: [{ quantity_id: "rule_value", label: "Frozen rule utility", units: "assessment points per learner",
      population: "Eligible learners in the study frame", comparison: "Policy level after the 2-point offer cost",
      source_id: "validation", value: "/utility/rule", interval: { lower: "/bootstrap/rule/0", upper: "/bootstrap/rule/1", level: .95, method: "stratified percentile bootstrap" }, digits: 2, sign: true },
    { quantity_id: "gain", label: "Rule advantage", units: "assessment points per learner", population: "Eligible learners in the study frame",
      comparison: "Frozen rule minus no offers", source_id: "validation", value: "/gain", interval: { lower: "/gain_ci/0", upper: "/gain_ci/1", level: .95, method: "stratified percentile bootstrap" } }],
    blocks: [{ block_id: "values", kind: "table", quantity_ids: ["rule_value", "gain"] },
      { block_id: "findings", kind: "headlines", quantity_ids: ["rule_value"] }] };
  return { root, spec, config: { baseDir: root } };
}

test("resolved quantities preserve their source, interval and visible scientific context", t => {
  const { spec, config } = fixture(t);
  const result = render(spec, config);
  assert.equal(result.quantities[0].value, 1.7539);
  assert.deepEqual(result.quantities[0].interval, { lower: 1.5235, upper: 1.9837, level: .95, method: "stratified percentile bootstrap" });
  assert.deepEqual(result.quantities[0].source.interval_locators, { lower: "/bootstrap/rule/0", upper: "/bootstrap/rule/1" });
  for (const key of ["units", "population", "comparison"]) assert.ok(result.blocks.every(b => b.content.includes(spec.quantities[0][key])));
  const table = result.blocks[0].content;
  assert.equal((table.match(/<th scope=/g) || []).length, 6);
  for (const row of table.matchAll(/<tr>(.*?)<\/tr>/g)) if (row[1].includes("<td>")) assert.equal((row[1].match(/<td>/g) || []).length, 6);
  assert.equal(verify(spec, "<html><body>" + result.fragment + "</body></html>", config).ok, true);
});

test("Markdown preserves apostrophes and literal entities without breaking HTML character references", t => {
  const { spec, config } = fixture(t, "markdown");
  spec.quantities[0].label = "Learners' score and literal &#39;";
  spec.quantities[0].comparison = 'Program "offer" #1';
  const result = render(spec, config);
  // Valid entities render an apostrophe or quote. Escaping their # would instead
  // expose the entity's spelling to the reader; an original entity stays literal.
  assert.ok(result.fragment.includes("Learners&#39; score and literal &amp;#39;"));
  assert.ok(result.fragment.includes("Program &quot;offer&quot; #1"));
  assert.ok(!result.fragment.includes("&\\#"));
  assert.equal(verify(spec, result.fragment, config).ok, true);
});

test("actual wrong interval fails even when the correct numbers remain elsewhere", t => {
  const { spec, config } = fixture(t);
  const generated = render(spec, config);
  const incorrect = generated.fragment.replace("[+1.52, +1.98]", "[+1.62, +1.89]") + "\nCorrect values elsewhere: [+1.52, +1.98]";
  assert.throws(() => verify(spec, incorrect, config), /Actual labeled block differs/);
  const outside = generated.fragment + "\nUnverified prose with an incorrect interval [1.62,1.89].";
  const coverage = verify(spec, outside, config);
  assert.equal(coverage.ok, true);
  assert.match(coverage.coverage, /Surrounding prose.*were not verified/);
});

test("header changes and shifted cells fail whole-block verification", t => {
  const { spec, config } = fixture(t);
  const generated = render(spec, config).fragment;
  assert.throws(() => verify(spec, generated.replace("<th scope=\"col\">Estimate</th>", ""), config), /Actual labeled block differs/);
  assert.throws(() => verify(spec, generated.replace("<td>+1.75</td>", "<td>109</td><td>+1.75</td>"), config), /Actual labeled block differs/);
  assert.throws(() => verify(spec, generated.replace("Frozen rule minus no offers", "No offers minus frozen rule"), config), /Actual labeled block differs/);
});

test("source modification, unresolved sources and invalid JSON cannot produce validated blocks", t => {
  const { root, spec, config } = fixture(t);
  const generated = render(spec, config).fragment;
  fs.appendFileSync(path.join(root, "results.json"), " ");
  assert.throws(() => verify(spec, generated, config), /Source hash mismatch/);
  spec.sources[0].path = "absent.json";
  assert.throws(() => render(spec, config), /Could not read source/);
  fs.writeFileSync(path.join(root, "invalid.json"), "not JSON");
  spec.sources[0].path = "invalid.json"; spec.sources[0].sha256 = sha256("not JSON");
  assert.throws(() => render(spec, config), /Source is not valid JSON/);
});

test("numbers must come from exact existing JSON pointers, with escaped keys supported", t => {
  const { spec, config } = fixture(t);
  for (const locator of [1.75, "/absent", "/bootstrap/rule/01", "/bootstrap/rule/length", "/a~2b", "/constructor"]) {
    const changed = structuredClone(spec); changed.quantities[0].value = locator;
    assert.throws(() => render(changed, config), error => error.code === "INVALID_PRESENTATION");
  }
  spec.quantities[0].value = "/a~1b/~0value";
  delete spec.quantities[0].interval;
  const result = render(spec, config);
  assert.equal(result.quantities[0].value, -.001);
  assert.ok(result.fragment.includes("<td>0.00</td>"));
  assert.ok(!result.fragment.includes("<td>-0.00</td>"));
});

test("rejects nonnumbers, nonfinite estimates and reversed intervals without imposing interval centering", t => {
  const { root, spec, config } = fixture(t);
  for (const token of ['"1.75"', "null", "1e999"]) {
    const bytes = '{"estimate":' + token + '}';
    fs.writeFileSync(path.join(root, "bad.json"), bytes);
    const changed = structuredClone(spec);
    changed.sources.push({ source_id: "bad", path: "bad.json", sha256: sha256(bytes) });
    changed.quantities[0].source_id = "bad"; changed.quantities[0].value = "/estimate"; delete changed.quantities[0].interval;
    assert.throws(() => render(changed, config), /finite JSON number/);
  }
  const reversed = structuredClone(spec);
  [reversed.quantities[0].interval.lower, reversed.quantities[0].interval.upper] = [reversed.quantities[0].interval.upper, reversed.quantities[0].interval.lower];
  assert.throws(() => render(reversed, config), /endpoints are reversed/);
  spec.quantities[0].value = "/gain";
  assert.equal(render(spec, config).quantities[0].value, .7792, "A valid asymmetric/bias-corrected interval need not contain its point estimate; metadata suitability requires review.");
});

test("HTML and Markdown data cells are escaped and cannot insert columns or markup", t => {
  const { spec, config } = fixture(t);
  spec.quantities[0].label = '<script>alert("bad")</script> | **label** [link](url)\nnext';
  const htmlResult = render(spec, config);
  assert.ok(!htmlResult.fragment.includes("<script>"));
  assert.ok(htmlResult.fragment.includes("&lt;script&gt;"));
  spec.format = "markdown";
  const md = render(spec, config).fragment;
  assert.ok(md.includes("\\| \\*\\*label\\*\\* \\[link\\](url)".replace("(url)", "\\(url\\)")));
  assert.ok(md.includes("<br>next"));
  assert.equal(verify(spec, md.replace(/\n/g, "\r\n"), config).ok, true);
});

test("verification rejects missing, duplicated and unselected generated blocks", t => {
  const { spec, config } = fixture(t);
  const generated = render(spec, config);
  assert.throws(() => verify(spec, generated.blocks[0].content, config), /Missing or duplicated/);
  assert.throws(() => verify(spec, generated.fragment + generated.blocks[0].content, config), /Missing or duplicated/);
  assert.throws(() => verify(spec, generated.fragment + "<!-- cc-presentation:unknown:start -->", config), /unselected presentation block/);
  spec.blocks[0].quantity_ids.push("missing");
  assert.throws(() => render(spec, config), /Unknown quantity/);
});

test("standalone CLI resolves inputs beside the spec, returns fragments and never creates files", t => {
  const { root, spec } = fixture(t, "markdown");
  const specPath = path.join(root, "presentation.json");
  fs.writeFileSync(specPath, JSON.stringify(spec));
  const cli = path.resolve(__dirname, "../scripts/present.cjs");
  const before = fs.readdirSync(root);
  const invoke = args => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", windowsHide: true });
  const rendered = invoke(["render", "--input", specPath]);
  assert.equal(rendered.status, 0, rendered.stdout + rendered.stderr);
  const result = JSON.parse(rendered.stdout);
  assert.deepEqual(fs.readdirSync(root), before);
  const artifact = path.join(root, "actual.md");
  fs.writeFileSync(artifact, result.fragment);
  const verified = invoke(["verify", "--input", specPath, "--artifact", artifact]);
  assert.equal(verified.status, 0, verified.stdout + verified.stderr);
  assert.deepEqual(JSON.parse(verified.stdout).checked_quantities, ["rule_value", "gain"]);
  fs.writeFileSync(artifact, result.fragment.replace("Frozen rule utility", "Attendance effect"));
  assert.equal(invoke(["verify", "--input", specPath, "--artifact", artifact]).status, 1);
  assert.equal(invoke(["render", "--input", specPath, "--output", "bypass.html"]).status, 1);
  assert.ok(!fs.existsSync(path.join(root, "bypass.html")));
});
