import { app, BrowserWindow, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { getLogger } from "@common/logger";

const logger = getLogger("main");

// 导入基础设施模块
import { init as initRepoCommandHandler } from "./git/repo-command-handler.js";
import * as settingsModule from "./infrastructure/settings.js";
import { init as initAutoUpdater } from "./infrastructure/auto-updater.js";
import * as secureModule from "./infrastructure/secure.js";
import { init as initAppVeyor } from "./ci-integration/appveyor.js";
import { init as initJira } from "./jira-integration/jira.js";

// 导入 Git 相关模块
import {
  init as initRepo,
  wrappedFetchRepo,
  wrappedGetCurrentRemotes,
  wrappedGetCurrentFirstRemote,
  wrappedPullWrapper,
  wrappedCloseRepo,
  wrappedOpenRepo,
} from "./git/repo.js";
import { init as initFileWatcher } from "./git/file-watcher.js";
import { init as initAutoFetch } from "./git/auto-fetch.js";
import { init as initSubmodules } from "./git/submodules.js";
import { init as initRepoHistory, updateRepos } from "./git/repo-history.js";

// 导入其他基础设施模块
import { init as initCache } from "./infrastructure/cache.js";
import { init as initReleaseNote } from "./infrastructure/release-note.js";
import { init as initShell } from "./infrastructure/shell.js";
import { repoOperations } from "./git/operations/repo-operations.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global error handling to suppress verbose electron-updater errors
process.on("unhandledRejection", (reason, promise) => {
  if (
    reason &&
    typeof reason === "object" &&
    (reason.message?.includes("406") ||
      reason.message?.includes("Cannot parse releases feed") ||
      reason.message?.includes("HttpError"))
  ) {
    // Silently ignore expected auto-updater errors
    logger.debug("Auto-updater error suppressed");
    return;
  }
  // Log other unhandled rejections normally
  logger.error("Unhandled promise rejection:", reason);
});

// Keep a global reference of the window object
let win;

// 模块实例存储
let settingsInstance = null;
let secureInstance = null;
let cacheInstance = null;
let fileWatcherInstance = null;
let repoHistoryInstance = null;
let repoInstance = null;

// 创建 settings 对象实例
const settingsObj = {
  get: (key) => {
    try {
      const value = settingsModule.get(key);
      return value !== undefined ? value : null;
    } catch (error) {
      logger.error(`Error getting setting ${key}:`, error);
      return null;
    }
  },
  update: (key, value) => {
    try {
      return settingsModule.update(key, value);
    } catch (error) {
      logger.error(`Error updating setting ${key}:`, error);
    }
  },
  setRepo: (repo) => {
    try {
      return settingsModule.setRepo(repo);
    } catch (error) {
      logger.error("Error setting repo:", error);
    }
  },
  getRepos: () => {
    try {
      return settingsModule.getRepos();
    } catch (error) {
      logger.error("Error getting repos:", error);
      return [];
    }
  },
  removeRepo: (path) => {
    try {
      return settingsModule.removeRepo(path);
    } catch (error) {
      logger.error("Error removing repo:", error);
    }
  },
  updateRepoSetting: (key, value) => {
    try {
      return settingsModule.updateRepoSetting(key, value);
    } catch (error) {
      logger.error(`Error updating repo setting ${key}:`, error);
    }
  },
};

// 创建 secure 对象实例
const secureObj = {
  getPass: (account) => secureModule.getPass(account),
  setPass: (account, password) => secureModule.setPass(account, password),
  clearCache: () => secureModule.clearCache(),
  clearRepoCache: (repoID) => secureModule.clearRepoCache(repoID),
};

function createWindow() {
  // 根据操作系统选择图标文件
  let iconPath;
  if (process.platform === "win32") {
    iconPath = path.join(__dirname, "../../build/icon.ico");
  } else if (process.platform === "darwin") {
    iconPath = path.join(__dirname, "../../build/icon.icns");
  } else {
    // Linux 使用 PNG 格式
    iconPath = path.join(__dirname, "../../build/Icon-512.png");
  }

  // Create the browser window.
  win = new BrowserWindow({
    icon: iconPath, // 设置应用图标
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/index.js"),
    },
  });

  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Quit",
          accelerator: "CommandOrControl+q",
          click() {
            app.quit();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Refresh",
          accelerator: "F5",
          click() {
            win.reload();
          },
        },
      ],
    },
    {
      label: "Dev",
      submenu: [
        {
          label: "Toggle Dev Tools",
          accelerator: "F12",
          click() {
            win.toggleDevTools();
          },
        },
      ],
    },
  ];

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // Load the app
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5174");
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  win.on("closed", () => {
    win = null;
  });

  win.maximize();
}

app.on("ready", () => {
  createWindow();

  // 初始化基础设施模块（按依赖顺序）
  settingsModule.init(win, null); // settings 需要 window 和 secure
  settingsInstance = settingsObj;

  secureModule.init(win); // secure 需要 window
  secureInstance = secureObj;

  initCache(settingsInstance, win); // cache 需要 settings 和 window
  initAutoUpdater(win, settingsInstance); // auto-updater 需要 window 和 settings
  initReleaseNote(settingsInstance, win); // release-note 需要 settings 和 window
  initShell(); // shell 不需要参数

  // 初始化 Git 相关模块
  initFileWatcher(win); // file-watcher 需要 window
  initAutoFetch(win, settingsInstance); // auto-fetch 需要 window 和 settings
  initSubmodules(win); // submodules 需要 window
  initRepoHistory(settingsInstance, win); // repo-history 需要 settings 和 window
  
  // Create repo history instance for the new system
  const repoHistoryInstance = {
    updateRepos: updateRepos
  };
  
  initRepo(win, settingsInstance, repoHistoryInstance, null); // repo 需要 window, settings, history, file-watcher

  // 创建 repo 对象实例 - 桥接新旧系统API差异
  const repoInstance = {
    // Basic repository operations
    fetchRepo: wrappedFetchRepo,
    getCurrentRemotes: wrappedGetCurrentRemotes,
    getCurrentFirstRemote: wrappedGetCurrentFirstRemote,
    pullWrapper: wrappedPullWrapper,
    closeRepo: wrappedCloseRepo,
    openRepo: wrappedOpenRepo,
    initRepo: async (path) => {
      try {
        await repoOperations.initRepo(path);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },

    // Git operations - bridge to new system
    push: async (username, password, force) => {
      try {
        return await repoOperations.pushWrapper({ username, password, force });
      } catch (error) {
        throw error;
      }
    },

    // Commit operations
    getCommitDetails: async (commit) => {
      try {
        const commits = await repoOperations.getCommits(1, commit);
        return commits.length > 0 ? commits[0] : null;
      } catch (error) {
        throw error;
      }
    },

    commitStaged: async (name, email, message) => {
      try {
        return await repoOperations.commitWrapper(message, {
          author: { name, email },
        });
      } catch (error) {
        throw error;
      }
    },

    commit: async (name, email, message, files) => {
      try {
        // Stage files first, then commit
        if (files && files.length > 0) {
          for (const file of files) {
            await repoOperations.stageFile(file);
          }
        }
        return await repoOperations.commitWrapper(message, {
          author: { name, email },
        });
      } catch (error) {
        throw error;
      }
    },

    // Staging operations
    stage: async (paths) => {
      try {
        if (Array.isArray(paths)) {
          for (const path of paths) {
            await repoOperations.stageFile(path);
          }
        } else {
          await repoOperations.stageFile(paths);
        }
        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    },

    unstage: async (paths) => {
      try {
        if (Array.isArray(paths)) {
          for (const path of paths) {
            await repoOperations.unstageFile(path);
          }
        } else {
          await repoOperations.unstageFile(paths);
        }
        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    },

    stageLines: async (path, lines) => {
      try {
        // For now, stage the entire file
        await repoOperations.stageFile(path);
        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    },

    unstageLines: async (path, lines) => {
      try {
        // For now, unstage the entire file
        await repoOperations.unstageFile(path);
        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    },

    // Branch operations
    createBranch: async (name, commit, force) => {
      try {
        return await repoOperations.createBranch(name, commit);
      } catch (error) {
        throw error;
      }
    },

    checkout: async (branch) => {
      try {
        return await repoOperations.switchBranch(branch);
      } catch (error) {
        throw error;
      }
    },

    deleteBranch: async (name, username, password) => {
      try {
        const result = await repoOperations.deleteBranch(name, false);
        return { upstream: false }; // Simplified for now
      } catch (error) {
        throw error;
      }
    },

    // Stash operations
    stash: async (name, email, message) => {
      try {
        return await repoOperations.stashSave(message, {});
      } catch (error) {
        throw error;
      }
    },

    pop: async (index) => {
      try {
        return await repoOperations.stashPop(index || 0);
      } catch (error) {
        throw error;
      }
    },

    apply: async (index) => {
      try {
        return await repoOperations.stashApply(index || 0);
      } catch (error) {
        throw error;
      }
    },

    deleteStash: async (index) => {
      try {
        return await repoOperations.stashDrop(index);
      } catch (error) {
        throw error;
      }
    },

    // Reset operations
    discardAll: async () => {
      try {
        return await repoOperations.resetWrapper("hard", "HEAD");
      } catch (error) {
        throw error;
      }
    },

    resetHard: async (commit) => {
      try {
        return await repoOperations.resetWrapper("hard", commit);
      } catch (error) {
        throw error;
      }
    },

    resetSoft: async (commit) => {
      try {
        return await repoOperations.resetWrapper("soft", commit);
      } catch (error) {
        throw error;
      }
    },

    // Tag operations
    createTag: async (targetCommit, name) => {
      try {
        return await repoOperations.createTag(name, targetCommit);
      } catch (error) {
        throw error;
      }
    },

    deleteTag: async (name) => {
      try {
        return await repoOperations.deleteTag(name);
      } catch (error) {
        throw error;
      }
    },

    pushTag: async (username, password, name, deleteTag) => {
      try {
        // For now, just resolve - push tag functionality needs to be implemented
        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    },
  };

  // 初始化集成模块
  initAppVeyor(settingsInstance, secureInstance, win, null); // appveyor 需要 settings, secure, window, cache
  initJira(settingsInstance, secureInstance, win); // jira 需要 settings, secure, window
  initRepoCommandHandler(repoInstance, settingsInstance, secureInstance); // repo-command-handler 需要 repo, settings, secure
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
