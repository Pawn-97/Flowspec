#!/usr/bin/env node
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { appendText, hasFlag, internalDir, readJson, writeJson } from "./lib/io.js";
import { today } from "./lib/source-bundle.js";

const execFileAsync = promisify(execFile);
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const flowSpecDir = process.argv[2];
const auto = hasFlag(process.argv, "--auto");
if (!flowSpecDir) {
  console.error("Usage: node scripts/revise-flowspec.js <flow-spec-dir> [--auto]");
  process.exit(2);
}
if (!auto) {
  console.error("Only deterministic --auto revisions are supported by this MVP script.");
  process.exit(2);
}

const specPath = path.join(flowSpecDir, "ux-flow-spec.json");
const auditDir = internalDir(flowSpecDir);
const review = await readJson(path.join(auditDir, "ux-flow-spec-review.json"));
const spec = await readJson(specPath);
let changed = false;
const applied = [];

for (const issue of review.issues || []) {
  if (!issue.auto_fixable || issue.requires_designer_confirmation) continue;
  if (issue.fix_type === "content_specificity") {
    for (const screen of spec.screens || []) {
      if ((screen.prototype_instruction || "").length < 120) {
        screen.prototype_instruction = `${screen.prototype_instruction} Include visible default, loading or error states, primary action behavior, and recovery affordances already defined in this JSON.`;
        changed = true;
      }
    }
    applied.push(issue.id);
  }
}

if (changed) await writeJson(specPath, spec);

await execFileAsync(process.execPath, [
  path.join(root, "scripts", "render-flowspec-md.js"),
  specPath,
  "--out",
  path.join(auditDir, "ux-flow-spec.md")
]);
await execFileAsync(process.execPath, [
  path.join(root, "scripts", "generate-traceability.js"),
  specPath,
  "--out",
  path.join(auditDir, "traceability.md")
]);
await execFileAsync(process.execPath, [
  path.join(root, "scripts", "validate-flowspec.js"),
  specPath,
  "--prep",
  path.join(auditDir, "flow-prep.json"),
  "--out",
  path.join(auditDir, "validation-report.json")
]);

await appendText(
  path.join(auditDir, "revision-log.md"),
  [
    "",
    `## ${today()} Auto revision`,
    "",
    applied.length > 0
      ? `- Applied deterministic auto-fixes: ${applied.join(", ")}.`
      : "- No JSON changes were needed; rendered artifacts remain source-of-truth derived."
  ].join("\n")
);

console.log(JSON.stringify({ status: "ok", changed, applied }, null, 2));
