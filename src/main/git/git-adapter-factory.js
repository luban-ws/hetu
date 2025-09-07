/**
 * Git Adapter Factory
 * Provides centralized creation and management of Git adapters with fallback strategy
 */

import WasmGitAdapter from './adapters/wasm-git-adapter.js';

// Adapter types - Only WASM supported
export const GIT_ADAPTER_TYPES = {
  WASM: 'wasm'
};

// Global adapter configuration - Always use WASM
let adapterConfig = {
  preferred: GIT_ADAPTER_TYPES.WASM,
  fallback: GIT_ADAPTER_TYPES.WASM,
  wasmEnabled: true
};

/**
 * Configure the Git adapter factory
 * @param {Object} config - Configuration object
 * @param {string} config.preferred - Preferred adapter type (always WASM)
 * @param {string} config.fallback - Fallback adapter type (always WASM)
 * @param {boolean} config.wasmEnabled - Whether WASM adapter is enabled (always true)
 */
export function configureGitAdapter(config) {
  // Always use WASM adapter - ignore configuration
  adapterConfig = { 
    preferred: GIT_ADAPTER_TYPES.WASM,
    fallback: GIT_ADAPTER_TYPES.WASM,
    wasmEnabled: true 
  };
}

/**
 * Create a Git adapter instance - Always returns WASM adapter
 * @param {string} workingDir - Repository working directory
 * @param {string} adapterType - Ignored - always uses WASM
 * @returns {Promise<WasmGitAdapter>} WASM Git adapter instance
 */
export async function createGitAdapter(workingDir, adapterType = null) {
  // Always create WASM adapter
  try {
    return new WasmGitAdapter(workingDir);
  } catch (error) {
    console.error(`Failed to create WASM adapter:`, error.message);
    throw error;
  }
}

/**
 * Create adapter with automatic selection - Always WASM
 * @param {string} workingDir - Repository working directory
 * @returns {Promise<WasmGitAdapter>} WASM Git adapter instance
 */
async function createAutoAdapter(workingDir) {
  // Always create WASM adapter
  const adapter = new WasmGitAdapter(workingDir);
  await adapter.validateRepository();
  return adapter;
}

/**
 * Test adapter availability
 * @param {string} adapterType - Adapter type to test
 * @returns {Promise<boolean>} Whether adapter is available
 */
export async function testAdapterAvailability(adapterType) {
  try {
    const testDir = '/tmp'; // Use safe test directory
    await createGitAdapter(testDir, adapterType);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get adapter capabilities
 * @param {string} adapterType - Adapter type
 * @returns {Object} Capabilities object
 */
export function getAdapterCapabilities(adapterType) {
  const capabilities = {
    [GIT_ADAPTER_TYPES.WASM]: {
      stash: true,
      performance: 'high',
      nativeFallback: false,
      crossPlatform: true,
      bundleSize: 'large'
    }
  };
  
  return capabilities[adapterType] || {};
}

/**
 * Create a singleton adapter instance for the application
 * Useful for maintaining a single Git adapter throughout the app lifecycle
 */
class GitAdapterSingleton {
  constructor() {
    this.adapter = null;
    this.workingDir = null;
  }
  
  async initialize(workingDir, adapterType = null) {
    if (this.adapter && this.workingDir === workingDir) {
      return this.adapter;
    }
    
    // Cleanup previous adapter
    if (this.adapter && typeof this.adapter.close === 'function') {
      await this.adapter.close();
    }
    
    this.adapter = await createGitAdapter(workingDir, adapterType);
    this.workingDir = workingDir;
    return this.adapter;
  }
  
  getAdapter() {
    if (!this.adapter) {
      throw new Error('Git adapter not initialized. Call initialize() first.');
    }
    return this.adapter;
  }
  
  async cleanup() {
    if (this.adapter && typeof this.adapter.close === 'function') {
      try {
        await this.adapter.close();
      } catch (error) {
        // Log error but don't throw - cleanup should always succeed
        console.warn('Error during adapter cleanup:', error.message);
      }
    }
    this.adapter = null;
    this.workingDir = null;
  }
}

// Export singleton instance
export const gitAdapterSingleton = new GitAdapterSingleton();

// Convenience methods
export const initializeGitAdapter = gitAdapterSingleton.initialize.bind(gitAdapterSingleton);
export const getGitAdapter = gitAdapterSingleton.getAdapter.bind(gitAdapterSingleton);
export const cleanupGitAdapter = gitAdapterSingleton.cleanup.bind(gitAdapterSingleton);

export default createGitAdapter;