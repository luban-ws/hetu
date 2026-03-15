import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { SettingsComponent } from '../prototypes/settings-component';

@Component({
  standalone: false,
  selector: 'app-auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrls: ['./auth-settings.component.scss']
})
export class AuthSettingsComponent extends SettingsComponent {

  private keyPath = "";
  private pubPath = "";
  constructor(
    settings: SettingsService
  ) {
    super(settings);
  }

  getSettings() {
    this.keyPath = this.settings.getAppSetting('auth-keypath');
    this.pubPath = this.settings.getAppSetting('auth-pubpath');
  }

  async browseKey() {
    this.keyPath = await this.settings.browseFile();
    this.settings.setSetting('auth-keypath', this.keyPath);
  }
  async browsePub() {
    this.pubPath = await this.settings.browseFile();
    this.settings.setSetting('auth-pubpath', this.pubPath);
  }

}
