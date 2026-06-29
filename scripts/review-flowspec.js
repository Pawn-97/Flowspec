#!/usr/bin/env node
import { readJson, writeJson, parseNamedArg } from "./lib/io.js";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/review-flowspec.js <ux-flow-spec.json> --prep <flow-prep.json> --validation <validation-report.json> --out <review-input.json>");
  process.exit(2);
}

const spec = await readJson(input);
const prepPath = parseNamedArg(process.argv, "--prep");
const validationPath = parseNamedArg(process.argv, "--validation");
const out = parseNamedArg(process.argv, "--out");

const reviewInput = {
  schema_version: "0.1",
  flow: spec.flow,
  review_profiles: spec.review_profiles,
  flow_ui_grammar: spec.flow_ui_grammar,
  validation_report: validationPath ? await readJson(validationPath) : null,
  flow_prep: prepPath ? await readJson(prepPath) : null,
  qualitative_review_prompt: [
    "Perform a structured qualitative review.",
    "Do not override deterministic lint blockers.",
    "Focus on source fidelity, B2B UX craft, anti-slop spec quality, prototype readiness, accessibility, and flow consistency.",
    "Each issue must include id, severity, category, evidence, impact, recommended_fix, auto_fixable, and requires_designer_confirmation."
  ]
};

if (out) await writeJson(out, reviewInput);
else console.log(JSON.stringify(reviewInput, null, 2));
