/**
 * Native Git Adapter Implementation
 * Uses system git binary via child_process for full compatibility
 */

import { exec } from "child_process";
import { promisify } from "util";
import { BaseGitAdapter } from "./base-git-adapter.js";
import { getLogger } from "@common/logger";

const execAsync = promisify(exec);
const logger = getLogger("native-git");

export class NativeGitAdapter extends BaseGitAdapter {
  constructor(workingDir) {
    super(workingDir);
  }

  async _executeGitCommand(command, args = [], options = {}) {
    const gitArgs = [command, ...args];
    const cmdString = `git ${gitArgs.join(' ')}`;
    
    logger.debug(`Executing: ${cmdString} in ${this.workingDir}`);
    
    try {
      const { stdout, stderr } = await execAsync(cmdString, {
        cwd: this.workingDir,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        ...options
      });
      
      logger.debug(`Command result: ${stdout?.substring(0, 200)}`);
      return { stdout: stdout || '', stderr: stderr || '' };
    } catch (error) {
      logger.error(`Git ${command} failed: ${error.message}`);
      throw new Error(`Git ${command} failed: ${error.message}`);
    }
  }

  // Repository operations
  async open(dir = null) {
    const targetDir = dir || this.workingDir;
    
    try {
      // Test if it's a valid git repository
      await this._executeGitCommand('status', ['--porcelain'], { cwd: targetDir });
      return { workingDir: targetDir };
    } catch (error) {
      throw new Error(`Failed to open git repository: ${error.message}`);
    }
  }

  async init(dir = null) {
    const targetDir = dir || this.workingDir;
    await this._executeGitCommand('init', [], { cwd: targetDir });
    return { workingDir: targetDir };
  }

  async close() {
    // Native git doesn't need cleanup
  }

  // Status operations
  async getStatus() {
    const { stdout } = await this._executeGitCommand('status', ['--porcelain']);
    const files = [];

    for (const line of stdout.split('\n').filter(Boolean)) {
      const statusCode = line.slice(0, 2);
      const filepath = line.slice(3);

      const file = {
        path: () => filepath,
        isNew: () => statusCode.includes('A') || statusCode.includes('??'),
        isModified: () => statusCode.includes('M'),
        isDeleted: () => statusCode.includes('D'),
        isRenamed: () => statusCode.includes('R'),
        isIgnored: () => statusCode.includes('!!'),
        inIndex: () => statusCode[0] !== ' ' && statusCode[0] !== '?',
        inWorkingTree: () => statusCode[1] !== ' ',
      };

      files.push(file);
    }

    return files;
  }

  // Branch operations
  async getCurrentBranch() {
    try {
      const { stdout } = await this._executeGitCommand('branch', ['--show-current']);
      return stdout.trim() || 'HEAD';
    } catch (error) {
      return 'HEAD';
    }
  }

  async listBranches() {
    const branches = [];

    try {
      // Local branches
      const { stdout: localOutput } = await this._executeGitCommand('branch');
      for (const line of localOutput.split('\n').filter(Boolean)) {
        const isCurrent = line.startsWith('*');
        const name = line.replace(/^\*?\s*/, '');
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
      const { stdout: remoteOutput } = await this._executeGitCommand('branch', ['-r']);
      for (const line of remoteOutput.split('\n').filter(Boolean)) {
        const name = line.trim();
        if (!name.includes('HEAD ->')) {
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

  // Commit operations
  async getCommits(limit = 50, ref = 'HEAD') {
    try {
      const { stdout } = await this._executeGitCommand('log', [
        '--format=%H|%an|%ae|%at|%s|%P',
        `--max-count=${limit}`,
        ref
      ]);

      return stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [oid, authorName, authorEmail, timestamp, message, parents] = line.split('|');
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
              parent: parents ? parents.split(' ') : [],
            },
          };
        });
    } catch (error) {
      return [];
    }
  }

  // Remote operations
  async getRemotes() {
    try {
      const { stdout } = await this._executeGitCommand('remote', ['-v']);
      const remotes = [];
      const lines = stdout.split('\n').filter(Boolean);
      
      for (const line of lines) {
        const match = line.match(/^(\S+)\s+(.+?)\s+\((\w+)\)$/);
        if (match) {
          const [, name, url] = match;
          // Only add unique remotes (avoid duplicates from fetch/push)
          if (!remotes.find(r => r.name === name)) {
            remotes.push({
              name,
              url: () => url,
              pushurl: () => url,
            });
          }
        }
      }
      
      return remotes;
    } catch (error) {
      return [];
    }
  }

  // Staging operations
  async stageFile(filepath) {
    await this._executeGitCommand('add', [filepath]);
  }

  async unstageFile(filepath) {
    await this._executeGitCommand('reset', ['HEAD', filepath]);
  }

  async stageAll() {
    await this._executeGitCommand('add', ['.']);
  }

  // Additional methods can be implemented as needed...
}

export default NativeGitAdapter;