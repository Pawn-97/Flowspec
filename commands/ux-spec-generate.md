# /ux-spec:generate

Generate the UX Flow Spec JSON from confirmed flow prep.

## Preconditions

- `flow-spec/flow-prep.json` exists.
- `flow-spec/flow-prep.md` has been designer-confirmed.
- Source snapshot has not materially changed, or the flow prep has been regenerated.

## Generate

- `flow-spec/ux-flow-spec.json`

## Rules

- Inherit `flow_ui_grammar` from `flow-prep.json`.
- Every screen must reference a `layout_pattern_id`.
- Every component must use an allowed abstract `component_family`.
- Every screen must include source trace.
- Every branch must include a destination.
- Every error state must include recovery.
- Every blocked prerequisite must include external exit and return behavior.
- Every out-of-scope item must remain unexpanded.
- Any deviation from flow prep needs `deviation_reason`.

## Render

After JSON generation, run:

```bash
node scripts/render-flowspec-md.js flow-spec/ux-flow-spec.json --out flow-spec/ux-flow-spec.md
node scripts/generate-traceability.js flow-spec/ux-flow-spec.json --out flow-spec/traceability.md
node scripts/generate-prototype-brief.js flow-spec/ux-flow-spec.json --out flow-spec/prototype-brief.draft.md
```

Append `revision-log.md`.
