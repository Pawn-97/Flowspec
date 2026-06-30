import test from "node:test";
import assert from "node:assert/strict";
import { copyFile, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { validateWithSchema } from "../scripts/lib/schema.js";

const execFileAsync = promisify(execFile);
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const sampleInput = path.join(root, "examples", "porting-automation-tango-tmo", "input");
const sampleExpected = path.join(root, "examples", "porting-automation-tango-tmo", "expected");

async function runNode(args) {
  return execFileAsync(process.execPath, args, { cwd: root });
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

test("golden source bundle can start, extract flows, and prepare a selected flow", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "flowspec-cli-"));
  const outDir = path.join(tempRoot, "flow-spec");
  const internalDir = path.join(outDir, "_internal");
  try {
    await runNode(["scripts/start-flowspec.js", sampleInput, "--out-dir", outDir, "--confirm"]);
    await runNode(["scripts/extract-flows.js", sampleInput, "--out-dir", outDir]);
    await runNode([
      "scripts/prepare-flow.js",
      sampleInput,
      "submit-uk-mobile-esim-port-request",
      "--out-dir",
      outDir,
      "--confirm"
    ]);

    const candidates = await readJson(path.join(internalDir, "flow-candidates.json"));
    const candidateResult = await validateWithSchema("flow-candidates.schema.json", candidates);
    assert.equal(candidateResult.valid, true);
    assert.equal(candidates.candidates[0].id, "submit-uk-mobile-esim-port-request");
    assert.equal(candidates.candidates[0].default_path_scope, "happy_path");
    assert.ok(candidates.candidates[0].success_exit);
    assert.ok(candidates.candidates[0].included_guardrails.length > 0);
    assert.ok(candidates.candidates[0].excluded_paths.length > 0);

    const prep = await readJson(path.join(internalDir, "flow-prep.json"));
    const prepResult = await validateWithSchema("flow-prep.schema.json", prep);
    assert.equal(prepResult.valid, true);
    assert.equal(prep.review_profiles.primary, "b2b-admin");
    assert.ok(prep.review_profiles.secondary.includes("bulk-operations"));
    assert.ok(prep.review_profiles.secondary.includes("blocked-prerequisite-recovery"));
    assert.ok(prep.external_exits.some((item) => item.id === "external-business-address-documents" && item.must_not_expand));
    assert.ok(prep.needs_confirmation.some((item) => item.id === "us-tmo-fields" && item.blocking === false));

    const prepMarkdown = await readFile(path.join(internalDir, "flow-prep.md"), "utf8");
    assert.match(prepMarkdown, /Submit UK Mobile-eSIM port request/);
    assert.match(prepMarkdown, /Source of truth/);
    const rootFiles = await readdir(outDir);
    assert.deepEqual(rootFiles, ["_internal"]);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("golden source of truth can be reviewed, revised, and handed off deterministically", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "flowspec-review-"));
  const outDir = path.join(tempRoot, "flow-spec");
  const internalDir = path.join(outDir, "_internal");
  try {
    await runNode(["scripts/start-flowspec.js", sampleInput, "--out-dir", outDir, "--confirm"]);
    await runNode(["scripts/extract-flows.js", sampleInput, "--out-dir", outDir]);
    await runNode([
      "scripts/prepare-flow.js",
      sampleInput,
      "submit-uk-mobile-esim-port-request",
      "--out-dir",
      outDir,
      "--confirm"
    ]);
    await copyFile(path.join(sampleExpected, "ux-flow-spec.json"), path.join(outDir, "ux-flow-spec.json"));
    await runNode(["scripts/render-flowspec-md.js", path.join(outDir, "ux-flow-spec.json"), "--out", path.join(internalDir, "ux-flow-spec.md")]);
    await runNode(["scripts/generate-traceability.js", path.join(outDir, "ux-flow-spec.json"), "--out", path.join(internalDir, "traceability.md")]);
    await runNode([
      "scripts/validate-flowspec.js",
      path.join(outDir, "ux-flow-spec.json"),
      "--prep",
      path.join(internalDir, "flow-prep.json"),
      "--out",
      path.join(internalDir, "validation-report.json")
    ]);

    await runNode(["scripts/run-review.js", outDir]);
    const review = await readJson(path.join(internalDir, "ux-flow-spec-review.json"));
    const reviewResult = await validateWithSchema("ux-flow-spec-review.schema.json", review);
    assert.equal(reviewResult.valid, true);
    assert.equal(review.result.blockers, 0);
    assert.ok(review.result.score >= 80);

    await runNode(["scripts/revise-flowspec.js", outDir, "--auto"]);
    const revisionLog = await readFile(path.join(internalDir, "revision-log.md"), "utf8");
    assert.match(revisionLog, /Auto revision/);

    await runNode(["scripts/handoff-prototype.js", outDir]);
    const handoffFiles = await readdir(path.join(outDir, "handoff"));
    assert.deepEqual(handoffFiles.sort(), ["prototype-handoff.md", "ux-flow-spec.json"]);

    const handoff = await readFile(path.join(outDir, "handoff", "prototype-handoff.md"), "utf8");
    assert.match(handoff, /## Read This First/);
    assert.match(handoff, /## Path Scope/);
    assert.match(handoff, /## Prototype Surface/);
    assert.match(handoff, /## Implementation Evidence Required/);
    assert.match(handoff, /every_required_component_has_mapping/);
    assert.match(handoff, /implementation_target/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
