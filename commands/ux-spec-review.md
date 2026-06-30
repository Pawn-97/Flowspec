# /ux-spec:review

Review a generated FlowSpec with deterministic findings plus current-agent qualitative review.

## Inputs

- `flow-spec/_internal/flow-prep.json`
- `flow-spec/ux-flow-spec.json`
- `flow-spec/_internal/validation-report.json`
- rule manifests under `rules/`

## Steps

1. Run `/ux-spec:validate`.
2. Run deterministic review packaging:
   ```bash
   node scripts/review-flowspec.js flow-spec/ux-flow-spec.json --prep flow-spec/_internal/flow-prep.json --validation flow-spec/_internal/validation-report.json --out flow-spec/_internal/review-input.json
   ```
3. Current Codex agent performs qualitative review using `review-input.json`.
4. Write structured review:
   - `flow-spec/_internal/ux-flow-spec-review.json`
   - `flow-spec/_internal/ux-flow-spec-review.md`
5. If low-risk auto-fixable issues exist, run `/ux-spec:revise --auto` once, then validate again.

## Deterministic Script

```bash
node scripts/run-review.js flow-spec
```

## Qualitative Review Dimensions

- Source fidelity
- B2B UX Craft
- Anti-Slop Spec Quality
- Prototype readiness
- Accessibility / inclusive UX
- Flow-level consistency

## Review Issue Requirements

Every issue must include:

- `id`
- `severity`
- `category`
- `evidence`
- `impact`
- `recommended_fix`
- `auto_fixable`
- `requires_designer_confirmation`

LLM qualitative review may add issues but cannot override deterministic blockers.
