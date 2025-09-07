/**
 * WASM-Git Adapter Implementation
 * Uses libgit2 compiled to WebAssembly for complete Git functionality
 */

import path from "path";
import fs from "fs";
import wasmGitModule from "wasm-git/lg2_async.js";
import { BaseGitAdapter } from "./base-git-adapter.js";

export class WasmGitAdapter extends BaseGitAdapter {
  constructor(workingDir) {
    super(workingDir);
    this.wasmGit = null;
    this.mountedPaths = new Map();
  }

  async _initWasmGit() {
    if (!this.wasmGit) {
      try {
        this.wasmGit = await wasmGitModule.default();

        // Setup base filesystem
        try {
          this.wasmGit.FS.mkdir("/repos");
        } catch (error) {
          // Directory might exist
        }
      } catch (error) {
        throw new Error(`Failed to initialize wasm-git: ${error.message}`);
      }
    }
    return this.wasmGit;
  }

  async _mountRepository(targetDir = null) {
    const dir = targetDir || this.workingDir;
    const lg = await this._initWasmGit();

    // Create unique mount point for this repository
    const repoId = Buffer.from(dir)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "");
    const mountPoint = `/repos/${repoId}`;

    // Only mount if not already mounted
    if (!this.mountedPaths.has(dir)) {
      try {
        lg.FS.mkdir(mountPoint);
        lg.FS.mount(lg.NODEFS, { root: dir }, mountPoint);
        this.mountedPaths.set(dir, mountPoint);
      } catch (error) {
        // Try to use the directory if already exists
        if (!this.mountedPaths.has(dir)) {
          throw new Error(`Failed to mount repository: ${error.message}`);
        }
      }
    }

    const wasmPath = this.mountedPaths.get(dir);
    lg.FS.chdir(wasmPath);
    return wasmPath;
  }

  // Validate if directory exists and is a git repository
  _validateGitRepository(targetDir) {
    // Check if directory exists
    if (!fs.existsSync(targetDir)) {
      throw new Error(`Directory does not exist: ${targetDir}`);
    }

    // Check if it's a directory
    const stats = fs.statSync(targetDir);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${targetDir}`);
    }

    // Check if .git directory exists
    const gitDir = path.join(targetDir, '.git');
    if (!fs.existsSync(gitDir)) {
      throw new Error(`Not a git repository: ${targetDir}`);
    }

    return true;
  }

  async _executeGitCommand(command, args = [], targetDir = null) {
    try {
      await this._mountRepository(targetDir);
      const lg = await this._initWasmGit();

      const fullArgs = [command, ...args];
      const result = lg.callWithOutput(fullArgs);
      return { stdout: result.trim(), stderr: "" };
    } catch (error) {
      // Extract meaningful error message
      let message = error.toString();
      if (typeof error === "number") {
        message = `Git command failed with exit code: ${error}`;
      }
      throw new Error(`Git ${command} failed: ${message}`);
    }
  }

  // Repository operations
  async open(dir = null) {
    const targetDir = dir || this.workingDir;
    
    // Pre-validate the repository before attempting Git operations
    this._validateGitRepository(targetDir);
    
    try {
      await this._executeGitCommand("status", [], targetDir);
      return { workingDir: targetDir };
    } catch (error) {
      // If validation passed but Git command failed, provide more specific error
      throw new Error(`Failed to open git repository: ${error.message}`);
    }
  }

  async init(dir = null) {
    const targetDir = dir || this.workingDir;
    await this._executeGitCommand("init", ["."], targetDir);
    return { workingDir: targetDir };
  }

  async close() {
    // Cleanup mounted paths
    if (this.wasmGit) {
      for (const [dir, mountPoint] of this.mountedPaths) {
        try {
          this.wasmGit.FS.unmount(mountPoint);
        } catch (error) {
          // Ignore unmount errors
        }
      }
      this.mountedPaths.clear();
    }
  }

  // Status operations
  async getStatus() {
    const { stdout } = await this._executeGitCommand("status", ["--porcelain"]);
    const files = [];

    for (const line of stdout.split("\n").filter(Boolean)) {
      const statusCode = line.slice(0, 2);
      const filepath = line.slice(3);

      const file = {
        path: () => filepath,
        isNew: () => statusCode.includes("A") || statusCode.includes("??"),
        isModified: () => statusCode.includes("M"),
        isDeleted: () => statusCode.includes("D"),
        isRenamed: () => statusCode.includes("R"),
        isIgnored: () => statusCode.includes("!!"),
        inIndex: () => statusCode[0] !== " " && statusCode[0] !== "?",
        inWorkingTree: () => statusCode[1] !== " ",
      };

      files.push(file);
    }

    return files;
  }

  // Branch operations
  async getCurrentBranch() {
    try {
      const { stdout } = await this._executeGitCommand("branch", [
        "--show-current",
      ]);
      return stdout || "HEAD";
    } catch (error) {
      return "HEAD";
    }
  }

  async listBranches() {
    const branches = [];

    try {
      // Local branches
      const { stdout: localOutput } = await this._executeGitCommand(
        "branch",
        []
      );
      for (const line of localOutput.split("\n").filter(Boolean)) {
        const isCurrent = line.startsWith("*");
        const name = line.replace(/^\*?\s*/, "");
        branches.push({
          name,
          isLocal: true,
          isCurrent,
          isRemote: false,
        });
      }
    } catch (error) {
      // No local branches yet
    }

    try {
      // Remote branches
      const { stdout: remoteOutput } = await this._executeGitCommand("branch", [
        "-r",
      ]);
      for (const line of remoteOutput.split("\n").filter(Boolean)) {
        const name = line.trim();
        if (!name.includes("HEAD ->")) {
          branches.push({
            name,
            isLocal: false,
            isCurrent: false,
            isRemote: true,
          });
        }
      }
    } catch (error) {
      // No remote branches
    }

    return branches;
  }

  async createBranch(name, startPoint = "HEAD") {
    await this._executeGitCommand("checkout", ["-b", name, startPoint]);
  }

  async deleteBranch(name, force = false) {
    const flag = force ? "-D" : "-d";
    await this._executeGitCommand("branch", [flag, name]);
  }

  async switchBranch(name) {
    await this._executeGitCommand("checkout", [name]);
  }

  async getBranchUpstream(branchName) {
    try {
      const { stdout: remote } = await this._executeGitCommand("config", [
        `branch.${branchName}.remote`,
      ]);
      const { stdout: merge } = await this._executeGitCommand("config", [
        `branch.${branchName}.merge`,
      ]);
      const branch = merge.replace("refs/heads/", "");
      return `${remote}/${branch}`;
    } catch (error) {
      throw new Error(`No upstream branch for ${branchName}`);
    }
  }

  async setBranchUpstream(localBranch, remoteBranch) {
    const [remote, branch] = remoteBranch.split("/");
    await this._executeGitCommand("config", [
      `branch.${localBranch}.remote`,
      remote,
    ]);
    await this._executeGitCommand("config", [
      `branch.${localBranch}.merge`,
      `refs/heads/${branch}`,
    ]);
  }

  // Commit operations
  async getCommits(limit = 50, ref = "HEAD") {
    try {
      const { stdout } = await this._executeGitCommand("log", [
        "--format=%H|%an|%ae|%at|%s|%P",
        `--max-count=${limit}`,
        ref,
      ]);

      return stdout
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [oid, authorName, authorEmail, timestamp, message, parents] =
            line.split("|");
          return {
            oid,
            sha: oid,
            commit: {
              author: {
                name: authorName,
                email: authorEmail,
                timestamp: parseInt(timestamp),
              },
              message,
              parent: parents ? parents.split(" ") : [],
            },
          };
        });
    } catch (error) {
      return [];
    }
  }

  async createCommit(message, options = {}) {
    const { author, committer } = options;

    // Set author/committer if provided
    if (author) {
      await this._executeGitCommand("config", ["user.name", author.name]);
      await this._executeGitCommand("config", ["user.email", author.email]);
    }

    const { stdout } = await this._executeGitCommand("commit", ["-m", message]);
    return stdout;
  }

  // Staging operations
  async stageFile(filepath) {
    await this._executeGitCommand("add", [filepath]);
  }

  async unstageFile(filepath) {
    await this._executeGitCommand("reset", ["HEAD", filepath]);
  }

  async stageAll() {
    await this._executeGitCommand("add", ["."]);
  }

  // Stash operations
  async stashSave(message = "", options = {}) {
    const args = ["push"];
    if (options.includeUntracked) args.push("--include-untracked");
    if (message) args.push("--message", message);

    await this._executeGitCommand("stash", args);
    return 0;
  }

  async stashPop(index = 0) {
    await this._executeGitCommand("stash", ["pop", `stash@{${index}}`]);
  }

  async stashApply(index = 0) {
    await this._executeGitCommand("stash", ["apply", `stash@{${index}}`]);
  }

  async stashDrop(index = 0) {
    await this._executeGitCommand("stash", ["drop", `stash@{${index}}`]);
  }

  async stashList() {
    try {
      const { stdout } = await this._executeGitCommand("stash", ["list"]);
      return stdout
        .split("\n")
        .filter(Boolean)
        .map((line, index) => {
          const match = line.match(/stash@\\{(\\d+)\\}: (.+)/);
          return {
            index,
            message: match ? match[2] : line,
            oid: `stash@{${index}}`,
          };
        });
    } catch (error) {
      return [];
    }
  }

  // Reset operations
  async resetSoft(commit) {
    await this._executeGitCommand("reset", ["--soft", commit]);
  }

  async resetMixed(commit) {
    await this._executeGitCommand("reset", ["--mixed", commit]);
  }

  async resetHard(commit) {
    await this._executeGitCommand("reset", ["--hard", commit]);
  }

  // Configuration
  async getConfig(key) {
    try {
      const { stdout } = await this._executeGitCommand("config", [key]);
      return stdout;
    } catch (error) {
      return null;
    }
  }

  async setConfig(key, value) {
    await this._executeGitCommand("config", [key, value]);
  }

  // Graph operations
  async getAheadBehind(local, upstream) {
    try {
      const { stdout: ahead } = await this._executeGitCommand("rev-list", [
        "--count",
        `${upstream}..${local}`,
      ]);
      const { stdout: behind } = await this._executeGitCommand("rev-list", [
        "--count",
        `${local}..${upstream}`,
      ]);

      return {
        ahead: parseInt(ahead) || 0,
        behind: parseInt(behind) || 0,
      };
    } catch (error) {
      return { ahead: 0, behind: 0 };
    }
  }

  // Tag operations
  async listTags() {
    try {
      const { stdout } = await this._executeGitCommand("tag", []);
      return stdout.split("\n").filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  async createTag(name, message = "", commit = "HEAD") {
    const args = ["tag"];
    if (message) {
      args.push("-a", name, "-m", message, commit);
    } else {
      args.push(name, commit);
    }
    await this._executeGitCommand("tag", args.slice(1));
  }

  async deleteTag(name) {
    await this._executeGitCommand("tag", ["-d", name]);
  }
}

export default WasmGitAdapter;
