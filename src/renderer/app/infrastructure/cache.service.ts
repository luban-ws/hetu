import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { StatusBarService } from './status-bar.service';
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class CacheService {

  constructor(
    private electron: ElectronService,
    private statusBar: StatusBarService
  ) {
    this.electron.onCD(IPC_EVENTS.CACHE.AUTO_CLEAN_BEGIN, (event, arg) => {
      this.statusBar.enableLoading('Starting auto cache cleanup');
    });
    this.electron.onCD(IPC_EVENTS.CACHE.AUTO_CLEAN_SUCCESS, (event, arg) => {
      this.statusBar.flash('success', "Auto cache cleanup successful");
    });
  }
  init() {
  }

}
