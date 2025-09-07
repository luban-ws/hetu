/**
 * Isomorphic Git Adapter Implementation
 * Pure JavaScript git implementation - no native dependencies required
 */

import git from "isomorphic-git";
import fs from "fs";
import path from "path";
import { BaseGitAdapter } from "./base-git-adapter.js";
import { getLogger } from "@common/logger";

const logger = getLogger("isomorphic-git");

/**
 * HTTP configuration for isomorphic-git remote operations
 */
const getHttpConfig = () => {
  try {
    // In Electron main process, we should use Node.js built-in http/https modules
    const http = require("http");
    const https = require("https");

    // Create an HttpClient that isomorphic-git expects
    const httpClient = {
      request: (options: {
        url: string | URL;
        method: any;
        headers: any;
        body: any;
      }) => {
        return new Promise((resolve, reject) => {
          const isHttps = options.url.startsWith?.("https:");
          const module = isHttps ? https : http;
          const urlObj = new URL(options.url);

          const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || "GET",
            headers: options.headers || {},
          };

          const req = module.request(requestOptions, (res) => {
            let data = Buffer.alloc(0);
            res.on("data", (chunk) => {
              data = Buffer.concat([data, chunk]);
            });
            res.on("end", () => {
              resolve({
                url: options.url,
                method: options.method,
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                body: data,
                headers: res.headers,
              });
            });
          });

          req.on("error", reject);

          if (options.body) {
            req.write(options.body);
          }
          req.end();
        });
      },
    };

    return { http: httpClient };
  } catch (error) {
    logger.error("Failed to create HTTP configuration", error);
    // Return empty object as last resort - operations will fail but won't crash
    return {};
  }
};

/**
 * Isomorphic Git Adapter
 * Provides git operations using pure JavaScript implementation
 */
export class IsomorphicGitAdapter extends BaseGitAdapter {
  constructor(workingDir) {
    super(workingDir);
    this.fs = fs;
  }

  /**
   * Open repository and validate it exists
   * @param {string} dir - Directory path to open
   * @returns {Promise<{workingDir: string}>}
   */
  async open(dir = null) {
    const targetDir = dir || this.workingDir;

    try {
      // Check if directory exists and is accessible
      await fs.promises.access(targetDir, fs.constants.R_OK);

      // Verify it's a git repository
      const gitDir = path.join(targetDir, ".git");
      await fs.promises.access(gitDir, fs.constants.R_OK);

      this.workingDir = targetDir;
      logger.debug(`Successfully opened repository: ${targetDir}`);

      return { workingDir: targetDir };
    } catch (error) {
      logger.error(`Failed to open repository: ${error.message}`);
      throw new Error(`Failed to open git repository: ${error.message}`);
    }
  }

  /**
   * Initialize new git repository
   * @param {string} dir - Directory path to initialize
   * @returns {Promise<{workingDir: string}>}
   */
  async init(dir = null) {
    const targetDir = dir || this.workingDir;

    try {
      await git.init({
        fs: this.fs,
        dir: targetDir,
        defaultBranch: "main",
      });

      this.workingDir = targetDir;
      logger.debug(`Initialized repository: ${targetDir}`);

      return { workingDir: targetDir };
    } catch (error) {
      logger.error(`Failed to initialize repository: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close repository (cleanup if needed)
   */
  async close() {
    // Isomorphic-git doesn't require explicit cleanup
    logger.debug("Repository closed");
  }

  /**
   * Get repository status
   * @returns {Promise<Array>} Array of file status objects
   */
  async getStatus() {
    try {
      const statusMatrix = await git.statusMatrix({
        fs: this.fs,
        dir: this.workingDir,
      });

      const files = statusMatrix
        .filter(([_filepath, headStatus, workdirStatus, stageStatus]) => {
          // Filter out unmodified files (1,1,1)
          return !(
            headStatus === 1 &&
            workdirStatus === 1 &&
            stageStatus === 1
          );
        })
        .map(([filepath, headStatus, workdirStatus, stageStatus]) => {
          return {
            path: () => filepath,
            isNew: () => headStatus === 0,
            isModified: () => headStatus === 1 && workdirStatus === 2,
            isDeleted: () => workdirStatus === 0,
            isRenamed: () => false, // isomorphic-git doesn't track renames separately
            isIgnored: () => false,
            inIndex: () => stageStatus === 2,
            inWorkingTree: () => workdirStatus === 2,
            // Additional isomorphic-git specific properties
            headStatus,
            workdirStatus,
            stageStatus,
          };
        });

      logger.debug(`Retrieved status for ${files.length} files`);
      return files;
    } catch (error) {
      logger.error(`Failed to get status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current branch name
   * @returns {Promise<string>} Current branch name
   */
  async getCurrentBranch() {
    try {
      const branch = await git.currentBranch({
        fs: this.fs,
        dir: this.workingDir,
        fullname: false,
      });

      return branch || "HEAD";
    } catch (error) {
      logger.error(`Failed to get current branch: ${error.message}`);
      return "HEAD";
    }
  }

  /**
   * List all branches
   * @returns {Promise<Array>} Array of branch objects
   */
  async listBranches() {
    try {
      const branches = [];

      // Get local branches
      try {
        const localBranches = await git.listBranches({
          fs: this.fs,
          dir: this.workingDir,
        });

        const currentBranch = await this.getCurrentBranch();

        for (const branch of localBranches) {
          branches.push({
            name: branch,
            isLocal: true,
            isCurrent: branch === currentBranch,
            isRemote: false,
          });
        }
      } catch (error) {
        logger.debug("No local branches found");
      }

      // Get remote branches
      try {
        const remoteBranches = await git.listBranches({
          fs: this.fs,
          dir: this.workingDir,
          remote: "origin",
        });

        for (const branch of remoteBranches) {
          branches.push({
            name: `origin/${branch}`,
            isLocal: false,
            isCurrent: false,
            isRemote: true,
          });
        }
      } catch (error) {
        logger.debug("No remote branches found");
      }

      return branches;
    } catch (error) {
      logger.error(`Failed to list branches: ${error.message}`);
      return [];
    }
  }

  /**
   * Get commit history
   * @param {number} limit - Maximum number of commits to retrieve
   * @param {string} ref - Branch/commit reference
   * @returns {Promise<Array>} Array of commit objects
   */
  async getCommits(limit = 50, ref = "HEAD") {
    try {
      const commits = await git.log({
        fs: this.fs,
        dir: this.workingDir,
        ref,
        depth: limit,
      });

      return commits.map((commit) => ({
        oid: commit.oid,
        sha: commit.oid,
        commit: {
          author: {
            name: commit.commit.author.name,
            email: commit.commit.author.email,
            timestamp: commit.commit.author.timestamp,
          },
          message: commit.commit.message,
          parent: commit.commit.parent || [],
        },
      }));
    } catch (error) {
      logger.error(`Failed to get commits: ${error.message}`);
      return [];
    }
  }

  /**
   * Get remote repositories
   * @returns {Promise<Array>} Array of remote objects
   */
  async getRemotes() {
    try {
      const remotes = await git.listRemotes({
        fs: this.fs,
        dir: this.workingDir,
      });

      return remotes.map((remote) => ({
        name: remote.remote,
        url: () => remote.url,
        pushurl: () => remote.url,
      }));
    } catch (error) {
      logger.error(`Failed to get remotes: ${error.message}`);
      return [];
    }
  }

  /**
   * Stage a file
   * @param {string} filepath - File path to stage
   */
  async stageFile(filepath) {
    try {
      await git.add({
        fs: this.fs,
        dir: this.workingDir,
        filepath,
      });

      logger.debug(`Staged file: ${filepath}`);
    } catch (error) {
      logger.error(`Failed to stage file ${filepath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unstage a file
   * @param {string} filepath - File path to unstage
   */
  async unstageFile(filepath) {
    try {
      await git.resetIndex({
        fs: this.fs,
        dir: this.workingDir,
        filepath,
      });

      logger.debug(`Unstaged file: ${filepath}`);
    } catch (error) {
      logger.error(`Failed to unstage file ${filepath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stage all changes
   */
  async stageAll() {
    try {
      // Get all files that need staging
      const statusMatrix = await git.statusMatrix({
        fs: this.fs,
        dir: this.workingDir,
      });

      // Stage all modified files
      for (const [
        filepath,
        _headStatus,
        workdirStatus,
        stageStatus,
      ] of statusMatrix) {
        if (workdirStatus === 2 && stageStatus !== 2) {
          await this.stageFile(filepath);
        }
      }

      logger.debug("Staged all changes");
    } catch (error) {
      logger.error(`Failed to stage all: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a commit
   * @param {string} message - Commit message
   * @param {Object} options - Commit options (author info, etc.)
   * @returns {Promise<string>} Commit hash
   */
  async commit(message, options = {}) {
    try {
      const author = options.author || {
        name: "Unknown",
        email: "unknown@example.com",
      };

      const commitHash = await git.commit({
        fs: this.fs,
        dir: this.workingDir,
        message,
        author,
        committer: author,
      });

      logger.debug(`Created commit: ${commitHash}`);
      return commitHash;
    } catch (error) {
      logger.error(`Failed to create commit: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a commit (alias for commit)
   * @param {string} message - Commit message
   * @param {Object} options - Commit options
   * @returns {Promise<string>} Commit hash
   */
  async createCommit(message, options = {}) {
    return await this.commit(message, options);
  }

  /**
   * Get a specific commit
   * @param {string} sha - Commit SHA
   * @returns {Promise<Object>} Commit object
   */
  async getCommit(sha) {
    try {
      const commit = await git.readCommit({
        fs: this.fs,
        dir: this.workingDir,
        oid: sha,
      });

      return {
        oid: commit.oid,
        sha: commit.oid,
        commit: {
          author: {
            name: commit.commit.author.name,
            email: commit.commit.author.email,
            timestamp: commit.commit.author.timestamp,
          },
          message: commit.commit.message,
          parent: commit.commit.parent || [],
        },
      };
    } catch (error) {
      logger.error(`Failed to get commit ${sha}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new branch
   * @param {string} name - Branch name
   * @param {string} startPoint - Starting commit/branch
   * @returns {Promise<void>}
   */
  async createBranch(name, startPoint = "HEAD") {
    try {
      await git.branch({
        fs: this.fs,
        dir: this.workingDir,
        ref: name,
        object: startPoint,
      });

      logger.debug(`Created branch: ${name}`);
    } catch (error) {
      logger.error(`Failed to create branch ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a branch
   * @param {string} name - Branch name
   * @param {boolean} force - Force delete
   * @returns {Promise<void>}
   */
  async deleteBranch(name, _force = false) {
    try {
      await git.deleteBranch({
        fs: this.fs,
        dir: this.workingDir,
        ref: name,
      });

      logger.debug(`Deleted branch: ${name}`);
    } catch (error) {
      logger.error(`Failed to delete branch ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Switch to a branch
   * @param {string} name - Branch name
   * @returns {Promise<void>}
   */
  async switchBranch(name) {
    try {
      await git.checkout({
        fs: this.fs,
        dir: this.workingDir,
        ref: name,
      });

      logger.debug(`Switched to branch: ${name}`);
    } catch (error) {
      logger.error(`Failed to switch to branch ${name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get file status
   * @param {string} filepath - File path
   * @returns {Promise<Object>} File status object
   */
  async getFileStatus(filepath) {
    try {
      const statusMatrix = await git.statusMatrix({
        fs: this.fs,
        dir: this.workingDir,
        filepaths: [filepath],
      });

      if (statusMatrix.length === 0) {
        return null;
      }

      const [, headStatus, workdirStatus, stageStatus] = statusMatrix[0];
      return {
        path: () => filepath,
        isNew: () => headStatus === 0,
        isModified: () => headStatus === 1 && workdirStatus === 2,
        isDeleted: () => workdirStatus === 0,
        isRenamed: () => false,
        isIgnored: () => false,
        inIndex: () => stageStatus === 2,
        inWorkingTree: () => workdirStatus === 2,
        headStatus,
        workdirStatus,
        stageStatus,
      };
    } catch (error) {
      logger.error(
        `Failed to get file status for ${filepath}: ${error.message}`
      );
      return null;
    }
  }

  /**
   * Get git configuration value
   * @param {string} key - Configuration key
   * @returns {Promise<string|null>} Configuration value
   */
  async getConfig(key) {
    try {
      const value = await git.getConfig({
        fs: this.fs,
        dir: this.workingDir,
        path: key,
      });
      return value;
    } catch (error) {
      logger.debug(`Config key ${key} not found`);
      return null;
    }
  }

  /**
   * Set git configuration value
   * @param {string} key - Configuration key
   * @param {string} value - Configuration value
   * @returns {Promise<void>}
   */
  async setConfig(key, value) {
    try {
      await git.setConfig({
        fs: this.fs,
        dir: this.workingDir,
        path: key,
        value,
      });

      logger.debug(`Set config ${key} = ${value}`);
    } catch (error) {
      logger.error(`Failed to set config ${key}: ${error.message}`);
      throw error;
    }
  }

  // Additional stub methods to satisfy base interface
  async getBranchUpstream(_branchName) {
    // Not implemented in isomorphic-git
    return null;
  }

  async setBranchUpstream(_localBranch, _remoteBranch) {
    // Not implemented in isomorphic-git
  }

  async stashSave(_message, _options = {}) {
    // Stash operations not supported in isomorphic-git
    throw new Error("Stash operations not supported by isomorphic-git");
  }

  async stashPop(_index = 0) {
    throw new Error("Stash operations not supported by isomorphic-git");
  }

  async stashApply(_index = 0) {
    throw new Error("Stash operations not supported by isomorphic-git");
  }

  async stashDrop(_index = 0) {
    throw new Error("Stash operations not supported by isomorphic-git");
  }

  async stashList() {
    throw new Error("Stash operations not supported by isomorphic-git");
  }

  async resetSoft(commit) {
    try {
      await git.resetIndex({
        fs: this.fs,
        dir: this.workingDir,
        ref: commit,
      });
      logger.debug(`Reset soft to ${commit}`);
    } catch (error) {
      logger.error(`Failed to reset soft: ${error.message}`);
      throw error;
    }
  }

  async resetMixed(commit) {
    try {
      await git.resetIndex({
        fs: this.fs,
        dir: this.workingDir,
        ref: commit,
      });
      logger.debug(`Reset mixed to ${commit}`);
    } catch (error) {
      logger.error(`Failed to reset mixed: ${error.message}`);
      throw error;
    }
  }

  async resetHard(commit) {
    try {
      await git.checkout({
        fs: this.fs,
        dir: this.workingDir,
        ref: commit,
        force: true,
      });
      logger.debug(`Reset hard to ${commit}`);
    } catch (error) {
      logger.error(`Failed to reset hard: ${error.message}`);
      throw error;
    }
  }

  async getDiff(_options = {}) {
    // Diff operations limited in isomorphic-git
    throw new Error("Diff operations not fully supported by isomorphic-git");
  }

  async getFileDiff(_filepath, _options = {}) {
    throw new Error(
      "File diff operations not fully supported by isomorphic-git"
    );
  }

  async listTags() {
    try {
      const tags = await git.listTags({
        fs: this.fs,
        dir: this.workingDir,
      });
      return tags;
    } catch (error) {
      logger.error(`Failed to list tags: ${error.message}`);
      return [];
    }
  }

  async createTag(name, message, commit) {
    try {
      await git.tag({
        fs: this.fs,
        dir: this.workingDir,
        ref: name,
        object: commit || "HEAD",
        message,
      });
      logger.debug(`Created tag: ${name}`);
    } catch (error) {
      logger.error(`Failed to create tag ${name}: ${error.message}`);
      throw error;
    }
  }

  async deleteTag(name) {
    try {
      await git.deleteTag({
        fs: this.fs,
        dir: this.workingDir,
        ref: name,
      });
      logger.debug(`Deleted tag: ${name}`);
    } catch (error) {
      logger.error(`Failed to delete tag ${name}: ${error.message}`);
      throw error;
    }
  }

  async listRemotes() {
    return await this.getRemotes();
  }

  async fetch(remote = "origin", branch = null) {
    try {
      const result = await git.fetch({
        fs: this.fs,
        dir: this.workingDir,
        remote,
        ref: branch,
        http: getHttpConfig(),
      });
      logger.debug(`Fetched from ${remote}`);
      return result;
    } catch (error) {
      logger.error(`Failed to fetch from ${remote}: ${error.message}`);
      throw error;
    }
  }

  async pull(remote = "origin", branch = null) {
    try {
      await this.fetch(remote, branch);
      // Note: isomorphic-git requires explicit merge after fetch
      const currentBranch = await this.getCurrentBranch();
      const targetRef = branch || currentBranch;

      await git.merge({
        fs: this.fs,
        dir: this.workingDir,
        ours: currentBranch,
        theirs: `${remote}/${targetRef}`,
      });

      logger.debug(`Pulled from ${remote}/${targetRef}`);
    } catch (error) {
      logger.error(`Failed to pull from ${remote}: ${error.message}`);
      throw error;
    }
  }

  async push(remote = "origin", branch = null, options = {}) {
    try {
      const currentBranch = await this.getCurrentBranch();
      const targetRef = branch || currentBranch;

      const result = await git.push({
        fs: this.fs,
        dir: this.workingDir,
        remote,
        ref: targetRef,
        force: options.force || false,
        http: getHttpConfig(),
      });

      logger.debug(`Pushed to ${remote}/${targetRef}`);
      return result;
    } catch (error) {
      logger.error(`Failed to push to ${remote}: ${error.message}`);
      throw error;
    }
  }

  async merge(branch, _options = {}) {
    try {
      const currentBranch = await this.getCurrentBranch();

      const result = await git.merge({
        fs: this.fs,
        dir: this.workingDir,
        ours: currentBranch,
        theirs: branch,
      });

      logger.debug(`Merged ${branch} into ${currentBranch}`);
      return result;
    } catch (error) {
      logger.error(`Failed to merge ${branch}: ${error.message}`);
      throw error;
    }
  }

  async getAheadBehind(_local, _upstream) {
    // Not directly supported in isomorphic-git
    return { ahead: 0, behind: 0 };
  }
}

export default IsomorphicGitAdapter;
