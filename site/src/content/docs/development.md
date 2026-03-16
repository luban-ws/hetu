---
title: Development
description: Contributing to Hetu — tooling, conventions, and workflow.
order: 5
---

# Development Guide

This guide covers the development workflow, tooling, and conventions for contributing to Hetu.

## Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| **pnpm** | 10+ | Package manager and workspace orchestration |
| **Turborepo** | 2.x | Task runner with caching |
| **Node.js** | 22+ | JavaScript runtime |
| **Rust** | 1.70+ | Tauri backend compilation |
| **Vite** | 6.x | Frontend bundler (via electron-vite for Electron, standalone for Tauri) |
| **Vitest** | 3.x | Test runner for JS/TS |
| **Angular** | 20.x | Frontend framework |

## Quick Reference

```bash
# Install dependencies (from repo root)
pnpm install

# Start Tauri dev
pnpm desktop:dev

# Run all tests
pnpm test

# Run desktop Angular tests
pnpm --filter @luban-ws/desktop test

# Run Rust tests
cd apps/desktop/src-tauri && cargo test

# Build site locally
pnpm site:dev
```

## Project Conventions

### Code Style

- **Pure functions first** — prefer stateless, side-effect-free functions
- **JSDoc** on all public functions and types
- **Modular** — files over 100 lines should be split into focused modules
- **Ramda / Radash** — leverage functional utilities from `radash` where beneficial

### Naming

- Angular components: `PascalCase` with descriptive suffixes (`CommitListComponent`, `DiffViewerService`)
- Rust modules: `snake_case` (`git_status.rs`, `settings_store.rs`)
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case` for components, `snake_case` for Rust

### Testing

- Unit tests live alongside source in `__tests__/` directories
- Angular tests use `@analogjs/vitest-angular` with jsdom
- Main process tests use Vitest with Node environment
- Rust tests use the standard `#[cfg(test)]` pattern

### Commit Messages

Follow conventional commits where possible:

```
feat: add subway-map zoom controls
fix: resolve credential storage on Linux
docs: update architecture diagram
refactor: extract git operations into separate module
```

## Architecture Overview

See the [Architecture](/docs/architecture) page for the full system diagram.

### Key Directories

```
apps/desktop/
├── src/
│   └── renderer/          Angular frontend
│       └── app/
│           ├── core/      Core UI components
│           ├── infrastructure/  TauriAdapter & platform detection
│           ├── jira/      JIRA integration UI
│           └── settings/  Settings management
├── src-tauri/
│   └── src/               Rust backend
│       ├── commands/       Tauri IPC command handlers
│       ├── git_*.rs        Git operations (git2-rs)
│       ├── settings_store.rs  JSON persistence
│       └── credential_*.rs    OS keychain integration
└── test/                  Test setup files
```

## RFCs

Major design decisions follow an RFC (Request for Comments) process. RFCs live in `docs/rfc/` and go through these stages:

1. **Draft** — Initial proposal
2. **Review** — Open for team feedback
3. **Accepted** — Approved for implementation
4. **Implemented** — Code merged
5. **Deferred** — Postponed for later consideration

To propose a change, create a new RFC following the template in `docs/rfc/README.md`.

## Releasing

Production builds are created via:

```bash
# Tauri build (creates platform-specific bundle)
pnpm desktop:build
```

Release binaries are published to [GitHub Releases](https://github.com/luban-ws/hetu/releases).
