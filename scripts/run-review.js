#!/usr/bin/env node
import path from "node:path";
import { internalDir, readJson, writeJson, writeText } from "./lib/io.js";

const flowSpecDir = process.argv[2];
if (!flowSpecDir) {
  console.error("Usage: node scripts/run-review.js <flow-spec-dir>");
  process.exit(2);
}

function issueFromValidation(item, index) {
  return {
    id: item.rule_id || `VALIDATION_${String(index + 1).padStart(3, "0")}`,
    severity: item.severity,
    category: item.category,
    evidence: item.message,
    impact: item.severity === "critical" ? "Blocks prototype handoff." : "May reduce prototype clarity or correctness.",
    recommended_fix: item.fix || "Fix the deterministic validation issue and rerun validation.",
    auto_fixable: Boolean(item.auto_fixable),
    requires_designer_confirmation: !item.auto_fixable
  };
}

function craftIssues(spec) {
  const issues = [];
  const shortInstructions = (spec.screens || []).filter((screen) => (screen.prototype_instruction || "").length < 120);
  if (shortInstructions.length > 0) {
    issues.push({
      id: "CRAFT_001",
      severity: "craft",
      category: "anti-slop-spec",
      evidence: `Prototype instructions are concise on: ${shortInstructions.map((screen) => screen.id).join(", ")}.`,
      impact: "Prototype agent may underspecify microcopy and state transitions.",
      recommended_fix: "Expand prototype_instruction for affected screens without adding new product facts.",
      auto_fixable: true,
      requires_designer_confirmation: false,
      fix_type: "content_specificity"
    });
  }
  return issues;
}

function scoreReview(issues) {
  if (issues.some((issue) => issue.severity === "critical")) return 0;
  const deductions = {
    high: 8,
    medium: 5,
    low: 2,
    craft: 4
  };
  return Math.max(0, 100 - issues.reduce((sum, issue) => sum + (deductions[issue.severity] || 0), 0));
}

const spec = await readJson(path.join(flowSpecDir, "ux-flow-spec.json"));
const auditDir = internalDir(flowSpecDir);
let validation = { status: "pass", issues: [] };
try {
  validation = await readJson(path.join(auditDir, "validation-report.json"));
} catch {
  validation = { status: "pass", issues: [] };
}

const issues = [
  ...(validation.issues || []).map(issueFromValidation),
  ...craftIssues(spec)
];
const blockers = issues.filter((issue) => issue.severity === "critical" || issue.requires_designer_confirmation).length;
const score = scoreReview(issues);
const review = {
  schema_version: "0.1",
  result: {
    score,
    status: blockers > 0 ? "blocked" : issues.length > 0 ? "pass_with_minor_revision" : "pass",
    blockers
  },
  summary:
    blockers > 0
      ? "Deterministic blockers must be fixed before handoff."
      : issues.length > 0
        ? "The spec is suitable for handoff after minor deterministic or craft revisions."
        : "The spec is suitable for handoff.",
  issues
};

const markdown = [
  `# UX Flow Spec Review: ${spec.flow.name}`,
  "",
  `Score: ${review.result.score}`,
  `Status: ${review.result.status}`,
  `Blockers: ${review.result.blockers}`,
  "",
  "## Issues",
  "",
  ...(issues.length
    ? issues.map((issue) => `- ${issue.id} [${issue.severity}] ${issue.evidence} Fix: ${issue.recommended_fix}`)
    : ["No deterministic or craft issues found."])
];

await writeJson(path.join(auditDir, "ux-flow-spec-review.json"), review);
await writeText(path.join(auditDir, "ux-flow-spec-review.md"), markdown.join("\n"));
console.log(JSON.stringify({ status: "ok", score, blockers, issues: issues.length }, null, 2));
