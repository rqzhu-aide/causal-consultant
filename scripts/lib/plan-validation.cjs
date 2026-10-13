"use strict";

// Pure shape checks shared by new proposal writes and run start. This module
// neither changes a plan nor requires execution permission or file access.
const { fail } = require("./files.cjs");
const { CATALOG, jsonValue, object, text, enumeration, array, strings, validateAdditionalDesigns } = require("./model.cjs");

function validatePlanStructure(plan) {
  jsonValue(plan, "plan");
  const fields = {
    audit: ["question", "diagnostics"],
    analysis: ["target", "population", "treatment", "comparator", "outcome", "timing", "estimand", "design_id", "estimator", "exclusions", "diagnostics"],
    discovery: ["variables", "method", "diagnostics"],
    report: ["purpose", "evidence_refs", "format"]
  };
  if (!plan || typeof plan !== "object") fail("INVALID_INPUT", "plan must be an object.");
  enumeration(plan.kind, Object.keys(fields), "plan.kind");
  const optional = { audit: ["transformations"], analysis: ["additional_design_ids", "identification_basis"], discovery: [], report: [] };
  object(plan, "plan", ["kind", "objective", "claim_boundary", "inputs", ...fields[plan.kind]], [...optional[plan.kind], "interpretation_ref", "scope_ref", "authorization_ref", "operations"]);
  text(plan.objective, "plan.objective");
  text(plan.claim_boundary, "plan.claim_boundary");
  array(plan.inputs, "plan.inputs", (input, label) => {
    object(input, label, ["source_ref", "path"], ["sha256", "deferred_release"]);
    text(input.source_ref, label + ".source_ref");
    text(input.path, label + ".path");
    if (input.path.includes("\0")) fail("INVALID_INPUT", label + ".path contains a NUL byte.");
    if (Object.hasOwn(input, "sha256") && !/^[a-f0-9]{64}$/.test(input.sha256)) fail("INVALID_INPUT", label + ".sha256 must be a SHA-256 hash.");
    if (Object.hasOwn(input, "deferred_release") && (plan.kind !== "analysis" || input.deferred_release !== true || input.sha256)) {
      fail("INVALID_INPUT", "Only one unavailable analysis input may use deferred_release, without a pre-release hash.");
    }
  });
  if (plan.inputs.filter(input => input.deferred_release).length > 1) fail("INVALID_INPUT", "Only one analysis input may await release.");
  for (const key of fields[plan.kind]) {
    if (["exclusions", "diagnostics", "variables", "evidence_refs"].includes(key)) strings(plan[key], "plan." + key);
    else text(plan[key], "plan." + key);
  }
  if (plan.kind === "analysis") {
    enumeration(plan.design_id, CATALOG.designs, "plan.design_id");
    validateAdditionalDesigns(plan, "plan");
    if (Object.hasOwn(plan, "identification_basis")) {
      object(plan.identification_basis, "plan.identification_basis", ["argument", "assumptions", "source_refs"]);
      text(plan.identification_basis.argument, "plan.identification_basis.argument");
      strings(plan.identification_basis.assumptions, "plan.identification_basis.assumptions", true);
      strings(plan.identification_basis.source_refs, "plan.identification_basis.source_refs", true);
    } else if (plan.design_id === "custom_identification" || plan.additional_design_ids?.length) {
      fail("INVALID_INPUT", "Custom or composed analyses require an identification_basis.");
    }
  }
  if (plan.kind === "audit" && Object.hasOwn(plan, "transformations")) {
    strings(plan.transformations, "plan.transformations", true);
    strings(plan.diagnostics, "plan.diagnostics", true);
  }
  if (plan.kind === "report" && !plan.evidence_refs.length) fail("INVALID_INPUT", "A report must identify the evidence it synthesizes.");
  if (Object.hasOwn(plan, "operations")) {
    strings(plan.operations, "plan.operations", true);
    const allowed = { audit: ["source_inspection", "data_quality", "preparation"], discovery: ["graph_exploration"] }[plan.kind];
    if (!allowed || plan.operations.some(operation => !allowed.includes(operation))) {
      fail("PROTECTED_OPERATION", "Audit/discovery declarations cannot include effect estimation, policy learning or report production. Use the corresponding authorized action.");
    }
    if (plan.operations.includes("preparation") && !plan.transformations) fail("INVALID_INPUT", "Preparation must declare its transformations.");
  }
}

module.exports = { validatePlanStructure };
