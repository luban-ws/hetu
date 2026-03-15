/**
 * Centralized IPC Communication Wrapper
 * Provides serialization validation and error tracking for all IPC communications
 */

import { WebContents, IpcMainEvent } from 'electron';
import { getLogger } from '@common/logger';

const logger = getLogger('ipc-wrapper');

/**
 * Safely serialize data for IPC transmission
 */
const safeSerialize = (data: any, eventName: string): any => {
  try {
    // Test serialization by attempting JSON stringify
    const serialized = JSON.stringify(data);
    JSON.parse(serialized); // Verify it can be deserialized
    return data;
  } catch (error) {
    logger.error(`Serialization failed for ${eventName}: ${error.message}`);
    const dataType = typeof data;
    const isArray = Array.isArray(data);
    const keys = dataType === 'object' && data ? Object.keys(data).join(',') : 'N/A';
    logger.error(`Data type: ${dataType}, isArray: ${isArray}, keys: ${keys}`);
    
    // Attempt to create a safe fallback
    if (dataType === 'object' && data !== null) {
      try {
        const safeData = {};
        for (const [key, value] of Object.entries(data)) {
          try {
            JSON.stringify(value);
            safeData[key] = value;
          } catch {
            safeData[key] = String(value);
          }
        }
        logger.warn(`Created safe fallback for ${eventName} with keys: ${Object.keys(safeData).join(',')}`);
        return safeData;
      } catch {
        return { error: 'Serialization failed', originalType: dataType };
      }
    }
    
    return null;
  }
};

/**
 * Safe webContents.send wrapper
 */
export const safeSend = (webContents: WebContents | null | undefined, channel: string, data: any): boolean => {
  if (!webContents || !webContents.send) {
    logger.warn(`Invalid webContents for channel: ${channel}`);
    return false;
  }

  const serializedData = safeSerialize(data, channel);
  if (serializedData === null) {
    logger.error(`Skipping IPC send for ${channel} due to serialization failure`);
    return false;
  }

  try {
    webContents.send(channel, serializedData);
    logger.debug(`Successfully sent IPC: ${channel}`);
    return true;
  } catch (error) {
    logger.error(`IPC send failed for ${channel}: ${error.message}`);
    const dataType = typeof serializedData;
    const keys = dataType === 'object' && serializedData ? Object.keys(serializedData).join(',') : 'N/A';
    logger.error(`Data type: ${dataType}, keys: ${keys}`);
    return false;
  }
};

/**
 * Safe event.sender.send wrapper
 */
export const safeEventSend = (event: IpcMainEvent, channel: string, data: any): boolean => {
  if (!event || !event.sender || !event.sender.send) {
    logger.warn(`Invalid event sender for channel: ${channel}`);
    return false;
  }

  const serializedData = safeSerialize(data, channel);
  if (serializedData === null) {
    logger.error(`Skipping IPC event send for ${channel} due to serialization failure`);
    return false;
  }

  try {
    event.sender.send(channel, serializedData);
    logger.debug(`Successfully sent IPC event: ${channel}`);
    return true;
  } catch (error) {
    logger.error(`IPC event send failed for ${channel}: ${error.message}`);
    const dataType = typeof serializedData;
    const keys = dataType === 'object' && serializedData ? Object.keys(serializedData).join(',') : 'N/A';
    logger.error(`Data type: ${dataType}, keys: ${keys}`);
    return false;
  }
};

/**
 * Create a safe sender for a specific webContents instance
 */
export const createSafeSender = (webContents: WebContents) => {
  return (channel: string, data: any) => safeSend(webContents, channel, data);
};

export default {
  safeSend,
  safeEventSend,
  createSafeSender
};