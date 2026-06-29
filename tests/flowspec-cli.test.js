import test from "node:test";
import assert from "node:assert/strict";
import { copyFile, mkdtemp, readFile, rm } from "node:fs/promises";
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

    const candidates = await readJson(path.join(outDir, "flow-candidates.json"));
    const candidateResult = await validateWithSchema("flow-candidates.schema.json", candidates);
    assert.equal(candidateResult.valid, true);
    assert.equal(candidates.candidates[0].id, "submit-uk-mobile-esim-port-request");

    const prep = await readJson(path.join(outDir, "flow-prep.json"));
    const prepResult = await validateWithSchema("flow-prep.schema.json", prep);
    assert.equal(prepResult.valid, true);
    assert.equal(prep.review_profiles.primary, "b2b-admin");
    assert.ok(prep.review_profiles.secondary.includes("bulk-operations"));
    assert.ok(prep.review_profiles.secondary.includes("blocked-prerequisite-recovery"));
    assert.ok(prep.external_exits.some((item) => item.id === "external-business-address-documents" && item.must_not_expand));
    assert.ok(prep.needs_confirmation.some((item) => item.id === "us-tmo-fields" && item.blocking === false));

    const prepMarkdown = await readFile(path.join(outDir, "flow-prep.md"), "utf8");
    assert.match(prepMarkdown, /Submit UK Mobile-eSIM port request/);
    assert.match(prepMarkdown, /Source of truth/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("golden source of truth can be reviewed, revised, and handed off deterministically", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "flowspec-review-"));
  const outDir = path.join(tempRoot, "flow-spec");
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
    await runNode(["scripts/render-flowspec-md.js", path.join(outDir, "ux-flow-spec.json"), "--out", path.join(outDir, "ux-flow-spec.md")]);
    await runNode(["scripts/generate-traceability.js", path.join(outDir, "ux-flow-spec.json"), "--out", path.join(outDir, "traceability.md")]);
    await runNode([
      "scripts/generate-prototype-brief.js",
      path.join(outDir, "ux-flow-spec.json"),
      "--out",
      path.join(outDir, "prototype-brief.draft.md")
    ]);
    await runNode([
      "scripts/validate-flowspec.js",
      path.join(outDir, "ux-flow-spec.json"),
      "--prep",
      path.join(outDir, "flow-prep.json"),
      "--out",
      path.join(outDir, "validation-report.json")
    ]);

    await runNode(["scripts/run-review.js", outDir]);
    const review = await readJson(path.join(outDir, "ux-flow-spec-review.json"));
    const reviewResult = await validateWithSchema("ux-flow-spec-review.schema.json", review);
    assert.equal(reviewResult.valid, true);
    assert.equal(review.result.blockers, 0);
    assert.ok(review.result.score >= 80);

    await runNode(["scripts/revise-flowspec.js", outDir, "--auto"]);
    const revisionLog = await readFile(path.join(outDir, "revision-log.md"), "utf8");
    assert.match(revisionLog, /Auto revision/);

    await runNode(["scripts/handoff-prototype.js", outDir]);
    const prompt = await readFile(path.join(outDir, "prototype-agent-prompt.md"), "utf8");
    assert.match(prompt, /ux-flow-spec\.json/);
    assert.match(prompt, /Do not build out-of-scope flows/);
    assert.match(prompt, /Do not integrate real backend or external APIs/);

    const brief = await readFile(path.join(outDir, "prototype-brief.md"), "utf8");
    assert.match(brief, /Source of truth/);
    assert.match(brief, /Required Screens/);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
