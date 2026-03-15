# RFC 0009 — Auto-Updater + Final Cleanup

**Status**: Deferred (updater requires deployment infrastructure)  
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

The `UpdaterService` already uses `DesktopAdapter` and will work through the adapter in both Electron and Tauri modes. The updater messages flow through the `Updater` channel which the TauriAdapter routes as a no-op in Tauri mode (updater commands are not registered).

## What's Ready

- Tauri shell scaffold (RFC 0001)
- Standalone frontend build (RFC 0002)
- DesktopAdapter pattern (RFC 0003)
- All services migrated (RFC 0004)
- Rust Git core (RFC 0005)
- TauriAdapter wiring (RFC 0006)
- Credential storage (RFC 0007)
- JIRA / CI integration (RFC 0008)

## What Remains (deferred to deployment phase)

1. Add `tauri-plugin-updater` to Cargo.toml and configure in tauri.conf.json
2. Set up update server endpoint and signing keys
3. Add Tauri code path in `UpdaterService` to use `@tauri-apps/plugin-updater` directly
4. Remove Electron dependencies from package.json when ready
5. Remove `src/main/`, `src/preload/` directories
6. Remove `electron.vite.config.mjs` and `electron-builder` config

## Implementation Status

- [ ] 1. Add tauri-plugin-updater
- [ ] 2. Configure update endpoint
- [ ] 3. Update UpdaterService for Tauri
- [ ] 4. Remove Electron code
