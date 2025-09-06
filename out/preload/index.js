"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 设置相关
  getSettings: () => electron.ipcRenderer.invoke("settings:get"),
  setSettings: (settings) => electron.ipcRenderer.invoke("settings:set", settings),
  // Git相关
  getRepos: () => electron.ipcRenderer.invoke("repo:get"),
  openRepo: (path) => electron.ipcRenderer.invoke("repo:open", path),
  getCommits: (repoId, branch) => electron.ipcRenderer.invoke("repo:commits", { repoId, branch }),
  // 安全存储
  getPassword: (account) => electron.ipcRenderer.invoke("secure:getPassword", account),
  setPassword: (account, password) => electron.ipcRenderer.invoke("secure:setPassword", { account, password }),
  // CI集成
  getCIStatus: (repoId) => electron.ipcRenderer.invoke("ci:status", repoId),
  // JIRA集成
  getJiraIssues: (query) => electron.ipcRenderer.invoke("jira:issues", query),
  // 文件操作
  openExternalFile: (path) => electron.ipcRenderer.invoke("file:open", path),
  // 事件监听
  on: (channel, callback) => {
    const validChannels = [
      "repo:updated",
      "settings:changed",
      "ci:statusChanged",
      "jira:issueUpdated"
    ];
    if (validChannels.includes(channel)) {
      electron.ipcRenderer.on(channel, callback);
    }
  },
  // 移除事件监听
  removeListener: (channel, callback) => {
    electron.ipcRenderer.removeListener(channel, callback);
  }
});
