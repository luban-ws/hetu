# 0014: Operation Progress Signals

**Status**: Draft  
**Date**: 2026-03-15  
**Author**: —

**Scope (one job)**: Emit `Repo-BlockingOperationBegan`, `Repo-BlockingOperationEnd`, and `Repo-BlockingUpdate` events from Rust commands so the Angular frontend displays progress indicators during long-running git operations.

## Summary

The Electron backend emitted "blocking operation" events to drive a loading spinner and status message in the UI. The Rust backend currently completes operations silently — the frontend's loading state listeners (`repo.service.ts` lines 425-444) receive no events and the UI appears frozen during fetch/pull/push. This RFC adds progress event emission to all long-running Rust commands.

## Motivation

- **UX feedback**: Fetch, pull, push, and clone can take 5-30+ seconds on large repos or slow networks. Without progress signals, the user sees no indication that work is happening.
- **Existing listeners**: `repo.service.ts` already listens for `Repo-BlockingOperationBegan`, `Repo-BlockingOperationEnd`, and `Repo-BlockingUpdate`. The `StatusBarService.enableLoading()` / `disableLoading()` / `updateMessage()` pipeline is fully wired. Only the Rust emission is missing.
- **Retry logic**: The `_pendingOperation` pattern in `repo.service.ts` uses blocking signals to coordinate auto-fetch suppression during active operations.

## Detailed Design

### Events

| Event | Payload | When |
|-------|---------|------|
| `Repo-BlockingOperationBegan` | `{ operation: string }` | Before a long-running command starts |
| `Repo-BlockingUpdate` | `{ operation: string }` | During transfer (progress updates) |
| `Repo-BlockingOperationEnd` | `{}` | After the command completes (success or failure) |

### Which Commands Emit Progress

| Command | Operation Label | Has Transfer Progress |
|---------|----------------|----------------------|
| `repo_fetch` | `"Fetching…"` | Yes (via `git2::RemoteCallbacks::transfer_progress`) |
| `repo_pull` | `"Pulling…"` | Yes |
| `repo_push` | `"Pushing…"` | Yes (via `git2::RemoteCallbacks::push_transfer_progress`) |
| `repo_push_tag` | `"Pushing tag…"` | Yes |
| `repo_clone` (future) | `"Cloning…"` | Yes |
| `repo_stash_save` | `"Stashing…"` | No (fast, optional) |
| `repo_reset` | `"Resetting…"` | No (fast, optional) |

### Implementation Pattern

Wrap each long-running command with begin/end signals:

```rust
pub async fn repo_fetch(
    app: AppHandle,
    state: State<'_, AppState>,
    payload: RemotePayload,
) -> Result<(), String> {
    let _ = app.emit("Repo-BlockingOperationBegan", json!({"operation": "Fetching…"}));

    let result = {
        let guard = state.repo.lock();
        let repo = guard.as_ref().ok_or("No repository open")?;
        let creds = resolve_creds(repo, &payload);
        git::remote::fetch_with_progress(repo, &creds, |progress| {
            let _ = app.emit("Repo-BlockingUpdate", json!({
                "operation": format!(
                    "Fetching… {}/{} objects",
                    progress.received_objects(),
                    progress.total_objects()
                )
            }));
        })
    };

    let _ = app.emit("Repo-BlockingOperationEnd", json!({}));

    match result {
        Ok(()) => {
            let _ = app.emit("Repo-Fetched", json!({}));
            Ok(())
        }
        Err(e) => {
            let _ = app.emit("Repo-CredentialIssue", json!({}));
            Err(e.to_string())
        }
    }
}
```

### git2 Transfer Progress Callback

`git2::RemoteCallbacks` provides:
- `transfer_progress(callback)` — called during fetch with `Progress` struct containing `total_objects()`, `received_objects()`, `received_bytes()`.
- `push_transfer_progress(callback)` — called during push with `(current, total, bytes)`.

The progress callback passes a closure that emits `Repo-BlockingUpdate`. Since `AppHandle.emit()` requires the handle, and the callback runs synchronously inside git2, we pass a channel or `Arc<AppHandle>`.

### Thread Safety

`git2::RemoteCallbacks` closures run on the same thread as the git operation. Since `AppHandle` is `Clone + Send + Sync`, it can be captured in the closure directly. No channel needed.

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Emit from Rust commands directly | Simple, accurate timing | Slightly more code per command | **Accepted** |
| Middleware/wrapper pattern | DRY, single emit point | Over-abstracted for 6 commands | Rejected |
| Frontend polling (invoke loop) | No backend changes | High overhead, inaccurate | Rejected |
| No progress (status quo) | Zero work | Bad UX, appears frozen | Rejected |

## Migration Strategy

- No frontend changes needed — `repo.service.ts` already listens for all three events.
- Existing behavior: the loading spinner never activates. After this RFC: spinner activates during long operations.
- The `_pendingOperation` suppression of auto-fetch will work correctly once blocking signals are emitted.

## Testing Strategy

| Test | How |
|------|-----|
| Fetch shows progress | Fetch a large repo → verify status bar shows "Fetching… X/Y objects" |
| Pull shows progress | Pull with remote changes → verify loading spinner activates |
| Push shows progress | Push commits → verify "Pushing…" message appears |
| End signal always fires | Force-fail a fetch (bad credentials) → verify spinner stops |
| Auto-fetch suppression | Start manual fetch → verify auto-fetch timer doesn't stack |

## Timeline

| Milestone | Estimate |
|-----------|----------|
| Refactor `git::remote` for progress callbacks | 1 day |
| Update all 4 remote commands | 0.5 day |
| Add begin/end to non-remote commands | 0.5 day |
| Testing | 0.5 day |
| **Total** | **~2.5 days** |

---

## Implementation Plan (Detailed Steps)

### 1. Add Progress Callback to git::remote Functions

1.1. In `apps/desktop/src-tauri/src/git/remote.rs`:
- Add `fetch_with_progress(repo, creds, on_progress: impl Fn(&git2::Progress))` variant.
- Inside, register `callbacks.transfer_progress(|progress| { on_progress(&progress); true })`.
- Add `push_with_progress(repo, creds, force, on_progress: impl Fn(usize, usize, usize))` variant.
- Inside, register `callbacks.push_transfer_progress(|current, total, bytes| { on_progress(current, total, bytes) })`.
- Keep existing `fetch()` and `push()` as thin wrappers calling the `_with_progress` variants with a no-op callback.

1.2. Similarly add `pull_with_progress()` that delegates to `fetch_with_progress()` then merge.

### 2. Update Remote Commands to Emit Progress

2.1. In `apps/desktop/src-tauri/src/commands/repo_remote.rs`:
- Wrap `repo_fetch` with begin/end emissions + progress callback.
- Wrap `repo_pull` with begin/end emissions + progress callback.
- Wrap `repo_push` with begin/end emissions + progress callback.
- Wrap `repo_push_tag` with begin/end emissions + progress callback.
- Ensure `Repo-BlockingOperationEnd` fires in **both** success and error paths (use a scope guard or explicit finally pattern).

### 3. Add Begin/End to Other Long Commands (Optional)

3.1. In `repo_stash.rs`: emit begin/end around `repo_stash_save` (stash can be slow on large working trees).  
3.2. In `repo_reset.rs`: emit begin/end around `repo_reset` (hard reset checks out files).

### 4. Verify

4.1. `cargo check` — no errors.  
4.2. `pnpm desktop:build` — no errors.  
4.3. Manual test: fetch a repo with many objects → status bar shows progress.

## Quality Gates

| # | Check | How to verify |
|---|-------|---------------|
| 1 | Rust compiles | `cargo check` no errors |
| 2 | Frontend builds | `pnpm desktop:build` no errors |
| 3 | Fetch shows loading | Fetch → status bar spinner activates with message |
| 4 | Loading stops on error | Bad credentials → spinner stops, error toast shows |
| 5 | Loading stops on success | Successful fetch → spinner stops |
| 6 | Progress updates flow | Large fetch → message updates with object count |

## Implementation Status

| Step | Status | Notes |
|------|--------|-------|
| 1. Progress callbacks in git::remote | [ ] | |
| 2. Update remote commands | [ ] | |
| 3. Other long commands | [ ] | |
| 4. Verify | [ ] | |

## Open Questions

1. Should the progress message be localized (depends on RFC 0010), or keep English-only for now?
2. Should we add a "Cancel" mechanism for long operations, or defer to a future RFC?
3. Is `push_transfer_progress` reliable across all remote types (HTTPS, SSH), or does it only fire for certain backends?
