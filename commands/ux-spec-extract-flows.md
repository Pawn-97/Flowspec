# /ux-spec:extract-flows

Extract candidate flows from a confirmed UX-partner project.

## Read

- `ux-onepage.md`
- `state.md`
- `decisions.md` when present
- `questions.md` when present
- `memory/constraints.md` when present

## Source Sections

Prioritize:

- Final Goal
- User Behaviors
- JTBD
- Handoff Notes
- Information Architecture
- Interaction Flow
- Not Doing
- Open Questions

## Output

- `flow-spec/flow-index.md`
- `flow-spec/flow-candidates.json`

## Deterministic Script

```bash
node scripts/extract-flows.js <project-path> --out-dir flow-spec
```

## Requirements

- Extract multiple candidate flows when present.
- Require source section evidence for each candidate.
- Mark suggested primary flow.
- Do not generate full specs for multiple flows in MVP.
- Ask the designer to choose one primary flow before `/ux-spec:prepare`.
