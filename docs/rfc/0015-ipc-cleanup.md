# 0015: IPC Cleanup & Legacy Channel Removal

**Status**: Draft  
**Date**: 2026-03-15  
**Author**: —

**Scope (one job)**: Remove dead IPC channels that no longer have backend handlers, consolidate unused event constants, and clean up frontend services that depend on removed Electron-only features (cache auto-clean, release notes window, submodule stubs).

## Summary

After the Tauri migration (RFCs 0001–0009) and the subsequent gap-filling work, several IPC channels in `ipc-events.ts` are dead — they have frontend constants defined but no Rust backend handler, and some have no meaningful frontend consumer either. This RFC removes or stubs these channels, cleans up the associated Angular services, and updates RFC 0009's status to reflect the completed Electron removal.

## Motivation

- **Dead code**: 15+ IPC channel constants exist in `ipc-events.ts` that go nowhere. Developers reading the code may incorrectly assume these features work.
- **Unused services**: `CacheService` listens for events that will never fire. `ReleaseNoteComponent` has an empty `ngOnInit()`. `SubmodulesService` listens for events from a backend that was always a stub.
- **RFC 0009 status**: The Electron removal is complete but RFC 0009 still says "Deferred". It should be updated to reflect reality.

## Detailed Design

### Channels to Remove from `ipc-events.ts`

These channels have **no Rust backend handler** and **no meaningful frontend consumer** (or the consumer is a stub):

| Channel Constant | Value | Reason for Removal |
|---|---|---|
| `CACHE.AUTO_CLEAN_BEGIN` | `Cache-AutoCleanBegin` | No Rust cache cleanup impl; `CacheService` only shows toasts |
| `CACHE.AUTO_CLEAN_SUCCESS` | `Cache-AutoCleanSuccess` | Same as above |
| `RELEASE_NOTES.GET` | `ReleaseNote-Get` | No release notes window in Tauri; component is empty |
| `RELEASE_NOTES.RETRIEVED` | `ReleaseNote-Retrieved` | Same as above |
| `REPO.SUBMODULE_NAMES_RETRIEVED` | `Repo-SubmoduleNamesRetrieved` | Never emitted; Electron impl was an empty stub |
| `REPO.SUBMODULE_DETAILS_RETRIEVED` | `Repo-SubmoduleDetailsRetrieved` | Same as above |
| `REPO.GET_SUBMODULE_DETAILS` | `Repo-GetSubmoduleDetails` | Same as above |

### Channels to Remove After RFC 0012 (Auto-Updater)

These become dead once the updater is rewritten to use the plugin API directly:

| Channel Constant | Value | Reason |
|---|---|---|
| `UPDATER.CHECK` | `Updater-Check` | Replaced by `@tauri-apps/plugin-updater` direct API |
| `UPDATER.CHECKING` | `Updater-Checking` | Same |

**Note**: These should be removed as part of RFC 0012 implementation, not this RFC. Listed here for tracking.

### Channels to Keep (have handlers or are actively needed)

All `REPO.*`, `SETTINGS.*`, `AUTO_FETCH.*`, `CI.*`, `JIRA.*`, `SECURE.*`, `SHELL.*` channels that have corresponding Rust commands — these stay.

### Services to Clean Up

| Service / Component | Action |
|---|---|
| `CacheService` (`cache.service.ts`) | Remove service entirely — no backend emits these events |
| `ReleaseNoteComponent` | Remove component + module registration — empty shell |
| `SubmodulesService` (`submodules.service.ts`) | Keep the service interface but mark as not-yet-implemented. Remove event listeners (they'll never fire). Add TODO comments for future git2 submodule support. |
| `SubmoduleDetailsPanelComponent` | Keep component but show "Coming soon" placeholder |

### RFC 0009 Status Update

RFC 0009 was titled "Auto-Updater + Final Cleanup" with status "Deferred". The reality:
- **Electron removal**: Completed (src/main, src/preload, electron configs all deleted).
- **Auto-updater**: Moved to RFC 0012.
- **Action**: Update RFC 0009 status to "Done (Partially Superseded by RFC 0012)" and note the completion of items 4-6 (Electron removal).

### Minor Event Fixes

| Issue | Fix |
|---|---|
| JIRA `jira_add_comment` emits `JIRA-IssueRetrieved` | Change to emit `Jira-CommentAdded` to match `IPC_EVENTS.JIRA.COMMENT_ADDED` |
| `get_stored_credentials` returns single JSON | Frontend `credentials.service.ts` may need adjustment if it expects two separate events (`Repo-UsernameRetrieved` + `Repo-PasswordRetrieved`) — verify and fix |

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Remove dead channels now | Clean codebase, no confusion | Minor risk of removing something used | **Accepted** — verified thoroughly |
| Keep channels as "reserved" | No risk of breaking anything | Dead code confuses developers | Rejected |
| Remove everything including submodules UI | Cleanest | Loses placeholder for future feature | Rejected — keep stubs |

## Migration Strategy

- **No user-facing changes** — removed features (cache auto-clean, release notes window) were already non-functional in Tauri mode.
- Frontend services that are removed must also be unregistered from their Angular modules (`InfrastructureModule`, `CoreModule`, `AppModule`).
- Submodule UI stays but shows a disabled/placeholder state.

## Testing Strategy

| Test | How |
|------|-----|
| Build succeeds | `cargo check` + `pnpm desktop:build` |
| No runtime errors | Open app, navigate all panels, no console errors |
| Settings page works | Open Settings → all tabs load correctly |
| Submodule panel shows placeholder | Open repo with submodules → panel shows "Coming soon" |
| JIRA comment event | Add JIRA comment → verify `Jira-CommentAdded` received by frontend |

## Timeline

| Milestone | Estimate |
|-----------|----------|
| Remove dead IPC channels + CACHE/RELEASE_NOTES sections | 0.5 day |
| Remove CacheService + ReleaseNoteComponent | 0.5 day |
| Stub SubmodulesService | 0.5 day |
| Fix JIRA comment event | 0.5 day |
| Update RFC 0009 status | 0.5 hour |
| Testing | 0.5 day |
| **Total** | **~2.5 days** |

---

## Implementation Plan (Detailed Steps)

### 1. Remove Dead IPC Channel Constants

1.1. In `apps/desktop/src/renderer/app/infrastructure/ipc-events.ts`:
- Remove the entire `CACHE` const block and its entry in `IPC_EVENTS`.
- Remove the entire `RELEASE_NOTES` const block and its entry in `IPC_EVENTS`.
- Remove `REPO.GET_SUBMODULE_DETAILS`, `REPO.SUBMODULE_DETAILS_RETRIEVED`, `REPO.SUBMODULE_NAMES_RETRIEVED` from the `REPO` const.

### 2. Remove CacheService

2.1. Delete `apps/desktop/src/renderer/app/infrastructure/cache.service.ts`.  
2.2. Delete `apps/desktop/src/renderer/app/infrastructure/__tests__/cache.service.spec.ts`.  
2.3. In `infrastructure.module.ts`: remove `CacheService` from `providers` array and import.  
2.4. In `app.component.ts`: remove `CacheService` injection and `this.cacheService.init()` call.

### 3. Remove ReleaseNoteComponent

3.1. Delete `apps/desktop/src/renderer/app/infrastructure/release-note/` directory.  
3.2. In `infrastructure.module.ts`: remove `ReleaseNoteComponent` from `declarations` and import.  
3.3. In `app.module.ts`: remove any `ReleaseNoteComponent` references.  
3.4. Search for `<app-release-note>` in templates and remove.

### 4. Stub SubmodulesService

4.1. In `apps/desktop/src/renderer/app/core/services/submodules.service.ts`:
- Remove the `adapter.on(SUBMODULE_NAMES_RETRIEVED, ...)` and `adapter.on(SUBMODULE_DETAILS_RETRIEVED, ...)` listeners.
- Keep `selectSubmodule()` and `getSubmoduleDetails()` methods but make `getSubmoduleDetails` a no-op with a `console.warn('Submodule support not yet implemented')`.

4.2. In `submodule-details-panel.component.html`: add a "Submodule support coming soon" message when no data available.

### 5. Fix JIRA Comment Event

5.1. In `apps/desktop/src-tauri/src/commands/jira.rs`:
- Find `jira_add_comment` command.
- Change emitted event from `JIRA-IssueRetrieved` to `Jira-CommentAdded`.

### 6. Verify Credential Events

6.1. In `apps/desktop/src/renderer/app/core/services/credentials.service.ts`:
- Check if service listens for `Repo-UsernameRetrieved` and `Repo-PasswordRetrieved` separately.
- If yes, and `get_stored_credentials` returns a single `{ username, password }` JSON, update the service to handle the single-response pattern OR update the Rust command to emit two events.

### 7. Update RFC 0009

7.1. In `docs/rfc/0009-updater-cleanup.md`:
- Change status from "Deferred" to "Done (updater → RFC 0012)".
- Update the checklist: mark items 4-6 (Electron removal) as complete.
- Add note that updater implementation is tracked in RFC 0012.

### 8. Update RFC README Table

8.1. In `docs/rfc/README.md`:
- Change RFC 0009 status from "Deferred" to "Done" with note "(updater → 0012)".

### 9. Verify

9.1. `cargo check` — no errors.  
9.2. `pnpm desktop:build` — no errors.  
9.3. Run app, navigate all panels, check browser console for errors.

## Quality Gates

| # | Check | How to verify |
|---|-------|---------------|
| 1 | Rust compiles | `cargo check` no errors |
| 2 | Frontend builds | `pnpm desktop:build` no errors |
| 3 | No runtime errors | App starts, all panels load |
| 4 | Dead channels removed | `grep -r "Cache-AutoClean\|ReleaseNote-" src/renderer/` returns nothing |
| 5 | JIRA comment event correct | Add comment via JIRA panel → frontend receives `Jira-CommentAdded` |
| 6 | RFC 0009 updated | Status reflects completed Electron removal |

## Implementation Status

| Step | Status | Notes |
|------|--------|-------|
| 1. Remove dead IPC channels | [ ] | |
| 2. Remove CacheService | [ ] | |
| 3. Remove ReleaseNoteComponent | [ ] | |
| 4. Stub SubmodulesService | [ ] | |
| 5. Fix JIRA comment event | [ ] | |
| 6. Verify credential events | [ ] | |
| 7. Update RFC 0009 | [ ] | |
| 8. Update RFC README | [ ] | |
| 9. Verify | [ ] | |

## Open Questions

1. Should `SubmodulesService` be fully removed instead of stubbed? If submodule support is planned for git2, keeping the UI skeleton saves work later.
2. Should we also clean up the `UPDATER` channels now, or wait for RFC 0012 to be implemented first?
3. Are there any third-party integrations that rely on the cache auto-clean events (e.g., AppVeyor response caching)?
