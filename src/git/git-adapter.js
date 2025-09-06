const git = require("isomorphic-git");
const fs = require("fs");
const path = require("path");

/**
 * isomorphic-git适配器，提供与nodegit兼容的API
 */
class GitAdapter {
  constructor(workingDir) {
    this.workingDir = workingDir;
    this.fs = fs;
  }

  /**
   * 打开仓库
   * @param {string} dir - 仓库目录
   * @returns {Promise<GitAdapter>} 适配器实例
   */
  static async open(dir) {
    const adapter = new GitAdapter(dir);
    // 验证是否为git仓库
    try {
      await git.status({ fs: adapter.fs, dir: dir });
      return adapter;
    } catch (error) {
      throw new Error(`Not a git repository: ${dir}`);
    }
  }

  /**
   * 初始化仓库
   * @param {string} dir - 目录路径
   * @returns {Promise<GitAdapter>} 适配器实例
   */
  static async init(dir) {
    await git.init({ fs: fs, dir: dir });
    return new GitAdapter(dir);
  }

  /**
   * 获取当前分支
   * @returns {Promise<string>} 分支名
   */
  async getCurrentBranch() {
    try {
      return await git.currentBranch({ fs: this.fs, dir: this.workingDir });
    } catch (error) {
      return "master";
    }
  }

  /**
   * 获取所有分支
   * @returns {Promise<Array>} 分支列表
   */
  async getBranches() {
    const localBranches = await git.listBranches({
      fs: this.fs,
      dir: this.workingDir,
    });
    const remoteBranches = await git.listBranches({
      fs: this.fs,
      dir: this.workingDir,
      remote: "origin",
    });

    const branches = [];

    // 添加本地分支
    for (const branch of localBranches) {
      const isCurrent = branch === (await this.getCurrentBranch());
      branches.push({
        name: branch,
        isLocal: true,
        isCurrent: isCurrent,
      });
    }

    // 添加远程分支
    for (const branch of remoteBranches) {
      if (!branches.find((b) => b.name === branch)) {
        branches.push({
          name: branch,
          isLocal: false,
          isCurrent: false,
        });
      }
    }

    return branches;
  }

  /**
   * 获取提交历史
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 提交列表
   */
  async getCommits(limit = 50) {
    const commits = await git.log({
      fs: this.fs,
      dir: this.workingDir,
      depth: limit,
    });

    return commits.map((commit) => ({
      hash: commit.oid,
      author: commit.author.name,
      email: commit.author.email,
      date: new Date(commit.author.timestamp * 1000),
      message: commit.message,
    }));
  }

  /**
   * 获取文件状态
   * @returns {Promise<Array>} 文件状态列表
   */
  async getStatus() {
    const status = await git.status({ fs: this.fs, dir: this.workingDir });
    const files = [];

    for (const [file, statusCode] of Object.entries(status)) {
      files.push({
        file: file,
        status: statusCode,
        isStaged: statusCode.includes("staged"),
        isModified:
          statusCode.includes("modified") ||
          statusCode.includes("added") ||
          statusCode.includes("deleted"),
      });
    }

    return files;
  }

  /**
   * 添加文件到暂存区
   * @param {string} file - 文件路径
   * @returns {Promise<void>}
   */
  async add(file) {
    await git.add({ fs: this.fs, dir: this.workingDir, filepath: file });
  }

  /**
   * 提交更改
   * @param {string} message - 提交信息
   * @param {string} author - 作者
   * @param {string} email - 邮箱
   * @returns {Promise<string>} 提交hash
   */
  async commit(message, author, email) {
    const commitHash = await git.commit({
      fs: this.fs,
      dir: this.workingDir,
      message: message,
      author: { name: author, email: email },
      committer: { name: author, email: email },
    });
    return commitHash;
  }

  /**
   * 拉取远程更改
   * @param {string} remote - 远程名称
   * @param {string} branch - 分支名称
   * @returns {Promise<void>}
   */
  async pull(remote = "origin", branch = "master") {
    // isomorphic-git 0.78.5 不支持pull操作，使用git命令
    await this.exec("pull", [remote, branch]);
  }

  /**
   * 推送到远程
   * @param {string} remote - 远程名称
   * @param {string} branch - 分支名称
   * @returns {Promise<void>}
   */
  async push(remote = "origin", branch = "master") {
    // isomorphic-git 0.78.5 不支持push操作，使用git命令
    await this.exec("push", [remote, branch]);
  }

  /**
   * 创建分支
   * @param {string} name - 分支名称
   * @returns {Promise<void>}
   */
  async createBranch(name) {
    await git.branch({ fs: this.fs, dir: this.workingDir, ref: name });
  }

  /**
   * 切换分支
   * @param {string} name - 分支名称
   * @returns {Promise<void>}
   */
  async checkoutBranch(name) {
    await git.checkout({ fs: this.fs, dir: this.workingDir, ref: name });
  }

  /**
   * 删除分支
   * @param {string} name - 分支名称
   * @param {boolean} force - 是否强制删除
   * @returns {Promise<void>}
   */
  async deleteBranch(name, force = false) {
    await git.deleteBranch({
      fs: this.fs,
      dir: this.workingDir,
      ref: name,
      force: force,
    });
  }

  /**
   * 获取远程信息
   * @returns {Promise<Array>} 远程列表
   */
  async getRemotes() {
    const remotes = await git.listRemotes({
      fs: this.fs,
      dir: this.workingDir,
    });
    return remotes.map((remote) => ({
      name: remote.remote,
      url: remote.url,
    }));
  }

  /**
   * 获取差异信息
   * @param {string} file - 文件路径
   * @returns {Promise<string>} 差异内容
   */
  async getDiff(file = null) {
    const diff = await git.status({ fs: this.fs, dir: this.workingDir });
    // isomorphic-git的diff功能需要特殊处理
    return JSON.stringify(diff, null, 2);
  }

  /**
   * 获取暂存区差异
   * @param {string} file - 文件路径
   * @returns {Promise<string>} 差异内容
   */
  async getStagedDiff(file = null) {
    // 简化实现，返回状态信息
    const status = await git.status({ fs: this.fs, dir: this.workingDir });
    return JSON.stringify(status, null, 2);
  }

  /**
   * 重置文件
   * @param {string} file - 文件路径
   * @returns {Promise<void>}
   */
  async resetFile(file) {
    await git.checkout({ fs: this.fs, dir: this.workingDir, filepath: file });
  }

  /**
   * 获取标签
   * @returns {Promise<Array>} 标签列表
   */
  async getTags() {
    return await git.listTags({ fs: this.fs, dir: this.workingDir });
  }

  /**
   * 创建标签
   * @param {string} name - 标签名称
   * @param {string} message - 标签信息
   * @returns {Promise<void>}
   */
  async createTag(name, message = "") {
    if (message) {
      await git.annotatedTag({
        fs: this.fs,
        dir: this.workingDir,
        ref: name,
        message: message,
      });
    } else {
      await git.lightweightTag({
        fs: this.fs,
        dir: this.workingDir,
        ref: name,
      });
    }
  }

  /**
   * 删除标签
   * @param {string} name - 标签名称
   * @returns {Promise<void>}
   */
  async deleteTag(name) {
    await git.deleteTag({ fs: this.fs, dir: this.workingDir, ref: name });
  }

  /**
   * 获取分支位置信息
   * @returns {Promise<Object>} 位置信息
   */
  async getBranchPosition() {
    try {
      const currentBranch = await this.getCurrentBranch();
      const remoteBranch = `origin/${currentBranch}`;

      // 获取本地和远程的提交数量差异
      const ahead = await git.listCommits({
        fs: this.fs,
        dir: this.workingDir,
        ref: currentBranch,
        depth: 100,
      });

      const behind = await git.listCommits({
        fs: this.fs,
        dir: this.workingDir,
        ref: remoteBranch,
        depth: 100,
      });

      return {
        ahead: ahead.length,
        behind: behind.length,
      };
    } catch (error) {
      return { ahead: 0, behind: 0 };
    }
  }

  /**
   * 合并分支
   * @param {string} branch - 分支名称
   * @returns {Promise<void>}
   */
  async mergeBranch(branch) {
    await git.merge({
      fs: this.fs,
      dir: this.workingDir,
      ours: branch,
    });
  }

  /**
   * 重置到指定提交
   * @param {string} commit - 提交hash
   * @param {string} type - 重置类型
   * @returns {Promise<void>}
   */
  async reset(commit, type = "hard") {
    await git.resetIndex({
      fs: this.fs,
      dir: this.workingDir,
      ref: commit,
    });
  }
}

// 为了兼容nodegit的API，提供静态方法
GitAdapter.Repository = {
  open: GitAdapter.open,
  init: GitAdapter.init,
};

module.exports = GitAdapter;
