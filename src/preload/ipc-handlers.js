/**
 * IPC message handlers using pure functions
 */
import { ipcRenderer } from "electron";
import { 
  isValidSendChannel, 
  isValidInvokeChannel, 
  isValidReceiveChannel 
} from './validators.js';
import { createEventSubscription } from './subscriptions.js';
import {
  VALID_SEND_CHANNELS,
  VALID_INVOKE_CHANNELS,
  VALID_RECEIVE_CHANNELS
} from './channels.js';

// Pure function for sending messages
export const sendMessage = (channel, data) => {
  if (isValidSendChannel(channel, VALID_SEND_CHANNELS)) {
    ipcRenderer.send(channel, data);
    return true;
  }
  return false;
};

// Pure function for invoking messages
export const invokeMessage = (channel, data) => {
  if (isValidInvokeChannel(channel, VALID_INVOKE_CHANNELS)) {
    return ipcRenderer.invoke(channel, data);
  }
  return Promise.reject(`Channel ${channel} not allowed`);
};

// Pure function for subscribing to channels
export const subscribeToChannel = (channel, callback) => {
  if (isValidReceiveChannel(channel, VALID_RECEIVE_CHANNELS)) {
    const subscription = createEventSubscription(channel, callback);
    ipcRenderer.on(channel, subscription);
    
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  }
  return () => {}; // Empty cleanup function
};