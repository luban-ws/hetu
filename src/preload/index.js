/**
 * Preload script - Main entry point
 * Exposes safe APIs to the renderer process
 */
import { contextBridge, ipcRenderer, shell } from "electron";
import { sendMessage, invokeMessage, subscribeToChannel } from './ipc-handlers.js';

// Exposed API to renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Settings
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setSettings: (settings) => ipcRenderer.invoke("settings:set", settings),

  // Git
  getRepos: () => ipcRenderer.invoke("repo:get"),
  openRepo: (path) => ipcRenderer.invoke("repo:open", path),
  getCommits: (repoId, branch) =>
    ipcRenderer.invoke("repo:commits", { repoId, branch }),

  // Security
  getPassword: (account) => ipcRenderer.invoke("secure:getPassword", account),
  setPassword: (account, password) =>
    ipcRenderer.invoke("secure:setPassword", { account, password }),

  // CI
  getCIStatus: (repoId) => ipcRenderer.invoke("ci:status", repoId),

  // JIRA
  getJiraIssues: (query) => ipcRenderer.invoke("jira:issues", query),

  // Files
  openExternalFile: (path) => ipcRenderer.invoke("file:open", path),
  
  // Shell
  openExternal: (url) => shell.openExternal(url),

  // IPC communication using pure functions
  ipc: {
    send: sendMessage,
    invoke: invokeMessage,
    on: subscribeToChannel
  },

  // Legacy compatibility
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
});