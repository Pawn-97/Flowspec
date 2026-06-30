# Remove design system constraints from FlowSpec

Flowspec will no longer require downstream prototype agents to use shadcn or any other named design system. FlowSpec handoff should preserve screen structure, component intent, interactions, states, recovery paths, and out-of-scope boundaries while leaving the downstream implementation stack open; implementation evidence remains useful, but it must report what was built rather than prove adherence to a prescribed component library. This supersedes the shadcn-specific direction in ADR 0002, ADR 0014, and the shadcn evidence portion of ADR 0015.
