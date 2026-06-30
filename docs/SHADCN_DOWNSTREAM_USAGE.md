# Using FlowSpec Output With shadcn/ui

Flowspec is a Codex plugin, not a frontend app. It should produce prototype-ready handoff files, while the clickable UI belongs in a downstream product or prototype repository.

## Handoff Files

Give the prototype agent these generated files:

- `ux-flow-spec.json`: canonical source of truth for screens, states, interactions, recovery paths, and out-of-scope boundaries.
- `prototype-handoff.md`: deterministic human-readable view rendered from the JSON.

For the golden sample, those files live at:

```text
examples/porting-automation-tango-tmo/expected/handoff/ux-flow-spec.json
examples/porting-automation-tango-tmo/expected/handoff/prototype-handoff.md
```

Do not ask the prototype agent to infer missing screens from internal audit files.

## Prepare A shadcn App

Use an existing frontend repository when possible. For a fresh throwaway prototype:

```bash
npm create vite@latest zmt-prototype -- --template react-ts
cd zmt-prototype
npx shadcn@latest init
```

Install only the primitives required by the FlowSpec `shadcn_target` entries. For the current golden sample:

```bash
npx shadcn@latest add alert badge button card empty field input-group progress separator sidebar skeleton table toggle-group
```

If the target app already has shadcn/ui installed, keep its existing theme, aliases, icon library, and routing conventions.

## Prototype Agent Prompt

Use a prompt shaped like this in the downstream shadcn repo:

```text
Build a clickable shadcn/ui prototype from the attached FlowSpec handoff files.

Use ux-flow-spec.json as the only source of truth. Build only the screens,
states, interactions, recovery paths, and out-of-scope boundaries represented
in that JSON.

Use prototype-handoff.md as the deterministic reading guide. Do not add backend
integrations, API calls, analytics, telemetry, Figma generation, address
creation, subscriber creation, temporary number acquisition, or unresolved
regional fields.

Map each FlowSpec component to shadcn using shadcn_target. Report implementation
evidence for every component id, including deviations and custom_reason when a
custom component is unavoidable.
```

## Mapping Rules

- Prefer a suitable shadcn block for the admin shell when one exists.
- Otherwise compose shadcn/ui primitives named in `shadcn_target.targets`.
- Use custom components only when no block or primitive fits the requested component family.
- Keep all prototype data in memory unless the FlowSpec explicitly asks for persistence.
- Surface recovery paths as clickable states, but do not expand excluded paths into new workflow screens.

Example mappings from the golden sample:

| FlowSpec component | shadcn target | Prototype use |
| --- | --- | --- |
| `business-address-selector` | `table`, `button`, `badge` | Select an existing verified address and show the blocked empty state. |
| `number-bulk-input` | `textarea`, `form`, `alert` | Paste bulk numbers and show validation feedback. |
| `number-preview-table` | `table`, `badge`, `button` | Show parsed rows, duplicate checks, and row-level fixes. |
| `precheck-results-table` | `table`, `badge`, `button` | Show carrier detection, eligibility, and failed-row recovery. |
| `request-summary` | `card`, `table`, `alert`, `button` | Review grouped carrier, PAC, date, and subscriber mapping before submit. |
| `status-entry` | `card`, `alert`, `badge`, `button` | Show order ID, submitted status, fallback ticket, and Port history exit. |

## Verification

In the FlowSpec plugin repository, verify the handoff source:

```bash
npm run validate:sample
npm test
```

In the downstream shadcn repository, verify the prototype with that app's fastest relevant check, usually:

```bash
pnpm build
```

Treat lint failures in generated shadcn/ui primitives as downstream baseline issues unless the prototype task explicitly includes lint cleanup.
