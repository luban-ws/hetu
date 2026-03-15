/**
 * Repository Management Module - Main Entry Point
 * Orchestrates all repository operations using pure functions
 */

import { repoState } from "./state/repo-state.js";
import { repoOperations } from "./operations/repo-operations.ts";
import {
  createIpcHandlers,
  registerIpcHandlers,
} from "./handlers/ipc-handlers.js";

/**
 * Initialize the repository module
 * @param {BrowserWindow} win - Main window instance
 * @param {Object} settingsInstance - Settings instance
 * @param {Object} historyInstance - Repository history instance
 * @param {Object} fileWatcherInstance - File watcher instance
 */
function init(win, settingsInstance, historyInstance, fileWatcherInstance) {
  // Initialize state
  repoState.setWindow(win);
  repoState.setSettings(settingsInstance);
  repoState.setRepoHistory(historyInstance);

  // Create and register IPC handlers
  // Temporarily disabled to avoid conflicts with legacy system
  // const handlers = createIpcHandlers(repoOperations);
  // registerIpcHandlers(handlers);
}

// Export main functions
export { init };
export const initRepo = repoOperations.initRepo;
export const openRepo = repoOperations.openRepo;

// Export wrapped functions for external use
export const wrappedFetchRepo = repoOperations.fetchRepo;
export const wrappedGetCurrentRemotes = repoOperations.getCurrentRemotes;
export const wrappedGetCurrentFirstRemote = async () => {
  const remotes = await repoOperations.getCurrentRemotes();
  return remotes.length > 0 ? remotes[0] : null;
};
export const wrappedPullWrapper = repoOperations.pullWrapper;
export const wrappedCloseRepo = repoOperations.closeRepo;
export const wrappedStageLines = repoOperations.stageFile;
export const wrappedUnstageLines = repoOperations.unstageFile;
export const wrappedOpenRepo = repoOperations.openRepo;
