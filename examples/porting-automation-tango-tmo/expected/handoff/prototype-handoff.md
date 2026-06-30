# Prototype Handoff: Submit UK Mobile-eSIM port request

## Read This First

- Source of truth: flow-spec/ux-flow-spec.json
- Build only the screens, states, interactions, recovery paths, and out-of-scope boundaries represented in `ux-flow-spec.json`.
- Do not add backend integrations, external API calls, analytics, telemetry, Figma generation, or project-management tasks.
- Use this Markdown as a deterministic handoff view rendered from the JSON source.

## Path Scope

- Default branch coverage: happy_path
- Expansion policy: Alternate, recovery, and unresolved regional paths require an explicit follow-up expansion before becoming prototype screens.
- Included guardrails:
  - no-verified-address: Show the blocked prerequisite state and external return behavior when no verified address exists.
  - number-format-error: Show row-level correction for invalid or duplicate pasted numbers.
  - partial-precheck-failure: Show failed-row recovery before the admin can continue.
- Excluded paths:
  - business-address-creation: Do not build address creation or KYC verification.
  - subscriber-creation: Do not build subscriber or temporary number acquisition.
  - us-tmo-fields: Do not build unresolved US/TMO-specific collection fields.

## Prototype Surface

- UI library: shadcn/ui
- Target selection order: block -> component -> custom
- Block strategy: Prefer a suitable shadcn block for the admin shell; compose shadcn/ui components when no block fits the concrete FlowSpec component.
- Skeleton status: draft_pending_user_approval
- Skeleton id: admin-portal

## Screens

### Select verified business address

- ID: select-business-address
- Path role: happy_path_step
- Purpose: Confirm required address prerequisite before collecting port-in details.
- Components:
  - business-address-selector: selectable table/list; strategy=component; targets=table, button, badge; fallback=component_composition_allowed; notes=No single shadcn block is required for the selector; compose table rows with clear selected and empty states.
- Interactions:
  - continue-with-address: Click Continue -> enter-port-in-numbers
- States:
  - no-verified-address (blocked): No verified business address is available for this country.

### Enter port-in numbers

- ID: enter-port-in-numbers
- Path role: happy_path_step
- Purpose: Capture bulk numbers and prepare them for per-item validation.
- Components:
  - number-bulk-input: bulk input with parsed preview; strategy=component; targets=textarea, form, alert; fallback=component_composition_allowed; notes=Use textarea for pasted numbers with adjacent parsed feedback.
  - number-preview-table: per-item validation table; strategy=component; targets=table, badge, button; fallback=component_composition_allowed; notes=Show row-level status and correction actions.
- Interactions:
  - run-number-precheck: Click Continue -> number-precheck-result
- States:
  - number-format-error (error): Some numbers need correction before pre-check.

### Number pre-check result

- ID: number-precheck-result
- Path role: happy_path_step
- Purpose: Make automated carrier detection and eligibility validation transparent and recoverable.
- Components:
  - precheck-results-table: per-item validation table; strategy=component; targets=table, badge, button; fallback=component_composition_allowed; notes=Group eligibility results and failed-row actions without hiding partial failures.
- Interactions:
  - continue-after-precheck: Click Continue -> review-port-request
- States:
  - partial-precheck-failure (error): Some numbers failed eligibility or duplicate checks.

### Review port request

- ID: review-port-request
- Path role: happy_path_step
- Purpose: Reduce risk before high-impact carrier submission.
- Components:
  - request-summary: grouped review summary; strategy=component; targets=card, table, alert, button; fallback=component_composition_allowed; notes=Use grouped summary sections and warning callouts before submit.
- Interactions:
  - submit-port-request: Click Submit -> submit-success
- States:
  - pac-expiry-warning (warning): Some PAC codes are close to expiry.

### Submit success

- ID: submit-success
- Path role: happy_path_step
- Purpose: Confirm submission and expose the next tracking action.
- Components:
  - status-entry: status timeline; strategy=component; targets=card, alert, badge, button; fallback=component_composition_allowed; notes=Show submitted status, order id, and Port history tracking entry.
- Interactions:
  - view-port-history: Click View in Port history -> external-port-history-entry
- States:
  - carrier-api-fallback (partial_success): Carrier API is unavailable for one group; a fallback ticket was created.

## Agent Instructions

- Prefer a suitable shadcn block before composing individual shadcn/ui components.
- Use a custom component only when no suitable shadcn block or component fits, and report `custom_reason`.
- Report deviations from each requested `shadcn_target`.
- Do not implement excluded paths or out-of-scope items.

## Implementation Evidence Required

- FlowSpec component id
- Implemented shadcn block, shadcn/ui component, or custom component
- Any deviation from the requested shadcn_target
- custom_reason when a custom component is used

## Acceptance Checklist

- every_happy_path_step_screen_is_implemented
- every_required_component_has_mapping
- block_targets_attempted_before_component_composition
- custom_components_require_custom_reason
- excluded_paths_not_implemented
- no_backend_or_api_integration

## Evidence Summary

- Screen count: 5
- Component count: 6
- Source trace count: 11
- Internal audit directory: flow-spec/_internal/
