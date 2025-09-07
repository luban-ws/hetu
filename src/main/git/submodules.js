/**
 * Submodules Management Module - Pure Functions Design
 * Uses WASM Git Adapter for submodule operations
 */

import { ipcMain } from "electron";
import { requireArgParams } from "../infrastructure/handler-helper.js";
import { createGitAdapter } from "./git-adapter-factory.js";
import { IPC_EVENTS } from "@common/ipc-events";

// Global state
let Repo = null;
let window = null;

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

// Submodule operations
const getSubmoduleNames = async () => {
  // WASM Git adapter doesn't have direct submodule support yet
  // Return empty array for now - can be implemented later
  return [];
};

const getSubmoduleDetails = async (name) => {
  // WASM Git adapter doesn't have direct submodule support yet
  // Return mock data for now - can be implemented later
  return {
    hid: "0000000000000000000000000000000000000000",
    path: name,
    message: "Submodule not supported in WASM Git yet",
    detail: "This feature will be implemented in a future version",
    date: new Date(),
    time: Date.now(),
    committer: { name: "Unknown", email: "unknown@example.com" },
    email: "unknown@example.com",
    author: "Unknown",
  };
};

// Wrapped operations
const wrappedGetSubmoduleNames = withErrorHandling(
  requireRepo(getSubmoduleNames)
);
const wrappedGetSubmoduleDetails = withErrorHandling(
  requireRepo(getSubmoduleDetails)
);

// Main functions
const openRepo = withErrorHandling(async (event, arg) => {
  if (arg.workingDir) {
    const adapter = await createGitAdapter(arg.workingDir);
    Repo = { adapter, workingDir: arg.workingDir };
    await getSubmoduleNames();
  }
});

const getSubmoduleNamesHandler = async () => {
  const names = await wrappedGetSubmoduleNames();
  const submodules = names.map((name) => ({
    display: name,
    shorthand: name,
    submodule: true,
  }));

  window?.webContents.send(IPC_EVENTS.REPO.SUBMODULE_NAMES_RETRIEVED, {
    submodules,
  });
};

const getSubmoduleDetailsHandler = async (event, arg) => {
  const result = await wrappedGetSubmoduleDetails(arg.name);
  event.sender.send(IPC_EVENTS.REPO.SUBMODULE_DETAILS_RETRIEVED, {
    result,
  });
};

// Initialize module
function init(win) {
  window = win;

  // Register IPC handlers
  ipcMain.on(IPC_EVENTS.REPO.OPEN, openRepo);
  ipcMain.on(
    IPC_EVENTS.REPO.GET_SUBMODULE_DETAILS,
    requireArgParams(getSubmoduleDetailsHandler, ["name"])
  );
}

export { init };
