/**
 * Pure validation functions for IPC channels
 */

// Pure function to validate channel against whitelist
export const isValidSendChannel = (channel, validChannels) => {
  return validChannels.includes(channel);
};

// Pure function to validate invoke channel
export const isValidInvokeChannel = (channel, validChannels) => {
  return validChannels.includes(channel);
};

// Pure function to validate receive channel
export const isValidReceiveChannel = (channel, validChannels) => {
  return validChannels.includes(channel);
};