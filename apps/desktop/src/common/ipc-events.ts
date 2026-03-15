/**
 * Centralized IPC Event Names
 *
 * This file contains all IPC event names used for communication between
 * main process, renderer process, and preload script.
 *
 * Usage:
 *   import { IPC_EVENTS } from @common/ipc-events';
 *   ipcMain.on(IPC_EVENTS.REPO.OPEN, handler);
 *   event.sender.send(IPC_EVENTS.REPO.OPEN_SUCCESSFUL, data);
 */

export const IPC_EVENTS = {
  // Repository Management Events
  REPO: {
    // Repository Operations
    OPEN: "Repo-Open",
    OPEN_SUCCESSFUL: "Repo-OpenSuccessful",
    OPEN_FAILED: "Repo-OpenFailed",
    CLOSE: "Repo-Close",
    CLOSED: "Repo-Closed",
    CURRENT_REMOVED: "Repo-CurrentRemoved",

    // Browse Operations
    BROWSE: "Repo-Browse",
    FOLDER_SELECTED: "Repo-FolderSelected",
    INIT: "Repo-Init",
    INIT_BROWSE: "Repo-InitBrowse",
    INIT_PATH_SELECTED: "Repo-InitPathSelected",
    INIT_SUCCESSFUL: "Repo-InitSuccessful",
    INIT_FAILED: "Repo-InitFailed",

    // Git Operations
    FETCH: "Repo-Fetch",
    FETCHED: "Repo-Fetched",
    FETCH_FAILED: "Repo-FetchFailed",
    PULL: "Repo-Pull",
    PULLED: "Repo-Pulled",
    PULL_FAILED: "Repo-PullFailed",
    PUSH: "Repo-Push",
    PUSHED: "Repo-Pushed",
    PUSH_FAILED: "Repo-PushFailed",

    // Commit Operations
    GET_COMMIT: "Repo-GetCommit",
    COMMIT_DETAIL_RETRIEVED: "Repo-CommitDetailRetrieved",
    COMMIT: "Repo-Commit",
    COMMIT_STAGED: "Repo-CommitStaged",
    COMMITTED: "Repo-Committed",
    COMMIT_FAIL: "Repo-CommitFail",
    COMMITS_UPDATED: "Repo-CommitsUpdated",

    // Stage Operations
    STAGE: "Repo-Stage",
    STAGE_LINES: "Repo-StageLines",
    UNSTAGE: "Repo-Unstage",
    UNSTAGE_LINES: "Repo-UnstageLines",
    STAGE_FAIL: "Repo-StageFail",
    UNSTAGE_FAIL: "Repo-UnstageFail",

    // Stash Operations
    STASH: "Repo-Stash",
    STASHED: "Repo-Stashed",
    STASH_FAILED: "Repo-StashFailed",
    POP: "Repo-Pop",
    POPPED: "Repo-Popped",
    POP_FAILED: "Repo-PopFailed",
    APPLY: "Repo-Apply",
    APPLIED: "Repo-Applied",
    APPLY_FAILED: "Repo-ApplyFailed",
    DELETE_STASH: "Repo-DeleteStash",
    STASH_DELETED: "Repo-StashDeleted",

    // Branch Operations
    CREATE_BRANCH: "Repo-CreateBranch",
    BRANCH_CREATED: "Repo-BranchCreated",
    BRANCH_CREATE_FAILED: "Repo-BranchCreateFailed",
    CHECKOUT: "Repo-Checkout",
    CHECKEDOUT: "Repo-Checkedout",
    CHECKOUT_FAILED: "Repo-CheckoutFailed",
    DELETE_BRANCH: "Repo-DeleteBranch",
    BRANCH_DELETED: "Repo-BranchDeleted",
    BRANCH_DELETE_FAILED: "Repo-BranchDeleteFailed",
    BRANCH_CHANGED: "Repo-BranchChanged",
    BRANCH_POSITION_RETRIEVED: "Repo-BranchPositionRetrieved",

    // Tag Operations
    CREATE_TAG: "Repo-CreateTag",
    TAG_CREATED: "Repo-TagCreated",
    CREATE_TAG_FAILED: "Repo-CreateTagFailed",
    DELETE_TAG: "Repo-DeleteTag",
    TAG_DELETED: "Repo-TagDeleted",
    DELETE_TAG_FAILED: "Repo-DeleteTagFailed",
    PUSH_TAG: "Repo-PushTag",
    TAG_PUSHED: "Repo-TagPushed",
    PUSH_TAG_FAILED: "Repo-PushTagFailed",

    // Reset Operations
    DISCARD_ALL: "Repo-DiscardAll",
    DISCARDED: "Repo-Discarded",
    DISCARD_FAILED: "Repo-DiscardFailed",
    RESET_HARD: "Repo-ResetHard",
    RESET_SOFT: "Repo-ResetSoft",
    RESETTED: "Repo-Resetted",
    RESET_FAILED: "Repo-ResetFailed",

    // Reference Operations
    REF_RETRIEVED: "Repo-RefRetrieved",
    REMOTES_CHANGED: "Repo-RemotesChanged",

    // File Operations
    FILE_STATUS_RETRIEVED: "Repo-FileStatusRetrieved",
    GET_FILE_DETAIL: "Repo-GetFileDetail",
    FILE_DETAIL_RETRIEVED: "Repo-FileDetailRetrieved",
    FILE_DETAIL_NOT_FOUND: "Repo-FileDetailNotFound",
    LIVE_UPDATE_FILE_NOT_FOUND: "Repo-LiveUpdateFileNotFound",
    OPEN_EXTERNAL_FILE: "Repo-OpenExternalFile",
    SUBSCRIBE_FILE_UPDATE: "Repo-SubscribeFileUpdate",
    UNSUBSCRIBE_FILE_UPDATE: "Repo-UnsubscribeFileUpdate",

    // Submodule Operations
    GET_SUBMODULE_DETAILS: "Repo-GetSubmoduleDetails",
    SUBMODULE_DETAILS_RETRIEVED: "Repo-SubmoduleDetailsRetrieved",
    SUBMODULE_NAMES_RETRIEVED: "Repo-SubmoduleNamesRetrieved",

    // Commit Detail Operations
    FAILED_GET_COMMIT_DETAIL: "Repo-FailedGetCommitDetail",

    // Stash Operations (additional)
    DELETE_STASH_FAILED: "Repo-DeleteStashFailed",

    // Authentication
    SET_CRED: "Repo-SetCred",
    CREDENTIAL_ISSUE: "Repo-CredentialIssue",
    USERNAME_RETRIEVED: "Repo-UsernameRetrieved",
    PASSWORD_RETRIEVED: "Repo-PasswordRetrieved",
    SSH_KEY_REQUIRED: "Repo-SSHKeyRequired",

    // History
    REMOVE_HISTORY: "Repo-RemoveHistory",
    HISTORY_CHANGED: "Repo-HistoryChanged",

    // Progress/Status
    BLOCKING_OPERATION_BEGAN: "Repo-BlockingOperationBegan",
    BLOCKING_OPERATION_END: "Repo-BlockingOperationEnd",
    BLOCKING_UPDATE: "Repo-BlockingUpdate",
    STATUS_UPDATED: "Repo-StatusUpdated",

    // Additional operations
    REFRESH: "Repo-Refresh",
    STAGE_ALL: "Repo-StageAll",
    UNSTAGE_ALL: "Repo-UnstageAll",
    SWITCH_BRANCH: "Repo-SwitchBranch",
    MERGE: "Repo-Merge",
    RESET: "Repo-Reset",
    STASH_SAVE: "Repo-StashSave",
    STASH_POP: "Repo-StashPop",
    STASH_APPLY: "Repo-StashApply",
    STASH_DROP: "Repo-StashDrop",
    STASH_LIST: "Repo-StashList",
    GET_COMMITS: "Repo-GetCommits",
    GET_BRANCHES: "Repo-GetBranches",
    GET_REMOTES: "Repo-GetRemotes",
    GET_STATUS: "Repo-GetStatus",
    GET_DIFF: "Repo-GetDiff",
  },

  // Settings Management Events
  SETTINGS: {
    INIT: "Settings-Init",
    SET: "Settings-Set",
    UPDATED: "Settings-Updated",
    EFFECTIVE_UPDATED: "Settings-EffectiveUpdated",
    SET_SECURE_REPO: "Settings-SetSecureRepo",
    GET_SECURE_REPO: "Settings-GetSecureRepo",
    SECURE_REPO_RETRIEVED: "Settings-SecureRepoRetrieved",
    BROWSE_FILE: "Settings-BrowseFile",
    FOLDER_SELECTED: "Settings-FolderSelected",
  },

  // Auto Fetch Events
  AUTO_FETCH: {
    TIMEOUT: "AutoFetch-Timeout",
  },

  // File Watcher Events
  FILE_WATCHER: {
    ENABLED: "FileWatcher-Enabled",
  },

  // CI Integration Events
  CI: {
    REPO_CHANGED: "CI-RepoChanged",
    QUERY_BEGAN: "CI-QueryBegan",
    BUILDS_RETRIEVED: "CI-BuildsRetrieved",
    REQUEST_ERROR: "CI-RequestError",
    APPVEYOR: {
      SET_CONFIG: "AppVeyor-SetConfig",
      GET_BUILD: "AppVeyor-GetBuild",
      BUILD_RETRIEVED: "AppVeyor-BuildRetrieved",
      REBUILD: "CI-AppVeyorRebuild",
      REBUILDED: "CI-AppVeyorRebuilded",
      REBUILD_FAILED: "CI-AppVeyorRebuildFailed",
      GET_LOG: "CI-AppVeyorGetLog",
      LOG_RETRIEVED: "CI-AppVeyorLogRetrieved",
      LOG_NOT_FOUND: "CI-AppVeyorLogNotFound",
      STATUS_RETRIEVED: "CI-AppVeyorStatusRetrieved",
    },
  },

  // JIRA Integration Events
  JIRA: {
    SET_CONFIG: "Jira-SetConfig",
    GET_ISSUE: "JIRA-GetIssue",
    ISSUE_RETRIEVED: "JIRA-IssueRetrieved",
    ADD_COMMENT: "JIRA-AddComment",
    COMMENT_ADDED: "Jira-CommentAdded",
    GET_TRANSITIONS: "Jira-GetTransitions",
    TRANSITIONS_RETRIEVED: "Jira-TransitionsRetrieved",
    TRANSITION_ISSUE: "Jira-TransitionIssue",
    ISSUE_TRANSITIONED: "Jira-IssueTransitioned",
    UPDATE_ISSUE: "JIRA-UpdateIssue",
    REPO_CHANGED: "JIRA-RepoChanged",
    RESOLUTIONS_RETRIEVED: "JIRA-ResolutionsRetrieved",
    ISSUE_TYPES_RETRIEVED: "JIRA-IssueTypesRetrieved",
    ERROR: "JIRA-Error",
    TIMEOUT: "JIRA-Timeout",
    OPERATION_FAILED: "JIRA-OperationFailed",
    NOT_FOUND: "JIRA-NotFound",
    CAPTCHA_REQUIRED: "JIRA-CAPTCHARequired",
    GET_ASSIGNABLE_USERS: "JIRA-GetAssignableUsers",
    ASSIGNABLE_USERS_RETRIEVED: "JIRA-AssignableUsersRetrieved",
    ASSIGN_ISSUE: "JIRA-AssignIssue",
    ADD_SUBTASK: "JIRA-AddSubtask",
    SEARCH_ISSUES: "JIRA-SearchIssues",
    ISSUE_QUERY_RESULT_RETRIEVED: "JIRA-IssueQueryResultRetrieved",
    // Legacy events (mixed case)
    GET_PROJECTS: "Jira-GetProjects",
    PROJECTS_RETRIEVED: "Jira-ProjectsRetrieved",
    GET_ISSUES: "Jira-GetIssues",
    ISSUES_RETRIEVED: "Jira-IssuesRetrieved",
    ISSUE_UPDATED: "Jira-IssueUpdated",
    UPDATE_ISSUE_LEGACY: "Jira-UpdateIssue",
    LOGIN_REASON: "X-Seraph-LoginReason",
  },

  // Update Events
  UPDATE: {
    CHECK_FOR_UPDATE: "Update-CheckForUpdate",
    UPDATE_AVAILABLE: "Update-UpdateAvailable",
    DOWNLOAD_PROGRESS: "Update-DownloadProgress",
    UPDATE_DOWNLOADED: "Update-UpdateDownloaded",
    INSTALL_UPDATE: "Update-InstallUpdate",
  },

  // Updater Events (legacy)
  UPDATER: {
    CHECK: "Updater-Check",
    CHECKING: "Updater-Checking",
    UPDATE_AVAILABLE: "Updater-UpdateAvailable",
    UPDATE_NOT_AVAILABLE: "Updater-UpdateNotAvailable",
    DOWNLOADED: "Updater-Downloaded",
  },

  // Security Events
  SECURE: {
    CLEAR_CACHE: "Secure-ClearCache",
    CACHE_CLEARED: "Secure-CacheCleared",
    CLEAR_CACHE_FAILED: "Secure-ClearCacheFailed",
    SET_PASSWORD_FAILED: "Secure-SetPasswordFailed",
  },

  // Shell Events
  SHELL: {
    OPEN: "Shell-Open",
  },

  // Cache Events
  CACHE: {
    AUTO_CLEAN_BEGIN: "Cache-AutoCleanBegin",
    AUTO_CLEAN_SUCCESS: "Cache-AutoCleanSuccess",
  },

  // Release Notes Events
  RELEASE_NOTES: {
    GET: "ReleaseNote-Get",
    RETRIEVED: "ReleaseNote-Retrieved",
  },
};

/**
 * Helper function to get all event names as an array
 * Useful for preload script validation
 */
export function getAllEventNames() {
  const events = [];

  function extractEvents(obj, prefix = "") {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        events.push(value);
      } else if (typeof value === "object" && value !== null) {
        extractEvents(value, prefix + key + ".");
      }
    }
  }

  extractEvents(IPC_EVENTS);
  return events;
}

/**
 * Validate that an event name is registered
 */
export function isValidEvent(eventName) {
  return getAllEventNames().includes(eventName);
}
