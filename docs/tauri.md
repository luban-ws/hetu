# Tauri 构建与运行（RFC 0001）

本应用在保留 Electron 的同时，支持以 Tauri 2 为壳运行前端（Angular）。当前阶段仅完成壳迁移与最小命令（`ping`、`get_app_version`），Git/凭证/JIRA/CI 仍由 Electron 提供，直至后续 RFC 迁移。

## 前置条件

- Node.js（见 `package.json` 中 volta 或 engines）
- Rust 工具链：`rustup`、`cargo`（如 `rustc 1.75+`）
- 首次运行 Tauri 前需先执行一次前端构建：`npm run build`

## 开发模式

1. 启动前端开发服务器（占端口 5174）：需在项目根目录先运行渲染进程开发服务，使 `http://localhost:5174` 可访问。
   - 若使用 electron-vite，可单独启动 renderer 或运行 `npm run dev` 后另开终端。
2. 在项目根目录执行：`npm run tauri dev`
3. Tauri 窗口会打开并加载 `http://localhost:5174` 的 Angular 应用。
4. 在 Tauri 窗口内打开 DevTools，可验证命令：  
   `await window.__TAURI__.core.invoke('ping')`、  
   `await window.__TAURI__.core.invoke('get_app_version')`

## 生产构建与运行

1. 在项目根目录执行：`npm run tauri build`  
   - 会先执行 `npm run build`（electron-vite 构建），再执行 `tauri build`。
2. 构建产物位置（示例）：
   - macOS: `src-tauri/target/release/bundle/mac/explorasa-git.app`
   - 其他平台见 Tauri 文档或 `src-tauri/target/release/bundle/` 下目录。
3. 安装或直接运行该产物，确认窗口与 Angular UI 正常加载。

## 与 Electron 的关系

- 当前 **默认与主要支持的桌面壳仍为 Electron**（`npm run dev`、`npm run electron:build` 等）。
- Tauri 构建与 Electron 代码 **并存**，后续 RFC 将逐步迁移能力并最终移除 Electron。
- 前端通过 `TauriBridgeService.isTauri` 判断运行环境，仅在 Tauri 下使用 `invoke()` 调用 Tauri 命令；在 Electron 下仍使用现有 IPC。

## 参考

- [RFC 0001: Tauri Migration](./rfc/0001-wasm-git-migration.md)
- [ROADMAP 阶段 1](./ROADMAP.md#阶段-1tauri-壳迁移rfc-0001)
