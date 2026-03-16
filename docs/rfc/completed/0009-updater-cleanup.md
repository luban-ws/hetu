# RFC 0009 — Auto-Updater + Final Cleanup

**Status**: Done (updater implementation moved to RFC 0012)  
**Depends on**: RFC 0008  
**Goal**: Add Tauri auto-updater plugin and remove Electron-only code.

---

## Background

The auto-updater uses `electron-updater` in the main process. Tauri provides `tauri-plugin-updater` which operates directly from the frontend — no IPC relay needed.

However, the updater requires:
- A server endpoint serving update manifests (JSON)
- Code signing keys for the update bundles
- Platform-specific configuration

These are deployment-level concerns that cannot be implemented without the release infrastructure.

## Current State

Electron has been fully removed. The auto-updater implementation is tracked separately in [RFC 0012](./0012-auto-updater.md).

## Completion Notes

- **Electron removal**: Completed. `src/main/`, `src/preload/`, `electron.vite.config.mjs`, `electron-builder` config, and all Electron dependencies have been deleted from `package.json`.
- **Auto-updater**: Design and implementation plan documented in RFC 0012 (Auto-Updater via GitHub Releases). Not yet implemented.
- **Feature parity audit**: A comprehensive audit was performed to verify all Electron backend features were migrated to Tauri Rust. Missing commands (pull, push-tag, file-detail, line-staging, auto-fetch, secure-clear-cache, settings-init) were implemented. Event name mismatches (stash, reset) were fixed.

## Implementation Status

- [x] 4. Remove Electron dependencies from package.json
- [x] 5. Remove `src/main/`, `src/preload/` directories
- [x] 6. Remove `electron.vite.config.mjs` and `electron-builder` config
- [ ] 1. Add tauri-plugin-updater → **RFC 0012**
- [ ] 2. Configure update endpoint → **RFC 0012**
- [ ] 3. Update UpdaterService for Tauri → **RFC 0012**
