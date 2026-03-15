/**
 * Preload script - Main entry point
 * Exposes safe APIs to the renderer process
 */
import { contextBridge, ipcRenderer, shell } from "electron";
import { sendMessage, invokeMessage, subscribeToChannel } from "./ipc-handlers";
import { ElectronAPI } from "./types";

// Exposed API to renderer process
const electronAPI: ElectronAPI = {
  // Settings
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setSettings: (settings: any) => ipcRenderer.invoke("settings:set", settings),

  // Git
  getRepos: () => ipcRenderer.invoke("repo:get"),
  openRepo: (path: string) => ipcRenderer.invoke("repo:open", path),
  getCommits: (repoId: string, branch: string) =>
    ipcRenderer.invoke("repo:commits", { repoId, branch }),

  // Git operations via IPC
  git: {
    openRepository: (workingDir: string) =>
      sendMessage("Repo-Open", { workingDir }),
    initRepository: (path: string) => sendMessage("Repo-Init", { path }),
    browseRepository: () => sendMessage("Repo-Browse", {}),
    browseFolderForInit: () => sendMessage("Repo-InitBrowse", {}),
    closeRepository: () => sendMessage("Repo-Close", {}),
    fetch: (credentials: any) => sendMessage("Repo-Fetch", credentials),
    pull: (credentials: any) => sendMessage("Repo-Pull", credentials),
    push: (credentials: any) => sendMessage("Repo-Push", credentials),
    createBranch: (name: string, commit: string) =>
      sendMessage("Repo-CreateBranch", { name, commit }),
    checkout: (branch: string) => sendMessage("Repo-Checkout", { branch }),
    removeHistory: (workingDir: string) =>
      sendMessage("Repo-RemoveHistory", { workingDir }),
  },

  // Security
  getPassword: (account: string) =>
    ipcRenderer.invoke("secure:getPassword", account),
  setPassword: (account: string, password: string) =>
    ipcRenderer.invoke("secure:setPassword", { account, password }),

  // CI
  getCIStatus: (repoId: string) => ipcRenderer.invoke("ci:status", repoId),

  // JIRA
  getJiraIssues: (query: string) => ipcRenderer.invoke("jira:issues", query),

  // Files
  openExternalFile: (path: string) => ipcRenderer.invoke("file:open", path),

  // Shell
  openExternal: (url: string) => shell.openExternal(url),

  // Git event subscriptions  
  gitEvents: {
    onOpenSuccessful: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-OpenSuccessful", (data) => callback(null, data)),
    onOpenFailed: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-OpenFailed", (data) => callback(null, data)),
    onClosed: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-Closed", (data) => callback(null, data)),
    onCurrentRemoved: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-CurrentRemoved", (data) => callback(null, data)),
    onCommitsUpdated: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-CommitsUpdated", (data) => callback(null, data)),
    onBranchChanged: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-BranchChanged", (data) => callback(null, data)),
    onBranchPositionRetrieved: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-BranchPositionRetrieved", (data) => callback(null, data)),
    onRemotesChanged: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-RemotesChanged", (data) => callback(null, data)),
    onFileStatusRetrieved: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-FileStatusRetrieved", (data) => callback(null, data)),
    onCredentialIssue: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-CredentialIssue", (data) => callback(null, data)),
    onPulled: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-Pulled", (data) => callback(null, data)),
    onPullFailed: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-PullFailed", (data) => callback(null, data)),
    onPushed: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-Pushed", (data) => callback(null, data)),
    onPushFailed: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-PushFailed", (data) => callback(null, data)),
    onFetched: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-Fetched", (data) => callback(null, data)),
    onFetchFailed: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-FetchFailed", (data) => callback(null, data)),
    onFolderSelected: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-FolderSelected", (data) => callback(null, data)),
    onInitPathSelected: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-InitPathSelected", (data) => callback(null, data)),
    onInitSuccessful: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-InitSuccessful", (data) => callback(null, data)),
    onInitFailed: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-InitFailed", (data) => callback(null, data)),
    onBlockingOperationBegan: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-BlockingOperationBegan", (data) => callback(null, data)),
    onBlockingOperationEnd: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-BlockingOperationEnd", (data) => callback(null, data)),
    onBlockingUpdate: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-BlockingUpdate", (data) => callback(null, data)),
    onBranchCreated: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-BranchCreated", (data) => callback(null, data)),
    onBranchCreateFailed: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-BranchCreateFailed", (data) => callback(null, data)),
    onTagCreated: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-TagCreated", (data) => callback(null, data)),
    onTagDeleted: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-TagDeleted", (data) => callback(null, data)),
    onRefRetrieved: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Repo-RefRetrieved", (data) => callback(null, data)),
  },

  // Settings event subscriptions
  settingsEvents: {
    onEffectiveUpdated: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("Settings-EffectiveUpdated", (data) => callback(null, data)),
  },

  // Auto-fetch event subscriptions
  autoFetchEvents: {
    onTimeout: (callback: (event: any, data: any) => void) =>
      subscribeToChannel("AutoFetch-Timeout", (data) => callback(null, data)),
  },

  // IPC communication using pure functions
  ipc: {
    send: sendMessage,
    invoke: invokeMessage,
    on: subscribeToChannel,
  },

  // Legacy compatibility
  removeListener: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
