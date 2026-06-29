#!/usr/bin/env node
import path from "node:path";
import { hasFlag, parseNamedArg, writeText } from "./lib/io.js";
import { inferReviewProfiles, loadSourceBundle, today } from "./lib/source-bundle.js";

const projectPath = process.argv[2];
const outDir = parseNamedArg(process.argv, "--out-dir") || path.join(projectPath || "", "flow-spec");
const confirmed = hasFlag(process.argv, "--confirm");

if (!projectPath) {
  console.error("Usage: node scripts/start-flowspec.js <project-path> [--out-dir flow-spec] [--confirm]");
  process.exit(2);
}

try {
  const bundle = await loadSourceBundle(projectPath);
  const profiles = inferReviewProfiles(bundle);
  const lines = [
    "---",
    `project: ${bundle.project.id}`,
    `started_at: ${today()}`,
    `source_root: ${bundle.root}`,
    `profile_confirmation: ${confirmed ? "confirmed" : "pending"}`,
    "---",
    "",
    `# FlowSpec State: ${bundle.project.name}`,
    "",
    "## Source of truth",
    "",
    "`ux-flow-spec.json` is the source of truth once generated. Markdown artifacts are rendered views.",
    "",
    "## Source bundle",
    "",
    `- Required files present: ${Object.keys(bundle.files).filter((name) => ["state.md", "ux-onepage.md"].includes(name)).join(", ")}`,
    `- UX-partner phase: ${bundle.source_status.phase || "unknown"}`,
    `- Stale flags: phase1=${bundle.source_status.stale_phase_1}, phase2=${bundle.source_status.stale_phase_2}, phase3=${bundle.source_status.stale_phase_3}`,
    "",
    "## Inferred review profiles",
    "",
    `- Primary: ${profiles.primary}`,
    `- Secondary: ${profiles.secondary.join(", ") || "none"}`,
    `- Excluded: ${profiles.excluded.join(", ")}`,
    "",
    "## Confirmation",
    "",
    confirmed ? "Confirmed by CLI flag for deterministic MVP run." : "Designer confirmation is required before generation."
  ];

  await writeText(path.join(outDir, "state.md"), lines.join("\n"));
  await writeText(
    path.join(outDir, "revision-log.md"),
    [`# Revision Log`, "", `- ${today()}: Initialized FlowSpec workspace from ${bundle.project.id}.`].join("\n")
  );
  console.log(JSON.stringify({ status: "ok", outDir, project: bundle.project, review_profiles: profiles }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
