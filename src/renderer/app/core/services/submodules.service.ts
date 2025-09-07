import { Injectable, Output, EventEmitter } from '@angular/core';
import { ElectronService } from '../../infrastructure/electron.service';
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class SubmodulesService {

  @Output() submoduleChanged = new EventEmitter<any[]>();
  @Output() submoduleSelected = new EventEmitter<string>();
  @Output() submoduleDetailChanged = new EventEmitter<any>();
  submodules;
  selectedSubmodule = "";
  submoduleDetails;
  constructor(
    private electron: ElectronService
  ) {
    this.electron.onCD(IPC_EVENTS.REPO.SUBMODULE_NAMES_RETRIEVED, (event, arg) => {
      this.submodules = arg.submodules;
      this.submoduleChanged.emit(this.submodules);
    });
    this.electron.onCD(IPC_EVENTS.REPO.SUBMODULE_DETAILS_RETRIEVED, (event, arg) => {
      this.submoduleDetails = arg.result;
      this.submoduleDetailChanged.emit(this.submoduleDetails);
    });
  }

  selectSubmodule(name) {
    this.selectedSubmodule = name;
    this.submoduleSelected.emit(name);
  }

  getSubmoduleDetails(name) {
    this.electron.ipcRenderer.send(IPC_EVENTS.REPO.GET_SUBMODULE_DETAILS, {name: name});
  }
}
