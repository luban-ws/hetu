# Task Tracking — Hetu (河图)

## Current Status: All Implementation RFCs Complete

The Tauri migration core is complete. Both Electron and Tauri paths compile and run.
App renamed from explorasa-git to **Hetu** (v0.5.0).

---

## Verification Summary (2026-03-15)

| Check | Result |
|-------|--------|
| Vite standalone build | `npx vite build --config vite.tauri.config.mjs` — OK |
| Electron build | `npx electron-vite build` — OK |
| Rust build | `cargo build` — OK (0 errors, 0 warnings) |
| Rust tests | `cargo test` — 25 passed, 0 failed |
| Tauri dev | `npm run tauri:dev` — window opens on :5180, Angular loads |
| Linter (9 key TS files) | 0 errors |
| RFC statuses | All 8 RFCs updated |

---

## Completed
- RFC 0001: Tauri Shell Scaffold — Done 2026-03-15
- RFC 0002: Standalone Frontend Build — Done 2026-03-15
- RFC 0003: DesktopAdapter + Adapters — Done 2026-03-15
- RFC 0004: Service Migration — Done 2026-03-15
- RFC 0005: Rust Git Core — Done 2026-03-15
- RFC 0006: TauriAdapter Git Wiring — Done 2026-03-15
- RFC 0007: Credential Storage (keyring + settings_store) — Done 2026-03-15
- RFC 0008: JIRA / CI Integration (reqwest) — Done 2026-03-15

## Deferred
- RFC 0009: Auto-Updater + Electron Removal — Requires deployment infrastructure (update server, signing keys)

## Rust Backend Summary

| Module | Commands | Description |
|--------|----------|-------------|
| git (10 submodules) | 26 | Full Git ops: repo, status, commit, branch, remote, stash, tag, reset |
| secure | 3 | OS keychain CRUD (keyring crate) |
| settings | 8 | JSON settings + secure per-repo settings |
| credentials | 2 | Composite cred storage + retrieval |
| jira | 8 | JIRA REST API v2 (reqwest, Basic Auth) |
| appveyor | 3 | AppVeyor CI API (reqwest, Bearer token) |
| **Total** | **50** | |
