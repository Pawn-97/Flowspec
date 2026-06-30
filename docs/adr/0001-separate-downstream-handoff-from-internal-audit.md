# Separate downstream handoff from internal audit

Flowspec will keep the source-of-truth JSON and downstream handoff Markdown together in `flow-spec/handoff/` as `ux-flow-spec.json` and `prototype-handoff.md`, while moving preparation, validation, review, traceability, and revision artifacts into an internal audit directory. This keeps the prototype agent's default reading surface small without discarding the evidence needed to review or debug a generated FlowSpec.

`prototype-agent-prompt.md` will not remain a separate default downstream file. Its required instructions will be rendered into `prototype-handoff.md`.

`traceability.md` will move to the internal audit directory. `prototype-handoff.md` may include a short evidence summary, but downstream agents are not expected to read the full traceability report by default.

`ux-flow-spec.md` will remain available as an internal human-readable audit view, but it will not be part of the downstream default reading surface.

`flow-prep.md` and `flow-prep.json` will live in the internal audit directory. Prepare commands must clearly tell the user which internal file to review before generation.

`flow-candidates.json` and `flow-index.md` will also live in the internal audit directory. Extract commands must clearly tell the user to review `flow-index.md` when choosing a candidate flow.

`revision-log.md` will remain in the internal audit directory for debugging and review history, but downstream prototype agents are not expected to read it.
