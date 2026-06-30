#!/usr/bin/env node
import { readJson, parseOutArg, writeText } from "./lib/io.js";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/render-flowspec-md.js <ux-flow-spec.json> --out <ux-flow-spec.md>");
  process.exit(2);
}

const spec = await readJson(input);
const lines = [];
lines.push(`# UX Flow Spec: ${spec.flow.name}`);
lines.push("");
lines.push("## 1. Flow Goal");
lines.push("");
lines.push(spec.flow.goal || "");
lines.push("");
lines.push("## 2. Review Profiles");
lines.push("");
lines.push(`Primary: ${spec.review_profiles.primary}`);
lines.push("");
lines.push(`Secondary: ${(spec.review_profiles.secondary || []).join(", ") || "None"}`);
lines.push("");
lines.push("## 3. Screen Inventory");
lines.push("");
lines.push("| # | Screen ID | Screen name | Type | Layout pattern |");
lines.push("|---|---|---|---|---|");
(spec.screens || []).forEach((screen, index) => {
  lines.push(`| ${index + 1} | ${screen.id} | ${screen.title} | ${screen.type} | ${screen.layout_pattern_id} |`);
});
lines.push("");
lines.push("## 4. Screen Specs");
for (const screen of spec.screens || []) {
  lines.push("");
  lines.push(`### ${screen.title}`);
  lines.push("");
  lines.push(`Purpose: ${screen.page_purpose}`);
  if (screen.user_intent) lines.push(`User intent: ${screen.user_intent}`);
  lines.push("");
  lines.push("Components:");
  for (const component of screen.components || []) {
    lines.push(`- ${component.id}: ${component.component_family} — ${component.role}`);
  }
  lines.push("");
  lines.push("Interactions:");
  for (const interaction of screen.interactions || []) {
    lines.push(`- ${interaction.id}: ${interaction.trigger} -> ${interaction.destination}`);
  }
  lines.push("");
  lines.push("States:");
  for (const state of screen.states || []) {
    lines.push(`- ${state.id} (${state.type}): ${state.message}`);
  }
  lines.push("");
  lines.push(`Prototype instruction: ${screen.prototype_instruction}`);
}
lines.push("");
lines.push("## 5. Do Not Design");
for (const item of spec.out_of_scope_items || []) {
  lines.push(`- ${item.item || item.id}: ${item.reason || ""}`);
}

const out = parseOutArg(process.argv);
if (!out) {
  console.log(lines.join("\n"));
} else {
  await writeText(out, lines.join("\n"));
}
