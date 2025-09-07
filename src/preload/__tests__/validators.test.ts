import { describe, it, expect } from "vitest";
import {
  isValidSendChannel,
  isValidInvokeChannel,
  isValidReceiveChannel,
} from "../validators";

describe("validators.ts", () => {
  describe("isValidSendChannel", () => {
    it("should return true for valid channels", () => {
      const validChannels: readonly string[] = [
        "channel1",
        "channel2",
        "channel3",
      ];
      expect(isValidSendChannel("channel1", validChannels)).toBe(true);
      expect(isValidSendChannel("channel2", validChannels)).toBe(true);
      expect(isValidSendChannel("channel3", validChannels)).toBe(true);
    });

    it("should return false for invalid channels", () => {
      const validChannels: readonly string[] = ["channel1", "channel2"];
      expect(isValidSendChannel("invalid", validChannels)).toBe(false);
      expect(isValidSendChannel("", validChannels)).toBe(false);
      expect(isValidSendChannel(null as any, validChannels)).toBe(false);
      expect(isValidSendChannel(undefined as any, validChannels)).toBe(false);
    });

    it("should handle empty channel list", () => {
      expect(isValidSendChannel("any", [])).toBe(false);
    });

    it("should be case sensitive", () => {
      const validChannels: readonly string[] = ["Channel1"];
      expect(isValidSendChannel("channel1", validChannels)).toBe(false);
      expect(isValidSendChannel("Channel1", validChannels)).toBe(true);
    });
  });

  describe("isValidInvokeChannel", () => {
    it("should return true for valid invoke channels", () => {
      const validChannels: readonly string[] = ["invoke1", "invoke2"];
      expect(isValidInvokeChannel("invoke1", validChannels)).toBe(true);
      expect(isValidInvokeChannel("invoke2", validChannels)).toBe(true);
    });

    it("should return false for invalid invoke channels", () => {
      const validChannels: readonly string[] = ["invoke1", "invoke2"];
      expect(isValidInvokeChannel("invalid", validChannels)).toBe(false);
      expect(isValidInvokeChannel("", validChannels)).toBe(false);
    });

    it("should be pure with no side effects", () => {
      const channels: readonly string[] = ["test1", "test2"];
      const originalChannels = [...channels];

      isValidInvokeChannel("test1", channels);
      isValidInvokeChannel("test3", channels);

      expect(channels).toEqual(originalChannels);
    });
  });

  describe("isValidReceiveChannel", () => {
    it("should validate receive channels correctly", () => {
      const validChannels: readonly string[] = ["receive1", "receive2"];
      expect(isValidReceiveChannel("receive1", validChannels)).toBe(true);
      expect(isValidReceiveChannel("receive2", validChannels)).toBe(true);
      expect(isValidReceiveChannel("invalid", validChannels)).toBe(false);
    });

    it("should be deterministic", () => {
      const channels: readonly string[] = ["test1", "test2"];

      // Multiple calls with same input should produce same output
      expect(isValidReceiveChannel("test1", channels)).toBe(true);
      expect(isValidReceiveChannel("test1", channels)).toBe(true);
      expect(isValidReceiveChannel("test3", channels)).toBe(false);
      expect(isValidReceiveChannel("test3", channels)).toBe(false);
    });
  });
});
