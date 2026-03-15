# 0004: Service Migration (ElectronService → DesktopAdapter)

**Status**: Done  
**Date**: 2026-03-15  
**Author**: —  

**Scope (one job)**: Refactor all Angular services from depending on `ElectronService` (and direct `window.electronAPI` calls) to using the `DesktopAdapter` interface (from RFC 0003). After this RFC, no Angular service references `ElectronService` or `window.electronAPI` directly.

**Depends on**: RFC 0003 (DesktopAdapter + adapters).

## Summary

Replace `ElectronService` injection across 13 services/components with `DESKTOP_ADAPTER` token and `DesktopAdapter` interface. Convert `ipcRenderer.send` → `adapter.send`, `onCD` → `adapter.on` (with `NgZone.run`), `openUrlExternal` → `adapter.openExternal`. Fix 3 broken `sendSync` calls by converting to `adapter.invoke`. Remove `ElectronService` and `TauriBridgeService` from providers; update tests to mock `DESKTOP_ADAPTER`.

## Motivation

- Complete the decoupling started in RFC 0003: frontend depends solely on `DesktopAdapter`, not Electron.
- Enable Tauri as an alternative desktop shell with a single code path.
- Remove deprecated `ElectronService` and redundant `TauriBridgeService`.
- Fix broken `sendSync` usage by migrating to async `invoke`.

## Context — Services to Migrate

13 services/components currently depend on `ElectronService` or `window.electronAPI`:

| Service/Component | send channels | onCD channels |
|---|---|---|
| RepoService | 11 methods via `window.electronAPI.git.*` | gitEvents.* (27 events) + settingsEvents (1) + autoFetchEvents (1) |
| CredentialsService | Repo-SetCred | Repo-OpenSuccessful, Settings-EffectiveUpdated, Repo-UsernameRetrieved, Repo-PasswordRetrieved, Repo-SSHKeyRequired |
| CommitSelectionService | Repo-GetFileDetail, Repo-GetCommit, Repo-OpenExternalFile, Repo-ResetHard, Repo-ResetSoft, Repo-CreateTag, Repo-DeleteTag, Repo-DeleteBranch, Repo-UnsubscribeFileUpdate | Repo-CommitDetailRetrieved, Repo-FileStatusRetrieved, Repo-FileDetailRetrieved, Repo-BranchDeleted, Repo-BranchDeleteFailed, Repo-LiveUpdateFileNotFound, Repo-Closed, Repo-OpenSuccessful |
| CommitChangeService | Repo-Stage, Repo-StageLines, Repo-Unstage, Repo-UnstageLines, Repo-Commit, Repo-CommitStaged, Repo-Stash, Repo-Pop, Repo-Apply, Repo-DeleteStash, Repo-DiscardAll | Repo-Committed, Repo-CommitFail, Settings-EffectiveUpdated, Repo-StashFailed, Repo-PopFailed, Repo-Stashed, Repo-Popped |
| SubmodulesService | Repo-GetSubmoduleDetails | Repo-SubmoduleNamesRetrieved, Repo-SubmoduleDetailsRetrieved |
| HistoryService | — | Repo-HistoryChanged |
| SettingsService | Settings-Init, Settings-Set, Settings-SetSecureRepo, Secure-ClearCache | Settings-Updated, Secure-CacheCleared, Secure-ClearCacheFailed |
| LayoutService | — | Settings-EffectiveUpdated |
| UpdaterService | Updater, Updater-Check, commence-download, commence-install-update | Updater-Checking |
| JiraIntegrationService | JIRA-GetIssue, JIRA-AddComment, JIRA-UpdateIssue, JIRA-GetAssignableUsers, JIRA-AssignIssue, JIRA-AddSubtask, JIRA-SearchIssues, JIRA-RepoChanged | Settings-EffectiveUpdated, JIRA-IssueRetrieved, JIRA-ResolutionsRetrieved, JIRA-IssueTypesRetrieved, JIRA-Error, JIRA-Timeout, JIRA-OperationFailed, JIRA-NotFound, JIRA-CAPTCHARequired, JIRA-AssignableUsersRetrieved, JIRA-IssueQueryResultRetrieved |
| AppveyorCiService | Shell-Open, CI-AppVeyorGetLog, CI-AppVeyorRebuild | Settings-EffectiveUpdated, CI-BuildsRetrieved, CI-AppVeyorLogNotFound, CI-AppVeyorLogRetrieved, CI-AppVeyorRebuilded, CI-AppVeyorRebuildFailed |
| CiIntegrationService | CI-RepoChanged | Settings-EffectiveUpdated, CI-RequestError, CI-QueryBegan, CI-BuildsRetrieved |
| CacheService | — | Cache-AutoCleanBegin, Cache-AutoCleanSuccess |
| AboutPageComponent | Shell-Open | — |

## Migration Pattern (per service)

1. Replace `private electron: ElectronService` injection with `@Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter`
2. For services using `onCD`: add `private zone: NgZone` injection (equivalent to ElectronService.onCD's zone.run)
3. Replace `this.electron.ipcRenderer.send(channel, data)` → `this.adapter.send(channel, data)`
4. Replace `this.electron.onCD(channel, handler)` → `this.adapter.on(channel, (...args) => this.zone.run(() => handler(...args)))`
5. Replace `this.electron.openUrlExternal(url)` → `this.adapter.openExternal(url)`

## RepoService Special Case

- Replace `window.electronAPI.git.openRepository(workingDir)` → `this.adapter.send('Repo-Open', { workingDir })`
- Replace `window.electronAPI.gitEvents.onOpenSuccessful(cb)` → `this.adapter.on('Repo-OpenSuccessful', cb)`
- All 11 `git.*` methods map to `adapter.send(channel, data)` per ElectronAdapter mapping in RFC 0003
- All 27 `gitEvents.*` + `settingsEvents` + `autoFetchEvents` map to `adapter.on(channel, cb)`

## Fix 3 Broken sendSync Calls

| Location | Current | Replacement |
|----------|---------|-------------|
| `commit-selection.service.ts` L127 | `sendSync('Repo-SubscribeFileUpdate', ...)` | `await this.adapter.invoke('Repo-SubscribeFileUpdate', ...)` |
| `settings.service.ts` L60 | `sendSync('Settings-BrowseFile')` | `await this.adapter.invoke('Settings-BrowseFile')` |
| `settings.service.ts` L76 | `sendSync('Settings-GetSecureRepo', ...)` | `await this.adapter.invoke('Settings-GetSecureRepo', ...)` |

## Final Cleanup

- Remove `ElectronService` from `infrastructure.module.ts` providers
- Remove `TauriBridgeService` (superseded by TauriAdapter in RFC 0003)
- Update Angular tests: mock `DESKTOP_ADAPTER` instead of `ElectronService`

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Migrate all at once | Single PR | Risky; hard to bisect | Rejected |
| **Incremental per service (chosen)** | Verify each step; easier rollback | More commits | **Selected** |
| Keep ElectronService as facade | Fewer changes | Still coupled to Electron | Rejected |

## Testing Strategy

- Manual: `npm run dev` (Electron) — full app works; all operations functional
- Unit: All existing Angular tests pass with `DESKTOP_ADAPTER` mock
- Manual: `npm run tauri dev` — window opens, TauriAdapter selected; Git operations show "not implemented" (expected)
- Grep: No references to `ElectronService` or `window.electronAPI` remain in services

## Quality Gates

| # | Check | How to verify |
|---|--------|----------------|
| 1 | Electron path works | `npm run dev` — full app functional |
| 2 | Tests pass | All Angular tests pass with adapter mocks |
| 3 | No Electron coupling | No `ElectronService` or `window.electronAPI` in services |
| 4 | Tauri path works | `npm run tauri dev` — window opens; TauriAdapter selected |

---

## Implementation Plan

### Suggested Migration Order (verify after each)

1. **RepoService** — heaviest: 11 methods, 29 events
2. **CommitChangeService**
3. **CommitSelectionService** + fix sendSync (Repo-SubscribeFileUpdate)
4. **CredentialsService**
5. **SettingsService** + fix sendSync (Settings-BrowseFile, Settings-GetSecureRepo)
6. **Remaining services**: SubmodulesService, HistoryService, LayoutService, UpdaterService, JiraIntegrationService, AppveyorCiService, CiIntegrationService, CacheService
7. **AboutPageComponent**
8. **Cleanup**: Remove ElectronService from providers; remove TauriBridgeService; update tests to mock DESKTOP_ADAPTER

### Detailed Checklist

1. Migrate RepoService: inject `DESKTOP_ADAPTER`, replace all `window.electronAPI.git.*` and `gitEvents.*` with `adapter.send`/`adapter.on`.
2. Migrate CommitChangeService.
3. Migrate CommitSelectionService; convert `sendSync('Repo-SubscribeFileUpdate')` to `await adapter.invoke`.
4. Migrate CredentialsService.
5. Migrate SettingsService; convert `sendSync('Settings-BrowseFile')` and `sendSync('Settings-GetSecureRepo')` to `await adapter.invoke`.
6. Migrate SubmodulesService.
7. Migrate HistoryService.
8. Migrate LayoutService.
9. Migrate UpdaterService.
10. Migrate JiraIntegrationService.
11. Migrate AppveyorCiService.
12. Migrate CiIntegrationService.
13. Migrate CacheService.
14. Migrate AboutPageComponent.
15. Remove `ElectronService` from `infrastructure.module.ts` providers.
16. Remove `TauriBridgeService` (if present) and its usages.
17. Update Angular test specs: provide `{ provide: DESKTOP_ADAPTER, useValue: mockAdapter }` instead of mocking ElectronService.
18. Run `grep -r "ElectronService\|window\.electronAPI" src/renderer` — expect no matches in services.
19. Verify `npm run dev` — full app works.
20. Verify `npm run tauri dev` — window opens; TauriAdapter selected.

## Implementation Status

| Step | Status | Notes |
|------|--------|-------|
| 1. RepoService | [x] Done | |
| 2. CommitChangeService | [x] Done | |
| 3. CommitSelectionService + sendSync | [x] Done | |
| 4. CredentialsService | [x] Done | |
| 5. SettingsService + sendSync | [x] Done | |
| 6–13. Remaining services | [x] Done | |
| 14. AboutPageComponent | [x] Done | |
| 15–17. Cleanup | [x] Done | |
| 18–20. Verify | [x] Done | |

## Status History

- **2026-03-15**: RFC created; scope limited to service migration from ElectronService to DesktopAdapter.
