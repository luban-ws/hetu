/**
 * Tests for Git Operations - Pure Functions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { gitOperations } from "../git-operations.js";

// Mock the git adapter factory
vi.mock("../../git-adapter-factory.js", () => ({
  createGitAdapter: vi.fn(),
}));

describe("Git Operations", () => {
  let mockAdapter;

  beforeEach(() => {
    mockAdapter = {
      open: vi.fn(),
      init: vi.fn(),
      close: vi.fn(),
      getStatus: vi.fn(),
      getCurrentBranch: vi.fn(),
      listBranches: vi.fn(),
      createBranch: vi.fn(),
      deleteBranch: vi.fn(),
      switchBranch: vi.fn(),
      createCommit: vi.fn(),
      getCommits: vi.fn(),
      stageFile: vi.fn(),
      unstageFile: vi.fn(),
      stageAll: vi.fn(),
      unstageAll: vi.fn(),
      fetch: vi.fn(),
      pull: vi.fn(),
      push: vi.fn(),
      getRemotes: vi.fn(),
      merge: vi.fn(),
      reset: vi.fn(),
      stashSave: vi.fn(),
      stashPop: vi.fn(),
      stashApply: vi.fn(),
      stashDrop: vi.fn(),
      stashList: vi.fn(),
      createTag: vi.fn(),
      deleteTag: vi.fn(),
      getDiff: vi.fn(),
    };
  });

  describe("Repository Operations", () => {
    it("should open repository", async () => {
      const workingDir = "/test/repo";
      const { createGitAdapter } = await import("../../git-adapter-factory.js");
      createGitAdapter.mockResolvedValue(mockAdapter);
      mockAdapter.open.mockResolvedValue({ workingDir });

      const result = await gitOperations.openRepository(workingDir);

      expect(createGitAdapter).toHaveBeenCalledWith(workingDir);
      expect(mockAdapter.open).toHaveBeenCalledWith(workingDir);
      expect(result).toEqual({ adapter: mockAdapter, workingDir });
    });

    it("should initialize repository", async () => {
      const repoPath = "/test/repo";
      const { createGitAdapter } = await import("../../git-adapter-factory.js");
      createGitAdapter.mockResolvedValue(mockAdapter);
      mockAdapter.init.mockResolvedValue({ path: repoPath });

      const result = await gitOperations.initRepository(repoPath);

      expect(createGitAdapter).toHaveBeenCalledWith(repoPath);
      expect(mockAdapter.init).toHaveBeenCalledWith(repoPath);
      expect(result).toEqual({ path: repoPath });
    });

    it("should close repository", async () => {
      await gitOperations.closeRepository(mockAdapter);

      expect(mockAdapter.close).toHaveBeenCalled();
    });
  });

  describe("Status Operations", () => {
    it("should get repository status", async () => {
      const mockStatus = { files: [] };
      const mockBranch = "main";
      const mockBranches = ["main", "develop"];

      mockAdapter.getStatus.mockResolvedValue(mockStatus);
      mockAdapter.getCurrentBranch.mockResolvedValue(mockBranch);
      mockAdapter.listBranches.mockResolvedValue(mockBranches);

      const result = await gitOperations.getRepositoryStatus(mockAdapter);

      expect(result).toEqual({
        status: mockStatus,
        currentBranch: mockBranch,
        branches: mockBranches,
      });
    });
  });

  describe("Branch Operations", () => {
    it("should create branch", async () => {
      const branchName = "feature/test";
      const startPoint = "HEAD";
      mockAdapter.createBranch.mockResolvedValue({ name: branchName });

      const result = await gitOperations.createBranch(
        mockAdapter,
        branchName,
        startPoint
      );

      expect(mockAdapter.createBranch).toHaveBeenCalledWith(
        branchName,
        startPoint
      );
      expect(result).toEqual({ name: branchName });
    });

    it("should delete branch", async () => {
      const branchName = "feature/test";
      const force = true;
      mockAdapter.deleteBranch.mockResolvedValue(true);

      const result = await gitOperations.deleteBranch(
        mockAdapter,
        branchName,
        force
      );

      expect(mockAdapter.deleteBranch).toHaveBeenCalledWith(branchName, force);
      expect(result).toBe(true);
    });

    it("should switch branch", async () => {
      const branchName = "feature/test";
      mockAdapter.switchBranch.mockResolvedValue({ name: branchName });

      const result = await gitOperations.switchBranch(mockAdapter, branchName);

      expect(mockAdapter.switchBranch).toHaveBeenCalledWith(branchName);
      expect(result).toEqual({ name: branchName });
    });
  });

  describe("Commit Operations", () => {
    it("should create commit", async () => {
      const message = "Test commit";
      const options = { author: "Test User" };
      mockAdapter.createCommit.mockResolvedValue({ hash: "abc123" });

      const result = await gitOperations.createCommit(
        mockAdapter,
        message,
        options
      );

      expect(mockAdapter.createCommit).toHaveBeenCalledWith(message, options);
      expect(result).toEqual({ hash: "abc123" });
    });

    it("should get commits", async () => {
      const limit = 10;
      const ref = "HEAD";
      const mockCommits = [{ hash: "abc123" }, { hash: "def456" }];
      mockAdapter.getCommits.mockResolvedValue(mockCommits);

      const result = await gitOperations.getCommits(mockAdapter, limit, ref);

      expect(mockAdapter.getCommits).toHaveBeenCalledWith(limit, ref);
      expect(result).toEqual(mockCommits);
    });
  });

  describe("Staging Operations", () => {
    it("should stage file", async () => {
      const filepath = "test.js";
      mockAdapter.stageFile.mockResolvedValue(true);

      const result = await gitOperations.stageFile(mockAdapter, filepath);

      expect(mockAdapter.stageFile).toHaveBeenCalledWith(filepath);
      expect(result).toBe(true);
    });

    it("should unstage file", async () => {
      const filepath = "test.js";
      mockAdapter.unstageFile.mockResolvedValue(true);

      const result = await gitOperations.unstageFile(mockAdapter, filepath);

      expect(mockAdapter.unstageFile).toHaveBeenCalledWith(filepath);
      expect(result).toBe(true);
    });

    it("should stage all files", async () => {
      mockAdapter.stageAll.mockResolvedValue(true);

      const result = await gitOperations.stageAll(mockAdapter);

      expect(mockAdapter.stageAll).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should unstage all files", async () => {
      mockAdapter.unstageAll.mockResolvedValue(true);

      const result = await gitOperations.unstageAll(mockAdapter);

      expect(mockAdapter.unstageAll).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("Remote Operations", () => {
    it("should fetch from remote", async () => {
      const remote = "origin";
      mockAdapter.fetch.mockResolvedValue({ fetched: true });

      const result = await gitOperations.fetch(mockAdapter, remote);

      expect(mockAdapter.fetch).toHaveBeenCalledWith(remote);
      expect(result).toEqual({ fetched: true });
    });

    it("should pull from remote", async () => {
      const remote = "origin";
      const branch = "main";
      mockAdapter.pull.mockResolvedValue({ pulled: true });

      const result = await gitOperations.pull(mockAdapter, remote, branch);

      expect(mockAdapter.pull).toHaveBeenCalledWith(remote, branch);
      expect(result).toEqual({ pulled: true });
    });

    it("should push to remote", async () => {
      const remote = "origin";
      const branch = "main";
      mockAdapter.push.mockResolvedValue({ pushed: true });

      const result = await gitOperations.push(mockAdapter, remote, branch);

      expect(mockAdapter.push).toHaveBeenCalledWith(remote, branch);
      expect(result).toEqual({ pushed: true });
    });

    it("should get remotes", async () => {
      const mockRemotes = [
        { name: "origin", url: "git@github.com:test/repo.git" },
      ];
      mockAdapter.getRemotes.mockResolvedValue(mockRemotes);

      const result = await gitOperations.getRemotes(mockAdapter);

      expect(mockAdapter.getRemotes).toHaveBeenCalled();
      expect(result).toEqual(mockRemotes);
    });
  });

  describe("Stash Operations", () => {
    it("should save stash", async () => {
      const message = "WIP: test changes";
      const options = { includeUntracked: true };
      mockAdapter.stashSave.mockResolvedValue({ id: "stash@{0}" });

      const result = await gitOperations.stashSave(
        mockAdapter,
        message,
        options
      );

      expect(mockAdapter.stashSave).toHaveBeenCalledWith(message, options);
      expect(result).toEqual({ id: "stash@{0}" });
    });

    it("should pop stash", async () => {
      const index = 0;
      mockAdapter.stashPop.mockResolvedValue({ applied: true });

      const result = await gitOperations.stashPop(mockAdapter, index);

      expect(mockAdapter.stashPop).toHaveBeenCalledWith(index);
      expect(result).toEqual({ applied: true });
    });

    it("should list stashes", async () => {
      const mockStashes = [{ id: "stash@{0}", message: "WIP: test" }];
      mockAdapter.stashList.mockResolvedValue(mockStashes);

      const result = await gitOperations.stashList(mockAdapter);

      expect(mockAdapter.stashList).toHaveBeenCalled();
      expect(result).toEqual(mockStashes);
    });
  });
});
