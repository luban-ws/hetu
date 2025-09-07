import { Injectable, EventEmitter, Output } from '@angular/core';
import { ElectronService } from '../../infrastructure/electron.service';
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class HistoryService {

  @Output() historyChange = new EventEmitter<any>();
  repos = [];
  constructor(
    private electron: ElectronService
  ) {
    electron.onCD(IPC_EVENTS.REPO.HISTORY_CHANGED, (event, arg) => {
      this.repos = arg.history;
      this.historyChange.emit(this.repos);
    });
  }

}
