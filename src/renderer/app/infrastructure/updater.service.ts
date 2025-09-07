import { Injectable, EventEmitter } from '@angular/core';
import { ElectronService } from './electron.service';
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
    private electron: ElectronService,
    private toastr: ToastrService,
    private status: StatusBarService,
  ) {
    electron.onCD('Updater', (event, arg) => {
      if (arg.msg === 'update-available') {
        this.toastr.info("Click here to install update, the app will restart automatically to update", "Update Available").onTap.subscribe(() => {
          this.electron.ipcRenderer.send('Updater', 'commence-download');
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
        let that = this;
        setTimeout(() => {
          that.electron.ipcRenderer.send('Updater', 'commence-install-update');
        }, 10 * 1000);
      }
    });
    electron.onCD(IPC_EVENTS.UPDATER.CHECKING, (event, arg) => {
      this.updateChecking.emit(arg.inProgress);
    });
  }
  checkUpdate() {
    this.electron.ipcRenderer.send(IPC_EVENTS.UPDATER.CHECK);
  }
  installUpdate() {
    this.toastr.info("Downloading update...", "Installing Update");
    this.electron.ipcRenderer.send('Updater', 'commence-download');
  }
  init() {

  }
}
