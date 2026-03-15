# 0003: Desktop Adapter

**Status**: Done  
**Date**: 2026-03-15  
**Author**: —  

**Scope (one job)**: Introduce a `DesktopAdapter` interface to decouple the Angular frontend from Electron, create `ElectronAdapter` and `TauriAdapter` (stub) implementations, and wire them via Angular DI. After this RFC, the frontend depends on an interface, not on `window.electronAPI` directly. **No service refactoring** in this RFC (that’s RFC 0004).

**Depends on**: RFC 0001 (Tauri shell), RFC 0002 (standalone build).

## Summary

Define a `DesktopAdapter` interface with `send`, `invoke`, `on`, `openExternal`, and `available`. Implement `ElectronAdapter` (full implementation mapping git channels to `window.electronAPI.git.*` and `gitEvents.*`) and `TauriAdapter` (stub: only `ping`/`get_app_version` work). Use a DI factory in `infrastructure.module.ts` to provide the correct adapter based on `window.__TAURI__`. `ElectronService` is kept but deprecated; services still inject it until RFC 0004.

## Motivation

- Decouple frontend from Electron-specific API shape.
- Enable Tauri as an alternative desktop shell without changing service logic (RFC 0004).
- Single abstraction for IPC: one interface, two adapters.

## Current Electron Coupling

| Component | Coupling |
|-----------|----------|
| **ElectronService** | Wraps `window.electronAPI.ipc` as `ipcRenderer.send/on/invoke`; has `onCD`, `openUrlExternal`, `available`; 13 services/components inject it |
| **RepoService** | Uses `window.electronAPI.git.*` (11 methods) and `window.electronAPI.gitEvents.*` (27 subscriptions), plus `settingsEvents.onEffectiveUpdated`, `autoFetchEvents.onTimeout` |
| **Broken usage** | 3 `sendSync` calls must become async `invoke` |

## Detailed Design

### DesktopAdapter Interface

```typescript
export interface DesktopAdapter {
  readonly available: boolean;
  send(channel: string, data?: unknown): void;
  invoke<T>(channel: string, data?: unknown): Promise<T>;
  on(channel: string, callback: (...args: unknown[]) => void): () => void;
  openExternal(url: string): Promise<void>;
}
```

### ElectronAdapter: git.* Channel Mapping

| adapter.send(channel, data) | ElectronAdapter calls | Arg mapping |
|-----------------------------|------------------------|-------------|
| `Repo-Open` | `git.openRepository(data.workingDir)` | `{ workingDir: string }` |
| `Repo-Init` | `git.initRepository(data.path)` | `{ path: string }` |
| `Repo-Browse` | `git.browseRepository()` | — |
| `Repo-InitBrowse` | `git.browseFolderForInit()` | — |
| `Repo-Close` | `git.closeRepository()` | — |
| `Repo-Fetch` | `git.fetch(data)` | `{ username, password }` |
| `Repo-Pull` | `git.pull(data)` | `{ username, password, option }` |
| `Repo-Push` | `git.push(data)` | `{ username, password, force?, name?, delete? }` |
| `Repo-CreateBranch` | `git.createBranch(data.name, data.commit)` | `{ name, commit }` |
| `Repo-Checkout` | `git.checkout(data.branch)` | `{ branch }` |
| `Repo-RemoveHistory` | `git.removeHistory(data.workingDir)` | `{ workingDir }` |

All other channels → `window.electronAPI.ipc.send(channel, data)`.

### ElectronAdapter: Event Channel Mapping

| adapter.on(channel, cb) | ElectronAdapter calls |
|-------------------------|------------------------|
| `Repo-OpenSuccessful` | `gitEvents.onOpenSuccessful(cb)` |
| `Repo-OpenFailed` | `gitEvents.onOpenFailed(cb)` |
| `Repo-Closed` | `gitEvents.onClosed(cb)` |
| `Repo-CurrentRemoved` | `gitEvents.onCurrentRemoved(cb)` |
| `Repo-CommitsUpdated` | `gitEvents.onCommitsUpdated(cb)` |
| `Repo-BranchChanged` | `gitEvents.onBranchChanged(cb)` |
| `Repo-BranchPositionRetrieved` | `gitEvents.onBranchPositionRetrieved(cb)` |
| `Repo-RemotesChanged` | `gitEvents.onRemotesChanged(cb)` |
| `Repo-FileStatusRetrieved` | `gitEvents.onFileStatusRetrieved(cb)` |
| `Repo-CredentialIssue` | `gitEvents.onCredentialIssue(cb)` |
| `Repo-Pulled` | `gitEvents.onPulled(cb)` |
| `Repo-PullFailed` | `gitEvents.onPullFailed(cb)` |
| `Repo-Pushed` | `gitEvents.onPushed(cb)` |
| `Repo-PushFailed` | `gitEvents.onPushFailed(cb)` |
| `Repo-Fetched` | `gitEvents.onFetched(cb)` |
| `Repo-FetchFailed` | `gitEvents.onFetchFailed(cb)` |
| `Repo-FolderSelected` | `gitEvents.onFolderSelected(cb)` |
| `Repo-InitPathSelected` | `gitEvents.onInitPathSelected(cb)` |
| `Repo-InitSuccessful` | `gitEvents.onInitSuccessful(cb)` |
| `Repo-InitFailed` | `gitEvents.onInitFailed(cb)` |
| `Repo-BlockingOperationBegan` | `gitEvents.onBlockingOperationBegan(cb)` |
| `Repo-BlockingOperationEnd` | `gitEvents.onBlockingOperationEnd(cb)` |
| `Repo-BlockingUpdate` | `gitEvents.onBlockingUpdate(cb)` |
| `Repo-BranchCreated` | `gitEvents.onBranchCreated(cb)` |
| `Repo-BranchCreateFailed` | `gitEvents.onBranchCreateFailed(cb)` |
| `Repo-TagCreated` | `gitEvents.onTagCreated(cb)` |
| `Repo-TagDeleted` | `gitEvents.onTagDeleted(cb)` |
| `Repo-RefRetrieved` | `gitEvents.onRefRetrieved(cb)` |
| `Settings-EffectiveUpdated` | `settingsEvents.onEffectiveUpdated(cb)` |
| `AutoFetch-Timeout` | `autoFetchEvents.onTimeout(cb)` |

Other channels → `window.electronAPI.ipc.on(channel, cb)`.

### ElectronAdapter: invoke

| adapter.invoke(channel, data) | ElectronAdapter calls |
|-------------------------------|------------------------|
| Git channels (above) | Not used for invoke (fire-and-forget via send) |
| All others | `window.electronAPI.ipc.invoke(channel, data)` |

### TauriAdapter (stub)

- `send` / `invoke` → `@tauri-apps/api/core.invoke(mapChannelToCommand(channel), data)`. Only `ping` and `get_app_version` exist; others log warning and reject.
- `on` → `@tauri-apps/api/event.listen(channel, handler)`; return unlisten function.
- `openExternal` → `@tauri-apps/api/shell.open` or Tauri shell plugin.

### DI Factory

```typescript
export function provideDesktopAdapter(): DesktopAdapter {
  if (typeof window !== 'undefined' && (window as any).__TAURI__) {
    return new TauriAdapter();
  }
  return new ElectronAdapter();
}
```

Provider in `infrastructure.module.ts`:

```typescript
{ provide: DESKTOP_ADAPTER, useFactory: provideDesktopAdapter }
```

## Deliverables

| # | Path | Purpose |
|---|------|---------|
| 1 | `src/renderer/app/infrastructure/desktop-adapter.ts` | `DesktopAdapter` interface + `DESKTOP_ADAPTER` InjectionToken |
| 2 | `src/renderer/app/infrastructure/electron-adapter.ts` | `ElectronAdapter` implementing `DesktopAdapter` |
| 3 | `src/renderer/app/infrastructure/tauri-adapter.ts` | `TauriAdapter` stub |
| 4 | `infrastructure.module.ts` | DI factory + `DESKTOP_ADAPTER` provider |
| — | `ElectronService` | Kept, deprecated (services still inject until RFC 0004) |

## Out of Scope

- Service refactoring (RepoService, etc.) — RFC 0004
- New Tauri commands beyond `ping` / `get_app_version`
- Converting `sendSync` → `invoke` in services (RFC 0004)

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Refactor services in same RFC | Single PR | Scope creep; harder to verify | Rejected |
| Single adapter + feature flags | Simpler DI | Still coupled to Electron shape | Rejected |
| **Interface + two adapters (chosen)** | Clean abstraction, testable | More files | **Selected** |

## Quality Gates

| # | Check | How to verify |
|---|--------|----------------|
| 1 | Electron path unchanged | `npm run dev` works exactly as before; `ElectronAdapter` selected |
| 2 | Tauri path works | `npm run tauri dev` selects `TauriAdapter`; `invoke('ping')` works through adapter |
| 3 | No service changes | Services still inject `ElectronService`; no refactor in this RFC |

## Implementation Plan

1. Create `desktop-adapter.ts`: interface + `DESKTOP_ADAPTER` token.
2. Create `electron-adapter.ts`: full implementation with git.* and gitEvents.* mapping tables.
3. Create `tauri-adapter.ts`: stub with `ping`/`get_app_version`; other channels warn and reject.
4. Add DI factory and `DESKTOP_ADAPTER` provider in `infrastructure.module.ts`.
5. Verify Electron path: `npm run dev` → behavior unchanged.
6. Verify Tauri path: `npm run tauri dev` → `invoke('ping')` works via adapter.

## Implementation Status

| Step | Status | Notes |
|------|--------|-------|
| 1. desktop-adapter.ts | [x] Done | |
| 2. electron-adapter.ts | [x] Done | |
| 3. tauri-adapter.ts | [x] Done | |
| 4. DI in infrastructure.module.ts | [x] Done | |
| 5. Verify Electron | [x] Done | |
| 6. Verify Tauri | [x] Done | |

## Status History

- **2026-03-15**: RFC created; scope limited to DesktopAdapter + adapters + DI wiring only.
