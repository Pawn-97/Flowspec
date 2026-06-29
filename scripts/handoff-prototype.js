#!/usr/bin/env node
import path from "node:path";
import { readFile } from "node:fs/promises";
import { readJson, writeText } from "./lib/io.js";

const flowSpecDir = process.argv[2];
if (!flowSpecDir) {
  console.error("Usage: node scripts/handoff-prototype.js <flow-spec-dir>");
  process.exit(2);
}

const spec = await readJson(path.join(flowSpecDir, "ux-flow-spec.json"));
const review = await readJson(path.join(flowSpecDir, "ux-flow-spec-review.json"));
const validation = await readJson(path.join(flowSpecDir, "validation-report.json"));

if (validation.status !== "pass") {
  console.error("Cannot hand off: validation-report.json is not pass.");
  process.exit(1);
}
if ((review.result?.blockers || 0) > 0 || (review.result?.score || 0) < 80) {
  console.error("Cannot hand off: review blockers exist or score is below 80.");
  process.exit(1);
}

const draftPath = path.join(flowSpecDir, "prototype-brief.draft.md");
const draft = await readFile(draftPath, "utf8");
const brief = [
  draft.trimEnd(),
  "",
  "## Source of truth",
  "",
  "`ux-flow-spec.json` controls screens, states, interactions, validation rules, and out-of-scope boundaries.",
  ""
].join("\n");

const prompt = [
  `# Prototype Agent Prompt: ${spec.flow.name}`,
  "",
  "Use these sources in priority order:",
  "",
  "1. `ux-flow-spec.json` as the source of truth.",
  "2. `prototype-brief.md` as the execution summary.",
  "3. `ux-flow-spec.md` as optional human-readable reference.",
  "",
  "Build only the screens, states, interactions, and recovery paths represented in `ux-flow-spec.json`.",
  "Do not build out-of-scope flows.",
  "Do not integrate real backend or external APIs.",
  "Do not generate Figma, HTML export, production code, analytics, telemetry, or implementation tasks unless separately requested.",
  "",
  "Required flow:",
  "",
  `- ${spec.flow.id}: ${spec.flow.goal}`,
  "",
  "Required screens:",
  "",
  ...(spec.screens || []).map((screen) => `- ${screen.id}: ${screen.title}`)
];

await writeText(path.join(flowSpecDir, "prototype-brief.md"), brief);
await writeText(path.join(flowSpecDir, "prototype-agent-prompt.md"), prompt.join("\n"));
console.log(JSON.stringify({ status: "ok", outDir: flowSpecDir }, null, 2));
