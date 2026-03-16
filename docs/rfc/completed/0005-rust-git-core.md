# 0005: Rust Git Core (git2 + Tauri Commands)

**Status**: Done  
**Date**: 2026-03-15  
**Author**: —  

**Scope (one job)**: Implement Git operations in Rust using the `git2` crate and expose them as Tauri commands. Pure backend work; no frontend changes. Angular continues to use DesktopAdapter; wiring to TauriAdapter is RFC 0006.

**Depends on**: RFC 0001 (Tauri shell).

## Summary

Add `git2 = "0.18"` to the Tauri backend, create a `src-tauri/src/git/` module tree for all Git operations, and implement Tauri command handlers that emit events matching Angular expectations. Each command uses `app.emit("Event-Name", payload)` for responses. No Angular code changes in this RFC.

## Motivation

- **Single Git stack**: One implementation (libgit2 via `git2`), same behavior on all platforms.
- **Foundation for Tauri mode**: RFC 0006 will wire TauriAdapter to these commands; this RFC delivers the Rust backend only.
- **Testability**: Pure Rust backend can be tested with `cargo test` before any frontend integration.

## Detailed Design

### Architecture

```
Tauri Command Handlers (commands/repo_*.rs)
  → app.emit("Event-Name", payload)
  → git::repo, git::status, git::commit, git::branch, git::remote, git::stash, git::tag, git::reset, git::merge
       ↓
git2 crate (libgit2)
  → Repository, status, commit, branch, remote, stash, ...
       ↓
AppState (state.rs) — current_repo: Option<Repository> in Mutex
```

### Command Surface (IPC Channel → Tauri Command)

| Channel | Tauri Command | Args | Emits |
|---------|---------------|------|-------|
| Repo-Open | `repo_open` | `{ path }` | Repo-OpenSuccessful / Repo-OpenFailed |
| Repo-Close | `repo_close` | — | Repo-Closed |
| Repo-Init | `repo_init` | `{ path }` | Repo-InitSuccessful / Repo-InitFailed |
| Repo-Fetch | `repo_fetch` | `{ credentials? }` | Repo-Fetched / Repo-FetchFailed |
| Repo-Pull | `repo_pull` | `{ credentials? }` | Repo-Pulled / Repo-PullFailed |
| Repo-Push | `repo_push` | `{ credentials?, force? }` | Repo-Pushed / Repo-PushFailed |
| Repo-Stage | `repo_stage` | `{ paths }` | Repo-FileStatusRetrieved |
| Repo-Unstage | `repo_unstage` | `{ paths }` | Repo-FileStatusRetrieved |
| Repo-StageLines | `repo_stage_lines` | `{ path, lines }` | Repo-FileStatusRetrieved |
| Repo-UnstageLines | `repo_unstage_lines` | `{ path, lines }` | Repo-FileStatusRetrieved |
| Repo-Commit | `repo_commit` | `{ message }` | Repo-Committed / Repo-CommitFail |
| Repo-CommitStaged | `repo_commit_staged` | `{ message }` | Repo-Committed / Repo-CommitFail |
| Repo-Stash | `repo_stash` | — | Repo-Stashed / Repo-StashFailed |
| Repo-Pop | `repo_pop` | — | Repo-Popped / Repo-PopFailed |
| Repo-Apply | `repo_apply` | — | Repo-Applied / Repo-ApplyFailed |
| Repo-DeleteStash | `repo_delete_stash` | `{ index }` | Repo-StashDeleted |
| Repo-DiscardAll | `repo_discard_all` | — | Repo-FileStatusRetrieved |
| Repo-CreateBranch | `repo_create_branch` | `{ name, commit? }` | Repo-BranchCreated / Repo-BranchCreateFailed |
| Repo-Checkout | `repo_checkout` | `{ branch }` | Repo-BranchChanged |
| Repo-DeleteBranch | `repo_delete_branch` | `{ name }` | Repo-BranchDeleted / Repo-BranchDeleteFailed |
| Repo-CreateTag | `repo_create_tag` | `{ name, target?, message? }` | Repo-TagCreated |
| Repo-DeleteTag | `repo_delete_tag` | `{ name }` | Repo-TagDeleted |
| Repo-ResetHard | `repo_reset_hard` | `{ ref? }` | Repo-CommitsUpdated |
| Repo-ResetSoft | `repo_reset_soft` | `{ ref? }` | Repo-CommitsUpdated |
| Repo-GetCommit | `repo_get_commit` | `{ sha }` | Repo-CommitDetailRetrieved |
| Repo-GetFileDetail | `repo_get_file_detail` | `{ path, sha }` | Repo-FileDetailRetrieved |

### Key Event Payload Shapes (from RepoService / Angular expectations)

- **Repo-OpenSuccessful**: `{ workingDir: string, repoName: string }`
- **Repo-CommitsUpdated**: `{ commits: Array<{sha, author, email, parents, message, date, ci}> }`
- **Repo-BranchChanged**: Branch object `{ name, target, shorthand, ... }`
- **Repo-BranchPositionRetrieved**: `{ ahead: number, behind: number }`
- **Repo-FileStatusRetrieved**: `{ summary: object, staged: FileEntry[], unstaged: FileEntry[] }`
- **Repo-PullFailed**: `{ detail: 'LOCAL_AHEAD' | 'UPSTREAM_NOT_FOUND' | ... }`
- **Repo-PushFailed**: `{ detail: 'FORCE_REQUIRED' | 'UP_TO_DATE' | 'REMOTE_UNCHANGED' | ... }`
- **Repo-Pulled**: `{ result: 'UP_TO_DATE' | ... }`

### Error Handling

Map `git2::Error` to serializable `{ code: String, message: String }`. No bare panics; all errors returned as `Result` or emitted as failure events.

### Rust Module Layout

```
src-tauri/src/
  git/
    mod.rs, repo.rs, status.rs, commit.rs, branch.rs, remote.rs, stash.rs, tag.rs, reset.rs, merge.rs, error.rs
  commands/
    mod.rs, ping.rs, app_version.rs, repo_open.rs, repo_close.rs, repo_commits.rs, repo_status.rs,
    repo_commit.rs, repo_stage.rs, repo_branch.rs, repo_remote.rs, repo_stash.rs, repo_tag.rs, repo_reset.rs
  state.rs
```

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Use system `git` CLI from Rust | Simple | Parsing output, platform differences | Rejected |
| **git2 crate** | One stack, full libgit2 API | — | **Selected** |
| Include TauriAdapter wiring here | One RFC | Two jobs; harder to verify | Rejected; split into RFC 0006 |

## Testing Strategy

- **Rust unit tests**: Temp dir with `git2::Repository::init()`, run operations, assert outcomes.
- **Coverage**: Main success + failure paths for each git module.
- **Build**: `cargo build` and `cargo test` in `src-tauri/` must pass.

## Timeline

| Milestone | Estimate |
|-----------|----------|
| git2 dep + error.rs + state.rs | 1 day |
| repo open/close + status | 2 days |
| commits + diff | 2 days |
| stage/unstage/commit | 2 days |
| branch operations | 2 days |
| remote (fetch/pull/push) | 2-3 days |
| stash/tag/reset/merge | 2 days |
| Command handlers + event emission | 2 days |
| Register commands + capabilities | 1 day |
| Unit tests | 2-3 days |
| **Total** | **~3-4 weeks** |

---

## Implementation Plan

1. **Add git2 dep + create git/error.rs + git/mod.rs**: Add `git2 = "0.18"` to Cargo.toml; create `GitError { code, message }` with `From<git2::Error>`.
2. **Create state.rs (AppState)**: `current_repo: Option<Repository>` in `Mutex`; register via `tauri::Builder::default().manage(...)`.
3. **Implement repo open/close + status**: `git/repo.rs`, `git/status.rs`; commands `repo_open`, `repo_close`, `repo_get_status`; emit events.
4. **Implement commits + diff**: `git/commit.rs`; commands `repo_get_commits`, `repo_get_commit`, `repo_get_diff`; emit Repo-CommitsUpdated, Repo-CommitDetailRetrieved.
5. **Implement stage/unstage/commit**: `git/status.rs` index ops; commands `repo_stage`, `repo_unstage`, `repo_stage_lines`, `repo_unstage_lines`, `repo_commit`, `repo_commit_staged`, `repo_discard_all`; emit Repo-FileStatusRetrieved, Repo-Committed, Repo-CommitFail.
6. **Implement branch operations**: `git/branch.rs`; commands `repo_create_branch`, `repo_checkout`, `repo_delete_branch`; emit Repo-BranchChanged, Repo-BranchCreated, etc.
7. **Implement remote operations**: `git/remote.rs`; commands `repo_fetch`, `repo_pull`, `repo_push`; accept optional credentials; emit Repo-Fetched, Repo-Pulled, Repo-Pushed, and failure variants.
8. **Implement stash/tag/reset/merge**: `git/stash.rs`, `git/tag.rs`, `git/reset.rs`, `git/merge.rs`; corresponding commands and events.
9. **Create all command handlers with event emission**: Ensure each handler calls `app.emit("Event-Name", payload)` with shapes matching Angular expectations.
10. **Register commands + update capabilities**: Add all commands to `generate_handler![]`; add invoke permissions in `capabilities/default.json`.
11. **Write unit tests**: `cargo test` covering main success + failure paths for each git module.

## Quality Gates

| # | Check | How to verify |
|---|--------|---------------|
| 1 | `cargo build` succeeds | No compile errors in `src-tauri/` |
| 2 | `cargo test` all pass | All unit tests green |
| 3 | Unit tests cover main success + failure paths | Each git module has tests |

## Implementation Status

| Step | Status | Notes |
|------|--------|-------|
| 1. Add git2 + error.rs + mod.rs | [x] Done | |
| 2. Create state.rs | [x] Done | |
| 3. Repo open/close + status | [x] Done | |
| 4. Commits + diff | [x] Done | |
| 5. Stage/unstage/commit | [x] Done | |
| 6. Branch operations | [x] Done | |
| 7. Remote operations | [x] Done | |
| 8. Stash/tag/reset/merge | [x] Done | |
| 9. Command handlers + events | [x] Done | |
| 10. Register commands + capabilities | [x] Done | |
| 11. Unit tests | [x] Done | |

## Status History

- **2026-03-15**: RFC created. Pure Rust backend scope; TauriAdapter wiring deferred to RFC 0006.
