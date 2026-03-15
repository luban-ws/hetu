import { ipcMain } from "electron";
import { IPC_EVENTS  } from '@common/ipc-events';
let window = null;
let settings = null;
let autoFetchInterval = 1;
let autoFetch = null;

function init(win, stt) {
  window = win;
  settings = stt;

  window.on("close", (event) => {
    clearInterval(autoFetch);
  });

  // 注册 IPC 事件监听器
  ipcMain.on(IPC_EVENTS.SETTINGS.SET, (event, arg) => {
    if (
      arg.app_settings &&
      arg.app_settings["gen-autofetchinterval"] !== undefined
    ) {
      autoFetchInterval = Number(arg.app_settings["gen-autofetchinterval"]);
      registerAutoFetch();
    }
  });

  initAutoFetchSettings();
  registerAutoFetch();
}

function initAutoFetchSettings() {
  if (!settings.get("gen-autofetchinterval")) {
    settings.update("gen-autofetchinterval", autoFetchInterval);
  } else {
    autoFetchInterval = Number(settings.get("gen-autofetchinterval"));
  }
}

function registerAutoFetch() {
  UnregisterAutoFetch();
  if (autoFetchInterval > 0) {
    autoFetch = setInterval(() => {
      if (window) {
        window.webContents.send(IPC_EVENTS.AUTO_FETCH.TIMEOUT);
      }
    }, autoFetchInterval * 60 * 1000);
  }
}

function UnregisterAutoFetch() {
  if (autoFetch) {
    clearInterval(autoFetch);
  }
}

export { init };
