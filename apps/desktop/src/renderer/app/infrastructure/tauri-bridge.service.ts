import { Injectable } from '@angular/core';
import { invoke as tauriInvoke, isTauri as tauriIsTauri } from '@tauri-apps/api/core';

/**
 * Bridge service for Tauri 2 backend communication.
 * {@link isTauri} is false outside a Tauri WebView; {@link invoke} rejects.
 */
@Injectable()
export class TauriBridgeService {
  /**
   * Whether the app is running inside a Tauri WebView.
   * Uses @tauri-apps/api/core isTauri when available, otherwise checks window.__TAURI__.
   */
  get isTauri(): boolean {
    try {
      return typeof tauriIsTauri === 'function' ? tauriIsTauri() : !!(typeof window !== 'undefined' && (window as unknown as { __TAURI__?: unknown }).__TAURI__);
    } catch {
      return !!(typeof window !== 'undefined' && (window as unknown as { __TAURI__?: unknown }).__TAURI__);
    }
  }

  /**
   * Invokes a Tauri command. Resolves with the command result when running in Tauri;
   * rejects when not running inside Tauri.
   *
   * @param cmd - Tauri command name (e.g. 'ping', 'get_app_version')
   * @param args - Optional arguments object for the command
   * @returns Promise resolving to the command return value
   */
  invoke<T>(cmd: string, args?: unknown): Promise<T> {
    if (!this.isTauri) {
      return Promise.reject(new Error('TauriBridgeService: not running in Tauri'));
    }
    return tauriInvoke<T>(cmd, args);
  }

  /**
   * Calls the Tauri 'ping' command. Used to verify the bridge.
   *
   * @returns Promise resolving to the ping response (e.g. 'pong')
   */
  ping(): Promise<string> {
    return this.invoke<string>('ping');
  }

  /**
   * Calls the Tauri 'get_app_version' command.
   *
   * @returns Promise resolving to the app version string
   */
  getAppVersion(): Promise<string> {
    return this.invoke<string>('get_app_version');
  }
}
