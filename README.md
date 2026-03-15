
<img src="./build/Icon-48.png">

# Hetu (河图) — Subway-Map Git Client

Hetu is a native desktop Git client with a subway-map style branch visualization, JIRA and AppVeyor integration — all in one consistent UI. Built with **Tauri + Rust + Angular**.

## Feature Highlight

 - Subway map style git visualization with commit details
 - Basic repo operations (pull, push, commit, stash, pop, create branch)
 - JIRA integration with native UI
 - Map integrated AppVeyor build status with periodic update and on-demand log download
 - OS-native credential storage (macOS Keychain, Windows Credential Manager, Linux Secret Service)
 - Repository specific settings

## Built On

- [Tauri 2](https://tauri.app/) — Rust desktop shell
- [Angular](https://angular.io/) — Frontend framework
- [git2](https://github.com/rust-lang/git2-rs) — Rust Git implementation
- [Feather Icons](https://feathericons.com/) — Icon set

## Getting Started

### Prerequisites

- Node.js 20+
- Rust 1.70+
- npm

### Development

```bash
# Install JS dependencies
npm install

# Run Tauri dev (opens app with hot-reload)
npm run tauri:dev

# Run Electron dev (legacy)
npm run dev
```

### Building

```bash
# Tauri production build
npm run tauri:build

# Electron production build
npm run electron:build
```

### Testing

```bash
# Frontend tests
npm test

# Rust tests
cd src-tauri && cargo test
```

## Support this app

If you like this app, find it useful or just like the subway map visualization, I'd love to hear your feedback — share with `admin@rhodiumcode.com`

<a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/mjCsGWDTS"><img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Buy me a tea"><span style="margin-left:5px">Buy me a tea</span></a>

## Documentation

- [RFCs](./docs/rfc/README.md) - Technical design documents and architectural decisions
- [Roadmap](./docs/ROADMAP.md) - Migration roadmap and phase tracking

## Issues

If you've found a bug, security issue or want to suggest a feature, feel free to post them to the Issues section.

## License

MIT © Ming-Hung (Michael) Lu
