import { describe, it, expect, vi } from "vitest";
import {
  createEventSubscription,
  createCleanupFunction,
} from "../subscriptions";

describe("subscriptions.ts", () => {
  describe("createEventSubscription", () => {
    it("should create a subscription that forwards all arguments", () => {
      const mockCallback = vi.fn();
      const subscription = createEventSubscription(
        "test-channel",
        mockCallback
      );

      const mockEvent = { sender: "test" };
      const mockData = { value: 123 };
      const extraArg = "extra";

      subscription(mockEvent, mockData, extraArg);

      expect(mockCallback).toHaveBeenCalledWith(mockEvent, mockData, extraArg);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should handle callbacks with no additional arguments", () => {
      const mockCallback = vi.fn();
      const subscription = createEventSubscription(
        "test-channel",
        mockCallback
      );

      const mockEvent = { sender: "test" };

      subscription(mockEvent);

      expect(mockCallback).toHaveBeenCalledWith(mockEvent);
    });

    it("should handle multiple arguments correctly", () => {
      const mockCallback = vi.fn();
      const subscription = createEventSubscription("channel", mockCallback);

      const event = { type: "test" };
      const arg1 = { data: "first" };
      const arg2 = { data: "second" };
      const arg3 = "third";

      subscription(event, arg1, arg2, arg3);

      expect(mockCallback).toHaveBeenCalledWith(event, arg1, arg2, arg3);
    });

    it("should be a pure function", () => {
      const mockCallback = vi.fn();
      const sub1 = createEventSubscription("channel", mockCallback);
      const sub2 = createEventSubscription("channel", mockCallback);

      // Both subscriptions should behave identically
      const event = { type: "test" };
      const data = { value: 42 };

      sub1(event, data);
      sub2(event, data);

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenNthCalledWith(1, event, data);
      expect(mockCallback).toHaveBeenNthCalledWith(2, event, data);
    });
  });

  describe("createCleanupFunction", () => {
    it("should create a cleanup function that calls removeListener", () => {
      const mockRemoveListener = vi.fn();
      const channel = "test-channel";
      const subscription = () => {};

      const cleanup = createCleanupFunction(
        mockRemoveListener,
        channel,
        subscription
      );

      expect(mockRemoveListener).not.toHaveBeenCalled();

      cleanup();

      expect(mockRemoveListener).toHaveBeenCalledWith(channel, subscription);
      expect(mockRemoveListener).toHaveBeenCalledTimes(1);
    });

    it("should be reusable", () => {
      const mockRemoveListener = vi.fn();
      const channel = "test-channel";
      const subscription = () => {};

      const cleanup = createCleanupFunction(
        mockRemoveListener,
        channel,
        subscription
      );

      cleanup();
      cleanup();

      expect(mockRemoveListener).toHaveBeenCalledTimes(2);
    });

    it("should be a pure function", () => {
      const mockRemoveListener = vi.fn();
      const channel = "channel";
      const subscription = () => {};

      const cleanup1 = createCleanupFunction(
        mockRemoveListener,
        channel,
        subscription
      );
      const cleanup2 = createCleanupFunction(
        mockRemoveListener,
        channel,
        subscription
      );

      // Both cleanup functions should work independently
      cleanup1();
      expect(mockRemoveListener).toHaveBeenCalledTimes(1);

      cleanup2();
      expect(mockRemoveListener).toHaveBeenCalledTimes(2);
    });
  });
});
