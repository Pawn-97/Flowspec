# /ux-spec:handoff-prototype

Generate deterministic prototype handoff artifacts.

## Preconditions

- `flow-spec/ux-flow-spec.json` exists.
- `flow-spec/_internal/validation-report.json` has `status: pass`.
- `flow-spec/_internal/ux-flow-spec-review.json` has no blockers and score >= 80.
- `flow-spec/_internal/revision-log.md` is current.

## Generate

- `flow-spec/handoff/ux-flow-spec.json`
- `flow-spec/handoff/prototype-handoff.md`

## Handoff Policy

`prototype-handoff.md` is rendered deterministically from `ux-flow-spec.json`. Do not polish it manually.

It must include:

- `Read This First`
- `Path Scope`
- `Prototype Surface`
- `Screens`
- `Agent Instructions`
- `Implementation Evidence Required`
- `Acceptance Checklist`
- `Evidence Summary`

The handoff should list shadcn targets and rules, not installation commands.

`prototype-agent-prompt.md`, `prototype-brief.md`, and `prototype-brief.draft.md` are not default outputs.

## Deterministic Script

```bash
node scripts/handoff-prototype.js flow-spec
```
