import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateWithSchema } from "../scripts/lib/schema.js";
import { lintFlowConsistency } from "../scripts/lint-flow-consistency.js";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const expected = path.join(root, "examples", "porting-automation-tango-tmo", "expected");

async function readJson(file) {
  return JSON.parse(await readFile(path.join(expected, file), "utf8"));
}

async function readInternalJson(file) {
  return readJson(path.join("_internal", file));
}

test("golden flow candidates include primary submit flow", async () => {
  const candidates = await readInternalJson("flow-candidates.json");
  const result = await validateWithSchema("flow-candidates.schema.json", candidates);
  assert.equal(result.valid, true);

  const flow = candidates.candidates.find((candidate) => candidate.id === "submit-uk-mobile-esim-port-request");
  assert.ok(flow);
  assert.equal(flow.default_path_scope, "happy_path");
  assert.ok(flow.success_exit);
  assert.ok(flow.included_guardrails.length > 0);
  assert.ok(flow.excluded_paths.length > 0);
});

test("flow prep infers B2B profiles and flow UI grammar", async () => {
  const prep = await readInternalJson("flow-prep.json");
  const result = await validateWithSchema("flow-prep.schema.json", prep);
  assert.equal(result.valid, true);

  assert.equal(prep.review_profiles.primary, "b2b-admin");
  assert.ok(prep.review_profiles.secondary.includes("bulk-operations"));
  assert.ok(prep.review_profiles.secondary.includes("async-status-tracking"));
  assert.ok(prep.review_profiles.secondary.includes("blocked-prerequisite-recovery"));
  assert.ok(prep.flow_ui_grammar.layout_patterns.length >= 3);
  assert.ok(prep.flow_ui_grammar.component_families.includes("per-item validation table"));
});

test("flow prep protects external exits and open questions", async () => {
  const prep = await readInternalJson("flow-prep.json");

  const addressExit = prep.external_exits.find((item) => item.id === "external-business-address-documents");
  assert.equal(addressExit.must_not_expand, true);

  const usQuestion = prep.needs_confirmation.find((item) => item.id === "us-tmo-fields");
  assert.ok(usQuestion);
  assert.equal(usQuestion.blocking, false);
});

test("ux flow spec validates source trace and flow consistency", async () => {
  const spec = await readJson("ux-flow-spec.json");
  const result = await validateWithSchema("ux-flow-spec.schema.json", spec);
  assert.equal(result.valid, true);

  for (const screen of spec.screens) {
    assert.ok(screen.source_trace.length > 0, `${screen.id} missing source trace`);
    assert.ok(screen.layout_pattern_id, `${screen.id} missing layout pattern`);
    assert.equal(screen.path_role, "happy_path_step");
    assert.ok(
      screen.components.every((component) => component.implementation_target),
      `${screen.id} missing implementation target`
    );
  }

  const consistencyIssues = lintFlowConsistency(spec);
  assert.equal(consistencyIssues.filter((issue) => issue.severity === "critical").length, 0);
});

test("ux flow spec preserves B2B critical behaviors", async () => {
  const spec = await readJson("ux-flow-spec.json");
  const screens = new Map(spec.screens.map((screen) => [screen.id, screen]));

  const addressScreen = screens.get("select-business-address");
  const blocked = addressScreen.states.find((state) => state.id === "no-verified-address");
  assert.equal(blocked.recovery.destination, "external-business-address-documents");
  assert.ok(blocked.recovery.return_behavior);

  const numberScreen = screens.get("enter-port-in-numbers");
  assert.ok(numberScreen.components.some((component) => component.component_family === "per-item validation table"));
  assert.ok(numberScreen.states.some((state) => state.type === "error" && state.recovery));

  assert.ok(spec.out_of_scope_items.some((item) => item.id === "subscriber-creation"));
});

test("review output uses structured issues", async () => {
  const review = await readInternalJson("ux-flow-spec-review.json");
  const result = await validateWithSchema("ux-flow-spec-review.schema.json", review);
  assert.equal(result.valid, true);
  assert.ok(review.issues.every((issue) => issue.evidence && issue.impact && issue.recommended_fix));
});
