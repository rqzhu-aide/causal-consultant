#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const presentation = require("./lib/presentation.cjs");
const { fail } = require("./lib/files.cjs");

function main(argv) {
  const command = argv[0];
  if (!command || command === "help") return { ok: true,
    usage: "node scripts/present.cjs <render|verify> --input <spec.json|-> [--artifact <actual-file>]",
    reference: "references/presentation.md", writes_files: false };
  if (!["render", "verify"].includes(command)) fail("INVALID_INPUT", "Use render or verify.");
  const options = {};
  for (let i = 1; i < argv.length; i += 2) {
    const key = argv[i];
    if (!["--input", "--artifact"].includes(key) || options[key] || !argv[i + 1]) fail("INVALID_INPUT", "Unknown, duplicate or incomplete option.");
    options[key] = argv[i + 1];
  }
  if (!options["--input"] || (command === "verify") !== Boolean(options["--artifact"])) fail("INVALID_INPUT", "render requires --input; verify additionally requires --artifact.");
  const file = options["--input"];
  const spec = JSON.parse(fs.readFileSync(file === "-" ? 0 : file, "utf8"));
  const config = { baseDir: file === "-" ? process.cwd() : path.dirname(path.resolve(file)) };
  return command === "render" ? presentation.render(spec, config)
    : presentation.verify(spec, fs.readFileSync(options["--artifact"], "utf8"), config);
}

if (require.main === module) {
  try { process.stdout.write(JSON.stringify(main(process.argv.slice(2)), null, 2) + "\n"); }
  catch (error) { process.stdout.write(JSON.stringify({ ok: false, error: { code: error.code || "INVALID_INPUT", message: error.message } }, null, 2) + "\n"); process.exitCode = 1; }
}
module.exports = { main };
