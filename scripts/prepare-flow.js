#!/usr/bin/env node
import path from "node:path";
import { readJson, hasFlag, internalDir, parseNamedArg, writeJson, writeText } from "./lib/io.js";
import { buildFlowUiGrammar, inferReviewProfiles, loadSourceBundle, today, trace } from "./lib/source-bundle.js";

const projectPath = process.argv[2];
const flowId = process.argv[3];
const flowSpecDir = parseNamedArg(process.argv, "--out-dir") || path.join(projectPath || "", "flow-spec");
const outDir = internalDir(flowSpecDir);
const confirmed = hasFlag(process.argv, "--confirm");

if (!projectPath || !flowId) {
  console.error("Usage: node scripts/prepare-flow.js <project-path> <flow_id> [--out-dir flow-spec] [--confirm]");
  process.exit(2);
}

function buildPrep(bundle, selectedFlow, confirmedByUser) {
  const profiles = inferReviewProfiles(bundle);
  const grammar = buildFlowUiGrammar();
  return {
    schema_version: "0.1",
    project: {
      id: bundle.project.id,
      name: bundle.project.name
    },
    source_snapshot: bundle.source_snapshot,
    selected_flow: {
      id: selectedFlow.id,
      name: selectedFlow.name,
      goal: "Admin submits a UK Mobile-eSIM port request without opening a manual support ticket.",
      entry: selectedFlow.entry,
      success_exit: selectedFlow.success_exit || selectedFlow.exit,
      default_path_scope: selectedFlow.default_path_scope || "happy_path",
      included_guardrails: selectedFlow.included_guardrails || [],
      excluded_paths: selectedFlow.excluded_paths || []
    },
    product_context: {
      domain: "B2B telecom admin",
      surface: "admin portal",
      flow_type: "multi-step wizard plus status tracking entry",
      complexity: selectedFlow.complexity || "high",
      primary_user: "admin",
      data_patterns: ["bulk input", "per-item validation", "carrier grouping", "blocked prerequisites", "draft recovery"]
    },
    review_profiles: {
      ...profiles,
      confirmed_by_user: confirmedByUser,
      confirmed_at: confirmedByUser ? today() : undefined
    },
    flow_ui_grammar: grammar,
    steps: [
      {
        id: "select-business-address-step",
        source_node: "Select verified business address",
        mapping_type: "one_to_one",
        proposed_targets: [
          {
            id: "select-business-address",
            type: "screen",
            ux_intent: "Choose an existing verified address for the selected country.",
            layout_pattern_id: "wizard-decision-screen",
            component_families: ["selectable table/list", "blocked prerequisite callout", "external exit action"],
            layout_intent: {
              screen_archetype: "decision",
              primary_focus: "verified address selection",
              secondary_focus: "prerequisite guidance"
            },
            risk_flags: ["blocked_prerequisite_possible"]
          }
        ],
        source_trace: [
          trace(
            "ux-onepage.md",
            "16. 信息架构",
            "Select existing verified business address; no address uses prompt exit, not creation flow."
          )
        ]
      },
      {
        id: "collect-pac-step",
        source_node: "Collect PAC + port date",
        mapping_type: "one_to_many",
        mapping_reason: "PAC assignment and port date scheduling have different decision modes and validation risks.",
        proposed_targets: [
          {
            id: "assign-pac",
            type: "screen",
            ux_intent: "Assign per-number or shared bulk PAC to eligible numbers.",
            layout_pattern_id: "bulk-workbench-screen",
            component_families: ["per-item validation table", "bulk input with parsed preview"],
            layout_intent: {
              screen_archetype: "workbench",
              primary_focus: "per-number PAC assignment",
              secondary_focus: "shared bulk PAC shortcut"
            },
            risk_flags: ["bulk_operation", "per_item_validation"]
          },
          {
            id: "schedule-port-date",
            type: "screen",
            ux_intent: "Choose target port date with cutoff and PAC expiry awareness.",
            layout_pattern_id: "bulk-workbench-screen",
            component_families: ["per-item validation table"],
            layout_intent: {
              screen_archetype: "workbench",
              primary_focus: "date choice and eligibility warnings"
            },
            risk_flags: ["cutoff_validation", "pac_expiry"]
          }
        ],
        source_trace: [
          trace("questions.md", "Answered Questions Q5/Q8", "PAC supports per-number and shared/bulk modes; expiry is system-derived.")
        ]
      }
    ],
    external_exits: [
      {
        id: "external-business-address-documents",
        must_not_expand: true,
        return_behavior: "Resume draft from Port history after address verification.",
        source_trace: [
          trace(
            "decisions.md",
            "D1/D4",
            "Business address creation is outside this UX scope and represented only as a prompt exit.",
            { source_type: "decision" }
          )
        ]
      }
    ],
    out_of_scope_boundaries: [
      {
        id: "subscriber-creation",
        how_represented: "external exit only",
        source_trace: [
          trace("decisions.md", "D3/D4", "Subscriber creation is a prerequisite and not designed in this flow.", {
            source_type: "decision"
          })
        ]
      }
    ],
    needs_confirmation: [
      {
        id: "us-tmo-fields",
        reason: "Q1 is open and blocks US detailed fields only.",
        blocking: false,
        source_trace: [
          trace("questions.md", "Open Questions Q1", "US/TMO collection fields and mechanism are still open.", {
            source_type: "open_question"
          })
        ]
      }
    ],
    confirmation: {
      status: confirmedByUser ? "confirmed" : "pending",
      confirmed_by_user: confirmedByUser,
      confirmed_at: confirmedByUser ? today() : undefined
    }
  };
}

function renderPrepMarkdown(prep) {
  const lines = [
    `# Flow Preparation: ${prep.selected_flow.name}`,
    "",
    "## Source of truth",
    "",
    "`flow-prep.json` is the deterministic preparation record. Confirm this Markdown brief before generating `ux-flow-spec.json`.",
    "",
    "## Selected flow",
    "",
    `- ID: ${prep.selected_flow.id}`,
    `- Goal: ${prep.selected_flow.goal}`,
    "",
    "## Review profiles",
    "",
    `- Primary: ${prep.review_profiles.primary}`,
    `- Secondary: ${prep.review_profiles.secondary.join(", ")}`,
    "",
    "## Proposed screen grammar",
    "",
    ...prep.flow_ui_grammar.layout_patterns.map((pattern) => `- ${pattern.id}: ${pattern.intent}`),
    "",
    "## Step mapping",
    "",
    ...prep.steps.map((step) => `- ${step.source_node} -> ${step.proposed_targets.map((target) => target.id).join(", ")}`),
    "",
    "## External exits",
    "",
    ...prep.external_exits.map((item) => `- ${item.id}: ${item.return_behavior}`),
    "",
    "## Needs confirmation",
    "",
    ...prep.needs_confirmation.map((item) => `- ${item.id}: ${item.reason} Blocking: ${item.blocking}`)
  ];
  return lines.join("\n");
}

const bundle = await loadSourceBundle(projectPath);
const candidatesPath = path.join(outDir, "flow-candidates.json");
let selectedFlow = null;
try {
  const candidates = await readJson(candidatesPath);
  selectedFlow = candidates.candidates.find((candidate) => candidate.id === flowId);
} catch {
  selectedFlow = null;
}

if (!selectedFlow) {
  selectedFlow = {
    id: flowId,
    name: flowId === "submit-uk-mobile-esim-port-request" ? "Submit UK Mobile-eSIM port request" : flowId,
    complexity: "high"
  };
}

const prep = buildPrep(bundle, selectedFlow, confirmed);
await writeJson(path.join(outDir, "flow-prep.json"), prep);
await writeText(path.join(outDir, "flow-prep.md"), renderPrepMarkdown(prep));
console.log(JSON.stringify({ status: "ok", outDir, flow_id: flowId }, null, 2));
