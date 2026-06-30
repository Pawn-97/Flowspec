#!/usr/bin/env node
import { readJson, writeJson, parseNamedArg } from "./lib/io.js";
import { validateWithSchema } from "./lib/schema.js";
import { issue, sourceTracePresent, validationStatus } from "./lib/validate-common.js";
import { lintFlowConsistency } from "./lint-flow-consistency.js";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/validate-flowspec.js <ux-flow-spec.json> [--prep flow-prep.json] [--out validation-report.json]");
  process.exit(2);
}

const spec = await readJson(input);
const prepPath = parseNamedArg(process.argv, "--prep");
const prep = prepPath ? await readJson(prepPath) : null;
const schemaResult = await validateWithSchema("ux-flow-spec.schema.json", spec);
const issues = [...schemaResult.errors];

const screenIds = new Set((spec.screens || []).map((screen) => screen.id));
const terminalDestinations = new Set(["external_exit", "terminal_outcome", "system_action", "stay_on_current_screen"]);
const defaultPathScope = spec.path_scope?.default_branch_coverage;

for (const screen of spec.screens || []) {
  if (defaultPathScope === "happy_path" && screen.path_role === "requested_expansion") {
    issues.push(issue("critical", "path-scope", `Screen ${screen.id} is a requested expansion but path_scope is happy_path.`, {
      rule_id: "PATH_SCOPE_001",
      screen_id: screen.id,
      auto_fixable: false
    }));
  }

  if (!sourceTracePresent(screen)) {
    issues.push(issue("critical", "traceability", `Screen ${screen.id} is missing source_trace.`, {
      rule_id: "TRACE_SCREEN_001",
      screen_id: screen.id,
      auto_fixable: false
    }));
  }

  for (const interaction of screen.interactions || []) {
    if (!interaction.destination) {
      issues.push(issue("critical", "prototype-readiness", `Interaction ${interaction.id} on ${screen.id} is missing destination.`, {
        rule_id: "FLOW_BRANCH_001",
        screen_id: screen.id,
        auto_fixable: false
      }));
    } else if (!screenIds.has(interaction.destination) && !terminalDestinations.has(interaction.destination) && !interaction.destination.startsWith("external-")) {
      issues.push(issue("high", "prototype-readiness", `Interaction ${interaction.id} on ${screen.id} has unresolved destination ${interaction.destination}.`, {
        rule_id: "FLOW_BRANCH_002",
        screen_id: screen.id,
        auto_fixable: false
      }));
    }
  }

  for (const state of screen.states || []) {
    if (state.type === "error" && !state.recovery) {
      issues.push(issue("critical", "prototype-readiness", `Error state ${state.id} on ${screen.id} is missing recovery.`, {
        rule_id: "ERROR_001",
        screen_id: screen.id,
        auto_fixable: false
      }));
    }
  }
}

issues.push(...lintFlowConsistency(spec, prep));

const report = {
  schema_version: "0.1",
  status: schemaResult.valid && validationStatus(issues) === "pass" ? "pass" : "fail",
  issues,
  summary: {
    schema_valid: schemaResult.valid,
    issue_count: issues.length,
    critical_count: issues.filter((item) => item.severity === "critical").length
  }
};

const out = parseNamedArg(process.argv, "--out");
if (out) await writeJson(out, report);
if (report.status === "fail") {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(report, null, 2));
