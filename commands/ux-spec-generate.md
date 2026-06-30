# /ux-spec:generate

Generate the UX Flow Spec JSON from confirmed flow prep.

## Preconditions

- `flow-spec/_internal/flow-prep.json` exists.
- `flow-spec/_internal/flow-prep.md` has been designer-confirmed.
- Source snapshot has not materially changed, or the flow prep has been regenerated.

## Generate

- `flow-spec/ux-flow-spec.json`

## Rules

- Inherit `flow_ui_grammar` from `flow-prep.json`.
- Include top-level `path_scope`, `prototype_surface`, `artifact_contract`, and `acceptance_contract`.
- Every screen must include one approved `path_role`.
- Every screen must reference a `layout_pattern_id`.
- Every component must use an allowed abstract `component_family`.
- Every concrete component must include `implementation_target`.
- Every screen must include source trace.
- Every branch must include a destination.
- Every error state must include recovery.
- Every blocked prerequisite must include external exit and return behavior.
- Every out-of-scope item must remain unexpanded.
- Any deviation from flow prep needs `deviation_reason`.

## Internal Render

After JSON generation, refresh internal audit views:

```bash
node scripts/render-flowspec-md.js flow-spec/ux-flow-spec.json --out flow-spec/_internal/ux-flow-spec.md
node scripts/generate-traceability.js flow-spec/ux-flow-spec.json --out flow-spec/_internal/traceability.md
```

Append `flow-spec/_internal/revision-log.md`.
