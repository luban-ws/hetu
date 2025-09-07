/**
 * Tests for Repository State Management
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { repoState, repoUtils } from "../repo-state.js";

describe("Repository State Management", () => {
  beforeEach(() => {
    // Reset state before each test
    repoState.clearRepo();
    repoState.clearRefreshInterval();
    repoState.setWindow(null);
    repoState.setSettings(null);
    repoState.setRepoHistory(null);
  });

  describe("State Getters", () => {
    it("should get initial repo state", () => {
      expect(repoState.getRepo()).toBeNull();
      expect(repoState.getWindow()).toBeNull();
      expect(repoState.getSettings()).toBeNull();
      expect(repoState.getRepoHistory()).toBeNull();
      expect(repoState.getRefreshInterval()).toBeNull();
    });

    it("should get updated repo state", () => {
      const mockRepo = { adapter: {}, workingDir: "/test" };
      const mockWindow = { webContents: {} };
      const mockSettings = { get: vi.fn() };
      const mockHistory = { updateRepos: vi.fn() };
      const mockInterval = setInterval(() => {}, 1000);

      repoState.setRepo(mockRepo);
      repoState.setWindow(mockWindow);
      repoState.setSettings(mockSettings);
      repoState.setRepoHistory(mockHistory);
      repoState.setRefreshInterval(mockInterval);

      expect(repoState.getRepo()).toEqual(mockRepo);
      expect(repoState.getWindow()).toEqual(mockWindow);
      expect(repoState.getSettings()).toEqual(mockSettings);
      expect(repoState.getRepoHistory()).toEqual(mockHistory);
      expect(repoState.getRefreshInterval()).toEqual(mockInterval);

      clearInterval(mockInterval);
    });
  });

  describe("State Operations", () => {
    it("should clear repo", () => {
      const mockRepo = { adapter: {}, workingDir: "/test" };
      repoState.setRepo(mockRepo);
      expect(repoState.getRepo()).toEqual(mockRepo);

      repoState.clearRepo();
      expect(repoState.getRepo()).toBeNull();
    });

    it("should clear refresh interval", () => {
      const mockInterval = setInterval(() => {}, 1000);
      repoState.setRefreshInterval(mockInterval);
      expect(repoState.getRefreshInterval()).toEqual(mockInterval);

      repoState.clearRefreshInterval();
      expect(repoState.getRefreshInterval()).toBeNull();
    });
  });

  describe("Validation Functions", () => {
    it("should validate repo existence", () => {
      expect(repoState.hasRepo()).toBe(false);

      repoState.setRepo({ adapter: {}, workingDir: "/test" });
      expect(repoState.hasRepo()).toBe(true);

      repoState.setRepo({ workingDir: "/test" }); // No adapter
      expect(repoState.hasRepo()).toBe(false);
    });

    it("should validate window existence", () => {
      expect(repoState.hasWindow()).toBe(false);

      repoState.setWindow({ webContents: {} });
      expect(repoState.hasWindow()).toBe(true);
    });

    it("should validate settings existence", () => {
      expect(repoState.hasSettings()).toBe(false);

      repoState.setSettings({ get: vi.fn() });
      expect(repoState.hasSettings()).toBe(true);
    });

    it("should validate repo history existence", () => {
      expect(repoState.hasRepoHistory()).toBe(false);

      repoState.setRepoHistory({ updateRepos: vi.fn() });
      expect(repoState.hasRepoHistory()).toBe(true);
    });
  });
});

describe("Repository Utils", () => {
  describe("getRepoName", () => {
    it("should extract repo name from path", () => {
      expect(repoUtils.getRepoName("/path/to/my-repo")).toBe("my-repo");
      expect(repoUtils.getRepoName("/home/user/projects/test")).toBe("test");
      expect(repoUtils.getRepoName("simple-repo")).toBe("simple-repo");
    });
  });

  describe("requireRepo", () => {
    it("should throw error when no repo is open", () => {
      const testFn = vi.fn();
      const wrappedFn = repoUtils.requireRepo(testFn);

      expect(() => wrappedFn()).toThrow("No repository open");
      expect(testFn).not.toHaveBeenCalled();
    });

    it("should call function when repo is open", () => {
      const mockRepo = { adapter: {}, workingDir: "/test" };
      repoState.setRepo(mockRepo);

      const testFn = vi.fn().mockReturnValue("test result");
      const wrappedFn = repoUtils.requireRepo(testFn);

      const result = wrappedFn("arg1", "arg2");

      expect(testFn).toHaveBeenCalledWith("arg1", "arg2");
      expect(result).toBe("test result");
    });
  });

  describe("withErrorHandling", () => {
    it("should return result when function succeeds", async () => {
      const testFn = vi.fn().mockResolvedValue("success");
      const wrappedFn = repoUtils.withErrorHandling(testFn);

      const result = await wrappedFn("arg1", "arg2");

      expect(testFn).toHaveBeenCalledWith("arg1", "arg2");
      expect(result).toBe("success");
    });

    it("should handle and rethrow errors", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const testError = new Error("Test error");
      const testFn = vi.fn().mockRejectedValue(testError);
      const wrappedFn = repoUtils.withErrorHandling(testFn);

      await expect(wrappedFn("arg1", "arg2")).rejects.toThrow("Test error");
      expect(consoleSpy).toHaveBeenCalledWith("Error in spy:", testError);

      consoleSpy.mockRestore();
    });

    it("should handle functions without names", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const testError = new Error("Test error");
      const testFn = vi.fn().mockRejectedValue(testError);
      testFn.name = ""; // No name
      const wrappedFn = repoUtils.withErrorHandling(testFn);

      await expect(wrappedFn()).rejects.toThrow("Test error");
      expect(consoleSpy).toHaveBeenCalledWith("Error in :", testError);

      consoleSpy.mockRestore();
    });
  });
});
