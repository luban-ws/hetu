import { Injectable } from '@angular/core';
import { DesktopAdapter } from '../desktop-adapter';

/**
 * Test mock for DesktopAdapter.
 * Tracks sent messages and allows simulating received events.
 */
@Injectable()
export class MockDesktopAdapter implements DesktopAdapter {
  available = true;
  private _sentMessages: { channel: string; data?: unknown }[] = [];
  private _invokedMessages: { channel: string; data?: unknown }[] = [];
  private _listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();

  send(channel: string, data?: unknown): void {
    this._sentMessages.push({ channel, data });
  }

  invoke<T = unknown>(channel: string, data?: unknown): Promise<T> {
    this._invokedMessages.push({ channel, data });
    return Promise.resolve(undefined as T);
  }

  on(channel: string, callback: (...args: unknown[]) => void): () => void {
    const listeners = this._listeners.get(channel) || [];
    listeners.push(callback);
    this._listeners.set(channel, listeners);
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  openExternal(_url: string): Promise<void> {
    return Promise.resolve();
  }

  /** Test helper: check if a message was sent on a channel */
  messageWasSent(channel: string): boolean {
    return this._sentMessages.some((m) => m.channel === channel);
  }

  /** Test helper: simulate an event from the backend */
  receiveEvent(channel: string, data?: unknown): void {
    const listeners = this._listeners.get(channel) || [];
    for (const cb of listeners) {
      cb(null, data);
    }
  }

  /** Test helper: reset all tracked state */
  reset(): void {
    this._sentMessages = [];
    this._invokedMessages = [];
    this._listeners.clear();
  }
}
