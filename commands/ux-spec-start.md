# /ux-spec:start <project-path>

Initialize a Flowspec workspace from a UX-partner project.

## Inputs

- `project-path`: path to the UX-partner project bundle.

## Steps

1. Verify required files:
   - `state.md`
   - `ux-onepage.md`
2. Read recommended files when present:
   - `decisions.md`
   - `questions.md`
   - `memory/constraints.md`
   - `assumptions.md`
   - `memory/terminology.md`
   - `memory/baseline.md`
3. Inspect `state.md` for confirmed phases and stale flags.
4. Create `flow-spec/_internal/` if missing.
5. Compute source snapshot hashes for required and recommended files.
6. Infer product context and review profiles from source evidence.
7. Present the inferred context and profiles for designer confirmation.
8. Append `flow-spec/_internal/revision-log.md`.

## Output

- `flow-spec/_internal/revision-log.md`

## Deterministic Script

```bash
node scripts/start-flowspec.js <project-path> --out-dir flow-spec --confirm
```

## Confirmation Required

Ask the designer to confirm:

- product context
- primary review profile
- secondary review profiles
- excluded profiles
- any material uncertainty

Do not continue to generation before profile confirmation.
