# Use shadcn as downstream prototype UI contract

Flowspec will guide downstream prototype agents to prioritize shadcn/ui components and dashboard/sidebar blocks, but it will not hard-code framework installation commands, `shadcn add` commands, package managers, or frontend setup steps. Handoff output should list shadcn targets and selection rules, not project setup commands. This keeps FlowSpec output useful for shadcn-based prototypes while preserving the plugin boundary: Flowspec specifies prototype-ready UX structure, not runnable frontend implementation.
