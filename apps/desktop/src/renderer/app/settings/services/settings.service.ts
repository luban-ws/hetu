import { Injectable, Output, EventEmitter, Inject, NgZone } from "@angular/core";
import { DESKTOP_ADAPTER, DesktopAdapter } from '../../infrastructure/desktop-adapter';
import { ToastrService } from "ngx-toastr";
import { IPC_EVENTS } from '@infrastructure/ipc-events';

@Injectable()
export class SettingsService {
  @Output() settingsUpdated = new EventEmitter<Settings>();
  /** Emitted once at startup with the persisted currentRepo (if any). */
  @Output() initialCurrentRepo = new EventEmitter<{ workingDir: string; name: string; id: string }>();
  settingsData = new Settings();
  constructor(
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private zone: NgZone,
    private toastr: ToastrService
  ) {
    this.adapter.on(IPC_EVENTS.SETTINGS.UPDATED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.settingsData = arg.currentSettings;
        this.settingsUpdated.emit(this.settingsData);
      });
    });
    this.adapter.on(IPC_EVENTS.SECURE.CACHE_CLEARED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.toastr.success(
          "All credentials cleared! You will be prompted to enter your credentials the next time you start the app.",
          "Credentials Cleared"
        );
      });
    });
    this.adapter.on(IPC_EVENTS.SECURE.CLEAR_CACHE_FAILED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.toastr.error(
          "Uh oh, something went wrong. Please close this app and manually clear the credentials.",
          "Clear Credentials Failed"
        );
      });
    });
  }

  /**
   * Initialise settings from the backend.
   * Uses invoke() (request-response) instead of send() (fire-and-forget)
   * so the returned data can seed RepoService even if the emitted events
   * arrive before the listener is registered.
   */
  init() {
    this.adapter.invoke<any>(IPC_EVENTS.SETTINGS.INIT, {})
      .then((result) => {
        if (result?.currentRepo?.workingDir) {
          this.initialCurrentRepo.emit(result.currentRepo);
        }
      })
      .catch(() => {
        this.adapter.send(IPC_EVENTS.SETTINGS.INIT, {});
      });
  }
  setSetting(key, value) {
    if (this.settingsData.app_settings) {
      this.settingsData.app_settings[key] = value;
      this.adapter.send(IPC_EVENTS.SETTINGS.SET, this.settingsData);
    }
  }
  setRepoSetting(key, value) {
    if (this.settingsData.repo_settings) {
      this.settingsData.repo_settings[key] = value;
      this.adapter.send(IPC_EVENTS.SETTINGS.SET, this.settingsData);
    }
  }
  setSecureRepoSetting(key, value) {
    this.adapter.send(IPC_EVENTS.SETTINGS.SET_SECURE_REPO, {
      key: key,
      value: value,
    });
  }
  /** @returns Promise resolving to the selected file path */
  async browseFile(): Promise<string> {
    return this.adapter.invoke<string>(IPC_EVENTS.SETTINGS.BROWSE_FILE, {});
  }
  getRepoSetting(key) {
    if (
      !this.settingsData ||
      !this.settingsData.repo_settings ||
      this.settingsData.repo_settings[key] === undefined
    ) {
      return "";
    }
    return this.settingsData.repo_settings[key];
  }
  /** @returns Promise resolving to the secure repo setting value */
  async getSecureRepoSetting(key): Promise<string> {
    return this.adapter.invoke<string>(IPC_EVENTS.SETTINGS.GET_SECURE_REPO, { key: key });
  }
  getAppSetting(key) {
    if (
      !this.settingsData ||
      !this.settingsData.app_settings ||
      this.settingsData.app_settings[key] === undefined
    ) {
      return "";
    }
    return this.settingsData.app_settings[key];
  }
  clearSecureCache() {
    this.adapter.send(IPC_EVENTS.SECURE.CLEAR_CACHE, {});
  }
}

export class Settings {
  app_settings: Map<string, string>;
  repo_settings: Map<string, string>;
  current_repo: RepoInfo = {
    id: "",
    name: null,
  };
}

interface RepoInfo {
  id: string;
  name: string;
}
