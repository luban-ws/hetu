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
│  │  (src-tauri/)    │◄─►  (src/renderer/) │  │
│  │                  │  │                  │  │
│  │ • Git operations │  │ • Subway-map viz │  │
│  │ • Settings store │  │ • Commit list    │  │
│  │ • Repo history   │  │ • Diff viewer    │  │
│  │ • Credentials    │  │ • JIRA panel     │  │
│  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────┘
```

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
| `graph/` | Subway-map rendering engine |
| `core/` | Commit list, diff viewer, file panels |
| `jira/` | JIRA integration UI and service |
| `ci/` | AppVeyor build status integration |
| `settings/` | Settings management service |
| `infrastructure/` | `TauriAdapter`, platform detection |

## Design Decisions

All major architectural choices are documented as **RFCs** in the `docs/rfc/` directory. Key decisions include:

- **RFC 0001** — Tauri shell scaffold (replacing Electron)
- **RFC 0003** — Desktop adapter abstraction
- **RFC 0005** — Rust Git core (replacing NodeGit)
- **RFC 0007** — OS-native credential storage
