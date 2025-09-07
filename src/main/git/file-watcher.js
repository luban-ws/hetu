/**
 * File Watcher Module - Pure Functions Design
 * Uses WASM Git Adapter for file watching and diff operations
 */

import { ipcMain } from "electron";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import { createGitAdapter } from "./git-adapter-factory.js";
import { v4 as uuid } from "uuid";
import { IPC_EVENTS } from "@common/ipc-events.js";

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
      console.error(`Error in ${fn.name}:`, error);
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
        window?.webContents.send(IPC_EVENTS.REPO.FILE_UPDATED, {
          id,
          file: subscription.file,
          status: fileStatus,
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
  event.sender.send(IPC_EVENTS.REPO.FILE_DETAIL_RETRIEVED, {
    result,
  });
};

const subscribeUpdate = async (event, arg) => {
  const id = subscribeToFileUpdate(arg.file, arg.commit);
  event.sender.send(IPC_EVENTS.REPO.SUBSCRIPTION_CREATED, { id });
};

const unsubscribeUpdate = async (event, arg) => {
  unsubscribeFromFileUpdate(arg.id);
  event.sender.send(IPC_EVENTS.REPO.SUBSCRIPTION_REMOVED, { id: arg.id });
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
