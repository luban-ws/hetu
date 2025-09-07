import { autoUpdater } from "electron-updater";
import { ipcMain } from "electron";
import { IPC_EVENTS  } from '@common/ipc-events';
let window;
let settings;

autoUpdater.autoDownload = false;

autoUpdater.on("update-available", (info) => {
  if (window && window.webContents) {
    window.webContents.send(IPC_EVENTS.UPDATER.CHECKING, { inProgress: false });
    window.webContents.send("Updater", {
      msg: "update-available",
      version: info.version,
    });
  }
});
autoUpdater.on("update-not-available", () => {
  if (window && window.webContents) {
    window.webContents.send(IPC_EVENTS.UPDATER.CHECKING, { inProgress: false });
    window.webContents.send("Updater", { msg: "update-not-available" });
  }
});
autoUpdater.on("download-progress", (progress) => {
  if (window && window.webContents) {
    window.webContents.send("Updater", {
      msg: "downloading-update",
      percentage: progress.percent,
    });
  }
});
autoUpdater.on("update-downloaded", () => {
  if (window && window.webContents) {
    window.webContents.send("Updater", { msg: "download-complete" });
  }
});
autoUpdater.on("checking-for-update", () => {
  if (window && window.webContents) {
    window.webContents.send(IPC_EVENTS.UPDATER.CHECKING, { inProgress: true });
  }
});

// 添加错误处理
autoUpdater.on("error", (error) => {
  console.error("Auto-updater error:", error);
  if (window && window.webContents) {
    window.webContents.send(IPC_EVENTS.UPDATER.CHECKING, { inProgress: false });
    window.webContents.send("Updater", {
      msg: "error",
      error: error.message || "Unknown error occurred",
    });
  }
});

function init(win, sett) {
  window = win;
  settings = sett;

  // 注册 IPC 事件监听器
  ipcMain.on("Updater", (event, arg) => {
    if (arg === "commence-install-update") {
      settings.update("show-release-note", false);
      setImmediate(() => autoUpdater.quitAndInstall());
    } else if (arg === "commence-download") {
      autoUpdater.downloadUpdate();
    }
  });
  ipcMain.on(IPC_EVENTS.UPDATER.CHECK, (event, arg) => {
    checkUpdate();
  });

  // auto check update 30 secs after init
  setTimeout(() => {
    checkUpdate();
  }, 30 * 1000);
}

function checkUpdate() {
  if (window) {
    try {
      autoUpdater.checkForUpdates().catch((error) => {
        console.error("Failed to check for updates:", error);
        if (window && window.webContents) {
          window.webContents.send(IPC_EVENTS.UPDATER.CHECKING, {
            inProgress: false,
          });
          window.webContents.send("Updater", {
            msg: "error",
            error: error.message || "Failed to check for updates",
          });
        }
      });
    } catch (error) {
      console.error("Error in checkUpdate:", error);
      if (window && window.webContents) {
        window.webContents.send(IPC_EVENTS.UPDATER.CHECKING, {
          inProgress: false,
        });
        window.webContents.send("Updater", {
          msg: "error",
          error: error.message || "Failed to check for updates",
        });
      }
    }
  }
}

export { init };
