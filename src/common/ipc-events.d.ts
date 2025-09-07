/**
 * TypeScript definitions for IPC Events
 */

export interface RepoEvents {
  readonly OPEN: string;
  readonly OPEN_SUCCESSFUL: string;
  readonly OPEN_FAILED: string;
  readonly CLOSE: string;
  readonly CLOSED: string;
  readonly CURRENT_REMOVED: string;
  readonly BROWSE: string;
  readonly FOLDER_SELECTED: string;
  readonly INIT: string;
  readonly INIT_BROWSE: string;
  readonly INIT_PATH_SELECTED: string;
  readonly INIT_SUCCESSFUL: string;
  readonly INIT_FAILED: string;
  readonly FETCH: string;
  readonly FETCHED: string;
  readonly FETCH_FAILED: string;
  readonly PULL: string;
  readonly PULLED: string;
  readonly PULL_FAILED: string;
  readonly PUSH: string;
  readonly PUSHED: string;
  readonly PUSH_FAILED: string;
  readonly GET_COMMIT: string;
  readonly COMMIT_DETAIL_RETRIEVED: string;
  readonly COMMIT: string;
  readonly COMMIT_STAGED: string;
  readonly COMMITTED: string;
  readonly COMMIT_FAIL: string;
  readonly COMMITS_UPDATED: string;
  readonly STAGE: string;
  readonly STAGE_LINES: string;
  readonly UNSTAGE: string;
  readonly UNSTAGE_LINES: string;
  readonly STAGE_FAIL: string;
  readonly UNSTAGE_FAIL: string;
  readonly STASH: string;
  readonly STASHED: string;
  readonly STASH_FAILED: string;
  readonly POP: string;
  readonly POPPED: string;
  readonly POP_FAILED: string;
  readonly APPLY: string;
  readonly APPLIED: string;
  readonly APPLY_FAILED: string;
  readonly DELETE_STASH: string;
  readonly STASH_DELETED: string;
  readonly CREATE_BRANCH: string;
  readonly BRANCH_CREATED: string;
  readonly BRANCH_CREATE_FAILED: string;
  readonly CHECKOUT: string;
  readonly CHECKEDOUT: string;
  readonly CHECKOUT_FAILED: string;
  readonly DELETE_BRANCH: string;
  readonly BRANCH_DELETED: string;
  readonly BRANCH_DELETE_FAILED: string;
  readonly BRANCH_CHANGED: string;
  readonly BRANCH_POSITION_RETRIEVED: string;
  readonly CREATE_TAG: string;
  readonly TAG_CREATED: string;
  readonly CREATE_TAG_FAILED: string;
  readonly DELETE_TAG: string;
  readonly TAG_DELETED: string;
  readonly DELETE_TAG_FAILED: string;
  readonly PUSH_TAG: string;
  readonly TAG_PUSHED: string;
  readonly PUSH_TAG_FAILED: string;
  readonly DISCARD_ALL: string;
  readonly DISCARDED: string;
  readonly DISCARD_FAILED: string;
  readonly RESET_HARD: string;
  readonly RESET_SOFT: string;
  readonly RESETTED: string;
  readonly RESET_FAILED: string;
  readonly REF_RETRIEVED: string;
  readonly REMOTES_CHANGED: string;
  readonly FILE_STATUS_RETRIEVED: string;
  readonly SET_CRED: string;
  readonly CREDENTIAL_ISSUE: string;
  readonly USERNAME_RETRIEVED: string;
  readonly PASSWORD_RETRIEVED: string;
  readonly REMOVE_HISTORY: string;
  readonly HISTORY_CHANGED: string;
  readonly BLOCKING_OPERATION_BEGAN: string;
  readonly BLOCKING_OPERATION_END: string;
  readonly BLOCKING_UPDATE: string;
}

export interface SettingsEvents {
  readonly INIT: string;
  readonly SET: string;
  readonly UPDATED: string;
  readonly EFFECTIVE_UPDATED: string;
  readonly SET_SECURE_REPO: string;
  readonly GET_SECURE_REPO: string;
  readonly SECURE_REPO_RETRIEVED: string;
  readonly BROWSE_FILE: string;
  readonly FOLDER_SELECTED: string;
}

export interface AutoFetchEvents {
  readonly TIMEOUT: string;
}

export interface FileWatcherEvents {
  readonly ENABLED: string;
}

export interface CiEvents {
  readonly APPVEYOR: {
    readonly SET_CONFIG: string;
    readonly GET_BUILD: string;
    readonly BUILD_RETRIEVED: string;
  };
}

export interface JiraEvents {
  readonly SET_CONFIG: string;
  readonly GET_ISSUE: string;
  readonly ISSUE_RETRIEVED: string;
  readonly ADD_COMMENT: string;
  readonly COMMENT_ADDED: string;
  readonly GET_TRANSITIONS: string;
  readonly TRANSITIONS_RETRIEVED: string;
  readonly TRANSITION_ISSUE: string;
  readonly ISSUE_TRANSITIONED: string;
}

export interface UpdateEvents {
  readonly CHECK_FOR_UPDATE: string;
  readonly UPDATE_AVAILABLE: string;
  readonly DOWNLOAD_PROGRESS: string;
  readonly UPDATE_DOWNLOADED: string;
  readonly INSTALL_UPDATE: string;
}

export interface ReleaseNotesEvents {
  readonly GET: string;
  readonly RETRIEVED: string;
}

export interface IPCEvents {
  readonly REPO: RepoEvents;
  readonly SETTINGS: SettingsEvents;
  readonly AUTO_FETCH: AutoFetchEvents;
  readonly FILE_WATCHER: FileWatcherEvents;
  readonly CI: CiEvents;
  readonly JIRA: JiraEvents;
  readonly UPDATE: UpdateEvents;
  readonly RELEASE_NOTES: ReleaseNotesEvents;
}

export declare const IPC_EVENTS: IPCEvents;
export declare function getAllEventNames(): string[];
export declare function isValidEvent(eventName: string): boolean;