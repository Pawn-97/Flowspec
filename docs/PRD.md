# Flowspec PRD

## One-Line Positioning

Flowspec compiles confirmed UX discovery into prototype-ready UX Flow Specs with traceability, rule-based validation, and B2B craft review.

## Problem

UX-partner outputs discovery artifacts that clarify users, problems, JTBD, constraints, decisions, information architecture, and interaction flow. These artifacts are strong enough for design review, but not concrete enough for an HTML prototype agent to implement without guessing screen structure, states, components, branch destinations, validation behavior, error recovery, and out-of-scope boundaries.

## Goal

Generate one high-quality screen-level UX Flow Spec for one selected key flow from a confirmed UX-partner project bundle.

## Users

- Primary: UX designers preparing prototype-ready specs.
- Secondary: Codex/prototype agents consuming JSON + brief.
- Tertiary: reviewers, PMs, and managers checking flow quality and boundaries.

## MVP Inputs

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

## MVP Workflow

1. Start and verify source bundle.
2. Extract candidate flows.
3. Prepare selected flow into `flow-prep`.
4. Get designer confirmation for the preparation brief.
5. Generate `ux-flow-spec.json`.
6. Render Markdown, traceability, and prototype brief draft from JSON.
7. Run deterministic validation and qualitative review.
8. Auto-revise deterministic low-risk issues.
9. Generate prototype handoff files when quality gates pass.

## Key Product Decisions

- MVP is a Codex plugin only, with future adapter space for Claude Code and Cursor.
- No external LLM/API calls.
- Scripts handle deterministic work; the current agent handles design synthesis and qualitative review.
- Lint/validation may be delegated to Codex sub-agents. Main agent owns production, revision, and delivery.
- Quality gates are light per stage and strict before handoff.
- `flow-prep` is a designer-confirmable compilation plan, not final spec.
- `flow_ui_grammar` governs flow-level consistency for layouts, component families, interactions, and content conventions.
- `ux-flow-spec.json` is the source of truth.
- `traceability.md`, `ux-flow-spec.md`, and brief artifacts are generated from JSON.
- `revision-log.md` is append-only.

## Non-Goals

- HTML/CSS/JS generation.
- Figma generation.
- Hi-fi visual design.
- Design token generation.
- UX discovery replacement.
- User story or engineering task generation.
- Multiple full FlowSpecs in one MVP run.
- Real slash-command runtime.

## Success Criteria

- Candidate flows are identified from onepage and source context.
- One selected flow can be prepared, confirmed, generated, reviewed, revised, and handed off.
- Every screen has source trace.
- Business rules trace to confirmed sources or are marked needs confirmation.
- Branches have destinations.
- Errors have recovery paths.
- Blocked prerequisites have external exits and return behavior.
- Out-of-scope flows are not expanded.
- B2B craft review flags concrete issues with evidence and fixes.
- Prototype handoff contains enough information for a prototype agent without requiring guesses.
