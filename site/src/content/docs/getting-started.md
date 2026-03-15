---
title: Getting Started
description: Install and run Hetu on your machine.
order: 1
---

# Getting Started

Hetu is a native desktop application. You can download a pre-built binary or build from source.

## Prerequisites

- **Node.js** 20 or later
- **Rust** 1.70 or later (for building the Tauri shell)
- **npm**

## Quick Start (Development)

```bash
# Clone the repository
git clone https://github.com/luban-ws/hetu.git
cd hetu

# Install JavaScript dependencies
npm install

# Launch Tauri dev mode (opens the app with hot-reload)
npm run tauri:dev
```

The app will open automatically. Changes to the Angular frontend will hot-reload; Rust backend changes require a restart.

## Production Build

```bash
# Build a production binary for your platform
npm run tauri:build
```

The compiled binary is placed in `src-tauri/target/release/bundle/`.

## Running Tests

```bash
# Frontend unit tests (Vitest + Angular)
npm test

# Rust unit tests
cd src-tauri && cargo test
```

## Project Structure

| Directory | Contents |
|-----------|----------|
| `src/renderer/` | Angular frontend application |
| `src-tauri/` | Rust backend (Tauri commands, Git operations) |
| `docs/rfc/` | Technical design documents |
| `site/` | This documentation site (Astro) |

## Next Steps

- Read the [Architecture](/docs/architecture) overview to understand how the pieces fit together.
- Check out the [Features](/docs/features) page for a detailed walkthrough.
