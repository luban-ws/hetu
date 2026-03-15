import { Component, OnInit, Inject } from '@angular/core';
import { SettingsComponent } from '../prototypes/settings-component';
import { SettingsService } from '../services/settings.service';
import { DesktopAdapter, DESKTOP_ADAPTER } from '../../infrastructure/desktop-adapter';

@Component({
  standalone: false,
  selector: 'app-ci-settings',
  templateUrl: './ci-settings.component.html',
  styleUrls: ['./ci-settings.component.scss']
})
export class CiSettingsComponent extends SettingsComponent {

  private appveyor = false;
  private appveyorToken = "";
  private appveyorAccount = "";
  private appveyorProject = "";

  constructor(settings: SettingsService, @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter) {
    super(settings);
  }
  async getSettings() {
    this.appveyor = this.settings.getRepoSetting('ci-appveyor');
    this.appveyorToken = await this.settings.getSecureRepoSetting('ci-appveyor-token');
    this.appveyorAccount = this.settings.getRepoSetting('ci-appveyor-account');
    this.appveyorProject = this.settings.getRepoSetting('ci-appveyor-project');
  }

  updateAppveyor(newValue: boolean) {
    this.appveyor = newValue;
    this.settings.setRepoSetting('ci-appveyor', this.appveyor);
  }

  updateAppveyorDetails() {
    this.settings.setRepoSetting('ci-appveyor-account', this.appveyorAccount);
    this.settings.setRepoSetting('ci-appveyor-project', this.appveyorProject);
  }
  updateAppveyorToken() {
    this.settings.setSecureRepoSetting('ci-appveyor-token', this.appveyorToken);
  }
  /** @description Open the Appveyor API token help page */
  openHelp() {
    this.adapter.openExternal('https://ci.appveyor.com/api-token');
  }
}
