import keytar from "keytar";
import { ipcMain } from "electron";
import { IPC_EVENTS } from "@common/ipc-events";

const app = "Explorasa Git";
let window = null;

function init(win) {
  window = win;

  // 注册 IPC 事件监听器
  ipcMain.on(IPC_EVENTS.SECURE.CLEAR_CACHE, (event, arg) => {
    clearCache().then(() => {
      event.sender.send(IPC_EVENTS.SECURE.CACHE_CLEARED);
    });
  });
}

function getPass(account) {
  return keytar.getPassword(app, account).then((result) => {
    if (!result) {
      return "";
    } else {
      return result;
    }
  });
}

function setPass(account, password) {
  if (account && password) {
    return keytar.setPassword(app, account, password).catch((err) => {
      window.webContents.send(IPC_EVENTS.SECURE.SET_PASSWORD_FAILED, {
        error: "GENERIC",
        detail: err,
      });
    });
  }
}

function clearCache() {
  return keytar
    .findCredentials(app)
    .then((creds) => {
      let reqs = [];
      creds.forEach((c) => {
        reqs.push(keytar.deletePassword(app, c.account));
      });
      return Promise.all(reqs);
    })
    .catch((err) => {
      window.webContents.send(IPC_EVENTS.SECURE.CLEAR_CACHE_FAILED, {
        error: "GENERIC",
        detail: err,
      });
    });
}

function clearRepoCache(repoID) {
  return keytar.findCredentials(app).then((creds) => {
    let reqs = [];
    creds.forEach((c) => {
      if (c.indexOf(repoID) !== -1) {
        reqs.push(keytar.deletePassword(app, c.account));
      }
    });
    return Promise.all(reqs);
  });
}

export { getPass, setPass, init, clearCache, clearRepoCache };
