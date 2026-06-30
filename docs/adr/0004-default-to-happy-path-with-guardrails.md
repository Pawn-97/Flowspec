# Default to happy path with guardrails

Flowspec will default to generating the selected flow's core happy path from entry point to success exit, while retaining guardrails such as validations, blocked prerequisites, external exits, and recovery notes as non-expanded constraints. This keeps the first downstream prototype focused on the most important chain and leaves alternate or recovery paths for explicit follow-up expansion.
