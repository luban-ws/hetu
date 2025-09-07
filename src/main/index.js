import { app, BrowserWindow, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";

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
import { init as initRepoHistory } from "./git/repo-history.js";

// 导入其他基础设施模块
import { init as initCache } from "./infrastructure/cache.js";
import { init as initReleaseNote } from "./infrastructure/release-note.js";
import { init as initShell } from "./infrastructure/shell.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      console.error(`Error getting setting ${key}:`, error);
      return null;
    }
  },
  update: (key, value) => {
    try {
      return settingsModule.update(key, value);
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
    }
  },
  setRepo: (repo) => {
    try {
      return settingsModule.setRepo(repo);
    } catch (error) {
      console.error("Error setting repo:", error);
    }
  },
  getRepos: () => {
    try {
      return settingsModule.getRepos();
    } catch (error) {
      console.error("Error getting repos:", error);
      return [];
    }
  },
  removeRepo: (path) => {
    try {
      return settingsModule.removeRepo(path);
    } catch (error) {
      console.error("Error removing repo:", error);
    }
  },
  updateRepoSetting: (key, value) => {
    try {
      return settingsModule.updateRepoSetting(key, value);
    } catch (error) {
      console.error(`Error updating repo setting ${key}:`, error);
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
  initRepo(win, settingsInstance, null, null); // repo 需要 window, settings, history, file-watcher

  // 创建 repo 对象实例
  const repoInstance = {
    fetchRepo: wrappedFetchRepo,
    getCurrentRemotes: wrappedGetCurrentRemotes,
    getCurrentFirstRemote: wrappedGetCurrentFirstRemote,
    pullWrapper: wrappedPullWrapper,
    closeRepo: wrappedCloseRepo,
    openRepo: wrappedOpenRepo,
    // 添加其他需要的函数
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
