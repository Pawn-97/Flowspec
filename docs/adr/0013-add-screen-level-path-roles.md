# Add screen-level path roles

Flowspec v0.1 will keep `path_scope` at the top level and add a per-screen `path_role` to classify each screen as `happy_path_step`, `guardrail_state`, `requested_expansion`, or `out_of_scope_reference`. This lets validation detect scope creep when a default happy-path FlowSpec accidentally expands recovery or alternate paths into full prototype screens without adding a larger taxonomy before it is needed.
