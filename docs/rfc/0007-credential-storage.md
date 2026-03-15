# RFC 0007 — Credential Storage Migration

**Status**: Done  
**Depends on**: RFC 0005, RFC 0006  
**Goal**: Replace Electron `safeStorage` + `credentials.json` with Rust `keyring` crate (OS keychain) + JSON settings store, and wire git2 credential callbacks.

---

## Background

The Electron app stores credentials via `electron.safeStorage.encryptString()` persisted to `credentials.json`. Settings (including SSH key paths) are stored in plain JSON at `~/Explorasa Git/settings.json` and per-repo `<repoId>.json`.

Credential types:
- HTTPS username/password — `<username>@<remoteUrl>` → encrypted in credentials.json
- SSH passphrase — `<sshUrl>` → encrypted in credentials.json
- SSH key paths — `auth-keypath`, `auth-pubpath` → plain text in settings JSON
- JIRA API token — `jira-token@<repoId>` → encrypted
- AppVeyor token — `ci-appveyor-token@<repoId>` → encrypted

## Solution

Use the `keyring` Rust crate which wraps native OS keychains:
- macOS: Keychain Services
- Windows: Credential Manager
- Linux: Secret Service (via D-Bus)

App settings use a simple JSON file managed by `serde_json`.

## Implementation Plan

### 1. Add dependencies
- `keyring = "3"` to Cargo.toml
- `dirs = "6"` for platform-specific data directories

### 2. Create `src-tauri/src/secure.rs`
- `get_password(account: &str) -> Option<String>` via keyring
- `set_password(account: &str, password: &str)` via keyring
- `delete_password(account: &str)` via keyring
- Service name: `"com.rhodiumcode.explorasa-git"`

### 3. Create `src-tauri/src/settings_store.rs`
- Load/save `~/Explorasa Git/settings.json`
- Per-repo settings: `~/Explorasa Git/<repoId>.json`
- `get(key) -> Option<String>`, `set(key, value)`, `get_repo(repo_id, key)`, `set_repo(repo_id, key, value)`

### 4. Add Tauri commands
- `secure_get_password`, `secure_set_password`, `secure_delete_password`, `secure_clear_cache`
- `settings_get`, `settings_set`, `settings_get_repo`, `settings_set_repo`
- `set_credentials` (composite: save username + password for current repo)
- `get_stored_credentials` (returns username + password for a remote URL)
- `browse_file` → Tauri dialog API

### 5. Wire git2 credentials
- Update `src-tauri/src/git/remote.rs` fetch/push to read credentials from secure store
- Add SSH key support via `git2::Cred::ssh_key()` (not available in isomorphic-git!)
- Support both HTTPS (userpass) and SSH (key + passphrase)

### 6. Update TauriAdapter mappings
- Map credential/settings IPC channels to Tauri commands
- Map credential events to Tauri events

### 7. Tests
- Unit tests for secure store (mock keyring)
- Unit tests for settings store (temp directory)

## Implementation Status

- [x] 1. Add dependencies (keyring, dirs, reqwest, base64) — Done
- [x] 2. Create secure.rs module — Done
- [x] 3. Create settings_store.rs module — Done
- [x] 4. Add Tauri commands (secure, settings, credentials) — Done
- [x] 5. Wire git2 credentials (HTTPS + SSH via RemoteCreds) — Done
- [x] 6. Update TauriAdapter mappings — Done
- [x] 7. Tests (25 total: 21 git + 4 settings/secure) — Done

## Quality Gates

| # | Check | How to verify |
|---|-------|---------------|
| 7.1 | Rust build | `cargo build` no errors |
| 7.2 | Tests pass | `cargo test` all pass |
| 7.3 | Credential round-trip | set_password → get_password returns same value |
| 7.4 | Settings round-trip | settings_set → settings_get returns same value |
| 7.5 | Git auth | fetch/push with HTTPS credentials works in Tauri mode |
| 7.6 | Electron untouched | `npm run dev` still works |
