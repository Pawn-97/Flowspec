#!/usr/bin/env node
import { readJson } from "./lib/io.js";
import { collectComponentFamilies, collectLayoutPatternIds, issue } from "./lib/validate-common.js";

export function lintFlowConsistency(spec, prep = null) {
  const grammar = spec.flow_ui_grammar || prep?.flow_ui_grammar || {};
  const layoutIds = collectLayoutPatternIds(grammar);
  const componentFamilies = collectComponentFamilies(grammar);
  const issues = [];

  for (const screen of spec.screens || []) {
    if (!screen.layout_pattern_id) {
      issues.push(issue("critical", "flow-consistency", `Screen ${screen.id} is missing layout_pattern_id.`, {
        rule_id: "FLOW_GRAMMAR_LAYOUT_001",
        screen_id: screen.id,
        auto_fixable: true,
        fix: "Assign a layout_pattern_id from flow_ui_grammar.layout_patterns."
      }));
    } else if (!layoutIds.has(screen.layout_pattern_id)) {
      issues.push(issue("critical", "flow-consistency", `Screen ${screen.id} references unknown layout_pattern_id ${screen.layout_pattern_id}.`, {
        rule_id: "FLOW_GRAMMAR_LAYOUT_002",
        screen_id: screen.id,
        auto_fixable: false,
        fix: "Use a layout pattern declared in flow_ui_grammar."
      }));
    }

    for (const component of screen.components || []) {
      if (!componentFamilies.has(component.component_family)) {
        issues.push(issue("high", "flow-consistency", `Component ${component.id} uses undeclared component_family ${component.component_family}.`, {
          rule_id: "FLOW_GRAMMAR_COMPONENT_001",
          screen_id: screen.id,
          auto_fixable: true,
          fix: "Use an allowed component_family or update flow_ui_grammar before generation."
        }));
      }
    }

    const isBlocked = (screen.states || []).some((state) => state.type === "blocked") || screen.type === "blocked_state";
    if (isBlocked) {
      const hasRecovery = (screen.states || []).some((state) => state.recovery?.destination || state.recovery?.return_behavior);
      if (!hasRecovery) {
        issues.push(issue("high", "flow-consistency", `Blocked screen ${screen.id} lacks recovery destination or return behavior.`, {
          rule_id: "FLOW_GRAMMAR_BLOCKED_001",
          screen_id: screen.id,
          auto_fixable: false,
          fix: "Add an external exit and return behavior."
        }));
      }
    }
  }

  return issues;
}

const input = process.argv[2];
if (input && import.meta.url === `file://${process.argv[1]}`) {
  const spec = await readJson(input);
  const issues = lintFlowConsistency(spec);
  console.log(JSON.stringify({ schema_version: "0.1", status: issues.length ? "fail" : "pass", issues }, null, 2));
  if (issues.some((item) => item.severity === "critical")) process.exit(1);
}
