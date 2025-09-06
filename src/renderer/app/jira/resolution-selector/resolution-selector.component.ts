import { Component, OnInit, EventEmitter } from "@angular/core";
import { Prompt } from "../../infrastructure/prompt";
import { JiraIntegrationService } from "../services/jira-integration.service";
import { Resolution } from "../models/resolution";

@Component({
  standalone: false,
  selector: "app-resolution-selector",
  templateUrl: "./resolution-selector.component.html",
  styleUrls: ["./resolution-selector.component.scss"],
})
export class ResolutionSelectorComponent implements OnInit, Prompt {
  toClose = new EventEmitter();
  toEnter = new EventEmitter<string>();
  key = "";
  required = false;
  public _resolution;
  public resolutions: Resolution[] = [];
  constructor(private jira: JiraIntegrationService) {
    this.resolutions = this.jira.resolutions;
  }

  ngOnInit() {}

  enter() {
    this.toEnter.emit(this._resolution);
    this.toClose.emit();
  }
  continue() {
    this.toEnter.emit("");
    this.toClose.emit();
  }
  close() {
    this.toClose.emit();
  }
}
