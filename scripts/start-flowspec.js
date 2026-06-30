#!/usr/bin/env node
import path from "node:path";
import { internalDir, parseNamedArg, writeText } from "./lib/io.js";
import { inferReviewProfiles, loadSourceBundle, today } from "./lib/source-bundle.js";

const projectPath = process.argv[2];
const flowSpecDir = parseNamedArg(process.argv, "--out-dir") || path.join(projectPath || "", "flow-spec");
const outDir = internalDir(flowSpecDir);

if (!projectPath) {
  console.error("Usage: node scripts/start-flowspec.js <project-path> [--out-dir flow-spec] [--confirm]");
  process.exit(2);
}

try {
  const bundle = await loadSourceBundle(projectPath);
  const profiles = inferReviewProfiles(bundle);
  await writeText(
    path.join(outDir, "revision-log.md"),
    [`# Revision Log`, "", `- ${today()}: Initialized FlowSpec workspace from ${bundle.project.id}.`].join("\n")
  );
  console.log(JSON.stringify({ status: "ok", outDir, project: bundle.project, review_profiles: profiles }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
