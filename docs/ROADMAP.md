# Hetu (河图) 迁移路线图

本文档定义从 **Electron + 多 Git 后端** 迁移到 **Tauri + Rust Git** 的总体路线与质量标准，确保交付高质量、可维护的成果。执行时以各 RFC 的 **Implementation Plan** 为准；本路线图规定阶段顺序、质量门禁和完成定义。

---

## 原则

- **一个 RFC 一件事**：每个 RFC 对应单一可验证目标，完成质量门禁后再进入下一个 RFC。
- **小步快走**：每个 RFC 足够小，可以在几天内完成并验证，避免大规模未经验证的变更。
- **质量门禁**：每个 RFC 结束前必须通过本节定义的检查项，否则不视为完成。
- **可追溯**：实现状态在对应 RFC 的 Implementation Status 中更新；重大决策与变更记录在 RFC 或本路线图中。

---

## 阶段总览

| 阶段 | RFC | 目标 | 依赖 | 预估 |
|------|-----|------|------|------|
| **1a** | 0001 | Tauri 壳脚手架：窗口 + 最小命令 | — | ~2-3 天 |
| **1b** | 0002 | 独立前端构建：脱离 electron-vite | 0001 | ~1 天 |
| **1c** | 0003 | DesktopAdapter 接口 + 适配器 + DI | 0002 | ~2-3 天 |
| **1d** | 0004 | 前端服务迁移：13 个服务切换到适配器 | 0003 | ~3-4 天 |
| **2a** | 0005 | Rust Git 核心（git2 实现 + Tauri 命令） | 0001 | ~3-4 周 |
| **2b** | 0006 | TauriAdapter Git 接线 + 端到端验证 | 0004, 0005 | ~1-2 周 |
| **3** | 0007 | 凭证存储迁移（Rust / OS keychain） | 0006 | ~1-2 周 |
| **4** | 0008 | JIRA / CI 迁移（Rust） | 0006 | ~2-3 周 |
| **5** | 0009 | 移除 Electron，仅 Tauri 构建 | 0007, 0008 | ~1-2 周 |
| **6** | — | 收尾：依赖清理、文档、发布 | 0009 | ~1 周 |

---

## 阶段 1a：Tauri 壳脚手架（RFC 0001）✅

### 交付物

- `src-tauri/` 目录结构完整，Rust 编译通过。
- `npm run tauri dev` 打开窗口并加载 Angular 界面。
- `invoke('ping')` 和 `invoke('get_app_version')` 可用。

### 质量门禁

| # | 检查项 | 如何验证 |
|---|--------|----------|
| 1.1 | Rust 编译 | `cargo build` 无错误 |
| 1.2 | 窗口显示 UI | `tauri dev` → 看到 Angular 应用 |
| 1.3 | 命令可调用 | DevTools: `invoke('ping')` → `"pong"` |
| 1.4 | Electron 不受影响 | `npm run dev` 仍然正常 |

---

## 阶段 1b：独立前端构建（RFC 0002）✅

### 交付物

- `vite.tauri.config.mjs` 可独立构建 Angular 渲染器。
- `tauri.conf.json` 的 `beforeDevCommand` / `beforeBuildCommand` 使用该配置。
- `npm run tauri dev` 自动启动 Vite 开发服务器。

### 质量门禁

| # | 检查项 | 如何验证 |
|---|--------|----------|
| 2.1 | 独立构建输出 | `npx vite build --config vite.tauri.config.mjs` 产出 `out/renderer/index.html` |
| 2.2 | Tauri dev 可用 | `npm run tauri dev` 启动 Vite + 打开窗口 |
| 2.3 | Tauri build 可用 | `npm run tauri build` 产出可运行包 |
| 2.4 | Electron 不受影响 | `npm run dev` 仍然正常 |

---

## 阶段 1c：DesktopAdapter 接口（RFC 0003）✅

### 交付物

- `DesktopAdapter` 接口 + `DESKTOP_ADAPTER` 注入令牌。
- `ElectronAdapter`：包装 `window.electronAPI`（含 git.* 方法映射和 gitEvents.* 事件映射）。
- `TauriAdapter`（存根）：仅 `ping` / `get_app_version` 可用。
- DI 工厂：检测 `window.__TAURI__` 选择适配器。

### 质量门禁

| # | 检查项 | 如何验证 |
|---|--------|----------|
| 3.1 | Electron 路径 | `npm run dev` 行为与之前完全一致（使用 ElectronAdapter） |
| 3.2 | Tauri 路径 | `npm run tauri dev` 使用 TauriAdapter，`invoke('ping')` 可用 |
| 3.3 | 服务未改动 | 所有服务仍注入 `ElectronService`（不在此 RFC 改） |

---

## 阶段 1d：前端服务迁移（RFC 0004）✅

### 交付物

- 全部 13 个服务/组件从 `ElectronService` / `window.electronAPI` 迁移到 `DesktopAdapter`。
- 3 处 `sendSync` 修复为 `invoke`（async）。
- `ElectronService` 和 `TauriBridgeService` 从 providers 移除。

### 质量门禁

| # | 检查项 | 如何验证 |
|---|--------|----------|
| 4.1 | Electron 全功能 | `npm run dev` — 完整应用功能正常 |
| 4.2 | 测试通过 | 所有 Angular 测试通过（mock `DESKTOP_ADAPTER`） |
| 4.3 | 无 Electron 耦合 | 服务代码中无 `ElectronService` 或 `window.electronAPI` 引用 |
| 4.4 | Tauri 路径 | `npm run tauri dev` 窗口打开，TauriAdapter 被选中 |

---

## 阶段 2a：Rust Git 核心（RFC 0005）✅

### 交付物

- `git2` crate 集成，完整 Git 操作封装。
- 所有 `Repo-*` Tauri 命令实现，含事件发射。
- 单元测试覆盖主要成功与失败路径。

### 质量门禁

| # | 检查项 | 如何验证 |
|---|--------|----------|
| 5.1 | Rust 编译 | `cargo build` 无错误 |
| 5.2 | 单元测试 | `cargo test` 全部通过 |
| 5.3 | 命令注册 | 所有 Git 命令已注册并在 capabilities 中授权 |
| 5.4 | 错误序列化 | Git 错误返回 `{ code, message }` 结构 |

---

## 阶段 2b：TauriAdapter Git 接线（RFC 0006）✅

### 交付物

- `TauriAdapter.mapChannelToCommand()` 包含全部 `Repo-*` 映射。
- 端到端验证：在 Tauri 模式下打开仓库、查看状态、暂存、提交、推送/拉取。

### 质量门禁

| # | 检查项 | 如何验证 |
|---|--------|----------|
| 6.1 | E2E 流程 | `npm run tauri dev` — 打开仓库 → 查看提交 → 暂存 → 提交 → 推送/拉取 |
| 6.2 | Tauri 构建 | `npm run tauri build` 产出的应用 Git 功能完整 |
| 6.3 | Electron 不回归 | `npm run dev` 仍然正常 |
| 6.4 | 验证文档 | 各服务验证结果已记录 |

---

## 阶段 3：凭证存储迁移（RFC 0007）✅

- `keyring` crate 集成 OS 原生密钥链（macOS Keychain / Windows Credential Manager / Linux Secret Service）。
- `settings_store.rs` 管理 `~/Explorasa Git/settings.json` 和每仓库配置。
- `git2` 远程操作支持 HTTPS + SSH 双路凭证。
- 14 个新 Tauri 命令注册。

## 阶段 4：JIRA / CI 迁移（RFC 0008）✅

- `jira.rs`：8 个 JIRA REST API v2 操作（reqwest + Basic Auth）。
- `appveyor.rs`：构建历史、重建、日志获取（reqwest + Bearer token）。
- 11 个新 Tauri 命令注册。
- TauriAdapter 映射完成。

## 阶段 5–6 占位（延后）

- **阶段 5（自动更新 + 移除 Electron — RFC 0009）**：需要部署基础设施（更新服务器、签名密钥），已延后。
- **阶段 6（收尾）**：清理依赖、更新文档、发布。

---

## 高质量交付的通用要求

### 代码与设计

- **纯函数优先**（见 CLAUDE.md）：业务逻辑尽量为无副作用的纯函数；副作用集中在边界。
- **注释与文档**：新增 Rust 模块与公开函数有文档注释；Angular 侧新增/修改的桥接与服务有 JSDoc。
- **命名与结构**：命令与事件命名一致（统一 `repo_*`）；目录与模块划分与 RFC 一致。

### 测试

- **单元测试**：Rust 侧 Git 封装有单元测试；关键路径覆盖成功与失败分支。
- **集成测试**：临时仓库或 fixture 上跑完整操作链。
- **E2E / 手动**：每阶段至少一次在目标平台安装并执行核心流程。

### 可维护性

- **依赖**：仅引入必要依赖；版本固定或范围明确。
- **错误与日志**：错误信息有帮助；敏感信息不写入日志。

### 安全

- **IPC / 命令**：仅暴露需要的命令；Tauri capabilities 最小权限。
- **凭证**：不在日志中明文传递密码/token。

---

## 如何用本路线图

1. **规划**：按 RFC 编号顺序执行；当前 RFC 质量门禁全部通过后再进入下一个。
2. **执行**：以 RFC 的 Implementation Plan 为步骤清单，逐项完成并更新 Implementation Status。
3. **验收**：RFC 完成时按本路线图该阶段的"质量门禁"逐项验证。
4. **更新**：新 RFC 创建后在本路线图中补全对应阶段。

---

## 文档与规范引用

- **代码与文档规范**：见 [CLAUDE.md](../CLAUDE.md)
- **RFC 流程与模板**：见 [docs/rfc/README.md](./rfc/README.md)
- **各 RFC 详细步骤**：见 `docs/rfc/` 目录下各文件
