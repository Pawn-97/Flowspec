# Flow Preparation: Submit UK Mobile-eSIM port request

## Source of truth

`flow-prep.json` is the deterministic preparation record. Confirm this Markdown brief before generating `ux-flow-spec.json`.

## Selected flow

- ID: submit-uk-mobile-esim-port-request
- Goal: Admin submits a UK Mobile-eSIM port request without opening a manual support ticket.

## Review profiles

- Primary: b2b-admin
- Secondary: multi-step-workflow, bulk-operations, data-table, async-status-tracking, blocked-prerequisite-recovery

## Proposed screen grammar

- wizard-decision-screen: Single decision step with primary selector and secondary prerequisite guidance.
- bulk-workbench-screen: Input and parsed results visible together for batch correction.
- blocked-prerequisite-screen: Explain missing prerequisite, external exit, draft preservation, and return behavior.
- review-submit-screen: Grouped review summary with risk warnings before final submit.
- status-entry-screen: Show submitted state, next tracking action, and recovery entry points.

## Step mapping

- Select verified business address -> select-business-address
- Collect PAC + port date -> assign-pac, schedule-port-date

## External exits

- external-business-address-documents: Resume draft from Port history after address verification.

## Needs confirmation

- us-tmo-fields: Q1 is open and blocks US detailed fields only. Blocking: false
