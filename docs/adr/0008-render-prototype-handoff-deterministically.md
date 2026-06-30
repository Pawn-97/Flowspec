# Render prototype handoff deterministically

Flowspec v0.1 will render `prototype-handoff.md` deterministically from `ux-flow-spec.json` and will not allow current-agent polishing of downstream handoff content. This prevents the Markdown handoff from drifting away from the source-of-truth JSON and gives prototype agents one stable execution summary.

The rendered handoff must include implementation evidence requirements and an acceptance checklist derived from the source JSON.
