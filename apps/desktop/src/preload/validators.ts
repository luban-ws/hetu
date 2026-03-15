/**
 * Pure validation functions for IPC channels
 */

// Pure function to validate channel against whitelist
export const isValidSendChannel = (
  channel: string,
  validChannels: readonly string[]
): boolean => {
  return validChannels.includes(channel);
};

// Pure function to validate invoke channel
export const isValidInvokeChannel = (
  channel: string,
  validChannels: readonly string[]
): boolean => {
  return validChannels.includes(channel);
};

// Pure function to validate receive channel
export const isValidReceiveChannel = (
  channel: string,
  validChannels: readonly string[]
): boolean => {
  return validChannels.includes(channel);
};
