import { Component, OnInit, EventEmitter } from "@angular/core";
import { Prompt } from "../../infrastructure/prompt";

@Component({
  standalone: false,
  selector: "app-subtask-prompt",
  templateUrl: "./subtask-prompt.component.html",
  styleUrls: ["./subtask-prompt.component.scss"],
})
export class SubtaskPromptComponent implements OnInit, Prompt {
  toClose = new EventEmitter();
  toEnter = new EventEmitter<string>();
  toCancel = new EventEmitter();
  key = "";
  public name = "";
  constructor() {}

  ngOnInit() {}

  enter() {
    this.toEnter.emit(this.name);
    this.toClose.emit();
  }

  close() {
    this.toCancel.emit();
    this.toClose.emit();
  }
}
