# AGENTS.md Contract

This file defines the agent contract and serves as the index to project guidance. It applies repo-wide unless overridden by a nested `AGENTS.md`.

## Steering Documents
- Purpose: Treat Steering as the first-party source for product, technical, and structural guidance.
- Location: `.kiro/steering/product.md`, `.kiro/steering/tech.md`, `.kiro/steering/structure.md`.
- Access: Use repository-provided helpers to resolve paths; avoid hardcoded absolutes.
- Mutations: Treat Steering as read-only; follow the established change-management flow instead of ad-hoc edits.
- Usage: Summarize applicable Steering points in outputs; cite the specific file/section without restating details.
- Gaps: If a required Steering file or section is missing, surface that gap and avoid filling it with generic assumptions unless explicitly directed.

## Decision Precedence
1) Steering documents under ".kiro/steering/*.md"
2) This AGENTS.md contract (general repository conventions)
3) Generic assumptions (avoid unless explicitly allowed)

## Agent Behavior Contract
- Prefer project-provided abstractions for CLI operations; avoid ad-hoc process spawning when wrappers exist.
- Respect feature flags and configuration gating documented in Steering or related code references.
- Logging: Use the shared logging utilities; record key lifecycle and error paths without excess noise.
- Error handling: Route failures through centralized services/utilities rather than ad-hoc try/catch loops.
- Performance/UX: Honor project guidelines for long-running work so the host environment remains responsive.
- Reference Steering for specifics (naming, boundaries, directory layout) rather than restating them here.

## Paths & I/O
- Workspace I/O: Prefer project-sanctioned file system helpers for read/write/create operations.
- Path resolution: Use repository-approved path utilities for `.kiro/steering` and related directories; avoid absolute paths.
- Write boundaries: Only modify files within approved workspace areas defined by project rules.
- Steering: Do not overwrite files under `.kiro/steering` directly; rely on the sanctioned update flow.

## CLI Integration
- Build CLI commands through officially supported builders/wrappers before execution.
- Approval modes and model flags: Reference their definition sites/tests without duplicating values.
- Verify required tooling availability before invocation; surface setup guidance if unavailable.

## Submission Checklist (For Agents)
- Verified decisions against `.kiro/steering/*.md`; cited files/sections without duplication.
- Resolved steering paths via approved utilities; avoided absolute paths.
- Respected feature flags and constraints documented by the project.
- Used project-sanctioned wrappers for CLI interactions.
- Avoided restating Steering or code constants; kept `AGENTS.md` concise and index-like.

## Non-Goals / Anti-Patterns
- Do not bypass official wrappers/utilities for CLI calls when they exist.
- Do not store state in globals beyond established singletons.
- Do not write outside approved directories or overwrite Steering directly.
- Do not re-enable disabled features unless explicitly requested.
