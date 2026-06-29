# /ux-spec:revise [--auto]

Revise generated FlowSpec artifacts from structured review results.

## Inputs

- `flow-spec/ux-flow-spec-review.json`
- `flow-spec/ux-flow-spec.json`
- `flow-spec/flow-prep.json`

## Auto Mode

Only fix issues where:

- `auto_fixable: true`
- `requires_designer_confirmation: false`

Allowed auto-fix categories:

- missing low-risk schema field
- invalid local reference with obvious target
- missing `layout_pattern_id` when mapping is obvious
- component family alignment
- missing `deviation_reason`
- rendered artifact drift
- JSON formatting

Never auto-fix:

- source conflict
- product decision
- flow boundary
- review profile change
- split/merge semantic change
- out-of-scope boundary

## Limits

Maximum automatic revision passes: 2.

## After Revision

Regenerate rendered artifacts and rerun validation.

Append `revision-log.md`.

## Deterministic Script

```bash
node scripts/revise-flowspec.js flow-spec --auto
```
