import { shell, ipcMain } from "electron";
import { IPC_EVENTS  } from '@common/ipc-events';

function init() {
  // 注册 IPC 事件监听器
  ipcMain.on(IPC_EVENTS.SHELL.OPEN, (event, arg) => {
    openUrl(arg.url);
  });
}

function openUrl(url) {
  shell.openExternal(url);
}

export { init };
