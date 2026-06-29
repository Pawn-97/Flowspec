# Flowspec

Flowspec compiles confirmed UX discovery into prototype-ready UX Flow Specs with traceability, rule-based validation, and B2B craft review.

## What It Does

Flowspec is a Codex plugin for downstream work after UX-partner discovery. It reads a confirmed UX-partner project bundle, prepares a designer-reviewable flow plan, generates `ux-flow-spec.json` as the source of truth, then renders human and prototype handoff artifacts from that JSON.

## When To Use It

Use Flowspec when a UX discovery output already exists and you need a screen-level specification for a prototype agent. It is optimized for B2B admin flows such as multi-step wizards, data tables, bulk operations, blocked prerequisites, async status tracking, and recovery paths.

## MVP Boundaries

Flowspec does not generate HTML, CSS, JavaScript, Figma, hi-fi UI, design tokens, engineering tasks, or implementation plans. It does not replace UX-partner discovery and does not silently change upstream decisions.

## Input Contract

Required:

- `state.md`
- `ux-onepage.md`

Strongly recommended:

- `decisions.md`
- `questions.md`
- `memory/constraints.md`

Optional:

- `assumptions.md`
- `memory/terminology.md`
- `memory/baseline.md`

PM source documents and screenshots are optional secondary evidence. The MVP golden sample uses confirmed UX-partner artifacts only.

## Quickstart With Codex

Ask Codex:

```text
Use the ux-flow-spec skill and run /ux-spec:start <project-path>
```

Then continue with:

```text
/ux-spec:extract-flows
/ux-spec:prepare <flow_id>
/ux-spec:generate
/ux-spec:review
/ux-spec:handoff-prototype
```

## Workflow

1. `/ux-spec:start` checks the UX-partner bundle, source freshness, and current phase.
2. `/ux-spec:extract-flows` identifies candidate flows.
3. `/ux-spec:prepare <flow_id>` compiles the onepage flow into `flow-prep.json` and `flow-prep.md` for designer confirmation.
4. `/ux-spec:generate` creates `ux-flow-spec.json`.
5. Render scripts generate `ux-flow-spec.md`, `traceability.md`, and `prototype-brief.draft.md` from JSON.
6. `/ux-spec:review` runs deterministic lint and current-agent qualitative review.
7. `/ux-spec:revise --auto` fixes deterministic, low-risk issues.
8. `/ux-spec:handoff-prototype` emits `prototype-brief.md` and `prototype-agent-prompt.md`.

## Output Artifacts

`ux-flow-spec.json` is the source of truth. Markdown files are rendered views.

```text
flow-spec/
├── state.md
├── flow-index.md
├── flow-candidates.json
├── flow-prep.json
├── flow-prep.md
├── ux-flow-spec.json
├── ux-flow-spec.md
├── traceability.md
├── validation-report.json
├── ux-flow-spec-review.json
├── ux-flow-spec-review.md
├── prototype-brief.draft.md
├── prototype-brief.md
├── prototype-agent-prompt.md
└── revision-log.md
```

## Golden Sample

The MVP includes one high-complexity sample:

```text
examples/porting-automation-tango-tmo/
```

It covers multi-step workflow, bulk input, per-item validation, blocked prerequisites, external exits, save/resume, async carrier routing, fallback ticket state, status tracking entry, rejected recovery, not-doing boundaries, open questions, and traceability.

## Rule Profiles

Flowspec infers review profiles from UX-partner outputs, presents them for confirmation, and records them in `flow-prep.json`.

MVP profiles:

- `b2b-admin`
- `multi-step-workflow`
- `bulk-operations`
- `data-table`
- `async-status-tracking`
- `blocked-prerequisite-recovery`

## Development

The MVP uses plain Node.js ESM and JSON Schema.

```bash
npm install
npm test
npm run validate:plugin
npm run validate:skill
```

If your system Python does not include `PyYAML`, run the validation scripts with `PYTHON_BIN=/path/to/python` pointing at a Python environment that has `pyyaml` installed.

Tests assert structure and critical behavior, not full-text snapshots.

## Local Script Runtime

Use the deterministic scripts for non-LLM stages:

```bash
node scripts/start-flowspec.js examples/porting-automation-tango-tmo/input --out-dir /tmp/flow-spec --confirm
node scripts/extract-flows.js examples/porting-automation-tango-tmo/input --out-dir /tmp/flow-spec
node scripts/prepare-flow.js examples/porting-automation-tango-tmo/input submit-uk-mobile-esim-port-request --out-dir /tmp/flow-spec --confirm
```

After `ux-flow-spec.json` exists, validation, review, revise, and handoff are also deterministic scripts. They do not call external LLMs or APIs.

## Architecture

Scripts perform deterministic work: schema validation, flow consistency lint, traceability checks, rule manifest loading, rendering, and review packaging. The current Codex agent performs design synthesis, qualitative review, low-risk revisions, and final delivery. External LLM/API calls are not used.

## Reference Links

- UX-partner: https://github.com/Pawn-97/UX-partner
- ux-skill: https://github.com/Laith0003/ux-skill
- taste-skill: https://github.com/Leonxlnx/taste-skill
- ux-advisor-plugin: https://github.com/tom-barkan/ux-advisor-plugin
- Whiteport Design Studio / WDS: https://github.com/bmad-code-org/bmad-method-wds-expansion
- BMAD Method: https://github.com/bmad-code-org/BMAD-METHOD
- GitHub Spec Kit: https://github.com/github/spec-kit
- NN/g 10 Usability Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
