#!/usr/bin/env node
import { parseOutArg, readJson, writeText } from "./lib/io.js";
import { renderPrototypeHandoff } from "./lib/prototype-handoff.js";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/render-prototype-handoff.js <ux-flow-spec.json> --out <prototype-handoff.md>");
  process.exit(2);
}

const spec = await readJson(input);
const markdown = renderPrototypeHandoff(spec);
const out = parseOutArg(process.argv);
if (!out) console.log(markdown);
else await writeText(out, markdown);
