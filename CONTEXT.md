# Flowspec

Flowspec compiles confirmed UX discovery into prototype-ready flow specifications for downstream prototype agents.

## Language

**Source-of-truth JSON**:
The authoritative FlowSpec artifact that controls generated screens, states, interactions, validation behavior, and out-of-scope boundaries. The canonical working copy is `flow-spec/ux-flow-spec.json`; handoff publishes a copy at `flow-spec/handoff/ux-flow-spec.json`.
_Avoid_: canonical markdown, master brief

**Downstream handoff folder**:
A dedicated output folder containing only the files a downstream prototype agent should read by default: `flow-spec/handoff/ux-flow-spec.json` and `flow-spec/handoff/prototype-handoff.md`.
_Avoid_: handoff files in root, delivery scatter

**Prototype handoff Markdown**:
A deterministic rendered view of `ux-flow-spec.json` for downstream prototype agents, including execution summary and agent instructions. It must not contain agent-polished facts that are absent from the source JSON.
_Avoid_: prototype brief draft, manually polished handoff, separate prototype agent prompt

**Implementation evidence**:
The downstream prototype agent's reported mapping from each FlowSpec component to the concrete UI it implemented, including any material deviations from the FlowSpec. It must not require a specific design system, component library, or frontend stack.
_Avoid_: shadcn evidence, trust-only implementation, unverifiable component choice

**Internal audit directory**:
A non-default output directory for preparation records, validation reports, review notes, full traceability, human-readable FlowSpec views, and revision history. Preparation files may still require user review, but they are not downstream handoff files.
_Avoid_: downstream package, delivery folder

**Prototype implementation guidance**:
Prototype-facing guidance that helps downstream agents preserve FlowSpec intent without prescribing a design system, component library, frontend stack, setup commands, or package-manager choices.
_Avoid_: shadcn handoff constraints, design system contract, frontend implementation plan, mandatory install script

**Prototype surface**:
The source-of-truth JSON section that describes downstream prototype boundaries such as skeleton choice, artifact expectations, and implementation guidance. It must not make shadcn or any other design system the required target.
_Avoid_: markdown-only handoff rules, implementation setup

**Implementation target**:
An optional downstream implementation hint for a concrete FlowSpec component, expressed in design-system-agnostic terms. It may describe the intended UI role or interaction shape, but it must not require a named library such as shadcn.
_Avoid_: shadcn target, component-library mandate, unspecified UI intent

**Artifact contract**:
The source-of-truth JSON section that declares which files belong to downstream handoff and which files belong to internal audit.
_Avoid_: undocumented output convention, scattered artifact list

**Acceptance contract**:
The source-of-truth JSON section that declares downstream implementation evidence requirements and acceptance checks.
_Avoid_: markdown-only checklist, unverifiable handoff requirements

**Happy path**:
The core successful user chain from entry point to success exit. It may include guardrails that keep the chain valid, but it does not expand alternate or recovery paths into full clickable flows by default.
_Avoid_: complete flow coverage, all branches

**Guardrail**:
A non-expanded constraint, validation, blocked prerequisite, external exit, or recovery note that affects whether the happy path is valid.
_Avoid_: full alternate path, secondary flow

**Candidate flow**:
A flow option extracted from UX-partner outputs at the granularity of one independently prototypeable user chain.
_Avoid_: page, button action, entire product area

**Path scope**:
The source-of-truth JSON section that declares branch coverage for a candidate or generated FlowSpec, such as `happy_path` by default or an explicitly requested recovery path.
_Avoid_: implicit branch coverage, full-flow assumption

**Path role**:
A per-screen classification that states whether a screen is a `happy_path_step`, `guardrail_state`, `requested_expansion`, or `out_of_scope_reference`.
_Avoid_: unclassified screen, hidden branch expansion

**Draft skeleton**:
A reusable prototype structure documented under `docs/skeletons/` for review but not applied as a default until the user approves it.
_Avoid_: default skeleton, enforced layout

**Skeleton status**:
The prototype surface value that states whether no skeleton is used, a skeleton is still `draft_pending_user_approval`, or a skeleton is `approved_default`.
_Avoid_: implicit skeleton default, unreviewed default layout

**Skeleton extraction source**:
A temporary design reference used to extract a reusable prototype skeleton. Once the skeleton is documented and approved, the source link is no longer part of the FlowSpec contract.
_Avoid_: permanent design dependency, runtime reference
