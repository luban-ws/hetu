import { Injectable, Output, EventEmitter } from "@angular/core";
import { ElectronService } from "../../infrastructure/electron.service";
import { ToastrService } from "ngx-toastr";
import { LoadingService } from "../../infrastructure/loading-service.service";
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class AppveyorCiService {
  @Output() buildsUpdated = new EventEmitter<any>();
  @Output() enabledChanged = new EventEmitter<boolean>();
  @Output() logRetrieved = new EventEmitter<{
    build: string;
    output: string;
  }>();

  buildResults;
  enabled;
  private repoID = "";
  private account = "";
  private project = "";
  constructor(
    private electron: ElectronService,
    private toastr: ToastrService,
    private loading: LoadingService
  ) {
    electron.onCD(IPC_EVENTS.SETTINGS.EFFECTIVE_UPDATED, (event, arg) => {
      this.buildResults = null;
      if (!arg || !arg["ci-appveyor"]) {
        this.enabled = false;
        this.account = "";
        this.project = "";
      } else {
        this.buildResults = {};
        this.project = arg["ci-appveyor-project"] || "";
        this.account = arg["ci-appveyor-account"] || "";
        this.enabled = true;
      }
      this.enabledChanged.emit(this.enabled);
      if (arg && arg.currentRepo && arg.currentRepo.id) {
        this.repoID = arg.currentRepo.id;
      }
    });
    electron.onCD(IPC_EVENTS.CI.BUILDS_RETRIEVED, (event, arg) => {
      if (this.enabled) {
        let updated = {};
        arg.data.forEach((b) => {
          if (
            this.buildResults[b.commit] &&
            this.buildResults[b.commit].status !== b.status
          ) {
            this.buildResults[b.commit] = b;
            updated[b.commit] = this.buildResults[b.commit];
          } else if (
            !this.buildResults[b.commit] &&
            arg.service === "AppVeyor"
          ) {
            this.buildResults[b.commit] = b;
            updated[b.commit] = this.buildResults[b.commit];
          }
        });
        this.buildsUpdated.emit(updated);
      }
    });
    electron.onCD(IPC_EVENTS.CI.APPVEYOR.LOG_NOT_FOUND, (event, arg) => {
      this.logRetrieved.emit({ build: arg.version, output: "No output" });
    });
    electron.onCD(IPC_EVENTS.CI.APPVEYOR.LOG_RETRIEVED, (event, arg) => {
      this.logRetrieved.emit({ build: arg.version, output: arg.result });
    });
    electron.onCD(IPC_EVENTS.CI.APPVEYOR.REBUILDED, (event, arg) => {
      this.toastr.success("Rebuild Scheduled ...");
      this.loading.disableLoading();
    });
    electron.onCD(IPC_EVENTS.CI.APPVEYOR.REBUILD_FAILED, (event, arg) => {
      this.toastr.error("Rebuild Failed. Please try again later");
      this.loading.disableLoading();
    });
  }

  init() {}

  openAppveyor(commit) {
    if (
      this.buildResults &&
      this.buildResults[commit] &&
      this.account &&
      this.project
    ) {
      let url = `https://ci.appveyor.com/project/${this.account}/${this.project}/build/${this.buildResults[commit].version}`;
      this.electron.ipcRenderer.send(IPC_EVENTS.SHELL.OPEN, { url: url });
    }
  }

  getBuildLog(commit) {
    if (
      this.buildResults &&
      this.buildResults[commit] &&
      this.account &&
      this.project
    ) {
      this.electron.ipcRenderer.send(IPC_EVENTS.CI.APPVEYOR.GET_LOG, {
        version: this.buildResults[commit].version,
      });
    }
  }

  rebuildAppveyor(commit) {
    this.loading.enableLoading("Rebuilding ...");
    this.electron.ipcRenderer.send(IPC_EVENTS.CI.APPVEYOR.REBUILD, {
      branch: this.buildResults[commit].branch,
      commit: commit,
    });
  }
}
