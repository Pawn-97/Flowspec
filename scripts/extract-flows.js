#!/usr/bin/env node
import path from "node:path";
import { internalDir, parseNamedArg, writeJson, writeText } from "./lib/io.js";
import { loadSourceBundle, trace } from "./lib/source-bundle.js";

const projectPath = process.argv[2];
const flowSpecDir = parseNamedArg(process.argv, "--out-dir") || path.join(projectPath || "", "flow-spec");
const outDir = internalDir(flowSpecDir);

if (!projectPath) {
  console.error("Usage: node scripts/extract-flows.js <project-path> [--out-dir flow-spec]");
  process.exit(2);
}

function extractCandidate(bundle) {
  const text = bundle.allText;
  const isPorting = /port/i.test(text) && /eSIM|mobile/i.test(text);
  const id = isPorting ? "submit-uk-mobile-esim-port-request" : `${bundle.project.id}-primary-flow`;
  const relatedJtbds = [...new Set([...text.matchAll(/JTBD-(\d+)/g)].map((match) => `JTBD-${match[1]}`))].slice(0, 10);

  return {
    id,
    name: isPorting ? "Submit UK Mobile-eSIM port request" : "Primary confirmed UX flow",
    entry: /Port history/i.test(text) ? "Port history > Port number" : "Confirmed UX-partner entry point",
    exit: /Port history/i.test(text)
      ? "Submit success with order ID and Port history tracking entry"
      : "Confirmed terminal outcome",
    success_exit: /Port history/i.test(text)
      ? "Submit success with order ID and Port history tracking entry"
      : "Confirmed terminal outcome",
    default_path_scope: "happy_path",
    included_guardrails: [
      {
        id: "blocked-prerequisite-recovery",
        description: "Retain prerequisite blocked states as guardrails without expanding external setup flows."
      },
      {
        id: "per-item-validation-recovery",
        description: "Retain row-level correction and recovery states for bulk number validation."
      }
    ],
    excluded_paths: [
      {
        id: "business-address-creation",
        description: "Address creation remains an external exit, not an in-flow prototype path."
      },
      {
        id: "subscriber-creation",
        description: "Subscriber creation remains a prerequisite outside this selected flow."
      }
    ],
    related_jtbds: relatedJtbds,
    complexity: /bulk|批量|blocked|前置|async|状态/i.test(text) ? "high" : "medium",
    priority: "primary",
    reason: "Main confirmed flow with enough source evidence for deterministic FlowSpec preparation.",
    source_trace: [
      trace(
        "ux-onepage.md",
        "17. 交互流程",
        "Main path starts at the confirmed entry and ends with the confirmed terminal outcome."
      )
    ]
  };
}

const bundle = await loadSourceBundle(projectPath);
const candidates = {
  schema_version: "0.1",
  project: bundle.project,
  candidates: [extractCandidate(bundle)]
};

const indexLines = [
  `# Flow Candidates: ${bundle.project.name}`,
  "",
  "| Priority | Flow ID | Name | Entry | Exit | Complexity |",
  "|---|---|---|---|---|---|"
];
for (const candidate of candidates.candidates) {
  indexLines.push(
    `| ${candidate.priority} | ${candidate.id} | ${candidate.name} | ${candidate.entry} | ${candidate.exit} | ${candidate.complexity} |`
  );
}

await writeJson(path.join(outDir, "flow-candidates.json"), candidates);
await writeText(path.join(outDir, "flow-index.md"), indexLines.join("\n"));
console.log(JSON.stringify({ status: "ok", outDir, count: candidates.candidates.length }, null, 2));
