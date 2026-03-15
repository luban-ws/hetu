import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../services/settings.service';

@Component({
  standalone: false,
  selector: 'app-settings-nav',
  templateUrl: './settings-nav.component.html',
  styleUrls: ['./settings-nav.component.scss']
})
export class SettingsNavComponent implements OnInit {

  public repoName: string = null;
  constructor(
    public route: Router,
    private settings: SettingsService
  ) {
    settings.settingsUpdated.subscribe(val => {
      this.repoName = val.current_repo.name;
    });
    if (this.settings.settingsData.current_repo) {
      this.repoName = settings.settingsData.current_repo.name;
    }
  }

  ngOnInit() {
  }
  goToGitView() {
    this.route.navigateByUrl('/');
  }

}
