# 0002: Standalone Frontend Build (Tauri)

**Status**: Done  
**Date**: 2026-03-15  
**Author**: —  

**Scope (one job)**: Create a standalone Vite configuration so the Angular frontend can be built and served independently of electron-vite, enabling Tauri to manage the frontend lifecycle.

## Summary

Add `vite.tauri.config.mjs` at project root replicating the renderer section of `electron.vite.config.mjs`. Update `tauri.conf.json` so `beforeDevCommand` and `beforeBuildCommand` use this standalone config. Result: `npm run tauri dev` and `npm run tauri build` work without electron-vite; `npm run dev` (Electron) continues to work unchanged.

## Motivation

- **electron-vite** bundles main + preload + renderer and launches Electron. Tauri needs a renderer-only build/dev server that it can orchestrate.
- Tauri's `beforeDevCommand` must start a Vite dev server (port 5174); `beforeBuildCommand` must produce static assets in `out/renderer`; `frontendDist` points to that output.
- Decouple frontend tooling from Electron so Tauri can own the build pipeline.

## Context

- Angular renderer lives in `src/renderer/` and uses `@analogjs/vite-plugin-angular`.
- `electron.vite.config.mjs` renderer section: root `src/renderer`, plugins (angular with tsconfig, workspaceRoot, inlineStylesExtension: scss), resolve aliases (@app, @core, @infrastructure, @settings, @jira, @common, @shared), optimizeDeps, build outDir `out/renderer`, rollupOptions with manualChunks (vendor/ui/utils).
- `tauri.conf.json` (in `src-tauri/`): `build.devUrl: "http://localhost:5174"`, `build.frontendDist: "../out/renderer"`.

**Depends on**: RFC 0001 (Tauri shell scaffold, already done).

## Detailed Design

### Deliverables

| Item | Path | Purpose |
|------|------|---------|
| **New** | `vite.tauri.config.mjs` | Standalone Vite config for renderer-only; mirrors electron-vite renderer |
| **Modified** | `src-tauri/tauri.conf.json` | `beforeDevCommand`: `npx vite dev --config vite.tauri.config.mjs`; `beforeBuildCommand`: `npx vite build --config vite.tauri.config.mjs` |

### Config Requirements (vite.tauri.config.mjs)

- Use `defineConfig` from `vite` (not electron-vite).
- `root: "src/renderer"`.
- `server`: port 5174, `strictPort: true`.
- `plugins`: `@analogjs/vite-plugin-angular` with tsconfig, workspaceRoot, inlineStylesExtension: scss.
- `resolve.alias`: @app, @core, @infrastructure, @settings, @jira, @common, @shared.
- `optimizeDeps`: include Angular + rxjs; exclude compiler-cli, zone.js.
- `build`: outDir `out/renderer`, emptyOutDir, target esnext, manualChunks (vendor, ui, utils).

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Share electron-vite config with conditional | One file | Complex branching, tight coupling | Rejected |
| **Standalone vite.tauri.config.mjs** | Clear separation, explicit | Slight duplication | **Selected** |

## Testing Strategy

- `npx vite build --config vite.tauri.config.mjs` → `out/renderer/index.html` exists.
- `npm run tauri dev` → Vite dev server starts on 5174, Tauri window opens with Angular UI.
- `npm run tauri build` → Produces working bundle.
- `npm run dev` (electron-vite) → Still works unchanged.

## Timeline

| Milestone | Estimate |
|-----------|----------|
| Create vite.tauri.config.mjs | 0.5 day |
| Update tauri.conf.json | 0.5 day |
| Verify all quality gates | 0.5 day |
| **Total** | **~1 day** |

---

## Implementation Plan

1. Create `vite.tauri.config.mjs` at project root: server port 5174 strictPort, angular plugin, aliases, optimizeDeps, build outDir `out/renderer`, code splitting (manualChunks).
2. Update `src-tauri/tauri.conf.json`: `beforeDevCommand: "npx vite dev --config vite.tauri.config.mjs"`, `beforeBuildCommand: "npx vite build --config vite.tauri.config.mjs"`.
3. Verify standalone build output matches electron-vite output (structure and assets).
4. Verify `npm run tauri dev` and `npm run tauri build` work.
5. Verify `npm run dev` (Electron) still works.

## Quality Gates

| # | Check | How to verify |
|---|--------|----------------|
| QG1 | Standalone build produces index.html | `npx vite build --config vite.tauri.config.mjs` → `out/renderer/index.html` |
| QG2 | Tauri dev works | `npm run tauri dev` → Vite dev server + Tauri window with Angular UI |
| QG3 | Tauri build works | `npm run tauri build` → Working bundle |
| QG4 | Electron untouched | `npm run dev` still works |

## Implementation Status

| Step | Status | Notes |
|------|--------|------|
| 1. Create vite.tauri.config.mjs | [x] Done | |
| 2. Update tauri.conf.json | [x] Done | beforeDevCommand/beforeBuildCommand point to vite.tauri.config.mjs |
| 3. Verify standalone build output | [x] Done | |
| 4. Verify tauri dev/build | [x] Done | |
| 5. Verify Electron dev | [x] Done | |

## Status History

- **2026-03-15**: RFC created. Single job: standalone frontend build for Tauri. All steps completed.
