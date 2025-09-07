/**
 * Pure functions for event subscription management
 */

// Pure function to create event subscription
export const createEventSubscription = (channel, callback) => {
  const subscription = (event, ...args) => callback(event, ...args);
  return subscription;
};

// Pure function to create cleanup function
export const createCleanupFunction = (removeListener, channel, subscription) => {
  return () => removeListener(channel, subscription);
};