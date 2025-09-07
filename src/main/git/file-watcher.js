/**
 * File Watcher Module - Pure Functions Design
 * Uses WASM Git Adapter for file watching and diff operations
 */

import { ipcMain } from "electron";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import { createGitAdapter } from "./git-adapter-factory.js";
import { v4 as uuid } from "uuid";
import { IPC_EVENTS } from "@common/ipc-events";
import { getLogger } from "@common/logger";
import { safeSend, safeEventSend } from "../infrastructure/ipc-wrapper.js";

const logger = getLogger("file-watcher");

// Global state
let Repo = null;
let window = null;
let refreshInterval = null;
let fileRefreshSubscriptions = {};

// Pure utility functions
const withErrorHandling =
  (fn) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(`Error in ${fn.name}:`, error);
      throw error;
    }
  };

const requireRepo =
  (fn) =>
  (...args) => {
    if (!Repo?.adapter) throw new Error("No repository open");
    return fn(...args);
  };

// File operations
const getFileDetail = async (file, commit) => {
  // WASM Git adapter file detail implementation
  // For now, return basic file info
  return {
    file,
    commit,
    content: "File content not available in WASM Git yet",
    diff: "Diff not available in WASM Git yet",
  };
};

const getFileDiff = async (file, commit) => {
  if (!Repo?.adapter) return null;

  try {
    return await Repo.adapter.getDiff(file);
  } catch (error) {
    console.warn(`Failed to get diff for ${file}:`, error);
    return null;
  }
};

// Subscription management
const subscribeToFileUpdate = (file, commit) => {
  const id = uuid();
  fileRefreshSubscriptions[id] = { file, commit };
  return id;
};

const unsubscribeFromFileUpdate = (id) => {
  delete fileRefreshSubscriptions[id];
};

const unsubscribeAllUpdates = () => {
  fileRefreshSubscriptions = {};
};

// File refresh logic
const refreshFiles = async () => {
  if (!Repo?.adapter || Object.keys(fileRefreshSubscriptions).length === 0) {
    return;
  }

  try {
    const status = await Repo.adapter.getStatus();

    // Check each subscribed file for changes
    for (const [id, subscription] of Object.entries(fileRefreshSubscriptions)) {
      const fileStatus = status.files?.[subscription.file];
      if (fileStatus) {
        // Convert file status to serializable object
        const serializableStatus = {
          path: fileStatus.path || subscription.file,
          isNew: fileStatus.isNew && typeof fileStatus.isNew === 'function' ? fileStatus.isNew() : false,
          isModified: fileStatus.isModified && typeof fileStatus.isModified === 'function' ? fileStatus.isModified() : false,
          isDeleted: fileStatus.isDeleted && typeof fileStatus.isDeleted === 'function' ? fileStatus.isDeleted() : false,
          isRenamed: fileStatus.isRenamed && typeof fileStatus.isRenamed === 'function' ? fileStatus.isRenamed() : false,
          isIgnored: false,
          inIndex: fileStatus.inIndex && typeof fileStatus.inIndex === 'function' ? fileStatus.inIndex() : false,
          inWorkingTree: fileStatus.inWorkingTree && typeof fileStatus.inWorkingTree === 'function' ? fileStatus.inWorkingTree() : false,
        };
        safeSend(window?.webContents, IPC_EVENTS.REPO.FILE_UPDATED, {
          id,
          file: subscription.file,
          status: serializableStatus,
        });
      }
    }
  } catch (error) {
    console.warn("Failed to refresh files:", error);
  }
};

// Wrapped operations
const wrappedGetFileDetail = withErrorHandling(requireRepo(getFileDetail));

// Main functions
const openRepo = withErrorHandling(async (event, arg) => {
  Repo = null;
  clearInterval(refreshInterval);
  unsubscribeAllUpdates();

  if (arg.workingDir) {
    const adapter = await createGitAdapter(arg.workingDir);
    Repo = { adapter, workingDir: arg.workingDir };

    // Start file refresh interval
    refreshInterval = setInterval(refreshFiles, 2000);
  }
});

const closeRepo = withErrorHandling(async (event, arg) => {
  Repo = null;
  clearInterval(refreshInterval);
  unsubscribeAllUpdates();
});

const getFileDetailWrapper = async (event, arg) => {
  const result = await wrappedGetFileDetail(arg.file, arg.commit);
  // Ensure result is serializable
  const serializableResult = {
    file: result.file || arg.file,
    commit: result.commit || arg.commit,
    content: typeof result.content === 'string' ? result.content : '',
    encoding: result.encoding || 'utf8',
    binary: Boolean(result.binary),
    size: Number(result.size) || 0,
    ...(result.diff && { diff: String(result.diff) }),
    ...(result.patch && { patch: String(result.patch) }),
    ...(result.additions && { additions: Number(result.additions) }),
    ...(result.deletions && { deletions: Number(result.deletions) }),
  };
  safeEventSend(event, IPC_EVENTS.REPO.FILE_DETAIL_RETRIEVED, {
    result: serializableResult,
  });
};

const subscribeUpdate = async (event, arg) => {
  const id = subscribeToFileUpdate(arg.file, arg.commit);
  safeEventSend(event, IPC_EVENTS.REPO.SUBSCRIPTION_CREATED, { id });
};

const unsubscribeUpdate = async (event, arg) => {
  unsubscribeFromFileUpdate(arg.id);
  safeEventSend(event, IPC_EVENTS.REPO.SUBSCRIPTION_REMOVED, { id: arg.id });
};

// Initialize module
function init(win) {
  window = win;

  window.on("close", (event) => {
    clearInterval(refreshInterval);
    unsubscribeAllUpdates();
  });

  // Register IPC handlers
  ipcMain.on(IPC_EVENTS.REPO.OPEN, openRepo);
  ipcMain.on(IPC_EVENTS.REPO.CLOSE, closeRepo);
  ipcMain.on(
    IPC_EVENTS.REPO.GET_FILE_DETAIL,
    requireArgParams(getFileDetailWrapper, ["file", "commit"])
  );
  ipcMain.on(
    IPC_EVENTS.REPO.SUBSCRIBE_FILE_UPDATE,
    requireArgParams(subscribeUpdate, ["file", "commit"])
  );
  ipcMain.on(
    IPC_EVENTS.REPO.UNSUBSCRIBE_FILE_UPDATE,
    requireArgParams(unsubscribeUpdate, ["id"])
  );
}

export { init };
