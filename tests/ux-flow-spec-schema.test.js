import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { validateWithSchema } from "../scripts/lib/schema.js";

const execFileAsync = promisify(execFile);
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

function minimalSpec() {
  return {
    schema_version: "0.1",
    project: { id: "sample-project" },
    flow: {
      id: "sample-flow",
      name: "Sample flow",
      goal: "Validate the v0.1 schema contracts."
    },
    review_profiles: {
      primary: "b2b-admin",
      secondary: [],
      excluded: []
    },
    flow_ui_grammar: {
      layout_patterns: [],
      component_families: []
    },
    path_scope: {
      default_branch_coverage: "happy_path",
      included_guardrails: [],
      excluded_paths: [],
      expansion_policy: "Alternate and recovery paths require explicit follow-up expansion."
    },
    prototype_surface: {
      ui_library: "shadcn",
      target_selection_order: ["block", "component", "custom"],
      block_strategy: "Prefer a suitable shadcn block before component composition.",
      skeleton_status: "none"
    },
    artifact_contract: {
      canonical_source: "flow-spec/ux-flow-spec.json",
      handoff_files: ["flow-spec/handoff/ux-flow-spec.json", "flow-spec/handoff/prototype-handoff.md"],
      internal_audit_directory: "flow-spec/_internal/"
    },
    acceptance_contract: {
      implementation_evidence_required: [
        "component_id",
        "implemented_shadcn_block_or_component",
        "deviation_from_requested_shadcn_target",
        "custom_reason_when_custom"
      ],
      checks: [
        "every_happy_path_step_screen_is_implemented",
        "every_required_component_has_mapping",
        "block_targets_attempted_before_component_composition",
        "custom_components_require_custom_reason",
        "excluded_paths_not_implemented",
        "no_backend_or_api_integration"
      ]
    },
    screens: [
      {
        id: "sample-screen",
        title: "Sample screen",
        type: "wizard_step",
        path_role: "happy_path_step",
        layout_pattern_id: "wizard-step",
        source_trace: [
          {
            source_file: "input.md",
            section: "Confirmed flow",
            claim: "The user completes the sample step."
          }
        ],
        page_purpose: "Validate a minimal happy-path screen.",
        components: [
          {
            id: "sample-table",
            type: "table",
            component_family: "selectable table/list",
            role: "Show selectable rows.",
            shadcn_target: {
              strategy: "block",
              targets: ["sidebar-07"],
              fallback: "component_composition_allowed"
            }
          }
        ],
        interactions: [],
        states: [],
        validations: [],
        prototype_instruction: "Render only this confirmed screen."
      }
    ]
  };
}

async function validate(spec) {
  return validateWithSchema("ux-flow-spec.schema.json", spec);
}

function messages(result) {
  return result.errors.map((error) => error.message).join("\n");
}

test("ux flow spec schema accepts v0.1 contracts and shadcn targets", async () => {
  const result = await validate(minimalSpec());

  assert.equal(result.valid, true, messages(result));
});

test("ux flow spec schema requires top-level contracts", async () => {
  const spec = minimalSpec();
  delete spec.path_scope;

  const result = await validate(spec);

  assert.equal(result.valid, false);
  assert.match(messages(result), /must have required property 'path_scope'/);
});

test("ux flow spec schema limits screen path roles", async () => {
  const spec = minimalSpec();
  spec.screens[0].path_role = "alternate_path";

  const result = await validate(spec);

  assert.equal(result.valid, false);
  assert.match(messages(result), /must be equal to one of the allowed values/);
});

test("ux flow spec schema requires component shadcn targets", async () => {
  const spec = minimalSpec();
  delete spec.screens[0].components[0].shadcn_target;

  const result = await validate(spec);

  assert.equal(result.valid, false);
  assert.match(messages(result), /must have required property 'shadcn_target'/);
});

test("ux flow spec schema requires custom shadcn targets to explain why", async () => {
  const spec = minimalSpec();
  spec.screens[0].components[0].shadcn_target = {
    strategy: "custom",
    targets: ["custom-bulk-editor"],
    fallback: "component_composition_allowed"
  };

  const result = await validate(spec);

  assert.equal(result.valid, false);
  assert.match(messages(result), /must have required property 'custom_reason'/);
});

test("ux flow spec schema limits acceptance check identifiers", async () => {
  const spec = minimalSpec();
  spec.acceptance_contract.checks = ["invented_check"];

  const result = await validate(spec);

  assert.equal(result.valid, false);
  assert.match(messages(result), /must match exactly one schema in oneOf/);
});

test("ux flow spec validation rejects unrequested expanded paths in happy-path scope", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "flowspec-scope-"));
  const specPath = path.join(tempRoot, "ux-flow-spec.json");
  const spec = minimalSpec();
  spec.screens[0].path_role = "requested_expansion";
  await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);

  try {
    await assert.rejects(
      execFileAsync(process.execPath, ["scripts/validate-flowspec.js", specPath], { cwd: root }),
      (error) => {
        assert.match(error.stderr, /PATH_SCOPE_001/);
        return true;
      }
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
