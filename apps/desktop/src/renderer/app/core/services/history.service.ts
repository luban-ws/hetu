import { Injectable, EventEmitter, Output, Inject, NgZone } from '@angular/core';
import { DESKTOP_ADAPTER, DesktopAdapter } from '../../infrastructure/desktop-adapter';
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class HistoryService {

  @Output() historyChange = new EventEmitter<any>();
  repos = [];
  constructor(
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private zone: NgZone
  ) {
    this.adapter.on(IPC_EVENTS.REPO.HISTORY_CHANGED, (event: any, arg: any) => {
      this.zone.run(() => {
        this.repos = arg.history;
        this.historyChange.emit(this.repos);
      });
    });
  }

}
