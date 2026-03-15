/**
 * Tests for Repository Operations
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { repoOperations } from "../repo-operations.js";
import { repoState } from "../../state/repo-state.js";
import { gitOperations } from "../git-operations.js";

// Mock dependencies
vi.mock("../git-operations.js", () => ({
  gitOperations: {
    openRepository: vi.fn(),
    initRepository: vi.fn(),
    closeRepository: vi.fn(),
    getRepositoryStatus: vi.fn(),
    fetch: vi.fn(),
    pull: vi.fn(),
    push: vi.fn(),
    createCommit: vi.fn(),
    stageFile: vi.fn(),
    unstageFile: vi.fn(),
    stageAll: vi.fn(),
    unstageAll: vi.fn(),
    createBranch: vi.fn(),
    deleteBranch: vi.fn(),
    switchBranch: vi.fn(),
    merge: vi.fn(),
    reset: vi.fn(),
    stashSave: vi.fn(),
    stashPop: vi.fn(),
    stashApply: vi.fn(),
    stashDrop: vi.fn(),
    stashList: vi.fn(),
    createTag: vi.fn(),
    deleteTag: vi.fn(),
    getCommits: vi.fn(),
    getRemotes: vi.fn(),
    getDiff: vi.fn(),
  },
}));

vi.mock("../../state/repo-state.js", () => ({
  repoState: {
    setRepo: vi.fn(),
    getRepo: vi.fn(),
    getWindow: vi.fn(),
    getSettings: vi.fn(),
    getRepoHistory: vi.fn(),
    clearRefreshInterval: vi.fn(),
    setRefreshInterval: vi.fn(),
    clearRepo: vi.fn(),
    hasRepo: vi.fn(),
  },
  repoUtils: {
    getRepoName: vi.fn(),
    withErrorHandling: vi.fn((fn) => fn), // Pass through for testing
    requireRepo: vi.fn((fn) => fn), // Pass through for testing
  },
}));

describe("Repository Operations", () => {
  let mockRepo, mockWindow, mockSettings, mockHistory;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = { adapter: {}, workingDir: "/test/repo" };
    mockWindow = { webContents: { send: vi.fn() } };
    mockSettings = { setRepo: vi.fn() };
    mockHistory = { updateRepos: vi.fn() };

    repoState.getRepo.mockReturnValue(mockRepo);
    repoState.getWindow.mockReturnValue(mockWindow);
    repoState.getSettings.mockReturnValue(mockSettings);
    repoState.getRepoHistory.mockReturnValue(mockHistory);
    repoState.hasRepo.mockReturnValue(true);
  });

  describe("openRepo", () => {
    it("should open repository successfully", async () => {
      const workingDir = "/test/repo";
      const mockRepoData = { adapter: {}, workingDir };

      gitOperations.openRepository.mockResolvedValue(mockRepoData);
      gitOperations.getRepositoryStatus.mockResolvedValue({
        status: { files: [] },
        currentBranch: "main",
        branches: ["main"],
      });
      gitOperations.getRemotes.mockResolvedValue([
        { name: "origin", url: "git@github.com:test/repo.git" },
      ]);

      const result = await repoOperations.openRepo(workingDir);

      expect(gitOperations.openRepository).toHaveBeenCalledWith(workingDir);
      expect(repoState.setRepo).toHaveBeenCalledWith(mockRepoData);
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "Repo-OpenSuccessful",
        { repoName: undefined, workingDir }
      );
      expect(mockSettings.setRepo).toHaveBeenCalledWith(workingDir, undefined);
      expect(mockHistory.updateRepos).toHaveBeenCalled();
    });

    it("should handle remotes info", async () => {
      const workingDir = "/test/repo";
      const mockRepoData = { adapter: {}, workingDir };

      gitOperations.openRepository.mockResolvedValue(mockRepoData);
      gitOperations.getRepositoryStatus.mockResolvedValue({
        status: { files: [] },
        currentBranch: "main",
        branches: ["main"],
      });
      gitOperations.getRemotes.mockResolvedValue([
        { name: "origin", url: "git@github.com:test/repo.git" },
      ]);

      await repoOperations.openRepo(workingDir);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "Repo-RemotesChanged",
        { remote: "git@github.com:test/repo.git" }
      );
    });
  });

  describe("initRepo", () => {
    it("should initialize repository", async () => {
      const repoPath = "/test/repo";
      const mockResult = { path: repoPath };

      gitOperations.initRepository.mockResolvedValue(mockResult);

      const result = await repoOperations.initRepo(repoPath);

      expect(gitOperations.initRepository).toHaveBeenCalledWith(repoPath);
      expect(result).toEqual(mockResult);
    });
  });

  describe("closeRepo", () => {
    it("should close repository", async () => {
      await repoOperations.closeRepo();

      expect(gitOperations.closeRepository).toHaveBeenCalledWith(
        mockRepo.adapter
      );
      expect(repoState.clearRefreshInterval).toHaveBeenCalled();
      expect(repoState.setRepo).toHaveBeenCalledWith(null);
    });
  });

  describe("refreshRepo", () => {
    it("should refresh repository status", async () => {
      const mockStatus = {
        status: { files: [] },
        currentBranch: "main",
        branches: ["main"],
      };

      gitOperations.getRepositoryStatus.mockResolvedValue(mockStatus);

      const result = await repoOperations.refreshRepo();

      expect(gitOperations.getRepositoryStatus).toHaveBeenCalledWith(
        mockRepo.adapter
      );
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "Repo-StatusUpdated",
        { ...mockStatus, workingDir: mockRepo.workingDir }
      );
      expect(result).toEqual({
        ...mockStatus,
        workingDir: mockRepo.workingDir,
      });
    });

    it("should return null when no repo is open", async () => {
      repoState.getRepo.mockReturnValue(null);

      const result = await repoOperations.refreshRepo();

      expect(result).toBeNull();
    });
  });

  describe("Git Operations", () => {
    beforeEach(() => {
      // Mock the wrapped operations to pass through to gitOperations
      repoState.hasRepo.mockReturnValue(true);
    });

    it("should fetch from remote", async () => {
      const remote = "origin";
      const mockResult = { fetched: true };

      gitOperations.fetch.mockResolvedValue(mockResult);

      const result = await repoOperations.fetchRepo(remote);

      expect(gitOperations.fetch).toHaveBeenCalledWith(
        mockRepo.adapter,
        remote
      );
      expect(result).toEqual(mockResult);
    });

    it("should pull from remote", async () => {
      const remote = "origin";
      const branch = "main";
      const mockResult = { pulled: true };

      gitOperations.pull.mockResolvedValue(mockResult);

      const result = await repoOperations.pullWrapper(remote, branch);

      expect(gitOperations.pull).toHaveBeenCalledWith(
        mockRepo.adapter,
        remote,
        branch
      );
      expect(result).toEqual(mockResult);
    });

    it("should push to remote", async () => {
      const remote = "origin";
      const branch = "main";
      const mockResult = { pushed: true };

      gitOperations.push.mockResolvedValue(mockResult);

      const result = await repoOperations.pushWrapper(remote, branch);

      expect(gitOperations.push).toHaveBeenCalledWith(
        mockRepo.adapter,
        remote,
        branch
      );
      expect(result).toEqual(mockResult);
    });

    it("should create commit", async () => {
      const message = "Test commit";
      const options = { author: "Test User" };
      const mockResult = { hash: "abc123" };

      gitOperations.createCommit.mockResolvedValue(mockResult);

      const result = await repoOperations.commitWrapper(message, options);

      expect(gitOperations.createCommit).toHaveBeenCalledWith(
        mockRepo.adapter,
        message,
        options
      );
      expect(result).toEqual(mockResult);
    });

    it("should stage file", async () => {
      const filepath = "test.js";
      const mockResult = { staged: true };

      gitOperations.stageFile.mockResolvedValue(mockResult);

      const result = await repoOperations.stageFile(filepath);

      expect(gitOperations.stageFile).toHaveBeenCalledWith(
        mockRepo.adapter,
        filepath
      );
      expect(result).toEqual(mockResult);
    });

    it("should create branch", async () => {
      const name = "feature/test";
      const startPoint = "HEAD";
      const mockResult = { name };

      gitOperations.createBranch.mockResolvedValue(mockResult);

      const result = await repoOperations.createBranch(name, startPoint);

      expect(gitOperations.createBranch).toHaveBeenCalledWith(
        mockRepo.adapter,
        name,
        startPoint
      );
      expect(result).toEqual(mockResult);
    });

    it("should get commits", async () => {
      const limit = 10;
      const ref = "HEAD";
      const mockResult = [{ hash: "abc123" }];

      gitOperations.getCommits.mockResolvedValue(mockResult);

      const result = await repoOperations.getCommits(limit, ref);

      expect(gitOperations.getCommits).toHaveBeenCalledWith(
        mockRepo.adapter,
        limit,
        ref
      );
      expect(result).toEqual(mockResult);
    });

    it("should get remotes", async () => {
      const mockResult = [
        { name: "origin", url: "git@github.com:test/repo.git" },
      ];

      gitOperations.getRemotes.mockResolvedValue(mockResult);

      const result = await repoOperations.getCurrentRemotes();

      expect(gitOperations.getRemotes).toHaveBeenCalledWith(mockRepo.adapter);
      expect(result).toEqual(mockResult);
    });
  });
});
