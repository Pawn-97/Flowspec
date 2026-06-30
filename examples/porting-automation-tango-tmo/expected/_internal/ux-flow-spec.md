# UX Flow Spec: Submit UK Mobile-eSIM port request

## 1. Flow Goal

Admin submits a UK Mobile-eSIM port request without opening a manual support ticket.

## 2. Review Profiles

Primary: b2b-admin

Secondary: multi-step-workflow, bulk-operations, data-table, async-status-tracking, blocked-prerequisite-recovery

## 3. Screen Inventory

| # | Screen ID | Screen name | Type | Layout pattern |
|---|---|---|---|---|
| 1 | select-business-address | Select verified business address | wizard_step | wizard-decision-screen |
| 2 | enter-port-in-numbers | Enter port-in numbers | wizard_step | bulk-workbench-screen |
| 3 | number-precheck-result | Number pre-check result | wizard_step | bulk-workbench-screen |
| 4 | review-port-request | Review port request | review_step | review-submit-screen |
| 5 | submit-success | Submit success | terminal_success | status-entry-screen |

## 4. Screen Specs

### Select verified business address

Purpose: Confirm required address prerequisite before collecting port-in details.
User intent: Choose an already verified business address for the selected country.

Components:
- business-address-selector: selectable table/list — Let admin select a verified address.

Interactions:
- continue-with-address: Click Continue -> enter-port-in-numbers

States:
- no-verified-address (blocked): No verified business address is available for this country.

Prototype instruction: Show a verified-address selector and a blocked empty state that offers external exit plus draft return behavior. Include visible default, loading or error states, primary action behavior, and recovery affordances already defined in this JSON.

### Enter port-in numbers

Purpose: Capture bulk numbers and prepare them for per-item validation.
User intent: Enter one or many UK Mobile-eSIM numbers to port.

Components:
- number-bulk-input: bulk input with parsed preview — Capture many numbers while previewing parsed rows.
- number-preview-table: per-item validation table — Show parsed numbers and per-item validation status.

Interactions:
- run-number-precheck: Click Continue -> number-precheck-result

States:
- number-format-error (error): Some numbers need correction before pre-check.

Prototype instruction: Show bulk input with parsed preview and row-level validation; do not collapse all errors into one alert. Include visible default, loading or error states, primary action behavior, and recovery affordances already defined in this JSON.

### Number pre-check result

Purpose: Make automated carrier detection and eligibility validation transparent and recoverable.
User intent: Review which numbers passed pre-check and fix failed rows before continuing.

Components:
- precheck-results-table: per-item validation table — Show per-number carrier, eligibility, and fix actions.

Interactions:
- continue-after-precheck: Click Continue -> review-port-request

States:
- partial-precheck-failure (error): Some numbers failed eligibility or duplicate checks.

Prototype instruction: Show loading, grouped pass/fail results, per-row issue text, and row-level recovery actions. Include visible default, loading or error states, primary action behavior, and recovery affordances already defined in this JSON.

### Review port request

Purpose: Reduce risk before high-impact carrier submission.
User intent: Confirm carrier groups, PAC coverage, subscriber mapping, and port date before submit.

Components:
- request-summary: grouped review summary — Show request grouped by carrier and validation status.

Interactions:
- submit-port-request: Click Submit -> submit-success

States:
- pac-expiry-warning (warning): Some PAC codes are close to expiry.

Prototype instruction: Show grouped carrier/request summary, high-risk warnings above submit, and edit links back to affected steps. Include visible default, loading or error states, primary action behavior, and recovery affordances already defined in this JSON.

### Submit success

Purpose: Confirm submission and expose the next tracking action.
User intent: See confirmation and know where to track progress.

Components:
- status-entry: status timeline — Show submitted state and next tracking entry.

Interactions:
- view-port-history: Click View in Port history -> external-port-history-entry

States:
- carrier-api-fallback (partial_success): Carrier API is unavailable for one group; a fallback ticket was created.

Prototype instruction: Show order ID, confirmation email expectation, Port history action, and fallback ticket state if applicable. Include visible default, loading or error states, primary action behavior, and recovery affordances already defined in this JSON.

## 5. Do Not Design
- Business address creation and KYC: D4 marks it as prerequisite only.
- Subscriber creation and temporary number acquisition: D3/D4 mark it as prerequisite only.
