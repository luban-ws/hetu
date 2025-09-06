import { Injectable, EventEmitter, Output } from "@angular/core";
import { HotkeysService } from "@ngneat/hotkeys";
import { ElectronService } from "../../infrastructure/electron.service";

@Injectable()
export class LayoutService {
  isLocalShown = true;
  isRemoteShown = true;
  isTagsShown = true;
  isDetailPanelOpen = false;
  isSubmoduleShown = true;

  set tooltipEnabled(tp) {
    this._tooltip = tp;
    this.tooltipChanged.emit(tp);
  }
  get tooltipEnabled() {
    return this._tooltip;
  }

  set isNavToggled(val) {
    if (this._nav !== val) {
      this.navPanelChanged.emit(val);
    }
    this._nav = val;
  }
  get isNavToggled() {
    return this._nav;
  }
  set isFilePanelOpen(val) {
    if (this._file !== val) {
      this.filePanelChanged.emit(val);
    }
    this._file = val;
  }
  get isFilePanelOpen() {
    return this._file;
  }

  @Output() filePanelChanged = new EventEmitter<boolean>();
  @Output() navPanelChanged = new EventEmitter<boolean>();
  @Output() tooltipChanged = new EventEmitter<boolean>();

  private _file = false;
  private _nav = true;
  private _tooltip = true;

  constructor(
    private hotkeys: HotkeysService,
    private electron: ElectronService
  ) {
    this.hotkeys.addShortcut({
      keys: "shift.arrowleft",
      description: "Minimize left panel",
      callback: (event: KeyboardEvent) => {
        this.isNavToggled = false;
        event.preventDefault();
      },
    });
    this.hotkeys.addShortcut({
      keys: "shift.arrowright",
      description: "Expand left panel",
      callback: (event: KeyboardEvent) => {
        this.isNavToggled = true;
        event.preventDefault();
      },
    });
    this.electron.onCD("Settings-EffectiveUpdated", (event, arg) => {
      this.tooltipEnabled =
        arg["gen-tooltip"] === "" ? true : Boolean(arg["gen-tooltip"]);
    });
  }
}
