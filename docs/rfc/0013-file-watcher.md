# 0013: File Watcher & Live Updates

**Status**: Draft  
**Date**: 2026-03-15  
**Author**: —

**Scope (one job)**: Implement real-time file system watching in Rust using the `notify` crate, expose subscribe/unsubscribe commands, and emit live file-detail updates to the Angular frontend.

## Summary

The Electron backend used `chokidar` (Node.js) to watch files for changes and push updated diffs to the frontend in real time. This RFC replaces that with `notify` (Rust crate) running as a background thread in the Tauri backend. The frontend's `CommitSelectionService` already calls `Repo-SubscribeFileUpdate` / `Repo-UnsubscribeFileUpdate` — the Rust backend just needs to implement the handlers.

## Motivation

- When a user selects a file in the diff view, the panel should auto-refresh when the file changes on disk (e.g., editing in an external editor).
- Without the watcher, the user must manually re-select files to see updated diffs — this breaks a core workflow.
- The `CommitSelectionService.subscribeLiveFileUpdate()` and `unsubscribeFileUpdate()` methods are already wired in the frontend, sending IPC events that currently go nowhere.

## Detailed Design

### Architecture

```
┌──────────────────────────────────────────────────────┐
│  Angular Frontend                                     │
│                                                       │
│  CommitSelectionService                               │
│    → send(SUBSCRIBE_FILE_UPDATE, {file, commit})      │
│    ← on(FILE_DETAIL_RETRIEVED, diff)    auto-refresh  │
│    → send(UNSUBSCRIBE_FILE_UPDATE, {id})              │
└──────────────────────────┬───────────────────────────┘
                           │ Tauri IPC
┌──────────────────────────▼───────────────────────────┐
│  Tauri Backend (Rust)                                 │
│                                                       │
│  commands/repo_file.rs                                │
│    repo_subscribe_file_update(file, commit, fullFile) │
│      → spawns notify::Watcher on workdir/file         │
│      → on change: re-runs get_file_detail()           │
│      → emits Repo-FileDetailRetrieved                 │
│      → returns subscription ID                        │
│    repo_unsubscribe_file_update(id)                   │
│      → drops watcher for that ID                      │
│                                                       │
│  state.rs                                             │
│    file_watchers: HashMap<String, WatcherHandle>      │
└──────────────────────────────────────────────────────┘
```

### Rust Dependency

```toml
# Cargo.toml
notify = { version = "7", default-features = false, features = ["macos_fsevent"] }
```

The `notify` crate provides cross-platform file system events (FSEvents on macOS, inotify on Linux, ReadDirectoryChangesW on Windows).

### State Extension

```rust
// state.rs — add to AppState
pub struct WatcherHandle {
    pub cancel: Arc<AtomicBool>,
}

pub struct AppState {
    pub repo: Mutex<Option<Repository>>,
    pub auto_fetch_running: Arc<AtomicBool>,
    pub file_watchers: Mutex<HashMap<String, WatcherHandle>>,
}
```

### Commands

**`repo_subscribe_file_update`**:
1. Generate a unique subscription ID (UUID).
2. Resolve the full file path from `repo.workdir() + file`.
3. Create a `notify::recommended_watcher` watching the file path.
4. On file change event (Modify/Create), re-run `git::diff::get_file_detail()` and emit `Repo-FileDetailRetrieved`.
5. Store the watcher handle + cancel flag in `state.file_watchers`.
6. Return the subscription ID to the frontend.

**`repo_unsubscribe_file_update`**:
1. Look up the subscription ID in `state.file_watchers`.
2. Set the cancel flag, drop the watcher.
3. Remove from the map.

### Debouncing

File editors often trigger multiple rapid writes. The watcher should debounce events with a 300ms window before re-computing the diff, avoiding unnecessary work. `notify` supports a built-in debouncer via `notify_debouncer_mini`.

### Error Handling

- If the watched file is deleted: emit `Repo-LiveUpdateFileNotFound` event.
- If the watcher fails to start (permissions, path not found): return error to frontend.
- On `repo_close`: all active watchers must be cleaned up.

### Open External File

The `Repo-OpenExternalFile` IPC channel is also missing. This should open the file in the system's default editor. Implementation:

```rust
#[tauri::command]
pub fn repo_open_external_file(
    state: State<'_, AppState>,
    payload: OpenExternalFilePayload,
) -> Result<(), String> {
    let guard = state.repo.lock();
    let repo = guard.as_ref().ok_or("No repository open")?;
    let workdir = repo.workdir().ok_or("No working directory")?;
    let full_path = workdir.join(&payload.file);
    open::that(&full_path).map_err(|e| e.to_string())
}
```

This uses the `open` crate (already a transitive dep of Tauri) to launch the OS default application.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| `notify` crate (Rust) | Native, cross-platform, no Node.js | Additional Rust dependency | **Accepted** |
| `tauri-plugin-fs-watch` | Pre-built Tauri plugin | Less control, may not support debouncing | Rejected — `notify` is more flexible |
| Polling (periodic re-read) | Simple, no extra deps | Wasteful CPU, delayed updates | Rejected |
| Frontend-only polling via invoke | No new backend state | High IPC overhead, not real-time | Rejected |

## Migration Strategy

- No frontend changes needed — `CommitSelectionService` already sends the correct IPC events.
- The `TauriAdapter` COMMAND_OVERRIDES needs entries for `Repo-SubscribeFileUpdate` → `repo_subscribe_file_update` and `Repo-UnsubscribeFileUpdate` → `repo_unsubscribe_file_update`.
- On `repo_close`, all file watchers must be dropped to prevent orphaned watchers.

## Testing Strategy

| Test | How |
|------|-----|
| Subscribe succeeds | Open repo, select file in diff view → verify subscription ID returned |
| Live update fires | Edit file externally → verify diff panel updates within 1s |
| Unsubscribe stops updates | Unsubscribe → edit file → verify no update emitted |
| File deleted | Delete watched file → verify `Repo-LiveUpdateFileNotFound` emitted |
| Repo close cleanup | Close repo → verify all watchers dropped (no leaked threads) |
| Open external file | Send `Repo-OpenExternalFile` → verify file opens in default editor |

## Timeline

| Milestone | Estimate |
|-----------|----------|
| Add `notify` dep, extend state | 0.5 day |
| Implement subscribe/unsubscribe commands | 1 day |
| Debounce + error handling | 0.5 day |
| Open external file command | 0.5 day |
| Wire TauriAdapter overrides | 0.5 day |
| Testing | 0.5 day |
| **Total** | **~3 days** |

---

## Implementation Plan (Detailed Steps)

### 1. Add Dependencies

1.1. In `apps/desktop/src-tauri/Cargo.toml`, add:
```toml
notify = { version = "7", default-features = false, features = ["macos_fsevent"] }
notify-debouncer-mini = "0.5"
open = "5"
```

### 2. Extend AppState

2.1. In `apps/desktop/src-tauri/src/state.rs`:
- Add `use std::collections::HashMap;`
- Add `WatcherHandle` struct with `cancel: Arc<AtomicBool>` field.
- Add `file_watchers: Mutex<HashMap<String, WatcherHandle>>` to `AppState`.
- Initialize in `Default::default()`.

### 3. Implement Subscribe Command

3.1. In `apps/desktop/src-tauri/src/commands/repo_file.rs`, add:
- `SubscribePayload` struct: `{ file, commit, fullFile }`.
- `repo_subscribe_file_update` command:
  - Generate UUID subscription ID.
  - Resolve full path from repo workdir.
  - Create `notify_debouncer_mini::new_debouncer(Duration::from_millis(300), ...)`.
  - On debounced event: call `git::diff::get_file_detail()`, emit `Repo-FileDetailRetrieved`.
  - On error/delete: emit `Repo-LiveUpdateFileNotFound`.
  - Store `WatcherHandle` in state.
  - Return subscription ID.

### 4. Implement Unsubscribe Command

4.1. In `apps/desktop/src-tauri/src/commands/repo_file.rs`, add:
- `UnsubscribePayload` struct: `{ id }`.
- `repo_unsubscribe_file_update` command:
  - Remove watcher from `state.file_watchers` by ID.
  - Set cancel flag to stop the watcher thread.

### 5. Implement Open External File Command

5.1. In `apps/desktop/src-tauri/src/commands/repo_file.rs`, add:
- `OpenExternalFilePayload` struct: `{ file }`.
- `repo_open_external_file` command:
  - Resolve full path from repo workdir.
  - Call `open::that(&full_path)`.

### 6. Clean Up Watchers on Repo Close

6.1. In `apps/desktop/src-tauri/src/commands/repo_close.rs`:
- Before nullifying the repo, iterate `state.file_watchers` and drop all entries.
- Clear the HashMap.

### 7. Register Commands in lib.rs

7.1. Add to `generate_handler![]`:
```rust
commands::repo_file::repo_subscribe_file_update,
commands::repo_file::repo_unsubscribe_file_update,
commands::repo_file::repo_open_external_file,
```

### 8. Update TauriAdapter COMMAND_OVERRIDES

8.1. In `tauri-adapter.ts`, add:
```typescript
'Repo-SubscribeFileUpdate': 'repo_subscribe_file_update',
'Repo-UnsubscribeFileUpdate': 'repo_unsubscribe_file_update',
'Repo-OpenExternalFile': 'repo_open_external_file',
```

### 9. Verify

9.1. `cargo check` — no errors.  
9.2. `pnpm desktop:build` — no errors.  
9.3. Manual test: open repo, select file, edit externally → diff updates.

## Quality Gates

| # | Check | How to verify |
|---|-------|---------------|
| 1 | Rust compiles | `cargo check` no errors |
| 2 | Frontend builds | `pnpm desktop:build` no errors |
| 3 | Subscribe returns ID | Select file in diff → subscription ID logged |
| 4 | Live update works | Edit file externally → diff panel refreshes |
| 5 | Unsubscribe works | Deselect file → no more updates |
| 6 | Repo close cleans up | Close repo → no orphaned watcher threads |
| 7 | Open external works | Right-click file → opens in default editor |

## Implementation Status

| Step | Status | Notes |
|------|--------|-------|
| 1. Add dependencies | [ ] | |
| 2. Extend AppState | [ ] | |
| 3. Subscribe command | [ ] | |
| 4. Unsubscribe command | [ ] | |
| 5. Open external file | [ ] | |
| 6. Cleanup on repo close | [ ] | |
| 7. Register commands | [ ] | |
| 8. TauriAdapter overrides | [ ] | |
| 9. Verify | [ ] | |

## Open Questions

1. Should the watcher watch the single file or the entire repo directory? Watching the single file is more efficient but misses renames.
2. Should debounce interval be configurable via settings, or is 300ms a safe default?
3. Does `notify` work correctly inside the Tauri async runtime, or does it need its own dedicated thread?
