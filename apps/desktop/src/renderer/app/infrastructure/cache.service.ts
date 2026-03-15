import { Injectable, Inject, NgZone } from '@angular/core';
import { DESKTOP_ADAPTER, DesktopAdapter } from './desktop-adapter';
import { StatusBarService } from './status-bar.service';
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class CacheService {

  constructor(
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private zone: NgZone,
    private statusBar: StatusBarService
  ) {
    this.adapter.on(IPC_EVENTS.CACHE.AUTO_CLEAN_BEGIN, (event: any, arg: any) => {
      this.zone.run(() => {
        this.statusBar.enableLoading('Starting auto cache cleanup');
      });
    });
    this.adapter.on(IPC_EVENTS.CACHE.AUTO_CLEAN_SUCCESS, (event: any, arg: any) => {
      this.zone.run(() => {
        this.statusBar.flash('success', "Auto cache cleanup successful");
      });
    });
  }
  init() {
  }

}
