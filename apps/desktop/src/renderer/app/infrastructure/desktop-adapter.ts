import { InjectionToken } from '@angular/core';

/**
 * Runtime-agnostic interface for desktop host communication.
 * Services depend on this interface, not on Electron or Tauri directly.
 *
 * Implementations:
 * - ElectronAdapter (wraps window.electronAPI)
 * - TauriAdapter (wraps @tauri-apps/api)
 */
export interface DesktopAdapter {
  /** Whether the underlying desktop runtime is available */
  readonly available: boolean;

  /**
   * Fire-and-forget message to the backend.
   * In Electron: ipc.send(channel, data)
   * In Tauri: invoke(mapChannel(channel), data)
   */
  send(channel: string, data?: unknown): void;

  /**
   * Request-response call to the backend.
   * In Electron: ipc.invoke(channel, data)
   * In Tauri: invoke(mapChannel(channel), data)
   */
  invoke<T = unknown>(channel: string, data?: unknown): Promise<T>;

  /**
   * Subscribe to events from the backend.
   * Returns an unsubscribe function.
   * In Electron: ipc.on(channel, callback)
   * In Tauri: listen(channel, callback)
   */
  on(channel: string, callback: (...args: unknown[]) => void): () => void;

  /**
   * Open a URL in the system default browser.
   */
  openExternal(url: string): Promise<void>;
}

/** Angular DI token for DesktopAdapter */
export const DESKTOP_ADAPTER = new InjectionToken<DesktopAdapter>('DesktopAdapter');
