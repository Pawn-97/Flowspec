# Repository Guidelines

## Project Scope

Flowspec is a Codex plugin, not a frontend app. It compiles confirmed UX-partner outputs into prototype-ready UX Flow Specs.

Do not add HTML prototype generation, Figma generation, visual design exploration, design tokens, backend integrations, external LLM/API calls, or project-management task generation unless explicitly requested.

## Source Of Truth

`ux-flow-spec.json` is the only source of truth for generated FlowSpec content. Render `ux-flow-spec.md`, `traceability.md`, and prototype briefs from JSON. Do not hand-maintain duplicate facts in Markdown.

## Architecture

- Use plain Node.js ESM, not TypeScript, for MVP scripts.
- Use JSON Schema and Ajv for schema validation.
- Keep deterministic checks in scripts.
- Keep product/profile-specific rules in JSON manifests under `rules/`.
- Let the current Codex agent perform qualitative review and constrained polishing.
- Spawn lint/validation sub-agents for deterministic validation when running workflows in Codex.

## Testing

Tests should assert structure and key behavior, not full-text snapshots. Prefer checks like valid schema, source trace coverage, branch destinations, recovery paths, out-of-scope protection, profile inference, and rendered-artifact consistency.

## Golden Sample

Use only confirmed UX-partner artifacts in `examples/porting-automation-tango-tmo/input/`. Do not include PM source docx files or screenshots in the MVP golden input.

## Style

Keep docs concise and concrete. Do not invent APIs, commands, or upstream files that do not exist. Add comments only for non-obvious script behavior.
