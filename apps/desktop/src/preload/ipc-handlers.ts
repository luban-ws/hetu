/**
 * IPC message handlers using pure functions
 */
import { ipcRenderer } from "electron";
import {
  isValidSendChannel,
  isValidInvokeChannel,
  isValidReceiveChannel,
} from "./validators";
import { createEventSubscription } from "./subscriptions";
import {
  VALID_SEND_CHANNELS,
  VALID_INVOKE_CHANNELS,
  VALID_RECEIVE_CHANNELS,
} from "./channels";

// Pure function for sending messages
export const sendMessage = (channel: string, data?: any): boolean => {
  if (isValidSendChannel(channel, VALID_SEND_CHANNELS)) {
    ipcRenderer.send(channel, data);
    return true;
  }
  return false;
};

// Pure function for invoking messages
export const invokeMessage = (channel: string, data?: any): Promise<any> => {
  if (isValidInvokeChannel(channel, VALID_INVOKE_CHANNELS)) {
    return ipcRenderer.invoke(channel, data);
  }
  return Promise.reject(new Error(`Channel ${channel} not allowed`));
};

// Pure function for subscribing to channels
export const subscribeToChannel = (
  channel: string,
  callback: (data: any) => void
): (() => void) => {
  if (isValidReceiveChannel(channel, VALID_RECEIVE_CHANNELS)) {
    const subscription = createEventSubscription(channel, (_event: any, ...args: any[]) => {
      callback(args[0]); // Pass the first argument as data
    });
    ipcRenderer.on(channel, subscription);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  }
  return () => {}; // Empty cleanup function
};
