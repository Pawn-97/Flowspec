# Using FlowSpec Output With Prototype Agents

Flowspec is a Codex plugin, not a frontend app. It produces prototype-ready handoff files, while the clickable UI belongs in a downstream product or prototype repository.

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

## Prototype Agent Prompt

Use a prompt shaped like this in the downstream prototype repository:

```text
Build a clickable prototype from the attached FlowSpec handoff files.

Use ux-flow-spec.json as the only source of truth. Build only the screens,
states, interactions, recovery paths, and out-of-scope boundaries represented
in that JSON.

Use prototype-handoff.md as the deterministic reading guide. You may use any
suitable design system or component library already available in this repository.
Do not add backend integrations, API calls, analytics, telemetry, Figma
generation, address creation, subscriber creation, temporary number acquisition,
or unresolved regional fields.

Map each FlowSpec component to a concrete UI implementation using
implementation_target. Report implementation evidence for every component id,
including material deviations from FlowSpec intent.
```

## Mapping Rules

- Use any suitable design system or component library available in the downstream repository.
- Preserve each FlowSpec component's role, interaction shape, states, validations, and recovery behavior.
- Keep all prototype data in memory unless the FlowSpec explicitly asks for persistence.
- Surface recovery paths as clickable states, but do not expand excluded paths into new workflow screens.

Example mappings from the golden sample:

| FlowSpec component | Implementation target role | Prototype use |
| --- | --- | --- |
| `business-address-selector` | Selectable address table or list | Select an existing verified address and show the blocked empty state. |
| `number-bulk-input` | Bulk number entry with parsed feedback | Paste bulk numbers and show validation feedback. |
| `number-preview-table` | Per-item validation table | Show parsed rows, duplicate checks, and row-level fixes. |
| `precheck-results-table` | Eligibility result table | Show carrier detection, eligibility, and failed-row recovery. |
| `request-summary` | Grouped review summary | Review grouped carrier, PAC, date, and subscriber mapping before submit. |
| `status-entry` | Submitted status entry | Show order ID, submitted status, fallback ticket, and Port history exit. |

## Verification

In the FlowSpec plugin repository, verify the handoff source:

```bash
npm run validate:sample
npm test
```

In the downstream prototype repository, verify the prototype with that app's fastest relevant check, usually its build command.
