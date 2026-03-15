<div align="center">

<img src="./build/Icon-128.png" alt="Hetu logo" width="80" />

# 河图 Hetu

**Subway-Map Git Client**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-orange.svg)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-git2--rs-brown.svg)](https://github.com/rust-lang/git2-rs)
[![Angular](https://img.shields.io/badge/Angular-18-red.svg)](https://angular.dev/)

A native desktop Git client that renders branch history as a beautiful, intuitive **subway map** — with JIRA and CI integration built in.

<br />

<img src="./misc/metrogit.gif" alt="Hetu demo" width="720" />

</div>

---

## Features

<table>
<tr>
<td width="50%">

### Subway-Map Visualization

Branches and commits rendered as colored metro lines. Merges, rebases, and parallel work — all clearly visible at a glance.

<img src="./misc/metrogit1.PNG" alt="Main view" width="100%" />

</td>
<td width="50%">

### Inline Diff Viewer

Review changes without leaving the app. Toggle between hunk and file views with syntax-highlighted diffs.

<img src="./misc/metrogit2.PNG" alt="Diff view" width="100%" />

</td>
</tr>
<tr>
<td width="50%">

### JIRA Integration

Native JIRA panel shows issue details, subtasks, and comments alongside your commits.

<img src="./misc/metrogit4.PNG" alt="JIRA integration" width="100%" />

</td>
<td width="50%">

### CI Build Status

AppVeyor build results per-commit on the map. Pass/fail indicators with on-demand log download.

<img src="./misc/metrogit5.PNG" alt="CI integration" width="100%" />

</td>
</tr>
</table>

### Also includes

- Pull / push / commit / stash / pop / create branch
- OS-native credential storage (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- Repository-specific settings
- Diff viewer with hunk staging

## Built With

| Component | Technology |
|-----------|-----------|
| Desktop shell | [Tauri 2](https://tauri.app/) |
| Backend | [Rust](https://www.rust-lang.org/) + [git2-rs](https://github.com/rust-lang/git2-rs) |
| Frontend | [Angular](https://angular.dev/) + TypeScript |
| Icons | [Feather Icons](https://feathericons.com/) |

## Getting Started

### Prerequisites

- Node.js 20+
- Rust 1.70+ (`rustup`, `cargo`)
- npm

### Development

```bash
npm install
npm run tauri:dev
```

### Production Build

```bash
npm run tauri:build
```

### Testing

```bash
npm test                       # Frontend (Vitest)
cd src-tauri && cargo test     # Rust backend
```

> The legacy Electron path (`npm run dev`) is still available but will be removed in a future release.

## Documentation

| Resource | Description |
|----------|-------------|
| [Tauri Dev Guide](./docs/tauri.md) | Build, run, and debug the Tauri app |
| [RFCs](./docs/rfc/README.md) | Technical design decisions |
| [Roadmap](./ROADMAP.md) | Migration phases and tracking |

## Support

If you like this app or find the subway-map visualization useful, I'd love to hear your feedback.

<a href="https://www.buymeacoffee.com/mjCsGWDTS" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Buy me a tea" height="20" /></a> [Buy me a tea](https://www.buymeacoffee.com/mjCsGWDTS) · [Report a Bug](https://github.com/luban-ws/hetu/issues) · [Request a Feature](https://github.com/luban-ws/hetu/issues)

## License

MIT © Ming-Hung (Michael) Lu
