import { Injectable, EventEmitter, Inject, NgZone } from '@angular/core';
import { DESKTOP_ADAPTER, DesktopAdapter } from './desktop-adapter';
import { ToastrService } from 'ngx-toastr';
import { StatusBarService } from './status-bar.service';
import { IPC_EVENTS  } from '@common/ipc-events';

@Injectable()
export class UpdaterService {

  isUpdateAvailable = false;
  updateVersion = "";
  updateChecking: EventEmitter<boolean> = new EventEmitter<boolean>();
  updateAvailableChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private zone: NgZone,
    private toastr: ToastrService,
    private status: StatusBarService,
  ) {
    this.adapter.on('Updater', (event: any, arg: any) => {
      this.zone.run(() => {
        if (arg.msg === 'update-available') {
          this.toastr.info("Click here to install update, the app will restart automatically to update", "Update Available").onTap.subscribe(() => {
            this.adapter.send('Updater', 'commence-download');
          });
          this.isUpdateAvailable = true;
          this.updateVersion = arg.version;
          this.updateAvailableChange.emit(this.isUpdateAvailable);
        } else if (arg.msg === 'update-not-available') {
          this.isUpdateAvailable = false;
          this.updateAvailableChange.emit(this.isUpdateAvailable);
        } else if (arg.msg === 'downloading-update') {
          this.status.enableLoading(`Downloading: ${Math.floor(arg.percentage)}%`);
        } else if (arg.msg === 'download-complete') {
          this.status.flash('success', "Update download successful, the app will restart soon...");
          setTimeout(() => {
            this.adapter.send('Updater', 'commence-install-update');
          }, 10 * 1000);
        }
      });
    });
    this.adapter.on(IPC_EVENTS.UPDATER.CHECKING, (event: any, arg: any) => {
      this.zone.run(() => {
        this.updateChecking.emit(arg.inProgress);
      });
    });
  }
  checkUpdate() {
    this.adapter.send(IPC_EVENTS.UPDATER.CHECK);
  }
  installUpdate() {
    this.toastr.info("Downloading update...", "Installing Update");
    this.adapter.send('Updater', 'commence-download');
  }
  init() {

  }
}
