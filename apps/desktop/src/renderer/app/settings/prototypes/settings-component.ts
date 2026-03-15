import { SettingsService } from "../services/settings.service";
import { OnInit, Directive } from "@angular/core";

@Directive()
export abstract class SettingsComponent implements OnInit {
  constructor(protected settings: SettingsService) {
    settings.settingsUpdated.subscribe((sett) => {
      this.getSettings();
    });
    this.settings = settings;
  }
  abstract getSettings();
  ngOnInit(): void {
    this.getSettings();
  }
}
