# /ux-spec:prepare <flow_id>

Compile a selected UX-partner onepage flow into a designer-confirmable Flow Preparation Brief.

## Inputs

- `flow-spec/_internal/flow-candidates.json`
- selected `flow_id`
- UX-partner source bundle

## Generate

- `flow-spec/_internal/flow-prep.json`
- `flow-spec/_internal/flow-prep.md`

## Deterministic Script

```bash
node scripts/prepare-flow.js <project-path> <flow_id> --out-dir flow-spec --confirm
```

## flow-prep Must Include

- source snapshot
- selected flow metadata
- product context
- review profiles
- normalized flow
- step inventory
- step-to-target mapping
- mapping reasons for split/merge decisions
- abstract component families
- layout intent / information hierarchy
- flow UI grammar
- external exits
- out-of-scope boundaries
- needs-confirmation items
- source trace

## Mapping Rules

Allow:

- `one_to_one`
- `one_to_many`
- `many_to_one`
- `node_to_state`
- `node_to_system_action`
- `node_to_external_exit`
- `node_to_terminal_outcome`

Every `one_to_many` or `many_to_one` mapping must include an explicit reason.

## Designer Confirmation

Ask the designer to confirm `flow-prep.md`, not raw JSON.

Only ask for confirmation on material semantic questions:

- profile mismatch
- ambiguous flow boundary
- split/merge product tradeoff
- source conflict
- open question affecting selected flow
- out-of-scope boundary uncertainty

## Validate

Run:

```bash
node scripts/validate-flow-prep.js flow-spec/_internal/flow-prep.json
```
