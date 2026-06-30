# Separate generate, review, and handoff artifact responsibilities

Flowspec v0.1 will keep workflow stages narrow: generation produces the source-of-truth JSON, validation and review produce internal audit artifacts, and handoff produces the downstream handoff folder. Generation will not eagerly render downstream handoff files or internal human-readable views.
