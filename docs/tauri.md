# Tauri 开发指南

Hetu (河图) 使用 **Tauri 2 + Rust** 作为桌面壳，Angular 作为前端。本文档面向开发者，涵盖构建、运行和调试流程。

## 前置条件

| 工具 | 版本要求 |
|------|---------|
| Node.js | 20+ |
| Rust | 1.70+（`rustup`、`cargo`） |
| npm | 随 Node.js 安装 |

## 开发模式

```bash
# 安装前端依赖（首次或依赖变更后）
npm install

# 启动 Tauri 开发模式（自动启动前端 dev server + Rust 编译）
npm run tauri:dev
```

Tauri 窗口会自动打开，前端变更热重载；Rust 变更需重启。

## 生产构建

```bash
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/`：

| 平台 | 路径 |
|------|------|
| macOS | `bundle/macos/Hetu.app` |
| Windows | `bundle/msi/` 或 `bundle/nsis/` |
| Linux | `bundle/appimage/` 或 `bundle/deb/` |

## 架构概览

```
Angular Frontend  ←──  Tauri IPC  ──→  Rust Backend
(src/renderer/)        invoke/emit      (src-tauri/src/)
```

- **IPC 通信**：`invoke`（请求-响应）和 `emit`/`listen`（事件推送）
- **前端适配层**：`DesktopAdapter` 注入令牌（`src/renderer/app/infrastructure/tauri-adapter.ts`）解耦 IPC 与业务逻辑
- **设置持久化**：`settings_store.rs` 管理 `~/Hetu/settings.json`
- **Git 操作**：通过 `git2-rs` crate 在 Rust 端执行

## Rust 后端模块

| 模块 | 职责 |
|------|------|
| `commands/repo_browse.rs` | 仓库浏览与历史记录命令 |
| `commands/git_cmd.rs` | Git 操作命令（status、commit、push、pull 等） |
| `git_*.rs` | Git 底层操作封装 |
| `settings_store.rs` | JSON 设置读写 |
| `repo_history.rs` | 最近仓库与当前活跃仓库管理 |
| `credential_*.rs` | 操作系统原生凭证存储 |

## 与 Electron 的关系

Electron 构建路径（`npm run dev`）作为 **遗留** 选项仍然保留，将在后续版本移除。**Tauri 是主要且推荐的桌面壳。**

## 调试技巧

- 在 Tauri 窗口中 `Cmd+Option+I`（macOS）或 `F12`（Windows/Linux）打开 DevTools
- Rust 日志：设置 `RUST_LOG=debug` 环境变量
- 前端日志：浏览器控制台正常输出

## 参考

- [RFC 0001: Tauri Shell Scaffold](./rfc/0001-tauri-shell-scaffold.md)
- [RFC 0005: Rust Git Core](./rfc/0005-rust-git-core.md)
- [Roadmap](../ROADMAP.md)
