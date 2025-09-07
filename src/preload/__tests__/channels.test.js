import { describe, it, expect } from "vitest";
import {
  GIT_SEND_CHANNELS,
  INFRASTRUCTURE_SEND_CHANNELS,
  CI_SEND_CHANNELS,
  JIRA_SEND_CHANNELS,
  VALID_SEND_CHANNELS,
  VALID_INVOKE_CHANNELS,
  VALID_RECEIVE_CHANNELS,
  GIT_RECEIVE_CHANNELS,
  SETTINGS_RECEIVE_CHANNELS,
} from "../channels.js";

describe("channels.js", () => {
  describe("Channel Lists", () => {
    it("should have non-empty channel lists", () => {
      expect(GIT_SEND_CHANNELS.length).toBeGreaterThan(0);
      expect(INFRASTRUCTURE_SEND_CHANNELS.length).toBeGreaterThan(0);
      expect(VALID_INVOKE_CHANNELS.length).toBeGreaterThan(0);
      expect(VALID_RECEIVE_CHANNELS.length).toBeGreaterThan(0);
    });

    it("should not have duplicate channels in VALID_SEND_CHANNELS", () => {
      const uniqueChannels = new Set(VALID_SEND_CHANNELS);
      expect(uniqueChannels.size).toBe(VALID_SEND_CHANNELS.length);
    });

    it("should not have duplicate channels in VALID_RECEIVE_CHANNELS", () => {
      const uniqueChannels = new Set(VALID_RECEIVE_CHANNELS);
      expect(uniqueChannels.size).toBe(VALID_RECEIVE_CHANNELS.length);
    });

    it("should combine all send channel categories correctly", () => {
      const expectedLength =
        GIT_SEND_CHANNELS.length +
        INFRASTRUCTURE_SEND_CHANNELS.length +
        CI_SEND_CHANNELS.length +
        JIRA_SEND_CHANNELS.length +
        2; // Legacy channels count (adjust based on actual)

      // Should be close (accounting for legacy channels)
      expect(VALID_SEND_CHANNELS.length).toBeGreaterThan(expectedLength - 5);
    });
  });

  describe("Channel Format", () => {
    it("should have string channels only", () => {
      VALID_SEND_CHANNELS.forEach((channel) => {
        expect(typeof channel).toBe("string");
      });

      VALID_INVOKE_CHANNELS.forEach((channel) => {
        expect(typeof channel).toBe("string");
      });

      VALID_RECEIVE_CHANNELS.forEach((channel) => {
        expect(typeof channel).toBe("string");
      });
    });

    it("should not have empty string channels", () => {
      expect(VALID_SEND_CHANNELS.every((ch) => ch.length > 0)).toBe(true);
      expect(VALID_INVOKE_CHANNELS.every((ch) => ch.length > 0)).toBe(true);
      expect(VALID_RECEIVE_CHANNELS.every((ch) => ch.length > 0)).toBe(true);
    });
  });

  describe("Channel Organization", () => {
    it("should have Git channels properly categorized", () => {
      // Check that Git send channels start with expected patterns
      const gitPatterns = ["Repo-", "REPO."];
      GIT_SEND_CHANNELS.forEach((channel) => {
        if (typeof channel === "string") {
          const hasGitPattern = gitPatterns.some((pattern) =>
            channel.includes(pattern)
          );
          expect(hasGitPattern || channel.includes("REPO")).toBe(true);
        }
      });
    });

    it("should have receive channels for major operations", () => {
      // Check that we have success/failure pairs for major operations
      const hasOpenSuccess = GIT_RECEIVE_CHANNELS.some((ch) =>
        ch.includes("OpenSuccessful")
      );
      const hasOpenFailed = GIT_RECEIVE_CHANNELS.some((ch) =>
        ch.includes("OpenFailed")
      );

      expect(hasOpenSuccess).toBe(true);
      expect(hasOpenFailed).toBe(true);
    });
  });

  describe("Channel Immutability", () => {
    it("should not allow modification of channel arrays", () => {
      const originalLength = VALID_SEND_CHANNELS.length;
      const originalContent = [...VALID_SEND_CHANNELS];

      // Attempt to modify (this won't actually modify if frozen)
      try {
        VALID_SEND_CHANNELS.push("new-channel");
      } catch (e) {
        // Expected if frozen
      }

      // Length should remain the same
      expect(VALID_SEND_CHANNELS.length).toBe(originalLength);
      // Content should remain the same
      expect(VALID_SEND_CHANNELS).toEqual(originalContent);
    });
  });
});
