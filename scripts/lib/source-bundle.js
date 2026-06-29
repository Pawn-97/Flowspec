import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const requiredSourceFiles = ["state.md", "ux-onepage.md"];
export const recommendedSourceFiles = ["decisions.md", "questions.md", "memory/constraints.md"];
export const optionalSourceFiles = ["assumptions.md", "memory/terminology.md", "memory/baseline.md"];
export const sourceFiles = [...requiredSourceFiles, ...recommendedSourceFiles, ...optionalSourceFiles];

export function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export function titleizeProject(projectId) {
  return String(projectId || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) return {};
  const end = markdown.indexOf("\n---", 4);
  if (end < 0) return {};
  const body = markdown.slice(4, end).trim();
  const result = {};
  for (const line of body.split("\n")) {
    const match = line.match(/^([^:#]+):\s*(.*)$/);
    if (match) result[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return result;
}

export function trace(sourceFile, section, claim, extra = {}) {
  return {
    source_file: sourceFile,
    section,
    claim,
    source_type: extra.source_type || "confirmed",
    confidence: extra.confidence || "high"
  };
}

export async function loadSourceBundle(projectPath) {
  if (!projectPath) throw new Error("project-path is required.");

  const root = path.resolve(projectPath);
  const files = {};
  const missingRequired = [];

  for (const relativePath of sourceFiles) {
    const absolutePath = path.join(root, relativePath);
    try {
      await stat(absolutePath);
      const content = await readFile(absolutePath, "utf8");
      files[relativePath] = {
        path: absolutePath,
        content,
        frontmatter: parseFrontmatter(content),
        sha256: createHash("sha256").update(content).digest("hex")
      };
    } catch (error) {
      if (requiredSourceFiles.includes(relativePath)) missingRequired.push(relativePath);
    }
  }

  if (missingRequired.length > 0) {
    throw new Error(`Missing required UX-partner source files: ${missingRequired.join(", ")}`);
  }

  const state = files["state.md"].frontmatter;
  const projectId = state.project || files["ux-onepage.md"].frontmatter.project || slugify(path.basename(root));
  const allText = Object.values(files).map((file) => file.content).join("\n\n");

  return {
    root,
    project: {
      id: projectId,
      name: titleizeProject(projectId),
      source: "UX-partner"
    },
    files,
    allText,
    source_snapshot: Object.fromEntries(Object.entries(files).map(([name, file]) => [name, file.sha256])),
    source_status: {
      phase: state.phase || null,
      phase_1_confirmed_at: state.phase_1_confirmed_at || null,
      phase_2_confirmed_at: state.phase_2_confirmed_at || null,
      phase_3_confirmed_at: state.phase_3_confirmed_at || null,
      stale_phase_1: state.stale_phase_1 === "true",
      stale_phase_2: state.stale_phase_2 === "true",
      stale_phase_3: state.stale_phase_3 === "true"
    }
  };
}

export function inferReviewProfiles(bundle) {
  const text = bundle.allText.toLowerCase();
  const secondary = [];
  if (/step|wizard|流程|多步|save draft|草稿/.test(text)) secondary.push("multi-step-workflow");
  if (/bulk|批量|20\+|per-number|per item|per-item/.test(text)) secondary.push("bulk-operations");
  if (/table|列表|port history|status|状态/.test(text)) secondary.push("data-table");
  if (/status|submitted|scheduled|completed|async|api|回调|跟踪/.test(text)) secondary.push("async-status-tracking");
  if (/prerequisite|前置|blocked|缺|business address|subscriber|kyc/.test(text)) {
    secondary.push("blocked-prerequisite-recovery");
  }

  return {
    primary: "b2b-admin",
    secondary: [...new Set(secondary)],
    excluded: ["consumer-onboarding", "marketing-site", "visual-brand-exploration"]
  };
}

export function buildFlowUiGrammar() {
  return {
    layout_patterns: [
      {
        id: "wizard-decision-screen",
        used_for: ["select-number-type-country", "select-business-address"],
        intent: "Single decision step with primary selector and secondary prerequisite guidance."
      },
      {
        id: "bulk-workbench-screen",
        used_for: ["enter-port-in-numbers", "number-precheck-result", "assign-pac"],
        intent: "Input and parsed results visible together for batch correction."
      },
      {
        id: "blocked-prerequisite-screen",
        used_for: ["no-verified-address", "missing-subscriber"],
        intent: "Explain missing prerequisite, external exit, draft preservation, and return behavior."
      },
      {
        id: "review-submit-screen",
        used_for: ["review-port-request"],
        intent: "Grouped review summary with risk warnings before final submit."
      },
      {
        id: "status-entry-screen",
        used_for: ["submit-success", "carrier-fallback-ticket", "rejected-number-recovery"],
        intent: "Show submitted state, next tracking action, and recovery entry points."
      }
    ],
    component_families: [
      "step progress indicator",
      "selectable table/list",
      "bulk input with parsed preview",
      "per-item validation table",
      "grouped review summary",
      "blocked prerequisite callout",
      "external exit action",
      "save draft action",
      "status timeline"
    ],
    interaction_conventions: [
      "Primary action remains stable across wizard steps.",
      "Save draft remains available on collection and blocked steps.",
      "Per-item errors appear next to affected items.",
      "External exits never expand into in-flow creation wizards."
    ],
    content_conventions: [
      "Use admin task language.",
      "Blocked states explain why the user cannot continue and how to recover.",
      "Describe system automation as next user-visible outcome, not implementation internals."
    ]
  };
}

export function today() {
  return process.env.FLOWSPEC_TODAY || new Date().toISOString().slice(0, 10);
}
