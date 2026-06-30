# Admin Portal Skeleton

Status: `draft_pending_user_approval`

This skeleton is reference-only until explicitly approved. It must not be treated as a default layout contract while `prototype_surface.skeleton_status` is `draft_pending_user_approval`.

## Source Status

- Intended extraction source: Admin portal keyscreen Figma reference.
- Current repo evidence: no Figma URL or node id is stored in this repository.
- Basis for this draft: confirmed Flowspec v0.1 boundary, admin portal product context, and design-system-agnostic prototype handoff contract.

## Page Shell

- Use a persistent left navigation for product areas and workflow entry points.
- Use a top bar for page title, account context, and global actions.
- Keep the primary workflow content in a single main region.
- Use a compact step or progress indicator inside the workflow region when the FlowSpec is a wizard.
- Keep status, warning, and blocked-prerequisite messages close to the affected task region.

## Navigation Model

- Left nav should expose stable admin destinations such as Number Management, Phone System Management, Port History, Business Address & Documents, and eSIM Management when they are relevant to the FlowSpec.
- Prototype agents may show inactive nav items for orientation, but must not build flows that are excluded by `path_scope.excluded_paths`.
- External exits should be represented as outbound actions with clear return behavior, not expanded setup flows.

## Content Regions

- Header region: screen title, current flow context, and high-level status.
- Primary region: selected FlowSpec screen content and required components.
- Secondary region: prerequisites, warnings, recovery actions, or summary metadata.
- Footer/action region: stable primary action, secondary action, and draft or cancel affordances when specified by JSON.

## Implementation Strategy

- Use any suitable design system or component library available in the downstream prototype repository.
- Preserve each FlowSpec component's role, interaction shape, states, validation behavior, and recovery paths.
- Use custom implementation only when the downstream repository has no suitable existing pattern for the required interaction.
- Do not include design system installation commands in generated handoff.

## Component Mapping Defaults

- Tables: use a dense data table pattern with status markers and row actions for per-item state.
- Bulk input: use textarea or form field composition with adjacent parsed preview.
- Blocked prerequisite: use alert or callout composition with explicit external action.
- Review summary: use card, table, alert, and button composition.
- Status entry: use card, alert, badge, and action composition.

## Layout Rules

- Favor dense, scannable B2B admin workflow layout over marketing or hero composition.
- Keep repeated operational data in tables or grouped summaries.
- Keep recovery actions visible where the user encounters the issue.
- Preserve the FlowSpec's screen order, branch destinations, and out-of-scope boundaries.

## Open Review Questions

- Which admin shell pattern should be the preferred reference when a downstream repository has multiple options?
- Should future approved specs set `prototype_surface.skeleton_id` to `admin-portal` by default?
- Which nav destinations should be mandatory versus context-specific?
