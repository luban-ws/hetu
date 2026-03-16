import { Injectable, Output, EventEmitter, Inject, NgZone } from "@angular/core";
import { DESKTOP_ADAPTER, DesktopAdapter } from "../../infrastructure/desktop-adapter";
import { IPC_EVENTS } from '@infrastructure/ipc-events';

@Injectable()
export class SubmodulesService {
  @Output() submoduleChanged = new EventEmitter<any[]>();
  @Output() submoduleSelected = new EventEmitter<string>();
  @Output() submoduleDetailChanged = new EventEmitter<any>();
  submodules: any[] | undefined;
  submoduleDetails: any;
  selectedSubmodule: any;
  constructor(
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private zone: NgZone
  ) {
    this.adapter.on(
      IPC_EVENTS.REPO.SUBMODULE_NAMES_RETRIEVED,
      (event: any, arg: any) => {
        this.zone.run(() => {
          this.submodules = arg.submodules;
          this.submoduleChanged.emit(this.submodules);
        });
      }
    );
    this.adapter.on(
      IPC_EVENTS.REPO.SUBMODULE_DETAILS_RETRIEVED,
      (event: any, arg: any) => {
        this.zone.run(() => {
          this.submoduleDetails = arg.result;
          this.submoduleDetailChanged.emit(this.submoduleDetails);
        });
      }
    );
  }

  /** Select a submodule by name and emit the selection event */
  selectSubmodule(name: any) {
    this.selectedSubmodule = name;
    this.submoduleSelected.emit(name);
  }

  /** Request submodule details from the backend */
  getSubmoduleDetails(name: any) {
    this.adapter.send(IPC_EVENTS.REPO.GET_SUBMODULE_DETAILS, {
      name: name,
    });
  }
}
