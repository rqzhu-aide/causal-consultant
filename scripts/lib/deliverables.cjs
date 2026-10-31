"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { fail, safePath, readFile, sha256 } = require("./files.cjs");
const { object, text, strings } = require("./model.cjs");
const CONTRACT = "report-deliverables-v1";
const INDEX_MARKER = "<!-- causal-consultant:report-index-v1 -->";

function descriptor(value, manifest) {
  object(value, "deliverable", ["primary"], ["companions", "assets", "reproduction_entrypoint"]);
  text(value.primary, "deliverable.primary");
  for (const field of ["companions", "assets"]) if (value[field] !== undefined) strings(value[field], "deliverable." + field);
  const result = { primary: value.primary, companions: value.companions || [], assets: value.assets || [] };
  if (value.reproduction_entrypoint !== undefined) {
    text(value.reproduction_entrypoint, "deliverable.reproduction_entrypoint");
    result.reproduction_entrypoint = value.reproduction_entrypoint;
  }
  const bundle = [result.primary, ...result.companions, ...result.assets];
  if (new Set(bundle).size !== bundle.length) fail("INVALID_DELIVERABLE", "Primary, companions and assets must be distinct paths.");
  const files = new Set(manifest.files.map(file => file.path));
  for (const file of bundle) if (!files.has(file)) fail("INVALID_DELIVERABLE", "Deliverable path is not in the exact run inventory: " + file);
  for (const file of [result.primary, ...result.companions]) if (!manifest.output_paths.includes(file)) fail("INVALID_DELIVERABLE", "Reports must be declared outputs: " + file);
  if (result.reproduction_entrypoint && !manifest.code_paths.includes(result.reproduction_entrypoint)) fail("INVALID_DELIVERABLE", "Reproduction entrypoint must be declared code.");
  return structuredClone(result);
}

function unescapeHtml(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/gi, entity => {
    const named = { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">" };
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const hex = /^&#x/i.test(entity);
    const point = parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}
function references(content, extension) {
  const result = [];
  const add = (href, required) => result.push({ href: unescapeHtml(href.trim()), required });
  if (extension === ".md" || extension === ".markdown") {
    content = content.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, "").replace(/`[^`\n]*`/g, "");
    const defs = new Map();
    for (const m of content.matchAll(/^\s*\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))/gm)) defs.set(m[1].trim().toLowerCase(), m[2] || m[3]);
    for (const m of content.matchAll(/(!?)\[([^\]]*)\]\(\s*(?:<([^>]+)>|([^\n)]*?))(?:\s+["'][^\n]*?["'])?\s*\)/g)) add(m[3] || m[4], m[1] === "!");
    for (const m of content.matchAll(/(!?)\[([^\]]+)\](?:\[([^\]]*)\])?(?![\[(])/g)) {
      // Reserve standalone/adjacent non-image caret markers for report footnotes.
      if (m[1] !== "!" && m[2].startsWith("^") && (m[3] === undefined || m[3].startsWith("^"))) continue;
      const href = defs.get((m[3] || m[2]).trim().toLowerCase());
      if (href) add(href, m[1] === "!");
    }
  }
  if ([".html", ".htm", ".md", ".markdown"].includes(extension)) {
    const html = content.replace(/<!--[\s\S]*?-->/g, "");
    for (const tag of html.matchAll(/<(img|script|link|a|audio|video|source|iframe|object|embed)\b([^>]*?)>/gi)) {
      const attrs = new Map();
      for (const attr of tag[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) attrs.set(attr[1].toLowerCase(), attr[2] ?? attr[3] ?? attr[4]);
      const name = tag[1].toLowerCase();
      if (attrs.has("src")) add(attrs.get("src"), true);
      if (attrs.has("poster")) add(attrs.get("poster"), true);
      if (name === "object" && attrs.has("data")) add(attrs.get("data"), true);
      if (attrs.has("href")) add(attrs.get("href"), name === "link" && /(?:stylesheet|icon)/i.test(attrs.get("rel") || ""));
    }
  }
  if ([".css", ".html", ".htm"].includes(extension)) {
    const html = content.replace(/<!--[\s\S]*?-->/g, "");
    const css = (extension === ".css" ? content : [
      ...[...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]),
      ...[...html.matchAll(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map(m => unescapeHtml(m[1] ?? m[2]))
    ].join("\n")).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi)) add(m[1] ?? m[2] ?? m[3], true);
    for (const m of css.matchAll(/@import\s+["']([^"']+)["']/gi)) add(m[1], true);
  }
  return result;
}

// Supported literal references only. No browser execution or remote requests.
function check(root, prefix, value, manifest, requestedFormats = []) {
  const delivered = descriptor(value, manifest);
  const bundle = new Set([delivered.primary, ...delivered.companions, ...delivered.assets]);
  const issues = [];
  const extensions = { markdown: [".md", ".markdown"], html: [".html", ".htm"], pdf: [".pdf"], docx: [".docx"], text: [".txt"] };
  for (const format of requestedFormats) if (![delivered.primary, ...delivered.companions].some(file => extensions[format]?.includes(path.posix.extname(file).toLowerCase()))) {
    issues.push({ code: "MISSING_REQUESTED_FORMAT", format, message: "No declared report matches the requested local format." });
  }
  let checked = 0;
  for (const file of bundle) {
    const extension = path.posix.extname(file).toLowerCase();
    if (![".md", ".markdown", ".html", ".htm", ".css"].includes(extension)) continue;
    const content = readFile(root, prefix + "/" + file).toString("utf8");
    for (const ref of references(content, extension)) {
      if (!ref.href || ref.href.startsWith("#") || /^(?:https?:|data:|mailto:|tel:|\/\/)/i.test(ref.href)) continue;
      checked++;
      try {
        if (/^[a-z][\w+.-]*:/i.test(ref.href) || /^[\\/]/.test(ref.href)) fail("UNSAFE_PATH", "Use relative local paths or web citations.");
        let href;
        try { href = decodeURIComponent(ref.href.split(/[?#]/, 1)[0]).replace(/\\/g, "/"); }
        catch { fail("INVALID_DELIVERABLE", "Malformed escaped URL."); }
        const destination = path.posix.normalize(path.posix.join(prefix, path.posix.dirname(file), href));
        const target = safePath(root, destination);
        if (!fs.statSync(target).isFile()) fail("INVALID_DELIVERABLE", "Reference is not a regular file.");
        const local = destination.startsWith(prefix + "/") ? destination.slice(prefix.length + 1) : null;
        if (ref.required && (!local || !bundle.has(local))) fail("MISSING_DELIVERABLE_ASSET", "Required local resource is outside the declared report bundle.");
      } catch (error) {
        issues.push({ document: file, reference: ref.href, required: ref.required, code: error.code || "IO_ERROR", message: error.message });
      }
    }
  }
  return { ok: issues.length === 0, checked_local_references: checked, issues,
    coverage: "Literal Markdown inline/reference links and HTML src/href/poster/data; CSS url/import. Standalone/adjacent non-image caret markers follow the report footnote convention; links/images in their bodies are checked. No fragment targets, srcset, dynamic scripts, remote availability or visual validation." };
}

const escape = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const href = value => value.split("/").map(encodeURIComponent).join("/");
function indexHtml(loaded) {
  const reports = loaded.state.runs.filter(run => run.kind === "report" && run.status === "completed");
  const sections = reports.map(run => {
    const prefix = "runs/" + run.run_id + "/";
    let body;
    try {
      const bytes = readFile(loaded.root, run.manifest_ref);
      if (sha256(bytes) !== run.manifest_sha256) fail("MANIFEST_CHANGED", "Recorded manifest does not match.");
      const manifest = JSON.parse(bytes);
      if (manifest.run_id !== run.run_id) fail("MANIFEST_CHANGED", "Manifest run identity differs.");
      const link = (file, label) => '<a href="' + href(prefix + file) + '">' + escape(label || file) + "</a>";
      if (manifest.deliverable) {
        const d = descriptor(manifest.deliverable, manifest);
        body = '<p class="primary">' + link(d.primary, "Open report") + "</p>";
        if (d.companions.length) body += "<p>Companions: " + d.companions.map(file => link(file)).join(" · ") + "</p>";
        if (d.reproduction_entrypoint) body += "<p>Reproduction entrypoint: " + link(d.reproduction_entrypoint) + " (use a fresh copy with the saved inputs)</p>";
      } else body = "<p>Primary not designated in this historical manifest.</p><ul>" + manifest.output_paths.map(file => "<li>" + link(file) + "</li>").join("") + "</ul>";
      body += '<p><a href="' + href(run.manifest_ref) + '">Files and provenance</a></p>';
    } catch (error) { body = "<p>Manifest unavailable: " + escape(error.message) + "</p>"; }
    const parentRun = loaded.state.runs.find(item => item.run_id === run.parent_run_id);
    const parentHref = parentRun && (reports.includes(parentRun) ? "#" + parentRun.run_id : href(parentRun.manifest_ref || parentRun.plan_ref));
    const parent = run.parent_run_id ? "<p>Parent run: " + (parentHref ? '<a href="' + parentHref + '">' + escape(run.parent_run_id) + "</a>" : escape(run.parent_run_id)) + "</p>" : "";
    return '<section id="' + escape(run.run_id) + '"><h2>' + escape(run.run_id) + "</h2>" + parent + body + "</section>";
  });
  return INDEX_MARKER + '\n<!doctype html>\n<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Project reports</title><style>body{font:17px/1.55 system-ui,sans-serif;max-width:850px;margin:3rem auto;padding:0 1.5rem;color:#182333;background:#fafbfd}section{border-top:1px solid #d6dce5;padding:1rem 0}h2{font-size:1rem;overflow-wrap:anywhere}a{color:#1556a2}.primary{font-size:1.2rem}p,li{overflow-wrap:anywhere}</style><h1>Project reports</h1><p>' + escape(loaded.state.state_meta.project_id) + '</p><p><a href="case-brief.md">Case brief</a> · <a href="project.yaml">Recorded state</a></p>' + (sections.join("\n") || "<p>No completed reports are recorded.</p>") + '<footer>Generated from committed report manifests. Completion and file checks do not establish scientific validity. Revisions retain their original sources.</footer></html>\n';
}

module.exports = { CONTRACT, INDEX_MARKER, descriptor, check, indexHtml, references };
