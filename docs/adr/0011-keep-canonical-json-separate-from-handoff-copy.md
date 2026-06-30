# Keep canonical JSON separate from handoff copy

Flowspec v0.1 will keep `flow-spec/ux-flow-spec.json` as the canonical working source-of-truth JSON. `/ux-spec:handoff-prototype` will publish a copy to `flow-spec/handoff/ux-flow-spec.json` alongside `prototype-handoff.md`, allowing the handoff folder to be rebuilt without changing the canonical generation, validation, or review input.
