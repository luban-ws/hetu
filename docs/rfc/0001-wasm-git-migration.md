# 0001: Tauri Shell Scaffold

**Status**: Active  
**Date**: 2026-03-07  
**Author**: —  

**Scope (one job)**: Scaffold a Tauri 2.x application shell alongside Electron. The Angular renderer loads in Tauri's WebView; two minimal Tauri commands (`ping`, `get_app_version`) prove the IPC bridge. No frontend changes beyond adding Tauri JS types. Electron code untouched.

## Summary

Add `src-tauri/` to the repository with a minimal Rust backend, configure `tauri.conf.json` to load the Angular build output, and register two stub commands. The result: `npm run tauri dev` opens a Tauri window showing the existing Angular UI, and `invoke('ping')` / `invoke('get_app_version')` return expected values from DevTools.

## Motivation

- Prove Tauri 2.x can host the existing Angular app without changes.
- Establish the `src-tauri/` project structure for future RFCs.
- Provide a foundation for RFC 0002 (standalone build) and RFC 0003 (adapter).

## Detailed Design

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  Tauri WebView                                       │
│  Loads Angular static assets from out/renderer/      │
│  ↔ window.__TAURI__.core.invoke()                    │
└─────────────────────────────────────────────────────┘
                         ↕ Tauri IPC
┌─────────────────────────────────────────────────────┐
│  Tauri Core (Rust)                                   │
│  lib.rs → commands: ping, get_app_version            │
└─────────────────────────────────────────────────────┘
```

### Files

| Action | Path | Purpose |
|--------|------|---------|
| **New** | `src-tauri/Cargo.toml` | Tauri 2.x + serde deps |
| **New** | `src-tauri/tauri.conf.json` | Window config, `frontendDist: ../out/renderer`, `devUrl: http://localhost:5174` |
| **New** | `src-tauri/build.rs` | Tauri build script |
| **New** | `src-tauri/src/main.rs` | Binary entry |
| **New** | `src-tauri/src/lib.rs` | App setup + command registration |
| **New** | `src-tauri/src/commands/mod.rs` | Command module |
| **New** | `src-tauri/src/commands/ping.rs` | `ping()` → `"pong"` |
| **New** | `src-tauri/src/commands/app_version.rs` | `get_app_version()` → version string |
| **New** | `src-tauri/capabilities/default.json` | Allow invoke for ping, get_app_version |
| **Modified** | `package.json` | Add `"tauri"`, `"tauri:dev"`, `"tauri:build"` scripts; add `@tauri-apps/cli` devDep, `@tauri-apps/api` dep |
| **Unchanged** | Electron code, Angular code | No changes |

### Out of Scope

- Standalone frontend build (RFC 0002).
- DesktopAdapter / frontend decoupling (RFC 0003).
- Service migration (RFC 0004).
- Rust Git (RFC 0005).

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Tauri 1.x | More docs | Tauri 2 is current | Rejected |
| Single RFC (shell + Git) | One doc | Two jobs; hard to verify | Rejected; split |

## Testing Strategy

- Manual: `cargo build` in `src-tauri/`; no errors.
- Manual: `npm run tauri dev` → window opens with Angular UI.
- Manual: DevTools → `await window.__TAURI__.core.invoke('ping')` → `"pong"`.
- Manual: DevTools → `await window.__TAURI__.core.invoke('get_app_version')` → version string.

## Timeline

| Milestone | Estimate |
|-----------|----------|
| Scaffold + window | 1-2 days |
| Commands + capabilities | 1 day |
| **Total** | **~2-3 days** |

---

## Implementation Plan

### 1. Prerequisites

1.1. Ensure Rust toolchain: `rustup` and `cargo` (`rustc 1.75+`).  
1.2. In `package.json`, add: `@tauri-apps/cli` to devDependencies, `@tauri-apps/api` to dependencies.  
1.3. Add scripts: `"tauri": "tauri"`, `"tauri:dev": "tauri dev"`, `"tauri:build": "npm run build && tauri build"`.

### 2. Create src-tauri/

2.1. Create `src-tauri/Cargo.toml` with `tauri` (2.x), `serde`, `serde_json` dependencies.  
2.2. Create `src-tauri/build.rs`: `fn main() { tauri_build::build() }`.  
2.3. Create `src-tauri/tauri.conf.json`: productName "explorasa-git", window 1200x800, `build.frontendDist: "../out/renderer"`, `build.devUrl: "http://localhost:5174"`, `app.withGlobalTauri: true`.  
2.4. Create `src-tauri/src/main.rs`: `fn main() { app_lib::run(); }` (or Tauri default entry).  
2.5. Create `src-tauri/src/lib.rs`: Tauri builder with `invoke_handler(generate_handler![commands::ping::ping, commands::app_version::get_app_version])`.

### 3. Minimal commands

3.1. Create `src-tauri/src/commands/mod.rs`: declare `pub mod ping; pub mod app_version;`.  
3.2. Create `src-tauri/src/commands/ping.rs`: `#[tauri::command] pub fn ping() -> String { "pong".into() }`.  
3.3. Create `src-tauri/src/commands/app_version.rs`: `#[tauri::command] pub fn get_app_version() -> String { env!("CARGO_PKG_VERSION").into() }`.  
3.4. Create `src-tauri/capabilities/default.json`: allow invoke for `ping`, `get_app_version`.

### 4. Verify

4.1. Run `cargo build` in `src-tauri/`; fix any compile errors.  
4.2. Build Angular: `npm run build` (electron-vite build); confirm `out/renderer/index.html` exists.  
4.3. Run `npm run tauri dev` (start a Vite dev server on port 5174 manually or point to built assets); confirm window opens.  
4.4. In DevTools: `await window.__TAURI__.core.invoke('ping')` → `"pong"`.  
4.5. `await window.__TAURI__.core.invoke('get_app_version')` → version string.

## Quality Gates

| # | Check | How to verify |
|---|--------|----------------|
| 1.1 | Rust compiles | `cargo build` in `src-tauri/` no errors |
| 1.2 | Window shows UI | `tauri dev` → Angular app visible |
| 1.3 | Commands work | `invoke('ping')` → `"pong"`; `invoke('get_app_version')` → version |
| 1.4 | Electron untouched | `npm run dev` still works |

## Implementation Status

| Step | Status | Notes |
|------|--------|-------|
| 1. Prerequisites | [x] Done | @tauri-apps/cli, @tauri-apps/api, scripts added |
| 2. Create src-tauri/ | [x] Done | Cargo.toml, tauri.conf.json, main.rs, lib.rs |
| 3. Minimal commands | [x] Done | ping, get_app_version, capabilities |
| 4. Verify | [x] Done | cargo build OK, window opens, commands work |

## Status History

- **2026-03-07**: RFC created; scoped to Tauri shell scaffold only.
- **2026-03-15**: RFC trimmed to single job (shell scaffold). Adapter, build, service migration moved to RFCs 0003-0004. All steps completed.
