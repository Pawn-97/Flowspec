function list(items, renderItem) {
  return (items || []).length ? items.map(renderItem) : ["- None"];
}

function text(value, fallback = "Not specified") {
  return value || fallback;
}

function contractItemLabel(item) {
  if (typeof item === "string") return item;
  return item.description ? `${item.id}: ${item.description}` : item.id;
}

function implementationTargetLabel(target = {}) {
  const parts = [`strategy=${text(target.strategy)}`, `target_role=${text(target.target_role)}`];
  if (target.interaction_shape) parts.push(`interaction_shape=${target.interaction_shape}`);
  if (target.notes) parts.push(`notes=${target.notes}`);
  return parts.join("; ");
}

function countSourceTraces(spec) {
  let count = 0;
  for (const screen of spec.screens || []) {
    count += (screen.source_trace || []).length;
    for (const component of screen.components || []) count += (component.source_trace || []).length;
    for (const interaction of screen.interactions || []) count += (interaction.source_trace || []).length;
    for (const state of screen.states || []) count += (state.source_trace || []).length;
  }
  return count;
}

export function renderPrototypeHandoff(spec) {
  const lines = [];
  lines.push(`# Prototype Handoff: ${spec.flow.name}`);
  lines.push("");
  lines.push("## Read This First");
  lines.push("");
  lines.push(`- Source of truth: ${text(spec.artifact_contract?.canonical_source, "flow-spec/ux-flow-spec.json")}`);
  lines.push("- Build only the screens, states, interactions, recovery paths, and out-of-scope boundaries represented in `ux-flow-spec.json`.");
  lines.push("- Do not add backend integrations, external API calls, analytics, telemetry, Figma generation, or project-management tasks.");
  lines.push("- Use this Markdown as a deterministic handoff view rendered from the JSON source.");
  lines.push("");

  lines.push("## Path Scope");
  lines.push("");
  lines.push(`- Default branch coverage: ${text(spec.path_scope?.default_branch_coverage)}`);
  lines.push(`- Expansion policy: ${text(spec.path_scope?.expansion_policy)}`);
  lines.push("- Included guardrails:");
  lines.push(...list(spec.path_scope?.included_guardrails, (item) => `  - ${contractItemLabel(item)}`));
  lines.push("- Excluded paths:");
  lines.push(...list(spec.path_scope?.excluded_paths, (item) => `  - ${contractItemLabel(item)}`));
  lines.push("");

  lines.push("## Prototype Surface");
  lines.push("");
  lines.push(`- Skeleton status: ${text(spec.prototype_surface?.skeleton_status)}`);
  if (spec.prototype_surface?.skeleton_id) lines.push(`- Skeleton id: ${spec.prototype_surface.skeleton_id}`);
  if (spec.prototype_surface?.implementation_guidance) {
    lines.push(`- Implementation guidance: ${spec.prototype_surface.implementation_guidance}`);
  }
  lines.push("");

  lines.push("## Screens");
  for (const screen of spec.screens || []) {
    lines.push("");
    lines.push(`### ${screen.title}`);
    lines.push("");
    lines.push(`- ID: ${screen.id}`);
    lines.push(`- Path role: ${screen.path_role}`);
    lines.push(`- Purpose: ${screen.page_purpose}`);
    lines.push("- Components:");
    lines.push(...list(screen.components, (component) => `  - ${component.id}: ${component.component_family}; ${implementationTargetLabel(component.implementation_target)}`));
    lines.push("- Interactions:");
    lines.push(...list(screen.interactions, (interaction) => `  - ${interaction.id}: ${interaction.trigger} -> ${interaction.destination}`));
    lines.push("- States:");
    lines.push(...list(screen.states, (state) => `  - ${state.id} (${state.type}): ${state.message}`));
  }
  lines.push("");

  lines.push("## Agent Instructions");
  lines.push("");
  lines.push("- Use any suitable design system or component library available in the downstream prototype repository.");
  lines.push("- Preserve each FlowSpec component's role, interaction shape, states, and validation behavior.");
  lines.push("- Report the concrete implementation mapping for each requested `implementation_target`.");
  lines.push("- Report material deviations from FlowSpec intent.");
  lines.push("- Do not implement excluded paths or out-of-scope items.");
  lines.push("");

  lines.push("## Implementation Evidence Required");
  lines.push("");
  lines.push(...list(spec.acceptance_contract?.implementation_evidence_required, (item) => `- ${item}`));
  lines.push("");

  lines.push("## Acceptance Checklist");
  lines.push("");
  lines.push(...list(spec.acceptance_contract?.checks, (check) => {
    if (typeof check === "string") return `- ${check}`;
    return check.notes ? `- ${check.id}: ${check.notes}` : `- ${check.id}`;
  }));
  lines.push("");

  lines.push("## Evidence Summary");
  lines.push("");
  lines.push(`- Screen count: ${(spec.screens || []).length}`);
  lines.push(`- Component count: ${(spec.screens || []).reduce((sum, screen) => sum + (screen.components || []).length, 0)}`);
  lines.push(`- Source trace count: ${countSourceTraces(spec)}`);
  lines.push(`- Internal audit directory: ${text(spec.artifact_contract?.internal_audit_directory, "flow-spec/_internal/")}`);
  lines.push("");

  return lines.join("\n");
}
