# Keep admin portal skeleton draft until approved

Flowspec will document an admin portal skeleton as a reviewable draft at `docs/skeletons/admin-portal.md` before using it as a default for B2B admin prototypes. The provided Admin portal keyscreen Figma link is a temporary extraction source for deriving the skeleton, not a permanent reference that future FlowSpecs must carry. Figma extraction is intentionally deferred until the v0.1 design boundary is settled, so the skeleton draft can be implemented alongside schema, handoff, workflow, and test changes. The draft skeleton should be structured for prototype-agent execution, covering status, page shell, navigation model, content regions, implementation guidance, component mapping, layout rules, and open review questions rather than visual design specification. This lets the user inspect the sidebar, top bar, content regions, implementation guidance, and mapping rules before future FlowSpecs automatically set `skeleton_id` to `admin-portal`.

Skeleton status is limited to `none`, `draft_pending_user_approval`, or `approved_default`.

When a skeleton is `draft_pending_user_approval`, downstream handoff may expose it as reference-only guidance, but prototype agents must not treat it as an approved default until the user explicitly approves it.
