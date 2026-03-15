import { autoUpdater } from "electron-updater";
import { ipcMain } from "electron";
import { IPC_EVENTS  } from '@common/ipc-events';
import { getLogger } from "@common/logger";

const logger = getLogger("auto-updater");
let window;
let settings;

autoUpdater.autoDownload = false;

// Suppress verbose electron-updater logging
autoUpdater.logger = {
  debug: () => {}, // Suppress debug logs
  info: (msg) => {
    if (msg && !msg.includes("406") && !msg.includes("HttpError")) {
      logger.debug(msg);
    }
  },
  warn: (msg) => {
    if (msg && !msg.includes("406") && !msg.includes("HttpError")) {
      logger.debug(msg);
    }
  },
  error: (msg) => {
    if (msg && !msg.includes("406") && !msg.includes("HttpError") && !msg.includes("Cannot parse releases feed")) {
      logger.debug("Auto-updater error occurred");
    }
  }
};

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
  // Only log HTTP status code for 406 errors, not the full error details
  if (error.message && error.message.includes("406")) {
    logger.debug("Auto-updater: No production release available (HTTP 406)");
  } else if (error.message && error.message.includes("HttpError")) {
    logger.debug(`Auto-updater: HTTP error occurred`);
  } else {
    logger.error(`Auto-updater error: ${error.message}`);
  }
  
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
      logger.debug("Checking for updates...");
      autoUpdater.checkForUpdates().catch((error) => {
        // Silently handle 406 errors (no production release)
        if (error.message && error.message.includes("406")) {
          logger.debug("No production release available");
        } else {
          logger.warn(`Update check failed: ${error.message?.substring(0, 100)}`);
        }
        
        if (window && window.webContents) {
          window.webContents.send(IPC_EVENTS.UPDATER.CHECKING, {
            inProgress: false,
          });
          // Don't send error to UI for expected 406 errors
          if (!error.message?.includes("406")) {
            window.webContents.send("Updater", {
              msg: "error",
              error: error.message || "Failed to check for updates",
            });
          }
        }
      });
    } catch (error) {
      logger.warn(`Error in checkUpdate: ${error.message}`);
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
