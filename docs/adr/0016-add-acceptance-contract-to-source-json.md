# Add acceptance contract to source JSON

Flowspec v0.1 will add `acceptance_contract` to `ux-flow-spec.json` so downstream implementation evidence requirements and acceptance checks are source-controlled, validateable, and renderable into `prototype-handoff.md`. This keeps prototype coverage verification in the FlowSpec contract without requiring Flowspec to inspect downstream prototype code.

Acceptance checks should use fixed enum identifiers for core checks, with optional notes or additional text checks only when a flow needs extra review criteria.
