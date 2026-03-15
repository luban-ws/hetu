import { DesktopAdapter } from './desktop-adapter';

/**
 * Lazy-loaded Tauri module promises, cached at module level for consistent
 * microtask ordering across all adapter method calls.
 */
const tauriCore  = () => import('@tauri-apps/api/core');
const tauriEvent = () => import('@tauri-apps/api/event');
const tauriShell = () => import('@tauri-apps/plugin-shell');

/**
 * Explicit channel-to-Tauri-command overrides for channels whose
 * snake_case conversion doesn't match the Rust command name.
 */
const COMMAND_OVERRIDES: Record<string, string> = {
  'Repo-Stash': 'repo_stash_save',
  'Repo-Pop': 'repo_stash_pop',
  'Repo-Apply': 'repo_stash_apply',
  'Repo-DeleteStash': 'repo_stash_drop',
  'Repo-SetCred': 'set_credentials',
  'Secure-ClearCache': 'secure_delete_password',
  'Settings-Set': 'settings_set',
  'Settings-SetSecureRepo': 'settings_set_secure_repo',
  'Settings-GetSecureRepo': 'settings_get_secure_repo',
  'Settings-BrowseFile': 'settings_browse_file',
  'Repo-Browse': 'repo_browse',
  'Repo-InitBrowse': 'repo_init_browse',
  'Repo-RemoveHistory': 'repo_remove_history',
  'Settings-Init': 'repo_get_history',
  'JIRA-RepoChanged': 'jira_repo_changed',
  'JIRA-GetIssue': 'jira_get_issue',
  'JIRA-AddComment': 'jira_add_comment',
  'JIRA-UpdateIssue': 'jira_update_issue',
  'JIRA-GetAssignableUsers': 'jira_get_assignable_users',
  'JIRA-AssignIssue': 'jira_assign_issue',
  'JIRA-AddSubtask': 'jira_add_subtask',
  'JIRA-SearchIssues': 'jira_search_issues',
  'CI-RepoChanged': 'ci_repo_changed',
  'CI-AppVeyorRebuild': 'ci_appveyor_rebuild',
  'CI-AppVeyorGetLog': 'ci_appveyor_get_log',
};

/**
 * Channels requiring payload transformation before sending to Rust.
 * Returns the transformed { commandName, args } pair.
 */
const PAYLOAD_TRANSFORMS: Record<string, (data: any) => { cmd: string; args: any }> = {
  'Repo-ResetHard': (data) => ({
    cmd: 'repo_reset',
    args: { payload: { commit_sha: data?.commit, mode: 'hard' } },
  }),
  'Repo-ResetSoft': (data) => ({
    cmd: 'repo_reset',
    args: { payload: { commit_sha: data?.commit, mode: 'soft' } },
  }),
  'Settings-SetSecureRepo': (data) => ({
    cmd: 'settings_set_secure_repo',
    args: { repo_id: data?.repoId || '', key: data?.key || '', value: data?.value || '' },
  }),
  'Settings-GetSecureRepo': (data) => ({
    cmd: 'settings_get_secure_repo',
    args: { repo_id: data?.repoId || '', key: data?.key || '' },
  }),
  'Settings-Set': (data) => ({
    cmd: 'settings_set',
    args: { key: data?.key || '', value: data?.value || '' },
  }),
  'Repo-RemoveHistory': (data) => ({
    cmd: 'repo_remove_history',
    args: { payload: { workingDir: data?.workingDir || '' } },
  }),
  'Repo-Open': (data) => ({
    cmd: 'repo_open',
    args: { payload: { path: data?.workingDir || '' } },
  }),
};

/**
 * DesktopAdapter implementation for Tauri 2.x.
 *
 * Solves a critical startup race: on() registers event listeners via an async
 * dynamic import of @tauri-apps/api/event, while send()/invoke() fires Tauri
 * commands via @tauri-apps/api/core. If the core module loads first, the Rust
 * command can emit an event before the listener is registered, losing the event.
 *
 * Fix: _pendingListeners collects every on() registration promise. send() and
 * invoke() wait for all pending registrations to complete before calling Rust.
 * After startup, the promises are all resolved so the overhead is negligible.
 */
export class TauriAdapter implements DesktopAdapter {
  /**
   * Collects promises for all listener registrations so send/invoke can
   * wait until every on() has its listen() fully acknowledged by Tauri core.
   */
  private _pendingListeners: Promise<void>[] = [];

  get available(): boolean {
    try {
      return typeof window !== 'undefined' &&
        !!(window as unknown as { __TAURI__?: unknown }).__TAURI__;
    } catch {
      return false;
    }
  }

  /**
   * Wait for all pending on() listener registrations to complete,
   * then return the Tauri core { invoke } function.
   */
  private _readyInvoke(): Promise<{ invoke: typeof import('@tauri-apps/api/core')['invoke'] }> {
    const snapshot = [...this._pendingListeners];
    return Promise.all(snapshot)
      .then(() => tauriCore())
      .then(({ invoke }) => ({ invoke }));
  }

  /**
   * Fire-and-forget message to the Tauri backend.
   * Waits for pending listener registrations before invoking.
   */
  send(channel: string, data?: unknown): void {
    if (!this.available) return;
    this._readyInvoke().then(({ invoke }) => {
      const transform = PAYLOAD_TRANSFORMS[channel];
      if (transform) {
        const { cmd, args } = transform(data);
        invoke(cmd, args).catch((err) =>
          console.warn(`[TauriAdapter] send(${channel}) failed:`, err)
        );
        return;
      }
      const cmd = COMMAND_OVERRIDES[channel] || toSnakeCase(channel);
      invoke(cmd, data != null ? { payload: data } : undefined).catch((err) =>
        console.warn(`[TauriAdapter] send(${channel}) failed:`, err)
      );
    });
  }

  /**
   * Request-response call to the Tauri backend.
   * Waits for pending listener registrations before invoking.
   */
  invoke<T = unknown>(channel: string, data?: unknown): Promise<T> {
    if (!this.available) return Promise.reject(new Error('Tauri not available'));
    return this._readyInvoke().then(({ invoke }) => {
      const cmd = COMMAND_OVERRIDES[channel] || toSnakeCase(channel);
      return invoke<T>(cmd, data != null ? { payload: data } : undefined);
    });
  }

  /**
   * Subscribe to events emitted from the Tauri backend.
   * The registration promise is tracked so send()/invoke() can wait for it.
   */
  on(channel: string, callback: (...args: unknown[]) => void): () => void {
    if (!this.available) return () => {};
    let unlistenFn: (() => void) | null = null;
    let cancelled = false;

    const registration: Promise<void> = tauriEvent().then(({ listen }) => {
      if (cancelled) return;
      return listen(channel, (event) => {
        callback(null, event.payload);
      }).then((unlisten) => {
        if (cancelled) {
          unlisten();
        } else {
          unlistenFn = unlisten;
        }
      });
    });

    this._pendingListeners.push(registration);

    return () => {
      cancelled = true;
      if (unlistenFn) unlistenFn();
    };
  }

  /**
   * Open a URL in the system default browser via Tauri shell plugin.
   */
  async openExternal(url: string): Promise<void> {
    if (!this.available) return Promise.reject(new Error('Tauri not available'));
    const { open } = await tauriShell();
    await open(url);
  }
}

/**
 * Convert PascalCase or kebab-case channel names to snake_case Rust command names.
 * @example toSnakeCase('Repo-Open') => 'repo_open'
 * @example toSnakeCase('get_app_version') => 'get_app_version'
 */
function toSnakeCase(channel: string): string {
  return channel
    .replace(/-/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}
