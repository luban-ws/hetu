import { ipcMain } from "electron";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import { IPC_EVENTS  } from '@common/ipc-events';

let settings;
let window;

function updateRepos(event, arg) {
  let repos = settings.getRepos();
  let repoHistory = repos.map((r) => {
    return {
      name: r.name,
      path: r.workingDir,
    };
  });
  window.webContents.send(IPC_EVENTS.REPO.HISTORY_CHANGED, { history: repoHistory });
}

function removeHistory(event, arg) {
  settings.removeRepo(arg.workingDir);
  updateRepos();
}

export function init(sett, win) {
  settings = sett;
  window = win;

  // 注册 IPC 事件监听器
  ipcMain.on(IPC_EVENTS.SETTINGS.INIT, updateRepos);
  ipcMain.on(
    IPC_EVENTS.REPO.REMOVE_HISTORY,
    requireArgParams(removeHistory, ["workingDir"])
  );
}

export { updateRepos };
