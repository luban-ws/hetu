/**
 * IPC Event Handlers - Pure Functions
 * Handles all IPC events for repository operations
 */

import { ipcMain } from "electron";
import { IPC_EVENTS } from "@common/ipc-events";
import { gitOperations } from "../operations/git-operations.js";
import { repoState, repoUtils } from "../state/repo-state.js";

// Pure event handler functions
export const createIpcHandlers = (operations) => {
  const handlers = {
    // Repository lifecycle
    [IPC_EVENTS.REPO.OPEN]: operations.openRepo,
    [IPC_EVENTS.REPO.INIT]: operations.initRepo,
    [IPC_EVENTS.REPO.CLOSE]: operations.closeRepo,
    [IPC_EVENTS.REPO.REFRESH]: operations.refreshRepo,

    // Git operations
    [IPC_EVENTS.REPO.FETCH]: operations.fetchRepo,
    [IPC_EVENTS.REPO.PULL]: operations.pullWrapper,
    [IPC_EVENTS.REPO.PUSH]: operations.pushWrapper,
    [IPC_EVENTS.REPO.COMMIT]: operations.commitWrapper,
    [IPC_EVENTS.REPO.STAGE]: operations.stageFile,
    [IPC_EVENTS.REPO.UNSTAGE]: operations.unstageFile,
    [IPC_EVENTS.REPO.STAGE_ALL]: operations.stageAll,
    [IPC_EVENTS.REPO.UNSTAGE_ALL]: operations.unstageAll,

    // Branch operations
    [IPC_EVENTS.REPO.CREATE_BRANCH]: operations.createBranch,
    [IPC_EVENTS.REPO.DELETE_BRANCH]: operations.deleteBranch,
    [IPC_EVENTS.REPO.SWITCH_BRANCH]: operations.switchBranch,

    // Merge and reset
    [IPC_EVENTS.REPO.MERGE]: operations.mergeWrapper,
    [IPC_EVENTS.REPO.RESET]: operations.resetWrapper,

    // Stash operations
    [IPC_EVENTS.REPO.STASH_SAVE]: operations.stashSave,
    [IPC_EVENTS.REPO.STASH_POP]: operations.stashPop,
    [IPC_EVENTS.REPO.STASH_APPLY]: operations.stashApply,
    [IPC_EVENTS.REPO.STASH_DROP]: operations.stashDrop,
    [IPC_EVENTS.REPO.STASH_LIST]: operations.stashList,

    // Tag operations
    [IPC_EVENTS.REPO.CREATE_TAG]: operations.createTag,
    [IPC_EVENTS.REPO.DELETE_TAG]: operations.deleteTag,

    // Information retrieval
    [IPC_EVENTS.REPO.GET_COMMITS]: operations.getCommits,
    [IPC_EVENTS.REPO.GET_BRANCHES]: operations.getBranches,
    [IPC_EVENTS.REPO.GET_REMOTES]: operations.getCurrentRemotes,
    [IPC_EVENTS.REPO.GET_STATUS]: operations.getStatus,
    [IPC_EVENTS.REPO.GET_DIFF]: operations.getDiff,
  };

  return handlers;
};

// Pure function to register IPC handlers
export const registerIpcHandlers = (handlers) => {
  Object.entries(handlers).forEach(([event, handler]) => {
    ipcMain.handle(event, handler);
  });
};
