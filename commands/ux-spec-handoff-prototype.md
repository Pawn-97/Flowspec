# /ux-spec:handoff-prototype

Generate prototype handoff artifacts.

## Preconditions

- `validation_pass: true`
- no blockers
- review score >= 80
- `ux-flow-spec.json` exists
- `traceability.md` exists
- `prototype-brief.draft.md` exists
- `revision-log.md` is current

## Generate

- `flow-spec/prototype-brief.md`
- `flow-spec/prototype-agent-prompt.md`

## Brief Policy

`prototype-brief.md` starts from the JSON-generated draft, then the current agent may perform constrained polishing.

Polishing may not:

- add screens, states, or interactions absent from JSON
- delete required screens
- change out-of-scope items
- introduce business rules

## Prompt Priority

`prototype-agent-prompt.md` must tell the prototype agent:

1. Primary source of truth: `ux-flow-spec.json`
2. Execution summary: `prototype-brief.md`
3. Optional human reference: `ux-flow-spec.md`

The prompt must prohibit out-of-scope flows and real backend/API integration unless explicitly requested.

## Deterministic Script

```bash
node scripts/handoff-prototype.js flow-spec
```
