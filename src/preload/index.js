import { contextBridge, ipcRenderer, shell } from "electron";

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
  
  // Shell操作 - 直接在preload中处理
  openExternal: (url) => shell.openExternal(url),

  // IPC 通信封装
  ipc: {
    send: (channel, data) => {
      // 定义允许的通道
      const validSendChannels = [
        'Shell-Open',
        'git-command',
        'settings-change',
        'jira-action',
        'Repo-Browse',
        'Repo-InitBrowse'
      ];
      if (validSendChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    invoke: (channel, data) => {
      const validInvokeChannels = [
        'shell:openExternal',
        'git:execute',
        'settings:get',
        'settings:set'
      ];
      if (validInvokeChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      return Promise.reject(`Channel ${channel} not allowed`);
    },
    on: (channel, callback) => {
      const validChannels = [
        "repo:updated",
        "settings:changed", 
        "ci:statusChanged",
        "jira:issueUpdated",
        "Repo-FolderSelected",
        "Repo-InitPathSelected"
      ];
      if (validChannels.includes(channel)) {
        const subscription = (event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);
        
        // 返回清理函数
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      }
      return () => {}; // 空清理函数
    }
  },

  // 移除事件监听 (保持向后兼容)
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
});
