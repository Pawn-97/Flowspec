# Keep handoff command but narrow its output

Flowspec v0.1 will keep `/ux-spec:handoff-prototype` as the command for producing downstream prototype handoff, but it will only refresh `flow-spec/handoff/ux-flow-spec.json` and deterministic `flow-spec/handoff/prototype-handoff.md`. It will no longer create separate prototype brief draft, final brief, or prototype agent prompt files.
