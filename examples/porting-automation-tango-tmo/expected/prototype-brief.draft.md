# Prototype Brief: Submit UK Mobile-eSIM port request

## Goal

Admin submits a UK Mobile-eSIM port request without opening a manual support ticket.

## Source

Use `ux-flow-spec.json` as the source of truth.

## Required Screens
- Select verified business address (select-business-address)
- Enter port-in numbers (enter-port-in-numbers)
- Number pre-check result (number-precheck-result)
- Review port request (review-port-request)
- Submit success (submit-success)

## Required States
- blocked
- error
- partial_success
- warning

## Required Interactions
- select-business-address: Click Continue -> enter-port-in-numbers
- enter-port-in-numbers: Click Continue -> number-precheck-result
- number-precheck-result: Click Continue -> review-port-request
- review-port-request: Click Submit -> submit-success
- submit-success: Click View in Port history -> external-port-history-entry

## Out Of Scope
- Business address creation and KYC
- Subscriber creation and temporary number acquisition

## Prototype Success Criteria

A reviewer can click through the complete happy path and the required recovery paths without relying on unstated business rules.
