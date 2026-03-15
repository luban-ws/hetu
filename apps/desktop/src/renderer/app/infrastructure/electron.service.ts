import { Injectable, NgZone } from '@angular/core';

declare global {
  interface Window {
    electronAPI: {
      openExternal: (url: string) => Promise<void>;
      ipc: {
        send: (channel: string, data?: any) => void;
        invoke: (channel: string, data?: any) => Promise<any>;
        on: (channel: string, callback: Function) => () => void;
      };
      getSettings: () => Promise<any>;
      setSettings: (settings: any) => Promise<void>;
      removeListener: (channel: string, callback: Function) => void;
    };
  }
}

@Injectable()
export class ElectronService {
  private initialized = false;
  ipcRenderer: any = null;
  
  constructor(private zone: NgZone) {
    if (window.electronAPI) {
      this.initialized = true;
      // 创建兼容的 ipcRenderer 接口
      this.ipcRenderer = {
        send: (channel: string, data?: any) => {
          window.electronAPI.ipc.send(channel, data);
        },
        on: (event: string, handler: Function) => {
          const cleanup = window.electronAPI.ipc.on(event, handler);
          return cleanup;
        },
        invoke: (channel: string, data?: any) => {
          return window.electronAPI.ipc.invoke(channel, data);
        }
      };
    } else {
      console.warn('ElectronAPI not available - running in browser mode');
    }
  }

  // safe subscribe method for angular change detection
  onCD(event: string, handler: Function) {
    if (this.available) {
      this.ipcRenderer.on(event, (ev, arg) => {
        this.zone.run(() => {
          handler(ev, arg);
        });
      });
    }
  }
  on(event: string, handler: Function) {
    if (this.available) {
      this.ipcRenderer.on(event, (ev, arg) => {
        handler(ev, arg);
      });
    }
  }

  openUrlExternal(url: string) {
    if (this.available && window.electronAPI) {
      // 直接使用preload中的shell.openExternal
      window.electronAPI.openExternal(url);
    }
  }

  get available(): boolean {
    return this.initialized;
  }
}
