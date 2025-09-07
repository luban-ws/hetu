import fs from "fs";
import { homedir } from "os";
import { v4 as uuid } from "uuid";
import { ipcMain, dialog } from "electron";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import { IPC_EVENTS } from "@common/ipc-events";
import { getLogger } from "@common/logger";
import { safeSend } from "./ipc-wrapper.js";

const logger = getLogger('settings');

const homeDir = homedir();
const appDir = homeDir + "/Explorasa Git/";
let window;
let secureStorage;
let settingsFile;
let settingsObj = {
  app_settings: { langulage: "en" },
  repos: [],
  currentRepo: undefined,
};
let defaultSettings = settingsObj;
let repoSettingsObj = {};
let privContent = "";
let publicContent = "";

let save = function () {
  fs.writeFileSync(settingsFile, JSON.stringify(settingsObj), "utf8");
  saveRepoSettings();
};

function updateSSHKey() {
  if (get("auth-keypath") && get("auth-pubpath")) {
    publicContent = fs.readFileSync(get("auth-pubpath"), {
      encoding: "ascii",
    });
    privContent = fs.readFileSync(get("auth-keypath"), {
      encoding: "ascii",
    });
  } else {
    privContent = "";
    publicContent = "";
  }
}

async function openBrowseFolderDialog(event, arg) {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      title: "Select File",
    });

    if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
      event.returnValue = result.filePaths[0];
    } else {
      event.returnValue = "";
    }
  } catch (error) {
    console.error("Error opening file dialog:", error);
    event.returnValue = "";
  }
}
let load = function (path) {
  settingsObj = JSON.parse(fs.readFileSync(path));
  // backward compatible app settings initialization
  let defaultAppSettingKeys = Object.keys(settingsObj.app_settings);
  defaultAppSettingKeys.forEach((k) => {
    if (!settingsObj.app_settings[k]) {
      settingsObj.app_settings[k] = defaultSettings.app_settings[k];
    }
  });
  if (settingsObj.currentRepo) {
    initRepoSettings(settingsObj.currentRepo.id);
  }
  save();
  updateSSHKey();
  notifySettingsUpdated();
};

let notifySettingsUpdated = function () {
  let obj = {
    app_settings: settingsObj.app_settings,
    repo_settings: repoSettingsObj,
    current_repo: settingsObj.currentRepo,
  };
  safeSend(window.webContents, IPC_EVENTS.SETTINGS.UPDATED, {
    currentSettings: obj,
  });
  
  const effectiveSettings = getEffectiveSettings();
  safeSend(window.webContents, IPC_EVENTS.SETTINGS.EFFECTIVE_UPDATED, effectiveSettings);
};

let init = function (win, sec) {
  window = win;
  secureStorage = sec;
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir);
  }
  settingsFile = appDir + "settings.json";
  if (global.__is_dev) {
    settingsFile = "./settings.json";
  }
  if (!fs.existsSync(settingsFile)) {
    save();
  } else {
    load(settingsFile);
  }
  updateSSHKey();

  // 注册 IPC 事件监听器
  ipcMain.on(IPC_EVENTS.SETTINGS.INIT, (event, arg) => {
    notifySettingsUpdated();
  });
  ipcMain.on(IPC_EVENTS.SETTINGS.SET, (event, arg) => {
    if (arg.app_settings) {
      settingsObj.app_settings = arg.app_settings;
    }
    if (arg.repo_settings) {
      repoSettingsObj = arg.repo_settings;
    }
    save();
    updateSSHKey();
    notifySettingsUpdated();
  });
  ipcMain.on(
    IPC_EVENTS.SETTINGS.SET_SECURE_REPO,
    requireArgParams(setSecureRepoSetting, ["key", "value"])
  );
  ipcMain.on(
    IPC_EVENTS.SETTINGS.GET_SECURE_REPO,
    requireArgParams(getSecureRepoSetting, ["key"])
  );
  ipcMain.on(IPC_EVENTS.SETTINGS.BROWSE_FILE, openBrowseFolderDialog);
};

function setSecureRepoSetting(event, arg) {
  if (settingsObj.currentRepo) {
    secureStorage.setPass(
      `${arg.key}@${settingsObj.currentRepo.id}`,
      arg.value
    );
  }
}

function getSecureRepoSetting(event, arg) {
  if (settingsObj.currentRepo) {
    secureStorage
      .getPass(`${arg.key}@${settingsObj.currentRepo.id}`)
      .then((value) => {
        if (!value) {
          value = "";
        }
        event.returnValue = value;
      });
  }
}

let setRepo = function (workingDir, name) {
  settingsObj.currentRepo = settingsObj.repos.find(
    (r) => r.workingDir === workingDir
  );
  if (!settingsObj.currentRepo) {
    let newID = uuid();
    settingsObj.currentRepo = { name: name, workingDir: workingDir, id: newID };
    settingsObj.repos.push(settingsObj.currentRepo);
  }
  initRepoSettings(settingsObj.currentRepo.id);
  save();
  notifySettingsUpdated();
};

let getEffectiveSettings = function () {
  let appKeys = Object.keys(settingsObj.app_settings);
  let repoKeys = repoSettingsObj ? Object.keys(repoSettingsObj) : [];
  let effective = {};
  let allKeys = union_arrays(appKeys, repoKeys);
  allKeys.forEach(function (k) {
    effective[k] = get(k);
  });
  effective["currentRepo"] = settingsObj.currentRepo;
  return effective;
};

function union_arrays(x, y) {
  let obj = {};
  for (let i = x.length - 1; i >= 0; --i) obj[x[i]] = x[i];
  for (let i = y.length - 1; i >= 0; --i) obj[y[i]] = y[i];
  let res = [];
  for (let k in obj) {
    if (obj.hasOwnProperty(k))
      // <-- optional
      res.push(obj[k]);
  }
  return res;
}

let initRepoSettings = function (repo) {
  let settingsFile = appDir + repo + ".json";
  if (fs.existsSync(settingsFile)) {
    repoSettingsObj = JSON.parse(fs.readFileSync(settingsFile));
  } else {
    repoSettingsObj = {};
    fs.writeFileSync(settingsFile, JSON.stringify(repoSettingsObj), "utf8");
  }
};

let saveRepoSettings = function () {
  if (settingsObj.currentRepo && settingsObj.currentRepo.id !== "") {
    let settingsFile = appDir + settingsObj.currentRepo.id + ".json";
    fs.writeFileSync(settingsFile, JSON.stringify(repoSettingsObj), "utf8");
  }
};

let update = function (key, value) {
  settingsObj.app_settings[key] = value;
  save();
};

let updateRepoSetting = function (key, value) {
  repoSettingsObj[key] = value;
  save();
};

let get = function (key) {
  if (repoSettingsObj && repoSettingsObj[key] !== undefined) {
    return repoSettingsObj[key];
  }
  if (settingsObj.app_settings[key] !== undefined) {
    return settingsObj.app_settings[key];
  }
  return undefined;
};

let getRepos = function () {
  return settingsObj.repos;
};

function removeRepo(workingDir) {
  settingsObj.repos.forEach((r, i) => {
    if (r.workingDir === workingDir) {
      secureStorage.clearRepoCache(r.id);
      if (fs.existsSync(appDir + r.id + ".json")) {
        fs.unlinkSync(appDir + r.id + ".json");
      }
      settingsObj.repos.splice(i, 1);
    }
  });
  if (settingsObj.currentRepo.workingDir === workingDir) {
    settingsObj.currentRepo = undefined;
    save();
    safeSend(window.webContents, IPC_EVENTS.REPO.CURRENT_REMOVED, {});
    repoSettingsObj = undefined;
  }
  notifySettingsUpdated();
}

export {
  init,
  save,
  load,
  update,
  get,
  setRepo,
  getRepos,
  removeRepo,
  updateRepoSetting,
};

export const privateKey = () => privContent;
export const publicKey = () => publicContent;
