#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { readJson, parseOutArg } from "./lib/io.js";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/generate-traceability.js <ux-flow-spec.json> --out <traceability.md>");
  process.exit(2);
}

const spec = await readJson(input);
const rows = [];

function addRows(itemId, traces = []) {
  for (const trace of traces || []) {
    rows.push({
      item: itemId,
      source: `${trace.source_file} > ${trace.section}`,
      source_type: trace.source_type || "",
      confidence: trace.confidence || "",
      claim: trace.claim
    });
  }
}

for (const screen of spec.screens || []) {
  addRows(`screen:${screen.id}`, screen.source_trace);
  for (const component of screen.components || []) addRows(`component:${component.id}`, component.source_trace);
  for (const interaction of screen.interactions || []) addRows(`interaction:${interaction.id}`, interaction.source_trace);
  for (const state of screen.states || []) addRows(`state:${state.id}`, state.source_trace);
}

const lines = [
  `# Traceability: ${spec.flow.name}`,
  "",
  "| FlowSpec item | Source | Source type | Confidence | Claim |",
  "|---|---|---|---|---|"
];
for (const row of rows) {
  lines.push(`| ${row.item} | ${row.source} | ${row.source_type} | ${row.confidence} | ${row.claim} |`);
}

const out = parseOutArg(process.argv);
if (!out) console.log(lines.join("\n"));
else await writeFile(out, `${lines.join("\n")}\n`);
