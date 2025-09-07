/**
 * Base Git Adapter Interface
 * Defines the contract that all Git implementations must follow
 */

export class BaseGitAdapter {
  constructor(workingDir) {
    this.workingDir = workingDir;
  }

  // Repository operations
  async open(dir) {
    throw new Error('Method "open" must be implemented by subclass');
  }

  async init(dir) {
    throw new Error('Method "init" must be implemented by subclass');
  }

  async close() {
    // Optional: cleanup resources
  }

  // Status operations
  async getStatus() {
    throw new Error('Method "getStatus" must be implemented by subclass');
  }

  async getFileStatus(filepath) {
    throw new Error('Method "getFileStatus" must be implemented by subclass');
  }

  // Branch operations
  async getCurrentBranch() {
    throw new Error('Method "getCurrentBranch" must be implemented by subclass');
  }

  async listBranches() {
    throw new Error('Method "listBranches" must be implemented by subclass');
  }

  async createBranch(name, startPoint) {
    throw new Error('Method "createBranch" must be implemented by subclass');
  }

  async deleteBranch(name, force = false) {
    throw new Error('Method "deleteBranch" must be implemented by subclass');
  }

  async switchBranch(name) {
    throw new Error('Method "switchBranch" must be implemented by subclass');
  }

  async getBranchUpstream(branchName) {
    throw new Error('Method "getBranchUpstream" must be implemented by subclass');
  }

  async setBranchUpstream(localBranch, remoteBranch) {
    throw new Error('Method "setBranchUpstream" must be implemented by subclass');
  }

  // Commit operations
  async getCommits(limit = 50, ref = 'HEAD') {
    throw new Error('Method "getCommits" must be implemented by subclass');
  }

  async getCommit(sha) {
    throw new Error('Method "getCommit" must be implemented by subclass');
  }

  async createCommit(message, options = {}) {
    throw new Error('Method "createCommit" must be implemented by subclass');
  }

  // Staging operations
  async stageFile(filepath) {
    throw new Error('Method "stageFile" must be implemented by subclass');
  }

  async unstageFile(filepath) {
    throw new Error('Method "unstageFile" must be implemented by subclass');
  }

  async stageAll() {
    throw new Error('Method "stageAll" must be implemented by subclass');
  }

  // Stash operations
  async stashSave(message, options = {}) {
    throw new Error('Method "stashSave" must be implemented by subclass');
  }

  async stashPop(index = 0) {
    throw new Error('Method "stashPop" must be implemented by subclass');
  }

  async stashApply(index = 0) {
    throw new Error('Method "stashApply" must be implemented by subclass');
  }

  async stashDrop(index = 0) {
    throw new Error('Method "stashDrop" must be implemented by subclass');
  }

  async stashList() {
    throw new Error('Method "stashList" must be implemented by subclass');
  }

  // Reset operations
  async resetSoft(commit) {
    throw new Error('Method "resetSoft" must be implemented by subclass');
  }

  async resetMixed(commit) {
    throw new Error('Method "resetMixed" must be implemented by subclass');
  }

  async resetHard(commit) {
    throw new Error('Method "resetHard" must be implemented by subclass');
  }

  // Diff operations
  async getDiff(options = {}) {
    throw new Error('Method "getDiff" must be implemented by subclass');
  }

  async getFileDiff(filepath, options = {}) {
    throw new Error('Method "getFileDiff" must be implemented by subclass');
  }

  // Tag operations
  async listTags() {
    throw new Error('Method "listTags" must be implemented by subclass');
  }

  async createTag(name, message, commit) {
    throw new Error('Method "createTag" must be implemented by subclass');
  }

  async deleteTag(name) {
    throw new Error('Method "deleteTag" must be implemented by subclass');
  }

  // Remote operations
  async listRemotes() {
    throw new Error('Method "listRemotes" must be implemented by subclass');
  }

  async fetch(remote = 'origin', branch = null) {
    throw new Error('Method "fetch" must be implemented by subclass');
  }

  async pull(remote = 'origin', branch = null) {
    throw new Error('Method "pull" must be implemented by subclass');
  }

  async push(remote = 'origin', branch = null, options = {}) {
    throw new Error('Method "push" must be implemented by subclass');
  }

  // Merge operations
  async merge(branch, options = {}) {
    throw new Error('Method "merge" must be implemented by subclass');
  }

  // Configuration
  async getConfig(key) {
    throw new Error('Method "getConfig" must be implemented by subclass');
  }

  async setConfig(key, value) {
    throw new Error('Method "setConfig" must be implemented by subclass');
  }

  // Graph operations
  async getAheadBehind(local, upstream) {
    throw new Error('Method "getAheadBehind" must be implemented by subclass');
  }

  // Utility methods that can be overridden
  async validateRepository() {
    try {
      await this.open(this.workingDir);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper method for signature creation
  async getDefaultSignature() {
    try {
      const name = await this.getConfig('user.name') || 'Unknown';
      const email = await this.getConfig('user.email') || 'unknown@example.com';
      return {
        name,
        email,
        when: Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      return {
        name: 'Unknown',
        email: 'unknown@example.com',
        when: Math.floor(Date.now() / 1000)
      };
    }
  }
}

export default BaseGitAdapter;