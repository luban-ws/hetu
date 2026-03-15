/**
 * Tests for Git Adapter Factory
 * 
 * Tests the factory pattern for creating Git adapters including:
 * - Adapter type constants and configuration
 * - Adapter creation and singleton management
 * - Error handling and fallback strategies
 * - Capability querying and availability testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GIT_ADAPTER_TYPES,
  configureGitAdapter,
  createGitAdapter,
  testAdapterAvailability,
  getAdapterCapabilities,
  gitAdapterSingleton,
  initializeGitAdapter,
  getGitAdapter,
  cleanupGitAdapter
} from '../git-adapter-factory.js';

// Mock IsomorphicGitAdapter
const mockIsomorphicGitAdapter = {
  workingDir: '/test/repo',
  close: vi.fn().mockResolvedValue(undefined)
};

vi.mock('../adapters/isomorphic-git-adapter.js', () => ({
  default: vi.fn().mockImplementation((workingDir) => ({
    ...mockIsomorphicGitAdapter,
    workingDir
  }))
}));

import IsomorphicGitAdapter from '../adapters/isomorphic-git-adapter.js';

describe('Git Adapter Factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await gitAdapterSingleton.cleanup();
  });

  describe('constants and configuration', () => {
    it('should export correct adapter types', () => {
      expect(GIT_ADAPTER_TYPES).toEqual({
        ISOMORPHIC: 'isomorphic'
      });
    });

    it('should configure adapter settings', () => {
      configureGitAdapter({
        preferred: 'invalid',
        fallback: 'invalid',
        isomorphicEnabled: false
      });

      // Should ignore invalid config and always use Isomorphic Git
      expect(getAdapterCapabilities(GIT_ADAPTER_TYPES.ISOMORPHIC)).toBeDefined();
    });
  });

  describe('createGitAdapter', () => {
    it('should create Isomorphic Git adapter by default', async () => {
      const workingDir = '/test/repo';
      const adapter = await createGitAdapter(workingDir);

      expect(IsomorphicGitAdapter).toHaveBeenCalledWith(workingDir);
      expect(adapter.workingDir).toBe(workingDir);
    });

    it('should create Isomorphic Git adapter regardless of requested type', async () => {
      const workingDir = '/test/repo';
      const adapter = await createGitAdapter(workingDir, 'invalid-type');

      expect(IsomorphicGitAdapter).toHaveBeenCalledWith(workingDir);
      expect(adapter.workingDir).toBe(workingDir);
    });

    it('should handle adapter creation errors', async () => {
      const error = new Error('Isomorphic Git initialization failed');
      IsomorphicGitAdapter.mockImplementationOnce(() => {
        throw error;
      });

      await expect(createGitAdapter('/test/repo')).rejects.toThrow(error);
    });
  });

  describe('testAdapterAvailability', () => {
    it('should return true for Isomorphic Git adapter when available', async () => {
      const available = await testAdapterAvailability(GIT_ADAPTER_TYPES.ISOMORPHIC);
      expect(available).toBe(true);
    });

    it('should return false when adapter creation fails', async () => {
      IsomorphicGitAdapter.mockImplementationOnce(() => {
        throw new Error('Not available');
      });

      const available = await testAdapterAvailability(GIT_ADAPTER_TYPES.ISOMORPHIC);
      expect(available).toBe(false);
    });

    it('should test with safe directory path', async () => {
      await testAdapterAvailability(GIT_ADAPTER_TYPES.ISOMORPHIC);
      expect(IsomorphicGitAdapter).toHaveBeenCalledWith('/tmp');
    });
  });

  describe('getAdapterCapabilities', () => {
    it('should return Isomorphic Git adapter capabilities', () => {
      const capabilities = getAdapterCapabilities(GIT_ADAPTER_TYPES.ISOMORPHIC);
      
      expect(capabilities).toEqual({
        stash: true,
        performance: 'good',
        nativeFallback: false,
        crossPlatform: true,
        bundleSize: 'medium',
        pureJavaScript: true,
        noSystemDependencies: true
      });
    });

    it('should return empty object for unknown adapter type', () => {
      const capabilities = getAdapterCapabilities('unknown');
      expect(capabilities).toEqual({});
    });
  });

  describe('GitAdapterSingleton', () => {
    const workingDir = '/test/repo';

    describe('initialize', () => {
      it('should create and cache adapter for working directory', async () => {
        const adapter = await gitAdapterSingleton.initialize(workingDir);

        expect(IsomorphicGitAdapter).toHaveBeenCalledWith(workingDir);
        expect(adapter.workingDir).toBe(workingDir);
        expect(gitAdapterSingleton.workingDir).toBe(workingDir);
      });

      it('should reuse existing adapter for same directory', async () => {
        const adapter1 = await gitAdapterSingleton.initialize(workingDir);
        const adapter2 = await gitAdapterSingleton.initialize(workingDir);

        expect(adapter1).toBe(adapter2);
        expect(IsomorphicGitAdapter).toHaveBeenCalledOnce();
      });

      it('should cleanup previous adapter when changing directory', async () => {
        await gitAdapterSingleton.initialize(workingDir);
        await gitAdapterSingleton.initialize('/different/repo');

        expect(mockIsomorphicGitAdapter.close).toHaveBeenCalledOnce();
        expect(IsomorphicGitAdapter).toHaveBeenCalledTimes(2);
      });

      it('should ignore adapter type parameter', async () => {
        const adapter = await gitAdapterSingleton.initialize(workingDir, 'invalid');
        expect(adapter.workingDir).toBe(workingDir);
      });
    });

    describe('getAdapter', () => {
      it('should return initialized adapter', async () => {
        const initialized = await gitAdapterSingleton.initialize(workingDir);
        const retrieved = gitAdapterSingleton.getAdapter();

        expect(retrieved).toBe(initialized);
      });

      it('should throw error when not initialized', () => {
        expect(() => gitAdapterSingleton.getAdapter()).toThrow(
          'Git adapter not initialized. Call initialize() first.'
        );
      });
    });

    describe('cleanup', () => {
      it('should cleanup adapter and reset state', async () => {
        await gitAdapterSingleton.initialize(workingDir);
        await gitAdapterSingleton.cleanup();

        expect(mockIsomorphicGitAdapter.close).toHaveBeenCalledOnce();
        expect(gitAdapterSingleton.adapter).toBe(null);
        expect(gitAdapterSingleton.workingDir).toBe(null);
      });

      it('should handle cleanup when no adapter exists', async () => {
        await expect(gitAdapterSingleton.cleanup()).resolves.not.toThrow();
      });

      it('should handle adapter without close method', async () => {
        const adapterWithoutClose = { workingDir };
        IsomorphicGitAdapter.mockReturnValueOnce(adapterWithoutClose);
        
        await gitAdapterSingleton.initialize(workingDir);
        await expect(gitAdapterSingleton.cleanup()).resolves.not.toThrow();
      });
    });
  });

  describe('convenience functions', () => {
    const workingDir = '/test/repo';

    it('should expose singleton initialize as convenience function', async () => {
      const adapter = await initializeGitAdapter(workingDir);
      expect(adapter.workingDir).toBe(workingDir);
    });

    it('should expose singleton getAdapter as convenience function', async () => {
      await initializeGitAdapter(workingDir);
      const adapter = getGitAdapter();
      expect(adapter.workingDir).toBe(workingDir);
    });

    it('should expose singleton cleanup as convenience function', async () => {
      await initializeGitAdapter(workingDir);
      await cleanupGitAdapter();
      
      expect(() => getGitAdapter()).toThrow(
        'Git adapter not initialized. Call initialize() first.'
      );
    });
  });

  describe('error handling', () => {
    it('should handle adapter initialization errors gracefully', async () => {
      const error = new Error('Isomorphic Git failed to load');
      IsomorphicGitAdapter.mockImplementationOnce(() => {
        throw error;
      });

      await expect(createGitAdapter('/test/repo')).rejects.toThrow(error);
    });

    it('should handle singleton cleanup errors gracefully', async () => {
      const adapterWithFailingClose = {
        workingDir: '/test/repo',
        close: vi.fn().mockRejectedValue(new Error('Close failed'))
      };
      IsomorphicGitAdapter.mockReturnValueOnce(adapterWithFailingClose);

      await gitAdapterSingleton.initialize('/test/repo');
      
      // Should not throw despite close() failing - catch the error internally
      await gitAdapterSingleton.cleanup();
      
      // Verify cleanup was attempted
      expect(adapterWithFailingClose.close).toHaveBeenCalled();
      
      // State should still be reset
      expect(gitAdapterSingleton.adapter).toBe(null);
      expect(gitAdapterSingleton.workingDir).toBe(null);
    });
  });

  describe('integration scenarios', () => {
    it('should support multiple repositories via different instances', async () => {
      const repo1 = '/repo1';
      const repo2 = '/repo2';

      const adapter1 = await createGitAdapter(repo1);
      const adapter2 = await createGitAdapter(repo2);

      expect(adapter1.workingDir).toBe(repo1);
      expect(adapter2.workingDir).toBe(repo2);
      expect(IsomorphicGitAdapter).toHaveBeenCalledTimes(2);
    });

    it('should handle singleton across different repositories', async () => {
      await initializeGitAdapter('/repo1');
      expect(getGitAdapter().workingDir).toBe('/repo1');

      await initializeGitAdapter('/repo2');
      expect(getGitAdapter().workingDir).toBe('/repo2');

      expect(mockIsomorphicGitAdapter.close).toHaveBeenCalledOnce();
    });
  });
});