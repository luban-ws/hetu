---
title: Architecture
description: How Hetu is structured — Tauri shell, Rust backend, Angular frontend.
order: 2
---

# Architecture

Hetu follows a **two-process** model powered by [Tauri 2](https://tauri.app/):

```
┌─────────────────────────────────────────────┐
│                 Tauri Shell                  │
│  ┌──────────────────┐  ┌─────────────────┐  │
│  │   Rust Backend   │  │ Angular Frontend │  │
│  │ (src-tauri/)     │◄─► (src/renderer/) │  │
│  │                  │  │                  │  │
│  │ • Git operations │  │ • Subway-map viz │  │
│  │ • Settings store │  │ • Commit list    │  │
│  │ • Repo history   │  │ • Diff viewer    │  │
│  │ • Credentials    │  │ • JIRA panel     │  │
│  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────┘
```

All paths below are relative to `apps/desktop/`.

## Communication Layer

The frontend and backend communicate through **Tauri IPC**:

- **`invoke`** — Request-response pattern. The frontend calls a Rust command and awaits a typed result.
- **`emit` / `listen`** — Event pattern. The backend pushes updates (e.g., repository changes) to the frontend.

A `DesktopAdapter` abstraction in the frontend decouples IPC from Angular services, making the app testable and potentially portable.

## Key Modules

### Rust Backend (`src-tauri/src/`)

| Module | Responsibility |
|--------|---------------|
| `commands/` | Tauri command handlers (repo browse, git operations, settings) |
| `git_*.rs` | Git operations via `git2-rs` (status, log, diff, commit, push, pull) |
| `settings_store.rs` | JSON settings persistence (`~/Hetu/settings.json`) |
| `repo_history.rs` | Recent repository tracking and current repo state |
| `credential_*.rs` | OS-native credential storage (Keychain, Credential Manager, Secret Service) |

### Angular Frontend (`src/renderer/app/`)

| Module | Responsibility |
|--------|---------------|
| `core/` | Commit list, diff viewer, file panels, subway-map rendering |
| `jira/` | JIRA integration UI and service |
| `settings/` | Settings management service |
| `infrastructure/` | `TauriAdapter`, platform detection, about page |

## Monorepo Layout

```
hetu/                          ← pnpm workspace root
├── apps/
│   └── desktop/               ← @luban-ws/desktop
│       ├── src/
│       │   └── renderer/      ← Angular frontend
│       ├── src-tauri/         ← Rust backend
│       ├── build/             ← App icons and build resources
│       └── test/              ← Test setup files
├── packages/                  ← Shared Angular components (planned)
├── site/                      ← @luban-ws/site (Astro docs)
├── docs/rfc/                  ← Technical design documents
├── turbo.json                 ← Turborepo pipeline config
└── pnpm-workspace.yaml        ← Workspace declaration
```

## Design Decisions

All major architectural choices are documented as **RFCs** in the `docs/rfc/` directory:

| RFC | Topic |
|-----|-------|
| [RFC 0001](https://github.com/luban-ws/hetu/blob/main/docs/rfc/0001-tauri-shell-scaffold.md) | Tauri shell scaffold (replacing Electron) |
| [RFC 0003](https://github.com/luban-ws/hetu/blob/main/docs/rfc/0003-desktop-adapter-abstraction.md) | Desktop adapter abstraction |
| [RFC 0005](https://github.com/luban-ws/hetu/blob/main/docs/rfc/0005-rust-git-core.md) | Rust Git core (replacing NodeGit) |
| [RFC 0007](https://github.com/luban-ws/hetu/blob/main/docs/rfc/0007-credential-storage.md) | OS-native credential storage |

## Why Tauri

Hetu uses Tauri instead of Electron for the desktop shell:

- **~10x smaller binary** — uses OS native webview instead of bundling Chromium
- **~3x faster startup** — no Chromium cold start overhead
- **Rust backend** — Git operations via `git2-rs`, safer and faster than NodeGit
- **Native OS integration** — Keychain, Credential Manager, Secret Service for credentials
