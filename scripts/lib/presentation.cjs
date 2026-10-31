"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { fail, sha256 } = require("./files.cjs");

const id = value => typeof value === "string" && /^[A-Za-z][A-Za-z0-9_-]*$/.test(value);
function demand(condition, message) { if (!condition) fail("INVALID_PRESENTATION", message); }
function object(value, allowed, required, label) {
  demand(value && typeof value === "object" && !Array.isArray(value), label + " must be an object.");
  demand(Object.keys(value).every(key => allowed.includes(key)), "Unknown field in " + label + ".");
  demand(required.every(key => Object.hasOwn(value, key)), "Missing field in " + label + ".");
}
function text(value, label) { demand(typeof value === "string" && value.trim().length > 0, label + " must be nonempty text."); }
function numeric(value, label) { demand(typeof value === "number" && Number.isFinite(value), label + " must resolve to a finite JSON number."); return value; }
function pointer(document, locator) {
  demand(typeof locator === "string" && (locator === "" || locator.startsWith("/")), "Use an explicit JSON Pointer locator, not a copied value.");
  if (locator === "") return document;
  let current = document;
  for (const encoded of locator.slice(1).split("/")) {
    demand(!/~(?![01])/.test(encoded), "Invalid JSON Pointer escape: " + locator);
    const key = encoded.replace(/~1/g, "/").replace(/~0/g, "~");
    demand(current !== null && typeof current === "object" && Object.hasOwn(current, key) &&
      (!Array.isArray(current) || /^(0|[1-9][0-9]*)$/.test(key)), "Unresolved JSON Pointer: " + locator);
    current = current[key];
  }
  return current;
}
const html = value => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const markdown = value => html(value).replace(/\\/g, "\\\\").replace(/([`*_[\]{}()!|>~+-])/g, "\\$1")
  .replace(/\r\n|\r|\n/g, "<br>");
function number(value, digits, sign) {
  // Display a rounded zero consistently instead of a misleading negative zero.
  const fixed = value.toFixed(digits);
  const normalized = Number(fixed) === 0 ? (0).toFixed(digits) : fixed;
  return sign && Number(normalized) > 0 ? "+" + normalized : normalized;
}
function intervalText(quantity) {
  const interval = quantity.interval;
  if (!interval) return "Not supplied";
  const level = Number((interval.level * 100).toPrecision(12));
  return level + "% interval [" + number(interval.lower, quantity.digits, quantity.sign) + ", " +
    number(interval.upper, quantity.digits, quantity.sign) + "] (" + interval.method + ")";
}
function markers(block_id) { return { start: "<!-- cc-presentation:" + block_id + ":start -->", end: "<!-- cc-presentation:" + block_id + ":end -->" }; }
function renderBlock(block, quantities, format) {
  const rows = block.quantity_ids.map(key => quantities.get(key));
  const escape = format === "html" ? html : markdown;
  const cells = q => [q.label, number(q.value, q.digits, q.sign), intervalText(q), q.units, q.population, q.comparison];
  let body;
  if (block.kind === "table") {
    const headings = ["Quantity", "Estimate", "Uncertainty", "Units", "Population", "Comparison"];
    body = format === "html"
      ? "<table>\n<thead><tr>" + headings.map(h => "<th scope=\"col\">" + h + "</th>").join("") + "</tr></thead>\n<tbody>\n" +
        rows.map(q => "<tr>" + cells(q).map(c => "<td>" + escape(c) + "</td>").join("") + "</tr>").join("\n") + "\n</tbody>\n</table>"
      : "| " + headings.join(" | ") + " |\n| " + headings.map(() => "---").join(" | ") + " |\n" +
        rows.map(q => "| " + cells(q).map(escape).join(" | ") + " |").join("\n");
  } else {
    body = rows.map(q => {
      const label = format === "html" ? "<strong>" + escape(q.label) + "</strong>" : "**" + escape(q.label) + "**";
      const sentence = label + ": " + escape(number(q.value, q.digits, q.sign)) + " " + escape(q.units) +
        "; " + escape(intervalText(q)) + ". Population: " + escape(q.population) + ". Comparison: " + escape(q.comparison) + ".";
      return format === "html" ? "<p>" + sentence + "</p>" : sentence;
    }).join("\n\n");
  }
  const { start, end } = markers(block.block_id);
  const content = start + "\n" + body + "\n" + end;
  return { block_id: block.block_id, kind: block.kind, format, quantity_ids: block.quantity_ids, content, sha256: sha256(content) };
}

function render(spec, { baseDir = process.cwd() } = {}) {
  object(spec, ["format", "sources", "quantities", "blocks"], ["format", "sources", "quantities", "blocks"], "presentation");
  demand(["html", "markdown"].includes(spec.format), "format must be html or markdown.");
  for (const key of ["sources", "quantities", "blocks"]) demand(Array.isArray(spec[key]) && spec[key].length > 0, key + " must be a nonempty array.");
  const sources = new Map();
  for (const source of spec.sources) {
    object(source, ["source_id", "path", "sha256"], ["source_id", "path", "sha256"], "source");
    demand(id(source.source_id) && !sources.has(source.source_id), "Source IDs must be unique plain identifiers.");
    text(source.path, "Source path");
    demand(/^[a-f0-9]{64}$/i.test(source.sha256), "An explicit source SHA256 is required.");
    const resolved = path.resolve(baseDir, source.path);
    let bytes, document;
    try { bytes = fs.readFileSync(resolved); }
    catch (error) { fail("PRESENTATION_SOURCE", "Could not read source " + source.source_id + ": " + error.message); }
    demand(sha256(bytes) === source.sha256.toLowerCase(), "Source hash mismatch: " + source.source_id);
    try { document = JSON.parse(bytes.toString("utf8")); }
    catch (error) { fail("PRESENTATION_SOURCE", "Source is not valid JSON: " + source.source_id); }
    sources.set(source.source_id, { document, record: { ...source, path: resolved, sha256: source.sha256.toLowerCase() } });
  }
  const quantities = new Map();
  for (const item of spec.quantities) {
    const fields = ["quantity_id", "label", "units", "population", "comparison", "source_id", "value", "interval", "digits", "sign"];
    object(item, fields, fields.slice(0, 7), "quantity");
    demand(id(item.quantity_id) && !quantities.has(item.quantity_id), "Quantity IDs must be unique plain identifiers.");
    for (const key of ["label", "units", "population", "comparison"]) text(item[key], key);
    const source = sources.get(item.source_id);
    demand(source, "Unknown source: " + item.source_id);
    const digits = item.digits === undefined ? 2 : item.digits;
    demand(Number.isInteger(digits) && digits >= 0 && digits <= 12, "digits must be an integer from 0 to 12.");
    demand(item.sign === undefined || typeof item.sign === "boolean", "sign must be boolean.");
    const quantity = { quantity_id: item.quantity_id, label: item.label, units: item.units, population: item.population,
      comparison: item.comparison, value: numeric(pointer(source.document, item.value), "Estimate"), digits, sign: item.sign === true,
      source: { ...source.record, value_locator: item.value } };
    if (item.interval !== undefined) {
      object(item.interval, ["lower", "upper", "level", "method"], ["lower", "upper", "level", "method"], "interval");
      const { lower, upper, level, method } = item.interval;
      demand(typeof level === "number" && level > 0 && level < 1, "Interval level must be between 0 and 1.");
      text(method, "Interval method");
      quantity.interval = { lower: numeric(pointer(source.document, lower), "Lower endpoint"),
        upper: numeric(pointer(source.document, upper), "Upper endpoint"), level, method };
      demand(quantity.interval.lower <= quantity.interval.upper, "Interval endpoints are reversed: " + item.quantity_id);
      quantity.source.interval_locators = { lower, upper };
    }
    quantities.set(item.quantity_id, quantity);
  }
  const blockIds = new Set(), used = new Set();
  const blocks = spec.blocks.map(block => {
    object(block, ["block_id", "kind", "quantity_ids"], ["block_id", "kind", "quantity_ids"], "block");
    demand(id(block.block_id) && !blockIds.has(block.block_id), "Block IDs must be unique plain identifiers.");
    blockIds.add(block.block_id);
    demand(["table", "headlines"].includes(block.kind), "Block kind must be table or headlines.");
    demand(Array.isArray(block.quantity_ids) && block.quantity_ids.length > 0 && new Set(block.quantity_ids).size === block.quantity_ids.length,
      "Block quantity_ids must be nonempty and unique.");
    for (const key of block.quantity_ids) { demand(quantities.has(key), "Unknown quantity: " + key); used.add(key); }
    return renderBlock(block, quantities, spec.format);
  });
  demand(used.size === quantities.size, "Every selected quantity must appear in a block.");
  return { ok: true, presentation_version: 1, sources: [...sources.values()].map(s => s.record), quantities: [...quantities.values()],
    blocks, fragment: blocks.map(b => b.content).join("\n\n"),
    boundary: "Source-to-presentation consistency only; metadata, estimator validity and surrounding narrative require scientific review. No run authorization or report creation is performed." };
}

function verify(spec, actual, options) {
  demand(typeof actual === "string", "Actual artifact content must be text.");
  const expected = render(spec, options);
  const normalized = actual.replace(/\r\n/g, "\n");
  const recognized = [...normalized.matchAll(/<!-- cc-presentation:([A-Za-z][A-Za-z0-9_-]*):(start|end) -->/g)];
  const ids = new Set(expected.blocks.map(b => b.block_id));
  demand(recognized.every(m => ids.has(m[1])), "Artifact includes an unselected presentation block.");
  for (const block of expected.blocks) {
    const { start, end } = markers(block.block_id);
    const starts = normalized.split(start).length - 1, ends = normalized.split(end).length - 1;
    demand(starts === 1 && ends === 1, "Missing or duplicated block: " + block.block_id);
    const from = normalized.indexOf(start), to = normalized.indexOf(end);
    demand(from < to && normalized.slice(from, to + end.length) === block.content, "Actual labeled block differs from source-driven presentation: " + block.block_id);
  }
  return { ok: true, presentation_version: 1, artifact_sha256: sha256(actual), checked_blocks: expected.blocks.map(b => ({ block_id: b.block_id, sha256: b.sha256 })),
    checked_quantities: expected.quantities.map(q => q.quantity_id),
    coverage: "Only the complete generated blocks were checked. Surrounding prose, CSS/layout, additional numbers and scientific interpretation were not verified." };
}

module.exports = { render, verify };
