# RFC (Request for Comments)

This directory contains RFCs for the Hetu project. RFCs are design documents that describe new features, architectural changes, and technical decisions.

## Principles

- **One RFC, one job**: Each RFC must address a single, well-scoped objective. Do not mix multiple independent initiatives (e.g. platform migration and Git implementation) in one RFC; split them into separate RFCs.
- **Detailed step-by-step plan**: Every RFC must include an **Implementation Plan** section with a numbered, concrete checklist (file paths, commands, order). The plan should be executable by someone without guessing; each step is one clear action.
- **Verify before moving on**: Each RFC has quality gates that must pass before the next RFC begins.

## Template

Use the following template for new RFCs:

```markdown
# XXXX: Title

**Status**: [Draft|Active|Accepted|Rejected|Superseded]  
**Date**: YYYY-MM-DD  
**Author**: Author Name  

**Scope (one job)**: One-sentence description of the single job this RFC covers.

## Summary

Brief description of the proposed change.

## Motivation

Why is this change needed? What problem does it solve?

## Detailed Design

Technical details of the implementation.

### Architecture

High-level architectural overview.

### Implementation Details

Specific implementation details.

## Alternatives Considered

What other approaches were considered and why were they rejected?

## Migration Strategy

How will existing code/users be migrated to the new approach?

## Testing Strategy

How will this change be tested?

## Timeline

Key milestones and estimated completion dates.

## Implementation Plan (Detailed Steps)

Numbered, concrete steps (file paths, commands, execution order). Each step = one actionable item.

## Quality Gates

Checks that must pass before this RFC is considered complete.

## Implementation Status

Checklist or table mapping step blocks to [ ] / [x] as work progresses.

## Open Questions

Unresolved questions that need discussion.
```

## Numbering Convention

RFCs are numbered sequentially starting from 0001. Use the next available number when creating a new RFC.

## Process

1. Create a new RFC file following the template
2. Submit for review and discussion
3. Update based on feedback
4. Mark as Accepted when implementation begins
5. Update status to Active during implementation
6. Archive when complete

## Current RFCs

### Completed (Phase 1–3) → `completed/`

| RFC | Title | One job |
|-----|-------|---------|
| [0001](./completed/0001-tauri-shell-scaffold.md) | Tauri Shell Scaffold | Scaffold src-tauri/, minimal commands, window loads Angular |
| [0002](./completed/0002-standalone-frontend-build.md) | Standalone Frontend Build | Decouple renderer build from electron-vite for Tauri |
| [0003](./completed/0003-desktop-adapter.md) | DesktopAdapter + Adapters | Adapter interface, ElectronAdapter, TauriAdapter stub, DI |
| [0004](./completed/0004-service-migration.md) | Frontend Service Migration | Refactor all 13 services from ElectronService to adapter |
| [0005](./completed/0005-rust-git-core.md) | Rust Git Core (git2) | Implement Git ops in Rust, expose as Tauri commands |
| [0006](./completed/0006-tauri-git-wiring.md) | TauriAdapter Git Wiring | Wire TauriAdapter to Rust Git commands, verify E2E |
| [0007](./completed/0007-credential-storage.md) | Credential Storage Migration | Migrate Electron safeStorage to Rust/OS keychain |
| [0008](./completed/0008-jira-ci-migration.md) | JIRA/CI Migration | Rewrite JIRA/AppVeyor integrations in Rust |
| [0009](./completed/0009-updater-cleanup.md) | Remove Electron | Delete Electron main/preload/Node deps (updater → 0012) |

### Phase 4: Distribution & UX

| RFC | Title | Status | One job | Depends on |
|-----|-------|--------|---------|------------|
| [0012](./0012-auto-updater.md) | Auto-Updater via GitHub Releases | Draft | Integrate tauri-plugin-updater with GitHub Releases endpoint | 0009 |
| [0013](./0013-file-watcher.md) | File Watcher & Live Updates | Draft | Real-time file watching via `notify` crate + open external file | 0005 |
| [0014](./0014-operation-progress.md) | Operation Progress Signals | Draft | Emit blocking-operation events for loading UX during fetch/pull/push | 0005 |
| [0015](./0015-ipc-cleanup.md) | IPC Cleanup & Legacy Removal | Draft | Remove dead IPC channels, stale services, fix event mismatches | 0009, 0013, 0014 |

### Phase 5: UX Enhancements

| RFC | Title | Status | One job | Depends on |
|-----|-------|--------|---------|------------|
| [0010](./0010-localization.md) | Localization (i18n) | Draft | Runtime i18n with Transloco, English + Chinese | — |
| [0011](./0011-theme-system.md) | Theme System | Draft | Light/Dark/System themes via CSS custom properties | — |
