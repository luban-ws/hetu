/**
 * Centralized IPC channel name constants.
 *
 * Platform-agnostic: TauriAdapter maps these to snake_case Rust commands.
 * Services use these constants via the DesktopAdapter interface —
 * never reference Tauri APIs directly.
 *
 * @example
 *   import { IPC_EVENTS } from '@infrastructure/ipc-events';
 *   adapter.send(IPC_EVENTS.REPO.OPEN, { workingDir: '/path' });
 */

/** Repository management channels */
const REPO = {
  OPEN: 'Repo-Open',
  OPEN_SUCCESSFUL: 'Repo-OpenSuccessful',
  OPEN_FAILED: 'Repo-OpenFailed',
  CLOSE: 'Repo-Close',
  CLOSED: 'Repo-Closed',
  CURRENT_REMOVED: 'Repo-CurrentRemoved',

  BROWSE: 'Repo-Browse',
  FOLDER_SELECTED: 'Repo-FolderSelected',
  INIT: 'Repo-Init',
  INIT_BROWSE: 'Repo-InitBrowse',
  INIT_PATH_SELECTED: 'Repo-InitPathSelected',
  INIT_SUCCESSFUL: 'Repo-InitSuccessful',
  INIT_FAILED: 'Repo-InitFailed',

  FETCH: 'Repo-Fetch',
  FETCHED: 'Repo-Fetched',
  FETCH_FAILED: 'Repo-FetchFailed',
  PULL: 'Repo-Pull',
  PULLED: 'Repo-Pulled',
  PULL_FAILED: 'Repo-PullFailed',
  PUSH: 'Repo-Push',
  PUSHED: 'Repo-Pushed',
  PUSH_FAILED: 'Repo-PushFailed',

  GET_COMMIT: 'Repo-GetCommit',
  COMMIT_DETAIL_RETRIEVED: 'Repo-CommitDetailRetrieved',
  COMMIT: 'Repo-Commit',
  COMMIT_STAGED: 'Repo-CommitStaged',
  COMMITTED: 'Repo-Committed',
  COMMIT_FAIL: 'Repo-CommitFail',
  COMMITS_UPDATED: 'Repo-CommitsUpdated',

  STAGE: 'Repo-Stage',
  STAGE_LINES: 'Repo-StageLines',
  UNSTAGE: 'Repo-Unstage',
  UNSTAGE_LINES: 'Repo-UnstageLines',
  STAGE_FAIL: 'Repo-StageFail',
  UNSTAGE_FAIL: 'Repo-UnstageFail',

  STASH: 'Repo-Stash',
  STASHED: 'Repo-Stashed',
  STASH_FAILED: 'Repo-StashFailed',
  POP: 'Repo-Pop',
  POPPED: 'Repo-Popped',
  POP_FAILED: 'Repo-PopFailed',
  APPLY: 'Repo-Apply',
  APPLIED: 'Repo-Applied',
  APPLY_FAILED: 'Repo-ApplyFailed',
  DELETE_STASH: 'Repo-DeleteStash',
  STASH_DELETED: 'Repo-StashDeleted',
  DELETE_STASH_FAILED: 'Repo-DeleteStashFailed',

  CREATE_BRANCH: 'Repo-CreateBranch',
  BRANCH_CREATED: 'Repo-BranchCreated',
  BRANCH_CREATE_FAILED: 'Repo-BranchCreateFailed',
  CHECKOUT: 'Repo-Checkout',
  CHECKEDOUT: 'Repo-Checkedout',
  CHECKOUT_FAILED: 'Repo-CheckoutFailed',
  DELETE_BRANCH: 'Repo-DeleteBranch',
  BRANCH_DELETED: 'Repo-BranchDeleted',
  BRANCH_DELETE_FAILED: 'Repo-BranchDeleteFailed',
  BRANCH_CHANGED: 'Repo-BranchChanged',
  BRANCH_POSITION_RETRIEVED: 'Repo-BranchPositionRetrieved',

  CREATE_TAG: 'Repo-CreateTag',
  TAG_CREATED: 'Repo-TagCreated',
  CREATE_TAG_FAILED: 'Repo-CreateTagFailed',
  DELETE_TAG: 'Repo-DeleteTag',
  TAG_DELETED: 'Repo-TagDeleted',
  DELETE_TAG_FAILED: 'Repo-DeleteTagFailed',
  PUSH_TAG: 'Repo-PushTag',
  TAG_PUSHED: 'Repo-TagPushed',
  PUSH_TAG_FAILED: 'Repo-PushTagFailed',

  DISCARD_ALL: 'Repo-DiscardAll',
  DISCARDED: 'Repo-Discarded',
  DISCARD_FAILED: 'Repo-DiscardFailed',
  RESET_HARD: 'Repo-ResetHard',
  RESET_SOFT: 'Repo-ResetSoft',
  RESETTED: 'Repo-Resetted',
  RESET_FAILED: 'Repo-ResetFailed',

  REF_RETRIEVED: 'Repo-RefRetrieved',
  REMOTES_CHANGED: 'Repo-RemotesChanged',

  FILE_STATUS_RETRIEVED: 'Repo-FileStatusRetrieved',
  GET_FILE_DETAIL: 'Repo-GetFileDetail',
  FILE_DETAIL_RETRIEVED: 'Repo-FileDetailRetrieved',
  FILE_DETAIL_NOT_FOUND: 'Repo-FileDetailNotFound',
  LIVE_UPDATE_FILE_NOT_FOUND: 'Repo-LiveUpdateFileNotFound',
  OPEN_EXTERNAL_FILE: 'Repo-OpenExternalFile',
  SUBSCRIBE_FILE_UPDATE: 'Repo-SubscribeFileUpdate',
  UNSUBSCRIBE_FILE_UPDATE: 'Repo-UnsubscribeFileUpdate',

  GET_SUBMODULE_DETAILS: 'Repo-GetSubmoduleDetails',
  SUBMODULE_DETAILS_RETRIEVED: 'Repo-SubmoduleDetailsRetrieved',
  SUBMODULE_NAMES_RETRIEVED: 'Repo-SubmoduleNamesRetrieved',

  FAILED_GET_COMMIT_DETAIL: 'Repo-FailedGetCommitDetail',

  SET_CRED: 'Repo-SetCred',
  CREDENTIAL_ISSUE: 'Repo-CredentialIssue',
  USERNAME_RETRIEVED: 'Repo-UsernameRetrieved',
  PASSWORD_RETRIEVED: 'Repo-PasswordRetrieved',
  SSH_KEY_REQUIRED: 'Repo-SSHKeyRequired',

  REMOVE_HISTORY: 'Repo-RemoveHistory',
  HISTORY_CHANGED: 'Repo-HistoryChanged',

  BLOCKING_OPERATION_BEGAN: 'Repo-BlockingOperationBegan',
  BLOCKING_OPERATION_END: 'Repo-BlockingOperationEnd',
  BLOCKING_UPDATE: 'Repo-BlockingUpdate',
  STATUS_UPDATED: 'Repo-StatusUpdated',
} as const;

/** Settings management channels */
const SETTINGS = {
  INIT: 'Settings-Init',
  SET: 'Settings-Set',
  UPDATED: 'Settings-Updated',
  EFFECTIVE_UPDATED: 'Settings-EffectiveUpdated',
  SET_SECURE_REPO: 'Settings-SetSecureRepo',
  GET_SECURE_REPO: 'Settings-GetSecureRepo',
  SECURE_REPO_RETRIEVED: 'Settings-SecureRepoRetrieved',
  BROWSE_FILE: 'Settings-BrowseFile',
  FOLDER_SELECTED: 'Settings-FolderSelected',
} as const;

/** Auto fetch channels */
const AUTO_FETCH = {
  TIMEOUT: 'AutoFetch-Timeout',
} as const;

/** CI integration channels */
const CI = {
  REPO_CHANGED: 'CI-RepoChanged',
  QUERY_BEGAN: 'CI-QueryBegan',
  BUILDS_RETRIEVED: 'CI-BuildsRetrieved',
  REQUEST_ERROR: 'CI-RequestError',
  APPVEYOR: {
    SET_CONFIG: 'AppVeyor-SetConfig',
    GET_BUILD: 'AppVeyor-GetBuild',
    BUILD_RETRIEVED: 'AppVeyor-BuildRetrieved',
    REBUILD: 'CI-AppVeyorRebuild',
    REBUILDED: 'CI-AppVeyorRebuilded',
    REBUILD_FAILED: 'CI-AppVeyorRebuildFailed',
    GET_LOG: 'CI-AppVeyorGetLog',
    LOG_RETRIEVED: 'CI-AppVeyorLogRetrieved',
    LOG_NOT_FOUND: 'CI-AppVeyorLogNotFound',
    STATUS_RETRIEVED: 'CI-AppVeyorStatusRetrieved',
  },
} as const;

/** JIRA integration channels */
const JIRA = {
  SET_CONFIG: 'Jira-SetConfig',
  GET_ISSUE: 'JIRA-GetIssue',
  ISSUE_RETRIEVED: 'JIRA-IssueRetrieved',
  ADD_COMMENT: 'JIRA-AddComment',
  COMMENT_ADDED: 'Jira-CommentAdded',
  UPDATE_ISSUE: 'JIRA-UpdateIssue',
  REPO_CHANGED: 'JIRA-RepoChanged',
  RESOLUTIONS_RETRIEVED: 'JIRA-ResolutionsRetrieved',
  ISSUE_TYPES_RETRIEVED: 'JIRA-IssueTypesRetrieved',
  ERROR: 'JIRA-Error',
  TIMEOUT: 'JIRA-Timeout',
  OPERATION_FAILED: 'JIRA-OperationFailed',
  NOT_FOUND: 'JIRA-NotFound',
  CAPTCHA_REQUIRED: 'JIRA-CAPTCHARequired',
  GET_ASSIGNABLE_USERS: 'JIRA-GetAssignableUsers',
  ASSIGNABLE_USERS_RETRIEVED: 'JIRA-AssignableUsersRetrieved',
  ASSIGN_ISSUE: 'JIRA-AssignIssue',
  ADD_SUBTASK: 'JIRA-AddSubtask',
  SEARCH_ISSUES: 'JIRA-SearchIssues',
  ISSUE_QUERY_RESULT_RETRIEVED: 'JIRA-IssueQueryResultRetrieved',
} as const;

/** Updater channels */
const UPDATER = {
  CHECK: 'Updater-Check',
  CHECKING: 'Updater-Checking',
} as const;

/** Credential security channels */
const SECURE = {
  CLEAR_CACHE: 'Secure-ClearCache',
  CACHE_CLEARED: 'Secure-CacheCleared',
  CLEAR_CACHE_FAILED: 'Secure-ClearCacheFailed',
} as const;

/** Shell channels */
const SHELL = {
  OPEN: 'Shell-Open',
} as const;

/** Cache channels */
const CACHE = {
  AUTO_CLEAN_BEGIN: 'Cache-AutoCleanBegin',
  AUTO_CLEAN_SUCCESS: 'Cache-AutoCleanSuccess',
} as const;

/** Release notes channels */
const RELEASE_NOTES = {
  GET: 'ReleaseNote-Get',
  RETRIEVED: 'ReleaseNote-Retrieved',
} as const;

export const IPC_EVENTS = {
  REPO,
  SETTINGS,
  AUTO_FETCH,
  CI,
  JIRA,
  UPDATER,
  SECURE,
  SHELL,
  CACHE,
  RELEASE_NOTES,
} as const;
