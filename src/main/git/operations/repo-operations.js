/**
 * Repository Operations - Pure Functions
 * High-level repository operations that combine multiple Git operations
 */

import { gitOperations } from "./git-operations.js";
import { repoState, repoUtils } from "../state/repo-state.js";
import { IPC_EVENTS } from "@common/ipc-events";

// Pure repository operation functions
export const repoOperations = {
  // Main repository operations
  openRepo: repoUtils.withErrorHandling(async (workingDir) => {
    const repo = await gitOperations.openRepository(workingDir);
    repoState.setRepo(repo);

    const repoName = repoUtils.getRepoName(workingDir);
    const window = repoState.getWindow();

    window.webContents.send(IPC_EVENTS.REPO.OPEN_SUCCESSFUL, {
      repoName,
      workingDir,
    });

    const settings = repoState.getSettings();
    const repoHistory = repoState.getRepoHistory();

    settings.setRepo(workingDir, repoName);
    repoHistory.updateRepos();

    // Setup refresh interval
    repoState.clearRefreshInterval();
    const refreshInterval = setInterval(repoOperations.refreshRepo, 10000);
    repoState.setRefreshInterval(refreshInterval);

    // Get remotes info
    repoOperations
      .getCurrentRemotes()
      .then((remotes) => {
        if (remotes.length > 0) {
          window.webContents.send(IPC_EVENTS.REPO.REMOTES_CHANGED, {
            remote: remotes[0].url,
          });
        }
      })
      .catch(console.warn);

    return repoOperations.refreshRepo();
  }),

  initRepo: repoUtils.withErrorHandling(gitOperations.initRepository),

  closeRepo: repoUtils.withErrorHandling(async () => {
    const repo = repoState.getRepo();
    if (repo?.adapter) {
      await gitOperations.closeRepository(repo.adapter);
    }
    repoState.clearRefreshInterval();
    repoState.setRepo(null);
  }),

  refreshRepo: repoUtils.withErrorHandling(async () => {
    const repo = repoState.getRepo();
    if (!repo?.adapter) return null;

    const repoInfo = await gitOperations.getRepositoryStatus(repo.adapter);
    const fullRepoInfo = {
      ...repoInfo,
      workingDir: repo.workingDir,
    };

    const window = repoState.getWindow();
    window?.webContents.send(IPC_EVENTS.REPO.STATUS_UPDATED, fullRepoInfo);

    return fullRepoInfo;
  }),

  // Wrapped Git operations with repository validation
  fetchRepo: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (remote) => {
      const repo = repoState.getRepo();
      return await gitOperations.fetch(repo.adapter, remote);
    })
  ),

  pullWrapper: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (remote, branch) => {
      const repo = repoState.getRepo();
      return await gitOperations.pull(repo.adapter, remote, branch);
    })
  ),

  pushWrapper: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (remote, branch) => {
      const repo = repoState.getRepo();
      return await gitOperations.push(repo.adapter, remote, branch);
    })
  ),

  commitWrapper: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (message, options) => {
      const repo = repoState.getRepo();
      return await gitOperations.createCommit(repo.adapter, message, options);
    })
  ),

  stageFile: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (filepath) => {
      const repo = repoState.getRepo();
      return await gitOperations.stageFile(repo.adapter, filepath);
    })
  ),

  unstageFile: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (filepath) => {
      const repo = repoState.getRepo();
      return await gitOperations.unstageFile(repo.adapter, filepath);
    })
  ),

  stageAll: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async () => {
      const repo = repoState.getRepo();
      return await gitOperations.stageAll(repo.adapter);
    })
  ),

  unstageAll: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async () => {
      const repo = repoState.getRepo();
      return await gitOperations.unstageAll(repo.adapter);
    })
  ),

  createBranch: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (name, startPoint) => {
      const repo = repoState.getRepo();
      return await gitOperations.createBranch(repo.adapter, name, startPoint);
    })
  ),

  deleteBranch: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (name, force) => {
      const repo = repoState.getRepo();
      return await gitOperations.deleteBranch(repo.adapter, name, force);
    })
  ),

  switchBranch: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (name) => {
      const repo = repoState.getRepo();
      return await gitOperations.switchBranch(repo.adapter, name);
    })
  ),

  mergeWrapper: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (branch) => {
      const repo = repoState.getRepo();
      return await gitOperations.merge(repo.adapter, branch);
    })
  ),

  resetWrapper: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (type, commit) => {
      const repo = repoState.getRepo();
      return await gitOperations.reset(repo.adapter, type, commit);
    })
  ),

  stashSave: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (message, options) => {
      const repo = repoState.getRepo();
      return await gitOperations.stashSave(repo.adapter, message, options);
    })
  ),

  stashPop: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (index) => {
      const repo = repoState.getRepo();
      return await gitOperations.stashPop(repo.adapter, index);
    })
  ),

  stashApply: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (index) => {
      const repo = repoState.getRepo();
      return await gitOperations.stashApply(repo.adapter, index);
    })
  ),

  stashDrop: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (index) => {
      const repo = repoState.getRepo();
      return await gitOperations.stashDrop(repo.adapter, index);
    })
  ),

  stashList: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async () => {
      const repo = repoState.getRepo();
      return await gitOperations.stashList(repo.adapter);
    })
  ),

  createTag: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (name, commit) => {
      const repo = repoState.getRepo();
      return await gitOperations.createTag(repo.adapter, name, commit);
    })
  ),

  deleteTag: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (name) => {
      const repo = repoState.getRepo();
      return await gitOperations.deleteTag(repo.adapter, name);
    })
  ),

  getCommits: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (limit, ref) => {
      const repo = repoState.getRepo();
      return await gitOperations.getCommits(repo.adapter, limit, ref);
    })
  ),

  getBranches: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async () => {
      const repo = repoState.getRepo();
      return await gitOperations.getRepositoryStatus(repo.adapter);
    })
  ),

  getCurrentRemotes: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async () => {
      const repo = repoState.getRepo();
      return await gitOperations.getRemotes(repo.adapter);
    })
  ),

  getStatus: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async () => {
      const repo = repoState.getRepo();
      return await gitOperations.getRepositoryStatus(repo.adapter);
    })
  ),

  getDiff: repoUtils.withErrorHandling(
    repoUtils.requireRepo(async (filepath) => {
      const repo = repoState.getRepo();
      return await gitOperations.getDiff(repo.adapter, filepath);
    })
  ),
};
