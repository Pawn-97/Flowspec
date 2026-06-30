# ZMT UK Mobile-eSIM Port Request Prototype

Clickable shadcn/ui prototype for `submit-uk-mobile-esim-port-request`.

## Source Of Truth

- `../examples/porting-automation-tango-tmo/expected/handoff/ux-flow-spec.json`
- `../examples/porting-automation-tango-tmo/expected/handoff/prototype-handoff.md`

The prototype only implements the screens, states, interactions, recovery paths, and out-of-scope boundaries represented in those files.

## Run

```bash
pnpm install
pnpm dev
```

Build check:

```bash
pnpm build
```

## Implemented Flow

- `select-business-address`: verified address selector, inline required validation, loading/disabled selector state, blocked no-address recovery.
- `enter-port-in-numbers`: bulk textarea, parsed preview table, invalid/duplicate row correction.
- `number-precheck-result`: grouped carrier detection results, loading state, partial failure recovery by edit/remove.
- `review-port-request`: grouped request summary, PAC expiry warning, 4:30 PM cutoff validation blocker, edit destinations.
- `submit-success`: submitted timeline, order ID, Port history external exit, carrier fallback ticket state.

## Implementation Evidence

| FlowSpec component id | Implementation | Deviation |
| --- | --- | --- |
| `business-address-selector` | shadcn `Table`, `Button`, `Badge`, `Empty`, `Skeleton` | Uses component composition because no single required block maps to this selector. |
| `number-bulk-input` | shadcn `Field`, `InputGroupTextarea`, `Alert` | No deviation. |
| `number-preview-table` | shadcn `Table`, `Badge`, `Button` | No deviation. |
| `precheck-results-table` | shadcn `Table`, `Badge`, `Button`, `Skeleton` | No deviation. |
| `request-summary` | shadcn `Card`, `Alert`, `Button` | Summary groups use cards rather than a table for scan density. |
| `status-entry` | shadcn `Card`, `Alert`, `Badge`, `Button` | Timeline is composed locally because there is no matching shadcn status timeline primitive. |

## Scope Boundaries

Not implemented: address creation, KYC, subscriber creation, temporary number acquisition, full Port history dashboard, US/TMO unresolved collection fields, backend/API calls, analytics, telemetry, persistence.
