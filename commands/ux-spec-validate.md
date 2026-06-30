# /ux-spec:validate

Run deterministic validation and lint.

## Run

```bash
node scripts/validate-flowspec.js flow-spec/ux-flow-spec.json --prep flow-spec/_internal/flow-prep.json --out flow-spec/_internal/validation-report.json
```

## Validation Order

1. JSON Schema validation.
2. Required fields and valid references.
3. Branch destinations and recovery paths.
4. Source trace coverage.
5. Flow UI Grammar consistency.
6. Profile rule lint.
7. Rendered artifact consistency when artifacts exist.

## Output

- `flow-spec/_internal/validation-report.json`

## Failure Policy

Critical failures block handoff. Auto-fixable deterministic issues may be handled by `/ux-spec:revise --auto`. Semantic conflicts require designer confirmation.
