/**
 * Pure functions for event subscription management
 */

// Pure function to create event subscription
export const createEventSubscription = (
  _channel: string,
  callback: (event: any, ...args: any[]) => void
): ((event: any, ...args: any[]) => void) => {
  const subscription = (event: any, ...args: any[]) => callback(event, ...args);
  return subscription;
};

// Pure function to create cleanup function
export const createCleanupFunction = (
  removeListener: (
    channel: string,
    subscription: (event: any, ...args: any[]) => void
  ) => void,
  channel: string,
  subscription: (event: any, ...args: any[]) => void
): (() => void) => {
  return () => removeListener(channel, subscription);
};
