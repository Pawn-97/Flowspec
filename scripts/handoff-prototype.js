#!/usr/bin/env node
import { rm } from "node:fs/promises";
import path from "node:path";
import { handoffDir, internalDir, readJson, writeJson, writeText } from "./lib/io.js";
import { renderPrototypeHandoff } from "./lib/prototype-handoff.js";

const flowSpecDir = process.argv[2];
if (!flowSpecDir) {
  console.error("Usage: node scripts/handoff-prototype.js <flow-spec-dir>");
  process.exit(2);
}

const auditDir = internalDir(flowSpecDir);
const spec = await readJson(path.join(flowSpecDir, "ux-flow-spec.json"));
const review = await readJson(path.join(auditDir, "ux-flow-spec-review.json"));
const validation = await readJson(path.join(auditDir, "validation-report.json"));

if (validation.status !== "pass") {
  console.error("Cannot hand off: _internal/validation-report.json is not pass.");
  process.exit(1);
}
if ((review.result?.blockers || 0) > 0 || (review.result?.score || 0) < 80) {
  console.error("Cannot hand off: review blockers exist or score is below 80.");
  process.exit(1);
}

const outDir = handoffDir(flowSpecDir);
await rm(outDir, { recursive: true, force: true });
await writeJson(path.join(outDir, "ux-flow-spec.json"), spec);
await writeText(path.join(outDir, "prototype-handoff.md"), renderPrototypeHandoff(spec));
console.log(JSON.stringify({ status: "ok", outDir, files: ["ux-flow-spec.json", "prototype-handoff.md"] }, null, 2));
