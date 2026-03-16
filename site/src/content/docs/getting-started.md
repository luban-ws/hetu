---
title: Getting Started
description: Install and run Hetu on your machine.
order: 1
---

# Getting Started

Hetu is a native desktop application built with Tauri 2 + Rust + Angular. You can download a pre-built binary or build from source.

## Prerequisites

- **Node.js** 22 or later
- **pnpm** 10 or later
- **Rust** 1.70 or later (for the Tauri shell)

## Quick Start (Development)

```bash
# Clone the repository
git clone https://github.com/luban-ws/hetu.git
cd hetu

# Install all workspace dependencies
pnpm install

# Launch Tauri dev mode (opens the app with hot-reload)
pnpm desktop:tauri:dev
```

The app opens automatically. Angular frontend changes hot-reload; Rust backend changes require a restart.

## Production Build

```bash
# Build a production binary for your platform
pnpm desktop:tauri:build
```

The compiled binary is placed in `apps/desktop/src-tauri/target/release/bundle/`.

## Running Tests

```bash
# Angular component tests (Vitest)
pnpm --filter @luban-ws/desktop test

# Rust unit tests
cd apps/desktop/src-tauri && cargo test
```

## Monorepo Structure

Hetu uses **pnpm workspaces** + **Turborepo** for monorepo management:

| Directory | Package | Contents |
|-----------|---------|----------|
| `apps/desktop/` | `@luban-ws/desktop` | Tauri desktop app (Rust + Angular) |
| `apps/desktop/src/renderer/` | — | Angular frontend |
| `apps/desktop/src-tauri/` | — | Rust backend (Tauri commands, Git ops) |
| `packages/` | — | Shared Angular components (planned) |
| `site/` | `@luban-ws/site` | Documentation & showcase site (Astro) |
| `docs/rfc/` | — | Technical design documents |

## Root Scripts

| Command | Description |
|---------|-------------|
| `pnpm desktop:dev` | Start Tauri dev mode |
| `pnpm desktop:build` | Build production Tauri binary |
| `pnpm site:dev` | Start documentation site dev server |
| `pnpm site:build` | Build documentation site |
| `pnpm test` | Run all workspace tests |

## Next Steps

- Read the [Architecture](/docs/architecture) overview to understand how the pieces fit together.
- Check out the [Features](/docs/features) page for a detailed walkthrough.
- See the [Configuration](/docs/configuration) guide for settings and credentials.
- Read the [Development](/docs/development) guide for contributing.
