# 0006: Tauri Git Wiring (Adapter → Rust Commands)

**Status**: Done  
**Date**: 2026-03-15  
**Author**: —  

**Scope (one job)**: Wire the TauriAdapter's channel mappings to the Rust Git commands (from RFC 0005) and verify end-to-end Git workflows in Tauri mode. No new Rust commands; only frontend mapping and integration verification.

**Depends on**: RFC 0004 (service migration to DesktopAdapter), RFC 0005 (Rust Git core).

## Summary

Fill `TauriAdapter.mapChannelToCommand()` with all `Repo-*` channel → Tauri command mappings. Update Tauri capabilities for all Git commands. Verify each Angular service works in Tauri mode end-to-end for Git operations. Non-Git channels (Settings-*, CI-*, JIRA-*, etc.) remain out of scope and continue to log warnings.

## Motivation

- **Complete Tauri Git flow**: Angular services already use `adapter.send()` and `adapter.on()` via RFC 0004; this RFC ensures TauriAdapter routes those calls to the Rust commands from RFC 0005.
- **End-to-end verification**: Prove that open repo → commits → stage → commit → push/pull works in `npm run tauri dev`.
- **No regression**: Electron mode (`npm run dev`) must continue to work unchanged.

## Detailed Design

### Channel Mapping (TauriAdapter)

- `adapter.send('Repo-Open', data)` → `invoke('repo_open', data)`
- `adapter.on('Repo-OpenSuccessful', cb)` → `listen('Repo-OpenSuccessful', cb)`
- All `Repo-*` channels from RFC 0005's command surface map analogously.
- Non-Git channels: log warning, no mapping (out of scope).

### Mapping Table

| adapter.send(channel) | Tauri invoke(command) |
|-----------------------|------------------------|
| Repo-Open | repo_open |
| Repo-Close | repo_close |
| Repo-Init | repo_init |
| Repo-Fetch | repo_fetch |
| Repo-Pull | repo_pull |
| Repo-Push | repo_push |
| Repo-Stage | repo_stage |
| Repo-Unstage | repo_unstage |
| Repo-StageLines | repo_stage_lines |
| Repo-UnstageLines | repo_unstage_lines |
| Repo-Commit | repo_commit |
| Repo-CommitStaged | repo_commit_staged |
| Repo-Stash | repo_stash |
| Repo-Pop | repo_pop |
| Repo-Apply | repo_apply |
| Repo-DeleteStash | repo_delete_stash |
| Repo-DiscardAll | repo_discard_all |
| Repo-CreateBranch | repo_create_branch |
| Repo-Checkout | repo_checkout |
| Repo-DeleteBranch | repo_delete_branch |
| Repo-CreateTag | repo_create_tag |
| Repo-DeleteTag | repo_delete_tag |
| Repo-ResetHard | repo_reset_hard |
| Repo-ResetSoft | repo_reset_soft |
| Repo-GetCommit | repo_get_commit |
| Repo-GetFileDetail | repo_get_file_detail |

All corresponding `adapter.on(event)` subscriptions use `listen(event, cb)` for events emitted by Rust.

### Per-Service Verification Checklist

1. **RepoService**: Open repo → see commits → branch list → fetch/pull/push.
2. **CommitSelectionService**: Select commit → view detail → create/delete tag → delete branch.
3. **CommitChangeService**: Stage/unstage files → commit → stash/pop.
4. **CredentialsService**: Credential flow fires events (if credential paths implemented in RFC 0005).
5. **SubmodulesService**: Submodule names/details retrieved (if implemented in RFC 0005).
6. **HistoryService**: History change events propagate.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Merge with RFC 0005 | One RFC | Harder to verify incrementally | Rejected; split |
| **Separate wiring RFC** | Clear boundary; verify after backend ready | Two PRs | **Selected** |

## Testing Strategy

- **Manual**: `npm run tauri dev` → open real repo, see commits, stage, commit, push/pull.
- **Manual**: `npm run tauri build` → built app fully functional for Git.
- **Regression**: `npm run dev` (Electron) still works; no TauriAdapter changes affect ElectronAdapter.

## Timeline

| Milestone | Estimate |
|-----------|----------|
| Add all Repo-* mappings to TauriAdapter | 1 day |
| Update Tauri capabilities | 0.5 day |
| Verify RepoService end-to-end | 1 day |
| Verify CommitSelectionService | 0.5 day |
| Verify CommitChangeService | 0.5 day |
| Verify remaining services + fix payload mismatches | 1-2 days |
| Document verified flows | 0.5 day |
| **Total** | **~1-2 weeks** |

---

## Implementation Plan

1. **Add all Repo-* mappings to TauriAdapter.mapChannelToCommand()**: Map each `Repo-*` send channel to corresponding `invoke(command, data)`; ensure `adapter.on(event)` maps to `listen(event, cb)`.
2. **Update Tauri capabilities for all Git commands**: Add invoke permissions in `capabilities/default.json` for all repo_* commands.
3. **Verify RepoService end-to-end**: Open repo → commits load → branch list → fetch/pull/push.
4. **Verify CommitSelectionService**: Select commit → view detail → create/delete tag → delete branch.
5. **Verify CommitChangeService**: Stage/unstage → commit → stash/pop.
6. **Verify remaining services**: CredentialsService, SubmodulesService, HistoryService (as applicable).
7. **Fix payload shape mismatches**: If Rust emission differs from Angular expectations, align payloads (either in Rust or with adapters).
8. **Document verified flows**: Record which flows were tested and pass.

## Quality Gates

| # | Check | How to verify |
|---|--------|---------------|
| 1 | Tauri dev works | `npm run tauri dev` — open repo, see commits, stage, commit, push/pull |
| 2 | Tauri build works | `npm run tauri build` — built app fully functional for Git |
| 3 | Electron no regression | `npm run dev` (Electron) still works |
| 4 | Flows documented | All verified flows recorded |

## Implementation Status

| Step | Status | Notes |
|------|--------|-------|
| 1. Add Repo-* mappings | [x] Done | |
| 2. Update capabilities | [x] Done | |
| 3. Verify RepoService | [x] Done | |
| 4. Verify CommitSelectionService | [x] Done | |
| 5. Verify CommitChangeService | [x] Done | |
| 6. Verify remaining services | [x] Done | |
| 7. Fix payload mismatches | [x] Done | |
| 8. Document flows | [x] Done | |

## Status History

- **2026-03-15**: RFC created. Wiring and verification scope; depends on RFC 0004 and RFC 0005.
