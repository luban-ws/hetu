/**
 * Tests for IPC Handlers
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createIpcHandlers, registerIpcHandlers } from "../ipc-handlers.js";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

// Mock IPC events
vi.mock("@common/ipc-events", () => ({
  IPC_EVENTS: {
    REPO: {
      OPEN: "REPO_OPEN",
      INIT: "REPO_INIT",
      CLOSE: "REPO_CLOSE",
      REFRESH: "REPO_REFRESH",
      FETCH: "REPO_FETCH",
      PULL: "REPO_PULL",
      PUSH: "REPO_PUSH",
      COMMIT: "REPO_COMMIT",
      STAGE: "REPO_STAGE",
      UNSTAGE: "REPO_UNSTAGE",
      STAGE_ALL: "REPO_STAGE_ALL",
      UNSTAGE_ALL: "REPO_UNSTAGE_ALL",
      CREATE_BRANCH: "REPO_CREATE_BRANCH",
      DELETE_BRANCH: "REPO_DELETE_BRANCH",
      SWITCH_BRANCH: "REPO_SWITCH_BRANCH",
      MERGE: "REPO_MERGE",
      RESET: "REPO_RESET",
      STASH_SAVE: "REPO_STASH_SAVE",
      STASH_POP: "REPO_STASH_POP",
      STASH_APPLY: "REPO_STASH_APPLY",
      STASH_DROP: "REPO_STASH_DROP",
      STASH_LIST: "REPO_STASH_LIST",
      CREATE_TAG: "REPO_CREATE_TAG",
      DELETE_TAG: "REPO_DELETE_TAG",
      GET_COMMITS: "REPO_GET_COMMITS",
      GET_BRANCHES: "REPO_GET_BRANCHES",
      GET_REMOTES: "REPO_GET_REMOTES",
      GET_STATUS: "REPO_GET_STATUS",
      GET_DIFF: "REPO_GET_DIFF",
    },
  },
}));

describe("IPC Handlers", () => {
  let mockOperations;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOperations = {
      openRepo: vi.fn(),
      initRepo: vi.fn(),
      closeRepo: vi.fn(),
      refreshRepo: vi.fn(),
      fetchRepo: vi.fn(),
      pullWrapper: vi.fn(),
      pushWrapper: vi.fn(),
      commitWrapper: vi.fn(),
      stageFile: vi.fn(),
      unstageFile: vi.fn(),
      stageAll: vi.fn(),
      unstageAll: vi.fn(),
      createBranch: vi.fn(),
      deleteBranch: vi.fn(),
      switchBranch: vi.fn(),
      mergeWrapper: vi.fn(),
      resetWrapper: vi.fn(),
      stashSave: vi.fn(),
      stashPop: vi.fn(),
      stashApply: vi.fn(),
      stashDrop: vi.fn(),
      stashList: vi.fn(),
      createTag: vi.fn(),
      deleteTag: vi.fn(),
      getCommits: vi.fn(),
      getBranches: vi.fn(),
      getCurrentRemotes: vi.fn(),
      getStatus: vi.fn(),
      getDiff: vi.fn(),
    };
  });

  describe("createIpcHandlers", () => {
    it("should create handlers mapping for all operations", () => {
      const handlers = createIpcHandlers(mockOperations);

      expect(handlers).toHaveProperty("REPO_OPEN", mockOperations.openRepo);
      expect(handlers).toHaveProperty("REPO_INIT", mockOperations.initRepo);
      expect(handlers).toHaveProperty("REPO_CLOSE", mockOperations.closeRepo);
      expect(handlers).toHaveProperty(
        "REPO_REFRESH",
        mockOperations.refreshRepo
      );
      expect(handlers).toHaveProperty("REPO_FETCH", mockOperations.fetchRepo);
      expect(handlers).toHaveProperty("REPO_PULL", mockOperations.pullWrapper);
      expect(handlers).toHaveProperty("REPO_PUSH", mockOperations.pushWrapper);
      expect(handlers).toHaveProperty(
        "REPO_COMMIT",
        mockOperations.commitWrapper
      );
      expect(handlers).toHaveProperty("REPO_STAGE", mockOperations.stageFile);
      expect(handlers).toHaveProperty(
        "REPO_UNSTAGE",
        mockOperations.unstageFile
      );
      expect(handlers).toHaveProperty(
        "REPO_STAGE_ALL",
        mockOperations.stageAll
      );
      expect(handlers).toHaveProperty(
        "REPO_UNSTAGE_ALL",
        mockOperations.unstageAll
      );
      expect(handlers).toHaveProperty(
        "REPO_CREATE_BRANCH",
        mockOperations.createBranch
      );
      expect(handlers).toHaveProperty(
        "REPO_DELETE_BRANCH",
        mockOperations.deleteBranch
      );
      expect(handlers).toHaveProperty(
        "REPO_SWITCH_BRANCH",
        mockOperations.switchBranch
      );
      expect(handlers).toHaveProperty(
        "REPO_MERGE",
        mockOperations.mergeWrapper
      );
      expect(handlers).toHaveProperty(
        "REPO_RESET",
        mockOperations.resetWrapper
      );
      expect(handlers).toHaveProperty(
        "REPO_STASH_SAVE",
        mockOperations.stashSave
      );
      expect(handlers).toHaveProperty(
        "REPO_STASH_POP",
        mockOperations.stashPop
      );
      expect(handlers).toHaveProperty(
        "REPO_STASH_APPLY",
        mockOperations.stashApply
      );
      expect(handlers).toHaveProperty(
        "REPO_STASH_DROP",
        mockOperations.stashDrop
      );
      expect(handlers).toHaveProperty(
        "REPO_STASH_LIST",
        mockOperations.stashList
      );
      expect(handlers).toHaveProperty(
        "REPO_CREATE_TAG",
        mockOperations.createTag
      );
      expect(handlers).toHaveProperty(
        "REPO_DELETE_TAG",
        mockOperations.deleteTag
      );
      expect(handlers).toHaveProperty(
        "REPO_GET_COMMITS",
        mockOperations.getCommits
      );
      expect(handlers).toHaveProperty(
        "REPO_GET_BRANCHES",
        mockOperations.getBranches
      );
      expect(handlers).toHaveProperty(
        "REPO_GET_REMOTES",
        mockOperations.getCurrentRemotes
      );
      expect(handlers).toHaveProperty(
        "REPO_GET_STATUS",
        mockOperations.getStatus
      );
      expect(handlers).toHaveProperty("REPO_GET_DIFF", mockOperations.getDiff);
    });

    it("should return empty object when no operations provided", () => {
      const handlers = createIpcHandlers({});

      expect(handlers).toEqual({});
    });
  });

  describe("registerIpcHandlers", () => {
    it("should register all handlers with ipcMain", async () => {
      const { ipcMain } = await import("electron");
      const handlers = {
        REPO_OPEN: mockOperations.openRepo,
        REPO_INIT: mockOperations.initRepo,
        REPO_CLOSE: mockOperations.closeRepo,
      };

      registerIpcHandlers(handlers);

      expect(ipcMain.handle).toHaveBeenCalledWith(
        "REPO_OPEN",
        mockOperations.openRepo
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "REPO_INIT",
        mockOperations.initRepo
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "REPO_CLOSE",
        mockOperations.closeRepo
      );
      expect(ipcMain.handle).toHaveBeenCalledTimes(3);
    });

    it("should handle empty handlers object", async () => {
      const { ipcMain } = await import("electron");

      registerIpcHandlers({});

      expect(ipcMain.handle).not.toHaveBeenCalled();
    });
  });

  describe("Integration", () => {
    it("should create and register handlers together", async () => {
      const { ipcMain } = await import("electron");

      const handlers = createIpcHandlers(mockOperations);
      registerIpcHandlers(handlers);

      // Verify that all expected handlers were registered
      const expectedEvents = [
        "REPO_OPEN",
        "REPO_INIT",
        "REPO_CLOSE",
        "REPO_REFRESH",
        "REPO_FETCH",
        "REPO_PULL",
        "REPO_PUSH",
        "REPO_COMMIT",
        "REPO_STAGE",
        "REPO_UNSTAGE",
        "REPO_STAGE_ALL",
        "REPO_UNSTAGE_ALL",
        "REPO_CREATE_BRANCH",
        "REPO_DELETE_BRANCH",
        "REPO_SWITCH_BRANCH",
        "REPO_MERGE",
        "REPO_RESET",
        "REPO_STASH_SAVE",
        "REPO_STASH_POP",
        "REPO_STASH_APPLY",
        "REPO_STASH_DROP",
        "REPO_STASH_LIST",
        "REPO_CREATE_TAG",
        "REPO_DELETE_TAG",
        "REPO_GET_COMMITS",
        "REPO_GET_BRANCHES",
        "REPO_GET_REMOTES",
        "REPO_GET_STATUS",
        "REPO_GET_DIFF",
      ];

      expect(ipcMain.handle).toHaveBeenCalledTimes(expectedEvents.length);

      expectedEvents.forEach((event) => {
        expect(ipcMain.handle).toHaveBeenCalledWith(
          event,
          expect.any(Function)
        );
      });
    });
  });
});
