<div align="center">
  <img src="./build/Icon-128.png" alt="Hetu logo" width="88" />

  <h1>河图 Hetu</h1>
  <p><strong>Subway-Map Git Client</strong></p>
  <p>以“河图”之意重塑 Git 历史：让分支关系像地铁线路一样清晰可读。</p>

  <p>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-0A66C2.svg" alt="MIT License" /></a>
    <a href="https://tauri.app/"><img src="https://img.shields.io/badge/Tauri-2.0-F08A24.svg" alt="Tauri 2" /></a>
    <a href="https://github.com/rust-lang/git2-rs"><img src="https://img.shields.io/badge/Rust-git2--rs-9A5A2E.svg" alt="Rust git2-rs" /></a>
    <a href="https://angular.dev/"><img src="https://img.shields.io/badge/Angular-18-C3002F.svg" alt="Angular" /></a>
  </p>

  <img src="./misc/metrogit3.PNG" alt="Hetu overview" width="860" />
</div>

---

## 产品定位

Hetu 是一个原生桌面 Git 客户端，基于 **Tauri + Rust + Angular**。  
核心目标是把复杂提交历史映射为「线路图」：分支、合并、回退、并行开发一眼可见。

> 延续声明：Hetu fork 自 [Yamazaki93/MetroGit](https://github.com/Yamazaki93/MetroGit)，并在其基础上持续维护与演进。

## 功能总览

<table>
  <tr>
    <td width="50%">
      <h3>Subway-Map 可视化</h3>
      <p>将提交历史渲染为线路图，降低复杂分支认知成本。</p>
      <img src="./misc/metrogit1.PNG" alt="Main map view" width="100%" />
    </td>
    <td width="50%">
      <h3>Diff 细节审查</h3>
      <p>支持 Hunk / File 两种视图，快速定位改动上下文。</p>
      <img src="./misc/metrogit3.PNG" alt="Diff detail view" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>JIRA 原生集成</h3>
      <p>在提交上下文内查看 Issue、子任务、评论与状态。</p>
      <img src="./misc/metrogit4.PNG" alt="JIRA integration" width="100%" />
    </td>
    <td width="50%">
      <h3>CI 状态联动</h3>
      <p>提交级构建状态映射到线路节点，异常更早暴露。</p>
      <img src="./misc/metrogit5.PNG" alt="CI integration" width="100%" />
    </td>
  </tr>
</table>

### 其他能力

- Pull / Push / Commit / Stash / Pop / Create Branch
- OS 原生凭证存储（macOS Keychain / Windows Credential Manager / Linux Secret Service）
- 仓库级设置隔离
- 变更审查与 hunk 级操作

## 技术栈

| Layer | Technology |
|---|---|
| Desktop shell | [Tauri 2](https://tauri.app/) |
| Backend | [Rust](https://www.rust-lang.org/) + [git2-rs](https://github.com/rust-lang/git2-rs) |
| Frontend | [Angular](https://angular.dev/) + TypeScript |
| Visual icons | [Feather Icons](https://feathericons.com/) |

## 快速开始

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

> Legacy Electron path (`npm run dev`) is retained temporarily and will be removed later.

## 文档入口

| Resource | Description |
|---|---|
| [Tauri Dev Guide](./docs/tauri.md) | Tauri 构建、运行、调试 |
| [RFCs](./docs/rfc/README.md) | 架构决策与设计文档 |
| [Roadmap](./ROADMAP.md) | 迁移阶段与任务追踪 |

## Support

If Hetu helps your workflow, consider supporting the project.

<a href="https://www.buymeacoffee.com/PpVB0uO" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

[Report a Bug](https://github.com/luban-ws/hetu/issues) · [Request a Feature](https://github.com/luban-ws/hetu/issues)

## License

MIT © Ming-Hung (Michael) Lu
