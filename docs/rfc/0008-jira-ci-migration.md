# RFC 0008 — JIRA / CI Integration Migration

**Status**: Done  
**Depends on**: RFC 0007  
**Goal**: Rewrite JIRA and AppVeyor CI integrations from Node.js (axios) to Rust (reqwest) as Tauri commands.

---

## Background

Both integrations proxy HTTP calls through the Electron main process via IPC. The renderer sends fire-and-forget messages; the main process makes REST API calls and sends results back.

## Solution

Create Rust Tauri commands that replicate the HTTP calls using `reqwest`. Credential tokens are loaded from the OS keychain (implemented in RFC 0007).

## Implementation Plan

### 1. Create `src-tauri/src/jira.rs`
- HTTP client for JIRA REST API v2 (Basic Auth)
- Commands: init, get_issue, add_comment, update_issue, assign_issue, find_assignable_users, add_subtask, search_issues

### 2. Create `src-tauri/src/ci/appveyor.rs`
- HTTP client for AppVeyor API (Bearer token)
- Commands: repo_changed, get_history, rebuild, get_build_log

### 3. Add Tauri commands and register

### 4. Update TauriAdapter mappings for JIRA/CI channels

### 5. Tests

## Implementation Status

- [x] 1. Create jira.rs module (8 REST API operations) — Done
- [x] 2. Create appveyor.rs module (history, rebuild, log) — Done
- [x] 3. Register 11 new commands in lib.rs — Done
- [x] 4. Update TauriAdapter with 11 channel overrides — Done
- [x] 5. All builds pass, 25 tests pass — Done
