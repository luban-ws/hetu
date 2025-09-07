import { Component, OnInit, Input, HostBinding } from "@angular/core";
import { RepoService } from "../services/repo.service";
import { HistoryService } from "../services/history.service";
import { LayoutService } from "../services/layout.service";
import { throttle } from "radash";

@Component({
  standalone: false,
  selector: "app-open-repo-panel",
  templateUrl: "./open-repo-panel.component.html",
  styleUrls: ["./open-repo-panel.component.scss"],
})
export class OpenRepoPanelComponent implements OnInit {
  @Input() toggled = false;
  public history = [];
  public tooltip = true;

  // Throttled UI event handlers
  private throttledOpenBrowse = throttle({ interval: 1000 }, () => {
    this.repoService.openBrowse();
  });

  private throttledInitRepo = throttle({ interval: 1000 }, () => {
    this.repoService.browseInitFolder();
  });

  constructor(
    private repoService: RepoService,
    private repoHistory: HistoryService,
    private layout: LayoutService
  ) {
    this.repoHistory.historyChange.subscribe((repos) => {
      this.history = repos;
    });
    this.layout.tooltipChanged.subscribe((tp) => {
      this.tooltip = tp;
    });
    this.history = this.repoHistory.repos;
    this.tooltip = this.layout.tooltipEnabled;
  }

  ngOnInit() {}

  openBrowseDialog() {
    this.throttledOpenBrowse();
  }
  
  openRepo(workingDir) {
    this.repoService.openRepo(workingDir);
  }
  
  removeRepoSetting(workingDir, $event) {
    this.repoService.removeRepoSetting(workingDir);
    $event.stopPropagation();
  }
  
  initRepo() {
    this.throttledInitRepo();
  }
}
