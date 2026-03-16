import { InjectionToken } from '@angular/core';

/**
 * Runtime-agnostic interface for desktop host communication.
 * Services depend on this interface, not on Tauri directly.
 *
 * Implementation: TauriAdapter (wraps @tauri-apps/api)
 */
export interface DesktopAdapter {
  /** Whether the underlying desktop runtime is available */
  readonly available: boolean;

  /** Fire-and-forget message to the Rust backend via Tauri invoke */
  send(channel: string, data?: unknown): void;

  /** Request-response call to the Rust backend via Tauri invoke */
  invoke<T = unknown>(channel: string, data?: unknown): Promise<T>;

  /**
   * Subscribe to events from the Rust backend.
   * Returns an unsubscribe function.
   */
  on(channel: string, callback: (...args: unknown[]) => void): () => void;

  /** Open a URL in the system default browser */
  openExternal(url: string): Promise<void>;
}

/** Angular DI token for DesktopAdapter */
export const DESKTOP_ADAPTER = new InjectionToken<DesktopAdapter>('DesktopAdapter');
