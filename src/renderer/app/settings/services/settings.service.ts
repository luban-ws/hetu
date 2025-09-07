import { Injectable, Output, EventEmitter } from "@angular/core";
import { ElectronService } from "../../infrastructure/electron.service";
import { ToastrService } from "ngx-toastr";
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class SettingsService {
  @Output() settingsUpdated = new EventEmitter<Settings>();
  settingsData = new Settings();
  constructor(
    private electron: ElectronService,
    private toastr: ToastrService
  ) {
    this.electron.onCD(IPC_EVENTS.SETTINGS.UPDATED, (event, arg) => {
      this.settingsData = arg.currentSettings;
      this.settingsUpdated.emit(this.settingsData);
    });
    this.electron.onCD(IPC_EVENTS.SECURE.CACHE_CLEARED, (event, arg) => {
      this.toastr.success(
        "All credentials cleared! You will be prompted to enter your credentials the next time you start the app.",
        "Credentials Cleared"
      );
    });
    this.electron.onCD(IPC_EVENTS.SECURE.CLEAR_CACHE_FAILED, (event, arg) => {
      this.toastr.error(
        "Uh oh, something went wrong. Please close this app and manually clear the credentials.",
        "Clear Credentials Failed"
      );
    });
  }

  init() {
    this.electron.ipcRenderer.send(IPC_EVENTS.SETTINGS.INIT, {});
  }
  setSetting(key, value) {
    if (this.settingsData.app_settings) {
      this.settingsData.app_settings[key] = value;
      this.electron.ipcRenderer.send(
        IPC_EVENTS.SETTINGS.SET,
        this.settingsData
      );
    }
  }
  setRepoSetting(key, value) {
    if (this.settingsData.repo_settings) {
      this.settingsData.repo_settings[key] = value;
      this.electron.ipcRenderer.send(
        IPC_EVENTS.SETTINGS.SET,
        this.settingsData
      );
    }
  }
  setSecureRepoSetting(key, value) {
    this.electron.ipcRenderer.send(IPC_EVENTS.SETTINGS.SET_SECURE_REPO, {
      key: key,
      value: value,
    });
  }
  browseFile(): string {
    return this.electron.ipcRenderer.sendSync(
      IPC_EVENTS.SETTINGS.BROWSE_FILE,
      {}
    );
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
  getSecureRepoSetting(key) {
    return this.electron.ipcRenderer.sendSync(
      IPC_EVENTS.SETTINGS.GET_SECURE_REPO,
      { key: key }
    );
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
    this.electron.ipcRenderer.send(IPC_EVENTS.SECURE.CLEAR_CACHE, {});
  }
}

class Settings {
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
