# Model prototype surface in source JSON

Flowspec will model shadcn-related prototype constraints in `ux-flow-spec.json` instead of only rendering them into Markdown. This keeps shadcn component mappings, block strategy, and skeleton selection validateable and testable while preserving `prototype-handoff.md` as a rendered view of the source-of-truth JSON.
