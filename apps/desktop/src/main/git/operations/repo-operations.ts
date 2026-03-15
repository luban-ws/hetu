/**
 * Repository Operations - Pure Functions
 * High-level repository operations that combine multiple Git operations
 */

import { gitOperations } from "./git-operations.js";
import { repoState, repoUtils } from "../state/repo-state.js";
import { IPC_EVENTS } from "@common/ipc-events";
import { getLogger } from "@common/logger";
import { safeSend } from "../../infrastructure/ipc-wrapper.js";

const logger = getLogger("repo-operations");

interface FileStatus {
  path(): string;
  isNew(): boolean;
  isModified(): boolean;
  isDeleted(): boolean;
  isRenamed(): boolean;
  isIgnored(): boolean;
  inIndex(): boolean;
  inWorkingTree(): boolean;
}

interface StatusSummary {
  ignored: number;
  newCount: number;
  deleted: number;
  modified: number;
  renamed: number;
}

interface RepoInfo {
  status: FileStatus[];
  currentBranch: string;
  branches: any[];
}

interface RepositoryData {
  adapter: any;
  workingDir: string;
}

// Pure repository operation functions
export const repoOperations = {
  // Main repository operations
  openRepo: repoUtils.withErrorHandling(async (workingDir: string) => {
    const repo = await gitOperations.openRepository(workingDir);
    repoState.setRepo(repo);

    const repoName = repoUtils.getRepoName(workingDir);
    const window = repoState.getWindow();

    safeSend(window.webContents, IPC_EVENTS.REPO.OPEN_SUCCESSFUL, {
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
          // Ensure remote data is serializable
          const safeRemote = {
            url:
              typeof remotes[0].url === "string"
                ? remotes[0].url
                : String(remotes[0].url || ""),
            name:
              typeof remotes[0].name === "string"
                ? remotes[0].name
                : String(remotes[0].name || "origin"),
          };
          safeSend(window.webContents, IPC_EVENTS.REPO.REMOTES_CHANGED, {
            remote: safeRemote.url,
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

    // Get repository status and commit history in parallel
    const [repoInfo, commits]: [RepoInfo, any[]] = await Promise.all([
      gitOperations.getRepositoryStatus(repo.adapter),
      gitOperations.getCommits(repo.adapter, 50, "HEAD"),
    ]);

    // Create fully serializable repo info
    const fullRepoInfo = {
      workingDir: repo.workingDir,
      currentBranch:
        typeof repoInfo.currentBranch === "string"
          ? repoInfo.currentBranch
          : repoInfo.currentBranch?.name || "",
      branches: Array.isArray(repoInfo.branches)
        ? repoInfo.branches.map((branch) => {
            if (typeof branch === "string") {
              return branch;
            }
            return {
              name: branch.name || "",
              current: Boolean(branch.current),
              remote: Boolean(branch.remote),
              ...(branch.upstream && { upstream: String(branch.upstream) }),
              ...(branch.ahead && { ahead: Number(branch.ahead) }),
              ...(branch.behind && { behind: Number(branch.behind) }),
            };
          })
        : [],
    };

    const window = repoState.getWindow();
    safeSend(window?.webContents, IPC_EVENTS.REPO.STATUS_UPDATED, fullRepoInfo);

    // Transform status into file status format for renderer
    const safeStatus = Array.isArray(repoInfo.status) ? repoInfo.status : [];
    const stagedFiles =
      safeStatus.filter(
        (file) =>
          file &&
          file.inIndex &&
          typeof file.inIndex === "function" &&
          file.inIndex()
      ) || [];
    const unstagedFiles =
      safeStatus.filter(
        (file) =>
          file &&
          file.inWorkingTree &&
          typeof file.inWorkingTree === "function" &&
          file.inWorkingTree()
      ) || [];

    // Convert file objects to serializable plain objects
    const transformFileForSerialization = (file: FileStatus) => ({
      path: file.path || "",
      isNew:
        file.isNew && typeof file.isNew === "function" ? file.isNew() : false,
      isModified:
        file.isModified && typeof file.isModified === "function"
          ? file.isModified()
          : false,
      isRenamed:
        file.isRenamed && typeof file.isRenamed === "function"
          ? file.isRenamed()
          : false,
      isIgnored: false, // Default value
      isDeleted:
        file.isDeleted && typeof file.isDeleted === "function"
          ? file.isDeleted()
          : false,
    });

    const staged = stagedFiles.map(transformFileForSerialization);
    const unstaged = unstagedFiles.map(transformFileForSerialization);

    // Create summaries with safe checks
    const createSummary = (files: FileStatus[]): StatusSummary => ({
      ignored: 0,
      newCount: files.filter(
        (f) => f && f.isNew && typeof f.isNew === "function" && f.isNew()
      ).length,
      deleted: files.filter(
        (f) =>
          f && f.isDeleted && typeof f.isDeleted === "function" && f.isDeleted()
      ).length,
      modified: files.filter(
        (f) =>
          f &&
          f.isModified &&
          typeof f.isModified === "function" &&
          f.isModified()
      ).length,
      renamed: files.filter(
        (f) =>
          f && f.isRenamed && typeof f.isRenamed === "function" && f.isRenamed()
      ).length,
    });

    // Always send FILE_STATUS_RETRIEVED event, even if empty
    const fileStatusData = {
      staged,
      unstaged,
      stagedSummary: createSummary(stagedFiles),
      unstagedSummary: createSummary(unstagedFiles),
      summary: createSummary([...stagedFiles, ...unstagedFiles]),
    };
    safeSend(
      window?.webContents,
      IPC_EVENTS.REPO.FILE_STATUS_RETRIEVED,
      fileStatusData
    );

    // Send commit history separately with serializable data
    if (commits && commits.length > 0) {
      const serializableCommits = commits.map((commit) => ({
        sha: commit.sha || "",
        author: commit.author || "",
        email: commit.email || "",
        parents: Array.isArray(commit.parents) ? commit.parents : [],
        message: commit.message || "",
        date: commit.date ? new Date(commit.date) : new Date(),
        ci: commit.ci || "",
        virtual: Boolean(commit.virtual),
        isStash: Boolean(commit.isStash),
        stashIndex:
          typeof commit.stashIndex === "number" ? commit.stashIndex : -1,
      }));
      safeSend(window?.webContents, IPC_EVENTS.REPO.COMMITS_UPDATED, {
        commits: serializableCommits,
      });
      return { ...fullRepoInfo, commits: serializableCommits };
    }

    return { ...fullRepoInfo, commits: [] };
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
