import { Injectable, EventEmitter, Output, Inject, NgZone } from "@angular/core";
import { HotkeysService } from "@ngneat/hotkeys";
import { DESKTOP_ADAPTER, DesktopAdapter } from '../../infrastructure/desktop-adapter';
import { IPC_EVENTS  } from '@common/ipc-events';

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
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private zone: NgZone
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
    this.adapter.on(IPC_EVENTS.SETTINGS.EFFECTIVE_UPDATED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.tooltipEnabled =
          arg && arg["gen-tooltip"] === ""
            ? true
            : Boolean(arg && arg["gen-tooltip"]);
      });
    });
  }
}
