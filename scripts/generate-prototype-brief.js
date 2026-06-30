#!/usr/bin/env node
import { readJson, parseOutArg, writeText } from "./lib/io.js";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/generate-prototype-brief.js <ux-flow-spec.json> --out <prototype-brief.draft.md>");
  process.exit(2);
}

const spec = await readJson(input);
const requiredStates = new Set();
for (const screen of spec.screens || []) {
  for (const state of screen.states || []) requiredStates.add(state.type);
}

const lines = [];
lines.push(`# Prototype Brief: ${spec.flow.name}`);
lines.push("");
lines.push("## Goal");
lines.push("");
lines.push(spec.flow.goal || "");
lines.push("");
lines.push("## Source");
lines.push("");
lines.push("Use `ux-flow-spec.json` as the source of truth.");
lines.push("");
lines.push("## Required Screens");
for (const screen of spec.screens || []) lines.push(`- ${screen.title} (${screen.id})`);
lines.push("");
lines.push("## Required States");
for (const state of [...requiredStates].sort()) lines.push(`- ${state}`);
lines.push("");
lines.push("## Required Interactions");
for (const screen of spec.screens || []) {
  for (const interaction of screen.interactions || []) lines.push(`- ${screen.id}: ${interaction.trigger} -> ${interaction.destination}`);
}
lines.push("");
lines.push("## Out Of Scope");
for (const item of spec.out_of_scope_items || []) lines.push(`- ${item.item || item.id}`);
lines.push("");
lines.push("## Prototype Success Criteria");
lines.push("");
lines.push("A reviewer can click through the complete happy path and the required recovery paths without relying on unstated business rules.");

const out = parseOutArg(process.argv);
if (!out) console.log(lines.join("\n"));
else await writeText(out, lines.join("\n"));
