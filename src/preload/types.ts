/**
 * TypeScript type definitions for preload script
 */

// Electron API types
export interface ElectronAPI {
  // Settings
  getSettings: () => Promise<any>;
  setSettings: (settings: any) => Promise<void>;

  // Git
  getRepos: () => Promise<any>;
  openRepo: (path: string) => Promise<any>;
  getCommits: (repoId: string, branch: string) => Promise<any>;

  // Git operations via IPC
  git: {
    openRepository: (workingDir: string) => boolean;
    initRepository: (path: string) => boolean;
    browseRepository: () => boolean;
    browseFolderForInit: () => boolean;
    closeRepository: () => boolean;
    fetch: (credentials: any) => boolean;
    pull: (credentials: any) => boolean;
    push: (credentials: any) => boolean;
    createBranch: (name: string, commit: string) => boolean;
    checkout: (branch: string) => boolean;
    removeHistory: (workingDir: string) => boolean;
  };

  // Security
  getPassword: (account: string) => Promise<string>;
  setPassword: (account: string, password: string) => Promise<void>;

  // CI
  getCIStatus: (repoId: string) => Promise<any>;

  // JIRA
  getJiraIssues: (query: string) => Promise<any>;

  // Files
  openExternalFile: (path: string) => Promise<any>;

  // Shell
  openExternal: (url: string) => Promise<void>;

  // Event subscriptions
  gitEvents: {
    onOpenSuccessful: (callback: (event: any, data: any) => void) => void;
    onOpenFailed: (callback: (event: any, data: any) => void) => void;
    onClosed: (callback: (event: any, data: any) => void) => void;
    onCurrentRemoved: (callback: (event: any, data: any) => void) => void;
    onCommitsUpdated: (callback: (event: any, data: any) => void) => void;
    onBranchChanged: (callback: (event: any, data: any) => void) => void;
    onBranchPositionRetrieved: (callback: (event: any, data: any) => void) => void;
    onRemotesChanged: (callback: (event: any, data: any) => void) => void;
    onFileStatusRetrieved: (callback: (event: any, data: any) => void) => void;
    onCredentialIssue: (callback: (event: any, data: any) => void) => void;
    onPulled: (callback: (event: any, data: any) => void) => void;
    onPullFailed: (callback: (event: any, data: any) => void) => void;
    onPushed: (callback: (event: any, data: any) => void) => void;
    onPushFailed: (callback: (event: any, data: any) => void) => void;
    onFetched: (callback: (event: any, data: any) => void) => void;
    onFetchFailed: (callback: (event: any, data: any) => void) => void;
    onFolderSelected: (callback: (event: any, data: any) => void) => void;
    onInitPathSelected: (callback: (event: any, data: any) => void) => void;
    onInitSuccessful: (callback: (event: any, data: any) => void) => void;
    onInitFailed: (callback: (event: any, data: any) => void) => void;
    onBlockingOperationBegan: (callback: (event: any, data: any) => void) => void;
    onBlockingOperationEnd: (callback: (event: any, data: any) => void) => void;
    onBlockingUpdate: (callback: (event: any, data: any) => void) => void;
    onBranchCreated: (callback: (event: any, data: any) => void) => void;
    onBranchCreateFailed: (callback: (event: any, data: any) => void) => void;
    onTagCreated: (callback: (event: any, data: any) => void) => void;
    onTagDeleted: (callback: (event: any, data: any) => void) => void;
    onRefRetrieved: (callback: (event: any, data: any) => void) => void;
  };

  settingsEvents: {
    onEffectiveUpdated: (callback: (event: any, data: any) => void) => void;
  };

  autoFetchEvents: {
    onTimeout: (callback: (event: any, data: any) => void) => void;
  };

  // IPC communication
  ipc: {
    send: (channel: string, data?: any) => void;
    invoke: (channel: string, data?: any) => Promise<any>;
    on: (channel: string, callback: Function) => () => void;
  };

  // Legacy compatibility
  removeListener: (channel: string, callback: (data: any) => void) => void;
}

// Global window interface extension
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// IPC Event types
export interface IPCEvent {
  channel: string;
  data?: any;
}

// Channel validation types
export interface ChannelConfig {
  send: string[];
  receive: string[];
}

// Subscription types
export interface Subscription {
  channel: string;
  callback: (data: any) => void;
  unsubscribe: () => void;
}
