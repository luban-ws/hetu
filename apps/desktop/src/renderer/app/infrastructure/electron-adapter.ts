import { DesktopAdapter } from './desktop-adapter';

/**
 * Channel-to-method mapping for window.electronAPI.git.* calls.
 * ElectronAdapter routes adapter.send(channel, data) to the corresponding
 * preload git method so RepoService can use the unified adapter interface.
 */
const GIT_METHOD_MAP: Record<string, (data?: any) => any> = {
  'Repo-Open': (d) => window.electronAPI?.git?.openRepository(d?.workingDir),
  'Repo-Init': (d) => window.electronAPI?.git?.initRepository(d?.path),
  'Repo-Browse': () => window.electronAPI?.git?.browseRepository(),
  'Repo-InitBrowse': () => window.electronAPI?.git?.browseFolderForInit(),
  'Repo-Close': () => window.electronAPI?.git?.closeRepository(),
  'Repo-Fetch': (d) => window.electronAPI?.git?.fetch(d),
  'Repo-Pull': (d) => window.electronAPI?.git?.pull(d),
  'Repo-Push': (d) => window.electronAPI?.git?.push(d),
  'Repo-CreateBranch': (d) => window.electronAPI?.git?.createBranch(d?.name, d?.commit),
  'Repo-Checkout': (d) => window.electronAPI?.git?.checkout(d?.branch),
  'Repo-RemoveHistory': (d) => window.electronAPI?.git?.removeHistory(d?.workingDir),
};

/**
 * Channel-to-event mapping for window.electronAPI.gitEvents.* subscriptions.
 * Maps adapter.on(channel, cb) to the corresponding preload event subscription,
 * returning the unsubscribe function.
 */
const GIT_EVENT_MAP: Record<string, (cb: Function) => (() => void) | undefined> = {
  'Repo-OpenSuccessful': (cb) => window.electronAPI?.gitEvents?.onOpenSuccessful(cb),
  'Repo-OpenFailed': (cb) => window.electronAPI?.gitEvents?.onOpenFailed(cb),
  'Repo-Closed': (cb) => window.electronAPI?.gitEvents?.onClosed(cb),
  'Repo-CurrentRemoved': (cb) => window.electronAPI?.gitEvents?.onCurrentRemoved(cb),
  'Repo-CommitsUpdated': (cb) => window.electronAPI?.gitEvents?.onCommitsUpdated(cb),
  'Repo-BranchChanged': (cb) => window.electronAPI?.gitEvents?.onBranchChanged(cb),
  'Repo-BranchPositionRetrieved': (cb) => window.electronAPI?.gitEvents?.onBranchPositionRetrieved(cb),
  'Repo-RemotesChanged': (cb) => window.electronAPI?.gitEvents?.onRemotesChanged(cb),
  'Repo-FileStatusRetrieved': (cb) => window.electronAPI?.gitEvents?.onFileStatusRetrieved(cb),
  'Repo-CredentialIssue': (cb) => window.electronAPI?.gitEvents?.onCredentialIssue(cb),
  'Repo-Pulled': (cb) => window.electronAPI?.gitEvents?.onPulled(cb),
  'Repo-PullFailed': (cb) => window.electronAPI?.gitEvents?.onPullFailed(cb),
  'Repo-Pushed': (cb) => window.electronAPI?.gitEvents?.onPushed(cb),
  'Repo-PushFailed': (cb) => window.electronAPI?.gitEvents?.onPushFailed(cb),
  'Repo-Fetched': (cb) => window.electronAPI?.gitEvents?.onFetched(cb),
  'Repo-FetchFailed': (cb) => window.electronAPI?.gitEvents?.onFetchFailed(cb),
  'Repo-FolderSelected': (cb) => window.electronAPI?.gitEvents?.onFolderSelected(cb),
  'Repo-InitPathSelected': (cb) => window.electronAPI?.gitEvents?.onInitPathSelected(cb),
  'Repo-InitSuccessful': (cb) => window.electronAPI?.gitEvents?.onInitSuccessful(cb),
  'Repo-InitFailed': (cb) => window.electronAPI?.gitEvents?.onInitFailed(cb),
  'Repo-BlockingOperationBegan': (cb) => window.electronAPI?.gitEvents?.onBlockingOperationBegan(cb),
  'Repo-BlockingOperationEnd': (cb) => window.electronAPI?.gitEvents?.onBlockingOperationEnd(cb),
  'Repo-BlockingUpdate': (cb) => window.electronAPI?.gitEvents?.onBlockingUpdate(cb),
  'Repo-BranchCreated': (cb) => window.electronAPI?.gitEvents?.onBranchCreated(cb),
  'Repo-BranchCreateFailed': (cb) => window.electronAPI?.gitEvents?.onBranchCreateFailed(cb),
  'Repo-TagCreated': (cb) => window.electronAPI?.gitEvents?.onTagCreated(cb),
  'Repo-TagDeleted': (cb) => window.electronAPI?.gitEvents?.onTagDeleted(cb),
  'Repo-RefRetrieved': (cb) => window.electronAPI?.gitEvents?.onRefRetrieved(cb),
};

/**
 * Channel-to-event mapping for non-git event subscriptions exposed by preload.
 */
const OTHER_EVENT_MAP: Record<string, (cb: Function) => (() => void) | undefined> = {
  'Settings-EffectiveUpdated': (cb) => window.electronAPI?.settingsEvents?.onEffectiveUpdated(cb),
  'AutoFetch-Timeout': (cb) => window.electronAPI?.autoFetchEvents?.onTimeout(cb),
};

/** Merged event lookup for on() */
const ALL_EVENT_MAP: Record<string, (cb: Function) => (() => void) | undefined> = {
  ...GIT_EVENT_MAP,
  ...OTHER_EVENT_MAP,
};

/**
 * DesktopAdapter implementation for Electron.
 * Wraps window.electronAPI.ipc for generic IPC, and window.electronAPI.git.*
 * / gitEvents.* / settingsEvents.* / autoFetchEvents.* for direct preload calls.
 * Zero behavior change from the original ElectronService.
 */
export class ElectronAdapter implements DesktopAdapter {
  get available(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
  }

  /**
   * Send a message to the Electron main process.
   * If the channel has a direct git.* mapping, use that; otherwise fall through to ipc.send.
   */
  send(channel: string, data?: unknown): void {
    if (!this.available) return;
    const gitMethod = GIT_METHOD_MAP[channel];
    if (gitMethod) {
      gitMethod(data);
      return;
    }
    window.electronAPI.ipc.send(channel, data);
  }

  /**
   * Request-response call to the Electron main process via ipc.invoke.
   */
  invoke<T = unknown>(channel: string, data?: unknown): Promise<T> {
    if (!this.available) return Promise.reject(new Error('Electron not available'));
    return window.electronAPI.ipc.invoke(channel, data);
  }

  /**
   * Subscribe to events from the Electron main process.
   * Checks gitEvents/settingsEvents/autoFetchEvents maps first,
   * then falls through to generic ipc.on.
   */
  on(channel: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.available) return () => {};
    const eventSubscriber = ALL_EVENT_MAP[channel];
    if (eventSubscriber) {
      const unsub = eventSubscriber(callback);
      return unsub || (() => {});
    }
    return window.electronAPI.ipc.on(channel, callback) || (() => {});
  }

  /**
   * Open a URL in the system default browser via Electron shell.
   */
  openExternal(url: string): Promise<void> {
    if (!this.available) return Promise.reject(new Error('Electron not available'));
    window.electronAPI.openExternal(url);
    return Promise.resolve();
  }
}
