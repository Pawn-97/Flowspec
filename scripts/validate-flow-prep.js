#!/usr/bin/env node
import { readJson, writeJson, parseOutArg } from "./lib/io.js";
import { validateWithSchema } from "./lib/schema.js";
import { collectComponentFamilies, collectLayoutPatternIds, issue, validationStatus } from "./lib/validate-common.js";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/validate-flow-prep.js <flow-prep.json> [--out validation-report.json]");
  process.exit(2);
}

const data = await readJson(input);
const schemaResult = await validateWithSchema("flow-prep.schema.json", data);
const issues = [...schemaResult.errors];

const layoutIds = collectLayoutPatternIds(data.flow_ui_grammar);
const families = collectComponentFamilies(data.flow_ui_grammar);

for (const step of data.steps || []) {
  if ((step.mapping_type === "one_to_many" || step.mapping_type === "many_to_one") && !step.mapping_reason) {
    issues.push(issue("high", "flow-prep", `Step ${step.id} uses ${step.mapping_type} but is missing mapping_reason.`, {
      rule_id: "PREP_MAPPING_REASON_001",
      auto_fixable: false
    }));
  }

  for (const target of step.proposed_targets || []) {
    if (target.layout_pattern_id && !layoutIds.has(target.layout_pattern_id)) {
      issues.push(issue("critical", "flow-ui-grammar", `Target ${target.id} references unknown layout_pattern_id ${target.layout_pattern_id}.`, {
        rule_id: "PREP_LAYOUT_REF_001",
        auto_fixable: false
      }));
    }

    for (const family of target.component_families || []) {
      if (!families.has(family)) {
        issues.push(issue("high", "flow-ui-grammar", `Target ${target.id} uses component family not in grammar: ${family}.`, {
          rule_id: "PREP_COMPONENT_FAMILY_001",
          auto_fixable: true
        }));
      }
    }
  }
}

const report = {
  schema_version: "0.1",
  status: schemaResult.valid && validationStatus(issues) === "pass" ? "pass" : "fail",
  issues,
  summary: {
    schema_valid: schemaResult.valid,
    issue_count: issues.length
  }
};

const out = parseOutArg(process.argv);
if (out) await writeJson(out, report);
if (report.status === "fail") {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(report, null, 2));
