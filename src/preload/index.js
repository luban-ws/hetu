import { contextBridge, ipcRenderer } from "electron";

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
  // 设置相关
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setSettings: (settings) => ipcRenderer.invoke("settings:set", settings),

  // Git相关
  getRepos: () => ipcRenderer.invoke("repo:get"),
  openRepo: (path) => ipcRenderer.invoke("repo:open", path),
  getCommits: (repoId, branch) =>
    ipcRenderer.invoke("repo:commits", { repoId, branch }),

  // 安全存储
  getPassword: (account) => ipcRenderer.invoke("secure:getPassword", account),
  setPassword: (account, password) =>
    ipcRenderer.invoke("secure:setPassword", { account, password }),

  // CI集成
  getCIStatus: (repoId) => ipcRenderer.invoke("ci:status", repoId),

  // JIRA集成
  getJiraIssues: (query) => ipcRenderer.invoke("jira:issues", query),

  // 文件操作
  openExternalFile: (path) => ipcRenderer.invoke("file:open", path),

  // 事件监听
  on: (channel, callback) => {
    const validChannels = [
      "repo:updated",
      "settings:changed",
      "ci:statusChanged",
      "jira:issueUpdated",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  // 移除事件监听
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
});
