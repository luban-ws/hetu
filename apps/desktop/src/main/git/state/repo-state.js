/**
 * Repository State Management - Pure Functions
 * Manages repository state and lifecycle
 */

import { getLogger } from "@common/logger";

const logger = getLogger("repo-state");

// Global state
let Repo = null;
let window = null;
let settings = null;
let repoHistory = null;
let refreshInterval = null;

// Pure state management functions
export const repoState = {
  // State getters
  getRepo: () => Repo,
  getWindow: () => window,
  getSettings: () => settings,
  getRepoHistory: () => repoHistory,
  getRefreshInterval: () => refreshInterval,

  // State setters
  setRepo: (repo) => {
    Repo = repo;
  },
  setWindow: (win) => {
    window = win;
  },
  setSettings: (settingsInstance) => {
    settings = settingsInstance;
  },
  setRepoHistory: (historyInstance) => {
    repoHistory = historyInstance;
  },
  setRefreshInterval: (interval) => {
    refreshInterval = interval;
  },

  // State operations
  clearRepo: () => {
    Repo = null;
  },
  clearRefreshInterval: () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  },

  // Validation functions
  hasRepo: () => Repo?.adapter != null,
  hasWindow: () => window != null,
  hasSettings: () => settings != null,
  hasRepoHistory: () => repoHistory != null,
};

// Pure utility functions
export const repoUtils = {
  getRepoName: (workingDir) => workingDir.split("/").pop(),

  requireRepo:
    (fn) =>
    (...args) => {
      if (!repoState.hasRepo()) {
        throw new Error("No repository open");
      }
      return fn(...args);
    },

  withErrorHandling:
    (fn) =>
    async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        logger.error(`Error in ${fn.name}:`, error);
        throw error;
      }
    },
};
