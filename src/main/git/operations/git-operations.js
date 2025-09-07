/**
 * Git Operations Module - Pure Functions
 * Contains all Git operations as pure functions
 */

import { createGitAdapter } from "../git-adapter-factory.js";

// Pure Git operation functions
export const gitOperations = {
  // Repository operations
  openRepository: async (workingDir) => {
    const adapter = await createGitAdapter(workingDir);
    const repo = await adapter.open(workingDir);
    return { adapter, workingDir };
  },

  initRepository: async (repoPath) => {
    const adapter = await createGitAdapter(repoPath);
    return await adapter.init(repoPath);
  },

  closeRepository: async (adapter) => {
    if (adapter) await adapter.close();
  },

  // Status operations
  getRepositoryStatus: async (adapter) => {
    const [status, currentBranch, branches] = await Promise.all([
      adapter.getStatus(),
      adapter.getCurrentBranch(),
      adapter.listBranches(),
    ]);
    return { status, currentBranch, branches };
  },

  // Branch operations
  createBranch: async (adapter, name, startPoint = "HEAD") => {
    return await adapter.createBranch(name, startPoint);
  },

  deleteBranch: async (adapter, name, force = false) => {
    return await adapter.deleteBranch(name, force);
  },

  switchBranch: async (adapter, name) => {
    return await adapter.switchBranch(name);
  },

  // Commit operations
  createCommit: async (adapter, message, options = {}) => {
    return await adapter.createCommit(message, options);
  },

  getCommits: async (adapter, limit = 50, ref = "HEAD") => {
    return await adapter.getCommits(limit, ref);
  },

  // Staging operations
  stageFile: async (adapter, filepath) => {
    return await adapter.stageFile(filepath);
  },

  unstageFile: async (adapter, filepath) => {
    return await adapter.unstageFile(filepath);
  },

  stageAll: async (adapter) => {
    return await adapter.stageAll();
  },

  unstageAll: async (adapter) => {
    return await adapter.unstageAll();
  },

  // Remote operations
  fetch: async (adapter, remote = null) => {
    return await adapter.fetch(remote);
  },

  pull: async (adapter, remote, branch) => {
    return await adapter.pull(remote, branch);
  },

  push: async (adapter, remote, branch) => {
    return await adapter.push(remote, branch);
  },

  getRemotes: async (adapter) => {
    return await adapter.getRemotes();
  },

  // Merge operations
  merge: async (adapter, branch) => {
    return await adapter.merge(branch);
  },

  reset: async (adapter, type, commit) => {
    return await adapter.reset(type, commit);
  },

  // Stash operations
  stashSave: async (adapter, message, options = {}) => {
    return await adapter.stashSave(message, options);
  },

  stashPop: async (adapter, index = 0) => {
    return await adapter.stashPop(index);
  },

  stashApply: async (adapter, index = 0) => {
    return await adapter.stashApply(index);
  },

  stashDrop: async (adapter, index = 0) => {
    return await adapter.stashDrop(index);
  },

  stashList: async (adapter) => {
    return await adapter.stashList();
  },

  // Tag operations
  createTag: async (adapter, name, commit = "HEAD") => {
    return await adapter.createTag(name, commit);
  },

  deleteTag: async (adapter, name) => {
    return await adapter.deleteTag(name);
  },

  // Diff operations
  getDiff: async (adapter, filepath = null) => {
    return await adapter.getDiff(filepath);
  },
};
